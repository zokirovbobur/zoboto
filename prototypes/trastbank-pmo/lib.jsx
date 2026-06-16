// ===== Trastbank Reporting Board — shared lib =====
const { useState, useEffect, useRef, useMemo, createContext, useContext, useCallback } = React;

// ---- i18n context ----
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);
const useT = () => {
  const { lang } = useApp();
  const dict = window.TB_I18N[lang];
  return (k) => (dict && dict[k] != null ? dict[k] : k);
};

// ---- status meta ----
const STATUS = {
  completed: { key: "st_completed", short: "st_completed_s", color: "#138A5E", bg: "#E4F3EB", dot: "#1AA568" },
  progress:  { key: "st_progress",  short: "st_progress_s",  color: "#2563EB", bg: "#E7EEFD", dot: "#3B82F6" },
  planned:   { key: "st_planned",   short: "st_planned_s",   color: "#6D5CD6", bg: "#ECEAFB", dot: "#7C6CE0" },
  paused:    { key: "st_paused",    short: "st_paused_s",    color: "#C2410C", bg: "#FBEADD", dot: "#E0792F" },
};
const STATUS_ORDER = ["completed", "progress", "planned", "paused"];

// progress % by normalized status (visual heuristic for the prototype)
function progressOf(p) {
  if (p.norm === "completed") return 100;
  if (p.norm === "progress") return 55;
  if (p.norm === "planned") return 8;
  return 0;
}

// ---- date helpers (source format DD.MM.YYYY) ----
function parseDate(s) {
  if (!s) return null;
  const m = String(s).match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
  if (!m) return null;
  let [_, d, mo, y] = m;
  if (y.length === 2) y = "20" + y;
  const dt = new Date(+y, +mo - 1, +d);
  return isNaN(dt) ? null : dt;
}
const MONTHS = {
  uz: ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"],
  ru: ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"],
  en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
};
function fmtDate(s, lang) {
  const dt = parseDate(s);
  if (!dt) return s || "—";
  return `${String(dt.getDate()).padStart(2,"0")} ${MONTHS[lang][dt.getMonth()]} ${dt.getFullYear()}`;
}
const NOW = new Date(2026, 5, 11); // platform "today" = 11 Jun 2026
function isOverdue(p) {
  if (p.norm === "completed" || p.norm === "paused") return false;
  const d = parseDate(p.endDate);
  return d && d < NOW;
}
function fmtSum(s) {
  if (!s) return "";
  if (/^[\d\s]+$/.test(s)) {
    const n = +s.replace(/\s/g, "");
    if (n >= 1e9) return (n / 1e9).toFixed(n % 1e9 === 0 ? 0 : 2).replace(/\.00$/,"") + " mlrd so'm";
    if (n >= 1e6) return (n / 1e6).toFixed(0) + " mln so'm";
    return n.toLocaleString("ru-RU") + " so'm";
  }
  return s; // e.g. "ГПХ"
}

// ---- people helpers ----
const EMP = {}; window.TB_DATA.employees.forEach(e => { EMP[e.id] = e; });
const PROJ = {}; window.TB_DATA.projects.forEach(p => { PROJ[p.id] = p; });
function initials(name) {
  const parts = String(name).trim().split(/\s+/);
  return ((parts[0]||"")[0] || "") + ((parts[1]||"")[0] || "");
}
const AV_COLORS = ["#0E2A52","#2563EB","#138A5E","#6D5CD6","#C2410C","#0E7490","#9333EA","#B45309"];
function avColor(name) {
  let h = 0; for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) | 0;
  return AV_COLORS[Math.abs(h) % AV_COLORS.length];
}
function Avatar({ name, size = 30 }) {
  return (
    <span className="avatar" style={{ width: size, height: size, background: avColor(name), fontSize: size * 0.4 }}>
      {initials(name).toUpperCase()}
    </span>
  );
}

// ---- small components ----
function StatusBadge({ norm, mini }) {
  const t = useT(); const s = STATUS[norm];
  return <span className="badge" style={{ color: s.color, background: s.bg }}>
    <span className="badge-dot" style={{ background: s.dot }} />{t(mini ? s.short : s.short)}
  </span>;
}
function Progress({ value, norm }) {
  const color = STATUS[norm] ? STATUS[norm].color : "#2563EB";
  return <div className="progress"><div className="progress-fill" style={{ width: value + "%", background: color }} /></div>;
}
function Pill({ children, tone }) {
  return <span className={"pill pill-" + (tone || "neutral")}>{children}</span>;
}

// ---- KPI card ----
function KPI({ label, value, tone, sub, onClick, accent }) {
  return (
    <button className={"kpi" + (onClick ? " kpi-click" : "")} onClick={onClick} style={accent ? { "--kpi-accent": accent } : null}>
      <div className="kpi-val" style={accent ? { color: accent } : null}>{value}</div>
      <div className="kpi-label">{label}</div>
      {sub != null && <div className="kpi-sub">{sub}</div>}
    </button>
  );
}

// ---- Chart.js wrapper ----
function Chart_({ type, data, options, height = 260, onClickIndex }) {
  const ref = useRef(null);
  const inst = useRef(null);
  const cb = useRef(onClickIndex);
  cb.current = onClickIndex;
  useEffect(() => {
    if (!ref.current || !window.Chart) return;
    const existing = window.Chart.getChart(ref.current);
    if (existing) existing.destroy();
    inst.current = new window.Chart(ref.current, {
      type, data,
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: false, animations: { colors: false, x: false, y: false },
        onClick: (evt, els) => {
          if (els && els.length && cb.current) cb.current(els[0].index);
        },
        ...options,
      },
    });
    // container can measure 0 on first commit inside grid/flex — force a resize + draw
    const raf = requestAnimationFrame(() => { if (inst.current) { inst.current.resize(); inst.current.draw(); } });
    return () => { cancelAnimationFrame(raf); if (inst.current) inst.current.destroy(); };
  }, [JSON.stringify(data), type]);
  return <div style={{ height, position: "relative", width: "100%", minWidth: 0 }}><canvas ref={ref} /></div>;
}

// ---- Toast ----
const ToastCtx = createContext(() => {});
const useToast = () => useContext(ToastCtx);
function ToastHost({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-host">
        {toasts.map(t => <div key={t.id} className="toast"><span className="toast-ico">✓</span>{t.msg}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}

// ---- section header ----
function PageHead({ title, sub, right, crumbs }) {
  const { nav } = useApp(); const t = useT();
  return (
    <div className="pagehead">
      <div>
        {crumbs && <div className="crumbs">
          {crumbs.map((c, i) => <React.Fragment key={i}>
            {i > 0 && <span className="crumb-sep">/</span>}
            {c.to ? <a className="crumb" onClick={() => nav(c.to)}>{c.label}</a> : <span className="crumb crumb-cur">{c.label}</span>}
          </React.Fragment>)}
        </div>}
        <h1 className="page-title">{title}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
      {right && <div className="pagehead-right">{right}</div>}
    </div>
  );
}

// product short label
function prodShort(p) {
  return p.length > 22 ? p.slice(0, 21) + "…" : p;
}

// ---- Jira integration ----
const JIRA_BASE = "https://test-tb.atlassian.net";
const JIRA_BOARDS = {
  "Trastpay":    { key: "SL",  url: JIRA_BASE + "/jira/software/projects/SL/boards" },
  "ДБО":         { key: "KT",  url: JIRA_BASE + "/jira/software/projects/KT/boards" },
  "Food City":   { key: "FC",  url: JIRA_BASE + "/jira/software/projects/FC/boards" },
  "Middleware":  { key: "MW",  url: JIRA_BASE + "/jira/software/projects/MW/boards" },
  "ABS":         { key: "ABS", url: JIRA_BASE + "/jira/software/projects/ABS/boards" },
  "AI products": { key: "AI",  url: JIRA_BASE + "/jira/software/projects/AI/boards" },
};

function JiraLink({ epicKey, product, style: extStyle }) {
  const url = epicKey
    ? JIRA_BASE + "/browse/" + epicKey
    : (JIRA_BOARDS[product] ? JIRA_BOARDS[product].url : null);
  if (!url) return null;
  const label = epicKey || (JIRA_BOARDS[product] ? JIRA_BOARDS[product].key : "");
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
       onClick={e => e.stopPropagation()}
       title={"Jira: " + label}
       style={{ display:"inline-flex", alignItems:"center", gap:3, marginLeft:5,
                color:"#2563EB", opacity:.65, flexShrink:0, textDecoration:"none",
                fontSize:10, fontWeight:600, verticalAlign:"middle", ...extStyle }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
      {epicKey && <span style={{fontSize:9.5}}>{epicKey}</span>}
    </a>
  );
}

Object.assign(window, {
  AppCtx, useApp, useT, STATUS, STATUS_ORDER, progressOf, parseDate, fmtDate, isOverdue, fmtSum,
  NOW, MONTHS, EMP, PROJ, initials, avColor, Avatar, StatusBadge, Progress, Pill, KPI,
  Chart_, ToastHost, useToast, PageHead, prodShort, JIRA_BASE, JIRA_BOARDS, JiraLink,
});
