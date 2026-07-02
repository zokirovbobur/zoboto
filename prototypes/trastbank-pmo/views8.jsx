// ===== views8: Jira Sync Log — history of "Jiradan yangilash" runs =====
const { useState: uS8, useEffect: uE8 } = React;
const useT8 = () => { const { lang } = useApp(); const d = window.TB_I18N[lang]; return k => d && d[k] != null ? d[k] : k; };

function fmtLogTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const p = n => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// "kim yangilagan" + vaqt — har bir sync yozuvining o'ng yuqori burchagida.
function SyncMeta({ entry }) {
  const ru = useApp().lang === "ru";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
      {entry.updatedBy && (
        <span style={{ fontSize: 11.5, color: "var(--ink)", fontWeight: 600 }}>
          {(ru ? "Обновил: " : "Yangiladi: ") + entry.updatedBy}
        </span>
      )}
      <span style={{ fontSize: 11.5, color: "var(--muted-2)" }}>{fmtLogTime(entry.timestamp)}</span>
    </div>
  );
}

function SyncLogEntry({ entry }) {
  const { lang, nav } = useApp();
  const ru = lang === "ru";
  const [expanded, setExpanded] = uS8(false);
  if (!entry.ok) {
    return (
      <div className="card card-pad" style={{ borderLeft: "3px solid #C2410C" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span className="pill" style={{ background: "#FBEADD", color: "#C2410C" }}>{ru ? "Xato" : "Xato"}</span>
          <SyncMeta entry={entry} />
        </div>
        <div style={{ fontSize: 13, color: "var(--ink)" }}>{entry.error}</div>
      </div>
    );
  }
  const hasChanges = entry.changed;
  return (
    <div className="card card-pad" style={{ borderLeft: "3px solid " + (hasChanges ? "#2563EB" : "#138A5E") }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span className="pill" style={{ background: hasChanges ? "#E7EEFD" : "#E4F3EB", color: hasChanges ? "#2563EB" : "#138A5E" }}>
          {hasChanges
            ? (ru ? `${entry.updated.length} loyiha yangilandi` : `${entry.updated.length} loyiha yangilandi`)
            : (ru ? "Farq topilmadi" : "Farq topilmadi")}
        </span>
        <SyncMeta entry={entry} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12.5, color: "var(--muted)" }}>
        <span><b style={{ color: "var(--ink)" }}>{entry.updated.length}</b> yangilangan</span>
        <span><b style={{ color: "var(--ink)" }}>{entry.unchangedCount}</b> farqsiz</span>
        {entry.newNames.length > 0 && <span><b style={{ color: "var(--ink)" }}>{entry.newNames.length}</b> yangi ism</span>}
        {entry.emptyEpics.length > 0 && <span><b style={{ color: "var(--ink)" }}>{entry.emptyEpics.length}</b> bo'sh epic</span>}
        {entry.epicNotFound.length > 0 && <span><b style={{ color: "var(--ink)" }}>{entry.epicNotFound.length}</b> topilmagan epic</span>}
        {entry.newBoards && entry.newBoards.length > 0 && <span><b style={{ color: "var(--ink)" }}>{entry.newBoards.length}</b> yangi doska</span>}
        {entry.newProjects && entry.newProjects.length > 0 && <span><b style={{ color: "var(--ink)" }}>{entry.newProjects.length}</b> yangi loyiha</span>}
      </div>
      {entry.newBoards && entry.newBoards.length > 0 && (
        <div style={{ marginTop: 6, fontSize: 12, color: "#B45309" }}>
          Yangi doska(lar) topildi: {entry.newBoards.join(", ")} — Mahsulot deb qabul qilindi.
        </div>
      )}
      {entry.newProjects && entry.newProjects.length > 0 && (
        <div style={{ marginTop: 6, fontSize: 12, color: "#B45309" }}>
          Yangi loyiha(lar) yaratildi (goal/budget/customer qo'lda to'ldiring):{" "}
          {entry.newProjects.map(p => `${p.id} ${p.name}`).join("; ")}
        </div>
      )}
      {entry.diffs && entry.diffs.length > 0 ? (
        <div style={{ marginTop: 8 }}>
          <button className="btn btn-ghost" style={{ fontSize: 11.5, padding: "3px 10px" }} onClick={() => setExpanded(e => !e)}>
            {expanded ? "Yopish ▲" : `O'zgarishlarni ko'rish (${entry.diffs.length} loyiha) ▼`}
          </button>
          {expanded && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {entry.diffs.map((d, i) => (
                <div key={i} style={{ fontSize: 12, borderTop: "1px solid var(--line-2)", paddingTop: 6 }}>
                  <span className="link-text" style={{ color: "var(--accent)", fontWeight: 600, cursor: "pointer" }}
                    onClick={() => nav("project", { id: d.id })}>{d.id} — {d.name}</span>
                  <div style={{ marginTop: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                    {d.diffs.map(([field, oldV, newV], j) => (
                      <div key={j} style={{ color: "var(--muted)" }}>
                        <b style={{ color: "var(--ink)" }}>{field}</b>:{" "}
                        <span style={{ color: "#C2410C" }}>{oldV || "—"}</span>
                        {" → "}
                        <span style={{ color: "#138A5E" }}>{newV || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : entry.updated.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
          {entry.updated.join(", ")}
        </div>
      )}
    </div>
  );
}

function SyncLogPage() {
  const t = useT8();
  const [state, setState] = uS8("loading"); // loading | done | error
  const [log, setLog] = uS8([]);
  const [error, setError] = uS8("");

  uE8(() => {
    const endpoint = window.PMO_SYNC_LOG_ENDPOINT;
    if (!endpoint) { setState("error"); setError("PMO_SYNC_LOG_ENDPOINT sozlanmagan"); return; }
    fetch(endpoint)
      .then(r => r.json())
      .then(j => {
        if (j.ok === false) throw new Error(j.error || "unknown error");
        setLog(j.log || []);
        setState("done");
      })
      .catch(e => { setError(e.message); setState("error"); });
  }, []);

  return (
    <div className="fade-in">
      <PageHead
        title="Jira sync tarixi"
        sub="Har bir “Jiradan yangilash” bosilganda nima o'zgargani shu yerda saqlanadi"
        crumbs={[{ label: t("nav_dashboard"), to: "dashboard" }, { label: "Sync tarixi" }]}
      />

      {state === "loading" && <div className="card card-pad muted">{t("noData")}…</div>}
      {state === "error" && (
        <div className="card card-pad" style={{ color: "#C2410C" }}>{error}</div>
      )}
      {state === "done" && log.length === 0 && (
        <div className="card card-pad muted">{t("noData")}</div>
      )}
      {state === "done" && log.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {log.map((entry, i) => <SyncLogEntry key={i} entry={entry} />)}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { SyncLogPage });
