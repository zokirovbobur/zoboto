// ===== views7: Operations Report (BSA + DevOps boards) =====
const { useState: uS7, useEffect: uE7, useMemo: uM7, useRef: uR7 } = React;
const useT7 = () => { const { lang } = useApp(); const d = window.TB_I18N[lang]; return k => d && d[k] != null ? d[k] : k; };

const OPS_STATUS = {
  "DONE":                    { label_uz: "Bajarildi",       label_ru: "Выполнено",          color: "#138A5E" },
  "Готово":                  { label_uz: "Bajarildi",       label_ru: "Готово",             color: "#138A5E" },
  "IN PROGRESS":             { label_uz: "Jarayonda",       label_ru: "В работе",           color: "#2563EB" },
  "in dev":                  { label_uz: "Jarayonda",       label_ru: "В разработке",       color: "#2563EB" },
  "Проверка":                { label_uz: "Tekshiruvda",     label_ru: "На проверке",        color: "#0E9C8E" },
  "Ready for dev":           { label_uz: "Dev uchun tayyor",label_ru: "Готов к разработке", color: "#0E9C8E" },
  "Selected for Development":{ label_uz: "Navbatda",        label_ru: "В очереди",          color: "#6D5CD6" },
  "Backlog":                 { label_uz: "Navbat",          label_ru: "Беклог",             color: "#6D5CD6" },
  "backlog":                 { label_uz: "Navbat",          label_ru: "Беклог",             color: "#6D5CD6" },
  "TO DO":                   { label_uz: "Kutilmoqda",      label_ru: "К выполнению",       color: "#C2410C" },
  "Blocked":                 { label_uz: "Bloklangan",      label_ru: "Заблокировано",      color: "#DC2626" },
};

const OPS_DONE = new Set(["DONE", "Готово"]);

function opsStatusMeta(status, lang) {
  const m = OPS_STATUS[status] || { label_uz: status, label_ru: status, color: "#8A93A6" };
  return { ...m, bg: m.color + "22", label: lang === "ru" ? m.label_ru : m.label_uz };
}

// Build employee name → id lookup (tries direct + reversed surname/name order)
function buildEmpMap() {
  const map = {};
  (DATA.employees || []).forEach(e => {
    if (!e.matchKey) return;
    map[e.matchKey] = e.id;
    const parts = e.matchKey.split(/\s+/);
    if (parts.length >= 2) {
      // "lastname firstname" → also index as "firstname lastname"
      map[parts.slice(1).join(" ") + " " + parts[0]] = e.id;
    }
  });
  return map;
}
const OPS_EMP_MAP = buildEmpMap();

function lookupEmpId(name) {
  if (!name) return null;
  const lower = name.trim().toLowerCase();
  if (OPS_EMP_MAP[lower]) return OPS_EMP_MAP[lower];
  const parts = lower.split(/\s+/);
  if (parts.length >= 2) {
    // try reversed
    const rev = parts[parts.length - 1] + " " + parts.slice(0, -1).join(" ");
    if (OPS_EMP_MAP[rev]) return OPS_EMP_MAP[rev];
  }
  return null;
}

function avatarInitials7(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name[0].toUpperCase();
}

const OPS_COLORS = ["#2563EB", "#138A5E", "#6D5CD6", "#C2410C", "#0E9C8E"];

// Normalize both data sources to a common format
function getOpsTickets() {
  const td = (window.DEVOPS_ISSUES || []).map(([key, summary, status, , assignee, created]) => ({
    key, summary, status: status || "TO DO", assignee: assignee || null, created: created || "", product: "Trastbank devops",
  }));
  const bsaRaw = ((window.TB_JIRA_ISSUES || {})["BSA-BOARD"] || []);
  const bsa = bsaRaw.map(t => ({
    key: t.key, summary: t.summary, status: t.status || "Backlog", assignee: t.assignee || null, created: "", product: "Business and System Analysis",
  }));
  return [...bsa, ...td];
}

function OpsEngineerCard({ name, stats, color, lang, active, onSelect }) {
  const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
  const initials = avatarInitials7(name);
  const shortName = name.split(" ").slice(0, 2).join(" ");
  return (
    <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 12,
      cursor: "pointer", outline: active ? "2px solid #2563EB" : "none" }}
      onClick={onSelect}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="avatar" style={{ width: 38, height: 38, fontSize: 14, background: color }}>{initials}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: "#2563EB" }}>{shortName}</div>
          <div style={{ fontSize: 11, color: "var(--muted-2)" }}>{stats.total} {lang === "ru" ? "тикетов" : "ta ticket"}</div>
        </div>
        <div style={{ marginLeft: "auto", fontWeight: 700, fontSize: 20, color }}>{pct}%</div>
      </div>
      <div className="progress">
        <div className="progress-fill" style={{ width: pct + "%", background: color }} />
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {stats.done > 0 && <span className="pill pill-green">{stats.done} {lang === "ru" ? "готово" : "tayyor"}</span>}
        {stats.inprog > 0 && <span className="pill pill-blue">{stats.inprog} {lang === "ru" ? "в работе" : "jarayonda"}</span>}
        {stats.review > 0 && <span className="pill" style={{ background: "#0E9C8E22", color: "#0E9C8E" }}>{stats.review} {lang === "ru" ? "проверка" : "tekshiruv"}</span>}
        {stats.todo > 0 && <span className="pill pill-amber">{stats.todo} {lang === "ru" ? "ожидает" : "kutilmoqda"}</span>}
      </div>
    </div>
  );
}

function OperationsReport() {
  const t = useT7();
  const { lang, nav } = useApp();
  const [productFilter, setProductFilter] = uS7("all");
  const [statusFilter, setStatusFilter] = uS7("all");
  const [assigneeFilter, setAssigneeFilter] = uS7("all");
  const [search, setSearch] = uS7("");

  const allTickets = uM7(() => getOpsTickets(), []);

  const products = uM7(() => [...new Set(allTickets.map(t => t.product))].sort(), [allTickets]);

  const filtered = uM7(() => {
    return allTickets.filter(({ key, summary, status, assignee, product }) => {
      if (productFilter !== "all" && product !== productFilter) return false;
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (assigneeFilter !== "all" && assignee !== assigneeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!key.toLowerCase().includes(q) && !summary.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allTickets, productFilter, statusFilter, assigneeFilter, search]);

  const kpi = uM7(() => {
    const src = productFilter === "all" ? allTickets : allTickets.filter(t => t.product === productFilter);
    let done = 0, inprog = 0, review = 0, todo = 0;
    src.forEach(({ status }) => {
      if (OPS_DONE.has(status)) done++;
      else if (status === "IN PROGRESS" || status === "in dev") inprog++;
      else if (status === "Проверка" || status === "Ready for dev") review++;
      else todo++;
    });
    return { total: src.length, done, inprog, review, todo, open: inprog + review + todo };
  }, [allTickets, productFilter]);

  const engineers = uM7(() => {
    const src = productFilter === "all" ? allTickets : allTickets.filter(t => t.product === productFilter);
    const map = {};
    src.forEach(({ status, assignee }) => {
      if (!assignee) return;
      if (!map[assignee]) map[assignee] = { total: 0, done: 0, inprog: 0, review: 0, todo: 0 };
      map[assignee].total++;
      if (OPS_DONE.has(status)) map[assignee].done++;
      else if (status === "IN PROGRESS" || status === "in dev") map[assignee].inprog++;
      else if (status === "Проверка" || status === "Ready for dev") map[assignee].review++;
      else map[assignee].todo++;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [allTickets, productFilter]);

  const assignees = uM7(() => {
    const src = productFilter === "all" ? allTickets : allTickets.filter(t => t.product === productFilter);
    return [...new Set(src.map(t => t.assignee).filter(Boolean))].sort();
  }, [allTickets, productFilter]);

  // Unique statuses present in current product selection
  const activeStatuses = uM7(() => {
    const src = productFilter === "all" ? allTickets : allTickets.filter(t => t.product === productFilter);
    return [...new Set(src.map(t => t.status))].filter(s => OPS_STATUS[s]);
  }, [allTickets, productFilter]);

  const completionPct = kpi.total ? Math.round((kpi.done / kpi.total) * 100) : 0;

  const jiraBase = window.DEVOPS_JIRA_BASE || "https://test-tb.atlassian.net";

  const resetFilters = () => { setStatusFilter("all"); setAssigneeFilter("all"); setSearch(""); };

  return (
    <div className="fade-in">
      <PageHead
        title={lang === "ru" ? "Operations" : "Operations"}
        sub={lang === "ru"
          ? `BSA + DevOps · ${allTickets.length} тикетов`
          : `BSA + DevOps · ${allTickets.length} ta ticket`}
        crumbs={[
          { label: t("nav_dashboard"), to: "dashboard" },
          { label: "Operations" }
        ]}
      />

      {/* KPI Row */}
      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
        {[
          { val: kpi.total,  label: lang === "ru" ? "Всего тикетов"  : "Jami ticketlar", accent: "#2563EB" },
          { val: kpi.done,   label: lang === "ru" ? "Выполнено"       : "Bajarildi",      accent: "#138A5E" },
          { val: kpi.inprog, label: lang === "ru" ? "В работе"        : "Jarayonda",      accent: "#2563EB" },
          { val: kpi.review, label: lang === "ru" ? "На проверке"     : "Tekshiruvda",    accent: "#0E9C8E" },
          { val: kpi.open,   label: lang === "ru" ? "Открытых"        : "Ochiq ticketlar",accent: "#C2410C" },
        ].map((k, i) => (
          <div key={i} className="kpi" style={{ "--kpi-accent": k.accent }}>
            <div className="kpi-val" style={{ color: k.accent }}>{k.val}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Product breakdown */}
      <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: 4 }}>
          {lang === "ru" ? "По дискам" : "Doskalar bo'yicha"}
        </div>
        {products.map((prod, i) => {
          const cnt = allTickets.filter(t => t.product === prod).length;
          const doneC = allTickets.filter(t => t.product === prod && OPS_DONE.has(t.status)).length;
          const pct = cnt ? Math.round((doneC / cnt) * 100) : 0;
          const color = OPS_COLORS[i % OPS_COLORS.length];
          const active = productFilter === prod;
          return (
            <div key={prod} style={{ display: "flex", flexDirection: "column", gap: 6, cursor: "pointer",
              padding: 6, margin: -6, borderRadius: 8, background: active ? color + "14" : "transparent" }}
              onClick={() => { setProductFilter(active ? "all" : prod); setAssigneeFilter("all"); setStatusFilter("all"); setSearch(""); }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: "var(--ink)" }}>{prod}</span>
                <span style={{ color: "var(--muted)" }}>{doneC}/{cnt} · {pct}%</span>
              </div>
              <div className="progress" style={{ height: 6 }}>
                <div className="progress-fill" style={{ width: pct + "%", background: color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Engineer cards */}
      {engineers.length > 0 && (
        <>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: 10 }}>
            {lang === "ru" ? "Исполнители" : "Ijrochilar"}
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 20 }}>
            {engineers.slice(0, 8).map(([name, stats], idx) => (
              <OpsEngineerCard key={name} name={name} stats={stats} color={OPS_COLORS[idx % OPS_COLORS.length]} lang={lang}
                active={assigneeFilter === name}
                onSelect={() => setAssigneeFilter(assigneeFilter === name ? "all" : name)} />
            ))}
          </div>
        </>
      )}

      {/* Ticket table */}
      <div className="card">
        <div className="card-h">
          <h3>{lang === "ru" ? "Все тикеты" : "Barcha ticketlar"} <span className="hint">({filtered.length})</span></h3>
          <a href={jiraBase + "/jira/software/projects"} target="_blank" rel="noopener noreferrer"
             className="btn btn-ghost" style={{ fontSize: 12 }}>
            Jira →
          </a>
        </div>

        <div className="filterbar" style={{ padding: "12px 20px 0" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === "ru" ? "Поиск по ключу или названию…" : "Kalit yoki nom bo'yicha qidirish…"}
            style={{ flex: 1, minWidth: 180, maxWidth: 320, border: "1px solid var(--line)", borderRadius: 9,
                     padding: "7px 12px", fontSize: 12.5, background: "var(--select-bg)", color: "var(--ink)",
                     outline: "none", fontFamily: "inherit" }}
          />
          <div className="sel">
            <select className="f-sel" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">{lang === "ru" ? "Все статусы" : "Barcha statuslar"}</option>
              {activeStatuses.map(st => {
                const meta = OPS_STATUS[st];
                return <option key={st} value={st}>{lang === "ru" ? meta.label_ru : meta.label_uz}</option>;
              })}
            </select>
          </div>
          <div className="sel">
            <select className="f-sel" value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}>
              <option value="all">{lang === "ru" ? "Все исполнители" : "Barcha ijrochilar"}</option>
              {assignees.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {(statusFilter !== "all" || assigneeFilter !== "all" || search) && (
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={resetFilters}>
              {t("resetFilters")}
            </button>
          )}
        </div>

        <div className="tbl-wrap" style={{ marginTop: 8 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th className="no-sort" style={{ width: 90 }}>Kalit</th>
                <th className="no-sort">{lang === "ru" ? "Задача" : "Vazifa"}</th>
                <th className="no-sort" style={{ width: 200 }}>{lang === "ru" ? "Доска" : "Doska"}</th>
                <th className="no-sort" style={{ width: 150 }}>Status</th>
                <th className="no-sort" style={{ width: 160 }}>{lang === "ru" ? "Исполнитель" : "Ijrochi"}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="empty">{t("noData")}</td></tr>
              )}
              {filtered.map(({ key, summary, status, assignee, product }, idx) => {
                const meta = opsStatusMeta(status, lang);
                const initials = avatarInitials7(assignee);
                const engIdx = engineers.findIndex(([n]) => n === assignee);
                const engColor = OPS_COLORS[engIdx % OPS_COLORS.length] || "#8A93A6";
                const empId = lookupEmpId(assignee);
                return (
                  <tr key={key + idx} onClick={() => window.open(jiraBase + "/browse/" + key, "_blank")} style={{ cursor: "pointer" }}>
                    <td>
                      <a href={jiraBase + "/browse/" + key} target="_blank" rel="noopener noreferrer"
                         onClick={e => e.stopPropagation()}
                         style={{ fontWeight: 600, fontSize: 12, color: "#2563EB", whiteSpace: "nowrap" }}>{key}</a>
                    </td>
                    <td className="cell-proj">
                      <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {summary}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 11, color: "var(--muted)", background: "var(--line-2)",
                                     borderRadius: 4, padding: "2px 7px", fontWeight: 500 }}>{product}</span>
                    </td>
                    <td>
                      <span className="pill" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                    </td>
                    <td>
                      {assignee ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 7,
                          cursor: empId ? "pointer" : "default" }}
                          onClick={empId ? e => { e.stopPropagation(); nav("employee", { id: empId }); } : undefined}>
                          <div className="avatar" style={{ width: 24, height: 24, fontSize: 10, background: engColor }}>{initials}</div>
                          <span style={{ fontSize: 12, color: empId ? "#2563EB" : "var(--ink)" }}>
                            {assignee.split(" ").slice(0, 2).join(" ")}
                          </span>
                        </div>
                      ) : <span className="t-muted">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OperationsReport, getOpsTickets });
