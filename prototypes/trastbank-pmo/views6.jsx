// ===== views6: DevOps Report (Trastbank DevOps / TD project) =====
const { useState: uS6, useEffect: uE6, useMemo: uM6, useRef: uR6 } = React;
const useT6 = () => { const { lang } = useApp(); const d = window.TB_I18N[lang]; return k => d && d[k] != null ? d[k] : k; };

// ---- helpers ----
const DEVOPS_STATUS = {
  "DONE":                   { label_uz: "Bajarildi",    label_ru: "Выполнено",    color: "#138A5E", bg: "#E4F3EB" },
  "IN PROGRESS":            { label_uz: "Jarayonda",    label_ru: "В работе",     color: "#2563EB", bg: "#E7EEFD" },
  "Проверка":               { label_uz: "Tekshiruvda",  label_ru: "На проверке",  color: "#0E9C8E", bg: "#E0F5F3" },
  "Selected for Development":{ label_uz: "Navbatda",   label_ru: "В очереди",    color: "#6D5CD6", bg: "#ECEAFB" },
  "TO DO":                  { label_uz: "Kutilmoqda",   label_ru: "К выполнению", color: "#C2410C", bg: "#FBEADD" },
};

function devopsStatusMeta(status, lang) {
  const m = DEVOPS_STATUS[status] || { label_uz: status, label_ru: status, color: "#8A93A6", bg: "#EEF2F8" };
  return { ...m, label: lang === "ru" ? m.label_ru : m.label_uz };
}

function avatarInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name[0].toUpperCase();
}

const ENGINEER_COLORS = [
  "#2563EB", "#138A5E", "#6D5CD6", "#C2410C", "#0E9C8E"
];

// ---- weekly buckets (last 6 ISO weeks) ----
function buildWeeklyData(issues) {
  const now = new Date("2026-06-23");
  const weeks = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const mon = new Date(d);
    mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    weeks.push({
      label: mon.toISOString().substring(5, 10),
      start: mon.toISOString().substring(0, 10),
      end: sun.toISOString().substring(0, 10),
      total: 0, done: 0
    });
  }
  issues.forEach(([key, , status, , , created]) => {
    weeks.forEach(w => {
      if (created >= w.start && created <= w.end) {
        w.total++;
        if (status === "DONE") w.done++;
      }
    });
  });
  return weeks;
}

// ---- Chart component ----
function DevopsBarChart({ weeks, dark }) {
  const canvasRef = uR6(null);
  const chartRef = uR6(null);

  uE6(() => {
    if (!canvasRef.current || !window.Chart) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    const gridColor = dark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.06)";
    const textColor = dark ? "#8A96AE" : "#8A93A6";
    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: weeks.map(w => w.label),
        datasets: [
          {
            label: "Jami",
            data: weeks.map(w => w.total),
            backgroundColor: dark ? "rgba(77,142,245,.25)" : "rgba(37,99,235,.14)",
            borderColor: dark ? "#4D8EF5" : "#2563EB",
            borderWidth: 1.5, borderRadius: 5, borderSkipped: false,
          },
          {
            label: "Bajarildi",
            data: weeks.map(w => w.done),
            backgroundColor: dark ? "rgba(34,196,122,.28)" : "rgba(19,138,94,.16)",
            borderColor: dark ? "#22C47A" : "#138A5E",
            borderWidth: 1.5, borderRadius: 5, borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor, font: { size: 12 }, boxWidth: 12 } }, tooltip: { mode: "index", intersect: false } },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 } } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 11 }, stepSize: 5 }, beginAtZero: true }
        }
      }
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [weeks, dark]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
}

// ---- Engineer card ----
function EngineerCard({ name, stats, color, lang }) {
  const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
  const initials = avatarInitials(name);
  const shortName = name.split(" ").slice(0,2).join(" ");
  return (
    <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="avatar" style={{ width: 38, height: 38, fontSize: 14, background: color }}>{initials}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink)" }}>{shortName}</div>
          <div style={{ fontSize: 11, color: "var(--muted-2)" }}>{stats.total} {lang === "ru" ? "тикетов" : "ta ticket"}</div>
        </div>
        <div style={{ marginLeft: "auto", fontWeight: 700, fontSize: 20, color }}>
          {pct}%
        </div>
      </div>
      <div className="progress">
        <div className="progress-fill" style={{ width: pct + "%", background: color }} />
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {stats.done > 0 && <span className="pill pill-green">{stats.done} {lang === "ru" ? "готово" : "tayyor"}</span>}
        {stats.inprog > 0 && <span className="pill pill-blue">{stats.inprog} {lang === "ru" ? "в работе" : "jarayonda"}</span>}
        {stats.review > 0 && <span className="pill" style={{ background: "#E0F5F3", color: "#0E9C8E" }}>{stats.review} {lang === "ru" ? "проверка" : "tekshiruv"}</span>}
        {stats.todo > 0 && <span className="pill pill-amber">{stats.todo} {lang === "ru" ? "ожидает" : "kutilmoqda"}</span>}
      </div>
    </div>
  );
}

// ---- Main page ----
function DevopsReport() {
  const t = useT6();
  const { lang } = useApp();
  const [statusFilter, setStatusFilter] = uS6("all");
  const [assigneeFilter, setAssigneeFilter] = uS6("all");
  const [search, setSearch] = uS6("");
  const [dark, setDark] = uS6(() => document.documentElement.getAttribute("data-theme") === "dark");

  uE6(() => {
    const obs = new MutationObserver(() => setDark(document.documentElement.getAttribute("data-theme") === "dark"));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const issues = window.DEVOPS_ISSUES || [];
  const jiraBase = window.DEVOPS_JIRA_BASE || "https://test-tb.atlassian.net";

  // KPI counts
  const kpi = uM6(() => {
    let done = 0, inprog = 0, review = 0, todo = 0, queue = 0;
    issues.forEach(([,, st]) => {
      if (st === "DONE") done++;
      else if (st === "IN PROGRESS") inprog++;
      else if (st === "Проверка") review++;
      else if (st === "TO DO") todo++;
      else if (st === "Selected for Development") queue++;
    });
    return { total: issues.length, done, inprog, review, todo, queue, open: inprog + review + todo + queue };
  }, [issues]);

  // Engineers
  const engineers = uM6(() => {
    const map = {};
    issues.forEach(([,, st,, assignee]) => {
      if (!assignee) return;
      if (!map[assignee]) map[assignee] = { total: 0, done: 0, inprog: 0, review: 0, todo: 0 };
      map[assignee].total++;
      if (st === "DONE") map[assignee].done++;
      else if (st === "IN PROGRESS") map[assignee].inprog++;
      else if (st === "Проверка") map[assignee].review++;
      else map[assignee].todo++;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [issues]);

  // Unique assignees for filter
  const assignees = uM6(() => [...new Set(issues.map(i => i[4]).filter(Boolean))].sort(), [issues]);

  // Weekly chart data
  const weeks = uM6(() => buildWeeklyData(issues), [issues]);

  // Filtered issues
  const filtered = uM6(() => {
    return issues.filter(([key, summary, st,, assignee]) => {
      if (statusFilter !== "all" && st !== statusFilter) return false;
      if (assigneeFilter !== "all" && assignee !== assigneeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!key.toLowerCase().includes(q) && !summary.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [issues, statusFilter, assigneeFilter, search]);

  const completionPct = kpi.total ? Math.round((kpi.done / kpi.total) * 100) : 0;

  return (
    <div className="fade-in">
      {/* Header */}
      <PageHead
        title={lang === "ru" ? "DevOps отчёт" : "DevOps hisoboti"}
        sub={lang === "ru"
          ? `Проект TD · ${issues.length} тикетов · синхронизировано 23 Июн 2026`
          : `TD loyihasi · ${issues.length} ta ticket · yangilangan 23 Iyn 2026`}
        crumbs={[
          { label: t("nav_dashboard"), to: "dashboard" },
          { label: lang === "ru" ? "DevOps отчёт" : "DevOps hisoboti" }
        ]}
      />

      {/* KPI Row */}
      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
        {[
          { val: kpi.total,    label: lang==="ru"?"Всего тикетов":"Jami ticketlar",  accent:"#2563EB" },
          { val: kpi.done,     label: lang==="ru"?"Выполнено":"Bajarildi",           accent:"#138A5E" },
          { val: kpi.inprog,   label: lang==="ru"?"В работе":"Jarayonda",            accent:"#2563EB" },
          { val: kpi.review,   label: lang==="ru"?"На проверке":"Tekshiruvda",       accent:"#0E9C8E" },
          { val: kpi.open,     label: lang==="ru"?"Открытых":"Ochiq ticketlar",      accent:"#C2410C" },
        ].map((k, i) => (
          <div key={i} className="kpi" style={{ "--kpi-accent": k.accent }}>
            <div className="kpi-val" style={{ color: k.accent }}>{k.val}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Progress + Chart row */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1.6fr", marginBottom: 16 }}>
        {/* Completion */}
        <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: 4 }}>
            {lang === "ru" ? "Прогресс выполнения" : "Bajarish ko'rsatkichi"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="health-ring" style={{ background: completionPct >= 80 ? "#138A5E" : completionPct >= 50 ? "#2563EB" : "#C2410C" }}>
              {completionPct}%
            </div>
            <div style={{ flex: 1 }}>
              <div className="progress" style={{ height: 10, marginBottom: 8 }}>
                <div className="progress-fill" style={{ width: completionPct + "%", background: completionPct >= 80 ? "#138A5E" : "#2563EB" }} />
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {kpi.done} / {kpi.total} {lang === "ru" ? "тикетов закрыто" : "ticket yopildi"}
              </div>
            </div>
          </div>

          {/* Status breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 4 }}>
            {Object.entries(DEVOPS_STATUS).map(([st, meta]) => {
              const cnt = issues.filter(i => i[2] === st).length;
              if (!cnt) return null;
              const pct = Math.round((cnt / kpi.total) * 100);
              const label = lang === "ru" ? meta.label_ru : meta.label_uz;
              return (
                <div key={st} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: meta.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, color: "var(--muted)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                  <span style={{ fontWeight: 600, color: "var(--ink)" }}>{cnt}</span>
                  <div style={{ width: 60 }}>
                    <div className="progress" style={{ height: 4 }}>
                      <div className="progress-fill" style={{ width: pct + "%", background: meta.color }} />
                    </div>
                  </div>
                  <span style={{ color: "var(--muted-2)", width: 28, textAlign: "right" }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly chart */}
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: 14 }}>
            {lang === "ru" ? "Активность по неделям" : "Haftalik faollik"}
          </div>
          <div style={{ height: 180 }}>
            <DevopsBarChart weeks={weeks} dark={dark} />
          </div>
        </div>
      </div>

      {/* Engineers */}
      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", marginBottom: 10 }}>
        {lang === "ru" ? "Инженеры" : "Muhandislar"}
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 20 }}>
        {engineers.map(([name, stats], idx) => (
          <EngineerCard key={name} name={name} stats={stats} color={ENGINEER_COLORS[idx % ENGINEER_COLORS.length]} lang={lang} />
        ))}
      </div>

      {/* Issue table */}
      <div className="card">
        <div className="card-h">
          <h3>{lang === "ru" ? "Все тикеты" : "Barcha ticketlar"} <span className="hint">({filtered.length})</span></h3>
          <a href={jiraBase + "/jira/software/projects/TD/boards"} target="_blank" rel="noopener noreferrer"
             className="btn btn-ghost" style={{ fontSize: 12 }}>
            Jira →
          </a>
        </div>

        {/* Filters */}
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
              {Object.entries(DEVOPS_STATUS).map(([st, m]) => (
                <option key={st} value={st}>{lang === "ru" ? m.label_ru : m.label_uz}</option>
              ))}
            </select>
          </div>
          <div className="sel">
            <select className="f-sel" value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}>
              <option value="all">{lang === "ru" ? "Все инженеры" : "Barcha muhandislar"}</option>
              {assignees.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {(statusFilter !== "all" || assigneeFilter !== "all" || search) && (
            <button className="btn btn-ghost" style={{ fontSize: 12 }}
              onClick={() => { setStatusFilter("all"); setAssigneeFilter("all"); setSearch(""); }}>
              {t("resetFilters")}
            </button>
          )}
        </div>

        <div className="tbl-wrap" style={{ marginTop: 8 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th className="no-sort" style={{ width: 80 }}>Kalit</th>
                <th className="no-sort">{lang === "ru" ? "Задача" : "Vazifa"}</th>
                <th className="no-sort" style={{ width: 130 }}>Status</th>
                <th className="no-sort" style={{ width: 160 }}>{lang === "ru" ? "Исполнитель" : "Muhandis"}</th>
                <th className="no-sort" style={{ width: 100 }}>{lang === "ru" ? "Создан" : "Yaratildi"}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="empty">{t("noData")}</td></tr>
              )}
              {filtered.map(([key, summary, st,, assignee, created]) => {
                const meta = devopsStatusMeta(st, lang);
                const initials = avatarInitials(assignee);
                const engIdx = engineers.findIndex(([n]) => n === assignee);
                const engColor = ENGINEER_COLORS[engIdx % ENGINEER_COLORS.length] || "#8A93A6";
                return (
                  <tr key={key} onClick={() => window.open(jiraBase + "/browse/" + key, "_blank")} style={{ cursor: "pointer" }}>
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
                      <span className="pill" style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                    </td>
                    <td>
                      {assignee ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <div className="avatar" style={{ width: 24, height: 24, fontSize: 10, background: engColor }}>{initials}</div>
                          <span style={{ fontSize: 12, color: "var(--ink)" }}>{assignee.split(" ").slice(0,2).join(" ")}</span>
                        </div>
                      ) : <span className="t-muted">—</span>}
                    </td>
                    <td className="t-muted" style={{ fontSize: 12, whiteSpace: "nowrap" }}>{created}</td>
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

Object.assign(window, { DevopsReport });
