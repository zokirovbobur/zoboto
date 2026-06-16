// ===== views4: Products (Jira boards + epics) =====
const { useState: uS4, useMemo: uM4 } = React;

const BOARD_ORDER = ["Trastpay", "ДБО", "Food City", "Middleware", "ABS", "AI products"];
const PMO_ONLY_ORDER = ["Цифровые сервисы", "ABS / HR", "Исламский банкинг",
  "Приобретённые продукты", "Trast Business", "Прочее", "Trastbank"];

function ProductCard({ product, projects }) {
  const t = useT(); const { nav } = useApp();
  const [open, setOpen] = uS4(false);
  const board = JIRA_BOARDS[product];

  const counts = uM4(() => {
    const c = { completed: 0, progress: 0, planned: 0, paused: 0 };
    projects.forEach(p => { if (c[p.norm] !== undefined) c[p.norm]++; });
    return c;
  }, [projects]);

  const total = projects.length;

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
           onClick={() => setOpen(o => !o)}>
        {board && board.icon && (
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
                         width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                         background: board.color + "18" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke={board.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d={board.icon} />
            </svg>
          </span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{product}</span>
            {board && (
              <a href={board.url} target="_blank" rel="noopener noreferrer"
                 onClick={e => e.stopPropagation()}
                 title={"Jira: " + board.key}
                 style={{ display: "inline-flex", alignItems: "center", gap: 4,
                          background: (board.color || "#2563EB") + "18",
                          color: board.color || "#2563EB", borderRadius: 6, padding: "2px 8px", fontSize: 11,
                          fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                {board.key}
              </a>
            )}
            {!board && (
              <span style={{ fontSize: 11, color: "var(--muted-2)", background: "var(--line-2)",
                             borderRadius: 6, padding: "2px 8px" }}>PMO only</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
            {STATUS_ORDER.map(s => counts[s] > 0 && (
              <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 5,
                                     fontSize: 12, color: STATUS[s].color, fontWeight: 600 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS[s].dot, display: "inline-block" }} />
                {counts[s]}
              </span>
            ))}
            <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: "auto" }}>{total} loyiha</span>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-2)"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             style={{ transform: open ? "rotate(180deg)" : "none", transition: ".15s", flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid var(--line-2)" }}>
          {projects.length === 0 ? (
            <div className="empty" style={{ padding: "20px" }}>Loyihalar yo'q</div>
          ) : (
            <table className="tbl" style={{ fontSize: 12.5 }}>
              <thead>
                <tr>
                  <th style={{ fontSize: 10.5 }}>Loyiha</th>
                  <th style={{ fontSize: 10.5 }}>Status</th>
                  <th style={{ fontSize: 10.5 }}>Haqiqiy status</th>
                  <th style={{ fontSize: 10.5 }}>PM</th>
                  <th style={{ fontSize: 10.5 }}>Jira</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id} onClick={() => nav("project", { id: p.id })}>
                    <td style={{ fontWeight: 600, maxWidth: 320 }}>
                      {p.name}
                      {p.norm !== "completed" && p.jiraEpicKey && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: "var(--accent)",
                                       background: "var(--accent-soft)", borderRadius: 4,
                                       padding: "1px 5px", fontWeight: 600 }}>
                          {p.jiraEpicKey}
                        </span>
                      )}
                    </td>
                    <td><StatusBadge norm={p.norm} /></td>
                    <td style={{ color: "var(--muted)", fontSize: 11.5 }}>{p.originalStatus || "—"}</td>
                    <td style={{ color: "var(--muted)" }}>{p.pm || "—"}</td>
                    <td>
                      {p.jiraEpicKey ? (
                        <a href={JIRA_BASE + "/browse/" + p.jiraEpicKey}
                           target="_blank" rel="noopener noreferrer"
                           onClick={e => e.stopPropagation()}
                           style={{ display: "inline-flex", alignItems: "center", gap: 3,
                                    color: "#2563EB", fontSize: 11, fontWeight: 600,
                                    textDecoration: "none", opacity: .8 }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                               strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                          {p.jiraEpicKey}
                        </a>
                      ) : (
                        <span style={{ color: "var(--muted-2)", fontSize: 11 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function Products() {
  const t = useT();
  const [showPmoOnly, setShowPmoOnly] = uS4(false);

  const byProduct = uM4(() => {
    const m = {};
    ALL_P.forEach(p => { if (!m[p.product]) m[p.product] = []; m[p.product].push(p); });
    return m;
  }, []);

  const jiraProducts = BOARD_ORDER.filter(pr => byProduct[pr]);
  const pmoProducts  = PMO_ONLY_ORDER.filter(pr => byProduct[pr]);
  const extraJira    = Object.keys(byProduct).filter(pr =>
    !BOARD_ORDER.includes(pr) && !PMO_ONLY_ORDER.includes(pr) && JIRA_BOARDS[pr]
  );
  const extraPmo     = Object.keys(byProduct).filter(pr =>
    !BOARD_ORDER.includes(pr) && !PMO_ONLY_ORDER.includes(pr) && !JIRA_BOARDS[pr]
  );

  const allJira = [...jiraProducts, ...extraJira];
  const allPmo  = [...pmoProducts, ...extraPmo];

  return (
    <div className="fade-in">
      <PageHead
        title="Mahsulotlar"
        sub="Jira doskalariga ulangan mahsulotlar va ularning loyihalari"
        crumbs={[{ label: t("nav_dashboard"), to: "dashboard" }, { label: "Mahsulotlar" }]}
        right={
          <button className={"chip" + (showPmoOnly ? " on" : "")} onClick={() => setShowPmoOnly(v => !v)}>
            PMO only ({allPmo.length})
          </button>
        }
      />

      <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".4px" }}>
          Jira doskasi bor — {allJira.length} ta mahsulot
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--line-2)" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {allJira.map(prod => (
          <ProductCard key={prod} product={prod} projects={byProduct[prod] || []} />
        ))}
      </div>

      {showPmoOnly && allPmo.length > 0 && (
        <>
          <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".4px" }}>
              Faqat PMO — {allPmo.length} ta mahsulot
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--line-2)" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {allPmo.map(prod => (
              <ProductCard key={prod} product={prod} projects={byProduct[prod] || []} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { Products });
