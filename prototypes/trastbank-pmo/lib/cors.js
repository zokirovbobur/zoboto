// ===================================================================
// lib/cors.js — origin-allowlisted CORS headers for the api/ functions.
//
// ALLOWED_ORIGINS env var: comma-separated list of origins allowed to
// call the API from a browser. Access-Control-Allow-Origin is echoed
// back only when the request's Origin header is in the list — never "*".
// ===================================================================

const DEFAULT_ALLOWED_ORIGINS =
  "https://pmo-board.vercel.app,https://pmo-board-test.vercel.app,https://zoboto.uz,https://www.zoboto.uz,https://test.zoboto.uz";

function allowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS)
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Sets CORS headers on the response. `methods` is the value for
 * Access-Control-Allow-Methods (e.g. "POST, OPTIONS").
 */
function applyCors(req, res, methods, headers = "Content-Type, x-sync-secret") {
  const origin = req.headers.origin;
  if (origin && allowedOrigins().includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", headers);
}

module.exports = { applyCors };
