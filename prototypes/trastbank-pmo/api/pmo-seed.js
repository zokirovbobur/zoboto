// ===================================================================
// POST /api/pmo-seed
//
// One-time bootstrap: loads seed/pmo-seed.json (a snapshot of the last
// git-tracked data.js/jira_issues.js/devops_issues.js) into Vercel KV.
// Refuses to overwrite existing data unless {"force": true} is sent,
// so it's safe to call again by accident.
// ===================================================================

const seed = require("../seed/pmo-seed.json");
const { kvGet, kvSet } = require("../lib/kv.js");
const { applyCors } = require("../lib/cors.js");

module.exports = async function handler(req, res) {
  applyCors(req, res, "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use POST" });

  const secret = process.env.SYNC_SHARED_SECRET;
  if (!secret) {
    return res.status(503).json({ ok: false, error: "SYNC_SHARED_SECRET sozlanmagan" });
  }
  if (req.headers["x-sync-secret"] !== secret) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const force = req.body?.force === true;

  try {
    const existing = await kvGet("TB_DATA");
    if (existing && !force) {
      return res.status(409).json({ ok: false, error: "KV allaqachon to'ldirilgan. Qayta yozish uchun {force:true} yuboring." });
    }

    await Promise.all([
      kvSet("TB_DATA", seed.TB_DATA),
      kvSet("TB_JIRA_ISSUES", seed.TB_JIRA_ISSUES),
      kvSet("DEVOPS_ISSUES", seed.DEVOPS_ISSUES),
    ]);

    return res.status(200).json({ ok: true, seeded: true });
  } catch (err) {
    console.error("pmo-seed error:", err);
    return res.status(500).json({ ok: false, error: "Ichki xatolik" });
  }
};
