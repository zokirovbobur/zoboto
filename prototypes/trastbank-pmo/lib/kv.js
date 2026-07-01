// ===================================================================
// lib/kv.js — thin client for the Upstash Redis REST API.
//
// Attach an Upstash Redis store to the Vercel project (Storage tab).
// Depending on how it was provisioned, Vercel injects either the
// legacy Vercel-KV names (KV_REST_API_URL/TOKEN) or Upstash's own
// names (UPSTASH_REDIS_REST_URL/TOKEN) — this checks both.
// ===================================================================

function kvEnv() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Missing KV_REST_API_URL/TOKEN (or UPSTASH_REDIS_REST_URL/TOKEN) — attach an Upstash Redis store to the Vercel project"
    );
  }
  return { url, token };
}

async function kvGet(key) {
  const { url, token } = kvEnv();
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`KV GET ${key} failed: ${res.status} ${await res.text()}`);
  const { result } = await res.json();
  return result == null ? null : JSON.parse(result);
}

async function kvSet(key, value) {
  const { url, token } = kvEnv();
  const res = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "text/plain" },
    body: JSON.stringify(value),
  });
  if (!res.ok) throw new Error(`KV SET ${key} failed: ${res.status} ${await res.text()}`);
  return true;
}

module.exports = { kvGet, kvSet };
