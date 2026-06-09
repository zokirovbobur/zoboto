# Banking-Infra Prototype — Changelog

Interactive AS-IS / TO-BE banking IT architecture explorer with multilingual support.  
Path: `prototypes/banking-infra/`

---

## [2026-06-09] — Smart BI Tab

### DWH & BI Panel — Smart BI Tab
- Added **Smart BI** tab (3rd option) to DWH & BI vendor comparison alongside ClickHouse and Snowflake + PBI
- Added `renderDwhAiPanel()` function with full UZ/RU/EN content:
  - When to use, description, and 8 key capabilities per language
  - AI-NATIVE BI badge in purple (`#7C3AED`)
- Added **"Demo ko'rish / Открыть демо / Open Demo"** button linking to `../../prototypes/ai-bi-navigator/index.html`
- Updated `switchDwhTab()` to dispatch `ai_bi` key to `renderDwhAiPanel()` instead of generic `renderDwhPanel()`

---

## [2026-06-09]

### Middleware Panel — Inhouse Tab
- Added **Inhouse** tab (4th option) to Middleware vendor comparison alongside Rendezvous, Velmie, Kinective
- Added `MW_OPTIONS.inhouse` data entry with full UZ/RU/EN content:
  - When to choose, vendor info, 7 features, pros/cons per language
  - Status: `evaluate`
- Added `demoUrl` field to `MW_OPTIONS` — `renderMwPanel()` now renders a **"Demo ochish →"** button when `demoUrl` is set
- Demo button links to `../eventador/index.html` (Eventador middleware platform prototype)
- Button styled in purple (`#A78BFA`) matching the Inhouse tab color

---

## [2026-06-08]

### Content
- Removed PCI DSS row from AS-IS vs TO-BE comparison table
- Added i18n localization for New Platform widget (UZ/RU/EN) in both `index.html` and `joriy-infrastruktura.html`
- Fixed missing i18n translations across all blocks in `joriy-infrastruktura.html`

### UI & Interactions
- Replaced native `<select>` with custom styled language dropdown in both pages
- Brought Middleware info callout to foreground (`z-index: 20`)
- Fixed callout repositioning and close-on-outside-click behavior
- Fixed `?` info button on Middleware node — now injected via `buildNodes()` JS function
- Fixed responsive scaling for architecture diagram
- Added `?` info buttons for all node callouts
- Removed footer from all banking-infra pages
- Improved executive UI layout: spacing, typography, card polish

### Features
- Added interactive **New Platform** widget to `index.html` (TO-BE view) — top-left corner
- Fixed widget positioning: shifted internal nodes up to avoid overlap
- Added interactive **New Platform** widget to AS-IS page (`joriy-infrastruktura.html`)
- Reverted and re-added animated "Yangi platforma" button (final stable version)

---

## [2026-06-04]

### Initial Release
- Created `prototypes/banking-infra/index.html` — TO-BE architecture explorer
- Created `joriy-infrastruktura.html` — AS-IS architecture view
- Created `islamic-bank-dbo.html` — Corporate internet banking web app
- Created `kredit-konveyer.html` — Loan conveyor / credit pipeline
- Created `bonus-proto.html` — Front office bonus calculation app
- Created `orchestration.html` — Orchestration flow view
- Multilingual support: UZ / RU / EN via lang switcher
- Replaced lang buttons with styled `<select>` dropdown
- Fixed JS `document.title` overrides in all pages
- Added `README.md` and `docs/banking-infra-executive-summary.md`
