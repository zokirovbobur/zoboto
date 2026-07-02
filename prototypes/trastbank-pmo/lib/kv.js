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

// KV_PREFIX (default "") is prepended to every key by these helpers, so a
// test deployment can point at the same Upstash database with e.g.
// KV_PREFIX="TEST:" without touching production data.
function prefixed(key) {
  return (process.env.KV_PREFIX || "") + key;
}

async function kvGet(key) {
  key = prefixed(key);
  const { url, token } = kvEnv();
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`KV GET ${key} failed: ${res.status} ${await res.text()}`);
  const { result } = await res.json();
  return result == null ? null : JSON.parse(result);
}

async function kvSet(key, value) {
  key = prefixed(key);
  const { url, token } = kvEnv();
  const res = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "text/plain" },
    body: JSON.stringify(value),
  });
  if (!res.ok) throw new Error(`KV SET ${key} failed: ${res.status} ${await res.text()}`);
  return true;
}

/**
 * SET NX EX — atomically takes `key` only if it doesn't exist, with a TTL
 * (seconds). Returns true if the key was taken, false if it already existed.
 * Used as a poor-man's distributed lock (e.g. SYNC_LOCK).
 */
async function kvSetNX(key, value, ttlSeconds) {
  key = prefixed(key);
  const { url, token } = kvEnv();
  // Upstash REST maps a Redis command to path segments: `SET key value NX EX ttl`
  // becomes /set/{key}/{value}/NX/EX/{ttl}. Passing the options as a query
  // string (?nx=true&ex=..) instead makes Upstash forward them as bogus
  // command args ("SET key value nx true ex ..") → Redis "ERR syntax error".
  const path = `${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(String(value))}/NX/EX/${ttlSeconds}`;
  const res = await fetch(path, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`KV SETNX ${key} failed: ${res.status} ${await res.text()}`);
  const { result } = await res.json();
  return result === "OK"; // null when the key already existed (NX prevented the set)
}

async function kvDel(key) {
  key = prefixed(key);
  const { url, token } = kvEnv();
  const res = await fetch(`${url}/del/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`KV DEL ${key} failed: ${res.status} ${await res.text()}`);
  return true;
}

/** INCR — returns the counter's new integer value. */
async function kvIncr(key) {
  key = prefixed(key);
  const { url, token } = kvEnv();
  const res = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`KV INCR ${key} failed: ${res.status} ${await res.text()}`);
  const { result } = await res.json();
  return result;
}

/** EXPIRE — sets a TTL (seconds) on an existing key. */
async function kvExpire(key, seconds) {
  key = prefixed(key);
  const { url, token } = kvEnv();
  const res = await fetch(`${url}/expire/${encodeURIComponent(key)}/${seconds}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`KV EXPIRE ${key} failed: ${res.status} ${await res.text()}`);
  return true;
}

module.exports = { kvGet, kvSet, kvSetNX, kvDel, kvIncr, kvExpire };
