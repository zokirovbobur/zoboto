// ===================================================================
// GET/POST /api/pmo-feedback
//
// Backs the floating feedback widget shown on every page. POST appends
// a new note (with the page it was left on) to a capped KV list; GET
// returns the list for the "Feedback texti ro'yhati" module.
// ===================================================================

const { kvGet, kvSet } = require("../lib/kv.js");

const FEEDBACK_MAX_ENTRIES = 200;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (req.method === "POST") {
      const text = (req.body?.text || "").trim();
      if (!text) return res.status(400).json({ ok: false, error: "text is required" });
      const list = (await kvGet("FEEDBACK_LIST")) || [];
      list.unshift({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        text: text.slice(0, 2000),
        page: req.body?.page || "",
        timestamp: new Date().toISOString(),
      });
      await kvSet("FEEDBACK_LIST", list.slice(0, FEEDBACK_MAX_ENTRIES));
      return res.status(200).json({ ok: true });
    }

    if (req.method === "GET") {
      const list = (await kvGet("FEEDBACK_LIST")) || [];
      return res.status(200).json({ ok: true, feedback: list });
    }

    return res.status(405).json({ ok: false, error: "Use GET or POST" });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};
