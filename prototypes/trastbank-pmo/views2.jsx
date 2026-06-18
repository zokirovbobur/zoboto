// ===== views2: Project Detail, Workload, Employee Profile =====
const { useState: uS2, useMemo: uM2 } = React;

// project health heuristic
function healthOf(p) {
  if (p.norm === "paused") return "risk";
  if (isOverdue(p)) return "risk";
  if (p.norm === "completed") return "good";
  if (!p.pm || !p.endDate) return "watch";
  return p.norm === "progress" ? "watch" : "good";
}
const HEALTH = { good: { c: "#138A5E", k: "health_good" }, watch: { c: "#B45309", k: "health_watch" }, risk: { c: "#C0392B", k: "health_risk" } };

// ---------- PROJECT DETAIL ----------
function ProjectDetail() {
  const t = useT(); const { nav, route, lang } = useApp();
  const p = PROJ[route.id];
  if (!p) return <div className="empty">{t("noData")}</div>;
  const h = healthOf(p); const hm = HEALTH[h];
  const relInc = DATA.incidents.filter(i => (p.product || "").toLowerCase().includes((i.product || "").toLowerCase()) && i.product);
  const teamEmp = p.team.map(name => {
    const key = name.replace(/\([^)]*\)/g, "").trim().split(" ").slice(0, 2).join(" ").toLowerCase().replace(/['`’ʻ]/g, "");
    return { name, emp: DATA.employees.find(e => e.matchKey === key) };
  });

  const steps = [
    { l: t("col_start"), v: p.startDate, on: !!p.startDate, c: "#2563EB" },
    { l: t("st_progress_s"), v: p.norm === "planned" ? t("notSpecified") : "", on: ["progress", "completed"].includes(p.norm), c: "#6D5CD6" },
    { l: t("col_deadline"), v: p.endDate, on: !!p.endDate, c: p.norm === "completed" ? "#138A5E" : "#B45309" },
    { l: t("st_completed_s"), v: p.norm === "completed" ? p.endDate : "—", on: p.norm === "completed", c: "#138A5E" },
  ];

  return (
    <div className="fade-in">
      <PageHead title={p.name}
        crumbs={[{ label: t("nav_dashboard"), to: "dashboard" }, { label: t("nav_portfolio"), to: "portfolio" }, { label: p.id }]}
        sub={<span className="row" style={{ gap: 8, marginTop: 4 }}><span className="tag">{p.product}</span><StatusBadge norm={p.norm} /><span className="muted" style={{ fontSize: 12 }}>{t("origStatus")}: {p.originalStatus}</span></span>}
        right={<button className="btn" onClick={() => nav("portfolio", {})}>← {t("nav_portfolio")}</button>} />

      <div className="detail-grid">
        <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="card">
            <div className="card-h"><h3>{t("keyFacts")}</h3><span className="hint">{t("passport")} · {p.id}</span></div>
            <div className="card-pad">
              <div className="facts">
                <Fact l={t("col_pm")} v={p.pm || t("notSpecified")} />
                <Fact l={t("col_dept")} v={p.department || "—"} sm />
                <Fact l={t("col_customer")} v={p.customer || t("notSpecified")} />
                <Fact l={t("col_supplier")} v={p.supplier || t("none")} />
                <Fact l={t("col_start")} v={fmtDate(p.startDate, lang)} />
                <Fact l={t("col_deadline")} v={fmtDate(p.endDate, lang)} />
                <Fact l={t("col_demo")} v={p.demoReady ? t("yes") : t("no")} />
                <Fact l={t("col_sum")} v={fmtSum(p.sum) || t("notSpecified")} />
              </div>
            </div>
          </div>

          {(p.goal || p.basis || p.info) && <div className="card card-pad">
            {p.goal && <div style={{ marginBottom: 12 }}><div className="fact-l">{t("goal")}</div><div style={{ marginTop: 4, fontSize: 13.5 }}>{p.goal}</div></div>}
            {p.basis && <div style={{ marginBottom: 12 }}><div className="fact-l">{t("basis")}</div><div style={{ marginTop: 4, fontSize: 13.5 }} className="muted">{p.basis}</div></div>}
            {p.info && <div><div className="fact-l">{t("addInfo")}</div><div style={{ marginTop: 4, fontSize: 13.5 }} className="muted">{p.info}</div></div>}
          </div>}

          <div className="card">
            <div className="card-h"><h3>{t("timeline")}</h3></div>
            <div className="card-pad"><div className="tl">
              {steps.map((s, i) => (
                <div className="tl-step" key={i}>
                  <span className="tl-dot" style={{ background: s.on ? s.c : "#E5EAF2" }} />
                  <div className="tl-c"><b style={{ color: s.on ? "var(--ink)" : "var(--muted-2)" }}>{s.l}</b>
                    <span>{s.v ? fmtDate(s.v, lang) : (s.on ? "—" : t("notSpecified"))}</span></div>
                </div>
              ))}
            </div></div>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="card card-pad">
            <div className="health">
              <div className="health-ring" style={{ background: hm.c }}>{progressOf(p)}%</div>
              <div>
                <div className="fact-l">{t("healthCard")}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: hm.c, marginTop: 3 }}>{t(hm.k)}</div>
                <Progress value={progressOf(p)} norm={p.norm} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-h"><h3>{t("teamCard")}</h3><span className="hint">{p.team.length} {t("members")}</span></div>
            <div className="card-pad" style={{ maxHeight: 320, overflow: "auto" }}>
              {teamEmp.map((m, i) => (
                <div className="member-row" key={i} style={{ cursor: m.emp ? "pointer" : "default" }}
                  onClick={() => m.emp && nav("employee", { id: m.emp.id })}>
                  <Avatar name={m.name} size={28} />
                  <span>{m.name}</span>
                  {m.emp && <span className="member-role">{m.emp.stack}</span>}
                </div>
              ))}
              {!p.team.length && <div className="empty">{t("notSpecified")}</div>}
            </div>
          </div>

          <JiraSection epicKey={p.jiraEpicKey} product={p.product} />

          <div className="card">
            <div className="card-h"><h3>{t("riskCard")}</h3></div>
            <div className="card-pad">
              <div className="wrap">
                {isOverdue(p) && <span className="pill pill-red">⚠ {t("overdue")}</span>}
                {!p.pm && <span className="pill pill-amber">{t("kpi_noowner")}</span>}
                {!p.endDate && <span className="pill pill-amber">{t("noDeadline")}</span>}
                {p.norm === "paused" && <span className="pill pill-red">{p.originalStatus}</span>}
                {h === "good" && !isOverdue(p) && <span className="pill pill-green">✓ {t("health_good")}</span>}
              </div>
              {p.pauseReason && <div style={{ marginTop: 14 }}>
                <div className="fact-l" style={{ marginBottom: 6 }}>{t("pauseReason")}</div>
                <div className="muted" style={{ fontSize: 13.5, lineHeight: 1.45 }}>{p.pauseReason}</div>
              </div>}
              {relInc.length > 0 && <div style={{ marginTop: 14 }}>
                <div className="fact-l" style={{ marginBottom: 8 }}>{t("nav_risks")}</div>
                {relInc.map(i => <div key={i.id} className="member-row">
                  <span className="pill pill-red">{i.severity}</span>
                  <span style={{ fontSize: 12.5 }}>{i.service}</span>
                  <span className="member-role">{i.downtimeMin} min</span>
                </div>)}
              </div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function Fact({ l, v, sm }) {
  return <div className="fact"><div className="fact-l">{l}</div><div className={"fact-v" + (sm ? " sm" : "")}>{v}</div></div>;
}

// ---------- WORKLOAD ----------
function Workload() {
  const t = useT(); const { nav, route, search } = useApp();
  const [stack, setStack] = uS2(route.stack || "all");
  const [grade, setGrade] = uS2("all");
  const [loadFilter, setLoadFilter] = uS2("all"); // "all" | "overloaded" | "noActive"
  const DEFAULT_SORT = { k: "totalMatched", dir: -1 };
  const [sort, setSort] = uS2(DEFAULT_SORT);

  const stacks = uM2(() => [...new Set(DATA.employees.map(e => e.stack).filter(Boolean))].sort(), []);
  const grades = uM2(() => [...new Set(DATA.employees.map(e => e.grade).filter(Boolean))], []);

  const LOAD_RANK = { low: 0, normal: 1, high: 2, critical: 3 };

  // computed sort value for special keys
  const sortVal = (e, k) => {
    if (k === "active") return e.statusCounts.progress + e.statusCounts.planned;
    if (k === "completed_col") return e.statusCounts.completed;
    if (k === "loadLevel") return LOAD_RANK[e.loadLevel] ?? 0;
    const v = e[k];
    return typeof v === "string" ? v.toLowerCase() : (v ?? 0);
  };

  const rows = uM2(() => {
    let r = DATA.employees.filter(e => {
      if (stack !== "all" && e.stack !== stack) return false;
      if (grade !== "all" && e.grade !== grade) return false;
      if (loadFilter === "overloaded" && e.loadLevel !== "critical" && e.loadLevel !== "high") return false;
      if (loadFilter === "noActive" && (e.statusCounts.progress + e.statusCounts.planned) > 0) return false;
      if (search && !e.fullName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    if (sort.dir === 0) return r;
    return [...r].sort((a, b) => {
      const x = sortVal(a, sort.k), y = sortVal(b, sort.k);
      return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
    });
  }, [stack, grade, loadFilter, search, sort]);

  // 3-state sort: none → asc → desc → none
  const cycleSort = (k) => setSort(s => {
    if (s.k !== k) return { k, dir: 1 };
    if (s.dir === 1) return { k, dir: -1 };
    return DEFAULT_SORT;
  });

  const resetFilters = () => { setStack("all"); setGrade("all"); setLoadFilter("all"); setSort(DEFAULT_SORT); };

  const overloaded = DATA.employees.filter(e => e.loadLevel === "critical" || e.loadLevel === "high").length;
  const noActive = DATA.employees.filter(e => (e.statusCounts.progress + e.statusCounts.planned) === 0).length;

  // top 12 for charts
  const topActive = [...DATA.employees].sort((a, b) => (b.statusCounts.progress + b.statusCounts.planned) - (a.statusCounts.progress + a.statusCounts.planned)).slice(0, 12);
  const topDone   = [...DATA.employees].sort((a, b) => b.statusCounts.completed - a.statusCounts.completed).slice(0, 12);

  const LOAD = { low: { k: "load_low", t: "neutral" }, normal: { k: "load_normal", t: "blue" }, high: { k: "load_high", t: "amber" }, critical: { k: "load_critical", t: "red" } };

  const SortTh = ({ k, label }) => {
    const active = sort.k === k && sort.dir !== 0;
    return (
      <th onClick={() => cycleSort(k)} style={{ cursor: "pointer" }}>
        {label}
        {active && <span className="arr">{sort.dir > 0 ? "▲" : "▼"}</span>}
      </th>
    );
  };

  return (
    <div className="fade-in">
      <PageHead title={t("workloadTitle")} crumbs={[{ label: t("nav_dashboard"), to: "dashboard" }, { label: t("workloadTitle") }]} />

      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        <KPI label={t("kpi_employees")} value={DATA.employees.length} accent="#2563EB"
          onClick={resetFilters} tone={loadFilter === "all" ? "active" : null} />
        <KPI label={t("overloaded")} value={overloaded} accent="#C0392B"
          onClick={() => setLoadFilter(f => f === "overloaded" ? "all" : "overloaded")} tone={loadFilter === "overloaded" ? "active" : null} />
        <KPI label={t("noActive")} value={noActive} accent="#B45309"
          onClick={() => setLoadFilter(f => f === "noActive" ? "all" : "noActive")} tone={loadFilter === "noActive" ? "active" : null} />
        <KPI label={t("col_stack")} value={stacks.length} accent="#0E9C8E" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginBottom: 16 }}>
        <div className="card"><div className="card-h"><h3>{t("ch_stack")}</h3></div><div className="card-pad">
          {(() => { const sd = stacks.map(s => [s, DATA.employees.filter(e => e.stack === s).length]).sort((a, b) => b[1] - a[1]); return (
          <Chart_ type="pie" height={250}
            onClickIndex={(i) => setStack(sd[i][0])}
            data={{
              labels: sd.map(d => d[0]),
              datasets: [{ data: sd.map(d => d[1]), backgroundColor: ["#2563EB","#138A5E","#6D5CD6","#C2410C","#0E7490","#D97706","#9333EA","#0E9C8E","#B45309","#64748B","#1D4ED8","#065F46","#4C1D95","#7F1D1D","#0C4A6E"], borderWidth: 2, borderColor: "#fff", hoverOffset: 4 }],
            }}
            options={{ plugins: { legend: { position: "right", labels: { usePointStyle: true, pointStyle: "circle", padding: 10, font: { size: 11 } } } } }} />
          ); })()}
        </div></div>

        <div className="card"><div className="card-h"><h3>{t("col_active")} (TOP-12)</h3></div><div className="card-pad">
          <Chart_ type="bar" height={320}
            onClickIndex={(i) => nav("employee", { id: topActive[i].id })}
            data={{ labels: topActive.map(e => e.shortName), datasets: [{ label: t("col_active"), data: topActive.map(e => e.statusCounts.progress + e.statusCounts.planned), backgroundColor: "#2563EB", borderRadius: 3, maxBarThickness: 14 }] }}
            options={{ indexAxis: "y", plugins: { legend: { display: false } }, scales: { x: { grid: { color: "#EEF2F8" }, ticks: { precision: 0 } }, y: { grid: { display: false }, ticks: { font: { size: 10 } } } } }} />
        </div></div>

        <div className="card"><div className="card-h"><h3>{t("col_done")} (TOP-12)</h3></div><div className="card-pad">
          <Chart_ type="bar" height={320}
            onClickIndex={(i) => nav("employee", { id: topDone[i].id })}
            data={{ labels: topDone.map(e => e.shortName), datasets: [{ label: t("col_done"), data: topDone.map(e => e.statusCounts.completed), backgroundColor: "#138A5E", borderRadius: 3, maxBarThickness: 14 }] }}
            options={{ indexAxis: "y", plugins: { legend: { display: false } }, scales: { x: { grid: { color: "#EEF2F8" }, ticks: { precision: 0 } }, y: { grid: { display: false }, ticks: { font: { size: 10 } } } } }} />
        </div></div>
      </div>

      <div className="filterbar">
        <div className="sel"><select className="f-sel" value={stack} onChange={e => setStack(e.target.value)}>
          <option value="all">{t("col_stack")}: {t("all")}</option>{stacks.map(s => <option key={s}>{s}</option>)}</select></div>
        <div className="sel"><select className="f-sel" value={grade} onChange={e => setGrade(e.target.value)}>
          <option value="all">{t("emp_grade")}: {t("all")}</option>{grades.map(g => <option key={g}>{g}</option>)}</select></div>
        <button className="btn btn-ghost" onClick={resetFilters}>↺ {t("resetFilters")}</button>
        <span className="tag" style={{ marginLeft: "auto" }}>{rows.length} {t("employees")}</span>
      </div>

      <div className="card"><div className="tbl-wrap">
        <table className="tbl">
          <thead><tr>
            <SortTh k="fullName" label={t("col_pm").split(" ")[0]} />
            <SortTh k="product" label={t("emp_product")} />
            <SortTh k="stack" label={t("col_stack")} />
            <SortTh k="grade" label={t("emp_grade")} />
            <SortTh k="active" label={t("col_active")} />
            <SortTh k="completed_col" label={t("col_done")} />
            <SortTh k="totalMatched" label="Σ" />
            <SortTh k="loadLevel" label={t("col_load")} />
          </tr></thead>
          <tbody>
            {rows.map(e => (
              <tr key={e.id} onClick={() => nav("employee", { id: e.id })}>
                <td className="cell-proj"><span className="row"><Avatar name={e.shortName} size={28} />{e.fullName}</span></td>
                <td className="t-muted">{e.product}</td>
                <td><span className="tag">{e.stack}</span></td>
                <td className="t-muted">{e.grade}</td>
                <td><b>{e.statusCounts.progress + e.statusCounts.planned}</b></td>
                <td className="t-muted">{e.statusCounts.completed}</td>
                <td><b>{e.totalMatched}</b></td>
                <td><span className={"pill pill-" + LOAD[e.loadLevel].t}>{t(LOAD[e.loadLevel].k)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>
    </div>
  );
}

// ---------- EMPLOYEE PROFILE ----------
function EmployeeProfile() {
  const t = useT(); const { nav, route, lang } = useApp();
  const [statusFilter, setStatusFilter] = uS2("all");
  const e = EMP[route.id];
  if (!e) return <div className="empty">{t("noData")}</div>;

  const allProjs = e.projectIds.map(id => PROJ[id]);
  const filteredProjs = statusFilter === "all" ? allProjs : allProjs.filter(p => p.norm === statusFilter);
  const ledProjs = ALL_P.filter(p => p.pmId === e.id);
  const LOAD = { low: "load_low", normal: "load_normal", high: "load_high", critical: "load_critical" };
  const toggleStatus = (norm) => setStatusFilter(f => f === norm ? "all" : norm);

  const statusCounts = STATUS_ORDER.map(s => e.statusCounts[s]);

  return (
    <div className="fade-in">
      <PageHead title={e.fullName}
        crumbs={[{ label: t("nav_dashboard"), to: "dashboard" }, { label: t("workloadTitle"), to: "workload" }, { label: e.shortName }]}
        right={<button className="btn" onClick={() => nav("workload", {})}>← {t("workloadTitle")}</button>} />

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="emp-hero">
          <Avatar name={e.shortName} size={62} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{e.fullName}</div>
            <div className="wrap" style={{ marginTop: 8 }}>
              <span className="pill pill-blue">{e.stack}</span>
              <span className="pill pill-neutral">{e.grade}</span>
              <span className="pill pill-violet">{e.product}</span>
              <span className="tag">{t("emp_hired")}: {fmtDate(e.hireDate.split("-").reverse().join("."), lang)}</span>
              {ledProjs.length > 0 && <span className="pill pill-green">{t("role_pm")}: {ledProjs.length}</span>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="fact-l">{t("emp_load")}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 3,
              color: e.loadLevel === "critical" ? "#C0392B" : e.loadLevel === "high" ? "#B45309" : "#138A5E" }}>{t(LOAD[e.loadLevel])}</div>
          </div>
        </div>
      </div>

      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
        <KPI label={t("st_completed_s")} value={e.statusCounts.completed} accent={STATUS.completed.color}
          onClick={() => toggleStatus("completed")} tone={statusFilter === "completed" ? "active" : null} />
        <KPI label={t("st_progress_s")} value={e.statusCounts.progress} accent={STATUS.progress.color}
          onClick={() => toggleStatus("progress")} tone={statusFilter === "progress" ? "active" : null} />
        <KPI label={t("st_planned_s")} value={e.statusCounts.planned} accent={STATUS.planned.color}
          onClick={() => toggleStatus("planned")} tone={statusFilter === "planned" ? "active" : null} />
        <KPI label={t("st_paused_s")} value={e.statusCounts.paused} accent={STATUS.paused.color}
          onClick={() => toggleStatus("paused")} tone={statusFilter === "paused" ? "active" : null} />
        <KPI label="Σ" value={e.totalMatched}
          onClick={() => setStatusFilter("all")} tone={statusFilter === "all" ? "active" : null} />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-h">
          <h3>{t("emp_projects")}</h3>
          <span className="hint">{filteredProjs.length}{statusFilter !== "all" ? " / " + allProjs.length : ""} {t("projects")}</span>
          {statusFilter !== "all" && (
            <button className="btn btn-ghost" style={{ fontSize: 11, marginLeft: "auto" }} onClick={() => setStatusFilter("all")}>↺ {t("resetFilters")}</button>
          )}
        </div>
        <div className="tbl-wrap">
          <table className="tbl" style={{ fontSize: 12.5 }}>
            <thead><tr>
              <th style={{ fontSize: 10.5 }}>{t("nav_portfolio")}</th>
              <th style={{ fontSize: 10.5 }}>{t("emp_product")}</th>
              <th style={{ fontSize: 10.5 }}>{t("col_status")}</th>
            </tr></thead>
            <tbody>
              {filteredProjs.map(p => (
                <tr key={p.id} onClick={() => nav("project", { id: p.id })}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td><span className="tag">{prodShort(p.product)}</span></td>
                  <td style={{ whiteSpace: "nowrap" }}><StatusBadge norm={p.norm} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredProjs.length && <div className="empty" style={{ padding: 20 }}>{t("noData")}</div>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProjectDetail, Workload, EmployeeProfile, healthOf, HEALTH });
