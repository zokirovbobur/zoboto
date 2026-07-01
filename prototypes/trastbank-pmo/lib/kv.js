// ===================================================================
// lib/kv.js — thin client for Vercel KV (Upstash Redis REST API).
//
// Attach a "KV" (Upstash Redis) store to the Vercel project in the
// dashboard (Storage tab) — Vercel then auto-injects KV_REST_API_URL
// and KV_REST_API_TOKEN as env vars, no extra config needed here.
// ===================================================================

function kvEnv() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("Missing KV_REST_API_URL / KV_REST_API_TOKEN (attach a KV store to the Vercel project)");
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
