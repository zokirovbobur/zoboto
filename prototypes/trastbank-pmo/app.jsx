// ===== app shell: sidebar, topbar, language, routing =====
const { useState: uSA, useEffect: uEA } = React;

const IconPaths = {
  dashboard: "M3 3h7v7H3zM14 3h7v4h-7zM14 10h7v11h-7zM3 13h7v8H3z",
  portfolio: "M4 5h16M4 12h16M4 19h16",
  board: "M4 4h4v16H4zM10 4h4v16h-4zM16 4h4v16h-4z",
  roadmap: "M4 6h16M4 6v12M8 10h12M8 10v8M12 14h8",
  workload: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M18 8v6M21 11h-6",
  risks: "M12 3l9 16H3zM12 10v4M12 17h.01",
  reports: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6",
};
function Icon({ name, size = 18 }) {
  const stroke = ["portfolio", "board", "roadmap", "workload", "risks", "reports"].includes(name);
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
    { id: "board", icon: "board", label: "nav_board" },
    { id: "roadmap", icon: "roadmap", label: "nav_roadmap" },
  ]},
  { group: "nav_group_people", items: [
    { id: "workload", icon: "workload", label: "nav_workload", count: () => DATA.employees.length },
  ]},
  { group: "nav_group_control", items: [
    { id: "risks", icon: "risks", label: "nav_risks", count: () => ALL_P.filter(p => p.norm === "paused" || isOverdue(p)).length },
    { id: "reports", icon: "reports", label: "nav_reports" },
  ]},
];

const PAGES = {
  dashboard: Dashboard, portfolio: Portfolio, board: StatusBoard, roadmap: Roadmap,
  workload: Workload, employee: EmployeeProfile, project: ProjectDetail, risks: Risks, reports: Reports,
};
// which sidebar item is highlighted for a given route
const ACTIVE_OF = { project: "portfolio", employee: "workload" };

function App() {
  const [lang, setLang] = uSA(() => localStorage.getItem("tb_lang") || "uz");
  const [route, setRoute] = uSA({ name: "dashboard" });
  const [search, setSearch] = uSA("");

  uEA(() => { localStorage.setItem("tb_lang", lang); document.documentElement.lang = lang; }, [lang]);
  uEA(() => { window.scrollTo(0, 0); const m = document.querySelector(".main"); if (m) m.scrollTop = 0; }, [route]);

  const nav = (name, params = {}) => { setSearch(""); setRoute({ name, ...params }); };
  const dict = window.TB_I18N[lang];
  const t = (k) => (dict && dict[k] != null ? dict[k] : k);
  const activeId = ACTIVE_OF[route.name] || route.name;
  const Page = PAGES[route.name] || Dashboard;

  return (
    <AppCtx.Provider value={{ lang, nav, route, search }}>
      <ToastHost>
        <div className="app">
          <aside className="sidebar">
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
                      {it.count && <span className="badge-n">{it.count()}</span>}
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          </aside>

          <div className="main">
            <header className="topbar">
              <div className="search-box">
                <svg className="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={route.name === "workload" ? t("searchEmp") : t("search")}
                  onFocus={() => { if (!["portfolio", "board", "workload"].includes(route.name)) nav("portfolio"); }} />
              </div>
              <div className="topbar-spacer" />
              <div className="topbar-meta">
                <div><b>{t("lastUpdated")}:</b> {DATA.meta.generated}</div>
                <div>{ALL_P.length} {t("projects")} · {DATA.employees.length} {t("employees")}</div>
              </div>
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
