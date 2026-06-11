// ===== views3: Roadmap, Risks & Incidents, Reports =====
const { useState: uS3, useMemo: uM3 } = React;

// ---------- ROADMAP / TIMELINE ----------
function Roadmap() {
  const t = useT(); const { nav, lang } = useApp();
  const [product, setProduct] = uS3("all");
  const [status, setStatus] = uS3("all");

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

      <div className="card card-pad" style={{ overflowX: "auto" }}>
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
        <KPI label={t("overdue")} value={overdue.length} accent="#C0392B" />
        <KPI label={t("openBlockers")} value={paused.length} accent="#C2410C" />
        <KPI label={t("waiting")} value={waiting.length} accent="#B45309" />
        <KPI label={t("kpi_noowner")} value={noOwner.length} accent="#B45309" />
        <KPI label={t("kpi_incidents")} value={DATA.incidents.length} accent="#C0392B" />
      </div>

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
        <div className="card"><div className="card-h"><h3>{t("openBlockers")} · {t("col_pm")}</h3></div><div className="card-pad">
          <Chart_ type="bar" height={230}
            data={{ labels: blockedByOwner.map(d => d[0]), datasets: [{ data: blockedByOwner.map(d => d[1]), backgroundColor: "#C2410C", borderRadius: 5, maxBarThickness: 26 }] }}
            options={{ indexAxis: "y", plugins: { legend: { display: false } }, scales: { x: { grid: { color: "#EEF2F8" }, ticks: { precision: 0 } }, y: { grid: { display: false } } } }} />
        </div></div>
      </div>

      <Section title={t("overdue")} items={overdue} tone="red" />
      <Section title={t("st_paused")} items={paused} tone="red" />
      <Section title={t("noDeadline")} items={noDeadline} tone="amber" />
    </div>
  );
}

// ---------- REPORTS ----------
function Reports() {
  const t = useT(); const { nav, lang } = useApp(); const toast = useToast();
  const [active, setActive] = uS3(null);

  const REPORTS = [
    { id: "board", icon: "🏛", color: "#0E2A52", filter: p => true, key: "rep_board" },
    { id: "ceo", icon: "⚡", color: "#2563EB", filter: p => p.norm !== "planned", key: "rep_ceo" },
    { id: "pmo", icon: "📋", color: "#6D5CD6", filter: p => true, key: "rep_pmo" },
    { id: "problem", icon: "⚠", color: "#C0392B", filter: p => p.norm === "paused" || isOverdue(p) || !p.pm, key: "rep_problem" },
    { id: "demo", icon: "✓", color: "#138A5E", filter: p => p.demoReady, key: "rep_demo" },
  ];

  const exp = (label) => toast(label + " — " + t("exported"));
  const copy = () => toast(t("copied"));

  if (active) {
    const rep = REPORTS.find(r => r.id === active);
    const items = ALL_P.filter(rep.filter);
    const by = { completed: 0, progress: 0, planned: 0, paused: 0 }; items.forEach(p => by[p.norm]++);
    return (
      <div className="fade-in">
        <PageHead title={t(rep.key)} crumbs={[{ label: t("nav_dashboard"), to: "dashboard" }, { label: t("reportsTitle"), to: null }, { label: t(rep.key) }]}
          right={<div className="wrap">
            <button className="btn" onClick={() => setActive(null)}>← {t("reportsTitle")}</button>
            <button className="btn" onClick={() => exp(t("exportPdf"))}>⬇ {t("exportPdf")}</button>
            <button className="btn" onClick={() => exp(t("exportExcel"))}>⬇ {t("exportExcel")}</button>
            <button className="btn" onClick={copy}>⧉ {t("copySummary")}</button>
            <button className="btn btn-primary" onClick={() => exp(t("presentMode"))}>▶ {t("presentMode")}</button>
          </div>} />
        <div className="kpi-row" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
          <KPI label={t("summary")} value={items.length} accent={rep.color} />
          {STATUS_ORDER.map(s => <KPI key={s} label={t(STATUS[s].short)} value={by[s]} accent={STATUS[s].color} />)}
        </div>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1.6fr", marginTop: 16 }}>
          <div className="card"><div className="card-h"><h3>{t("ch_status")}</h3></div><div className="card-pad">
            <Chart_ type="doughnut" height={230} data={{ labels: STATUS_ORDER.map(s => t(STATUS[s].short)), datasets: [{ data: STATUS_ORDER.map(s => by[s]), backgroundColor: STATUS_ORDER.map(s => STATUS[s].color), borderWidth: 3, borderColor: "#fff" }] }}
              options={{ cutout: "60%", plugins: { legend: { position: "bottom", labels: { usePointStyle: true, pointStyle: "circle", font: { size: 11 } } } } }} />
          </div></div>
          <div className="card"><div className="tbl-wrap"><table className="tbl">
            <thead><tr><th className="no-sort">{t("col_project")}</th><th className="no-sort">{t("col_product")}</th><th className="no-sort">{t("col_status")}</th><th className="no-sort">{t("col_pm")}</th><th className="no-sort">{t("col_deadline")}</th></tr></thead>
            <tbody>{items.map(p => (
              <tr key={p.id} onClick={() => nav("project", { id: p.id })}>
                <td className="cell-proj">{p.name}</td><td><span className="tag">{prodShort(p.product)}</span></td>
                <td><StatusBadge norm={p.norm} /></td><td className="t-muted">{p.pm || "—"}</td>
                <td className="t-muted" style={{ whiteSpace: "nowrap" }}>{fmtDate(p.endDate, lang)}</td>
              </tr>
            ))}</tbody>
          </table></div></div>
        </div>
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

Object.assign(window, { Roadmap, Risks, Reports });
