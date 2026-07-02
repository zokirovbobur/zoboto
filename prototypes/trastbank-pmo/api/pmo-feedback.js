// ===================================================================
// GET/POST /api/pmo-feedback
//
// Backs the floating feedback widget shown on every page. POST appends
// a new note (with the page it was left on) to a capped KV list; GET
// returns the list for the "Feedback texti ro'yhati" module.
// ===================================================================

const { kvGet, kvSet, kvIncr, kvExpire } = require("../lib/kv.js");
const { applyCors } = require("../lib/cors.js");

const FEEDBACK_MAX_ENTRIES = 200;
const RATE_LIMIT_PER_HOUR = 10;
const RATE_WINDOW_SECONDS = 3600;

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return String(fwd).split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

/** Returns true when this IP is over the hourly POST budget. */
async function isRateLimited(ip) {
  const key = `FB_RATE:${ip}`;
  const count = await kvIncr(key);
  if (count === 1) await kvExpire(key, RATE_WINDOW_SECONDS);
  return count > RATE_LIMIT_PER_HOUR;
}

module.exports = async function handler(req, res) {
  applyCors(req, res, "GET, POST, OPTIONS", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (req.method === "POST") {
      if (await isRateLimited(clientIp(req))) {
        return res.status(429).json({ ok: false, error: "Juda ko'p so'rov — bir soatdan keyin urinib ko'ring" });
      }
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
    console.error("pmo-feedback error:", err);
    return res.status(500).json({ ok: false, error: "Ichki xatolik" });
  }
};
