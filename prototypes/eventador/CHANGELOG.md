# Eventador Prototype — Changelog

Enterprise middleware platform demo — event-driven flow designer, gRPC proto registry,
API gateway, deployment pipeline and monitoring.  
Path: `prototypes/eventador/`

Based on the **eventador-proto** open-source single-file prototype.

---

## [2026-06-09]

### Bug Fix — Black Screen on Load
- **Root cause:** `style.css` contained embedded JavaScript (`__DB_SEED__`, `loadDb`, React globals, CodeMirror stub) inside a `<script>` block. When loaded as a stylesheet via `<link rel="stylesheet">`, the JS was silently ignored — the app crashed before mounting.
- **Fix 1:** Extracted JS from `style.css` into `js/mock-data.js`; truncated `style.css` to CSS only (838 lines)
- **Fix 2:** Combined all 12 JS modules into a single inline `<script type="text/babel" data-presets="react">` block in `index.html` — Babel standalone loads external `src=` files in isolated function scopes so `const`/`let` don't share between files; inlining restores the original single-scope design
- Removed `data-type="module"` from all script tags (no `import`/`export` used)
- Added `#boot` loading indicator to `index.html`

### Added to Zoboto
- Copied from `Downloads/eventador-proto_1.zip` into `prototypes/eventador/`
- Added **Eventador — Middleware Platform** card to `assets/js/main.js` PROTOTYPES list

### Mock Data — Middleware Proto
- Added `middleware@v1` proto to `__DB_SEED__.protos` in `js/mock-data.js`
- Services: `middleware.Auth` (ValidateToken, RefreshToken, RevokeToken), `middleware.RateLimit` (Check, Reset), `middleware.Enricher` (Enrich, Watch)
- Workspace: `payments`
- OCI ref: `oci://registry/proto/middleware@v1`

---

## File Structure

```
prototypes/eventador/
├── index.html               ← single-file app (all JS inlined)
├── CHANGELOG.md
├── README.md
├── css/
│   └── style.css            ← design system CSS only (no JS)
└── js/
    ├── mock-data.js         ← React globals + __DB_SEED__ + loadDb + CodeMirror stub
    ├── app.js               ← router + bootstrap
    ├── store.js             ← global state + mock API mutations
    ├── lib/
    │   ├── nodeSchema.js    ← per-node field schemas + validation
    │   ├── functionForm.js  ← function drawer form helpers
    │   └── protoParser.js   ← mock .proto text parser
    ├── components/
    │   ├── ui.js            ← UI primitives (Badge, Btn, Card, etc.)
    │   ├── modals.js        ← Drawer, Confirm, Toasts, DesignerCanvas
    │   └── layout.js        ← Sidebar, Topbar, Layout shell
    └── screens/
        ├── core.js          ← Login, Dashboard, Designer, Functions, etc.
        ├── more.js          ← Flows, Protos, Endpoints, Org, Users, etc.
        └── middleware.js    ← Middleware Proto Registry screen
```

> **Note:** `index.html` bundles all JS files above as a single inline script at build time.  
> Edit the source files in `js/`, then re-run the combine script to update `index.html`.
