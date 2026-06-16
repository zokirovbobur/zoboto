// ===== views5: Ohirgi o'zgarishlar (Recent Changes / Launches) =====
const { useState: uS5 } = React;

const RECENT_LAUNCHES = [
  {
    id: "a2a",
    date: "2026-06-16",
    product: "Trastpay",
    name_uz: "A2A — Hisob-kitoblar o'rtasidagi o'tkazma",
    name_ru: "A2A — Перевод между счетами",
    epicKey: "SL-194",
    pmoId: "P049",
    status: "launched",
    tasks: [
      { key: "SL-195", summary: "[Flutter] Draw UI for full flow", done: true },
      { key: "SL-196", summary: "[Flutter] Integrate with backend API", done: true },
      { key: "SL-212", summary: "Привязка номера телефона к кошелку счет (22616)", done: true },
      { key: "SL-213", summary: "[back] BM > p2p/info", done: true },
      { key: "SL-214", summary: "[back] BM > p2p/pay", done: true },
      { key: "SL-238", summary: "A2A > Text UX ga to'ri holatda mobilkaga berilishi kerak", done: false },
    ],
  },
  {
    id: "moneysend",
    date: "2026-06-16",
    product: "Trastpay",
    name_uz: "Mastercard Moneysend — Karta orqali P2P o'tkazma",
    name_ru: "Mastercard Moneysend — Переводы (MasterCard P2P)",
    epicKey: "SL-9",
    pmoId: "P001",
    status: "launched",
    tasks: [
      { key: "SL-26",  summary: "Проверка карты получателя", done: true },
      { key: "SL-27",  summary: "Совершения перевода", done: true },
      { key: "SL-28",  summary: "Получить статус транзакции", done: true },
      { key: "SL-65",  summary: "Инициализация перевода Visa Direct", done: true },
      { key: "SL-69",  summary: "Верстка", done: true },
      { key: "SL-130", summary: "Take payment info (Android)", done: true },
      { key: "SL-132", summary: "Send payment detail to BM", done: true },
    ],
  },
];

function LaunchCard({ item, lang }) {
  const [open, setOpen] = uS5(false);
  const board = JIRA_BOARDS[item.product];
  const name = lang === "ru" ? item.name_ru : item.name_uz;
  const doneTasks = item.tasks.filter(t => t.done);
  const openTasks = item.tasks.filter(t => !t.done);

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Green launched badge column */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingTop: 2, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: "#E4F3EB",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#138A5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div style={{ width: 1, flex: 1, background: "var(--line-2)", minHeight: 20 }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: "#138A5E",
              background: "#E4F3EB", borderRadius: 6, padding: "2px 8px",
              textTransform: "uppercase", letterSpacing: ".4px"
            }}>Ishga tushdi</span>
            <span style={{ fontSize: 11, color: "var(--muted-2)" }}>{item.date}</span>
            {board && (
              <span style={{
                fontSize: 11, fontWeight: 600, color: board.color,
                background: board.color + "18", borderRadius: 6, padding: "2px 8px"
              }}>{item.product}</span>
            )}
          </div>

          {/* Name + epic link */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{name}</span>
            <a href={JIRA_BASE + "/browse/" + item.epicKey} target="_blank" rel="noopener noreferrer"
               style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#2563EB",
                        fontSize: 11, fontWeight: 600, textDecoration: "none", opacity: .8 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              {item.epicKey}
            </a>
            <span style={{ fontSize: 11, color: "var(--muted-2)" }}>· {item.pmoId}</span>
          </div>

          {/* Task count + expand toggle */}
          <button onClick={() => setOpen(o => !o)} style={{
            display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6, padding: "5px 10px",
            background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8,
            fontSize: 12, color: "var(--muted)", cursor: "pointer", fontWeight: 500
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={open ? "M6 9l6 6 6-6" : "M6 15l6-6 6 6"}/>
            </svg>
            {item.tasks.length} ta task
            {openTasks.length > 0 && (
              <span style={{ marginLeft: 2, color: "#D97706", fontWeight: 600 }}>
                · {openTasks.length} ochiq
              </span>
            )}
          </button>

          {/* Task list */}
          {open && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
              {item.tasks.map(task => (
                <a key={task.key} href={JIRA_BASE + "/browse/" + task.key}
                   target="_blank" rel="noopener noreferrer"
                   style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                            background: task.done ? "var(--bg)" : "#FFFBEB",
                            borderRadius: 8, textDecoration: "none",
                            border: "1px solid " + (task.done ? "var(--line-2)" : "#FDE68A") }}>
                  <span style={{ flexShrink: 0 }}>
                    {task.done ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#138A5E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>
                      </svg>
                    )}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#2563EB", flexShrink: 0 }}>{task.key}</span>
                  <span style={{ fontSize: 12, color: task.done ? "var(--muted)" : "var(--ink)", flex: 1 }}>{task.summary}</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--muted-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecentChanges() {
  const t = useT(); const { lang } = useApp();
  return (
    <div className="fade-in">
      <PageHead
        title={t("nav_changes")}
        sub={lang === "ru" ? "Запущенные продукты и фичи с историей задач" : "Ishga tushirilgan mahsulotlar va xususiyatlar, task tarixi bilan"}
        crumbs={[{ label: t("nav_dashboard"), to: "dashboard" }, { label: t("nav_changes") }]}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".4px" }}>
          2026-yil iyun
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--line-2)" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {RECENT_LAUNCHES.map(item => (
          <LaunchCard key={item.id} item={item} lang={lang} />
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { RecentChanges });
