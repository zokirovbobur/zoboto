// ===== app shell: sidebar, topbar, language, routing =====
const { useState: uSA, useEffect: uEA, useRef: uRA } = React;

const SYNC_UPDATES = [
  { type: "warn", date: "2026-06-15", text_uz: "⚠️ Visa Direct: data.js dagi status «Стоппер» bo'lsa ham, sheet va git da «В продакшне» — qo'lda tekshirish tavsiya etiladi", text_ru: "⚠️ Visa Direct: статус в data.js «Стоппер», хотя в sheet и git — «В продакшне» — рекомендуется проверить вручную" },
  { type: "new", date: "2026-06-15", text_uz: "Yangi: Banking Middleware, ABS & Islamic Banking (Trastbank | Raqamli)", text_ru: "Добавлено: Banking Middleware, ABS & Islamic Banking (Trastbank | Raqamli)" },
  { type: "new", date: "2026-06-15", text_uz: "Yangi: Sistema analizi uchun Prometheus va Grafana integratsiyasi (DBO)", text_ru: "Добавлено: Prometheus va Grafana для анализа системы (DBO)" },
  { type: "new", date: "2026-06-15", text_uz: "Yangi: Camera card scan, Humo moment card, Tez QR (Trastpay 2.0)", text_ru: "Добавлено: Camera card scan, Humo moment card, Tez QR (Trastpay 2.0)" },
  { type: "info", date: "2026-06-15", text_uz: "«interests - Trastpay» tab olib tashlandi — 18 ta qiziqish arxivlandi", text_ru: "Вкладка «interests - Trastpay» удалена — 18 интересов архивировано" },
  { type: "info", date: "2026-06-15", text_uz: "Tab nomlari yangilandi: Trastpay 2.0, DBO, Trastbank | Raqamli", text_ru: "Обновлены названия вкладок: Trastpay 2.0, DBO, Trastbank | Raqamli" },
];

function BellPanel({ lang, onClose }) {
  const ref = uRA(null);
  uEA(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const lk = lang === "ru" ? "text_ru" : "text_uz";
  const typeColor = { warn: "#C2410C", new: "#138A5E", info: "#2563EB" };
  const typeBg   = { warn: "#FEF3C7", new: "#E4F3EB", info: "#E7EEFD" };
  const typeLabel = { warn: "!", new: "+", info: "i" };
  return (
    <div ref={ref} style={{
      position:"absolute", top:"calc(100% + 8px)", right:0, width:360, maxHeight:440,
      background:"#fff", border:"1px solid #E5EAF2", borderRadius:14,
      boxShadow:"0 12px 40px rgba(16,30,60,.18)", zIndex:500, overflow:"hidden",
      display:"flex", flexDirection:"column"
    }}>
      <div style={{padding:"14px 16px 10px", borderBottom:"1px solid #EEF2F8", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <span style={{fontWeight:700, fontSize:14, color:"#16203A"}}>
          {lang === "ru" ? "Последние обновления" : "Oxirgi yangilanishlar"}
        </span>
        <span style={{fontSize:11, color:"#8A93A6"}}>2026-06-15 · git sync</span>
      </div>
      <div style={{overflowY:"auto", flex:1}}>
        {SYNC_UPDATES.map((u, i) => (
          <div key={i} style={{display:"flex", gap:10, padding:"11px 16px", borderBottom:"1px solid #F2F5FA"}}>
            <div style={{
              width:20, height:20, borderRadius:6, background:typeBg[u.type],
              color:typeColor[u.type], display:"grid", placeItems:"center",
              fontSize:12, fontWeight:700, flex:"none", marginTop:1
            }}>{typeLabel[u.type]}</div>
            <div style={{fontSize:13, color:"#16203A", lineHeight:1.45}}>{u[lk]}</div>
          </div>
        ))}
      </div>
      <div style={{padding:"10px 16px", borderTop:"1px solid #EEF2F8", fontSize:11, color:"#8A93A6", textAlign:"center"}}>
        {lang === "ru" ? "Последний коммит: 32a8ca6" : "Oxirgi commit: 32a8ca6"}
      </div>
    </div>
  );
}

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
  const [sideOpen, setSideOpen] = uSA(false);
  const [bellOpen, setBellOpen] = uSA(false);

  uEA(() => { localStorage.setItem("tb_lang", lang); document.documentElement.lang = lang; }, [lang]);
  uEA(() => { window.scrollTo(0, 0); const m = document.querySelector(".main"); if (m) m.scrollTop = 0; }, [route]);

  const nav = (name, params = {}) => { setSearch(""); setRoute({ name, ...params }); setSideOpen(false); };
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
                      {it.count && <span className="badge-n">{it.count()}</span>}
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

              <div style={{position:"relative"}}>
                <button onClick={() => setBellOpen(o => !o)} style={{
                  width:36, height:36, borderRadius:9, background: bellOpen ? "var(--accent-soft)" : "var(--bg)",
                  border:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:"pointer", position:"relative", transition:".12s", flexShrink:0
                }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={bellOpen ? "var(--accent)" : "var(--muted)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  <span style={{
                    position:"absolute", top:5, right:5, width:7, height:7,
                    background:"#EF4444", borderRadius:"50%", border:"2px solid #fff"
                  }}/>
                </button>
                {bellOpen && <BellPanel lang={lang} onClose={() => setBellOpen(false)} />}
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
