// ===== app shell: sidebar, topbar, language, routing =====
const { useState: uSA, useEffect: uEA, useRef: uRA } = React;

function parseRouteFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (!hash) return { name: "dashboard" };
  const parts = hash.split("/");
  const name = parts[0];
  if ((name === "project" || name === "employee") && parts[1]) {
    return { name, id: parts[1] };
  }
  if (window.PAGES_MAP && window.PAGES_MAP[name]) return { name };
  return { name: "dashboard" };
}

function routeToHash(name, params) {
  if (!name || name === "dashboard") return "#";
  if ((name === "project" || name === "employee") && params && params.id) {
    return "#" + name + "/" + params.id;
  }
  return "#" + name;
}

const IconPaths = {
  dashboard: "M3 3h7v7H3zM14 3h7v4h-7zM14 10h7v11h-7zM3 13h7v8H3z",
  devops: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  portfolio: "M4 5h16M4 12h16M4 19h16",
  board: "M4 4h4v16H4zM10 4h4v16h-4zM16 4h4v16h-4z",
  roadmap: "M4 6h16M4 6v12M8 10h12M8 10v8M12 14h8",
  workload: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M18 8v6M21 11h-6",
  risks: "M12 3l9 16H3zM12 10v4M12 17h.01",
  reports: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6",
  products: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12",
  changes: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
};
function Icon({ name, size = 18 }) {
  const stroke = ["portfolio", "board", "roadmap", "workload", "risks", "reports", "products", "changes", "devops"].includes(name);
  return (
    <svg className="ic" width={size} height={size} viewBox="0 0 24 24"
      fill={stroke ? "none" : "currentColor"} stroke={stroke ? "currentColor" : "none"}
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d={IconPaths[name]} />
    </svg>
  );
}

const NAV = [
  { group: "nav_group_overview", items: [
    { id: "dashboard", icon: "dashboard", label: "nav_dashboard" },
    { id: "portfolio", icon: "portfolio", label: "nav_portfolio", count: () => ALL_P.length },
    { id: "changes", icon: "changes", label: "nav_changes" },
    { id: "roadmap", icon: "roadmap", label: "nav_roadmap" },
  ]},
  { group: "nav_group_people", items: [
    { id: "workload", icon: "workload", label: "nav_workload", count: () => DATA.employees.length },
  ]},
  { group: "nav_group_control", items: [
    { id: "risks", icon: "risks", label: "nav_risks", warn: true, count: () => (window.STOPPERS || []).filter(s => s.open).length },
    { id: "reports", icon: "reports", label: "nav_reports" },
  ]},
];

const PAGES = {
  dashboard: Dashboard, portfolio: Portfolio, board: StatusBoard, roadmap: Roadmap,
  workload: Workload, employee: EmployeeProfile, project: ProjectDetail, risks: Risks, reports: Reports,
  products: Products, changes: RecentChanges, devops: DevopsReport,
};
window.PAGES_MAP = PAGES;
// which sidebar item is highlighted for a given route
const ACTIVE_OF = { project: "portfolio", employee: "workload" };

function App() {
  const [lang, setLang] = uSA(() => localStorage.getItem("tb_lang") || "uz");
  const [route, setRoute] = uSA(() => parseRouteFromHash());
  const [search, setSearch] = uSA("");
  const [sideOpen, setSideOpen] = uSA(false);
  const [bellOpen, setBellOpen] = uSA(false);
  const [dark, setDark] = uSA(() => localStorage.getItem("tb_theme") === "dark");
  const bellRef = uRA(null);
  uEA(() => {
    if (!bellOpen) return;
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bellOpen]);

  uEA(() => { localStorage.setItem("tb_lang", lang); document.documentElement.lang = lang; }, [lang]);
  uEA(() => {
    localStorage.setItem("tb_theme", dark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);
  uEA(() => { window.scrollTo(0, 0); const m = document.querySelector(".main"); if (m) m.scrollTop = 0; }, [route]);

  uEA(() => {
    const onHash = () => setRoute(parseRouteFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const nav = (name, params = {}) => {
    window.location.hash = routeToHash(name, params);
    setSearch(""); setRoute({ name, ...params }); setSideOpen(false);
  };
  const dict = window.TB_I18N[lang];
  const t = (k) => (dict && dict[k] != null ? dict[k] : k);
  const activeId = ACTIVE_OF[route.name] || route.name;
  const Page = PAGES[route.name] || Dashboard;

  return (
    <AppCtx.Provider value={{ lang, nav, route, search }}>
      <ToastHost>
        <div className="app">
          <div className={"sidebar-ov" + (sideOpen ? " on" : "")} onClick={() => setSideOpen(false)} />
          <aside className={"sidebar" + (sideOpen ? " on" : "")}>
            <div className="brand">
              <div className="brand-mark"><span>T</span></div>
              <div className="brand-txt"><b>Trastbank</b><small>Reporting Board</small></div>
            </div>
            <nav className="nav">
              {NAV.map(g => (
                <div className="nav-group" key={g.group}>
                  <div className="nav-group-t">{t(g.group)}</div>
                  {g.items.map(it => (
                    <button key={it.id} className={"nav-item" + (activeId === it.id ? " active" : "")} onClick={() => nav(it.id)}>
                      <Icon name={it.icon} />
                      <span>{t(it.label)}</span>
                      {it.count && <span className={"badge-n" + (it.warn ? " badge-n-warn" : "")}>{it.count()}</span>}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          </aside>

          <div className="main">
            <header className="topbar">
              <button className="mob-btn" onClick={() => setSideOpen(o => !o)} aria-label="Menu">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
              <div className="search-box">
                <svg className="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={route.name === "workload" ? t("searchEmp") : t("search")}
                  onFocus={() => { if (!["portfolio", "board", "workload"].includes(route.name)) nav("portfolio"); }} />
              </div>
              <div className="topbar-spacer" />

              <div style={{ position: "relative" }} ref={bellRef}>
                <button className="btn" style={{ padding: "0 10px", height: 38, position: "relative" }}
                  onClick={() => setBellOpen(o => !o)} title={t("bell_title")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  {(window.RECENT_LAUNCHES || []).length > 0 && (
                    <span style={{ position: "absolute", top: 7, right: 7, width: 7, height: 7, borderRadius: "50%", background: "#138A5E", border: "1.5px solid var(--card)" }} />
                  )}
                </button>
                {bellOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, width: 320, background: "var(--modal-bg)",
                                borderRadius: 12, border: "1px solid var(--line)", boxShadow: "var(--shadow-lg)",
                                zIndex: 100, overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line-2)", fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>
                      {t("bell_title")}
                    </div>
                    <div style={{ maxHeight: 320, overflowY: "auto" }}>
                      {(window.RECENT_LAUNCHES || []).map(item => {
                        const board = JIRA_BOARDS[item.product];
                        const name = lang === "ru" ? item.name_ru : item.name_uz;
                        return (
                          <div key={item.id} style={{ padding: "10px 16px", borderBottom: "1px solid var(--line-2)", cursor: "pointer" }}
                            onClick={() => { nav("changes"); setBellOpen(false); }}>
                            <div style={{ fontSize: 11, color: "var(--muted-2)", marginBottom: 3 }}>{item.date}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", lineHeight: 1.35, marginBottom: 5 }}>{name}</div>
                            {board && <span style={{ fontSize: 11, fontWeight: 600, color: board.color, background: board.color + "18", borderRadius: 4, padding: "1px 7px" }}>{item.product}</span>}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ padding: "10px 16px", borderTop: "1px solid var(--line-2)" }}>
                      <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: 12 }}
                        onClick={() => { nav("changes"); setBellOpen(false); }}>
                        {t("viewAll")} →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button className="theme-toggle" onClick={() => setDark(d => !d)} title={dark ? "Light mode" : "Dark mode"}>
                {dark
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                }
              </button>
              <div className="lang-switch">
                {window.TB_LANGS.map(l => (
                  <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
                ))}
              </div>
            </header>
            <main className="content" key={route.name + (route.id || "")}>
              <Page />
            </main>
          </div>
        </div>
      </ToastHost>
    </AppCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
