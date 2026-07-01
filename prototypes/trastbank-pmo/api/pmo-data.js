// ===================================================================
// GET /api/pmo-data
//
// Returns the board's current data straight from Vercel KV. The
// frontend calls this once on boot instead of loading static
// data.js/jira_issues.js/devops_issues.js files.
// ===================================================================

const { kvGet } = require("../lib/kv.js");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Use GET" });

  try {
    const [TB_DATA, TB_JIRA_ISSUES, DEVOPS_ISSUES] = await Promise.all([
      kvGet("TB_DATA"),
      kvGet("TB_JIRA_ISSUES"),
      kvGet("DEVOPS_ISSUES"),
    ]);
    if (!TB_DATA) {
      return res.status(409).json({ ok: false, error: "KV bo'sh — avval POST /api/pmo-seed ni chaqiring" });
    }
    return res.status(200).json({ ok: true, TB_DATA, TB_JIRA_ISSUES: TB_JIRA_ISSUES || {}, DEVOPS_ISSUES: DEVOPS_ISSUES || [] });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};
