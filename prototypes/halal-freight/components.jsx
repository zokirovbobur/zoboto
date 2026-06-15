/* ============================================================
   Shared UI primitives
   ============================================================ */
const { useState, useEffect, useRef, createContext, useContext } = React;
const Icon = window.Icon;
const D = window.HFF_DATA;

/* ---- Brand ---- */
function Brand({ small }) {
  return (
    <div className="brand">
      <div className="brand-mark">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path d="M12 3 L20 7 V13 C20 18 12 21.5 12 21.5 C12 21.5 4 18 4 13 V7 Z" fill="#fff" fillOpacity="0.16" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/>
          <path d="M9 12.2 L11 14.2 L15.2 9.6" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {!small && (
        <div className="brand-name">{window.t ? window.t('brand_name') : 'Tijara'}
          <small>{window.t ? window.t('brand_sub') : 'Shariah-Compliant Advance'}</small>
        </div>
      )}
    </div>
  );
}

/* ---- Button ---- */
function Btn({ kind = "primary", size, block, icon, iconRight, children, ...rest }) {
  const cls = ["btn", "btn-" + kind, size === "lg" ? "btn-lg" : size === "sm" ? "btn-sm" : "", block ? "btn-block" : ""].join(" ");
  return (
    <button className={cls} {...rest}>
      {icon && <Icon name={icon} size={size === "lg" ? 18 : 16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "lg" ? 18 : 16} />}
    </button>
  );
}

/* ---- Badge ---- */
function Badge({ tone = "gray", dot, icon, children }) {
  return (
    <span className={"badge badge-" + tone}>
      {dot && <span className="dot" />}
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

/* Status → tone + icon mapping */
const STATUS_MAP = {
  "Draft": { tone: "gray", dot: true },
  "Under Review": { tone: "amber", dot: true },
  "Manual review": { tone: "amber", dot: true },
  "Auto approve": { tone: "green", dot: true },
  "Awaiting documents": { tone: "gray", dot: true },
  "Approved": { tone: "green", icon: "check" },
  "Funded": { tone: "blue", icon: "wallet" },
  "Broker Paid": { tone: "violet", dot: true },
  "Broker overdue": { tone: "red", dot: true },
  "High risk": { tone: "red", dot: true },
  "Settled": { tone: "green", icon: "checkCircle" },
  "Awaiting payment": { tone: "blue", dot: true },
  "Payment received": { tone: "green", icon: "check" },
  "Overdue": { tone: "red", dot: true },
};
function StatusBadge({ status }) {
  const m = STATUS_MAP[status] || { tone: "gray", dot: true };
  return <Badge tone={m.tone} dot={m.dot} icon={m.icon}>{status}</Badge>;
}

/* ---- Cards ---- */
function Card({ children, className = "", pad, style, onClick }) {
  return <div className={"card " + (pad ? "card-pad " : "") + className} style={style} onClick={onClick}>{children}</div>;
}
function CardHead({ icon, title, sub, right }) {
  return (
    <div className="card-head">
      {icon && <div className="stat-ico" style={{ background: "var(--green-soft)", color: "var(--green-strong)" }}><Icon name={icon} /></div>}
      <div style={{ flex: 1 }}>
        <h3>{title}</h3>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {right}
    </div>
  );
}

/* ---- Stat card ---- */
function Stat({ label, value, sub, subTone, icon, tone = "green" }) {
  const toneBg = { green: "var(--green-soft)", blue: "var(--info-soft)", amber: "var(--warn-soft)", red: "var(--danger-soft)", violet: "var(--violet-soft)" }[tone];
  const toneFg = { green: "var(--green-strong)", blue: "oklch(0.5 0.11 245)", amber: "oklch(0.55 0.13 70)", red: "var(--danger)", violet: "oklch(0.5 0.12 295)" }[tone];
  return (
    <div className="stat">
      <div className="row between" style={{ alignItems: "flex-start" }}>
        <div className="stat-label">{label}</div>
        {icon && <div className="stat-ico" style={{ background: toneBg, color: toneFg }}><Icon name={icon} /></div>}
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub" style={subTone ? { color: subTone } : null}>{sub}</div>}
    </div>
  );
}

/* ---- Steps ---- */
function Steps({ steps, current }) {
  return (
    <div className="steps">
      {steps.map((s, i) => (
        <div key={i} className={"step " + (i < current ? "done" : i === current ? "current" : "")} style={{ flex: i < steps.length - 1 ? 1 : "0 0 auto" }}>
          <div className="step-dot">{i < current ? <Icon name="check" size={15} /> : i + 1}</div>
          <div className="step-label nowrap">{s}</div>
          {i < steps.length - 1 && <div className="step-line" style={{ flex: 1, width: "auto" }} />}
        </div>
      ))}
    </div>
  );
}

/* ---- Checklist ---- */
function CheckRow({ status = "ok", label, meta }) {
  const ico = { ok: "check", warn: "alert", bad: "x", pend: "clock" }[status];
  return (
    <div className="check-row">
      <div className={"check-ico " + status}><Icon name={ico} size={13} /></div>
      <div className="check-label">{label}</div>
      {meta && <div className="check-meta">{meta}</div>}
    </div>
  );
}

/* ---- Confidence bar ---- */
function Confidence({ value }) {
  const color = value >= 95 ? "var(--green-strong)" : value >= 85 ? "var(--green)" : value >= 75 ? "var(--warn)" : "var(--danger)";
  return (
    <span className="conf">
      <span className="conf-bar"><span style={{ width: value + "%", background: color }} /></span>
      <span className="mono small" style={{ color, fontWeight: 600 }}>{value}%</span>
    </span>
  );
}

/* ---- Risk gauge (semicircle) ---- */
function RiskGauge({ score, size = 150 }) {
  const tone = score >= 80 ? "var(--green-strong)" : score >= 60 ? "var(--warn)" : "var(--danger)";
  const label = score >= 80 ? "Low Risk" : score >= 60 ? "Medium Risk" : "High Risk";
  const r = size / 2 - 12;
  const cx = size / 2, cy = size / 2;
  const circ = Math.PI * r; // semicircle length
  const pct = score / 100;
  return (
    <div className="gauge" style={{ width: size }}>
      <svg width={size} height={size / 2 + 16} viewBox={`0 0 ${size} ${size / 2 + 16}`}>
        <path d={`M ${12} ${cy} A ${r} ${r} 0 0 1 ${size - 12} ${cy}`} fill="none" stroke="var(--surface-sunken)" strokeWidth="11" strokeLinecap="round" />
        <path d={`M ${12} ${cy} A ${r} ${r} 0 0 1 ${size - 12} ${cy}`} fill="none" stroke={tone} strokeWidth="11" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} style={{ transition: "stroke-dashoffset 1s cubic-bezier(.2,.7,.2,1)" }} />
      </svg>
      <div style={{ marginTop: -size / 2 + 10, textAlign: "center" }}>
        <div className="num" style={{ fontFamily: "var(--display)", fontSize: size * 0.26, fontWeight: 700, color: tone, lineHeight: 1 }}>{score}</div>
        <div className="tiny muted" style={{ marginTop: 2 }}>out of 100</div>
      </div>
      <Badge tone={score >= 80 ? "green" : score >= 60 ? "amber" : "red"} dot>{label}</Badge>
    </div>
  );
}

/* ---- Avatar ---- */
function Avatar({ name, sq, color }) {
  const init = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return <div className={"avatar " + (sq ? "sq" : "")} style={color ? { background: color.bg, color: color.fg } : null}>{init}</div>;
}

/* ---- Key-Value ---- */
function KV({ k, v, mono }) {
  return <div className="kv"><span className="k">{k}</span><span className={"v " + (mono ? "mono" : "")}>{v}</span></div>;
}

/* ---- Bar chart ---- */
function BarChart({ data, height = 140, valueKey = "v", labelKey = "m", suffix = "K", color = "var(--green-strong)" }) {
  const max = Math.max(...data.map(d => d[valueKey])) * 1.1;
  return (
    <div className="row" style={{ alignItems: "flex-end", gap: 14, height, paddingTop: 8 }}>
      {data.map((d, i) => (
        <div key={i} className="stack" style={{ flex: 1, alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
          <div className="mono tiny strong" style={{ color: "var(--ink-2)" }}>{d[valueKey]}{suffix}</div>
          <div style={{ width: "100%", maxWidth: 46, height: (d[valueKey] / max * 100) + "%", background: i === data.length - 1 ? color : "var(--green-soft-2)", borderRadius: "6px 6px 0 0", transition: "height .8s cubic-bezier(.2,.7,.2,1)", minHeight: 4 }} />
          <div className="tiny muted">{d[labelKey]}</div>
        </div>
      ))}
    </div>
  );
}

/* ---- Donut ---- */
function Donut({ segments, size = 130, label, value }) {
  let acc = 0;
  const stops = segments.map(s => {
    const start = acc; acc += s.pct;
    return `${s.color} ${start}% ${acc}%`;
  }).join(", ");
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: `conic-gradient(${stops})` }} />
      <div style={{ position: "absolute", inset: size * 0.21, background: "var(--surface)", borderRadius: "50%", display: "grid", placeItems: "center" }}>
        <div className="center">
          <div style={{ fontFamily: "var(--display)", fontSize: size * 0.2, fontWeight: 700, lineHeight: 1 }}>{value}</div>
          <div className="tiny muted">{label}</div>
        </div>
      </div>
    </div>
  );
}

/* ---- Toast ---- */
const ToastCtx = createContext(null);
function useToast() { return useContext(ToastCtx); }
function ToastHost({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = (msg, icon = "checkCircle") => {
    const id = Math.random();
    setToasts(t => [...t, { id, msg, icon }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => <div key={t.id} className="toast"><Icon name={t.icon} /> {t.msg}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---- Modal ---- */
function Modal({ open, onClose, children, title, width = 520 }) {
  if (!open) return null;
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
        {title && (
          <div className="card-head" style={{ borderRadius: "var(--r-lg) var(--r-lg) 0 0" }}>
            <h3 style={{ flex: 1 }}>{title}</h3>
            <button className="btn btn-quiet btn-sm" onClick={onClose} style={{ width: 32, padding: 0 }}><Icon name="x" size={17} /></button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ---- Language Switcher ---- */
function LangSwitcher({ style }) {
  const cur = window._lang || "en";
  return (
    <select
      value={cur}
      onChange={e => window.setLang && window.setLang(e.target.value)}
      style={{
        height: 32, padding: "0 28px 0 10px", fontSize: 13, fontWeight: 600,
        border: "1px solid var(--line-2)", borderRadius: "var(--r-xs)",
        background: "var(--surface)", color: "var(--ink)", cursor: "pointer",
        appearance: "auto", flexShrink: 0, ...style
      }}>
      <option value="en">EN</option>
      <option value="uz">UZ</option>
      <option value="ru">RU</option>
    </select>
  );
}

/* ---- Field ---- */
function Field({ label, req, hint, error, children, prefix }) {
  return (
    <div className="field">
      {label && <label>{label}{req && <span className="req">*</span>}</label>}
      {prefix ? <div className="input-group"><span className="prefix">{prefix}</span>{children}</div> : children}
      {hint && !error && <div className="hint">{hint}</div>}
      {error && <div className="field-err">{error}</div>}
    </div>
  );
}

/* ---- Sidebar / portal layout ---- */
function Sidebar({ items, active, onNav, footer, open }) {
  return (
    <aside className={"sidebar" + (open ? " mobile-open" : "")}>
      <div style={{ padding: "18px 18px 6px" }}><Brand /></div>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 12 }}>
        {items.map((group, gi) => (
          <div className="nav-group" key={gi}>
            {group.label && <div className="nav-group-label">{group.label}</div>}
            {group.items.map(it => (
              <div key={it.id} className={"nav-item " + (active === it.id ? "active" : "")} onClick={() => onNav(it.id)}>
                <Icon name={it.icon} />
                <span>{it.label}</span>
                {it.badge != null && <span className="nav-badge">{it.badge}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
      {footer}
    </aside>
  );
}

function Topbar({ title, sub, role, user, onSwitch, right, onMenu }) {
  return (
    <header className="topbar">
      <button className="btn btn-quiet btn-sm topbar-menu-btn" onClick={onMenu} aria-label="Open navigation" style={{ padding: 0, width: 36 }}>
        <Icon name="menu" size={20} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: 17, letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        {sub && <div className="tiny muted topbar-sub">{sub}</div>}
      </div>
      {right}
      <LangSwitcher />
      <button className="btn btn-ghost btn-sm" onClick={onSwitch}><Icon name="refresh" size={14} /><span className="topbar-switch-label"> {window.t ? window.t('switch_role') : 'Switch role'}</span></button>
      <div className="topbar-divider" style={{ width: 1, height: 26, background: "var(--line)" }} />
      <div className="row" style={{ gap: 10 }}>
        <div className="stack topbar-user-text" style={{ alignItems: "flex-end", lineHeight: 1.25 }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{user}</span>
          <span className="tiny muted">{role}</span>
        </div>
        <Avatar name={user} sq />
      </div>
    </header>
  );
}

/* Portal scaffold */
function Portal({ nav, active, onNav, title, sub, role, user, onSwitch, topRight, navFooter, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleNav = (id) => { onNav(id); setSidebarOpen(false); };
  return (
    <div className="portal">
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <Sidebar items={nav} active={active} onNav={handleNav} footer={navFooter} open={sidebarOpen} />
      <div className="portal-main">
        <Topbar title={title} sub={sub} role={role} user={user} onSwitch={onSwitch} right={topRight} onMenu={() => setSidebarOpen(o => !o)} />
        <div className="portal-body fade-in" key={active}>{children}</div>
      </div>
    </div>
  );
}

/* page header */
function PageHead({ title, sub, actions, crumb }) {
  return (
    <div>
      {crumb}
      <div className="page-head">
        <div>
          <h1 className="page-title">{title}</h1>
          {sub && <div className="page-sub">{sub}</div>}
        </div>
        {actions && <div className="row" style={{ gap: 10 }}>{actions}</div>}
      </div>
    </div>
  );
}

/* placeholder doc thumb */
function DocThumb({ label, h = 120 }) {
  return <div className="ph" style={{ height: h, width: "100%" }}>{label}</div>;
}

Object.assign(window, {
  Brand, Btn, Badge, StatusBadge, Card, CardHead, Stat, Steps, CheckRow, Confidence,
  RiskGauge, Avatar, KV, BarChart, Donut, ToastHost, useToast, Modal, Field,
  Sidebar, Topbar, Portal, PageHead, DocThumb, LangSwitcher, STATUS_MAP,
});
