/* ============================================================
   UI primitives — Modal, Drawer, Toast, Tabs, Segmented, etc.
   ============================================================ */
const { useState: _uS, useEffect: _uE, createContext: _cC, useContext: _cx } = React;

/* ---------- Modal ---------- */
function Modal({ open, onClose, title, sub, children, footer, width }) {
  _uE(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal" style={width ? { width: `min(${width}px, calc(100vw - 40px))` } : null} role="dialog">
        {(title || onClose) && (
          <div className="modal-head">
            <div className="col gap-2">
              {title && <div style={{ fontSize:17, fontWeight:700, letterSpacing:'-0.02em' }}>{title}</div>}
              {sub && <div className="muted" style={{ fontSize:13 }}>{sub}</div>}
            </div>
            <button className="iconbtn" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </>
  );
}

/* ---------- Drawer ---------- */
function Drawer({ open, onClose, title, sub, children, footer, width }) {
  _uE(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="drawer" style={width ? { width:`min(${width}px, 100vw)` } : null} role="dialog">
        <div className="modal-head">
          <div className="col gap-2">
            {title && <div style={{ fontSize:17, fontWeight:700, letterSpacing:'-0.02em' }}>{title}</div>}
            {sub && <div className="muted" style={{ fontSize:13 }}>{sub}</div>}
          </div>
          <button className="iconbtn" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>
        <div className="modal-body grow">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </>
  );
}

/* ---------- Tabs / Segmented ---------- */
function Segmented({ options, value, onChange, size }) {
  return (
    <div className="tabs" style={ size==='sm' ? { padding:3 } : null }>
      {options.map(o => {
        const v = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        const icon = typeof o === 'object' ? o.icon : null;
        return (
          <button key={v} className={`tab ${value===v?'active':''}`} onClick={() => onChange(v)} style={ size==='sm'?{height:28,padding:'0 11px',fontSize:12.5}:null }>
            {icon && <Icon name={icon} size={14} />}{label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Badge helpers ---------- */
function SevBadge({ sev }) {
  const map = { High:'badge-neg', Medium:'badge-warn', Low:'badge-info' };
  return <span className={`badge ${map[sev]||''}`}><span className="dot" />{sev}</span>;
}
function StatusBadge({ status }) {
  const map = { New:'badge-accent', 'In progress':'badge-warn', Resolved:'badge-pos', Active:'badge-pos', Invited:'badge-neutral',
    connected:'badge-pos', syncing:'badge-info', idle:'badge-neutral', error:'badge-neg' };
  const label = { connected:'Connected', syncing:'Syncing', idle:'Idle', error:'Error' }[status] || status;
  return <span className={`badge ${map[status]||'badge-neutral'}`}>{status==='syncing' && <Spinner size={9} />}{label}</span>;
}
function Delta({ value, suffix='%' }) {
  const up = value >= 0;
  return <span className={`delta ${up?'up':'down'}`}><Icon name={up?'arrowUp':'arrowDown'} size={12} />{up?'+':''}{value}{suffix}</span>;
}

/* ---------- Spinner ---------- */
function Spinner({ size = 16, color = 'currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation:'spin .8s linear infinite' }}>
    <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="3" strokeOpacity="0.2" />
    <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
  </svg>;
}

/* ---------- Trust ring (small) ---------- */
function TrustRing({ value, size = 30 }) {
  const r = size/2 - 3, C = 2*Math.PI*r;
  const col = value >= 90 ? 'var(--pos)' : value >= 80 ? 'var(--warn)' : 'var(--neg)';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} title={`Trust ${value}%`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface)" strokeWidth="3" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="3" strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={C*(1-value/100)} transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2+3.5} textAnchor="middle" fontSize="10" fontWeight="700" fill={col} fontFamily="var(--font-mono)">{value}</text>
    </svg>
  );
}

/* ---------- Empty / placeholder image ---------- */
function PlaceholderViz({ label = 'preview', h = 120, accent }) {
  return (
    <div style={{ height:h, borderRadius:10, position:'relative', overflow:'hidden',
      background:`repeating-linear-gradient(135deg, var(--surface), var(--surface) 9px, var(--card-2) 9px, var(--card-2) 18px)`,
      border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span className="mono" style={{ fontSize:11, color:'var(--text-3)', background:'var(--card)', padding:'3px 9px', borderRadius:6, border:'1px solid var(--border)' }}>{label}</span>
    </div>
  );
}

/* ---------- Animated count-up number ---------- */
function CountUp({ value, duration = 900, decimals = 0, prefix='', suffix='' }) {
  const target = parseFloat(String(value).replace(/[^0-9.\-]/g, '')) || 0;
  const [n, setN] = _uS(target);
  _uE(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setN(target); return; }
    setN(0);
    let raf, start, done = false;
    const finish = () => { if (!done) { done = true; setN(target); } };
    const step = (t) => { if (!start) start = t; const p = Math.min((t-start)/duration, 1);
      const e = 1 - Math.pow(1-p, 3); setN(target*e); if (p < 1) { raf = requestAnimationFrame(step); } else { finish(); } };
    raf = requestAnimationFrame(step);
    // Fallback: guarantee the real value lands even if RAF never advances.
    const fb = setTimeout(finish, duration + 120);
    return () => { cancelAnimationFrame(raf); clearTimeout(fb); };
  }, [value]);
  const isNum = /^[+\-]?[\d.,]+$/.test(String(value).trim());
  if (!isNum) return <span>{value}</span>;
  return <span>{prefix}{n.toLocaleString(undefined,{minimumFractionDigits:decimals,maximumFractionDigits:decimals})}{suffix}</span>;
}

/* ---------- Toast system (context) ---------- */
const ToastCtx = _cC(null);
function useToast() { return _cx(ToastCtx); }
function ToastProvider({ children }) {
  const [toasts, setToasts] = _uS([]);
  const push = (msg, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, ...opts }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), opts.duration || 2600);
  };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div className="toast" key={t.id}>
            <span className="tcheck"><Icon name={t.icon || 'check'} size={13} /></span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

window.UZS = (n) => `${Number(n).toLocaleString()} `;
Object.assign(window, { Modal, Drawer, Segmented, SevBadge, StatusBadge, Delta, Spinner, TrustRing, PlaceholderViz, CountUp, ToastProvider, useToast });
