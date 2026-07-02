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
//
// No client-provided secret is required: the button triggers an idempotent
// re-sync and all real credentials (JIRA_API_TOKEN etc.) stay server-side in
// Vercel env vars, never exposed to the browser. Abuse is limited by the
// SYNC_LOCK (one run at a time) and the CORS allowlist.
// ===================================================================

const { runSync } = require("../lib/jira-sync-core.js");
const { kvGet, kvSet, kvSetNX, kvDel } = require("../lib/kv.js");
const { applyCors } = require("../lib/cors.js");

const SYNC_LOG_MAX_ENTRIES = 50;
// A sync run is capped at 60s (vercel.json maxDuration); the lock's TTL is
// double that so a crashed run can never wedge the button for long.
const SYNC_LOCK_TTL_SECONDS = 120;

// Only these known, safe error shapes are forwarded to the client (endpoint
// + HTTP status, never the response body). Anything else becomes a generic
// "Ichki xatolik" — the full error is still logged server-side.
const SAFE_ERROR_PATTERNS = [
  /^Jira \/search\/jql \d{3}/,
  /^Jira \/search \d{3}/,
  /^Jira project search \d{3}/,
];

function clientErrorMessage(err) {
  const msg = String((err && err.message) || "");
  for (const re of SAFE_ERROR_PATTERNS) {
    const hit = msg.match(re);
    if (hit) return hit[0];
  }
  return "Ichki xatolik";
}

/** Prepends a compact record to the SYNC_LOG list in KV, capped to the most recent N. */
async function appendSyncLog(entry) {
  const log = (await kvGet("SYNC_LOG")) || [];
  log.unshift(entry);
  await kvSet("SYNC_LOG", log.slice(0, SYNC_LOG_MAX_ENTRIES));
}

module.exports = async function handler(req, res) {
  applyCors(req, res, "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use POST" });

  const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN } = process.env;
  for (const [k, v] of Object.entries({ JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN })) {
    if (!v) return res.status(500).json({ ok: false, error: `Missing env var: ${k}` });
  }

  const dryRun = req.body?.dryRun === true || req.query?.dryRun === "1";

  // Who triggered this sync — free-text (autocompleted from the employee list
  // on the client, but any custom name is accepted). Trimmed and length-capped.
  const updatedByRaw = req.body?.updatedBy;
  const updatedBy = typeof updatedByRaw === "string" ? updatedByRaw.trim().slice(0, 80) : "";

  let lockAcquired = false;
  try {
    lockAcquired = await kvSetNX("SYNC_LOCK", 1, SYNC_LOCK_TTL_SECONDS);
    if (!lockAcquired) {
      return res.status(409).json({ ok: false, error: "Sync allaqachon ketmoqda" });
    }

    const dataObj = await kvGet("TB_DATA");
    if (!dataObj) {
      return res.status(409).json({ ok: false, error: "KV bo'sh — avval /api/pmo-seed ni chaqiring" });
    }

    const result = await runSync(
      { jiraBaseUrl: JIRA_BASE_URL, jiraEmail: JIRA_EMAIL, jiraApiToken: JIRA_API_TOKEN },
      { dataObj }
    );

    if (!dryRun) {
      // Written sequentially, TB_DATA LAST on purpose: if a write in the
      // middle fails, the main object stays at its previous consistent state
      // instead of pointing at half-updated satellite keys.
      await kvSet("TB_JIRA_ISSUES", result.jiraIssuesObj);
      await kvSet("DEVOPS_ISSUES", result.devopsIssuesArr);
      await kvSet("SYNC_LAST_REPORT", { dateStr: result.dateStr, report: result.report, reportText: result.reportText });
      await appendSyncLog({
        timestamp: new Date().toISOString(),
        dateStr: result.dateStr,
        ok: true,
        updatedBy,
        changed: result.changed,
        updated: result.report.updated,
        unchangedCount: result.report.unchanged.length,
        newNames: result.report.newNames,
        newBoards: result.report.newBoards || [],
        newProjects: result.report.newProjects || [],
        emptyEpics: [...new Set(result.report.emptyEpics)],
        epicNotFound: result.report.epicNotFound,
        diffs: result.report.diffs,
      });
      await kvSet("TB_DATA", result.dataObj);
    }

    return res.status(200).json({
      ok: true,
      dryRun,
      changed: result.changed,
      report: result.report,
      reportText: result.reportText,
    });
  } catch (err) {
    console.error("pmo-sync error:", err);
    const safeMessage = clientErrorMessage(err);
    await appendSyncLog({
      timestamp: new Date().toISOString(),
      dateStr: new Date().toISOString().slice(0, 10),
      ok: false,
      updatedBy,
      error: safeMessage,
    }).catch(() => {});
    return res.status(500).json({ ok: false, error: safeMessage });
  } finally {
    if (lockAcquired) await kvDel("SYNC_LOCK").catch(() => {});
  }
};
