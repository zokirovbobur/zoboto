# eventador — UI Prototype

Brauzerda to'g'ri ochiladigan, npm kerak bo'lmagan React prototip.

## Ishga tushirish

```bash
# Oddiy fayl serveri (masalan Python bilan):
cd eventador-proto
python3 -m http.server 3000
# Keyin: http://localhost:3000
```

> ⚠️ `file://` protokoli orqali to'g'ri ochilmaydi (module import cheklovlari tufayli).
> Har doim HTTP server orqali oching.

---

## Fayl strukturasi

```
eventador-proto/
├── index.html              ← Entry point. HTML + CDN script teglari
├── css/
│   └── style.css           ← Design system (CSS variables, layout, primitives)
├── js/
│   ├── lib/
│   │   ├── nodeSchema.js   ← Flow node type definitions
│   │   ├── functionForm.js ← Function form validation & builder
│   │   └── protoParser.js  ← .proto text parser
│   ├── components/
│   │   ├── ui.js           ← Primitive UI: Badge, Btn, Card, KV, Metric...
│   │   ├── modals.js       ← Drawer, Confirm, CommandPalette, Designer canvas...
│   │   └── layout.js       ← Sidebar + Topbar + Layout shell
│   ├── screens/
│   │   ├── core.js         ← Dashboard, Designer, Functions, Users, Org...
│   │   ├── more.js         ← Flows, Deployments, Monitoring, Endpoints...
│   │   └── middleware.js   ← *** Middleware Proto Registry (YANGI SAHIFA) ***
│   ├── store.js            ← AppContext, mock DB, barcha state mutations
│   └── app.js              ← React Router routes + bootstrap
```

---

## Sahifalar va route-lar

| Route                  | Component          | Fayl               |
|------------------------|--------------------|--------------------|
| `/dashboard`           | `Dashboard`        | screens/core.js    |
| `/flows`               | `Flows`            | screens/more.js    |
| `/designer`            | `Designer`         | screens/core.js    |
| `/functions`           | `Functions`        | screens/core.js    |
| `/scheduler`           | `Scheduler`        | screens/more.js    |
| `/deployments`         | `Deployments`      | screens/more.js    |
| `/monitoring`          | `Monitoring`       | screens/more.js    |
| `/visualizer`          | `Visualizer`       | screens/more.js    |
| `/dlq`                 | `Dlq`              | screens/more.js    |
| `/org`                 | `Org`              | screens/core.js    |
| `/workspaces`          | `Workspaces`       | screens/core.js    |
| `/users`               | `Users`            | screens/core.js    |
| `/roles`               | `Roles`            | screens/core.js    |
| `/endpoints`           | `Endpoints`        | screens/more.js    |
| `/apikeys`             | `ApiKeys`          | screens/more.js    |
| `/routegroups`         | `RouteGroups`      | screens/more.js    |
| `/audit`               | `Audit`            | screens/more.js    |
| `/protos`              | `Protos`           | screens/more.js    |
| `/middleware-protos`   | `MiddlewareProtos` | screens/middleware.js ← **YANGI** |
| `/settings`            | `Settings`         | screens/more.js    |

---

## Middleware Proto Registry (yangi sahifa)

`/middleware-protos` → `MiddlewareProtos` komponenti (`js/screens/middleware.js`)

3 ta tab mavjud:

1. **Proto Registry** — yuklangan proto fayllar jadvali, har biri bosilganda detail drawer ochiladi
2. **Service Map** — barcha proto-lardan service-larni ko'rsatadi (gRPC service discovery)
3. **Endpoint Builder** — Proto → Service → Method tanlash orqali HTTP→gRPC endpoint yaratish UI

### Kengaytirish uchun qo'shimcha tasklar (dasturchilar uchun):

- [ ] Proto upload: real `.proto` fayl parse qilish va saqlash
- [ ] OCI push: Docker registry ga proto image push qilish
- [ ] Flow linking: `Flows` sahifasidagi gRPC trigger bilan ikki tomonga bog'lash
- [ ] Endpoint save: yaratilgan endpointlarni `/endpoints` sahifasiga qo'shish
- [ ] Versioning: bir proto-ning bir nechta versiyalarini boshqarish

---

## Mock ma'lumotlar

Barcha ma'lumotlar `js/store.js` ichidagi `MOCK_DB` ob'ektida.
Proto-lar: `db.protos[]` array.
Har bir proto `{ id, Name, Version, Ref, services: [{ name, methods: [] }] }` shaklida.

---

## Dizayn tizimi (CSS variables)

```css
--bg, --panel, --panel2, --panel3   /* fon qatlamlari */
--border, --border2                 /* chegara ranglari */
--text, --muted, --faint            /* matn qatlamlari */
--accent, --accent2                 /* yashil va ko'k aksentlar */
--ok, --warn, --danger, --info      /* holat ranglari */
--r, --r-sm                         /* border-radius */
--mono, --sans                      /* shriftlar */
```

Light mode: `<html data-theme="light">` qo'shing.
