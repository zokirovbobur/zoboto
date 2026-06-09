/* ======================= src/lib/nodeSchema.js ======================= */
/* Strict per-node-kind configuration schema. The Designer's NodeConfigForm
   renders these declaratively so each kind gets a typed, validated form
   instead of one generic `body` textarea. PlanSpec is compiled from these
   typed fields at deploy time (ADR-0003/0004).

   Field shape:
     { key, label, type, required?, default?, options?, min?, max?,
       pattern?, errorMessage?, placeholder?, help?, section?, validate? }
   Types:  text | select | number | textarea | toggle | kvlist | stringlist
   `validate(value, all)` returns string|null (null = ok). */

/* shared helpers */
const DURATION_RE = /^\d+(ms|s|m|h|d)$/;
const CRON_RE = /^(\S+\s+){4,5}\S+$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;
const IDENT_RE = /^[A-Z][A-Z0-9_]*$/;
const PATH_RE = /^\/[^\s]*$/;
const HTTP_URL_RE = /^https?:\/\/[^\s]+$/;
const SVC_METHOD_RE = /^[\w.]+\/\w+$/;

/* Validator for JSON-shaped body fields. Returns null on success, error msg on failure.
   Empty string is treated as OK so users can clear and rewrite. Template strings with
   {{...}} placeholders are stripped before parsing. */
function validateJsonBody(v) {
  if (!v || !String(v).trim()) return null;
  const stripped = String(v).replace(/\{\{[^}]+\}\}/g, '"_tpl_"');
  try { JSON.parse(stripped); return null; }
  catch (e) { return 'invalid JSON: ' + (e.message || 'parse error').replace(/^JSON\.parse: /, ''); }
}

/* --- Reusable Execution section (every non-trigger inline node gets it) --- */
const EXECUTION_FIELDS = [
  { key: '_durable', label: 'Durable execution', type: 'select',
    section: 'Execution',
    options: [
      { value: 'opt-in', label: 'opt-in: WAL + outbox' },
      { value: 'off',    label: 'ephemeral (default)' },
    ],
    default: 'opt-in',
    help: 'opt-in: writes state to disk so the step survives restarts (slower but reliable). off: faster, but state is lost on crash.' },
  { key: '_adapter', label: 'Interface adapter', type: 'select',
    section: 'Execution',
    options: [
      { value: 'auto',     label: 'auto (from trigger)' },
      { value: 'HTTP REST', label: 'HTTP REST' },
      { value: 'gRPC',     label: 'gRPC' },
      { value: 'GraphQL',  label: 'GraphQL' },
      { value: 'Kafka',    label: 'Kafka' },
    ],
    default: 'auto',
    help: 'How this step is called over the wire. "auto" picks the protocol that matches your trigger.' },
];

/* --- Per-kind schemas --- */
const NODE_SCHEMA = {
  /* =========================  Triggers  ========================= */
  httptrigger: {
    doc: 'ADR-0021 · interface-adapter §3',
    description: 'Exposes the flow as a callable HTTP endpoint via the gateway.',
    autoTitle: (cfg) => `${cfg.method || 'POST'} ${cfg.path || '/'}`,
    fields: [
      { key: 'method', label: 'Method', type: 'select', required: true,
        section: 'Endpoint',
        options: ['GET','POST','PUT','PATCH','DELETE'], default: 'POST',
        help: 'The HTTP verb callers must use. POST is most common for actions; GET for reads.' },
      { key: 'path', label: 'Path', type: 'text', required: true,
        pattern: PATH_RE, errorMessage: 'must start with /',
        placeholder: '/checkout', default: '/checkout',
        help: 'Public URL path users will call. Must start with /. Example: /checkout or /api/orders.' },
      { key: 'auth', label: 'Authentication', type: 'select', required: true,
        section: 'Security',
        options: [
          { value: 'none',    label: 'public (no auth)' },
          { value: 'api-key', label: 'workspace API key' },
          { value: 'bearer',  label: 'bearer / OIDC token' },
          { value: 'mtls',    label: 'mTLS (SPIFFE)' },
        ],
        default: 'api-key',
        help: 'Who is allowed to call this endpoint. "API key" is the default for server-to-server; "Bearer" for user sessions.' },
      { key: 'cors', label: 'Enable CORS', type: 'toggle',
        section: 'Security',
        default: false,
        help: 'Turn on if a website (browser) will call this endpoint directly. Off for server-to-server.' },
      { key: 'corsOrigins', label: 'Allowed origins', type: 'stringlist',
        section: 'Security',
        placeholder: 'https://app.example.com or *',
        addLabel: 'Add origin',
        showIf: (cfg) => !!cfg.cors,
        help: 'Which websites can call this endpoint. Use * to allow any (only safe for public APIs).' },
      { key: 'corsMethods', label: 'Allowed methods', type: 'stringlist',
        section: 'Security',
        placeholder: 'GET, POST, …',
        addLabel: 'Add method',
        showIf: (cfg) => !!cfg.cors,
        help: 'Which HTTP verbs are allowed. Defaults to the method above.' },
      { key: 'corsHeaders', label: 'Allowed headers', type: 'stringlist',
        section: 'Security',
        placeholder: 'Authorization, Content-Type',
        addLabel: 'Add header',
        showIf: (cfg) => !!cfg.cors,
        help: 'Which custom request headers the browser is allowed to send.' },
      { key: 'bodySchema', label: 'Request body schema / example', type: 'textarea',
        section: 'Contract',
        placeholder: '{ "amount": 100, "currency": "USD" }',
        help: 'Example of what the request body should look like. Shown in docs and used as the default for manual test runs.' },
      { key: 'timeoutSec', label: 'Response timeout (s)', type: 'number',
        section: 'Limits',
        min: 1, max: 600, default: 30,
        help: 'Maximum time to wait for a response. If the flow takes longer, the caller gets a timeout error.' },
    ],
  },

  grpc: {
    doc: 'ADR-0009 · interface-adapter §5',
    description: 'Exposes the flow over gRPC. Pick a proto from the workspace registry — service, method, streaming mode and request/response shapes follow automatically.',
    autoTitle: (cfg) => (cfg.service && cfg.method) ? `${cfg.service}/${cfg.method}` : 'gRPC Trigger',
    fields: [
      /* Step 1: Pick the proto contract from the workspace registry. */
      { key: 'protoRef', label: 'Proto descriptor', type: 'select', required: true,
        section: 'Proto contract',
        options: (cfg, ctx) => (ctx && ctx.protos ? ctx.protos : []).map((p) => ({
          value: p.Ref,
          label: `${p.Name} @ ${p.Version} — ${p.services.length} service(s), ${p.services.reduce((n, s) => n + s.methods.length, 0)} method(s)`,
        })),
        /* Opens the inline proto editor modal — keeps users in the Designer
           instead of bouncing to a separate /protos page. */
        addAction: {
          label: '+ New proto',
          onClick: (ctx) => ctx && ctx.openProtoEditor && ctx.openProtoEditor(),
        },
        help: 'The .proto file (compiled descriptor) from your workspace registry.' },
      /* Step 2: Service is filtered by selected proto. */
      { key: 'service', label: 'Service', type: 'select', required: true,
        section: 'Proto contract',
        options: (cfg, ctx) => {
          const proto = (ctx && ctx.protos || []).find((p) => p.Ref === cfg.protoRef);
          return proto ? proto.services.map((s) => ({ value: s.name, label: s.name })) : [];
        },
        help: 'Service is defined in the proto. Pick one to expose via this trigger.' },
      /* Step 3: Method is filtered by selected service. */
      { key: 'method', label: 'Method', type: 'select', required: true,
        section: 'Proto contract',
        options: (cfg, ctx) => {
          const proto = (ctx && ctx.protos || []).find((p) => p.Ref === cfg.protoRef);
          const svc = proto && proto.services.find((s) => s.name === cfg.service);
          return svc ? svc.methods.map((m) => ({ value: m.name, label: m.name })) : [];
        },
        help: 'Method on the selected service.' },
      /* Streaming mode — defined in the proto, not user-pickable. */
      { key: 'streaming', label: 'Streaming mode', type: 'derived',
        section: 'Proto contract',
        derive: (cfg, ctx) => {
          const proto = (ctx && ctx.protos || []).find((p) => p.Ref === cfg.protoRef);
          const svc = proto && proto.services.find((s) => s.name === cfg.service);
          const m = svc && svc.methods.find((x) => x.name === cfg.method);
          return m ? m.streaming : '—';
        },
        help: 'Set by the proto definition. Cannot be changed here.' },
      /* Request / response shape — read-only JSON-like preview of the message. */
      { key: 'requestShape', label: 'Request shape', type: 'derived',
        section: 'Proto contract',
        derive: (cfg, ctx) => {
          const proto = (ctx && ctx.protos || []).find((p) => p.Ref === cfg.protoRef);
          const svc = proto && proto.services.find((s) => s.name === cfg.service);
          const m = svc && svc.methods.find((x) => x.name === cfg.method);
          if (!m || !proto) return '—';
          const msg = proto.messages[m.requestType];
          return msg ? `${m.requestType} ${JSON.stringify(msg, null, 2)}` : m.requestType;
        },
        json: true,
        help: 'Protobuf message your flow will receive on each call.' },
      { key: 'responseShape', label: 'Response shape', type: 'derived',
        section: 'Proto contract',
        derive: (cfg, ctx) => {
          const proto = (ctx && ctx.protos || []).find((p) => p.Ref === cfg.protoRef);
          const svc = proto && proto.services.find((s) => s.name === cfg.service);
          const m = svc && svc.methods.find((x) => x.name === cfg.method);
          if (!m || !proto) return '—';
          const msg = proto.messages[m.responseType];
          return msg ? `${m.responseType} ${JSON.stringify(msg, null, 2)}` : m.responseType;
        },
        json: true,
        help: 'Protobuf message your flow must return.' },
      /* Auth strategy stays user-configurable. */
      { key: 'auth', label: 'Authentication', type: 'select', required: true,
        section: 'Security',
        options: [
          { value: 'mtls', label: 'mTLS (SPIFFE)' },
          { value: 'jwt',  label: 'JWT bearer' },
          { value: 'none', label: 'public (no auth)' },
        ],
        default: 'mtls',
        help: 'How the gateway verifies callers. mTLS for service-to-service; JWT for user identity.' },
    ],
  },

  kafkatrig: {
    doc: 'ADR-0006 · keda §3',
    description: 'Consumes a Kafka topic. KEDA scales replicas to consumer lag.',
    autoTitle: (cfg) => `consume ${cfg.topic || 'topic'}`,
    fields: [
      { key: 'topic', label: 'Topic', type: 'text', required: true,
        section: 'Source',
        suggestions: (cfg, ctx) => (ctx && ctx.kafkaTopics) || [],
        placeholder: 'orders.created', default: 'orders.created',
        help: 'Kafka topic to consume. Suggestions come from other flows in this workspace.' },
      { key: 'consumerGroup', label: 'Consumer group', type: 'text', required: true,
        section: 'Source',
        placeholder: 'flow-<workspace>-<flow>', default: 'flow-default',
        help: 'Must be unique per flow — offsets are tracked under this name. Auto-set when you add the step.' },
      { key: 'offsetReset', label: 'Offset reset', type: 'select', required: true,
        section: 'Delivery',
        options: [
          { value: 'latest',   label: 'latest (skip backlog on first start)' },
          { value: 'earliest', label: 'earliest (replay all available messages)' },
        ],
        default: 'latest',
        help: 'Where to start reading when this consumer has no committed offset yet.' },
      { key: 'autoCommit', label: 'Auto-commit offsets', type: 'toggle',
        section: 'Delivery',
        default: true,
        help: 'On: engine commits offsets automatically after each batch — at-least-once delivery. Off: your flow must commit manually — used for exactly-once handling.' },
      { key: 'maxBatch', label: 'Max messages per batch', type: 'number',
        section: 'Limits',
        min: 1, max: 10000, default: 100,
        help: 'Most messages pulled in one poll. Higher = better throughput, more memory per replica.' },
      { key: 'kedaPreview', label: 'Scaling behavior', type: 'derived',
        section: 'Limits',
        derive: () => 'Will scale 0 → N replicas as consumer lag grows.\nKEDA polls the broker for lag every few seconds (keda-autoscaling-spec §3.1).',
        json: true,
        help: 'How replicas of this consumer are added and removed under load.' },
    ],
  },

  webhook: {
    doc: 'ADR-0021 · interface-adapter §3',
    description: 'Accepts inbound webhooks; signature-verified and idempotent.',
    autoTitle: (cfg) => `${cfg.mode === 'sse' ? 'SSE' : 'webhook'} ${cfg.path || '/'}`,
    fields: [
      { key: 'method', label: 'Method', type: 'select', required: true,
        section: 'Endpoint',
        options: ['POST','PUT'], default: 'POST',
        help: 'HTTP method the provider will call. Most webhook providers (Stripe, GitHub, etc.) POST; PUT is rare.' },
      { key: 'path', label: 'Path', type: 'text', required: true,
        pattern: PATH_RE, errorMessage: 'must start with /',
        section: 'Endpoint',
        placeholder: '/webhooks/stripe', default: '/webhooks/incoming',
        help: 'Public path exposed on the gateway. Must start with "/". Use a distinctive prefix per provider so logs are easy to filter.' },
      { key: 'mode', label: 'Mode', type: 'select',
        section: 'Delivery',
        options: ['webhook','sse'], default: 'webhook',
        help: 'sse keeps the connection open and streams events. webhook is one-shot per call.' },
      { key: 'signatureHeader', label: 'Signature header', type: 'text',
        section: 'Security',
        placeholder: 'Stripe-Signature', default: 'X-Hub-Signature-256',
        showIf: (cfg) => cfg.mode !== 'sse',
        help: 'Header that carries the HMAC signature. Leave empty to skip signature verification.' },
      { key: 'signingSecretName', label: 'Signing secret', type: 'select',
        section: 'Security',
        options: (cfg, ctx) => {
          const list = (ctx && ctx.flowSecrets) || [];
          return [{ value: '', label: '— none (no verification) —' },
            ...list.map((s) => ({ value: s.Name, label: s.Name }))];
        },
        showIf: (cfg) => cfg.mode !== 'sse' && !!cfg.signatureHeader,
        help: 'Pick a Flow secret used to verify the signature header. Manage in the Flow env & secrets drawer.' },
      { key: 'idempotencyHeader', label: 'Idempotency-key header', type: 'text',
        section: 'Delivery',
        default: 'Idempotency-Key',
        showIf: (cfg) => cfg.mode !== 'sse',
        help: 'Header used to deduplicate retries within a short window.' },
      { key: 'bodySchema', label: 'Request body schema / example', type: 'textarea',
        section: 'Contract',
        placeholder: '{ "event": "payment.succeeded", "id": "evt_123" }',
        showIf: (cfg) => cfg.mode !== 'sse',
        help: 'Example payload that this webhook expects. Shown in docs and used as the default for manual test runs.' },
      { key: 'sseInfo', label: 'SSE behaviour', type: 'derived',
        section: 'Delivery',
        showIf: (cfg) => cfg.mode === 'sse',
        derive: () => 'In SSE mode the connection stays open and the flow streams events to the caller as Server-Sent Events. A 15s heartbeat (": keep-alive") prevents proxies from closing the stream.',
        help: 'How long-lived SSE connections behave on this endpoint.' },
    ],
  },

  cron: {
    doc: 'ADR-0017 · interface-adapter §3',
    description: 'Fires the flow on a cron timer. Leader-elected, exactly-once cluster-wide.',
    autoTitle: (cfg) => `cron ${cfg.cron || '* * * * *'}`,
    fields: [
      { key: 'cron', label: 'Cron expression', type: 'text', required: true,
        section: 'Schedule',
        pattern: CRON_RE, errorMessage: '5–6 space-separated cron tokens',
        placeholder: '0 2 * * *', default: '0 2 * * *',
        suggestions: () => [
          '0 * * * *',         /* every hour */
          '*/15 * * * *',      /* every 15m */
          '0 0 * * *',         /* daily 00:00 */
          '0 2 * * *',         /* daily 02:00 */
          '0 9 * * 1-5',       /* weekdays 09:00 */
          '0 0 * * 0',         /* weekly Sunday 00:00 */
          '0 0 1 * *',         /* monthly 1st 00:00 */
        ],
        help: 'Standard cron expression. Pick a common pattern from the list or write your own.' },
      { key: 'timezone', label: 'Timezone', type: 'select', required: true,
        section: 'Schedule',
        options: [
          'UTC',
          'Asia/Tashkent', 'Asia/Tokyo', 'Asia/Singapore', 'Asia/Dubai', 'Asia/Kolkata',
          'Europe/London', 'Europe/Berlin', 'Europe/Moscow',
          'America/New_York', 'America/Chicago', 'America/Los_Angeles',
          'Australia/Sydney',
        ],
        default: 'UTC',
        help: 'IANA timezone. Cron expression is evaluated in this zone.' },
      { key: 'nextFires', label: 'Next 3 fires (preview)', type: 'derived',
        section: 'Schedule',
        derive: (cfg) => {
          const expr = (cfg.cron || '').trim();
          const friendly = (() => {
            if (expr === '0 * * * *')      return 'top of every hour';
            if (expr === '*/15 * * * *')   return 'every 15 minutes';
            if (expr === '0 0 * * *')      return 'every day at 00:00';
            if (expr === '0 2 * * *')      return 'every day at 02:00';
            if (expr === '0 9 * * 1-5')    return 'Mon–Fri at 09:00';
            if (expr === '0 0 * * 0')      return 'every Sunday at 00:00';
            if (expr === '0 0 1 * *')      return '1st of every month at 00:00';
            return 'custom schedule';
          })();
          /* Mock: next 3 ISO timestamps. Real engine has a cron parser. */
          const now = new Date();
          const fires = [];
          for (let i = 1; i <= 3; i++) {
            const t = new Date(now.getTime() + i * 3600 * 1000);
            fires.push(t.toISOString().slice(0, 16).replace('T', ' '));
          }
          return `${friendly}\n\nUpcoming (${cfg.timezone || 'UTC'}):\n  • ${fires[0]}\n  • ${fires[1]}\n  • ${fires[2]}`;
        },
        json: true,
        help: 'Human-readable schedule + the next 3 firing times in your timezone.' },
      { key: 'catchUp', label: 'Catch up missed runs', type: 'toggle',
        section: 'Schedule',
        default: false,
        help: 'On startup, fire any runs missed during downtime (use carefully).' },
      { key: 'payload', label: 'Payload template (JSON)', type: 'textarea',
        section: 'Contract',
        placeholder: '{ "trigger": "cron" }', default: '{}',
        help: 'JSON object delivered to downstream steps as the trigger payload. Useful to pass a fixed parameter (e.g. {"job":"nightly-cleanup"}) so the same flow can be reused for multiple cron jobs.' },
    ],
  },

  manual: {
    doc: 'flow-engine §3 · ADR-0003',
    description: 'Manual trigger — fired only from the UI "Run" button or tests.',
    fields: [
      { key: 'info', label: 'How this trigger fires', type: 'derived',
        derive: () => 'This trigger fires only from:\n  • the "Run now" button on /flows or the Designer toolbar\n  • the CLI (`fn run …`)\n  • unit-test runners (CI)\n\nIt is not reachable from external HTTP / Kafka / cron.',
        json: true,
        help: 'Manual triggers are for testing and on-demand internal runs.' },
      { key: 'payload', label: 'Example payload (JSON)', type: 'textarea', required: true,
        placeholder: '{ "name": "eventador" }', default: '{ "name": "eventador" }',
        validate: validateJsonBody,
        help: 'Used as the default input for Run-now and unit tests.' },
      { key: 'allowOverride', label: 'Allow override at run time', type: 'toggle',
        default: true,
        help: 'When off, the Run-now dialog only shows the example as read-only.' },
    ],
  },

  /* =========================  HTTP  ========================= */
  httpreq: {
    doc: 'interface-adapter §3',
    description: 'Calls an external HTTP endpoint.',
    fields: [
      { key: 'method', label: 'Method', type: 'select', required: true,
        section: 'Request',
        options: ['GET','POST','PUT','PATCH','DELETE'], default: 'GET',
        help: 'HTTP verb sent to the target. GET/DELETE typically have no body; POST/PUT/PATCH carry one.' },
      { key: 'url', label: 'URL', type: 'text', required: true,
        pattern: HTTP_URL_RE,
        errorMessage: 'must start with http:// or https://',
        section: 'Request',
        placeholder: 'https://api.example.com/v1/items',
        default: 'https://api.example.com/',
        help: 'Full URL of the external endpoint. Supports ${VAR} interpolation from Flow.env (e.g. https://${API_HOST}/v1/items).' },
      { key: 'headers', label: 'Headers', type: 'kvlist',
        section: 'Request',
        help: 'Each key/value. Use ${KEY} to interpolate Flow.env or secrets.' },
      { key: 'body', label: 'Body template', type: 'textarea',
        section: 'Request',
        placeholder: '{ "id": "{{trigger.id}}" }',
        validate: validateJsonBody,
        help: 'Request body sent with POST/PUT/PATCH. Supports {{trigger.*}} / {{steps.*}} mustache interpolation from upstream message data.' },
      { key: 'timeoutSec', label: 'Timeout (s)', type: 'number', required: true,
        section: 'Reliability',
        min: 1, max: 300, default: 30,
        help: 'Max seconds to wait for the response before failing this step. Keep tight (5–30s) so slow upstreams do not stall the flow.' },
      { key: 'retries', label: 'Retry attempts', type: 'number', required: true,
        section: 'Reliability',
        min: 0, max: 10, default: 3,
        help: 'Exponential backoff, retries on 5xx and network errors.' },
      { key: 'circuitBreaker', label: 'Trip on consecutive failures', type: 'number',
        section: 'Reliability',
        min: 0, max: 100, default: 0,
        help: '0 = circuit breaker disabled.' },
    ],
  },

  /* =========================  Logic  ========================= */
  filter: {
    doc: 'flow-engine §6',
    description: 'Pass messages matching a predicate; drop or branch the rest.',
    fields: [
      { key: 'predicate', label: 'Predicate (JSONata)', type: 'text', required: true,
        placeholder: 'amount > 0 and status = "open"',
        default: 'true',
        help: 'Evaluated per-message. Truthy → pass; falsy → on-no-match action below.' },
      { key: 'onNoMatch', label: 'On no-match', type: 'select', required: true,
        options: [
          { value: 'drop',   label: 'drop silently' },
          { value: 'branch', label: 'branch to "no-match" output' },
          { value: 'error',  label: 'emit error' },
        ],
        default: 'drop',
        help: 'What to do when the predicate is falsy. drop = swallow the message; branch = send to a separate output port; error = fail the step and propagate.' },
    ],
  },

  ifelse: {
    doc: 'flow-engine §6',
    description: 'Two-way branch on a boolean condition.',
    autoTitle: (cfg) => cfg.condition ? `if ${cfg.condition}` : 'If / Else',
    fields: [
      { key: 'condition', label: 'Condition (JSONata)', type: 'text', required: true,
        placeholder: 'amount > 100', default: 'true',
        help: 'Expression evaluated per message. Truthy → True branch; falsy → False branch.' },
      { key: 'trueLabel', label: 'True branch label', type: 'text', required: true,
        default: 'true', help: 'Name shown on the True output port and in logs.' },
      { key: 'falseLabel', label: 'False branch label', type: 'text', required: true,
        default: 'false', help: 'Name shown on the False output port and in logs.' },
      { key: 'branchPreview', label: 'Branch preview', type: 'derived',
        derive: (cfg) => {
          const cond = cfg.condition || '<condition>';
          const t = cfg.trueLabel || 'true';
          const f = cfg.falseLabel || 'false';
          return `if (${cond})\n  → ${t}\nelse\n  → ${f}`;
        },
        json: true,
        help: 'How the branch will route. Updates live.' },
    ],
  },

  switch: {
    doc: 'flow-engine §6',
    description: 'Multi-way branch — pick an output by matching the expression to a case value.',
    autoTitle: (cfg) => cfg.switchExpr ? `switch ${cfg.switchExpr}` : 'Switch',
    fields: [
      { key: 'switchExpr', label: 'Switch expression (JSONata)', type: 'text', required: true,
        placeholder: 'event.type', default: 'event.type',
        help: 'Expression evaluated per message. Result is matched against the case values below.' },
      { key: 'cases', label: 'Cases (value → branch)', type: 'kvlist', required: true,
        help: 'Left = exact value to match. Right = output branch name. Add one row per case.' },
      { key: 'defaultLabel', label: 'Default branch label', type: 'text', required: true,
        default: 'default',
        help: 'Branch used when no case value matches.' },
      { key: 'routingPreview', label: 'Routing table (preview)', type: 'derived',
        derive: (cfg) => {
          const expr = cfg.switchExpr || '<expression>';
          const cases = (cfg.cases || []).filter((c) => c && c.k);
          const def = cfg.defaultLabel || 'default';
          if (cases.length === 0) {
            return `${expr}\n  (no cases yet)\n  ↓ ${def}`;
          }
          const rows = cases.map((c) => `  ${c.k}\n    → ${c.v || '<branch>'}`).join('\n');
          return `${expr} =>\n${rows}\n  *\n    → ${def}`;
        },
        json: true,
        help: 'Live view of the routing rules. Updates as you add cases.' },
    ],
  },

  loop: {
    doc: 'flow-engine §6',
    description: 'Iterate over an array; downstream nodes run per item.',
    fields: [
      { key: 'iterable', label: 'Iterable expression (JSONata)', type: 'text', required: true,
        placeholder: 'items', default: 'items',
        help: 'Path or JSONata expression resolving to the array you want to iterate over (e.g. items, payload.orders, $keys(map)).' },
      { key: 'mode', label: 'Mode', type: 'select', required: true,
        options: ['sequential','parallel'], default: 'sequential',
        help: 'sequential: one item at a time. parallel: many at once (faster, but order is not guaranteed).' },
      { key: 'maxIterations', label: 'Max iterations', type: 'number', required: true,
        min: 1, max: 100000, default: 1000,
        help: 'Hard cap protecting against runaway loops if the iterable resolves to an unexpectedly huge array. Excess items are skipped and a warning is logged.' },
      { key: 'continueOnError', label: 'Continue on per-iteration error', type: 'toggle',
        default: false,
        help: 'When off, the first failure aborts the loop and propagates upward.' },
    ],
  },

  split: {
    doc: 'flow-engine §6',
    description: 'Fan-out an array into N parallel branches; emit one message per element.',
    fields: [
      { key: 'arrayPath', label: 'Array path (JSONata)', type: 'text', required: true,
        placeholder: 'orders', default: 'items',
        help: 'Path to the array to fan out. Each element becomes its own downstream message and flows independently from this point on.' },
      { key: 'continueOnError', label: 'Continue on partial failure', type: 'toggle',
        default: true,
        help: 'On: failed branches are logged and the rest continue. Off: any branch failure aborts the whole fan-out (use when the operation must be all-or-nothing).' },
      { key: 'aggregate', label: 'Aggregate at downstream Merge', type: 'toggle',
        default: true,
        help: 'On: place a Merge node after Split — it collects all per-item outputs into one array (fan-in). Off: each item flows independently (fire-and-forget per item).' },
    ],
  },

  merge: {
    doc: 'flow-engine §6',
    description: 'Combine inputs from multiple branches into a single message.',
    autoTitle: (cfg) => `merge ${cfg.mode || 'deep'}`,
    fields: [
      { key: 'mode', label: 'Merge mode', type: 'select', required: true,
        options: [
          { value: 'deep',        label: 'deep merge (recursive)' },
          { value: 'shallow',     label: 'shallow merge (top-level)' },
          { value: 'concatenate', label: 'concatenate (arrays)' },
        ],
        default: 'deep',
        help: 'How nested fields are combined when two inputs arrive at this step.' },
      { key: 'onConflict', label: 'On key conflict', type: 'select', required: true,
        options: [
          { value: 'last-wins',  label: 'last wins' },
          { value: 'first-wins', label: 'first wins' },
          { value: 'error',      label: 'emit error' },
        ],
        default: 'last-wins',
        help: 'What to do when both inputs have the same key.' },
      { key: 'modeExample', label: 'Example', type: 'derived',
        derive: (cfg) => {
          if (cfg.mode === 'shallow') {
            return 'Input A:  { a: 1, b: { x: 1 } }\nInput B:  { b: { y: 2 } }\n\nResult:   { a: 1, b: { y: 2 } }\n          (nested object replaced wholesale)';
          }
          if (cfg.mode === 'concatenate') {
            return 'Input A:  [1, 2, 3]\nInput B:  [4, 5]\n\nResult:   [1, 2, 3, 4, 5]';
          }
          /* deep */
          return 'Input A:  { a: 1, b: { x: 1 } }\nInput B:  { b: { y: 2 } }\n\nResult:   { a: 1, b: { x: 1, y: 2 } }\n          (nested keys merged recursively)';
        },
        json: true,
        help: 'How this merge mode behaves on a typical pair of inputs.' },
    ],
  },

  /* =========================  Timing  ========================= */
  delay: {
    doc: 'ADR-0017 · ADR-0025',
    description: 'Pauses the flow for a fixed duration. State WAL-persisted; container scales to zero.',
    autoTitle: (cfg) => cfg.duration ? `delay ${cfg.duration}` : 'Delay',
    fields: [
      { key: 'duration', label: 'Pause duration', type: 'text', required: true,
        pattern: DURATION_RE,
        errorMessage: 'e.g. 30s, 5m, 2h, 1d',
        placeholder: '5m', default: '5m',
        suggestions: () => ['30s', '1m', '5m', '15m', '30m', '1h', '6h', '12h', '1d'],
        help: 'How long the flow pauses before continuing. Counts against your workspace timer quota.' },
      { key: 'pauseUntilPreview', label: 'Resumes at (preview)', type: 'derived',
        derive: (cfg) => {
          const d = (cfg.duration || '').trim();
          const m = d.match(/^(\d+)(ms|s|m|h|d)$/);
          if (!m) return '—';
          const n = Number(m[1]);
          const unit = m[2];
          const mult = unit === 'ms' ? 1 : unit === 's' ? 1e3 : unit === 'm' ? 60e3 : unit === 'h' ? 3600e3 : 86400e3;
          const at = new Date(Date.now() + n * mult);
          return `≈ ${at.toISOString().slice(0, 19).replace('T', ' ')} UTC`;
        },
        help: 'Estimated resume time if this step started now.' },
    ],
  },

  waituntil: {
    doc: 'ADR-0017 · ADR-0025',
    description: 'Pauses until an absolute timestamp. Same durability semantics as Delay.',
    autoTitle: (cfg) => cfg.resumeAt ? `wait until ${cfg.resumeAt.slice(0, 16)}` : 'Wait Until',
    fields: [
      { key: 'resumeAt', label: 'Resume at', type: 'text', required: true,
        placeholder: '2026-12-31T09:00:00Z', default: '2026-12-31T09:00:00Z',
        help: 'ISO 8601 timestamp or an expression that evaluates to one.',
        validate: (v) => (ISO_RE.test(v) || /\{\{.+\}\}/.test(v) ? null : 'ISO timestamp or {{expression}}') },
      { key: 'pastPolicy', label: 'Past-timestamp policy', type: 'select', required: true,
        options: [
          { value: 'fire-now', label: 'fire-now (resume immediately if past)' },
          { value: 'skip',     label: 'skip (pass through)' },
          { value: 'fail',     label: 'fail (emit error)' },
        ],
        default: 'fire-now',
        help: 'What to do if the timestamp is in the past when this step runs.' },
      { key: 'resumeInPreview', label: 'Resumes in (preview)', type: 'derived',
        derive: (cfg) => {
          const v = (cfg.resumeAt || '').trim();
          /* Templated expressions can't be parsed at design time. */
          if (/\{\{.+\}\}/.test(v)) return 'Computed at runtime (template expression).';
          if (!ISO_RE.test(v)) return '—';
          const t = new Date(v).getTime();
          if (Number.isNaN(t)) return '—';
          const dt = t - Date.now();
          if (dt <= 0) {
            const policy = cfg.pastPolicy || 'fire-now';
            return `Timestamp is in the past. Past-policy "${policy}" applies.`;
          }
          const days = Math.floor(dt / 86400000);
          const hours = Math.floor((dt % 86400000) / 3600000);
          const minutes = Math.floor((dt % 3600000) / 60000);
          const parts = [];
          if (days)  parts.push(days  + 'd');
          if (hours) parts.push(hours + 'h');
          if (minutes && !days) parts.push(minutes + 'm');
          return 'Resumes in ' + (parts.join(' ') || '< 1m') + '.';
        },
        help: 'How far in the future the timestamp is, computed from your browser clock.' },
    ],
  },

  crongate: {
    doc: 'ADR-0017',
    description: 'Synchronous gate — passes only inside an allowed cron window. No pause.',
    autoTitle: (cfg) => cfg.cron ? `gate ${cfg.cron}` : 'Cron Gate',
    fields: [
      { key: 'cron', label: 'Allowed-window cron', type: 'text', required: true,
        pattern: CRON_RE, errorMessage: '5–6 space-separated cron tokens',
        placeholder: '0-59 9-17 * * 1-5', default: '0-59 9-17 * * 1-5',
        suggestions: () => [
          '0-59 9-17 * * 1-5',  /* weekdays business hours */
          '0-59 0-23 * * *',    /* every minute, all day */
          '0-29 * * * *',       /* first half of each hour */
          '*/15 * * * *',       /* every 15m */
          '0 9-17 * * 1-5',     /* weekdays on the hour, business hours */
        ],
        help: 'Cron expression — message passes only when "now" falls inside this window.' },
      { key: 'timezone', label: 'Timezone', type: 'select', required: true,
        options: [
          'UTC',
          'Asia/Tashkent', 'Asia/Tokyo', 'Asia/Singapore', 'Asia/Dubai', 'Asia/Kolkata',
          'Europe/London', 'Europe/Berlin', 'Europe/Moscow',
          'America/New_York', 'America/Chicago', 'America/Los_Angeles',
          'Australia/Sydney',
        ],
        default: 'UTC',
        help: 'IANA timezone. Cron expression is evaluated in this zone.' },
      { key: 'onGated', label: 'On gated', type: 'select', required: true,
        options: [
          { value: 'branch', label: 'branch to "gated" output' },
          { value: 'drop',   label: 'drop silently' },
          { value: 'error',  label: 'emit error' },
        ],
        default: 'branch',
        help: 'What to do when "now" is outside the allowed window.' },
    ],
  },

  schedfuture: {
    doc: 'ADR-0017 · ADR-0025',
    description: 'Fire-and-forget — schedules another flow to run later. Current flow continues immediately.',
    autoTitle: (cfg) => cfg.targetFlow ? `schedule ${cfg.targetFlow}` : 'Schedule Future Run',
    fields: [
      { key: 'targetFlow', label: 'Target flow', type: 'select', required: true,
        options: (cfg, ctx) => (ctx && ctx.flows ? ctx.flows : []).map((f) => ({
          value: f.Flow,
          label: `${f.Flow} · ${f.Trigger || 'manual'}`,
        })),
        help: 'Which flow to schedule. Pick from your workspace.' },
      { key: 'mode', label: 'Schedule mode', type: 'select', required: true,
        options: [
          { value: 'delay', label: 'delay (relative to now)' },
          { value: 'at',    label: 'at (absolute timestamp)' },
        ],
        default: 'delay',
        help: 'delay = fire after a duration from now (e.g. 7d). at = fire at a specific timestamp, possibly computed from the message via {{expression}}.' },
      { key: 'when', label: 'When', type: 'text', required: true,
        default: '7d',
        validate: (v, all) => {
          if (all.mode === 'delay') return DURATION_RE.test(v) ? null : 'duration: 30s, 5m, 2h, 1d';
          return ISO_RE.test(v) || /\{\{.+\}\}/.test(v) ? null : 'ISO timestamp or {{expression}}';
        },
        help: 'delay mode: duration like 30s / 5m / 2h / 7d. at mode: ISO 8601 timestamp (2026-06-01T09:00:00Z) or a {{trigger.*}} expression that resolves to one.' },
      { key: 'payload', label: 'Payload template (JSONata)', type: 'textarea',
        default: '{ "fromExec": $msg.ExecID }',
        help: 'JSON delivered as the trigger payload when the target flow runs. By default carries the originating ExecID so the scheduled run can be traced back.' },
    ],
  },

  /* =========================  Data  ========================= */
  jsontransform: {
    doc: 'flow-engine §6',
    description: 'JSONata transform — reshape the message.',
    fields: [
      { key: 'expression', label: 'JSONata expression', type: 'textarea', required: true,
        placeholder: '{ "id": id, "total": items.price ~> $sum }',
        default: '{ "out": $ }',
        help: 'Output replaces the message. Use $ to reference input.' },
      { key: 'outputVar', label: 'Output variable (optional)', type: 'text',
        pattern: IDENT_RE,
        errorMessage: 'UPPER_SNAKE_CASE',
        placeholder: 'TRANSFORMED',
        help: 'If set, also writes the result to this exec-scoped variable.' },
    ],
  },

  setvar: {
    doc: 'flow-engine §6',
    description: 'Write a variable in flow or exec scope.',
    autoTitle: (cfg) => cfg.name ? `set ${cfg.name}` : 'Set Variable',
    fields: [
      { key: 'name', label: 'Variable name', type: 'text', required: true,
        pattern: IDENT_RE, errorMessage: 'UPPER_SNAKE_CASE',
        placeholder: 'USER_ID', default: 'USER_ID',
        help: 'UPPER_SNAKE_CASE identifier. Becomes readable downstream via "Get Variable" with the same name in the chosen scope.' },
      { key: 'value', label: 'Value (literal or JSONata)', type: 'text', required: true,
        placeholder: 'user.id', default: '$msg.id',
        help: 'Literal value or JSONata expression evaluated against the current message. Use $msg.* or $.* to reach into the message body.' },
      { key: 'scope', label: 'Scope', type: 'select', required: true,
        options: [
          { value: 'exec', label: 'exec (this run only)' },
          { value: 'flow', label: 'flow (deployment-wide)' },
        ],
        default: 'exec',
        help: 'exec: lives only for this single run. flow: persists across all runs of this flow.' },
    ],
  },

  getvar: {
    doc: 'flow-engine §6',
    description: 'Read a variable from flow or exec scope.',
    autoTitle: (cfg) => cfg.name ? `get ${cfg.name}` : 'Get Variable',
    fields: [
      { key: 'name', label: 'Variable name', type: 'text', required: true,
        pattern: IDENT_RE, errorMessage: 'UPPER_SNAKE_CASE',
        suggestions: (cfg, ctx) => Array.from(new Set(ctx && ctx.knownVariables || [])).sort(),
        placeholder: 'USER_ID', default: 'USER_ID',
        help: 'Pick a variable that an upstream "Set Variable" step has written, or type a new name.' },
      { key: 'fallback', label: 'Fallback default', type: 'text',
        placeholder: 'null',
        help: 'Used when the variable is undefined.' },
    ],
  },

  /* =========================  Output  ========================= */
  httpresp: {
    doc: 'interface-adapter §3',
    description: 'Response returned to the HTTP caller. Required for HTTP Trigger flows.',
    autoTitle: (cfg) => cfg.statusCode ? `Return ${cfg.statusCode}` : 'HTTP Response',
    fields: [
      { key: 'statusCode', label: 'Status code', type: 'select', required: true,
        options: [
          { value: 200, label: '200 — OK' },
          { value: 201, label: '201 — Created' },
          { value: 202, label: '202 — Accepted' },
          { value: 204, label: '204 — No Content' },
          { value: 400, label: '400 — Bad Request' },
          { value: 401, label: '401 — Unauthorized' },
          { value: 403, label: '403 — Forbidden' },
          { value: 404, label: '404 — Not Found' },
          { value: 409, label: '409 — Conflict' },
          { value: 422, label: '422 — Unprocessable Entity' },
          { value: 429, label: '429 — Too Many Requests' },
          { value: 500, label: '500 — Internal Server Error' },
        ],
        default: 200,
        help: 'HTTP status sent to the caller. Use 2xx for success, 4xx for client errors, 5xx for server errors.' },
      { key: 'headers', label: 'Headers', type: 'kvlist',
        help: 'Use ${KEY} to interpolate Flow.env / secrets.' },
      { key: 'body', label: 'Body template', type: 'textarea', required: true,
        placeholder: '{ "ok": true, "id": "{{msg.id}}" }',
        default: '{ "ok": true }',
        validate: validateJsonBody,
        help: 'Response body sent to the caller. Supports {{trigger.*}} / {{steps.*}} interpolation. Must be valid JSON when Content-Type is application/json.' },
    ],
  },

  kafkapub: {
    doc: 'ADR-0006',
    description: 'Publish to a Kafka topic.',
    autoTitle: (cfg) => cfg.topic ? `publish ${cfg.topic}` : 'Kafka Publish',
    fields: [
      { key: 'topic', label: 'Topic', type: 'text', required: true,
        suggestions: (cfg, ctx) => (ctx && ctx.kafkaTopics) || [],
        placeholder: 'orders.processed', default: 'events.out',
        help: 'Kafka topic to publish to. Suggestions come from other flows.' },
      { key: 'key', label: 'Key expression (JSONata)', type: 'text',
        placeholder: 'order.id',
        help: 'Determines partition. Empty = round-robin.' },
      { key: 'value', label: 'Value template', type: 'textarea', required: true,
        placeholder: '{ "id": "{{msg.id}}" }',
        default: '$',
        help: 'Payload published to the topic. "$" sends the entire current message; use a JSONata expression or JSON template to reshape it.' },
      { key: 'partitionStrategy', label: 'Partition strategy', type: 'select', required: true,
        options: ['hash-key','round-robin','sticky'], default: 'hash-key',
        help: 'hash-key: same key → same partition (preserves order per key). round-robin: even spread, no ordering. sticky: batches go to one partition until full (best throughput).' },
      { key: 'acks', label: 'Acks', type: 'select', required: true,
        options: [
          { value: 'all', label: 'all (strongest)' },
          { value: '1',   label: '1 (leader only)' },
          { value: '0',   label: '0 (fire-and-forget)' },
        ],
        default: 'all',
        help: 'Durability vs latency trade-off. all = wait for all replicas (safest). 1 = leader only (faster, small risk of loss). 0 = no ack (lowest latency, no guarantee).' },
    ],
  },

  notify: {
    doc: 'arch §9',
    description: 'Send a notification to an external channel.',
    fields: [
      { key: 'channel', label: 'Channel', type: 'select', required: true,
        section: 'Destination',
        options: ['slack','pagerduty','email','webhook'], default: 'slack',
        help: 'Where the notification goes. slack / pagerduty for ops alerting, email for user-facing notices, webhook for any other system.' },
      { key: 'target', label: 'Target', type: 'text', required: true,
        section: 'Destination',
        placeholder: (cfg) => {
          if (cfg.channel === 'slack')      return '#payments-alerts';
          if (cfg.channel === 'pagerduty')  return 'service-key-or-routing-key';
          if (cfg.channel === 'email')      return 'oncall@acme.io';
          if (cfg.channel === 'webhook')    return 'https://hooks.example.com/...';
          return 'channel target';
        },
        help: (cfg) => {
          if (cfg.channel === 'slack')      return 'Slack channel (#name) or user (@name).';
          if (cfg.channel === 'pagerduty')  return 'PagerDuty service key or routing key.';
          if (cfg.channel === 'email')      return 'Recipient email address.';
          if (cfg.channel === 'webhook')    return 'HTTPS webhook URL — the message body is POSTed here.';
          return 'Where the notification is delivered.';
        } },
      { key: 'severity', label: 'Severity', type: 'select', required: true,
        section: 'Destination',
        options: ['info','warning','critical'], default: 'info',
        help: 'Sets the colour/icon in Slack, the urgency in PagerDuty, and the subject prefix in email. critical bypasses do-not-disturb on PagerDuty.' },
      { key: 'template', label: 'Message template', type: 'textarea', required: true,
        section: 'Message',
        placeholder: '⚠ {{flow}} hit a 5xx for order {{msg.id}}',
        default: '{{flow}} · {{msg.id}}',
        help: 'The notification body. Supports {{flow}}, {{exec}}, {{msg.*}}, {{steps.*}} mustache interpolation. Keep it short — Slack and PagerDuty truncate long messages.' },
    ],
  },

  return: {
    doc: 'flow-engine §6',
    description: 'Terminal node — finishes the flow with an explicit value.',
    fields: [
      { key: 'body', label: 'Return value', type: 'textarea', required: true,
        placeholder: '{ "ok": true }', default: '{ "ok": true }',
        validate: validateJsonBody,
        help: 'Replaces the message. Caller (or parent flow) sees this.' },
      { key: 'statusCode', label: 'Status code', type: 'number',
        min: 100, max: 599, default: 200,
        showIf: (cfg, ctx) => ctx && ctx.hasHttpTrigger,
        help: 'Only applies when this flow is HTTP-triggered. Otherwise the value is returned as-is.' },
    ],
  },
};

/* Kinds that opt out of the common Execution section. */
const NO_EXECUTION_SECTION = new Set([
  'httptrigger','grpc','kafkatrig','webhook','cron','manual', /* triggers handle their own runtime */
  'code', /* container — managed via Functions registry */
]);

/* Build a default config object for a kind from its schema defaults. */
function defaultConfigFor(kind) {
  const schema = NODE_SCHEMA[kind];
  if (!schema) return {};
  const cfg = {};
  schema.fields.forEach((f) => {
    if (f.type === 'kvlist') cfg[f.key] = [];
    else if (f.type === 'stringlist') cfg[f.key] = [];
    else if (f.type === 'toggle') cfg[f.key] = !!f.default;
    else if (f.default !== undefined) cfg[f.key] = f.default;
    else if (f.type === 'number') cfg[f.key] = null;
    else cfg[f.key] = '';
  });
  return cfg;
}

/* Legacy migration: nodes created before the schema-driven UI stored everything
   on `n.body` as a string. We pull that into typed fields when we can, but
   ONLY when the legacy value looks plausible — pattern-mismatched migrations
   used to produce broken defaults like Path="GET ?pnfl=" (an HTTP error).
   For HTTP-shaped nodes (httptrigger / webhook) we also try to parse
   "METHOD /path" so old free-form values like "GET /users" split cleanly. */
function tryParseHttpBody(body) {
  if (typeof body !== 'string') return null;
  const m = body.trim().match(/^(GET|POST|PUT|PATCH|DELETE)\s+(\/\S*)/i);
  if (m) return { method: m[1].toUpperCase(), path: m[2] };
  /* just a path? */
  if (/^\/\S*$/.test(body.trim())) return { path: body.trim() };
  return null;
}
function nodeWithDefaults(node) {
  const schema = NODE_SCHEMA[node.kind];
  if (!schema) return node;
  const existing = node.config && typeof node.config === 'object' ? node.config : {};
  const defaults = defaultConfigFor(node.kind);
  const merged = { ...defaults, ...existing };
  /* migrate legacy body if no config was set yet — only when the value is
     plausible for the destination field. Otherwise keep the schema default. */
  if (!node.config && node.body && typeof node.body === 'string') {
    /* HTTP-shaped nodes: smart-parse "METHOD /path" */
    if (node.kind === 'httptrigger' || node.kind === 'webhook') {
      const parsed = tryParseHttpBody(node.body);
      if (parsed) {
        if (parsed.method && schema.fields.find((f) => f.key === 'method')) merged.method = parsed.method;
        if (parsed.path) merged.path = parsed.path;
      }
    } else {
      const primary = schema.fields.find((f) =>
        (f.type === 'text' || f.type === 'textarea') && f.required);
      if (primary) {
        /* Validate the legacy value against the field's pattern before using it.
           Pattern-fail → keep the schema default rather than show a broken UI.
           Also reject the placeholder string `configure…` that older Designer
           builds used as a generic body default. */
        const isPlaceholder = node.body.trim() === 'configure…';
        const valueLooksOk = !isPlaceholder
          && (!primary.pattern || primary.pattern.test(node.body));
        if (valueLooksOk) merged[primary.key] = node.body;
      }
    }
  }
  /* node-specific legacy keys that lived on the node root */
  if (node.kind === 'waituntil' && node.pastPolicy) merged.pastPolicy = node.pastPolicy;
  if (node.kind === 'crongate' && node.tz) merged.timezone = node.tz;
  if (node.kind === 'schedfuture') {
    if (node.targetFlow) merged.targetFlow = node.targetFlow;
    if (node.schedMode) merged.mode = node.schedMode;
    if (node.body) merged.when = node.body;
    if (node.payload) merged.payload = node.payload;
  }
  return { ...node, config: merged };
}

/* Validate a single field's current value against its schema entry.
   Returns an error message or null. */
function validateField(field, value, allValues) {
  const isEmpty = value === undefined || value === null || value === ''
    || (Array.isArray(value) && value.length === 0);
  if (field.required && isEmpty) return 'required';
  if (isEmpty) return null;
  if (field.type === 'number') {
    const n = Number(value);
    if (Number.isNaN(n)) return 'must be a number';
    if (field.min != null && n < field.min) return 'min ' + field.min;
    if (field.max != null && n > field.max) return 'max ' + field.max;
  }
  if (field.pattern && typeof value === 'string' && !field.pattern.test(value)) {
    return field.errorMessage || 'invalid format';
  }
  if (typeof field.validate === 'function') {
    const r = field.validate(value, allValues || {});
    if (r) return r;
  }
  return null;
}

/* Validate every field in a node. Returns array of { key, label, error }. */
function validateNode(node) {
  const schema = NODE_SCHEMA[node.kind];
  if (!schema) return [];
  const cfg = node.config || {};
  const errs = [];
  schema.fields.forEach((f) => {
    const e = validateField(f, cfg[f.key], cfg);
    if (e) errs.push({ key: f.key, label: f.label, error: e });
  });
  return errs;
}


/* ======================= src/lib/functionForm.js ======================= */
