/* ======================= src/components/ContextMenu.jsx ======================= */

/* Desktop-style context menu — right-click target opens it at the cursor position.
   Auto-flips into the viewport, closes on outside click / Escape / item click.
   Item shape:
     { label, icon?, shortcut?, onClick, danger?, disabled?, divider? }
   `divider: true` renders a separator instead of a clickable row. */

function ContextMenu({ x, y, items, onClose }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: x, top: y, ready: false });
  const [active, setActive] = useState(-1);

  /* After first render measure size, flip into viewport if it would clip. */
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = x;
    let top = y;
    if (left + r.width + 8 > vw) left = Math.max(8, x - r.width);
    if (top + r.height + 8 > vh) top = Math.max(8, y - r.height);
    setPos({ left, top, ready: true });
  }, [x, y]);

  /* Outside click + Escape close. Keyboard navigation: arrows + Enter. */
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      const focusable = items
        .map((it, i) => ({ it, i }))
        .filter(({ it }) => !it.divider && !it.disabled);
      if (focusable.length === 0) return;
      const curIdx = focusable.findIndex(({ i }) => i === active);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (curIdx + 1) % focusable.length;
        setActive(focusable[next].i);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const next = (curIdx - 1 + focusable.length) % focusable.length;
        setActive(focusable[next].i);
      } else if (e.key === 'Enter' && active >= 0 && items[active] && !items[active].divider && !items[active].disabled) {
        e.preventDefault();
        items[active].onClick && items[active].onClick();
        onClose();
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [items, active, onClose]);

  return (
    <div ref={ref} className="ctxmenu" role="menu"
      style={{
        position: 'fixed', left: pos.left, top: pos.top,
        visibility: pos.ready ? 'visible' : 'hidden',
        zIndex: 1000,
      }}>
      {items.map((it, i) => {
        if (it.divider) return <div key={'d' + i} className="ctxmenu-div" />;
        const onClick = (e) => {
          if (it.disabled) return;
          e.stopPropagation();
          it.onClick && it.onClick();
          onClose();
        };
        return (
          <button key={i} type="button" role="menuitem"
            className={'ctxmenu-i'
              + (it.disabled ? ' is-disabled' : '')
              + (it.danger ? ' is-danger' : '')
              + (active === i ? ' is-active' : '')}
            disabled={!!it.disabled}
            onMouseEnter={() => setActive(i)}
            onClick={onClick}>
            {it.icon && <span className="ctxmenu-ic" aria-hidden>{it.icon}</span>}
            <span className="ctxmenu-lbl">{it.label}</span>
            {it.shortcut && <span className="ctxmenu-kbd">{it.shortcut}</span>}
          </button>
        );
      })}
    </div>
  );
}


/* ======================= src/components/OnboardingModal.jsx ======================= */

/* 3-step welcome modal shown to first-time users. Persists an 'onboarded'
   flag in localStorage so it does not re-appear on every refresh.
   Triggered by Dashboard (auto-open when flag missing) or by the
   "Take the tour" link at the top of /dashboard. */

const STEPS = [
  {
    icon: '🔌',
    title: '1. Connect a trigger',
    body: 'Every flow starts with a trigger — HTTP, gRPC, Kafka, Webhook, or Cron. The trigger decides when your flow runs and what payload it receives.',
    cta: { label: 'Browse triggers', route: '/designer' },
  },
  {
    icon: '🧩',
    title: '2. Build a flow',
    body: 'Drag steps from the palette into the canvas. Connect them with wires, configure each step with typed fields, and validate before deploy.',
    cta: { label: 'Open the Designer', route: '/flows' },
  },
  {
    icon: '🚀',
    title: '3. Deploy & observe',
    body: 'Deploy publishes the PlanSpec and starts reconciling. Watch live metrics, traces and logs in Monitoring, or replay failures from DLQ.',
    cta: { label: 'Go to Dashboard', route: '/dashboard' },
  },
];

function OnboardingModal({ onClose }) {
  const nav = useNavigate();
  const { toast } = useApp();
  const [step, setStep] = useState(0);
  const cur = STEPS[step];
  const last = step === STEPS.length - 1;

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const finish = () => { localStorage.setItem('evd_onboarded', 'true'); onClose(); toast('Welcome aboard'); };
  const ctaClick = () => { localStorage.setItem('evd_onboarded', 'true'); onClose(); nav(cur.cta.route); };

  return (
    <>
      <div className="scrim" />
      <div role="dialog" aria-modal="true" aria-labelledby="onb-title"
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 'min(520px, 92vw)', background: 'var(--panel)', border: '1px solid var(--border2)',
          borderRadius: 12, padding: 24, zIndex: 1100, boxShadow: '0 20px 60px rgba(0,0,0,.55)',
        }}>
        {/* Step dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 18 }}>
          {STEPS.map((_, idx) => (
            <span key={idx} style={{
              width: idx === step ? 18 : 6, height: 6, borderRadius: 3,
              background: idx === step ? 'var(--accent)' : 'var(--border2)', transition: 'width .2s',
            }} />
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>{cur.icon}</div>
          <h2 id="onb-title" style={{ margin: 0, fontSize: 20 }}>{cur.title}</h2>
          <p style={{ marginTop: 12, marginBottom: 0, color: 'var(--muted)', lineHeight: 1.55 }}>
            {cur.body}
          </p>
        </div>

        <div style={{ marginTop: 22, display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <Btn onClick={finish}>Skip tour</Btn>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={ctaClick}>{cur.cta.label} →</Btn>
            {last
              ? <Btn kind="pri" onClick={finish}>Get started</Btn>
              : <Btn kind="pri" onClick={next}>Next</Btn>}
          </div>
        </div>
      </div>
    </>
  );
}


/* ======================= src/components/YamlPreviewModal.jsx ======================= */

/* Read-only ScaledObject YAML viewer — opened from the Function row's
   "🔧 YAML" button. Compiles the YAML from the function record at view time
   so it stays in sync with whatever's currently in the store. Power users
   and audit/compliance reviewers — not part of the create flow. */

function compileYaml(fn) {
  if (!fn) return '';
  const s = fn.scaling || {};
  const triggers = Array.isArray(s.triggers) ? s.triggers : [];
  const trigYaml = triggers.length === 0
    ? '    # no trigger configured'
    : triggers.map((t) => {
        if (t.type === 'kafka') {
          return `    - type: kafka
      name: ${t.name || 'broker-lag'}
      metadata:
        topic: ${t.topic || ''}
        lagThreshold: "${t.lagThreshold || ''}"`;
        }
        if (t.type === 'cpu' || t.type === 'memory') {
          return `    - type: ${t.type}
      name: ${t.name || t.type + '-utilization'}
      metadata:
        value: "${t.value || ''}"`;
        }
        if (t.type === 'cron') {
          return `    - type: cron
      name: ${t.name || 'business-hours'}
      metadata:
        desiredReplicas: "${t.desiredReplicas || '1'}"`;
        }
        /* prometheus */
        return `    - type: prometheus
      name: ${t.name || 'pending-invocations'}
      metadata:
        query: '${t.query || ''}'
        threshold: "${t.threshold || ''}"${s.minReplicaCount === 0 ? '\n        activationThreshold: "' + (s.activationThreshold ?? 5) + '"' : ''}`;
      }).join('\n');
  const sUp = (s.behavior && s.behavior.scaleUp)   || { stabilizationWindowSeconds: 0,   percent: 200, periodSeconds: 15 };
  const sDn = (s.behavior && s.behavior.scaleDown) || { stabilizationWindowSeconds: 120, percent: 25,  periodSeconds: 60 };
  return `apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: fn-${fn.Workspace}-${fn.Function}
  labels:
    workspace: ${fn.Workspace}
    flow: ${fn.Flow || '—'}
    runtime: ${(fn.RuntimeTier || 'Docker').toLowerCase()}
    fdk: ${fn.FdkLang || 'fdk-go'}
spec:
  scaleTargetRef:
    name: runner-${fn.Workspace}-${fn.Function}
    ${fn.Image ? 'image: ' + fn.Image : '# image: <pending build>'}
  minReplicaCount: ${s.minReplicaCount ?? 0}
  maxReplicaCount: ${s.maxReplicaCount ?? 8}
  cooldownPeriod: ${s.cooldownPeriod ?? 120}
  pollingInterval: ${s.pollingInterval ?? 5}
  advanced:
    horizontalPodAutoscalerConfig:
      behavior:
        scaleUp:   { stabilizationWindowSeconds: ${sUp.stabilizationWindowSeconds}, policies: [{type: Percent, value: ${sUp.percent}, periodSeconds: ${sUp.periodSeconds}}] }
        scaleDown: { stabilizationWindowSeconds: ${sDn.stabilizationWindowSeconds}, policies: [{type: Percent, value: ${sDn.percent}, periodSeconds: ${sDn.periodSeconds}}] }
  triggers:
${trigYaml}`;
}

function YamlPreviewModal({ fn, onClose }) {
  const { toast } = useApp();
  const yaml = useMemo(() => compileYaml(fn), [fn]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(yaml);
      setCopied(true);
      toast('YAML copied to clipboard');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast('Could not copy — your browser blocked clipboard access', 'dng');
    }
  };

  if (!fn) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" style={{ width: 'min(680px, 96vw)' }}>
        <header>
          <div>
            <h3>ScaledObject YAML · {fn.Function}</h3>
            <div className="sub">read-only · compiled from current state (keda-autoscaling-spec §3.1)</div>
          </div>
          <button className="x" aria-label="Close" onClick={onClose}>✕</button>
        </header>
        <div className="body">
          <div className="field">
            <textarea readOnly value={yaml} rows={28}
              style={{
                fontFamily: 'var(--mono)', fontSize: 11,
                background: 'var(--panel)', color: 'var(--text)',
                resize: 'vertical', minHeight: 320,
              }} />
            <div className="hint">
              This is what the control plane reconciles at deploy time. Use Copy to paste into a GitOps repo or share for audit.
            </div>
          </div>
        </div>
        <footer>
          <Btn onClick={onClose}>Close</Btn>
          <Btn kind="pri" style={{ marginLeft: 'auto' }} onClick={copy}>
            {copied ? '✓ Copied' : '📋 Copy to clipboard'}
          </Btn>
        </footer>
      </aside>
    </>
  );
}


/* ======================= src/components/FunctionFormParts.jsx ======================= */

/* Shared UI atoms for FunctionCreateModal and FunctionEditModal. */

function PresetCard({ active, preset, onClick }) {
  return (
    <button type="button" onClick={onClick}
      style={{
        flex: 1, minWidth: 140, padding: 10, borderRadius: 6,
        border: active ? '1.5px solid var(--accent)' : '1px solid var(--border)',
        background: active ? 'var(--panel3)' : 'var(--panel2)',
        textAlign: 'left', cursor: 'pointer', color: 'inherit',
      }}>
      <div style={{ fontWeight: 600, fontSize: 12 }}>{preset.label}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{preset.sub}</div>
    </button>
  );
}

function ErrLine({ msg }) {
  return msg ? <div style={{ marginTop: 4, fontSize: 11, color: 'var(--danger)' }}>⚠ {msg}</div> : null;
}

function WarnLine({ msg }) {
  return msg ? <div style={{ marginTop: 4, fontSize: 11, color: 'var(--warn)' }}>⚠ {msg}</div> : null;
}

function KvListWithValidation({ rows, onChange, conflictKeys }) {
  const list = rows.length ? rows : [{ k: '', v: '' }];
  const set = (i, patch) => onChange(list.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const add = () => onChange([...list, { k: '', v: '' }]);
  const remove = (i) => {
    const next = list.filter((_, idx) => idx !== i);
    onChange(next.length ? next : [{ k: '', v: '' }]);
  };
  return (
    <div className="kvlist">
      <div className="kvlist-head"><span>Key</span><span>Value</span><span /></div>
      {list.map((r, i) => {
        const badKey = r.k && !KEY_RE.test(r.k);
        const conflict = r.k && conflictKeys && conflictKeys.has(r.k);
        return (
          <div key={i}>
            <div className="kvlist-row">
              <input placeholder="KEY" value={r.k}
                onChange={(e) => set(i, { k: e.target.value })}
                style={badKey ? { borderColor: 'var(--danger)' } : null} />
              <input placeholder="value" value={r.v} onChange={(e) => set(i, { v: e.target.value })} />
              <button type="button" className="addf" aria-label="Remove" onClick={() => remove(i)}>✕</button>
            </div>
            {badKey && <ErrLine msg="UPPER_SNAKE_CASE required" />}
            {!badKey && conflict && <WarnLine msg={`overrides Flow.${r.k}`} />}
          </div>
        );
      })}
      <button type="button" className="addf" onClick={add}>＋ Add</button>
    </div>
  );
}


/* ======================= src/components/NodeConfigForm.jsx ======================= */

/* HTTP method badge colors — matches industry convention (Postman/Swagger). */
const METHOD_COLORS = {
  GET:    '#3fb950',
  POST:   '#3b82f6',
  PUT:    '#f0a020',
  PATCH:  '#56a6ff',
  DELETE: '#f0506e',
};
function MethodBadge({ method }) {
  const c = METHOD_COLORS[(method || '').toUpperCase()] || 'var(--muted)';
  return (
    <span style={{
      display: 'inline-block', minWidth: 56, padding: '2px 7px', borderRadius: 4,
      background: c, color: '#0d1117', fontWeight: 700, fontSize: 11,
      fontFamily: 'var(--mono)', textAlign: 'center', letterSpacing: '.5px',
    }}>{(method || '—').toUpperCase()}</span>
  );
}

/* gRPC endpoint preview — shows the grpc:// URL + streaming + auth.
   Mirrors HttpEndpointPreview so users get the same "this is what gets deployed"
   feedback for both trigger families. */
function GrpcEndpointPreview({ cfg, workspace }) {
  if (!cfg) return null;
  const host = 'gateway.' + (workspace || 'workspace') + '.eventador.io:443';
  const svc = cfg.service || 'package.Service';
  const m = cfg.method || 'Method';
  const auth = cfg.auth === 'jwt' ? '🔑 JWT' : cfg.auth === 'none' ? '⚠ public' : '🔒 mTLS';
  return (
    <div style={{
      padding: '8px 10px', marginBottom: 12,
      background: 'var(--panel2)', border: '1px solid var(--border)', borderRadius: 6,
      display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
    }}>
      <span style={{
        display: 'inline-block', minWidth: 48, padding: '2px 7px', borderRadius: 4,
        background: '#8b5cf6', color: '#0d1117', fontWeight: 700, fontSize: 11,
        fontFamily: 'var(--mono)', textAlign: 'center', letterSpacing: '.5px',
      }}>gRPC</span>
      <span className="mono" style={{ fontSize: 12, color: 'var(--text)', wordBreak: 'break-all' }}>
        grpc://{host}/{svc}/{m}
      </span>
      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>{auth}</span>
    </div>
  );
}

/* HTTP-shaped preview — shown above the Endpoint section. Lets the user see
   what URL their config resolves to, just like Postman / Swagger UI. */
function HttpEndpointPreview({ kind, cfg, workspace }) {
  if (!cfg) return null;
  const method = cfg.method || 'POST';
  const path = cfg.path || '/';
  const host = 'gateway.' + (workspace || 'workspace') + '.eventador.io';
  return (
    <div style={{
      padding: '8px 10px', marginBottom: 12,
      background: 'var(--panel2)', border: '1px solid var(--border)', borderRadius: 6,
      display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
    }}>
      <MethodBadge method={method} />
      <span className="mono" style={{ fontSize: 12, color: 'var(--text)', wordBreak: 'break-all' }}>
        https://{host}{path}
      </span>
      <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--faint)' }}>
        {kind === 'webhook' ? 'incoming webhook URL' : 'public endpoint'}
      </span>
    </div>
  );
}

/* Kafka source/sink preview. Mirrors HttpEndpointPreview so users get the
   same "this is what gets wired" feedback for broker-backed triggers. */
function KafkaPreview({ kind, cfg, workspace }) {
  if (!cfg) return null;
  const isConsumer = kind === 'kafkatrig';
  const broker = 'broker.' + (workspace || 'workspace') + '.eventador.io';
  const topic = cfg.topic || 'topic.name';
  return (
    <div style={{
      padding: '8px 10px', marginBottom: 12,
      background: 'var(--panel2)', border: '1px solid var(--border)', borderRadius: 6,
      display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
    }}>
      <span style={{
        display: 'inline-block', minWidth: 56, padding: '2px 7px', borderRadius: 4,
        background: '#3b82f6', color: '#0d1117', fontWeight: 700, fontSize: 11,
        fontFamily: 'var(--mono)', textAlign: 'center', letterSpacing: '.5px',
      }}>KAFKA</span>
      <span className="mono" style={{ fontSize: 12, color: 'var(--text)', wordBreak: 'break-all' }}>
        kafka://{broker} {isConsumer ? '·' : '→'} {topic}
      </span>
      {isConsumer && cfg.consumerGroup && (
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>
          group <span className="mono">{cfg.consumerGroup}</span>
        </span>
      )}
      <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--faint)' }}>
        {isConsumer ? 'consumer' : 'producer'}
      </span>
    </div>
  );
}

/* Outbound HTTP Request preview — same look as the trigger preview but for
   calls this flow makes OUT to other services. */
function HttpRequestPreview({ cfg }) {
  if (!cfg) return null;
  return (
    <div style={{
      padding: '8px 10px', marginBottom: 12,
      background: 'var(--panel2)', border: '1px solid var(--border)', borderRadius: 6,
      display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
    }}>
      <MethodBadge method={cfg.method || 'GET'} />
      <span className="mono" style={{ fontSize: 12, color: 'var(--text)', wordBreak: 'break-all' }}>
        {cfg.url || 'https://…'}
      </span>
      <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--faint)' }}>outbound call</span>
    </div>
  );
}

/* Schema-driven config renderer for the Designer. Replaces the giant per-kind
   switch with a typed form whose fields, defaults, validation and grouping all
   live in nodeSchema.js. PlanSpec is compiled from these typed fields at deploy. */

/* Tiny kvlist editor (Key/Value pairs) — local copy to avoid dragging in the
   Drawer-tied one from ui.jsx. */
function KvList({ value, onChange }) {
  const rows = Array.isArray(value) && value.length ? value : [{ k: '', v: '' }];
  const upd = (i, patch) => onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)).filter((_, idx, arr) => arr.length > 1 || (arr[0].k || arr[0].v) || idx === i));
  const setRow = (i, patch) => onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const add = () => onChange([...rows, { k: '', v: '' }]);
  const remove = (i) => {
    const next = rows.filter((_, idx) => idx !== i);
    onChange(next.length ? next : [{ k: '', v: '' }]);
  };
  return (
    <div className="kvlist">
      <div className="kvlist-head"><span>Key</span><span>Value</span><span /></div>
      {rows.map((r, i) => (
        <div className="kvlist-row" key={i}>
          <input placeholder="KEY" value={r.k} onChange={(e) => setRow(i, { k: e.target.value })} />
          <input placeholder="value" value={r.v} onChange={(e) => setRow(i, { v: e.target.value })} />
          <button type="button" className="addf" aria-label="Remove" onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <button type="button" className="addf" onClick={add}>＋ Add</button>
    </div>
  );
}

function StringList({ value, onChange, placeholder, addLabel }) {
  const rows = Array.isArray(value) && value.length ? value : [''];
  const setRow = (i, v) => onChange(rows.map((r, idx) => (idx === i ? v : r)));
  const add = () => onChange([...rows, '']);
  const remove = (i) => {
    const next = rows.filter((_, idx) => idx !== i);
    onChange(next.length ? next : ['']);
  };
  return (
    <div className="kvlist">
      {rows.map((v, i) => (
        <div className="kvlist-row" key={i} style={{ gridTemplateColumns: '1fr auto' }}>
          <input placeholder={placeholder || ''} value={v} onChange={(e) => setRow(i, e.target.value)} />
          <button type="button" className="addf" aria-label="Remove" onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <button type="button" className="addf" onClick={add}>＋ {addLabel || 'Add'}</button>
    </div>
  );
}

/* Resolve a field property that may be a function or a static value.
   Allows schemas to say `placeholder: (cfg) => …` for fields whose hint
   depends on a sibling field (e.g. Notification.target reacts to channel). */
function resolveProp(p, cfg, ctx) {
  return typeof p === 'function' ? p(cfg, ctx) : p;
}

/* Small ? icon with a hover/focus popover. The popover is rendered into a
   portal at <body> so the inspector's `overflow: auto` doesn't clip it; its
   position is computed from the icon's getBoundingClientRect and auto-flipped
   when there isn't room above or to the right. */
function HelpTip({ text }) {
  const [open, setOpen] = useState(false);
  const iconRef = useRef(null);
  const popRef = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0, placement: 'top' });
  useLayoutEffect(() => {
    if (!open || !iconRef.current) return;
    const ICON = iconRef.current.getBoundingClientRect();
    const POP_W = Math.min(320, window.innerWidth - 24);
    /* Measure actual height after render in next tick — fall back to estimate. */
    const measured = popRef.current ? popRef.current.getBoundingClientRect() : null;
    const POP_H = (measured && measured.height) || 80;
    /* Default: above-and-centered on the icon. Flip below if not enough room. */
    const cx = ICON.left + ICON.width / 2;
    let placement = 'top';
    let top = ICON.top - POP_H - 8;
    if (top < 8) { placement = 'bottom'; top = ICON.bottom + 8; }
    let left = cx - POP_W / 2;
    if (left < 8) left = 8;
    if (left + POP_W > window.innerWidth - 8) left = window.innerWidth - 8 - POP_W;
    setPos({ left, top, placement, width: POP_W, anchorX: cx });
  }, [open, text]);
  if (!text) return null;
  return (
    <>
      <span ref={iconRef} className="helptip" tabIndex={0} role="button" aria-label="Help"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}>?</span>
      {open && createPortal(
        <span ref={popRef} className={'helptip-pop helptip-' + pos.placement}
          style={{ left: pos.left, top: pos.top, width: pos.width }}>
          {text}
          <span className="helptip-arrow"
            style={{ left: Math.max(8, Math.min((pos.width || 260) - 16, (pos.anchorX || 0) - pos.left - 5)) }} />
        </span>,
        document.body,
      )}
    </>
  );
}

function renderField(field, value, onChange, cfg, ctx) {
  const placeholder = resolveProp(field.placeholder, cfg, ctx);
  if (field.type === 'select') {
    /* Options can be a static array OR a function(cfg, ctx) for dependent selects. */
    const rawOptions = typeof field.options === 'function'
      ? field.options(cfg, ctx)
      : (field.options || []);
    const opts = rawOptions.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
    /* When the current value isn't in the current options list (e.g. parent select
       changed and orphaned the child), show a placeholder option so the user sees
       "Pick one" instead of a wrong value. */
    const hasValue = opts.some((o) => o.value === value);
    return (
      <select value={hasValue ? value : ''} onChange={(e) => onChange(e.target.value)}>
        {!hasValue && <option value="" disabled>{opts.length === 0 ? '— no options —' : 'Pick one…'}</option>}
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }
  if (field.type === 'derived') {
    /* Read-only computed display. `field.derive(cfg, ctx)` returns the value
       to show; if `field.json` is true, render as monospace pre. */
    const derived = typeof field.derive === 'function' ? field.derive(cfg, ctx) : value;
    if (field.json) {
      return (
        <pre style={{
          margin: 0, padding: 8, fontFamily: 'var(--mono)', fontSize: 11,
          background: 'var(--panel2)', border: '1px solid var(--border)', borderRadius: 5,
          color: 'var(--text)', whiteSpace: 'pre-wrap', maxHeight: 220, overflow: 'auto',
        }}>{derived}</pre>
      );
    }
    return (
      <div style={{
        padding: '6px 10px', background: 'var(--panel2)', border: '1px solid var(--border)',
        borderRadius: 5, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)',
      }}>{derived}</div>
    );
  }
  if (field.type === 'number') {
    return (
      <input type="number" min={field.min} max={field.max} placeholder={placeholder || ''}
        value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} />
    );
  }
  if (field.type === 'textarea') {
    return (
      <textarea rows={3} placeholder={placeholder || ''}
        value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    );
  }
  if (field.type === 'toggle') {
    return (
      <label className="toggle">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
        <span className="toggle-slider" />
        <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--muted)' }}>{value ? 'on' : 'off'}</span>
      </label>
    );
  }
  if (field.type === 'kvlist') {
    return <KvList value={value || []} onChange={onChange} />;
  }
  if (field.type === 'stringlist') {
    return <StringList value={value || []} onChange={onChange}
      placeholder={placeholder} addLabel={field.addLabel} />;
  }
  /* default: text — supports an optional native `datalist` of suggestions
     (used for "topic" fields with known topics, "variable name" with known vars). */
  const suggestions = typeof field.suggestions === 'function' ? field.suggestions(cfg, ctx) : (field.suggestions || []);
  const listId = suggestions.length ? 'sug-' + field.key + '-' + Math.random().toString(36).slice(2, 6) : undefined;
  return (
    <>
      <input value={value ?? ''} placeholder={placeholder || ''}
        list={listId}
        onChange={(e) => onChange(e.target.value)} />
      {listId && (
        <datalist id={listId}>
          {suggestions.map((s) => <option key={s} value={s} />)}
        </datalist>
      )}
    </>
  );
}

/* Group fields by their declared section so the UI can render section headers.
   Fields without a section live in an unnamed leading group. */
function groupBySection(fields) {
  const out = [];
  let current = { section: null, fields: [] };
  fields.forEach((f) => {
    if (f.section && f.section !== current.section) {
      if (current.fields.length) out.push(current);
      current = { section: f.section, fields: [] };
    }
    current.fields.push(f);
  });
  if (current.fields.length) out.push(current);
  return out;
}

function NodeConfigForm({ node, onChange, onDelete, workspace, ctx }) {
  const nav = useNavigate();
  const schema = NODE_SCHEMA[node.kind];
  /* Combine kind-specific fields with the common Execution block when applicable. */
  const fields = useMemo(() => {
    if (!schema) return [];
    if (NO_EXECUTION_SECTION.has(node.kind)) return schema.fields;
    return [...schema.fields, ...EXECUTION_FIELDS];
  }, [schema, node.kind]);
  if (!schema) {
    return (
      <div className="hint" style={{ color: 'var(--warn)' }}>
        No schema defined for node kind <code>{node.kind}</code>. Falling back to default body input.
      </div>
    );
  }
  const cfg = node.config || {};
  /* Auto-derive step name from config (e.g. "POST /checkout") unless the user
     has explicitly edited it. We track `titleEdited` on the node itself so the
     decision survives renders and JSON round-trips. */
  const setField = (key, value) => {
    let next = { ...node, config: { ...cfg, [key]: value } };
    if (!node.titleEdited && typeof schema.autoTitle === 'function') {
      const derived = schema.autoTitle({ ...cfg, [key]: value });
      if (derived) next = { ...next, title: derived };
    }
    onChange(next);
  };
  const groups = groupBySection(fields);
  return (
    <div className="ncf">
      <p className="hint" style={{ marginTop: 0, marginBottom: 10 }}>
        {schema.description} {schema.doc && <span style={{ color: 'var(--faint)' }}>· {schema.doc}</span>}
      </p>
      <div className="field">
        <label>
          Step name
          <HelpTip text={
            schema.autoTitle
              ? 'Human-friendly label for this step shown on the canvas. Auto-derived from your config (e.g. "POST /checkout") until you edit it — once edited it stays locked.'
              : 'Human-friendly label for this step shown on the canvas and in logs.'
          } />
          {!node.titleEdited && schema.autoTitle && (
            <span style={{ color: 'var(--faint)', fontSize: 11, fontWeight: 400 }}>· auto</span>
          )}
        </label>
        <input value={node.title || ''}
          onChange={(e) => onChange({ ...node, title: e.target.value, titleEdited: true })} />
      </div>
      {(node.kind === 'httptrigger' || node.kind === 'webhook') && (
        <HttpEndpointPreview kind={node.kind} cfg={cfg} workspace={workspace} />
      )}
      {node.kind === 'grpc' && (
        <GrpcEndpointPreview cfg={cfg} workspace={workspace} />
      )}
      {node.kind === 'httpreq' && (
        <HttpRequestPreview cfg={cfg} />
      )}
      {(node.kind === 'kafkatrig' || node.kind === 'kafkapub') && (
        <KafkaPreview kind={node.kind} cfg={cfg} workspace={workspace} />
      )}
      {groups.map((g, gi) => (
        <div key={(g.section || 'main') + gi}>
          {g.section && <div className="section-h">{g.section}</div>}
          {g.fields.map((f) => {
            /* Conditional fields — only render when showIf(cfg) is truthy.
               Used for things like CORS sub-options that only appear when CORS is on. */
            if (typeof f.showIf === 'function' && !f.showIf(cfg, ctx)) return null;
            const value = cfg[f.key];
            const err = validateField(f, value, cfg);
            const helpText = resolveProp(f.help, cfg, ctx);
            return (
              <div className="field" key={f.key}>
                <label htmlFor={'ncf_' + f.key}>
                  {f.label}{f.required && <span style={{ color: 'var(--danger)' }}> *</span>}
                  <HelpTip text={helpText} />
                </label>
                <div id={'ncf_' + f.key}>
                  {renderField(f, value, (v) => setField(f.key, v), cfg, ctx)}
                </div>
                {f.addAction && (
                  <button type="button"
                    onClick={() => {
                      if (typeof f.addAction.onClick === 'function') f.addAction.onClick(ctx);
                      else if (f.addAction.route) nav(f.addAction.route);
                    }}
                    style={{
                      marginTop: 6, padding: 0, background: 'transparent', border: 0,
                      color: 'var(--accent)', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    }}>
                    {f.addAction.label || '+ Add new'}
                  </button>
                )}
                {err && (
                  <div style={{ marginTop: 4, fontSize: 11, color: 'var(--danger)' }}>
                    ⚠ {err}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
      {onDelete && (
        <button type="button" className="btn dng sm" onClick={onDelete} style={{ marginTop: 14 }}>
          Delete step
        </button>
      )}
    </div>
  );
}


/* ======================= src/components/CodeStudio.jsx ======================= */

/* Custom Code studio — one function node: write · compile (fn build pipeline) · test · deploy.
   Code editor is CodeMirror 6 (syntax highlighting, line numbers, bracket matching, find/replace). */
const SAMPLES = {
  Go: `package main

import (
	"context"
	"encoding/json"
	"io"
	fdk "github.com/fnproject/fdk-go"
)

func main() { fdk.Handle(fdk.HandlerFunc(handler)) }

func handler(_ context.Context, in io.Reader, out io.Writer) {
	var req struct{ Name string \`json:"name"\` }
	json.NewDecoder(in).Decode(&req)
	if req.Name == "" { req.Name = "world" }
	json.NewEncoder(out).Encode(map[string]string{"message": "Hello " + req.Name})
}`,
  Python: `import json
import fdk

async def handler(ctx, data=None):
    req = json.loads(data or "{}")
    return {"message": f"Hello {req.get('name', 'world')}"}`,
  'Node.js': `const fdk = require('@fnproject/fdk');

fdk.handle((input) => {
  return { message: 'Hello ' + (input.name || 'world') };
});`,
  WASM: `// AssemblyScript → WASM (sub-ms cold start)
function handle(input: string): string {
  const req = JSON.parse(input);
  return JSON.stringify({ message: "Hello " + (req.name || "world") });
}`,
};
const BUILD_STEPS = [
  'Validate & classify', 'Deps + SCA scan', 'BuildKit image (multi-arch)',
  'SBOM + vuln gate', 'Sign (cosign) + SLSA attest', 'Push @sha256 digest',
];

const goLang = StreamLanguage.define(go);
const extFor = (lang) => {
  if (lang === 'Python') return [python()];
  if (lang === 'Node.js') return [javascript()];
  if (lang === 'WASM') return [javascript({ typescript: true })];
  return [goLang];
};

function CodeStudio({ node, onClose, onSave, previewOnly = false }) {
  const { toast } = useApp();
  const [tab, setTab] = useState('code');
  const [lang, setLang] = useState(node.lang || 'Go');
  const [code, setCode] = useState(node.code || SAMPLES[node.lang || 'Go']);
  const [fullscreen, setFullscreen] = useState(false);
  /* ESC: exit fullscreen first if active, else close the studio. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (fullscreen) { setFullscreen(false); e.preventDefault(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);
  const [payload, setPayload] = useState('{"name":"eventador"}');
  const [step, setStep] = useState(0);
  const [building, setBuilding] = useState(false);
  const [image, setImage] = useState(node.image || null);
  const [resp, setResp] = useState(null);

  const extensions = useMemo(() => extFor(lang), [lang]);
  const lineCount = code.split('\n').length;

  const changeLang = (l) => { setLang(l); setCode(SAMPLES[l]); setImage(null); setStep(0); setResp(null); };

  const compile = () => {
    setImage(null); setBuilding(true); setStep(0);
    let i = 0;
    const tick = () => {
      i += 1; setStep(i);
      if (i < BUILD_STEPS.length) setTimeout(tick, 360);
      else {
        setBuilding(false);
        setImage('fn-' + (node.title || 'code').toLowerCase().replace(/[^a-z0-9]/g, '') + '@sha256:' + Math.random().toString(16).slice(2, 10));
        toast('Build complete — signed + attested');
      }
    };
    setTimeout(tick, 360);
  };
  const runTest = () => {
    if (!image) { setTab('build'); toast('Compile the function first', 'warn'); return; }
    let name = 'world';
    try { name = JSON.parse(payload || '{}').name || 'world'; } catch { name = '(invalid JSON)'; }
    setResp({ status: '200 · 41 ms · warm (no cold start)', body: '{"message":"Hello ' + name + '"}' });
    toast('Test invocation complete');
  };
  const deploy = () => {
    if (!image) { setTab('build'); toast('Compile before deploying', 'warn'); return; }
    onSave({ lang, code, image });
    toast('Function deployed — PlanSpec published, reconciling');
    onClose();
  };
  const reset = () => { if (window.confirm('Reset code to the ' + lang + ' template?')) setCode(SAMPLES[lang]); };

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className={'studio' + (fullscreen ? ' fullscreen' : '')}
        role="dialog" aria-modal="true" aria-label={previewOnly ? 'Function code preview' : 'Custom Code studio'}>
        <header>
          <div>
            <h3>{previewOnly ? 'Preview code — ' : 'Function — '}{node.title}</h3>
            <div className="sub">
              {previewOnly ? 'read-only · source of the linked function (ADR-0003/0014)'
                : 'write · compile · test · deploy — one function node (ADR-0003/0009/0014)'}
            </div>
          </div>
          {previewOnly ? <Badge>{lang}</Badge> : (
            <select className="select" aria-label="Language" value={lang} onChange={(e) => changeLang(e.target.value)}>
              {Object.keys(SAMPLES).map((l) => <option key={l}>{l}</option>)}
            </select>
          )}
          <button className="x" onClick={() => setFullscreen((v) => !v)}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}>
            ⛶<span style={{ marginLeft: 6, fontSize: 12 }}>{fullscreen ? 'Exit' : 'Full'}</span>
          </button>
          <button className="x" aria-label="Close" onClick={onClose}>✕</button>
        </header>
        {!previewOnly && (
          <div className="studio-tabs">
            <Tabs active={tab} onChange={setTab}
              tabs={[{ k: 'code', t: 'Code' }, { k: 'build', t: 'Build' }, { k: 'test', t: 'Test' }]} />
          </div>
        )}
        <div className="studio-body">
          {tab === 'code' && (
            <>
              <div className="studio-cm-bar">
                <span><Badge>{lang}</Badge></span>
                <span className="studio-cm-meta">{lineCount} lines · {code.length} chars{previewOnly ? ' · read-only' : ''}</span>
                <span style={{ flex: 1 }} />
                {!previewOnly && <button type="button" className="studio-cm-btn" onClick={reset} title="Replace with the language template">↺ Reset</button>}
              </div>
              <div className="studio-cm">
                <CodeMirror
                  value={code}
                  height="360px"
                  theme={oneDark}
                  extensions={extensions}
                  editable={!previewOnly}
                  onChange={(v) => !previewOnly && setCode(v)}
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    highlightActiveLine: !previewOnly,
                    highlightActiveLineGutter: !previewOnly,
                    autocompletion: !previewOnly,
                    bracketMatching: true,
                    closeBrackets: !previewOnly,
                    indentOnInput: !previewOnly,
                    tabSize: 2,
                  }}
                />
              </div>
              <p className="hint">{lang} · FDK-based function.
                {previewOnly
                  ? ' Source of the linked function from the registry — edit in the Functions page.'
                  : <> Inline glue stays in the engine; this compiles to a signed container (ADR-0003). Shortcuts: <kbd>Cmd/Ctrl+F</kbd> search · <kbd>Cmd/Ctrl+/</kbd> comment · <kbd>Cmd/Ctrl+D</kbd> add cursor.</>}
              </p>
            </>
          )}
          {tab === 'build' && (
            <>
              <p className="hint" style={{ marginTop: 0 }}>The Build Service compiles your source to a
                signed, attested, content-addressed image — the fn build pipeline (ADR-0009).</p>
              <div className="build-steps">
                {BUILD_STEPS.map((s, idx) => {
                  const n = idx + 1;
                  const state = image ? 'done' : step > n ? 'done' : step === n ? 'active' : '';
                  return (
                    <div className={'build-step ' + state} key={s}>
                      <span className="bs-dot">{state === 'done' ? '✓' : state === 'active' ? '●' : n}</span>{s}
                    </div>
                  );
                })}
              </div>
              {image && <div className="note" style={{ marginTop: 12 }}>
                Built <span className="mono">{image}</span> · multi-arch · cosign-signed · SLSA-attested · verify-at-deploy.
              </div>}
              <Btn kind="pri" disabled={building} style={{ marginTop: 12 }} onClick={compile}>
                {building ? 'Compiling…' : image ? 'Recompile' : 'Compile function'}
              </Btn>
            </>
          )}
          {tab === 'test' && (
            <>
              <div className="field"><label>Test payload (JSON)</label>
                <textarea rows={3} value={payload} onChange={(e) => setPayload(e.target.value)} /></div>
              <Btn kind="pri" onClick={runTest}>▶ Run test invocation</Btn>
              {resp && <div className="note" style={{ marginTop: 12 }}>
                <b>{resp.status}</b><br /><span className="mono">{resp.body}</span>
              </div>}
              {!image && <p className="hint">Compile the function on the Build tab before testing.</p>}
            </>
          )}
        </div>
        <footer>
          <span className="studio-stat">
            {image ? <><Badge>built</Badge><span className="mono">{image}</span></> : <Badge>not built</Badge>}
          </span>
          <span style={{ flex: 1 }} />
          <Btn onClick={onClose}>{previewOnly ? 'Close' : 'Cancel'}</Btn>
          {!previewOnly && <Btn kind="pri" onClick={deploy}>Deploy function →</Btn>}
        </footer>
      </div>
    </>
  );
}


/* ======================= src/components/DesignerCanvas.jsx ======================= */

/* Card-based flow canvas — typed node cards + SVG wires.
   - Drag a card to move it
   - Click to select it
   - Drag from a node's RIGHT port (output) to another node's LEFT port (input) to connect
   - Click an existing wire to disconnect
   - Status dot/border reflects validation (ok/warn/error) from `nodeStatus`.
   - Zoom: Cmd/Ctrl + wheel, + / − / 0 keys, or toolbar buttons
   - Pan:  hold Space and drag, or use scrollbars
   - Fit:  press F or click the Fit button — frames every node */

const W = 188;
const MID = 35;
const NODE_H = 70;   /* approximate visual height of a card */
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 1.2;

function wire(a, b) {
  const x1 = a.x + W, y1 = a.y + MID, x2 = b.x, y2 = b.y + MID;
  const mx = (x1 + x2) / 2;
  return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
}

/* Same shape but the endpoints are arbitrary points (for the drag-preview wire). */
function wirePoints(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2;
  return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
}

/* Trigger nodes only emit (no input); Output nodes only receive (no output).
   Inline + Code nodes have both. Lets us validate connect attempts immediately. */
const TRIGGER_KINDS = new Set(['httptrigger', 'grpc', 'kafkatrig', 'webhook', 'cron', 'manual']);
const TERMINAL_KINDS = new Set(['return', 'httpresp']);

function canEmit(node) { return !TERMINAL_KINDS.has(node.kind); }
function canReceive(node) { return !TRIGGER_KINDS.has(node.kind); }

/* Compute the bounding box of all nodes — used by fit-to-content. */
function bbox(nodes) {
  if (!nodes.length) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach((n) => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + W);
    maxY = Math.max(maxY, n.y + NODE_H);
  });
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

const DesignerCanvas = forwardRef(function DesignerCanvas({
  nodes, edges, selected, onSelect, onMove, onConnect, onDisconnect,
  onNodeContext, onWireContext, onBgContext,
  KIND, fnLookup, nodeStatus,
}, apiRef) {
  /* canvas inner grows with the actual node layout (no fixed empty area) */
  const innerW = Math.max(800, ...nodes.map((n) => n.x + W + 80));
  const innerH = Math.max(440, ...nodes.map((n) => n.y + 140));
  const innerRef = useRef(null);
  const scrollRef = useRef(null);
  const zoomRef = useRef(1); /* mirror of state for handlers without rerender chain */
  const [zoom, setZoomState] = useState(1);
  const setZoom = useCallback((z) => {
    const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
    zoomRef.current = clamped;
    setZoomState(clamped);
  }, []);
  /* viewport state (scroll position + dims) for the minimap */
  const [vp, setVp] = useState({ x: 0, y: 0, w: 0, h: 0 });
  /* drag-to-connect transient state */
  const [drag, setDrag] = useState(null); // { fromId, x, y }
  /* space-held pan state */
  const [spaceDown, setSpaceDown] = useState(false);

  /* Keep viewport rect in sync with scroll for the minimap. */
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const sync = () => setVp({
      x: sc.scrollLeft, y: sc.scrollTop,
      w: sc.clientWidth, h: sc.clientHeight,
    });
    sync();
    sc.addEventListener('scroll', sync);
    const ro = new ResizeObserver(sync);
    ro.observe(sc);
    return () => { sc.removeEventListener('scroll', sync); ro.disconnect(); };
  }, []);

  /* Cmd/Ctrl + wheel zoom, anchored on the cursor. */
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const onWheel = (e) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      const rect = sc.getBoundingClientRect();
      const cx = e.clientX - rect.left + sc.scrollLeft;
      const cy = e.clientY - rect.top + sc.scrollTop;
      const z0 = zoomRef.current;
      const z1 = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX,
        e.deltaY < 0 ? z0 * ZOOM_STEP : z0 / ZOOM_STEP));
      /* Keep the canvas point under the cursor stationary. */
      const k = z1 / z0;
      sc.scrollLeft = cx * k - (e.clientX - rect.left);
      sc.scrollTop  = cy * k - (e.clientY - rect.top);
      zoomRef.current = z1;
      setZoomState(z1);
    };
    sc.addEventListener('wheel', onWheel, { passive: false });
    return () => sc.removeEventListener('wheel', onWheel);
  }, []);

  /* Keyboard: +/-/0 zoom, F fit, Space hold for pan. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.target && e.target.isContentEditable) return;
      if (e.code === 'Space' && !e.repeat) { setSpaceDown(true); e.preventDefault(); return; }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '+' || e.key === '=') { setZoom(zoomRef.current * ZOOM_STEP); e.preventDefault(); }
      else if (e.key === '-' || e.key === '_') { setZoom(zoomRef.current / ZOOM_STEP); e.preventDefault(); }
      else if (e.key === '0') { setZoom(1); e.preventDefault(); }
      else if (e.key === 'f' || e.key === 'F') { fitToContent(); e.preventDefault(); }
    };
    const onUp = (e) => { if (e.code === 'Space') setSpaceDown(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Fit every node into the visible viewport. Chooses zoom + scroll so the
     bounding box fills ~90% of the viewport. */
  const fitToContent = useCallback(() => {
    const sc = scrollRef.current;
    if (!sc || !nodes.length) return;
    const box = bbox(nodes);
    const pad = 60;
    const availW = sc.clientWidth - pad * 2;
    const availH = sc.clientHeight - pad * 2;
    if (availW <= 0 || availH <= 0) return;
    const z = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.min(availW / box.w, availH / box.h, 1)));
    zoomRef.current = z;
    setZoomState(z);
    /* Wait a frame so the new inner size applies before scrolling. */
    requestAnimationFrame(() => {
      const cx = (box.minX + box.w / 2) * z;
      const cy = (box.minY + box.h / 2) * z;
      sc.scrollTo({
        left: Math.max(0, cx - sc.clientWidth / 2),
        top:  Math.max(0, cy - sc.clientHeight / 2),
        behavior: 'smooth',
      });
    });
  }, [nodes, setZoom]);

  /* Expose imperative API (used by the toolbar Fit button). */
  useImperativeHandle(apiRef, () => ({
    fit: fitToContent,
    zoomIn: () => setZoom(zoomRef.current * ZOOM_STEP),
    zoomOut: () => setZoom(zoomRef.current / ZOOM_STEP),
    resetZoom: () => setZoom(1),
    getZoom: () => zoomRef.current,
  }), [fitToContent, setZoom]);

  const onCardDown = (e, node) => {
    e.stopPropagation();
    if (spaceDown) return; /* let bg pan take over */
    const z = zoomRef.current;
    const s = { mx: e.clientX, my: e.clientY, nx: node.x, ny: node.y, moved: false };
    const mv = (ev) => {
      const dx = (ev.clientX - s.mx) / z, dy = (ev.clientY - s.my) / z;
      if (Math.abs(dx) + Math.abs(dy) > 4) s.moved = true;
      if (s.moved) onMove(node.id, Math.max(8, s.nx + dx), Math.max(8, s.ny + dy));
    };
    const up = () => {
      window.removeEventListener('mousemove', mv);
      window.removeEventListener('mouseup', up);
      if (!s.moved) onSelect(node.id);
    };
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseup', up);
  };

  /* Start dragging a wire from a node's right (output) port. */
  const onPortDown = (e, node) => {
    e.stopPropagation();
    e.preventDefault();
    if (!canEmit(node)) return;
    const inner = innerRef.current;
    if (!inner) return;
    const rect = inner.getBoundingClientRect();
    const z = zoomRef.current;
    const startX = node.x + W;
    const startY = node.y + MID;
    setDrag({ fromId: node.id, fromX: startX, fromY: startY, x: startX, y: startY });
    const mv = (ev) => {
      const x = (ev.clientX - rect.left) / z;
      const y = (ev.clientY - rect.top) / z;
      setDrag((d) => (d ? { ...d, x, y } : null));
    };
    const up = (ev) => {
      window.removeEventListener('mousemove', mv);
      window.removeEventListener('mouseup', up);
      /* Resolve target — element under cursor that is a left input port */
      const t = document.elementFromPoint(ev.clientX, ev.clientY);
      if (t && t.classList && t.classList.contains('fnode-port') && t.classList.contains('l')) {
        const toId = t.getAttribute('data-node-id');
        if (toId) {
          const target = nodes.find((n) => n.id === toId);
          if (target && canReceive(target) && onConnect) onConnect(node.id, toId);
        }
      }
      setDrag(null);
    };
    window.addEventListener('mousemove', mv);
    window.addEventListener('mouseup', up);
  };

  const onWireClick = (e, edge) => {
    e.stopPropagation();
    if (onDisconnect) onDisconnect(edge[0], edge[1]);
  };

  const bgDown = (e) => {
    const isBg = e.target.classList.contains('dz-canvas')
      || e.target.classList.contains('dz-canvas-inner')
      || e.target.classList.contains('dz-canvas-sizer');
    /* Space-held drag pans the scroll viewport. */
    if (spaceDown && (isBg || e.button === 1)) {
      e.preventDefault();
      const sc = scrollRef.current;
      const s = { mx: e.clientX, my: e.clientY, sx: sc.scrollLeft, sy: sc.scrollTop };
      const mv = (ev) => {
        sc.scrollLeft = s.sx - (ev.clientX - s.mx);
        sc.scrollTop  = s.sy - (ev.clientY - s.my);
      };
      const up = () => {
        window.removeEventListener('mousemove', mv);
        window.removeEventListener('mouseup', up);
      };
      window.addEventListener('mousemove', mv);
      window.addEventListener('mouseup', up);
      return;
    }
    if (isBg) onSelect(null);
  };
  const bgContext = (e) => {
    if (!onBgContext) return;
    const isBg = e.target.classList.contains('dz-canvas')
      || e.target.classList.contains('dz-canvas-inner')
      || e.target.classList.contains('dz-canvas-sizer');
    if (isBg) {
      e.preventDefault();
      const inner = innerRef.current;
      const rect = inner ? inner.getBoundingClientRect() : { left: 0, top: 0 };
      const z = zoomRef.current;
      onBgContext(e.clientX, e.clientY,
        (e.clientX - rect.left) / z,
        (e.clientY - rect.top) / z);
    }
  };

  const zoomPct = Math.round(zoom * 100);

  /* Minimap geometry — scaled bounding box of all nodes + viewport rect. */
  const mini = (() => {
    if (!nodes.length) return null;
    const box = bbox(nodes);
    const padW = 80, padH = 80;
    const fullW = box.w + padW * 2;
    const fullH = box.h + padH * 2;
    const MM_W = 160, MM_H = 100;
    const s = Math.min(MM_W / fullW, MM_H / fullH);
    return {
      MM_W, MM_H, s,
      offX: -box.minX + padW,
      offY: -box.minY + padH,
      box,
    };
  })();

  return (
    <div className="dz-canvas-wrap">
      <div className="dz-canvas"
        ref={scrollRef}
        onMouseDown={bgDown}
        onContextMenu={bgContext}
        style={{ cursor: spaceDown ? 'grab' : undefined }}>
        <div className="dz-canvas-sizer"
          style={{ width: innerW * zoom, height: innerH * zoom, position: 'relative' }}>
          <div className="dz-canvas-inner" ref={innerRef}
            style={{
              width: innerW, height: innerH,
              transform: `scale(${zoom})`, transformOrigin: '0 0',
            }}>
          <svg className="dz-wires" width={innerW} height={innerH}>
            {edges.map((e, i) => {
              const a = nodes.find((z) => z.id === e[0]);
              const b = nodes.find((z) => z.id === e[1]);
              if (!a || !b) return null;
              return (
                <g key={i} className="dz-wire-g">
                  {/* Wider invisible hit area for easier click-to-delete */}
                  <path className="dz-wire-hit" d={wire(a, b)}
                    onClick={(ev) => onWireClick(ev, e)}
                    onContextMenu={(ev) => {
                      if (!onWireContext) return;
                      ev.preventDefault(); ev.stopPropagation();
                      onWireContext(ev.clientX, ev.clientY, e);
                    }} />
                  <path className="dz-wire" d={wire(a, b)} />
                </g>
              );
            })}
            {drag && (
              <path className="dz-wire dz-wire-preview"
                d={wirePoints(drag.fromX, drag.fromY, drag.x, drag.y)} />
            )}
          </svg>
          {nodes.map((n) => {
            const k = KIND[n.kind] || KIND.code;
            const linkedFn = n.kind === 'code' && n.fnId && fnLookup ? fnLookup(n.fnId) : null;
            const bodyText = linkedFn
              ? linkedFn.Image
              : (n.kind === 'code' && !n.fnId ? '⚠ pick a function' : n.body);
            const titleText = linkedFn ? linkedFn.Function : n.title;
            const subType = linkedFn ? 'Function · ' + linkedFn['Runtime/FDK'] : k.t;
            const status = (nodeStatus && nodeStatus[n.id]) || { kind: 'ok' };
            const dotColor = status.kind === 'error' ? 'var(--danger)'
              : status.kind === 'warn' ? 'var(--warn)' : 'var(--ok)';
            const dotShadow = status.kind === 'error' ? '0 0 6px rgba(220,80,80,.7)'
              : status.kind === 'warn' ? '0 0 6px rgba(240,160,32,.7)'
              : '0 0 6px rgba(63,185,80,.6)';
            const dotTitle = status.message || (status.kind === 'ok' ? 'healthy' : status.kind);
            const showLeftPort = canReceive(n);
            const showRightPort = canEmit(n);
            const openContext = (e) => {
              if (!onNodeContext) return;
              e.preventDefault(); e.stopPropagation();
              onSelect(n.id);
              onNodeContext(e.clientX, e.clientY, n);
            };
            return (
              <div key={n.id}
                className={'fnode' + (selected === n.id ? ' sel' : '')
                  + (n.kind === 'code' && !n.fnId ? ' unlinked' : '')
                  + (status.kind === 'error' ? ' fnode-err' : '')
                  + (status.kind === 'warn' ? ' fnode-warn' : '')}
                style={{ left: n.x, top: n.y }}
                onMouseDown={(e) => onCardDown(e, n)}
                onContextMenu={openContext}>
                {showLeftPort && (
                  <span className="fnode-port l" data-node-id={n.id}
                    title="Input — drop a connection here" />
                )}
                {showRightPort && (
                  <span className="fnode-port r" data-node-id={n.id}
                    title="Output — drag to another step's input"
                    onMouseDown={(e) => onPortDown(e, n)} />
                )}
                <div className="fnode-h">
                  <span className="fnode-ic" style={{ background: k.c }}>{k.i}</span>
                  <span className="fnode-meta">
                    <span className="fnode-title">{titleText}</span>
                    <span className="fnode-type">{subType}</span>
                  </span>
                  <span className="fnode-dot" title={dotTitle}
                    style={{ background: dotColor, boxShadow: dotShadow }} />
                  {onNodeContext && (
                    <button type="button" className="fnode-kebab"
                      aria-label="Actions"
                      title="Actions (right-click for full menu)"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={openContext}>⋯</button>
                  )}
                </div>
                <div className="fnode-b">{bodyText}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
      {/* Zoom toolbar — bottom-right floating */}
      <div className="dz-zoom" onMouseDown={(e) => e.stopPropagation()}>
        <button type="button" className="dz-zoom-btn"
          title="Zoom out (−)" onClick={() => setZoom(zoomRef.current / ZOOM_STEP)}>−</button>
        <button type="button" className="dz-zoom-pct"
          title="Reset zoom (0)" onClick={() => setZoom(1)}>{zoomPct}%</button>
        <button type="button" className="dz-zoom-btn"
          title="Zoom in (+)" onClick={() => setZoom(zoomRef.current * ZOOM_STEP)}>+</button>
        <span className="dz-zoom-div" />
        <button type="button" className="dz-zoom-btn wide"
          title="Fit to content (F)" onClick={fitToContent}>⊡ Fit</button>
      </div>
      {/* Minimap — bottom-left floating */}
      {mini && (
        <div className="dz-minimap" onMouseDown={(e) => {
          /* Click on the minimap recenters the viewport on that canvas point. */
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          const mx = e.clientX - rect.left, my = e.clientY - rect.top;
          const cx = (mx / mini.s - mini.offX);
          const cy = (my / mini.s - mini.offY);
          const sc = scrollRef.current;
          if (!sc) return;
          sc.scrollTo({
            left: Math.max(0, cx * zoom - sc.clientWidth / 2),
            top:  Math.max(0, cy * zoom - sc.clientHeight / 2),
            behavior: 'smooth',
          });
        }} style={{ width: mini.MM_W, height: mini.MM_H }}>
          {nodes.map((n) => (
            <span key={n.id} className={'dz-minimap-node' + (selected === n.id ? ' sel' : '')}
              style={{
                left: (n.x + mini.offX) * mini.s,
                top:  (n.y + mini.offY) * mini.s,
                width:  Math.max(3, W * mini.s),
                height: Math.max(2, NODE_H * mini.s),
              }} />
          ))}
          {/* Viewport rect — shows what slice the canvas is currently displaying. */}
          {vp.w > 0 && (
            <span className="dz-minimap-vp" style={{
              left: ((vp.x / zoom) + mini.offX) * mini.s,
              top:  ((vp.y / zoom) + mini.offY) * mini.s,
              width:  (vp.w / zoom) * mini.s,
              height: (vp.h / zoom) * mini.s,
            }} />
          )}
        </div>
      )}
      {/* Space-to-pan hint */}
      {spaceDown && (
        <div className="dz-pan-hint">↔ panning</div>
      )}
    </div>
  );
});



/* ======================= src/components/FlowCanvas.jsx ======================= */

const DEFAULT_NODES = [
  { id: 'httpin', t: 'trig', x: 24, y: 181, l: 'HTTP In', s: '/v1/charge' },
  { id: 'auth', t: 'inl', x: 214, y: 181, l: 'API Auth', s: 'key + scope' },
  { id: 'sw', t: 'inl', x: 404, y: 181, l: 'Switch', s: 'by amount' },
  { id: 'xform', t: 'inl', x: 600, y: 92, l: 'Transform', s: 'normalise' },
  { id: 'risk', t: 'cont', x: 600, y: 270, l: 'Risk Score', s: 'container' },
  { id: 'join', t: 'par', x: 800, y: 181, l: 'Join', s: 'barrier' },
  { id: 'resp', t: 'sink', x: 990, y: 181, l: 'HTTP Resp', s: '200 / 4xx' },
];
const DEFAULT_EDGES = [['httpin', 'auth'], ['auth', 'sw'], ['sw', 'xform'], ['sw', 'risk'], ['xform', 'join'], ['risk', 'join'], ['join', 'resp']];
const HEAT = { risk: 'hot', sw: 'warm', join: 'warm' };

const path = (a, b) => {
  const x1 = a.x + 150, y1 = a.y + 29, x2 = b.x, y2 = b.y + 29, mx = (x1 + x2) / 2;
  return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
};

function FlowCanvas({ nodes = DEFAULT_NODES, edges = DEFAULT_EDGES, heat, selected, onSelect, onBg, ping }) {
  const nd = (id) => nodes.find((n) => n.id === id);
  const bgClick = (e) => { if (e.target.tagName === 'svg' && onBg) onBg(); };
  return (
    <div className="canvas" style={{ height: heat ? 420 : '100%' }}>
      <svg viewBox="0 0 1180 420" preserveAspectRatio="xMidYMid meet" onClick={bgClick}>
        {edges.map((e, i) => {
          const a = nd(e[0]); const b = nd(e[1]); if (!a || !b) return null;
          return <path key={i} className={cx('wire', !heat && e[0] === 'risk' && e[1] === 'join' && 'flow')} d={path(a, b)} />;
        })}
        {nodes.map((n) => (
          <g key={n.id}
            className={cx('nd', n.t, heat && (HEAT[n.id] || 'cool'), !heat && selected === n.id && 'sel', ping === n.id && 'ping')}
            onClick={() => onSelect && onSelect(n.id)}>
            <rect x={n.x} y={n.y} width="150" height="58" rx="9" />
            <text x={n.x + 14} y={n.y + 25}>{n.l}</text>
            <text className="st" x={n.x + 14} y={n.y + 43}>{n.s}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}


/* ======================= src/components/FunctionCreateModal.jsx ======================= */

/* Function CREATE modal — Variant B (Progressive Disclosure, industry standard).
   Quick mode shows 5 essential field groups; "Show advanced" toggle reveals 12 more.
   Live human-readable summary replaces YAML preview (YAML lives on the Function
   detail behind a dedicated button). EDIT uses FunctionEditModal. */

function FunctionCreateModal({ workspace, onClose, onCreated }) {
  const { db, createFunction } = useApp();
  const wsFns = db.functions.filter((f) => f.Workspace === workspace);
  const wsFlows = db.flows.filter((f) => f.Workspace === workspace);
  const nameTaken = useMemo(() => new Set(wsFns.map((f) => f.Function)), [wsFns]);

  /* ─── Quick mode fields ─── */
  const [name, setName] = useState('');
  const [flowName, setFlowName] = useState('—');
  const [image, setImage] = useState('');
  const [memory, setMemory] = useState(128);
  const [timeoutSec, setTimeoutSec] = useState(30);
  const [presetKey, setPresetKey] = useState('always');
  const [scaling, setScaling] = useState({ ...PRESETS.always.set });
  const applyPreset = (key) => { setPresetKey(key); setScaling({ ...PRESETS[key].set }); };
  const setScale = (patch) => setScaling((s) => ({ ...s, ...patch }));

  /* ─── Advanced fields (sensible defaults) ─── */
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [description, setDescription] = useState('');
  const [tier, setTier] = useState('Docker');
  const [fdk, setFdk] = useState('fdk-go');
  const [idleTimeoutSec, setIdleTimeoutSec] = useState(30);
  const [config, setConfig] = useState([{ k: '', v: '' }]);
  useEffect(() => {
    const opts = TIER_FDK[tier] || [];
    if (!opts.includes(fdk)) setFdk(opts[0] || '');
  }, [tier]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Derived ─── */
  const parentFlow = flowName === '—' ? null : wsFlows.find((f) => f.Flow === flowName);
  const inhEnvKeys = parentFlow && Array.isArray(parentFlow.env) ? parentFlow.env.map((e) => e.k) : [];
  const inhSecNames = parentFlow && Array.isArray(parentFlow.secrets) ? parentFlow.secrets.map((s) => s.Name) : [];
  const conflictKeys = useMemo(() => new Set(inhEnvKeys), [inhEnvKeys.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
  const flowTriggerIsKafka = parentFlow && /kafka/i.test(parentFlow.Trigger || '');
  const tMeta = THRESHOLD_META[scaling.trigger];
  const triggerInfo = TRIGGERS.find((t) => t.value === scaling.trigger);

  /* ─── Validation ─── */
  const errs = validateForm({ scaling, image, memory, timeoutSec, idleTimeoutSec, config, flowTriggerIsKafka });
  if (!name) errs.name = 'required';
  else if (!NAME_RE.test(name)) errs.name = 'lowercase, alphanumeric+hyphens, 1–30 chars, must start with a letter';
  else if (nameTaken.has(name)) errs.name = 'a function named "' + name + '" already exists in this workspace';
  const warns = softWarnings({ scaling });

  /* ─── Live summary ─── */
  const summary = useMemo(() => buildSummary({
    name, tier, fdk, memory, timeoutSec, image, scaling, flowName,
  }), [name, tier, fdk, memory, timeoutSec, image, scaling, flowName]);

  /* ─── Submit ─── */
  const canSave = Object.keys(errs).length === 0;
  const submit = () => {
    if (!canSave) return;
    const fnPath = (flowName === '—' ? 'standalone' : flowName) + '/' + name;
    const id = createFunction({
      workspace, flow: flowName === '—' ? '' : flowName, name,
      image: image || null,
      memory, timeoutSec, idleTimeoutSec,
      config: config.filter((r) => r.k),
      scaling: buildScalingPayload(scaling, fnPath),
      runtimeTier: tier, fdkLang: fdk,
      description: description || ('Function ' + name),
    });
    onCreated && onCreated(id);
    onClose();
  };

  /* ─── Escape closes ─── */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  /* ─── Render ──────────────────────────────────────────────────────── */
  const fdkOptions = TIER_FDK[tier] || [];
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" style={{ width: 'min(680px, 96vw)' }}>
        <header>
          <div>
            <h3>Create Function</h3>
            <div className="sub">workspace · {workspace}</div>
          </div>
          <button className="x" aria-label="Close" onClick={onClose}>✕</button>
        </header>

        <div className="body">
          {/* ── 1. Identity ── */}
          <div className="section-h">Identity</div>
          <div className="field">
            <label>Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. risk-score"
              style={errs.name ? { borderColor: 'var(--danger)' } : null} />
            {errs.name
              ? <ErrLine msg={errs.name} />
              : <div className="hint">lowercase letters, digits, hyphens · 1–30 chars · unique in workspace</div>}
          </div>
          <div className="field">
            <label>Flow</label>
            <select value={flowName} onChange={(e) => setFlowName(e.target.value)}>
              <option value="—">Standalone (no parent flow)</option>
              {wsFlows.map((f) => {
                const e = (f.env || []).length, s = (f.secrets || []).length;
                return <option key={f.id} value={f.Flow}>{f.Flow} · {f.Trigger} ({e} env, {s} secrets)</option>;
              })}
            </select>
          </div>

          {/* ── 2. Image ── */}
          <div className="section-h">Image</div>
          <div className="field">
            <label>Image</label>
            <input value={image} onChange={(e) => setImage(e.target.value)}
              placeholder="repo/name@sha256:… or repo/name:tag — empty to build later"
              style={errs.image ? { borderColor: 'var(--danger)' } : null} />
            {errs.image
              ? <ErrLine msg={errs.image} />
              : <div className="hint">
                  {image ? 'OCI image ref. Signed & attested at deploy (ADR-0009).'
                         : <>Empty → function created in <Badge>pending build</Badge> state.</>}
                </div>}
          </div>

          {/* ── 3. Resources ── */}
          <div className="section-h">Resources</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="field">
              <label>Memory (MB) <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input type="number" min={32} max={8192} value={memory}
                onChange={(e) => setMemory(Number(e.target.value))}
                style={errs.memory ? { borderColor: 'var(--danger)' } : null} />
              <ErrLine msg={errs.memory} />
            </div>
            <div className="field">
              <label>Timeout (s) <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input type="number" min={1} max={300} value={timeoutSec}
                onChange={(e) => setTimeoutSec(Number(e.target.value))}
                style={errs.timeoutSec ? { borderColor: 'var(--danger)' } : null} />
              <ErrLine msg={errs.timeoutSec} />
            </div>
          </div>

          {/* ── 4. Scaling presets ── */}
          <div className="section-h">Scaling</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {Object.entries(PRESETS).map(([k, p]) => (
              <PresetCard key={k} active={presetKey === k} preset={p} onClick={() => applyPreset(k)} />
            ))}
          </div>
          {showAdvanced ? null : (
            <div className="hint" style={{ marginTop: -4 }}>
              Trigger: <b>{triggerInfo ? triggerInfo.label : '—'}</b> @ threshold <b className="mono">{scaling.threshold}</b>
              {scaling.min === 0 && <> · activation <b className="mono">{scaling.activation}</b></>}
            </div>
          )}

          {warns.length > 0 && (
            <div className="note" style={{ marginTop: 8 }}>
              {warns.map((w, i) => <div key={i}>⚠ {w}</div>)}
            </div>
          )}

          {/* ── 5. Summary ── */}
          <div className="section-h">Summary</div>
          <div className="note" style={{
            marginTop: 0, whiteSpace: 'pre-line', fontSize: 12, lineHeight: 1.55,
            background: 'var(--panel2)', borderLeft: '3px solid var(--accent)',
          }}>
            {summary}
          </div>

          {/* ── Advanced toggle ── */}
          <button type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            style={{
              marginTop: 14, width: '100%', padding: '8px 12px',
              border: '1px dashed var(--border)', background: 'transparent',
              color: 'var(--accent)', borderRadius: 6, cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
            }}>
            {showAdvanced ? '⌃ Hide advanced settings' : '⌄ Show advanced settings (12 more fields)'}
          </button>

          {/* ── Advanced section ── */}
          {showAdvanced && (
            <>
              <div className="section-h" style={{ marginTop: 16 }}>Identity (advanced)</div>
              <div className="field">
                <label>Description</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder={name ? 'Function ' + name + ' (auto)' : 'short description (auto if empty)'} />
                <div className="hint">If empty, defaults to "Function {'{name}'}".</div>
              </div>
              <div className="field">
                <label>Format <span style={{ color: 'var(--faint)' }}>· read-only</span></label>
                <div><Badge>http-stream · fn-format ABI (ADR-0014)</Badge></div>
                <div className="hint">All functions use http-stream — the only ABI we support.</div>
              </div>

              <div className="section-h">Runtime</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field">
                  <label>Runtime tier</label>
                  <select value={tier} onChange={(e) => setTier(e.target.value)}>
                    <option value="Docker">Docker</option>
                    <option value="Firecracker">Firecracker (~125ms)</option>
                    <option value="WASM">WASM (sub-ms)</option>
                  </select>
                  <div className="hint">ADR-0015. Constrains FDK below.</div>
                </div>
                <div className="field">
                  <label>FDK language</label>
                  <select value={fdk} onChange={(e) => setFdk(e.target.value)}>
                    {fdkOptions.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Idle timeout (s)</label>
                <input type="number" min={1} max={3600} value={idleTimeoutSec}
                  onChange={(e) => setIdleTimeoutSec(Number(e.target.value))}
                  style={errs.idleTimeoutSec ? { borderColor: 'var(--danger)' } : null} />
                {errs.idleTimeoutSec
                  ? <ErrLine msg={errs.idleTimeoutSec} />
                  : <div className="hint">Container scaled to 0 after this many idle seconds.</div>}
              </div>

              <div className="section-h">Scaling (override)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field">
                  <label>Min replicas</label>
                  <input type="number" min={0} max={100} value={scaling.min}
                    onChange={(e) => setScale({ min: Number(e.target.value) })}
                    style={errs.min ? { borderColor: 'var(--danger)' } : null} />
                  <ErrLine msg={errs.min} />
                </div>
                <div className="field">
                  <label>Max replicas</label>
                  <input type="number" min={1} max={1000} value={scaling.max}
                    onChange={(e) => setScale({ max: Number(e.target.value) })}
                    style={errs.max ? { borderColor: 'var(--danger)' } : null} />
                  <ErrLine msg={errs.max} />
                </div>
                <div className="field">
                  <label>Cooldown (s)</label>
                  <input type="number" min={30} max={3600} value={scaling.cooldown}
                    onChange={(e) => setScale({ cooldown: Number(e.target.value) })} />
                </div>
                <div className="field">
                  <label>Polling interval (s)</label>
                  <input type="number" min={1} max={300} value={scaling.polling}
                    onChange={(e) => setScale({ polling: Number(e.target.value) })} />
                </div>
              </div>

              <div className="field">
                <label>Primary trigger</label>
                <select value={scaling.trigger} onChange={(e) => setScale({ trigger: e.target.value })}>
                  {TRIGGERS.map((t) => {
                    const disabled = t.kind === 'kafka' && !flowTriggerIsKafka;
                    return <option key={t.value} value={t.value} disabled={disabled}>
                      {t.label}{disabled ? ' (Flow not Kafka-triggered)' : ''}
                    </option>;
                  })}
                </select>
                {errs.trigger
                  ? <ErrLine msg={errs.trigger} />
                  : <div className="hint">What signal triggers scale-up.</div>}
              </div>
              <div className="field">
                <label>Trigger threshold</label>
                <input value={scaling.threshold}
                  placeholder={tMeta ? tMeta.placeholder : ''}
                  onChange={(e) => setScale({ threshold: e.target.value })}
                  style={errs.threshold ? { borderColor: 'var(--danger)' } : null} />
                {errs.threshold
                  ? <ErrLine msg={errs.threshold} />
                  : <div className="hint">{tMeta ? tMeta.help : '—'}</div>}
              </div>
              {scaling.min === 0 && (
                <div className="field">
                  <label>Activation threshold</label>
                  <input type="number" min={1} value={scaling.activation}
                    onChange={(e) => setScale({ activation: Number(e.target.value) })}
                    style={errs.activation ? { borderColor: 'var(--danger)' } : null} />
                  {errs.activation
                    ? <ErrLine msg={errs.activation} />
                    : <div className="hint">Signal required to wake from 0 → 1 replica.</div>}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field">
                  <label>Scale-up policy</label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="number" value={scaling.upPct} min={1} max={1000}
                      onChange={(e) => setScale({ upPct: Number(e.target.value) })} style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>% every</span>
                    <input type="number" value={scaling.upPer} min={1} max={600}
                      onChange={(e) => setScale({ upPer: Number(e.target.value) })} style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>s</span>
                  </div>
                  <div className="hint">Spec default: 200% / 15s.</div>
                </div>
                <div className="field">
                  <label>Scale-down policy</label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="number" value={scaling.dnPct} min={1} max={100}
                      onChange={(e) => setScale({ dnPct: Number(e.target.value) })} style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>% every</span>
                    <input type="number" value={scaling.dnPer} min={1} max={3600}
                      onChange={(e) => setScale({ dnPer: Number(e.target.value) })} style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>s</span>
                  </div>
                  <div className="hint">Spec default: 25% / 60s (anti-flap).</div>
                </div>
              </div>

              <div className="section-h">Configuration</div>
              {flowName !== '—' && (
                <div className="field">
                  <label>Inherited from Flow <b>{flowName}</b> <span style={{ color: 'var(--faint)' }}>· read-only</span></label>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {inhEnvKeys.length === 0 && inhSecNames.length === 0 ? (
                      <span className="hint" style={{ margin: 0 }}>Flow has no env or secrets yet.</span>
                    ) : (
                      <>
                        {inhEnvKeys.map((k) => <Badge key={'e_' + k}>{k}</Badge>)}
                        {inhSecNames.map((k) => <Badge key={'s_' + k}>🔒 {k}</Badge>)}
                      </>
                    )}
                  </div>
                  <div className="hint">Auto-merged at deploy. Function Config (below) wins on key collision.</div>
                </div>
              )}
              {flowName === '—' && (
                <div className="note" style={{ marginTop: 0, marginBottom: 10 }}>
                  Standalone — no inheritance. Only Config and own Secrets apply at runtime.
                </div>
              )}
              <div className="field">
                <label>Config (own env vars)</label>
                <KvListWithValidation rows={config} onChange={setConfig} conflictKeys={conflictKeys} />
                {errs.config && <ErrLine msg={errs.config} />}
                <div className="hint">Keys must be UPPER_SNAKE_CASE. Collisions with Flow.env are highlighted.</div>
              </div>
              <div className="note" style={{ marginTop: 0 }}>
                Secrets are added after creation (one-shot reveal pattern · ADR-0024).
              </div>
            </>
          )}
        </div>

        <footer>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn kind="pri" style={{ marginLeft: 'auto' }}
            onClick={submit}
            disabled={!canSave}
            title={canSave ? '' : 'Fix the highlighted errors first.'}>
            Create function
          </Btn>
        </footer>
      </aside>
    </>
  );
}


/* ======================= src/components/FunctionEditModal.jsx ======================= */

/* Function EDIT modal — mirrors FunctionCreateModal (Variant B) but pre-populates
   from the existing function record. Name is read-only (immutable after create;
   the image is signed with the function name at build time — ADR-0009).
   Adds a Secrets section (managed via the existing one-shot reveal pattern). */

function FunctionEditModal({ fn, onClose, onDeleted }) {
  const {
    db, updateFunction, deleteFunction, setFunctionSecrets,
    openDrawer, confirm,
  } = useApp();
  const wsFlows = db.flows.filter((f) => f.Workspace === fn.Workspace);

  /* ─── Quick-mode state, seeded from fn ─── */
  const [flowName, setFlowName] = useState(fn.Flow || '—');
  const [image, setImage] = useState(fn.Image || '');
  const [memory, setMemory] = useState(fn.Memory ?? 128);
  const [timeoutSec, setTimeoutSec] = useState(fn.TimeoutSec ?? 30);
  const [presetKey, setPresetKey] = useState(null); /* no auto-detect — presets reset existing config */
  const [scaling, setScaling] = useState(() => readScalingFromFn(fn.scaling));
  const applyPreset = (key) => { setPresetKey(key); setScaling({ ...PRESETS[key].set }); };
  const setScale = (patch) => setScaling((s) => ({ ...s, ...patch }));

  /* ─── Advanced state ─── */
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [description, setDescription] = useState(fn.Description || ('Function ' + fn.Function));
  const [tier, setTier] = useState(fn.RuntimeTier || (fn['Runtime/FDK'] || 'Docker · fdk-go').split('·')[0].trim() || 'Docker');
  const [fdk, setFdk] = useState(fn.FdkLang || (fn['Runtime/FDK'] || 'Docker · fdk-go').split('·')[1]?.trim() || 'fdk-go');
  const [idleTimeoutSec, setIdleTimeoutSec] = useState(fn.IdleTimeoutSec ?? 30);
  const [config, setConfig] = useState(Array.isArray(fn.Config) && fn.Config.length ? fn.Config : [{ k: '', v: '' }]);
  useEffect(() => {
    const opts = TIER_FDK[tier] || [];
    if (!opts.includes(fdk)) setFdk(opts[0] || '');
  }, [tier]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Derived ─── */
  const parentFlow = flowName === '—' ? null : wsFlows.find((f) => f.Flow === flowName);
  const inhEnvKeys = parentFlow && Array.isArray(parentFlow.env) ? parentFlow.env.map((e) => e.k) : [];
  const inhSecNames = parentFlow && Array.isArray(parentFlow.secrets) ? parentFlow.secrets.map((s) => s.Name) : [];
  const conflictKeys = useMemo(() => new Set(inhEnvKeys), [inhEnvKeys.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
  const flowTriggerIsKafka = parentFlow && /kafka/i.test(parentFlow.Trigger || '');
  const tMeta = THRESHOLD_META[scaling.trigger];
  const triggerInfo = TRIGGERS.find((t) => t.value === scaling.trigger);

  /* ─── Validation ─── */
  const errs = validateForm({ scaling, image, memory, timeoutSec, idleTimeoutSec, config, flowTriggerIsKafka });
  const warns = softWarnings({ scaling });

  /* ─── Live summary ─── */
  const summary = useMemo(() => buildSummary({
    name: fn.Function, tier, fdk, memory, timeoutSec, image, scaling, flowName,
  }), [fn.Function, tier, fdk, memory, timeoutSec, image, scaling, flowName]);

  /* ─── Secrets (managed inline; reveal-once pattern) ─── */
  const fnSecrets = fn.secrets || [];
  const showSecretOnce = (name, value) => openDrawer({
    title: 'Copy your secret — shown ONCE', sub: name + ' · never recoverable',
    fields: [{ label: 'Secret value', value, ro: true }],
    note: 'Stored as argon2id(+pepper); value never persisted.',
    saveLabel: 'I have copied it',
  });
  const addFnSecret = () => openDrawer({
    title: 'Add function secret', sub: 'one-shot reveal',
    fields: [{ label: 'Name', value: 'NEW_SECRET', help: 'UPPER_SNAKE_CASE — referenced as ${NAME} in this function' }],
    saveLabel: 'Generate',
    onSave: (v) => {
      const nm = (v.Name || '').trim();
      if (!nm) return;
      const prefix = nm.slice(0, 4).toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.random().toString(16).slice(2, 6) + '…';
      const sec = { Name: nm, Prefix: prefix, Status: 'active', Created: 'just now', Rotated: '—', Expiry: '365d' };
      setFunctionSecrets(fn.id, [...fnSecrets, sec]);
      const value = 'fnsec_' + Math.random().toString(16).slice(2, 22);
      setTimeout(() => showSecretOnce(nm, value), 100);
    },
  });
  const rotateFnSecret = (s) => confirm({
    title: 'Rotate “' + s.Name + '”?',
    sub: 'A new value is generated. Old value briefly remains valid, then invalidated.',
    note: 'New value shown ONCE on rotate.', confirmLabel: 'Rotate',
    onConfirm: () => {
      const newPrefix = s.Name.slice(0, 4).toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.random().toString(16).slice(2, 6) + '…';
      setFunctionSecrets(fn.id, fnSecrets.map((x) => (x.Name === s.Name ? { ...x, Prefix: newPrefix, Rotated: 'just now', Status: 'active' } : x)));
      const value = 'rot_' + Math.random().toString(16).slice(2, 22);
      setTimeout(() => showSecretOnce(s.Name, value), 100);
    },
  });
  const revokeFnSecret = (s) => confirm({
    title: 'Revoke “' + s.Name + '”?',
    sub: 'Immediate: gateway cache TTL → 0. Function call using this secret will fail until rotation.',
    confirmLabel: 'Revoke',
    onConfirm: () => setFunctionSecrets(fn.id, fnSecrets.map((x) => (x.Name === s.Name ? { ...x, Status: 'revoked' } : x))),
  });
  const deleteFnSecret = (s) => confirm({
    title: 'Delete “' + s.Name + '”?',
    sub: 'Removes from this function. Use Revoke first if any caller still references it.',
    confirmLabel: 'Delete',
    onConfirm: () => setFunctionSecrets(fn.id, fnSecrets.filter((x) => x.Name !== s.Name)),
  });

  /* ─── Submit / Delete ─── */
  const canSave = Object.keys(errs).length === 0;
  const submit = () => {
    if (!canSave) return;
    const fnPath = (flowName === '—' ? 'standalone' : flowName) + '/' + fn.Function;
    const hasImage = !!image && image.trim();
    const mem = Number(memory) || 128;
    updateFunction(fn.id, {
      Flow: flowName === '—' ? '—' : flowName,
      Description: description,
      Image: hasImage ? image : null,
      Status: hasImage ? (fn.Status === 'pending build' ? 'warm' : fn.Status) : 'pending build',
      'Runtime/FDK': tier + ' · ' + fdk,
      RuntimeTier: tier, FdkLang: fdk,
      Memory: mem,
      Mem: mem >= 1024 ? (mem / 1024) + 'G' : mem + 'M',
      TimeoutSec: timeoutSec, Timeout: timeoutSec + 's',
      IdleTimeoutSec: idleTimeoutSec,
      Config: config.filter((r) => r.k),
      scaling: buildScalingPayload(scaling, fnPath),
    }, 'Function "' + fn.Function + '" saved');
    onClose();
  };
  const doDelete = () => confirm({
    title: 'Delete function "' + fn.Function + '"?',
    sub: 'Removes from registry. Linked flow steps will lose their function reference.',
    note: 'Irreversible. Audited (§16.9).',
    confirmLabel: 'Delete',
    onConfirm: () => { deleteFunction(fn.id); onDeleted && onDeleted(fn.id); onClose(); },
  });

  /* ─── Escape closes ─── */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const fdkOptions = TIER_FDK[tier] || [];

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" style={{ width: 'min(680px, 96vw)' }}>
        <header>
          <div>
            <h3>Edit Function · {fn.Function}</h3>
            <div className="sub">workspace · {fn.Workspace} <Badge>{fn.Status}</Badge></div>
          </div>
          <button className="x" aria-label="Close" onClick={onClose}>✕</button>
        </header>

        <div className="body">

          {/* ── Identity ── */}
          <div className="section-h">Identity</div>
          <div className="field">
            <label>Name <span style={{ color: 'var(--faint)' }}>· read-only</span></label>
            <input value={fn.Function} readOnly />
            <div className="hint">Immutable after create — image is signed with this name (ADR-0009).</div>
          </div>
          <div className="field">
            <label>Flow</label>
            <select value={flowName} onChange={(e) => setFlowName(e.target.value)}>
              <option value="—">Standalone (no parent flow)</option>
              {wsFlows.map((f) => {
                const e = (f.env || []).length, s = (f.secrets || []).length;
                return <option key={f.id} value={f.Flow}>{f.Flow} · {f.Trigger} ({e} env, {s} secrets)</option>;
              })}
            </select>
          </div>

          {/* ── Image ── */}
          <div className="section-h">Image</div>
          <div className="field">
            <label>Image</label>
            <input value={image} onChange={(e) => setImage(e.target.value)}
              placeholder="repo/name@sha256:… or repo/name:tag — empty to mark as pending build"
              style={errs.image ? { borderColor: 'var(--danger)' } : null} />
            {errs.image
              ? <ErrLine msg={errs.image} />
              : <div className="hint">
                  {image ? 'OCI image ref. Signed & attested at deploy (ADR-0009).'
                         : <>Empty → function moves to <Badge>pending build</Badge> state.</>}
                </div>}
          </div>

          {/* ── Resources ── */}
          <div className="section-h">Resources</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="field">
              <label>Memory (MB) <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input type="number" min={32} max={8192} value={memory}
                onChange={(e) => setMemory(Number(e.target.value))}
                style={errs.memory ? { borderColor: 'var(--danger)' } : null} />
              <ErrLine msg={errs.memory} />
            </div>
            <div className="field">
              <label>Timeout (s) <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input type="number" min={1} max={300} value={timeoutSec}
                onChange={(e) => setTimeoutSec(Number(e.target.value))}
                style={errs.timeoutSec ? { borderColor: 'var(--danger)' } : null} />
              <ErrLine msg={errs.timeoutSec} />
            </div>
          </div>

          {/* ── Scaling presets (clicking RESETS to preset values) ── */}
          <div className="section-h">Scaling</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {Object.entries(PRESETS).map(([k, p]) => (
              <PresetCard key={k} active={presetKey === k} preset={p} onClick={() => applyPreset(k)} />
            ))}
          </div>
          {showAdvanced ? null : (
            <div className="hint" style={{ marginTop: -4 }}>
              {presetKey
                ? <>Preset will reset all scaling fields. Current trigger: <b>{triggerInfo ? triggerInfo.label : '—'}</b> @ <b className="mono">{scaling.threshold}</b></>
                : <>Click a preset to reset current scaling. Current trigger: <b>{triggerInfo ? triggerInfo.label : '—'}</b> @ <b className="mono">{scaling.threshold}</b></>}
            </div>
          )}

          {warns.length > 0 && (
            <div className="note" style={{ marginTop: 8 }}>
              {warns.map((w, i) => <div key={i}>⚠ {w}</div>)}
            </div>
          )}

          {/* ── Summary ── */}
          <div className="section-h">Summary</div>
          <div className="note" style={{
            marginTop: 0, whiteSpace: 'pre-line', fontSize: 12, lineHeight: 1.55,
            background: 'var(--panel2)', borderLeft: '3px solid var(--accent)',
          }}>
            {summary}
          </div>

          {/* ── Advanced toggle ── */}
          <button type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            style={{
              marginTop: 14, width: '100%', padding: '8px 12px',
              border: '1px dashed var(--border)', background: 'transparent',
              color: 'var(--accent)', borderRadius: 6, cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
            }}>
            {showAdvanced ? '⌃ Hide advanced settings' : '⌄ Show advanced settings (12+ fields · secrets)'}
          </button>

          {/* ── Advanced section ── */}
          {showAdvanced && (
            <>
              <div className="section-h" style={{ marginTop: 16 }}>Identity (advanced)</div>
              <div className="field">
                <label>Description</label>
                <input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="field">
                <label>Format <span style={{ color: 'var(--faint)' }}>· read-only</span></label>
                <div><Badge>http-stream · fn-format ABI (ADR-0014)</Badge></div>
              </div>
              <div className="field">
                <label>Status <span style={{ color: 'var(--faint)' }}>· read-only · runtime</span></label>
                <div><Badge>{fn.Status}</Badge></div>
                <div className="hint">Reflects current runtime state. Not user-editable.</div>
              </div>

              <div className="section-h">Runtime</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field">
                  <label>Runtime tier</label>
                  <select value={tier} onChange={(e) => setTier(e.target.value)}>
                    <option value="Docker">Docker</option>
                    <option value="Firecracker">Firecracker (~125ms)</option>
                    <option value="WASM">WASM (sub-ms)</option>
                  </select>
                </div>
                <div className="field">
                  <label>FDK language</label>
                  <select value={fdk} onChange={(e) => setFdk(e.target.value)}>
                    {fdkOptions.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Idle timeout (s)</label>
                <input type="number" min={1} max={3600} value={idleTimeoutSec}
                  onChange={(e) => setIdleTimeoutSec(Number(e.target.value))}
                  style={errs.idleTimeoutSec ? { borderColor: 'var(--danger)' } : null} />
                <ErrLine msg={errs.idleTimeoutSec} />
              </div>

              <div className="section-h">Scaling (override)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field">
                  <label>Min replicas</label>
                  <input type="number" min={0} max={100} value={scaling.min}
                    onChange={(e) => setScale({ min: Number(e.target.value) })}
                    style={errs.min ? { borderColor: 'var(--danger)' } : null} />
                  <ErrLine msg={errs.min} />
                </div>
                <div className="field">
                  <label>Max replicas</label>
                  <input type="number" min={1} max={1000} value={scaling.max}
                    onChange={(e) => setScale({ max: Number(e.target.value) })}
                    style={errs.max ? { borderColor: 'var(--danger)' } : null} />
                  <ErrLine msg={errs.max} />
                </div>
                <div className="field">
                  <label>Cooldown (s)</label>
                  <input type="number" min={30} max={3600} value={scaling.cooldown}
                    onChange={(e) => setScale({ cooldown: Number(e.target.value) })} />
                </div>
                <div className="field">
                  <label>Polling interval (s)</label>
                  <input type="number" min={1} max={300} value={scaling.polling}
                    onChange={(e) => setScale({ polling: Number(e.target.value) })} />
                </div>
              </div>

              <div className="field">
                <label>Primary trigger</label>
                <select value={scaling.trigger} onChange={(e) => setScale({ trigger: e.target.value })}>
                  {TRIGGERS.map((t) => {
                    const disabled = t.kind === 'kafka' && !flowTriggerIsKafka;
                    return <option key={t.value} value={t.value} disabled={disabled}>
                      {t.label}{disabled ? ' (Flow not Kafka-triggered)' : ''}
                    </option>;
                  })}
                </select>
                {errs.trigger
                  ? <ErrLine msg={errs.trigger} />
                  : <div className="hint">What signal triggers scale-up.</div>}
              </div>
              <div className="field">
                <label>Trigger threshold</label>
                <input value={scaling.threshold}
                  placeholder={tMeta ? tMeta.placeholder : ''}
                  onChange={(e) => setScale({ threshold: e.target.value })}
                  style={errs.threshold ? { borderColor: 'var(--danger)' } : null} />
                {errs.threshold
                  ? <ErrLine msg={errs.threshold} />
                  : <div className="hint">{tMeta ? tMeta.help : '—'}</div>}
              </div>
              {scaling.min === 0 && (
                <div className="field">
                  <label>Activation threshold</label>
                  <input type="number" min={1} value={scaling.activation}
                    onChange={(e) => setScale({ activation: Number(e.target.value) })}
                    style={errs.activation ? { borderColor: 'var(--danger)' } : null} />
                  <ErrLine msg={errs.activation} />
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field">
                  <label>Scale-up policy</label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="number" value={scaling.upPct} min={1} max={1000}
                      onChange={(e) => setScale({ upPct: Number(e.target.value) })} style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>% every</span>
                    <input type="number" value={scaling.upPer} min={1} max={600}
                      onChange={(e) => setScale({ upPer: Number(e.target.value) })} style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>s</span>
                  </div>
                </div>
                <div className="field">
                  <label>Scale-down policy</label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="number" value={scaling.dnPct} min={1} max={100}
                      onChange={(e) => setScale({ dnPct: Number(e.target.value) })} style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>% every</span>
                    <input type="number" value={scaling.dnPer} min={1} max={3600}
                      onChange={(e) => setScale({ dnPer: Number(e.target.value) })} style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>s</span>
                  </div>
                </div>
              </div>

              <div className="section-h">Configuration</div>
              {flowName !== '—' && (
                <div className="field">
                  <label>Inherited from Flow <b>{flowName}</b> <span style={{ color: 'var(--faint)' }}>· read-only</span></label>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {inhEnvKeys.length === 0 && inhSecNames.length === 0 ? (
                      <span className="hint" style={{ margin: 0 }}>Flow has no env or secrets yet.</span>
                    ) : (
                      <>
                        {inhEnvKeys.map((k) => <Badge key={'e_' + k}>{k}</Badge>)}
                        {inhSecNames.map((k) => <Badge key={'s_' + k}>🔒 {k}</Badge>)}
                      </>
                    )}
                  </div>
                  <div className="hint">Auto-merged at deploy. Function Config (below) wins on key collision.</div>
                </div>
              )}
              {flowName === '—' && (
                <div className="note" style={{ marginTop: 0, marginBottom: 10 }}>
                  Standalone — no inheritance. Only Config and own Secrets apply at runtime.
                </div>
              )}
              <div className="field">
                <label>Config (own env vars)</label>
                <KvListWithValidation rows={config} onChange={setConfig} conflictKeys={conflictKeys} />
                {errs.config && <ErrLine msg={errs.config} />}
                <div className="hint">Keys must be UPPER_SNAKE_CASE. Collisions with Flow.env are highlighted.</div>
              </div>

              {/* ── Secrets (Edit-only) ── */}
              <div className="section-h">Secrets (own)</div>
              {fnSecrets.length === 0 ? (
                <div className="hint" style={{ margin: 0 }}>No secrets yet. Use "Add secret" — value is shown ONCE.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {fnSecrets.map((s) => (
                    <div key={s.Name} className="refrow" style={{ alignItems: 'center' }}>
                      <span className="mono"><b>{s.Name}</b></span>
                      <Badge>{s.Status}</Badge>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{s.Prefix}</span>
                      <span style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                        <Btn sm onClick={() => rotateFnSecret(s)}>↻</Btn>
                        <Btn sm onClick={() => revokeFnSecret(s)}>⊘</Btn>
                        <Btn sm kind="dng" onClick={() => deleteFnSecret(s)}>✕</Btn>
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 8 }}>
                <Btn sm onClick={addFnSecret}>＋ Add secret</Btn>
              </div>
              <div className="hint">
                Hashed at rest (ADR-0013). Value is revealed ONCE on create/rotate — copy it then.
              </div>
            </>
          )}
        </div>

        <footer>
          <Btn kind="dng" onClick={doDelete}>Delete</Btn>
          <Btn onClick={onClose} style={{ marginLeft: 8 }}>Cancel</Btn>
          <Btn kind="pri" style={{ marginLeft: 'auto' }}
            onClick={submit}
            disabled={!canSave}
            title={canSave ? '' : 'Fix the highlighted errors first.'}>
            Save changes
          </Btn>
        </footer>
      </aside>
    </>
  );
}


/* ======================= src/components/ProtoEditorModal.jsx ======================= */

/* Big code-editor-style modal for creating / editing a workspace proto.
   Opens from the gRPC trigger node config; replaces the previous
   "navigate to /protos page" detour so users stay in the Designer. */
function ProtoEditorModal({ open, existing, onClose, onCreated }) {
  const { scope, createProto, updateProto, toast } = useApp();
  const isEdit = !!existing;
  const [name, setName] = useState('payments');
  const [version, setVersion] = useState('v1');
  const [description, setDescription] = useState('');
  const [text, setText] = useState(DEFAULT_PROTO_TEMPLATE);
  const [fullscreen, setFullscreen] = useState(false);

  /* ESC: exit fullscreen first if in fullscreen, else close the modal. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (fullscreen) { setFullscreen(false); e.preventDefault(); }
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, fullscreen, onClose]);

  /* Reset whenever the modal opens, so a re-open after a different selection
     doesn't carry over stale values. */
  useEffect(() => {
    if (!open) return;
    if (existing) {
      setName(existing.Name);
      setVersion(existing.Version);
      setDescription(existing.Description || '');
      setText(existing._sourceText || DEFAULT_PROTO_TEMPLATE);
    } else {
      setName('payments');
      setVersion('v1');
      setDescription('');
      setText(DEFAULT_PROTO_TEMPLATE);
    }
  }, [open, existing]);

  /* Parse live so the right pane updates as the user types. Memoised so a
     500-line proto doesn't re-parse on every keystroke unless text changed. */
  const parsed = useMemo(() => parseProtoText(text), [text]);
  const totalMethods = parsed.services.reduce((n, s) => n + s.methods.length, 0);

  if (!open) return null;

  const valid = !!name.trim() && !!version.trim() && parsed.services.length > 0;

  const save = () => {
    if (!valid) {
      toast('Need a name, version, and at least one service { rpc … } block.', 'dng');
      return;
    }
    if (isEdit) {
      updateProto(existing.id, {
        Description: description,
        services: parsed.services,
        messages: parsed.messages,
        _sourceText: text,
      }, 'Proto updated');
      onClose();
    } else {
      const id = createProto({
        workspace: scope.ws,
        name: name.trim(),
        version: version.trim(),
        description,
        services: parsed.services,
        messages: parsed.messages,
      });
      /* Surface the Ref back to the caller so it can pre-select the new
         proto in the gRPC trigger field. Must match the format the store
         uses on create: `oci://registry/proto/<name>@<version>`. */
      if (onCreated && id) {
        onCreated({
          Ref: 'oci://registry/proto/' + name.trim() + '@' + version.trim(),
          id,
        });
      }
      onClose();
    }
  };

  return (
    <div className="proto-editor-back" onClick={onClose}>
      <div className={'proto-editor' + (fullscreen ? ' fullscreen' : '')}
        onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true">
        <header>
          <div>
            <h3>{isEdit ? 'Edit proto · ' + existing.Name + '@' + existing.Version : 'New proto'}</h3>
            <div className="sub">
              workspace · {scope.ws} ·
              {' '}<span className="mono">{parsed.services.length}</span> service(s),
              {' '}<span className="mono">{totalMethods}</span> method(s),
              {' '}<span className="mono">{Object.keys(parsed.messages).length}</span> message(s)
            </div>
          </div>
          <button className="x" onClick={() => setFullscreen((v) => !v)}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}>
            {fullscreen ? '⛶' : '⛶'}<span style={{ marginLeft: 6, fontSize: 12 }}>{fullscreen ? 'Exit' : 'Full'}</span>
          </button>
          <button className="x" onClick={onClose} aria-label="Close" title="Close">✕</button>
        </header>
        <div className="proto-editor-body">
          <div className="proto-editor-meta">
            <div className="field">
              <label>Name {isEdit && <span style={{ color: 'var(--faint)' }}>· immutable</span>}</label>
              <input value={name} disabled={isEdit}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="payments" />
            </div>
            <div className="field">
              <label>Version {isEdit && <span style={{ color: 'var(--faint)' }}>· immutable</span>}</label>
              <input value={version} disabled={isEdit}
                onChange={(e) => setVersion(e.target.value)} placeholder="v1" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Description</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="What this contract is for" />
            </div>
          </div>
          <div className="proto-editor-split">
            <div className="proto-editor-pane">
              <div className="proto-editor-pane-h">
                <span>.proto source</span>
                <span style={{ color: 'var(--faint)', fontSize: 11 }}>
                  syntax = "proto3"
                </span>
              </div>
              <textarea className="proto-editor-code"
                value={text} onChange={(e) => setText(e.target.value)}
                spellCheck={false}
                placeholder='service Foo { rpc Bar (BarReq) returns (BarRes); }' />
            </div>
            <div className="proto-editor-pane proto-editor-pane-preview">
              <div className="proto-editor-pane-h">
                <span>Parsed contract</span>
                <span style={{ color: valid ? 'var(--ok)' : 'var(--warn)', fontSize: 11 }}>
                  {valid ? '✓ ready' : '⚠ add a service block to enable Save'}
                </span>
              </div>
              <div className="proto-editor-preview">
                {parsed.services.length === 0 ? (
                  <div className="hint" style={{ padding: 12 }}>
                    No services parsed yet. Add a <code>service Foo {'{ rpc Bar(...) returns (...); }'}</code> block.
                  </div>
                ) : parsed.services.map((s) => (
                  <div key={s.name} className="proto-svc">
                    <div className="proto-svc-h">
                      <span className="proto-svc-name">⚙ {s.name}</span>
                      <span style={{ color: 'var(--faint)', fontSize: 11 }}>
                        {s.methods.length} method{s.methods.length === 1 ? '' : 's'}
                      </span>
                    </div>
                    {s.methods.map((m) => (
                      <div key={m.name} className="proto-method">
                        <span className="proto-method-name">{m.name}</span>
                        <span className="proto-method-arrow">
                          {m.streaming === 'unary' ? '·' :
                            m.streaming === 'server-streaming' ? '→ stream' :
                            m.streaming === 'client-streaming' ? '⇐ stream' : '⇄ bidi'}
                        </span>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>
                          {m.requestType} → {m.responseType}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
                {Object.keys(parsed.messages).length > 0 && (
                  <div className="proto-msgs">
                    <div className="proto-msgs-h">Messages ({Object.keys(parsed.messages).length})</div>
                    {Object.entries(parsed.messages).map(([name, fields]) => (
                      <div key={name} className="proto-msg">
                        <span className="proto-msg-name">{name}</span>
                        <span className="proto-msg-fields mono">
                          {Object.keys(fields).join(', ') || '— (empty)'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <footer className="proto-editor-foot">
          <span className="hint" style={{ margin: 0 }}>
            On save, the Build Service compiles to an OCI descriptor (mocked here). The new proto
            shows up immediately in this gRPC trigger's Proto descriptor dropdown.
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn pri" onClick={save} disabled={!valid}>
              {isEdit ? 'Save changes' : 'Register proto'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}


/* ======================= src/components/CollectionTree.jsx ======================= */

/* Collection tree (Postman-style): expandable, hover-actions, active row.
   A collection groups flows inside ONE workspace; trees nest collections.
   The count badge = flows in that collection's subtree, derived live from db.flows. */
function CTRow({ node, depth, expanded, toggle, onClick, active, onMore, count }) {
  const has = !!(node.children && node.children.length);
  return (
    <div className={'ft-row' + (active ? ' active' : '')}
      style={{ paddingLeft: 6 + depth * 14 }}
      title={'Switch to collection “' + node.name + '”' + (has ? ' · expands sub-collections' : '')}
      onClick={() => { if (has) toggle(node.p); onClick(node.p); }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (has) toggle(node.p); onClick(node.p); }
        else if (e.key === 'ArrowRight' && has && !expanded) toggle(node.p);
        else if (e.key === 'ArrowLeft' && has && expanded) toggle(node.p);
      }}>
      <span className="ft-chev" style={{ visibility: has ? 'visible' : 'hidden' }} aria-hidden>{expanded ? '▾' : '▸'}</span>
      <span className="ft-ico" aria-hidden>{has ? (expanded ? '🗁' : '🗀') : '🗎'}</span>
      <span className="ft-name">{node.name}</span>
      {count > 0 && <span className="ft-count" title={count + ' flows'}>{count}</span>}
      <button className="ft-more" onClick={(e) => { e.stopPropagation(); onMore(node); }}
        aria-label={`Actions for ${node.name}`} title="Collection actions">⋯</button>
    </div>
  );
}

function Branch({ nodes, depth, expandedSet, toggle, scope, onClick, onMore, countOf }) {
  return nodes.map((n) => (
    <div key={n.p}>
      <CTRow node={n} depth={depth} expanded={expandedSet.has(n.p)} toggle={toggle} count={countOf(n.p)}
        onClick={onClick} active={scope.folder === n.p} onMore={onMore} />
      {expandedSet.has(n.p) && n.children && (
        <Branch nodes={n.children} depth={depth + 1} expandedSet={expandedSet} toggle={toggle}
          scope={scope} onClick={onClick} onMore={onMore} countOf={countOf} />
      )}
    </div>
  ));
}

const allPaths = (nodes, acc = []) => {
  (nodes || []).forEach((n) => { acc.push(n.p); allPaths(n.children, acc); });
  return acc;
};

function CollectionTree() {
  const nav = useNavigate();
  const { scope, setScope, openDrawer, toast, db, createCollection, renameCollection, deleteCollection, navCollapsed, setNavCollapsed } = useApp();
  const collapsed = navCollapsed.includes('__collections');
  const toggleCollapse = () => setNavCollapsed((c) => c.includes('__collections') ? c.filter((x) => x !== '__collections') : [...c, '__collections']);
  const tree = db.collectionTrees[scope.ws] || [];
  const wsFlows = db.flows.filter((f) => f.Workspace === scope.ws);
  /* subtree count: a flow belongs to collection p if it sits at p or below it */
  const countOf = (p) => wsFlows.filter((f) => f.Collection === p || f.Collection.startsWith(p + '/')).length;
  const [expanded, setExpanded] = useState(() => new Set(allPaths(tree)));
  useEffect(() => { setExpanded(new Set(allPaths(db.collectionTrees[scope.ws]))); }, [scope.ws]); // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = (p) => setExpanded((s) => { const x = new Set(s); x.has(p) ? x.delete(p) : x.add(p); return x; });
  /* selecting a collection opens its overview page */
  const onClick = (p) => { setScope({ ...scope, folder: p }); nav('/collection'); };
  const onMore = (n) => openDrawer({
    title: n.name, sub: 'collection · ' + scope.ws + n.p,
    fields: [
      { label: 'Name', value: n.name },
      { label: 'Description', value: n.desc || '', type: 'textarea' },
      { label: 'Path', value: n.p, ro: true },
      { label: 'Workspace', value: scope.ws, ro: true },
      { label: 'Flows (incl. sub-collections)', value: String(countOf(n.p)), ro: true },
    ],
    note: 'Delete moves any flows under this collection to the workspace root.',
    onSave: (v) => renameCollection(scope.ws, n.p, { name: v.Name, desc: v.Description }, 'Collection updated'),
    onDelete: () => deleteCollection(scope.ws, n.p),
  });
  const newTop = () => openDrawer({
    title: 'New collection', sub: 'workspace · ' + scope.ws,
    fields: [{ label: 'Name', value: 'new-collection' }],
    note: 'Creates a top-level collection in this workspace.',
    onSave: (v) => setScope({ ...scope, folder: createCollection(scope.ws, null, v.Name) }),
  });
  return (
    <div className="foldertree">
      <div className="ft-head">
        <button className="ft-lbl" onClick={toggleCollapse} aria-expanded={!collapsed}>
          <span className={'lbl-chev' + (collapsed ? ' off' : '')}>▾</span> Collections
        </button>
        <button className="ft-add" onClick={newTop}
          aria-label="New collection" title="New collection">＋</button>
      </div>
      {!collapsed && (tree.length === 0 ? (
        <div className="ft-empty">No collections in this workspace.</div>
      ) : (
        <Branch nodes={tree} depth={0} expandedSet={expanded} toggle={toggle}
          scope={scope} onClick={onClick} onMore={onMore} countOf={countOf} />
      ))}
    </div>
  );
}


/* ======================= src/components/WorkspaceTrees.jsx ======================= */

/* Postman-style workspace resource trees: Flows / Functions / Schedules.
   These sit below the Collections tree in the sidebar and list the actual items
   in the current workspace so users can jump straight to any one of them. */

function WTSection({ label, count, collapsed, onToggle, onAdd, addTitle, onViewAll, viewAllTitle, active, children }) {
  return (
    <div className="foldertree">
      <div className="ft-head" style={active ? {
        background: 'var(--panel3)', borderLeft: '2px solid var(--accent)',
        marginLeft: -2, paddingLeft: 6,
      } : null}>
        <button className="ft-lbl" onClick={onToggle} aria-expanded={!collapsed}
          aria-current={active ? 'page' : undefined}
          style={active ? { color: 'var(--accent)', fontWeight: 600 } : null}>
          <span className={'lbl-chev' + (collapsed ? ' off' : '')}>▾</span> {label}
          {count > 0 && <span className="ft-count" style={{ marginLeft: 6 }}>{count}</span>}
        </button>
        {onViewAll && (
          <button className="ft-add" onClick={onViewAll}
            aria-label={viewAllTitle || ('Open ' + label + ' page')}
            title={viewAllTitle || ('Open ' + label + ' page')}
            style={{ marginRight: 2 }}>↗</button>
        )}
        {onAdd && (
          <button className="ft-add" onClick={onAdd}
            aria-label={addTitle || ('New ' + label)} title={addTitle || ('New ' + label)}>＋</button>
        )}
      </div>
      {!collapsed && children}
    </div>
  );
}

function WTRow({ icon, name, badge, title, active, onClick }) {
  return (
    <div className={'ft-row' + (active ? ' active' : '')}
      style={{ paddingLeft: 6 }}
      title={title}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}>
      <span className="ft-chev" style={{ visibility: 'hidden' }} aria-hidden>▸</span>
      <span className="ft-ico" aria-hidden>{icon}</span>
      <span className="ft-name">{name}</span>
      {badge && <span className="ft-count" title={badge}>{badge}</span>}
    </div>
  );
}

function WorkspaceTrees() {
  const nav = useNavigate();
  const loc = useLocation();
  const { scope, db, createFlow, navCollapsed, setNavCollapsed } = useApp();
  /* Active = user is on the corresponding list page. The Designer route also
     counts as "Flows" so the section stays highlighted while editing a flow. */
  const onFlowsPage = loc.pathname === '/flows' || loc.pathname.startsWith('/designer');
  const onFnsPage = loc.pathname === '/functions';
  const onSchPage = loc.pathname === '/scheduler';
  const tog = (k) => setNavCollapsed((c) => c.includes(k) ? c.filter((x) => x !== k) : [...c, k]);
  const flows = db.flows.filter((f) => f.Workspace === scope.ws);
  const fns = db.functions.filter((f) => f.Workspace === scope.ws);
  const schedules = db.schedules.filter((s) => s.Workspace === scope.ws);

  /* "+" actions: flow creates inline + navigates; fn/schedule defer to their list page
     where the create drawer already lives (so we don't duplicate required-field logic). */
  const newFlow = () => {
    const coll = scope.folder && scope.folder !== '/' ? scope.folder : '/';
    const id = createFlow({ workspace: scope.ws, collection: coll, name: 'new-flow' });
    nav('/designer/' + id);
  };

  const cFlows = navCollapsed.includes('__flows');
  const cFns = navCollapsed.includes('__fns');
  const cSch = navCollapsed.includes('__sch');

  return (
    <>
      <WTSection label="Flows" count={flows.length} collapsed={cFlows} active={onFlowsPage}
        onToggle={() => tog('__flows')}
        onViewAll={() => nav('/flows')} viewAllTitle="Open Flows list page"
        onAdd={newFlow} addTitle="New flow">
        {flows.length === 0
          ? <div className="ft-empty">No flows.</div>
          : flows.map((f) => (
            <WTRow key={f.id} icon="≡" name={f.Flow}
              badge={f.State === 'live' ? '●' : f.State === 'degraded' ? '⚠' : '○'}
              title={f.Flow + ' · ' + f.Trigger + ' · ' + f.State}
              onClick={() => nav('/designer/' + f.id)} />
          ))}
      </WTSection>

      <WTSection label="Functions" count={fns.length} collapsed={cFns} active={onFnsPage}
        onToggle={() => tog('__fns')}
        onViewAll={() => nav('/functions')} viewAllTitle="Open Functions list page"
        onAdd={() => nav('/functions')} addTitle="New function">
        {fns.length === 0
          ? <div className="ft-empty">No functions.</div>
          : fns.map((f) => {
            const sc = f.scaling || {};
            const sizeBadge = sc.maxReplicaCount
              ? (sc.minReplicaCount ?? 0) + '→' + sc.maxReplicaCount
              : null;
            const stateBadge = f.Status && f.Status.includes('scaled to 0') ? '○'
              : f.Status && f.Status.includes('scaling') ? '↑'
              : '●';
            return (
              <WTRow key={f.id} icon="◰" name={f.Function}
                badge={sizeBadge || stateBadge}
                title={f.Function + ' · ' + (f['Runtime/FDK'] || 'container') + ' · ' + (f.Mem || '')
                  + ' · ' + (f.Status || '')
                  + (sizeBadge ? ' · KEDA ' + sizeBadge : '')}
                onClick={() => nav('/functions')} />
            );
          })}
      </WTSection>

      <WTSection label="Schedules" count={schedules.length} collapsed={cSch} active={onSchPage}
        onToggle={() => tog('__sch')}
        onViewAll={() => nav('/scheduler')} viewAllTitle="Open Schedules list page"
        onAdd={() => nav('/scheduler')} addTitle="New schedule">
        {schedules.length === 0
          ? <div className="ft-empty">No schedules.</div>
          : schedules.map((s) => (
            <WTRow key={s.id} icon="◷" name={s.Name}
              badge={s.enabled === false ? '⏸' : s.Type}
              title={s.Name + ' · ' + s.Type + ' · ' + (s.Target || s.Flow || '—')}
              onClick={() => nav('/scheduler')} />
          ))}
      </WTSection>

    </>
  );
}


/* ======================= src/components/WorkspaceSwitcher.jsx ======================= */

/* One scope selector — button toggles its own dropdown (opens / closes independently).
   `compact` = top-bar variant (no stacked label, auto width). */
function ScopeSelect({ label, icon, current, sub, items, onPick, compact }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  return (
    <div className={'scopesel' + (compact ? ' compact' : '')} ref={ref}>
      {label && !compact && <div className="scopesel-lbl">{label}</div>}
      <button type="button" className={'scopesel-btn' + (open ? ' open' : '')}
        aria-haspopup="listbox" aria-expanded={open} aria-label={compact ? label : undefined}
        onClick={() => setOpen((o) => !o)}>
        <span className="scopesel-av">{icon}</span>
        <span className="scopesel-meta">
          <span className="scopesel-cur">{current}</span>
          {sub && <span className="scopesel-sub">{sub}</span>}
        </span>
        <span className="scopesel-chev" aria-hidden>▾</span>
      </button>
      {open && (
        <div className="scopesel-menu" role="listbox" aria-label={label}>
          {items.length === 0 && <div className="scopesel-empty">Nothing here</div>}
          {items.map((it) => (
            <button key={it.key} type="button" role="option" aria-selected={it.active}
              className={'scopesel-opt' + (it.active ? ' on' : '')}
              onClick={() => { setOpen(false); if (!it.active) onPick(it); }}>
              <span className="scopesel-av sm">{it.icon}</span>
              <span className="scopesel-meta">
                <span className="scopesel-name">{it.label}</span>
                {it.sub && <span className="scopesel-sub">{it.sub}</span>}
              </span>
              {it.active && <span className="scopesel-tick" aria-hidden>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Organization switcher — lives in the TOP BAR (global context, Slack / Postman-style). */
function OrgSwitcher() {
  const { scope, setScope, toast, db } = useApp();
  const curOrg = db.orgs.find((o) => o.name === scope.org) || db.orgs[0];
  const items = db.orgs.map((o) => ({
    key: o.id, icon: o.initial, label: o.name,
    sub: o.plan + ' · ' + db.workspaces.filter((w) => w.Org === o.name).length + ' workspaces',
    active: o.name === scope.org,
  }));
  const pick = (it) => {
    const o = db.orgs.find((x) => x.id === it.key);
    const fw = db.workspaces.find((w) => w.Org === o.name);
    setScope({ ...scope, org: o.name, ws: fw ? fw.Workspace : scope.ws, folder: '/' });
    toast('Organization: ' + o.name);
  };
  return <ScopeSelect compact label="Organization" icon={curOrg.initial}
    current={curOrg.name} items={items} onPick={pick} />;
}

/* Workspace switcher — lives in the SIDEBAR; scoped to the current organization. */
function WorkspaceSwitcher() {
  const { scope, setScope, toast, db } = useApp();
  const curOrg = db.orgs.find((o) => o.name === scope.org) || db.orgs[0];
  const orgWs = db.workspaces.filter((w) => w.Org === curOrg.name);
  const curWs = orgWs.find((w) => w.Workspace === scope.ws) || orgWs[0];
  const items = orgWs.map((w) => ({
    key: w.id, icon: '▣', label: w.Workspace, sub: w.Env, active: w.Workspace === scope.ws,
  }));
  const pick = (it) => {
    const w = orgWs.find((x) => x.id === it.key);
    setScope({ ...scope, ws: w.Workspace, folder: '/' });
    toast('Workspace: ' + w.Workspace);
  };
  return (
    <div className="wsswitcher">
      <ScopeSelect label="Workspace" icon="▣" current={curWs ? curWs.Workspace : '—'}
        sub={curWs ? curWs.Env : ''} items={items} onPick={pick} />
    </div>
  );
}


/* ======================= src/components/CommandPalette.jsx ======================= */

function CommandPalette() {
  const { palette, setPalette, toast, db, scope } = useApp();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const inputRef = useRef(null);

  /* Two-layer search:
       1. Pages (NAV + workspace-tree routes) — always present.
       2. Resources (flows, functions, schedules, protos, route groups, api keys)
          — looked up by name within the current workspace. */
  const items = useMemo(() => {
    const treeRoutes = [
      { p: '/flows',     i: '≡', t: 'Flows',     group: 'Page · Design' },
      { p: '/functions', i: '◰', t: 'Functions', group: 'Page · Design' },
      { p: '/scheduler', i: '◷', t: 'Schedules', group: 'Page · Design' },
      { p: '/protos',    i: '⛬', t: 'Protos',    group: 'Page · Design' },
    ];
    const pages = [...treeRoutes, ...NAV.flatMap((g) => g.items.map((it) => ({ ...it, group: 'Page · ' + g.lbl })))];
    const ws = scope.ws;
    const resources = [
      ...db.flows.filter((f) => f.Workspace === ws).map((f) => ({
        p: '/designer/' + f.id, i: '≡', t: f.Flow,
        group: 'flow', subtitle: f.Trigger + ' · ' + f.State })),
      ...db.functions.filter((f) => f.Workspace === ws).map((f) => ({
        p: '/functions', i: '◰', t: f.Function,
        group: 'fn', subtitle: f['Runtime/FDK'] + ' · ' + f.Status })),
      ...db.schedules.filter((s) => s.Workspace === ws).map((s) => ({
        p: '/scheduler', i: '◷', t: s.Name,
        group: 'schedule', subtitle: s.Type + ' · ' + s.Spec })),
      ...(db.protos || []).filter((pr) => pr.Workspace === ws).map((pr) => ({
        p: '/protos', i: '⛬', t: pr.Name + ' @ ' + pr.Version,
        group: 'proto', subtitle: (pr.services || []).length + ' service(s)' })),
      ...db.routeGroups.filter((r) => r.Workspace === ws).map((r) => ({
        p: '/routegroups', i: '⛓', t: r.Name,
        group: 'routegroup', subtitle: r['Path namespace'] })),
      ...db.apiKeys.filter((k) => k.Workspace === ws).map((k) => ({
        p: '/apikeys', i: '⚿', t: k.Name,
        group: 'api key', subtitle: k.Status + ' · ' + k.Scopes })),
    ];
    return [...pages, ...resources];
  }, [db, scope.ws]);
  const filtered = useMemo(() => {
    if (!q) return items.slice(0, 30); /* trim when empty */
    const ql = q.toLowerCase();
    /* Support resource prefix (flow:foo, fn:bar) for power users. */
    const prefixed = /^(flow|fn|schedule|proto|routegroup|api ?key|page):/i.test(ql);
    return items.filter((it) => {
      const hay = (it.t + ' ' + it.group + ' ' + (it.subtitle || '')).toLowerCase();
      if (prefixed) {
        const [pref, rest] = ql.split(/:\s*/, 2);
        return hay.includes(pref) && (!rest || hay.includes(rest));
      }
      return hay.includes(ql);
    });
  }, [items, q]);

  useEffect(() => {
    const onKey = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p); }
      else if (e.key === 'Escape' && palette) setPalette(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [palette, setPalette]);

  useEffect(() => {
    if (palette) { setQ(''); setI(0); setTimeout(() => inputRef.current && inputRef.current.focus(), 30); }
  }, [palette]);

  if (!palette) return null;
  const go = (it) => { setPalette(false); nav(it.p); toast('Opened ' + it.t); };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setI((x) => Math.min(filtered.length - 1, x + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
    else if (e.key === 'Enter' && filtered[i]) { e.preventDefault(); go(filtered[i]); }
  };
  return (
    <>
      <div className="scrim" onClick={() => setPalette(false)} />
      <div className="cmdpal" role="dialog" aria-label="Command palette">
        <input ref={inputRef} placeholder="Search flows, screens, settings…  (⌘K / Ctrl+K)"
          value={q} onChange={(e) => { setQ(e.target.value); setI(0); }} onKeyDown={onKey} />
        <div className="pl-list">
          {filtered.length === 0 && <div className="pl-empty">No matches.</div>}
          {filtered.map((it, idx) => (
            <button key={it.p + '|' + it.t + '|' + idx} className={'pl-item' + (idx === i ? ' on' : '')}
              onMouseEnter={() => setI(idx)} onClick={() => go(it)}>
              <span className="ico">{it.i}</span>
              <span className="t">{it.t}
                {it.subtitle && (
                  <span style={{ marginLeft: 6, color: 'var(--faint)', fontSize: 11, fontWeight: 400 }}>
                    {it.subtitle}
                  </span>
                )}
              </span>
              <span className="g">{it.group}</span>
              {it.tag && <span className="tag">{it.tag}</span>}
            </button>
          ))}
        </div>
        <div className="pl-hint">↑↓ navigate · ⏎ open · Esc close</div>
      </div>
    </>
  );
}


/* ======================= src/components/Layout.jsx ======================= */
