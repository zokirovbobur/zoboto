// ===== views3: Roadmap, Risks & Incidents, Reports =====
const { useState: uS3, useMemo: uM3, useEffect: uE3, useRef: uR3, useCallback: uCB3 } = React;

function useDragScroll() {
  const ref = uR3(null);
  const drag = uR3({ active: false, x: 0, sl: 0 });
  const onDown = uCB3(e => {
    const el = ref.current; if (!el) return;
    drag.current = { active: true, x: e.clientX, sl: el.scrollLeft };
    el.style.cursor = "grabbing"; el.style.userSelect = "none";
  }, []);
  const onMove = uCB3(e => {
    if (!drag.current.active) return;
    const el = ref.current; if (!el) return;
    el.scrollLeft = drag.current.sl - (e.clientX - drag.current.x);
  }, []);
  const onUp = uCB3(() => {
    drag.current.active = false;
    const el = ref.current; if (!el) return;
    el.style.cursor = "grab"; el.style.userSelect = "";
  }, []);
  return { ref, onMouseDown: onDown, onMouseMove: onMove, onMouseUp: onUp, onMouseLeave: onUp };
}

function useTheme3() {
  const [t, setT] = uS3(() => document.documentElement.getAttribute("data-theme") || "light");
  uE3(() => {
    const obs = new MutationObserver(() => setT(document.documentElement.getAttribute("data-theme") || "light"));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return t;
}

const STOPPERS = [
  {
    id: "ST-1",
    area: "Trastpay",
    sev: "P0",
    title_uz: "Trastpay uchun Head of Product ishga olishda to'siqlar mavjud",
    title_ru: "Блокировка найма Head of Product для Trastpay",
    consequence_uz: "Trastpay mahsulot strategiyasi boshqaruvsiz qoladi; roadmap kechikadi; jamoa fokusi yo'qoladi va raqobatchilardan orqada qolinadi",
    consequence_ru: "Продуктовая стратегия Trastpay остаётся без управления; roadmap срывается; команда теряет фокус и отстаёт от конкурентов",
    owner: "CPO / Boshqaruv kengashi",
    open: true,
  },
  {
    id: "ST-2",
    area: "Islomiy banking",
    sev: "P1",
    title_uz: "Islom bankiga doir loyihalar to'xtab qolgan",
    title_ru: "Проекты исламского банкинга приостановлены",
    consequence_uz: "Regulyator oldidagi majburiyatlar bajarilmaydi; potentsial jarimalar va litsenziya muammolari yuzaga kelishi mumkin",
    consequence_ru: "Не выполняются обязательства перед регулятором; возможны штрафы и проблемы с лицензированием",
    owner: "—",
    open: true,
  },
  {
    id: "ST-3",
    area: "Trastbank.uz",
    sev: "P1",
    title_uz: "trastbank.uz sayti loyihasi to'xtab qolgan",
    title_ru: "Проект сайта trastbank.uz заморожен",
    consequence_uz: "Bank imidji zarar ko'radi; mijozlar va hamkorlar uchun rasmiy ma'lumot manbai mavjud emas; marketing aktivliklari bloklanadi",
    consequence_ru: "Имидж банка страдает; нет официального источника информации для клиентов и партнёров; блокируются маркетинговые активности",
    owner: "—",
    open: true,
  },
  {
    id: "ST-4",
    area: "Infratuzilma",
    sev: "P0",
    title_uz: "Dasturchilardan internet access uzib qo'yilgan",
    title_ru: "У разработчиков отключён доступ в интернет",
    consequence_uz: "Ishlab chiqish tezligi keskin pasayadi; zamonaviy kutubxonalar va yangilanishlardan foydalanish imkonsiz; xavfsizlik zaifliklarini bartaraf etish qiyinlashadi; eng yaxshi mutaxassislar kompaniyani tark etishi mumkin",
    consequence_ru: "Скорость разработки резко падает; невозможно использовать современные библиотеки и обновления; устранение уязвимостей затрудняется; лучшие специалисты могут покинуть компанию",
    owner: "IT infratuzilma",
    open: true,
  },
];

// ---------- ROADMAP / TIMELINE ----------
function Roadmap() {
  const t = useT(); const { nav, lang } = useApp();
  const [product, setProduct] = uS3("all");
  const [status, setStatus] = uS3("all");
  const dragScroll = useDragScroll();

  const dated = uM3(() => ALL_P.filter(p => parseDate(p.startDate) && parseDate(p.endDate)), []);
  const range = uM3(() => {
    // base the visible window on active projects so old cancelled outliers don't crush the scale
    const base = dated.filter(p => p.norm !== "paused");
    let lo = Infinity, hi = -Infinity;
    (base.length ? base : dated).forEach(p => { lo = Math.min(lo, +parseDate(p.startDate)); hi = Math.max(hi, +parseDate(p.endDate)); });
    return { lo, hi };
  }, [dated]);

  const filtered = dated.filter(p => (product === "all" || p.product === product) && (status === "all" || p.norm === status));
  const groups = uM3(() => {
    const g = {}; filtered.forEach(p => { (g[p.product] = g[p.product] || []).push(p); });
    return Object.entries(g).sort((a, b) => b[1].length - a[1].length);
  }, [product, status]);

  const span = range.hi - range.lo || 1;
  const clamp = (v) => Math.max(0, Math.min(100, v));
  const pct = (d) => clamp(((+parseDate(d) - range.lo) / span) * 100);
  // month ticks
  const ticks = uM3(() => {
    const arr = []; const start = new Date(range.lo); start.setDate(1);
    const end = new Date(range.hi);
    let cur = new Date(start);
    while (cur <= end) { arr.push(new Date(cur)); cur.setMonth(cur.getMonth() + 1); }
    return arr;
  }, [range]);
  const tickPct = (d) => ((+d - range.lo) / span) * 100;

  const prods = DATA.products;
  const noDate = ALL_P.filter(p => !parseDate(p.startDate) || !parseDate(p.endDate)).filter(p => (product === "all" || p.product === product) && (status === "all" || p.norm === status));

  return (
    <div className="fade-in">
      <PageHead title={t("nav_roadmap")} crumbs={[{ label: t("nav_dashboard"), to: "dashboard" }, { label: t("nav_roadmap") }]} />
      <div className="filterbar">
        <div className="sel"><select className="f-sel" value={product} onChange={e => setProduct(e.target.value)}>
          <option value="all">{t("col_product")}: {t("all")}</option>{prods.map(p => <option key={p}>{p}</option>)}</select></div>
        <div className="sel"><select className="f-sel" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">{t("normStatus")}: {t("all")}</option>{STATUS_ORDER.map(s => <option key={s} value={s}>{t(STATUS[s].short)}</option>)}</select></div>
        <button className="btn btn-ghost" onClick={() => { setProduct("all"); setStatus("all"); }}>↺ {t("resetFilters")}</button>
        <div className="legend" style={{ marginLeft: "auto" }}>
          {STATUS_ORDER.map(s => <span key={s}><i style={{ background: STATUS[s].color }} />{t(STATUS[s].short)}</span>)}
        </div>
      </div>

      <div className="card card-pad" style={{ overflowX: "auto", cursor: "grab" }}
        ref={dragScroll.ref}
        onMouseDown={dragScroll.onMouseDown}
        onMouseMove={dragScroll.onMouseMove}
        onMouseUp={dragScroll.onMouseUp}
        onMouseLeave={dragScroll.onMouseLeave}
      >
        <div style={{ minWidth: 760, position: "relative" }}>
          {/* month header */}
          <div style={{ position: "relative", height: 22, marginLeft: 220, borderBottom: "1px solid var(--line)", marginBottom: 8 }}>
            {ticks.map((d, i) => <div key={i} style={{ position: "absolute", left: tickPct(d) + "%", fontSize: 10.5, color: "var(--muted-2)", fontWeight: 600, transform: "translateX(-2px)" }}>{MONTHS[lang][d.getMonth()]}<span style={{ position: "absolute", top: 20, left: 0, width: 1, height: 9999, background: "var(--line-2)" }} /></div>)}
          </div>
          {groups.map(([prod, items]) => (
            <div key={prod} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>{prod} <span className="muted" style={{ fontWeight: 500 }}>· {items.length}</span></div>
              {items.map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", height: 30 }}>
                  <div style={{ width: 220, flex: "none", fontSize: 12, paddingRight: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }} onClick={() => nav("project", { id: p.id })}>{p.name}</div>
                  <div style={{ flex: 1, position: "relative", height: "100%" }}>
                    <div onClick={() => nav("project", { id: p.id })} title={p.name}
                      style={{ position: "absolute", top: 7, height: 15, borderRadius: 8, cursor: "pointer",
                        left: pct(p.startDate) + "%", width: Math.max(1.5, pct(p.endDate) - pct(p.startDate)) + "%",
                        background: STATUS[p.norm].color, opacity: .9, border: isOverdue(p) ? "2px solid #C0392B" : "none",
                        boxShadow: "0 1px 3px rgba(0,0,0,.15)" }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
          {!groups.length && <div className="empty">{t("noData")}</div>}
        </div>
      </div>

      {noDate.length > 0 && <div className="card" style={{ marginTop: 16 }}>
        <div className="card-h"><h3>{t("noDeadline")} · {t("st_planned")}</h3><span className="hint">{noDate.length}</span></div>
        <div className="card-pad"><div className="wrap">
          {noDate.map(p => <span key={p.id} className="chip" onClick={() => nav("project", { id: p.id })}>{p.name}</span>)}
        </div></div>
      </div>}
    </div>
  );
}

// ---------- RISKS & INCIDENTS ----------
function Risks() {
  const t = useT(); const { nav, lang } = useApp();
  const overdue = ALL_P.filter(p => isOverdue(p));
  const paused = ALL_P.filter(p => p.norm === "paused");
  const waiting = ALL_P.filter(p => /ожидани|kutil/i.test(p.originalStatus));
  const cancelled = ALL_P.filter(p => /отмен|cancel|joriy etilmadi|фойда/i.test(p.originalStatus));
  const noOwner = ALL_P.filter(p => !p.pm);
  const noDeadline = ALL_P.filter(p => p.norm !== "completed" && p.norm !== "paused" && !parseDate(p.endDate));

  const sevColor = { P0: "#C0392B", P1: "#E0792F", P2: "#B45309" };
  const blockedByOwner = uM3(() => {
    const m = {}; paused.forEach(p => { const o = p.pm || t("notSpecified"); m[o] = (m[o] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [lang]);

  const SEV_COLOR = { P0: "#C0392B", P1: "#E0792F", P2: "#B45309" };
  const SEV_BG    = { P0: "#FEF2F2", P1: "#FFF7ED", P2: "#FFFBEB" };
  const SEV_BG_DK = { P0: "#2D1414", P1: "#2A1A08", P2: "#251A05" };

  const StopperSection = ({ stoppers, t, lang }) => {
    const isDark = useTheme3() === "dark";
    const bg = isDark ? SEV_BG_DK : SEV_BG;
    return (
    <div className="card" style={{ marginBottom: 16, overflow: "hidden" }}>
      <div className="card-h">
        <h3>{t("stoppers")}</h3>
        <span className="pill pill-red">{stoppers.filter(s => s.open).length}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {stoppers.map((s, i) => (
          <div key={s.id} style={{
            display: "grid", gridTemplateColumns: "56px 1fr 1fr auto",
            gap: 0, alignItems: "stretch",
            borderBottom: i < stoppers.length - 1 ? "1px solid var(--line-2)" : "none",
          }}>
            {/* Sev badge column */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
                          background: bg[s.sev], borderRight: "1px solid var(--line-2)", padding: "14px 0" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: SEV_COLOR[s.sev],
                             background: SEV_COLOR[s.sev] + "22", borderRadius: 6,
                             padding: "3px 7px", letterSpacing: ".2px" }}>{s.sev}</span>
            </div>
            {/* Problem */}
            <div style={{ padding: "14px 16px", borderRight: "1px solid var(--line-2)" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: "var(--ink)" }}>{s.id}</span>
                <span style={{ margin: "0 6px", opacity: .4 }}>·</span>
                <span className="tag" style={{ fontSize: 10 }}>{s.area}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)", lineHeight: 1.4 }}>
                {lang === "ru" ? s.title_ru : s.title_uz}
              </div>
              {s.owner && s.owner !== "—" && (
                <div style={{ marginTop: 6, fontSize: 11, color: "var(--muted)" }}>
                  {t("stopper_owner")}: <b style={{ color: "var(--ink)" }}>{s.owner}</b>
                </div>
              )}
            </div>
            {/* Consequence */}
            <div style={{ padding: "14px 16px", background: bg[s.sev] }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: SEV_COLOR[s.sev],
                             textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 6 }}>
                ⚠ {t("stopper_consequence")}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink)", lineHeight: 1.5, opacity: .85 }}>
                {lang === "ru" ? s.consequence_ru : s.consequence_uz}
              </div>
            </div>
            {/* Status dot */}
            <div style={{ display: "flex", alignItems: "center", padding: "0 16px",
                          borderLeft: "1px solid var(--line-2)" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%",
                             background: s.open ? SEV_COLOR[s.sev] : "#138A5E",
                             boxShadow: s.open ? "0 0 0 3px " + SEV_COLOR[s.sev] + "33" : "none",
                             display: "inline-block" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
    );
  };

  const Section = ({ title, items, tone }) => items.length > 0 && (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-h"><h3>{title}</h3><span className={"pill pill-" + tone}>{items.length}</span></div>
      <div className="tbl-wrap"><table className="tbl"><tbody>
        {items.map(p => (
          <tr key={p.id} onClick={() => nav("project", { id: p.id })}>
            <td className="cell-proj">{p.name}</td>
            <td><span className="tag">{prodShort(p.product)}</span></td>
            <td className="t-muted">{p.originalStatus}</td>
            <td className="t-muted" style={{ fontSize: 12, maxWidth: 360 }}>{p.pauseReason || "—"}</td>
            <td>{p.pm ? <span className="row"><Avatar name={p.pm} size={22} />{p.pm}</span> : <span className="pill pill-amber">{t("kpi_noowner")}</span>}</td>
            <td className="t-muted" style={{ whiteSpace: "nowrap" }}>{fmtDate(p.endDate, lang)}</td>
          </tr>
        ))}
      </tbody></table></div>
    </div>
  );

  return (
    <div className="fade-in">
      <PageHead title={t("risksTitle")} crumbs={[{ label: t("nav_dashboard"), to: "dashboard" }, { label: t("nav_risks") }]} />
      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
        <KPI label={t("stoppers")} value={STOPPERS.filter(s => s.open).length} accent="#C0392B" />
        <KPI label={t("overdue")} value={overdue.length} accent="#C0392B" />
        <KPI label={t("st_paused")} value={paused.length} accent="#C2410C" />
        <KPI label={t("kpi_noowner")} value={noOwner.length} accent="#B45309" />
        <KPI label={t("kpi_incidents")} value={DATA.incidents.length} accent="#C0392B" />
      </div>

      <StopperSection stoppers={STOPPERS} t={t} lang={lang} />

      <div className="grid" style={{ gridTemplateColumns: "1.3fr 1fr", margin: "16px 0" }}>
        <div className="card">
          <div className="card-h"><h3>{t("incidentsBy")}</h3></div>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th className="no-sort">ID</th><th className="no-sort">{t("service")}</th><th className="no-sort">{t("severity")}</th><th className="no-sort">{t("downtime")}</th><th className="no-sort">{t("reason")}</th><th className="no-sort">{t("postmortem")}</th></tr></thead>
            <tbody>{DATA.incidents.map(i => (
              <tr key={i.id} style={{ cursor: "default" }}>
                <td style={{ fontFamily: "IBM Plex Mono", fontSize: 12 }}>{i.id}</td>
                <td style={{ fontSize: 12 }}>{i.service}</td>
                <td><span className="badge" style={{ color: sevColor[i.severity], background: sevColor[i.severity] + "22" }}><span className="badge-dot" style={{ background: sevColor[i.severity] }} />{i.severity}</span></td>
                <td><b>{i.downtimeMin}</b></td>
                <td className="t-muted" style={{ fontSize: 12 }}>{i.reason}</td>
                <td><span className={"pill " + (i.postmortem === "Yes" ? "pill-green" : "pill-amber")}>{i.postmortem === "Yes" ? t("yes") : t("no")}</span></td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
        <div className="card"><div className="card-h"><h3>{t("st_paused")} · {t("col_pm")}</h3></div><div className="card-pad">
          <Chart_ type="bar" height={230}
            data={{ labels: blockedByOwner.map(d => d[0]), datasets: [{ data: blockedByOwner.map(d => d[1]), backgroundColor: "#C2410C", borderRadius: 5, maxBarThickness: 26 }] }}
            options={{ indexAxis: "y", plugins: { legend: { display: false } }, scales: { x: { grid: { color: "#EEF2F8" }, ticks: { precision: 0 } }, y: { grid: { display: false } } } }} />
        </div></div>
      </div>
      <Section title={t("overdue")} items={overdue} tone="red" />
      <Section title={t("st_paused")} items={paused} tone="red" />
      <Section title={t("kpi_noowner")} items={noOwner} tone="amber" />
      <Section title={t("noDeadline")} items={noDeadline} tone="amber" />
    </div>
  );
}

// ---------- PMO REPORT TABLE ----------
function PmoReport({ onBack, lang }) {
  const t = useT();
  const dragScroll = useDragScroll();

  const PMO_COLS = [
    { key: "num",      label: "№",               w: 40 },
    { key: "name",     label: "Loyiha nomi",      w: 220 },
    { key: "product",  label: "Mahsulot",         w: 100 },
    { key: "status",   label: "Status",           w: 110 },
    { key: "pm",       label: "PO",               w: 90 },
    { key: "exp_dl",   label: "Exp. Deadline",    w: 100 },
    { key: "prod_dl",  label: "Prod. Deadline",   w: 100 },
    { key: "started",  label: "Started at",       w: 90 },
    { key: "completed",label: "Completed",        w: 90 },
    { key: "stake",    label: "Stakeholder",      w: 110 },
    { key: "exec",     label: "Execution",        w: 160 },
    { key: "comment",  label: "Comment",          w: 140 },
  ];

  const STATUS_LABEL = {
    completed: "Done", progress: "In Dev", planned: "Backlog", paused: "В ожидании",
  };

  const rows = ALL_P.map((p, i) => ({
    num:       i + 1,
    name:      p.name,
    product:   p.product,
    status:    p.originalStatus || STATUS_LABEL[p.norm] || p.norm,
    pm:        p.pm || "—",
    exp_dl:    p.endDate || "",
    prod_dl:   "",
    started:   p.startDate || "",
    completed: p.norm === "completed" ? (p.endDate || "") : "",
    stake:     p.customer || "",
    exec:      (p.team || []).join(", "),
    comment:   "",
  }));

  const exportExcel = () => {
    const header = PMO_COLS.map(c => c.label);
    const dataRows = rows.map(r => PMO_COLS.map(c => r[c.key] ?? ""));
    const csvRows = [header, ...dataRows].map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    );
    const bom = "﻿";
    const blob = new Blob([bom + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "PMO_Reestr_" + new Date().toISOString().slice(0,10) + ".csv";
    a.click(); URL.revokeObjectURL(url);
  };

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const thBg = isDark ? "#1A2230" : "#F0F4FA";
  const altBg = isDark ? "#171F2E" : "#F7F9FD";

  return (
    <div className="fade-in">
      <PageHead
        title={t("rep_pmo")}
        crumbs={[{ label: t("nav_dashboard"), to: "dashboard" }, { label: t("reportsTitle"), to: null }, { label: t("rep_pmo") }]}
        right={
          <div className="wrap">
            <button className="btn" onClick={onBack}>← {t("reportsTitle")}</button>
            <button className="btn btn-primary" onClick={exportExcel}>⬇ Excel export</button>
          </div>
        }
      />
      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(5,1fr)", marginBottom: 16 }}>
        <KPI label={t("summary")} value={ALL_P.length} accent="#6D5CD6" />
        {STATUS_ORDER.map(s => {
          const cnt = ALL_P.filter(p => p.norm === s).length;
          return <KPI key={s} label={t(STATUS[s].short)} value={cnt} accent={STATUS[s].color} />;
        })}
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto", cursor: "grab" }}
          ref={dragScroll.ref}
          onMouseDown={dragScroll.onMouseDown}
          onMouseMove={dragScroll.onMouseMove}
          onMouseUp={dragScroll.onMouseUp}
          onMouseLeave={dragScroll.onMouseLeave}
        >
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
            <thead>
              <tr>
                {PMO_COLS.map(c => (
                  <th key={c.key} style={{
                    background: thBg, color: "var(--muted)", fontWeight: 600, fontSize: 11,
                    padding: "9px 10px", textAlign: "left", whiteSpace: "nowrap",
                    borderBottom: "2px solid var(--line)", minWidth: c.w,
                    position: c.key === "name" ? "sticky" : "static", left: c.key === "name" ? 40 : "auto",
                  }}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 1 ? altBg : "transparent" }}>
                  {PMO_COLS.map(c => (
                    <td key={c.key} style={{
                      padding: "8px 10px", borderBottom: "1px solid var(--line-2)",
                      color: c.key === "num" ? "var(--muted)" : "var(--ink)",
                      fontWeight: c.key === "name" ? 500 : 400,
                      whiteSpace: c.key === "exec" || c.key === "comment" ? "normal" : "nowrap",
                      maxWidth: c.key === "exec" ? 200 : "none",
                      fontSize: c.key === "exec" ? 11 : 12,
                    }}>
                      {c.key === "status"
                        ? <StatusBadge norm={ALL_P[i].norm} />
                        : r[c.key] || <span style={{ color: "var(--muted-2)", fontSize: 11 }}>—</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------- REPORTS ----------
function Reports() {
  const t = useT(); const { nav, lang } = useApp(); const toast = useToast();
  const [active, setActive] = uS3(null);

  const REPORTS = [
    { id: "pmo",     icon: "📋", color: "#6D5CD6", filter: p => true,             key: "rep_pmo" },
    { id: "problem", icon: "⚠",  color: "#C0392B", filter: p => p.norm === "paused" || isOverdue(p) || !p.pm, key: "rep_problem" },
    { id: "demo",    icon: "✓",  color: "#138A5E", filter: p => p.demoReady,      key: "rep_demo" },
  ];

  if (active === "pmo") {
    return <PmoReport onBack={() => setActive(null)} lang={lang} />;
  }

  if (active) {
    const rep = REPORTS.find(r => r.id === active);
    const items = ALL_P.filter(rep.filter);
    const by = { completed: 0, progress: 0, planned: 0, paused: 0 }; items.forEach(p => by[p.norm]++);
    return (
      <div className="fade-in">
        <PageHead title={t(rep.key)} crumbs={[{ label: t("nav_dashboard"), to: "dashboard" }, { label: t("reportsTitle"), to: null }, { label: t(rep.key) }]}
          right={<div className="wrap">
            <button className="btn" onClick={() => setActive(null)}>← {t("reportsTitle")}</button>
          </div>} />
        <div className="kpi-row" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
          <KPI label={t("summary")} value={items.length} accent={rep.color} />
          {STATUS_ORDER.map(s => <KPI key={s} label={t(STATUS[s].short)} value={by[s]} accent={STATUS[s].color} />)}
        </div>
        <div className="card"><div className="tbl-wrap"><table className="tbl">
          <thead><tr>
            <th className="no-sort">{t("col_project")}</th>
            <th className="no-sort">{t("col_product")}</th>
            <th className="no-sort">{t("col_status")}</th>
            <th className="no-sort">{t("col_pm")}</th>
            <th className="no-sort">{t("col_deadline")}</th>
          </tr></thead>
          <tbody>{items.map(p => (
            <tr key={p.id} onClick={() => nav("project", { id: p.id })}>
              <td className="cell-proj">{p.name}</td>
              <td><span className="tag">{prodShort(p.product)}</span></td>
              <td><StatusBadge norm={p.norm} /></td>
              <td className="t-muted">{p.pm || "—"}</td>
              <td className="t-muted" style={{ whiteSpace: "nowrap" }}>{fmtDate(p.endDate, lang)}</td>
            </tr>
          ))}</tbody>
        </table></div></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <PageHead title={t("reportsTitle")} crumbs={[{ label: t("nav_dashboard"), to: "dashboard" }, { label: t("reportsTitle") }]} sub={t("appSub")} />
      <div className="report-grid">
        {REPORTS.map(r => {
          const n = ALL_P.filter(r.filter).length;
          return (
            <div className="card card-pad report-card" key={r.id} onClick={() => setActive(r.id)}>
              <div className="rc-ico" style={{ background: r.color + "1a", color: r.color }}>{r.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{t(r.key)}</div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>{n} {t("projects")}</div>
              <div style={{ marginTop: 12 }} className="row"><span className="btn btn-ghost" style={{ padding: "5px 0" }}>{t("viewAll")} →</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { Roadmap, Risks, Reports, STOPPERS });
