// ===================================================================
// GET /api/pmo-sync-log
//
// Returns the history of past "Jiradan yangilash" runs (most recent
// first) so the board can show a Sync Log page instead of the result
// only being visible in the button's dropdown right after clicking it.
// ===================================================================

const { kvGet } = require("../lib/kv.js");
const { applyCors } = require("../lib/cors.js");

module.exports = async function handler(req, res) {
  applyCors(req, res, "GET, OPTIONS");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Use GET" });

  try {
    const log = (await kvGet("SYNC_LOG")) || [];
    return res.status(200).json({ ok: true, log });
  } catch (err) {
    console.error("pmo-sync-log error:", err);
    return res.status(500).json({ ok: false, error: "Ichki xatolik" });
  }
};
