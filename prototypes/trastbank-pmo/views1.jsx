// ===== views1: Dashboard, Portfolio, Status Board =====
const { useState: uS1, useMemo: uM1, useEffect: uE1 } = React;

const DATA = window.TB_DATA;
const ALL_P = DATA.projects;

function agg() {
  const by = { completed: 0, progress: 0, planned: 0, paused: 0 };
  ALL_P.forEach(p => by[p.norm]++);
  const noOwner = ALL_P.filter(p => !p.pm).length;
  const overdue = ALL_P.filter(p => isOverdue(p)).length;
  return { by, noOwner, overdue, total: ALL_P.length,
    employees: DATA.employees.length, incidents: DATA.incidents.length };
}

// ---------- DASHBOARD ----------
function Dashboard() {
  const t = useT(); const { nav, lang } = useApp();
  const a = uM1(agg, []);

  // product breakdown by status
  const prodData = uM1(() => {
    const m = {};
    ALL_P.forEach(p => {
      if (!m[p.product]) m[p.product] = { completed: 0, progress: 0, planned: 0, paused: 0 };
      m[p.product][p.norm]++;
    });
    return Object.entries(m)
      .map(([name, counts]) => [name, counts, counts.completed + counts.progress + counts.planned + counts.paused])
      .sort((x, y) => y[2] - x[2]).slice(0, 10);
  }, []);
  // stack breakdown
  const stackData = uM1(() => {
    const m = {}; DATA.employees.forEach(e => { const s = e.stack || "Other"; m[s] = (m[s] || 0) + 1; });
    return Object.entries(m).sort((x, y) => y[1] - x[1]);
  }, []);
  // workload top 12 (by matched project count, stacked by status)
  const loadData = uM1(() => {
    return [...DATA.employees].filter(e => e.totalMatched > 0)
      .sort((x, y) => y.totalMatched - x.totalMatched).slice(0, 12);
  }, []);
  // deliveries per month (completed)
  const tl = uM1(() => {
    const m = {};
    ALL_P.filter(p => p.norm === "completed").forEach(p => {
      const d = parseDate(p.endDate); if (!d) return;
      const k = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
      m[k] = (m[k] || 0) + 1;
    });
    return Object.entries(m).sort().slice(-8);
  }, []);

  const kpis = [
    { label: t("kpi_total"), value: a.total, go: () => nav("portfolio", {}) },
    { label: t("kpi_completed"), value: a.by.completed, accent: STATUS.completed.color, go: () => nav("portfolio", { status: "completed" }) },
    { label: t("kpi_progress"), value: a.by.progress, accent: STATUS.progress.color, go: () => nav("portfolio", { status: "progress" }) },
    { label: t("kpi_planned"), value: a.by.planned, accent: STATUS.planned.color, go: () => nav("portfolio", { status: "planned" }) },
    { label: t("kpi_paused"), value: a.by.paused, accent: STATUS.paused.color, go: () => nav("portfolio", { status: "paused" }) },
    { label: t("kpi_overdue"), value: a.overdue, accent: "#C0392B", go: () => nav("risks", {}) },
    { label: t("kpi_noowner"), value: a.noOwner, accent: "#B45309", go: () => nav("risks", {}) },
    { label: t("kpi_employees"), value: a.employees, accent: "#2563EB", go: () => nav("workload", {}) },
    { label: t("kpi_incidents"), value: a.incidents, accent: "#C0392B", go: () => nav("risks", {}) },
  ];

  const stoppers = (window.STOPPERS || []).filter(s => s.open);
  const SEV_C = { P0: "#C0392B", P1: "#E0792F", P2: "#B45309" };

  return (
    <div className="fade-in">
      <PageHead title={t("nav_dashboard")} sub={t("appSub")} />

      {stoppers.length > 0 && (
        <div className="ticker-banner" style={{
          display: "flex", alignItems: "stretch", marginBottom: 16,
          background: "#FEF2F2", border: "1px solid #FCA5A5",
          borderRadius: 10, overflow: "hidden", height: 38,
        }}>
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            <div className="ticker-track">
              {[...stoppers, ...stoppers].map((s, i) => (
                <span key={i} className="ticker-item" onClick={() => nav("risks")} style={{ cursor: "pointer" }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, color: SEV_C[s.sev],
                    background: SEV_C[s.sev] + "22", borderRadius: 4,
                    padding: "1px 5px", marginRight: 6, letterSpacing: ".2px",
                  }}>{s.sev}</span>
                  <span className="ticker-text" style={{ color: "#7F1D1D", fontWeight: 600, fontSize: 13 }}>
                    {lang === "ru" ? s.title_ru : s.title_uz}
                  </span>
                  <span className="ticker-dot" style={{ margin: "0 20px", color: "#FCA5A5", fontSize: 16 }}>·</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {kpis.slice(5).map((k, i) => <KPI key={i} {...k} onClick={k.go} accent={k.accent} />)}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.1fr 1.4fr", marginTop: 18 }}>
        <div className="card">
          <div className="card-h">
            <h3>{t("ch_status")}</h3>
            <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>
              {t("total_label")} — <span style={{ fontWeight: 700, fontSize: 18, color: "var(--ink)" }}>{a.total}</span>
            </span>
          </div>
          <div className="card-pad">
            <Chart_ type="bar" height={200}
              onClickIndex={(i) => nav("portfolio", { status: STATUS_ORDER[i] })}
              data={{
                labels: STATUS_ORDER.map(s => t(STATUS[s].short) + "   —   " + a.by[s]),
                datasets: [{
                  data: STATUS_ORDER.map(s => a.by[s]),
                  backgroundColor: STATUS_ORDER.map(s => STATUS[s].color),
                  borderRadius: 5, maxBarThickness: 28,
                }],
              }}
              options={{
                indexAxis: "y",
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { color: "#EEF2F8" }, ticks: { precision: 0 } },
                  y: { grid: { display: false }, ticks: { font: { size: 12 } } },
                },
              }} />
          </div>
        </div>

        <div className="card">
          <div className="card-h"><h3>{t("ch_product")}</h3><span className="hint">{t("clickHint")}</span></div>
          <div className="card-pad">
            <Chart_ type="bar" height={260}
              onClickIndex={(i) => nav("portfolio", { product: prodData[i][0] })}
              data={{
                labels: prodData.map(d => prodShort(d[0])),
                datasets: STATUS_ORDER.map(s => ({
                  label: t(STATUS[s].short),
                  data: prodData.map(d => d[1][s]),
                  backgroundColor: STATUS[s].color, borderRadius: 3, stack: "x", maxBarThickness: 22,
                })),
              }}
              options={{ indexAxis: "y",
                plugins: { legend: { position: "bottom", labels: { usePointStyle: true, pointStyle: "circle", padding: 14, font: { size: 11.5 } } } },
                scales: { x: { stacked: true, grid: { color: "#EEF2F8" }, ticks: { precision: 0 } }, y: { stacked: true, grid: { display: false }, ticks: { font: { size: 11.5 } } } } }} />
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 16 }}>
        <div className="card">
          <div className="card-h"><h3>{t("ch_stack")}</h3><span className="hint">{t("clickHint")}</span></div>
          <div className="card-pad">
            <Chart_ type="pie" height={250}
              onClickIndex={(i) => nav("workload", { stack: stackData[i][0] })}
              data={{
                labels: stackData.map(d => d[0]),
                datasets: [{
                  data: stackData.map(d => d[1]),
                  backgroundColor: ["#2563EB","#138A5E","#6D5CD6","#C2410C","#0E7490","#D97706","#9333EA","#0E9C8E","#B45309","#64748B","#1D4ED8","#065F46","#4C1D95","#7F1D1D","#0C4A6E"],
                  borderWidth: 0, hoverOffset: 4,
                }],
              }}
              options={{ plugins: { legend: { position: "right", labels: { usePointStyle: true, pointStyle: "circle", padding: 10, font: { size: 11 } } } } }} />
          </div>
        </div>

        <div className="card">
          <div className="card-h"><h3>{t("ch_timeline")}</h3><span className="hint">{t("st_completed_s")}</span></div>
          <div className="card-pad">
            <Chart_ type="bar" height={250}
              data={{
                labels: tl.map(d => { const [y, mo] = d[0].split("-"); return MONTHS[lang][+mo - 1] + " " + y.slice(2); }),
                datasets: [{ data: tl.map(d => d[1]), backgroundColor: "#138A5E", borderRadius: 5, maxBarThickness: 38 }],
              }}
              options={{ plugins: { legend: { display: false } },
                scales: { y: { grid: { color: "#EEF2F8" }, ticks: { precision: 0 } }, x: { grid: { display: false } } } }} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-h"><h3>{t("ch_load")}</h3><span className="hint">{t("clickHint")}</span></div>
        <div className="card-pad">
          <Chart_ type="bar" height={330}
            onClickIndex={(i) => nav("employee", { id: loadData[i].id })}
            data={{
              labels: loadData.map(e => e.shortName),
              datasets: STATUS_ORDER.map(s => ({
                label: t(STATUS[s].short),
                data: loadData.map(e => e.statusCounts[s]),
                backgroundColor: STATUS[s].color, borderRadius: 3, stack: "x", maxBarThickness: 22,
              })),
            }}
            options={{ indexAxis: "y", plugins: { legend: { position: "bottom", labels: { usePointStyle: true, pointStyle: "circle", padding: 14, font: { size: 11.5 } } } },
              scales: { x: { stacked: true, grid: { color: "#EEF2F8" }, ticks: { precision: 0 } }, y: { stacked: true, grid: { display: false }, ticks: { font: { size: 11.5 } } } } }} />
        </div>
      </div>
    </div>
  );
}

// Persists Portfolio filter state across navigation
const _pf = { status: "all", boardType: "all", product: "all", pm: "all", origin: "all", sort: { k: "name", dir: 1 } };

// ---------- PORTFOLIO ----------
function Portfolio() {
  const t = useT(); const { nav, route, search, lang } = useApp();
  const [status, setStatus] = uS1(() => route.status || _pf.status);
  const [boardType, setBoardType] = uS1(() => _pf.boardType);
  const [product, setProduct] = uS1(() => route.product || _pf.product);
  const [pm, setPm] = uS1(() => _pf.pm);
  const [origin, setOrigin] = uS1(() => _pf.origin);
  const [sort, setSort] = uS1(() => _pf.sort);

  uE1(() => { _pf.status = status; }, [status]);
  uE1(() => { _pf.boardType = boardType; }, [boardType]);
  uE1(() => { _pf.product = product; }, [product]);
  uE1(() => { _pf.pm = pm; }, [pm]);
  uE1(() => { _pf.origin = origin; }, [origin]);
  uE1(() => { _pf.sort = sort; }, [sort]);

  const pms = uM1(() => {
    const m = {};
    ALL_P.forEach(p => {
      const key = projectPmKey(p);
      if (key) m[key] = projectPmName(p);
    });
    return Object.entries(m).sort((a, b) => a[1].localeCompare(b[1]));
  }, []);
  const prods = DATA.products;

  const rows = uM1(() => {
    let r = ALL_P.filter(p => {
      if (status !== "all" && p.norm !== status) return false;
      if (boardType !== "all") {
        const bt = ((DATA.boardTypes || {})[p.product]) || "Mahsulot";
        if (boardType === "Operations" && bt !== "Operations") return false;
        if (boardType === "Mahsulot" && bt !== "Mahsulot") return false;
      }
      if (product !== "all" && p.product !== product) return false;
      if (pm !== "all" && projectPmKey(p) !== pm) return false;
      if (origin !== "all" && (p.origin || "Google Sheet") !== origin) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(p.name.toLowerCase().includes(q) || p.product.toLowerCase().includes(q) ||
              projectPmName(p).toLowerCase().includes(q) || (p.customer || "").toLowerCase().includes(q) ||
              (p.jiraEpicKey || "").toLowerCase().includes(q))) return false;
      }
      return true;
    });
    // Expand Operations boards into individual tickets
    const expanded = [];
    r.forEach(p => {
      const bt = ((DATA.boardTypes || {})[p.product]) || "Mahsulot";
      if (bt === "Operations" && p.jiraEpicKey && window.TB_JIRA_ISSUES) {
        const tickets = window.TB_JIRA_ISSUES[p.jiraEpicKey] || [];
        tickets.forEach(ticket => {
          expanded.push({
            ...p,
            id: ticket.key,
            name: ticket.summary,
            norm: ticket.done ? "completed" : "progress",
            origin: ticket.type === "История" ? "Jira Story" : "Jira Task",
            jiraEpicKey: ticket.key,
            _isTicket: true,
          });
        });
      } else {
        expanded.push(p);
      }
    });
    r = expanded;
    const k = sort.k;
    r = [...r].sort((x, y) => {
      let a, b;
      if (k === "deadline") { a = parseDate(x.endDate) || 0; b = parseDate(y.endDate) || 0; }
      else if (k === "status") { a = STATUS_ORDER.indexOf(x.norm); b = STATUS_ORDER.indexOf(y.norm); }
      else if (k === "pm") { a = projectPmName(x).toLowerCase(); b = projectPmName(y).toLowerCase(); }
      else { a = (x[k] || "").toString().toLowerCase(); b = (y[k] || "").toString().toLowerCase(); }
      return (a < b ? -1 : a > b ? 1 : 0) * sort.dir;
    });
    return r;
  }, [status, boardType, product, pm, origin, search, sort]);

  // chart data — derived from filtered rows
  const statusCounts  = uM1(() => STATUS_ORDER.map(s => rows.filter(p => p.norm === s).length), [rows]);
  const prodChart     = uM1(() => { const m = {}; rows.forEach(p => m[p.product] = (m[p.product]||0)+1); return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,6); }, [rows]);
  const pmChart       = uM1(() => {
    const m = {};
    rows.forEach(p => {
      const key = projectPmKey(p);
      if (key) {
        if (!m[key]) m[key] = { name: projectPmName(p), count: 0 };
        m[key].count++;
      }
    });
    return Object.entries(m).map(([key, v]) => [key, v.name, v.count]).sort((a,b)=>b[2]-a[2]).slice(0,6);
  }, [rows]);
  const ORIGINS = ["Jira Epic", "Jira Story", "Jira Task", "Google Sheet"];
  const ORIGIN_COLOR = { "Jira Epic": "#2563EB", "Jira Story": "#7C3AED", "Jira Task": "#0E7490", "Google Sheet": "#0D7C56" };

  const reset = () => { setStatus("all"); setBoardType("all"); setProduct("all"); setPm("all"); setOrigin("all"); };
  const SortTh = ({ k, label, cls }) => (
    <th className={cls} onClick={() => setSort(s => {
      if (s.k === k && s.dir === -1) return { k: "name", dir: 1 };
      return { k, dir: s.k === k ? -s.dir : 1 };
    })}>
      {label}{sort.k === k && <span className="arr">{sort.dir > 0 ? "▲" : "▼"}</span>}
    </th>
  );

  return (
    <div className="fade-in">
      <PageHead title={t("nav_portfolio")} crumbs={[{ label: t("nav_dashboard"), to: "dashboard" }, { label: t("nav_portfolio") }]}
        right={<span className="tag">{t("showing")} {rows.length} {t("of")} {ALL_P.length}</span>} />

      <div className="filterbar">
        <div className="sel"><select className="f-sel" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">{t("normStatus")}: {t("all")}</option>
          {STATUS_ORDER.map(s => <option key={s} value={s}>{t(STATUS[s].short)}</option>)}
        </select></div>
        <div className="sel"><select className="f-sel" value={boardType} onChange={e => setBoardType(e.target.value)}>
          <option value="all">{t("col_board_type")}: {t("all")}</option>
          <option value="Mahsulot">{t("board_type_product")}</option>
          <option value="Operations">{t("board_type_ops")}</option>
        </select></div>
        <div className="sel"><select className="f-sel" value={product} onChange={e => setProduct(e.target.value)}>
          <option value="all">{t("col_product")}: {t("all")}</option>
          {prods.map(p => <option key={p} value={p}>{p}</option>)}
        </select></div>
        <div className="sel"><select className="f-sel" value={pm} onChange={e => setPm(e.target.value)}>
          <option value="all">{t("col_pm")}: {t("all")}</option>
          {pms.map(([key, name]) => <option key={key} value={key}>{name}</option>)}
        </select></div>
        <div className="sel"><select className="f-sel" value={origin} onChange={e => setOrigin(e.target.value)}>
          <option value="all">Origin: {t("all")}</option>
          {ORIGINS.map(o => <option key={o} value={o}>{o}</option>)}
        </select></div>
        <button className="btn btn-ghost" onClick={reset}>↺ {t("resetFilters")}</button>
      </div>

      <div className="stat-bg">
        <div className="card">
          <div className="card-h"><h3>{t("col_status")}</h3></div>
          <div className="card-pad">
            <Chart_ type="bar" height={160}
              onClickIndex={i => setStatus(status === STATUS_ORDER[i] ? "all" : STATUS_ORDER[i])}
              data={{ labels: STATUS_ORDER.map((s,i) => t(STATUS[s].short) + "   —   " + statusCounts[i]),
                datasets:[{ data: statusCounts, backgroundColor: STATUS_ORDER.map(s=>STATUS[s].color), borderRadius:5, maxBarThickness:22 }] }}
              options={{ indexAxis:"y", plugins:{ legend:{ display:false } },
                scales:{ x:{ grid:{ color:"#EEF2F8" }, ticks:{ precision:0 } }, y:{ grid:{ display:false }, ticks:{ font:{ size:11 } } } } }} />
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>{t("col_product")}</h3></div>
          <div className="card-pad">
            <Chart_ type="bar" height={160}
              onClickIndex={i => setProduct(product === prodChart[i][0] ? "all" : prodChart[i][0])}
              data={{ labels: prodChart.map(d=>prodShort(d[0])),
                datasets:[{ data: prodChart.map(d=>d[1]), backgroundColor: prodChart.map(d=> product==="all"||product===d[0] ? "#2563EB" : "#C5D4F0"), borderRadius:4, maxBarThickness:16 }] }}
              options={{ indexAxis:"y", plugins:{ legend:{ display:false } },
                scales:{ x:{ grid:{ color:"#EEF2F8" }, ticks:{ precision:0, font:{ size:10 } } }, y:{ grid:{ display:false }, ticks:{ font:{ size:10 } } } } }} />
          </div>
        </div>
        <div className="card">
          <div className="card-h"><h3>{t("col_pm")}</h3></div>
          <div className="card-pad">
            <Chart_ type="bar" height={160}
              onClickIndex={i => setPm(pm === pmChart[i][0] ? "all" : pmChart[i][0])}
              data={{ labels: pmChart.map(d=>d[1]),
                datasets:[{ data: pmChart.map(d=>d[2]), backgroundColor: pmChart.map(d=> pm==="all"||pm===d[0] ? "#6D5CD6" : "#D4CEF5"), borderRadius:4, maxBarThickness:16 }] }}
              options={{ indexAxis:"y", plugins:{ legend:{ display:false } },
                scales:{ x:{ grid:{ color:"#EEF2F8" }, ticks:{ precision:0, font:{ size:10 } } }, y:{ grid:{ display:false }, ticks:{ font:{ size:10 } } } } }} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th className="no-sort" style={{ width: 36, textAlign: "center" }}>№</th>
              <SortTh k="name" label={t("col_project")} />
              <SortTh k="product" label={t("col_product")} />
              <SortTh k="boardType" label={t("col_board_type")} />
              <SortTh k="status" label={t("col_status")} />
              <SortTh k="pm" label={t("col_pm")} />
              <SortTh k="customer" label={t("col_customer")} />
              <SortTh k="deadline" label={t("col_deadline")} />
              <SortTh k="origin" label="Origin" />
            </tr></thead>
            <tbody>
              {rows.map((p, idx) => (
                <tr key={p.id + idx} onClick={() => p._isTicket ? null : nav("project", { id: p.id })} style={p._isTicket ? { cursor: "default" } : {}}>
                  <td style={{ textAlign: "center", color: "var(--muted)", fontSize: 12, width: 36 }}>{idx + 1}</td>
                  <td className="cell-proj">
                    {p.name}
                    {p.purchased && <PurchasedBadge tooltip={t("purchased_tooltip")} />}
                    <JiraLink epicKey={p.jiraEpicKey} product={p.product} />
                    {isOverdue(p) && <small style={{ color: "#C0392B" }}>● {t("overdue")}</small>}
                    {(() => {
                      if (!p.jiraEpicKey || !window.TB_JIRA_ISSUES) return null;
                      const items = window.TB_JIRA_ISSUES[p.jiraEpicKey];
                      if (!items || items.length === 0) return null;
                      const done = items.filter(i => i.done).length;
                      const total = items.length;
                      return (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, marginLeft: 5,
                                       fontSize: 10, fontWeight: 600, color: done === total ? "#138A5E" : "#64748B",
                                       background: done === total ? "#DCFCE7" : "var(--line-2)",
                                       borderRadius: 4, padding: "1px 5px", verticalAlign: "middle" }}>
                          ✓ {done}/{total}
                        </span>
                      );
                    })()}
                  </td>
                  <td><span className="tag">{prodShort(p.product)}</span></td>
                  <td>{(() => {
                    const bt = ((DATA.boardTypes || {})[p.product]) || "Mahsulot";
                    const isOps = bt === "Operations";
                    return <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                      background: isOps ? "#F59E0B18" : "#3B82F618", color: isOps ? "#B45309" : "#1D4ED8" }}>
                      {isOps ? t("board_type_ops") : t("board_type_product")}
                    </span>;
                  })()}</td>
                  <td><StatusBadge norm={p.norm} /></td>
                  <td>{projectPmName(p) ? <span className="row"><Avatar name={projectPmName(p)} size={24} /> {projectPmName(p)}</span> : <span className="t-muted">{t("notSpecified")}</span>}</td>
                  <td className="t-muted">{p.customer || "—"}</td>
                  <td className="t-muted" style={{ whiteSpace: "nowrap" }}>{fmtDate(p.endDate, lang)}</td>
                  <td>
                    {(() => {
                      const org = p.origin || "Google Sheet";
                      return <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                        background: ORIGIN_COLOR[org] + "18", color: ORIGIN_COLOR[org] }}>{org}</span>;
                    })()}
                  </td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan="9" className="empty">{t("noData")}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------- STATUS BOARD ----------
function StatusBoard() {
  const t = useT(); const { nav, search } = useApp();
  const cols = STATUS_ORDER.map(norm => ({
    norm,
    items: ALL_P.filter(p => p.norm === norm && (!search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.jiraEpicKey || "").toLowerCase().includes(search.toLowerCase()))),
  }));
  return (
    <div className="fade-in">
      <PageHead title={t("nav_board")} crumbs={[{ label: t("nav_dashboard"), to: "dashboard" }, { label: t("nav_board") }]} />
      <div className="kanban">
        {cols.map(c => (
          <div className="kcol" key={c.norm}>
            <div className="kcol-h">
              <span className="kc-dot" style={{ background: STATUS[c.norm].color }} />
              <b>{t(STATUS[c.norm].short)}</b>
              <span className="kc-n">{c.items.length}</span>
            </div>
            {c.items.map(p => (
              <div className="kcard" key={p.id} style={{ "--kc": STATUS[c.norm].color }} onClick={() => nav("project", { id: p.id })}>
                <div className="kcard-t">{p.name}{p.purchased && <PurchasedBadge tooltip={t("purchased_tooltip")} />}<JiraLink epicKey={p.jiraEpicKey} product={p.product} /></div>
                <div className="kcard-meta">
                  <span className="tag">{prodShort(p.product)}</span>
                  {p.pm && <span className="row" style={{ gap: 5 }}><Avatar name={p.pm} size={18} /> {p.pm}</span>}
                </div>
                <div className="kcard-foot">
                  <Progress value={progressOf(p)} norm={c.norm} />
                  {p.demoReady && <span className="pill pill-green">demo</span>}
                  {isOverdue(p) && <span className="pill pill-red">!</span>}
                </div>
              </div>
            ))}
            {!c.items.length && <div className="empty" style={{ padding: 20 }}>—</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, Portfolio, StatusBoard, agg, DATA, ALL_P });
