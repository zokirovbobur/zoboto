// ===================================================================
// POST /api/pmo-sync
//
// Triggered by the "Jiradan yangilash" button on the PMO board.
// Re-syncs Jira (deterministic, no LLM) and writes the result straight
// to Vercel KV — no git commits involved. The frontend re-fetches
// /api/pmo-data afterwards to pick up the new state.
//
// Required env vars (Vercel Project Settings -> Environment Variables):
//   JIRA_BASE_URL     e.g. https://test-tb.atlassian.net
//   JIRA_EMAIL        Jira account email for the API token
//   JIRA_API_TOKEN    https://id.atlassian.com/manage-profile/security/api-tokens
//   KV_REST_API_URL / KV_REST_API_TOKEN  auto-set when a KV store is attached
// Optional:
//   SYNC_SHARED_SECRET  if set, caller must send header x-sync-secret matching it
// ===================================================================

const { runSync } = require("../lib/jira-sync-core.js");
const { kvGet, kvSet } = require("../lib/kv.js");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-sync-secret");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use POST" });

  const secret = process.env.SYNC_SHARED_SECRET;
  if (secret && req.headers["x-sync-secret"] !== secret) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN } = process.env;
  for (const [k, v] of Object.entries({ JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN })) {
    if (!v) return res.status(500).json({ ok: false, error: `Missing env var: ${k}` });
  }

  const dryRun = req.body?.dryRun === true || req.query?.dryRun === "1";

  try {
    const dataObj = await kvGet("TB_DATA");
    if (!dataObj) {
      return res.status(409).json({ ok: false, error: "KV bo'sh — avval /api/pmo-seed ni chaqiring" });
    }

    const result = await runSync(
      { jiraBaseUrl: JIRA_BASE_URL, jiraEmail: JIRA_EMAIL, jiraApiToken: JIRA_API_TOKEN },
      { dataObj }
    );

    if (!dryRun) {
      await Promise.all([
        kvSet("TB_DATA", result.dataObj),
        kvSet("TB_JIRA_ISSUES", result.jiraIssuesObj),
        kvSet("DEVOPS_ISSUES", result.devopsIssuesArr),
        kvSet("SYNC_LAST_REPORT", { dateStr: result.dateStr, report: result.report, reportText: result.reportText }),
      ]);
    }

    return res.status(200).json({
      ok: true,
      dryRun,
      changed: result.changed,
      report: result.report,
      reportText: result.reportText,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};
