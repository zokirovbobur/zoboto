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
// Keep employee workload data consistent even if projects are removed independently.
window.TB_DATA.employees.forEach(e => {
  e.projectIds = (e.projectIds || []).filter(id => PROJ[id]);
  e.statusCounts = { completed: 0, progress: 0, planned: 0, paused: 0 };
  e.projectIds.forEach(id => {
    const norm = PROJ[id].norm;
    if (e.statusCounts[norm] !== undefined) e.statusCounts[norm]++;
  });
  e.totalMatched = e.projectIds.length;
  e.loadLevel = e.totalMatched >= 20 ? "critical" : e.totalMatched >= 12 ? "high" : e.totalMatched >= 6 ? "normal" : "low";
});
function projectPmKey(p) {
  return p.pmId && EMP[p.pmId] ? p.pmId : (p.pm || "");
}
function projectPmName(p) {
  return p.pmId && EMP[p.pmId] ? EMP[p.pmId].shortName : (p.pm || "");
}
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
  const dark = useTheme() === "dark";
  const bg = dark ? s.color + "22" : s.bg;
  return <span className="badge" style={{ color: dark ? s.dot : s.color, background: bg }}>
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
    <button className={"kpi" + (onClick ? " kpi-click" : "") + (tone === "active" ? " kpi-active" : "")} onClick={onClick} style={accent ? { "--kpi-accent": accent } : null}>
      <div className="kpi-val" style={accent ? { color: accent } : null}>{value}</div>
      <div className="kpi-label">{label}</div>
      {sub != null && <div className="kpi-sub">{sub}</div>}
    </button>
  );
}

// ---- theme hook (watches data-theme attribute) ----
function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute("data-theme") || "light");
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setTheme(document.documentElement.getAttribute("data-theme") || "light")
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

// patch hardcoded light grid colors to dark equivalents; leave custom colors untouched
function patchScales(scales, gridC, tickC) {
  if (!scales) return scales;
  const out = {};
  for (const [k, v] of Object.entries(scales)) {
    out[k] = { ...v };
    if (v.grid) {
      out[k].grid = { ...v.grid };
      if (v.grid.color === "#EEF2F8") out[k].grid.color = gridC;
    }
    out[k].ticks = { color: tickC, ...(v.ticks || {}) };
  }
  return out;
}

// ---- Chart.js wrapper ----
function Chart_({ type, data, options, height = 260, onClickIndex }) {
  const ref = useRef(null);
  const inst = useRef(null);
  const cb = useRef(onClickIndex);
  cb.current = onClickIndex;
  const theme = useTheme();
  const dark = theme === "dark";
  useEffect(() => {
    if (!ref.current || !window.Chart) return;
    const existing = window.Chart.getChart(ref.current);
    if (existing) existing.destroy();
    const gridC  = dark ? "rgba(255,255,255,0.09)" : "#EEF2F8";
    const tickC  = dark ? "#8A96AE" : "#888";
    const legC   = dark ? "#A8B4CC" : "#555";
    const patchedOpts = options ? {
      ...options,
      scales: patchScales(options.scales, gridC, tickC),
      plugins: options.plugins ? {
        ...options.plugins,
        legend: options.plugins.legend ? {
          ...options.plugins.legend,
          labels: { color: legC, ...(options.plugins.legend.labels || {}) },
        } : options.plugins.legend,
      } : options.plugins,
    } : options;
    const patchedData = dark ? {
      ...data,
      datasets: (data.datasets || []).map(ds => {
        let d = ds;
        if (d.borderColor === "#fff") d = { ...d, borderColor: "transparent", borderWidth: 0 };
        if (Array.isArray(d.backgroundColor)) {
          d = { ...d, backgroundColor: d.backgroundColor.map(c => c === "#D0D6E0" ? "#2A3450" : c) };
        }
        return d;
      }),
    } : data;
    inst.current = new window.Chart(ref.current, {
      type: type, data: patchedData,
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: false, animations: { colors: false, x: false, y: false },
        onClick: (evt, els) => {
          if (els && els.length && cb.current) cb.current(els[0].index);
        },
        ...patchedOpts,
      },
    });
    // container can measure 0 on first commit inside grid/flex — force a resize + draw
    const raf = requestAnimationFrame(() => { if (inst.current) { inst.current.resize(); inst.current.draw(); } });
    return () => { cancelAnimationFrame(raf); if (inst.current) inst.current.destroy(); };
  }, [JSON.stringify(data), type, theme]);
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
  "Trastpay":    { key: "SL",  color: "#2563EB", icon: "M3 10h18M7 15h.01M11 15h2M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z", url: JIRA_BASE + "/jira/software/projects/SL/summary" },
  "DBO":         { key: "KT",  color: "#138A5E", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10", url: JIRA_BASE + "/jira/software/projects/KT/summary" },
  "Food City":   { key: "FC",  color: "#D97706", icon: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0", url: JIRA_BASE + "/jira/software/projects/FC/summary" },
  "Middleware":  { key: "MW",  color: "#7C3AED", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5", url: JIRA_BASE + "/jira/software/projects/MW/summary" },
  "ABS":         { key: "ABS", color: "#0E7490", icon: "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01", url: JIRA_BASE + "/jira/software/projects/ABS/summary" },
  "AI products": { key: "AI",  color: "#9333EA", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", url: JIRA_BASE + "/jira/software/projects/AI/summary" },
};

const JIRA_TYPE_COLOR = { Bug: "#E11D48", Story: "#0EA5E9", Task: "#6366F1", Subtask: "#94A3B8", Epic: "#7C3AED" };
const JIRA_STATUS_COLOR = { "To Do": "#64748B", "In Progress": "#2563EB", "Done": "#138A5E", "In Review": "#D97706", "Blocked": "#E11D48" };

function JiraSection({ epicKey, product }) {
  const t = useT();
  const board = JIRA_BOARDS[product];
  const epicUrl = epicKey ? JIRA_BASE + "/browse/" + epicKey : (board ? board.url : null);

  // Use pre-fetched static data if available
  const staticItems = epicKey && window.TB_JIRA_ISSUES && window.TB_JIRA_ISSUES[epicKey];

  return (
    <div className="card">
      <div className="card-h">
        <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
          </svg>
          Jira
          {epicKey && <a href={epicUrl} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ fontSize: 11, fontWeight: 600, color: "#2563EB", textDecoration: "none",
                     background: "#EFF6FF", borderRadius: 4, padding: "2px 6px" }}>
            {epicKey} ↗
          </a>}
        </h3>
        {staticItems && <span className="hint">{staticItems.length} {t("jira_issues_count")}</span>}
      </div>

      <div className="card-pad">
        {!epicKey && <div className="muted" style={{ fontSize: 13 }}>{t("jira_no_epic")}</div>}
        {epicKey && !staticItems && (
          <div className="muted" style={{ fontSize: 13 }}>{t("jira_no_issues")}</div>
        )}
        {staticItems && staticItems.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {staticItems.map(iss => {
              const tc = JIRA_TYPE_COLOR[iss.type] || "#64748B";
              const sc = JIRA_STATUS_COLOR[iss.status] || "#64748B";
              return (
                <a key={iss.key} href={JIRA_BASE + "/browse/" + iss.key} target="_blank" rel="noopener noreferrer"
                   onClick={e => e.stopPropagation()}
                   style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0",
                            borderBottom: "1px solid var(--line-2)", textDecoration: "none", color: "inherit" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: tc, background: tc + "18",
                                 borderRadius: 4, padding: "2px 5px", flexShrink: 0 }}>{iss.type}</span>
                  <span style={{ flex: 1, fontSize: 12.5, color: iss.done ? "var(--muted)" : "var(--ink)",
                                 textDecoration: iss.done ? "line-through" : "none", lineHeight: 1.35 }}>{iss.summary}</span>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#2563EB" }}>{iss.key}</span>
                    <span style={{ fontSize: 10, color: sc, background: sc + "18", borderRadius: 4, padding: "1px 5px", whiteSpace: "nowrap" }}>{iss.status}</span>
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PurchasedBadge({ tooltip }) {
  return (
    <span title={tooltip}
          style={{ display:"inline-flex", alignItems:"center", marginLeft:5,
                   color:"#7C3AED", opacity:.75, flexShrink:0, cursor:"default",
                   verticalAlign:"middle" }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    </span>
  );
}

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
  Chart_, ToastHost, useToast, PageHead, prodShort, JIRA_BASE, JIRA_BOARDS, JiraLink, PurchasedBadge, JiraSection,
});
