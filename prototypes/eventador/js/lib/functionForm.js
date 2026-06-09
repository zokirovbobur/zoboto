/* ======================= src/lib/functionForm.js ======================= */
/* Shared constants + helpers used by both FunctionCreateModal and FunctionEditModal.
   Keeping these in one place ensures the two modals stay aligned — same KEDA
   presets, same trigger catalogue, same threshold semantics, same summary phrasing. */

/* ─── Validation regexes ─────────────────────────────────────────────── */
const NAME_RE  = /^[a-z][a-z0-9-]{0,29}$/;
const IMAGE_RE = /^[a-z0-9.\-_/]+(@sha256:[a-f0-9]+|:[\w.\-]+)?$/;
const KEY_RE   = /^[A-Z][A-Z0-9_]*$/;

/* ─── Runtime tier → FDK options (ADR-0015) ──────────────────────────── */
const TIER_FDK = {
  Docker:      ['fdk-go', 'fdk-py', 'fdk-node', 'fdk-java'],
  Firecracker: ['fdk-go', 'fdk-py', 'fdk-node'],
  WASM:        ['wasm-native'],
};

/* ─── KEDA triggers + threshold semantics (keda-autoscaling-spec §3.1) ─ */
const TRIGGERS = [
  { value: 'prometheus · concurrency', label: 'prometheus — concurrency saturation', kind: 'prometheus', usage: 'http' },
  { value: 'prometheus · pending',     label: 'prometheus — pending invocations',    kind: 'prometheus', usage: 'any' },
  { value: 'prometheus · rps',         label: 'prometheus — requests / second',       kind: 'prometheus', usage: 'http' },
  { value: 'kafka · lag',              label: 'kafka — broker lag',                   kind: 'kafka',      usage: 'kafka' },
  { value: 'cpu',                      label: 'cpu utilization',                       kind: 'cpu',        usage: 'any' },
  { value: 'memory',                   label: 'memory utilization',                    kind: 'memory',     usage: 'any' },
  { value: 'cron',                     label: 'cron — scheduled scale-up',             kind: 'cron',       usage: 'any' },
];

const THRESHOLD_META = {
  'prometheus · concurrency': { placeholder: '0.7', help: '0.0–1.0 — 0.7 = scale when warm pool >70% busy',  min: 0,  max: 1 },
  'prometheus · pending':     { placeholder: '20',  help: 'integer — queued invocations before scale-up',     min: 1,  max: 100000 },
  'prometheus · rps':         { placeholder: '200', help: 'integer — requests per second per replica',         min: 1,  max: 100000 },
  'kafka · lag':              { placeholder: '100', help: 'integer — unread messages on the topic',            min: 1,  max: 1000000 },
  cpu:                        { placeholder: '70',  help: '1–100 — % CPU utilization across replicas',         min: 1,  max: 100 },
  memory:                     { placeholder: '80',  help: '1–100 — % memory utilization across replicas',      min: 1,  max: 100 },
  cron:                       { placeholder: '1',   help: 'desired replicas during the window',                min: 1,  max: 1000 },
};

/* ─── 3 presets — one click sets every scaling field at once ─────────── */
const PRESETS = {
  always: {
    label: '🟢 Always-on (web)',
    sub:   'min=1, no scale-to-zero. For HTTP/sync flows.',
    set:   { min: 1, max: 10, cooldown: 120, polling: 5, trigger: 'prometheus · concurrency', threshold: '0.7', activation: 5,  upPct: 200, upPer: 15, dnPct: 25, dnPer: 60 },
  },
  zero: {
    label: '🔵 Scale-to-zero (event)',
    sub:   'min=0, kafka lag trigger. For broker-backed workers.',
    set:   { min: 0, max: 20, cooldown: 300, polling: 5, trigger: 'kafka · lag',              threshold: '100', activation: 5,  upPct: 200, upPer: 15, dnPct: 25, dnPer: 60 },
  },
  bursty: {
    label: '🟠 High-throughput (worker)',
    sub:   'min=2, rps trigger. For parallel batch / fan-out.',
    set:   { min: 2, max: 50, cooldown: 90,  polling: 5, trigger: 'prometheus · rps',         threshold: '200', activation: 10, upPct: 300, upPer: 15, dnPct: 25, dnPer: 60 },
  },
};

/* ─── Trigger preset → real KEDA trigger object (used at submit) ─────── */
function compileTrigger(presetValue, threshold, fnPath) {
  const t = TRIGGERS.find((x) => x.value === presetValue);
  if (!t) return null;
  if (t.kind === 'kafka')  return { type: 'kafka',      name: 'broker-lag',           topic: 'fn.' + fnPath, lagThreshold: String(threshold) };
  if (t.kind === 'cpu')    return { type: 'cpu',        name: 'cpu-utilization',      value: String(threshold) };
  if (t.kind === 'memory') return { type: 'memory',     name: 'memory-utilization',   value: String(threshold) };
  if (t.kind === 'cron')   return { type: 'cron',       name: 'business-hours',       desiredReplicas: String(threshold) };
  if (presetValue === 'prometheus · concurrency') return { type: 'prometheus', name: 'concurrency-saturation', query: 'avg(runner_concurrency_used / runner_concurrency_max)', threshold: String(threshold) };
  if (presetValue === 'prometheus · pending')     return { type: 'prometheus', name: 'pending-invocations',     query: 'sum(flow_pending_invocations{fn="' + fnPath + '"})', threshold: String(threshold) };
  if (presetValue === 'prometheus · rps')         return { type: 'prometheus', name: 'rps',                     query: 'rate(http_requests_total{fn="' + fnPath + '"}[1m])', threshold: String(threshold) };
  return null;
}

/* ─── Existing function scaling → drawer-friendly flat shape ─────────── */
function readScalingFromFn(scaling) {
  const s = scaling || {};
  const t = (s.triggers && s.triggers[0]) || null;
  let triggerValue = 'prometheus · concurrency';
  let threshold = '0.7';
  if (t) {
    if (t.type === 'kafka')        { triggerValue = 'kafka · lag'; threshold = t.lagThreshold || '100'; }
    else if (t.type === 'cpu')     { triggerValue = 'cpu';         threshold = t.value || '70'; }
    else if (t.type === 'memory')  { triggerValue = 'memory';      threshold = t.value || '80'; }
    else if (t.type === 'cron')    { triggerValue = 'cron';        threshold = t.desiredReplicas || '1'; }
    else if (t.name === 'pending-invocations')    { triggerValue = 'prometheus · pending';     threshold = t.threshold || '20'; }
    else if (t.name === 'rps')                    { triggerValue = 'prometheus · rps';         threshold = t.threshold || '200'; }
    else                                          { triggerValue = 'prometheus · concurrency'; threshold = t.threshold || '0.7'; }
  }
  const sUp = (s.behavior && s.behavior.scaleUp)   || {};
  const sDn = (s.behavior && s.behavior.scaleDown) || {};
  return {
    min:        s.minReplicaCount ?? 0,
    max:        s.maxReplicaCount ?? 8,
    cooldown:   s.cooldownPeriod ?? 120,
    polling:    s.pollingInterval ?? 5,
    activation: s.activationThreshold ?? 5,
    trigger:    triggerValue,
    threshold:  String(threshold),
    upPct:      sUp.percent ?? 200,
    upPer:      sUp.periodSeconds ?? 15,
    dnPct:      sDn.percent ?? 25,
    dnPer:      sDn.periodSeconds ?? 60,
  };
}

/* ─── Human-readable summary (live preview, replaces YAML in modals) ─── */
function buildSummary({ name, tier, fdk, memory, timeoutSec, image, scaling, flowName }) {
  const t = TRIGGERS.find((x) => x.value === scaling.trigger) || TRIGGERS[0];
  const triggerSentence = (() => {
    if (t.kind === 'kafka')  return `Kafka broker lag (scale up when >${scaling.threshold} messages queued)`;
    if (t.kind === 'cpu')    return `CPU utilization (scale up when >${scaling.threshold}% across replicas)`;
    if (t.kind === 'memory') return `memory utilization (scale up when >${scaling.threshold}% across replicas)`;
    if (t.kind === 'cron')   return `cron schedule (desired ${scaling.threshold} replicas during the window)`;
    if (scaling.trigger === 'prometheus · concurrency') return `warm-pool concurrency (scale up when >${Math.round(scaling.threshold * 100)}% busy)`;
    if (scaling.trigger === 'prometheus · pending')     return `pending invocations (scale up when >${scaling.threshold} queued)`;
    if (scaling.trigger === 'prometheus · rps')         return `requests per second (scale up when >${scaling.threshold} rps)`;
    return 'the configured trigger';
  })();
  const fnLabel = name ? `"${name}"` : 'this function';
  const flowLine = flowName === '—'
    ? 'It is standalone (no parent flow) and uses only its own Config / Secrets at runtime.'
    : `It is bound to flow "${flowName}" — env and secrets are auto-merged at deploy.`;
  const imageLine = image
    ? `Image: ${image}.`
    : 'Image is not set — function is in "pending build" until Build Service compiles it.';
  const activationLine = scaling.min === 0
    ? ` Activates at ${scaling.activation} (cold-start gate).`
    : '';
  const cooldownLine = `After ${scaling.cooldown}s idle → scale down to ${scaling.min}.`;
  return [
    `${fnLabel} will run on ${tier} with ${fdk}, ${memory} MB memory and ${timeoutSec}s timeout.`,
    imageLine,
    flowLine,
    `Scaling: ${scaling.min} → ${scaling.max} replicas based on ${triggerSentence}.${activationLine}`,
    cooldownLine,
  ].join('\n\n');
}

/* ─── Validation helper (shared between Create and Edit modals) ──────── */
function validateForm({ scaling, image, memory, timeoutSec, idleTimeoutSec, config, flowTriggerIsKafka }) {
  const errs = {};
  if (image && !IMAGE_RE.test(image)) errs.image = 'expected: repo/name@sha256:hex or repo/name:tag';
  if (!Number.isInteger(memory) || memory < 32 || memory > 8192) errs.memory = '32–8192 MB';
  if (!Number.isInteger(timeoutSec) || timeoutSec < 1 || timeoutSec > 300) errs.timeoutSec = '1–300s (Fn max=300)';
  if (!Number.isInteger(idleTimeoutSec) || idleTimeoutSec < 1 || idleTimeoutSec > 3600) errs.idleTimeoutSec = '1–3600s';
  if (!Number.isInteger(scaling.min) || scaling.min < 0 || scaling.min > 100) errs.min = '0–100';
  if (!Number.isInteger(scaling.max) || scaling.max < 1 || scaling.max > 1000) errs.max = '1–1000';
  if (!errs.min && !errs.max && scaling.min > scaling.max) errs.max = 'must be ≥ min';
  const tMeta = THRESHOLD_META[scaling.trigger];
  if (tMeta) {
    const tn = Number(scaling.threshold);
    if (scaling.threshold === '' || Number.isNaN(tn)) errs.threshold = 'required';
    else if (tMeta.min != null && tn < tMeta.min) errs.threshold = 'min ' + tMeta.min;
    else if (tMeta.max != null && tn > tMeta.max) errs.threshold = 'max ' + tMeta.max;
  }
  if (scaling.min === 0 && (scaling.activation === '' || Number(scaling.activation) < 1)) errs.activation = 'min=0 requires activation ≥ 1';
  const triggerInfo = TRIGGERS.find((t) => t.value === scaling.trigger);
  if (triggerInfo && triggerInfo.kind === 'kafka' && !flowTriggerIsKafka) errs.trigger = 'kafka trigger requires a Flow whose trigger is Kafka';
  if (Array.isArray(config)) {
    config.forEach((row) => { if (row.k && !KEY_RE.test(row.k)) errs.config = 'one or more keys are not UPPER_SNAKE_CASE'; });
  }
  return errs;
}

/* ─── Soft warnings (do not block save) ──────────────────────────────── */
function softWarnings({ scaling }) {
  const warns = [];
  const triggerInfo = TRIGGERS.find((t) => t.value === scaling.trigger);
  if (scaling.min === 0 && triggerInfo && triggerInfo.usage === 'http') warns.push('Min=0 + HTTP trigger means cold-start latency on first request.');
  if (scaling.max > 100) warns.push('Max replicas above 100 may exceed your tenant quota.');
  return warns;
}

/* ─── Compose the scaling payload sent to the store ──────────────────── */
function buildScalingPayload(scaling, fnPath) {
  const trigger = compileTrigger(scaling.trigger, scaling.threshold, fnPath);
  return {
    minReplicaCount: scaling.min,
    maxReplicaCount: scaling.max,
    cooldownPeriod: scaling.cooldown,
    pollingInterval: scaling.polling,
    activationThreshold: scaling.activation,
    triggers: trigger ? [trigger] : [],
    behavior: {
      scaleUp:   { stabilizationWindowSeconds: 0,   percent: scaling.upPct, periodSeconds: scaling.upPer },
      scaleDown: { stabilizationWindowSeconds: 120, percent: scaling.dnPct, periodSeconds: scaling.dnPer },
    },
  };
}


/* ======================= src/lib/protoParser.js ======================= */
