# PMO Board

Trastbank PMO Board — build step'siz vanilla React + Babel Standalone,
Vercel Hobby (serverless functions) + Upstash KV ustida ishlaydi.
Frontend `index.html` boot paytida JSX fayllarni fetch qilib, Babel bilan
transform qiladi; data `/api/pmo-data` orqali KV'dan keladi.

## Environment variables (Vercel Project Settings → Environment Variables)

| Var | Majburiy | Tavsif |
|-----|----------|--------|
| `JIRA_BASE_URL` | ha (sync uchun) | masalan `https://test-tb.atlassian.net` |
| `JIRA_EMAIL` | ha (sync uchun) | Jira API token egasining emaili |
| `JIRA_API_TOKEN` | ha (sync uchun) | https://id.atlassian.com/manage-profile/security/api-tokens |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | ha | Upstash Redis store ulanganda Vercel o'zi qo'yadi (`UPSTASH_REDIS_REST_URL/TOKEN` nomlari ham qo'llab-quvvatlanadi) |
| `SYNC_SHARED_SECRET` | faqat `/api/pmo-seed` uchun | `/api/pmo-seed` (KV'ni birlamchi to'ldirish) hali `x-sync-secret` header shu qiymatga teng bo'lishini talab qiladi. **`/api/pmo-sync` endi secret talab qilmaydi** — "Jiradan yangilash" tugmasi idempotent qayta-sync'ni ishga tushiradi, barcha haqiqiy sirlar (`JIRA_API_TOKEN` va h.k.) faqat server tomonida qoladi, brauzerga hech qachon chiqmaydi. Suiiste'mol `SYNC_LOCK` (bir vaqtda bitta run) va CORS allowlist bilan cheklanadi. |
| `ALLOWED_ORIGINS` | yo'q | CORS uchun ruxsat etilgan originlar (vergul bilan). Default: `https://pmo-board.vercel.app,https://pmo-board-test.vercel.app,https://zoboto.uz`. Faqat ro'yxatdagi Origin'ga `Access-Control-Allow-Origin` qaytariladi — `*` ishlatilmaydi. |
| `KV_PREFIX` | yo'q | Har bir KV kaliti oldiga qo'shiladigan prefix (default: bo'sh). Test deployment'da `KV_PREFIX="TEST:"` qo'yilsa, bir xil Upstash bazasida production data'ga tegmasdan ishlaydi. |

## Sync lock

`/api/pmo-sync` parallel ishga tushirishdan himoyalangan: run boshida KV'da
`SYNC_LOCK` kaliti `SET NX EX 120` bilan olinadi. Lock band bo'lsa endpoint
**409** ("Sync allaqachon ketmoqda") qaytaradi. Run tugagach (xato bo'lsa ham)
lock o'chiriladi; run o'lib qolsa TTL (120 s) o'zi tozalaydi.

KV'ga yozish ketma-ket bajariladi va `TB_DATA` eng oxirida yoziladi — o'rtada
yozish uzilib qolsa asosiy obyekt eski, izchil holatida qoladi.

## Rate limit

`POST /api/pmo-feedback` har bir IP uchun soatiga 10 ta so'rov bilan
cheklangan (KV'da `FB_RATE:{ip}` counter, INCR + 1 soatlik EXPIRE).
Limitdan oshsa **429** qaytadi.

## Test

```
npm test   # node --test, test/sync-core.test.js
```
