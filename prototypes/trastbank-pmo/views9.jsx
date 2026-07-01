// ===== views9: Feedback texti ro'yhati — list of feedback left on any page =====
const { useState: uS9, useEffect: uE9 } = React;
const useT9 = () => { const { lang } = useApp(); const d = window.TB_I18N[lang]; return k => d && d[k] != null ? d[k] : k; };

function fmtFeedbackTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const p = n => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// route id -> nav label i18n key, for showing a readable page name
const FEEDBACK_PAGE_LABELS = {
  dashboard: "nav_dashboard", portfolio: "nav_portfolio", operations: "nav_operations",
  changes: "nav_changes", roadmap: "nav_roadmap", workload: "nav_workload",
  risks: "nav_risks", reports: "nav_reports", sync_log: "nav_sync_log",
  devops: "nav_devops", project: "nav_portfolio", employee: "nav_workload",
};

function FeedbackPage() {
  const t = useT9();
  const [state, setState] = uS9("loading"); // loading | done | error
  const [list, setList] = uS9([]);
  const [error, setError] = uS9("");

  uE9(() => {
    const endpoint = window.PMO_FEEDBACK_ENDPOINT;
    if (!endpoint) { setState("error"); setError("PMO_FEEDBACK_ENDPOINT sozlanmagan"); return; }
    fetch(endpoint)
      .then(r => r.json())
      .then(j => {
        if (j.ok === false) throw new Error(j.error || "unknown error");
        setList(j.feedback || []);
        setState("done");
      })
      .catch(e => { setError(e.message); setState("error"); });
  }, []);

  return (
    <div className="fade-in">
      <PageHead
        title={t("nav_feedback")}
        sub={t("feedback_sub")}
        crumbs={[{ label: t("nav_dashboard"), to: "dashboard" }, { label: t("nav_feedback") }]}
      />

      {state === "loading" && <div className="card card-pad muted">{t("noData")}…</div>}
      {state === "error" && <div className="card card-pad" style={{ color: "#C2410C" }}>{error}</div>}
      {state === "done" && list.length === 0 && <div className="card card-pad muted">{t("noData")}</div>}
      {state === "done" && list.length > 0 && (
        <div className="card">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr>
                <th className="no-sort">{t("feedback_text")}</th>
                <th className="no-sort" style={{ width: 180 }}>{t("feedback_page")}</th>
                <th className="no-sort" style={{ width: 150 }}>{t("feedback_time")}</th>
              </tr></thead>
              <tbody>
                {list.map(f => (
                  <tr key={f.id}>
                    <td style={{ whiteSpace: "pre-wrap" }}>{f.text}</td>
                    <td className="t-muted">{FEEDBACK_PAGE_LABELS[f.page] ? t(FEEDBACK_PAGE_LABELS[f.page]) : (f.page || "—")}</td>
                    <td className="t-muted" style={{ whiteSpace: "nowrap" }}>{fmtFeedbackTime(f.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { FeedbackPage });
