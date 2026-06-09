# Zoboto — Changelog

All notable changes to the **zoboto** personal website and prototype library are documented here.  
Format: `[YYYY-MM-DD] — summary` grouped by date, newest first.

---

## [2026-06-09] — Comparison Table i18n

### Banking-Infra — AS-IS vs TO-BE Comparison Table
- Fixed: comparison table rows were hardcoded in English and did not change with language
- `COMPARISON_ROWS` converted to multilingual object with `uz` / `ru` / `en` keys
- `renderComparisonRows()` updated to use `COMPARISON_ROWS[L]` — table now updates on every language switch
- Fix applied to both `index.html` (TO-BE) and `joriy-infrastruktura.html` (AS-IS)

---

## [2026-06-09] — Smart BI Prototype

### Smart BI Prototype — Added
- Added `prototypes/ai-bi-navigator/` — AI-native BI platform prototype (Smart BI) for Uzbekistan banking
- Includes: executive dashboard (9 KPIs + sparklines), GenBI conversational analyst, factor analysis, dashboard library, widget builder, connectors wizard, admin & audit, 14 screens total
- Role-based access: CEO, Analyst, Department Head, Data Admin
- Dark/light theme, UZ/RU/EN language switch, mobile preview frame

### Prototypes List (`main.js`)
- Added **Smart BI** card to the Prototypes section on the main site (Internal / Demo)

### Banking-Infra — DWH & BI Panel
- Added **Smart BI** tab (3rd option) to DWH & BI vendor comparison alongside ClickHouse and Snowflake + PBI
- Tab content includes UZ/RU/EN definitions, key capabilities list, and a **"Demo ko'rish"** button linking to the Smart BI prototype

### Infrastructure
- Fixed `launch.json` static server path: changed from `UsersuserProjectszoboto` to `.` (project root)

---

## [2026-06-09]

### Eventador Middleware Prototype — Added
- Added `prototypes/eventador/` — full React-based enterprise middleware platform demo (Eventador)
- Includes: visual flow designer, gRPC proto registry, API gateway, deployment pipeline, monitoring, DLQ replay

### Eventador — Bug Fixes
- Fixed black screen on load: extracted JS mock data from `style.css` into `js/mock-data.js`
- Fixed Babel scope isolation: combined all 12 JS modules into a single inline `<script>` block so globals are shared correctly

### Banking-Infra — Middleware Inhouse Tab
- Added **Inhouse** tab to Middleware vendor comparison panel (alongside Rendezvous, Velmie, Kinective)
- Inhouse tab includes UZ/RU/EN definitions, pros/cons, and a **"Demo ochish →"** button linking to Eventador prototype

### Prototypes List (`main.js`)
- Added **Eventador — Middleware Platform** card to the Prototypes section on the main site

---

## [2026-06-08]

### Banking-Infra — UI & Content
- Removed PCI DSS row from AS-IS vs TO-BE comparison table
- Replaced native `<select>` with custom styled language dropdown in both pages
- Fixed missing i18n across all blocks in `joriy-infrastruktura.html`
- Added i18n localization for New Platform widget in both pages
- Brought Middleware callout to foreground (`z-index: 20`)
- Fixed callout repositioning and close-on-outside-click behavior
- Fixed `?` info button on Middleware node (now injected via `buildNodes` JS)
- Fixed responsive scaling and added `?` info buttons for all callouts
- Removed footer from all banking-infra pages
- Improved executive UI layout and visual polish

### Banking-Infra — Interactive Features
- Added interactive **New Platform** widget to `index.html` (TO-BE view)
- Added interactive **New Platform** widget to AS-IS banking infra page

---

## [2026-06-05]

### Main Site — Visual & i18n
- Updated headshot photos (dark and light theme variants)
- Added light-theme headshot; swap photo on theme toggle
- Added language switcher to gate screen with full i18n support
- Show name in Cyrillic (Бобур Зокиров) when Russian language is selected
- Responsive LIMIT for portfolio/protos: 1 row on desktop, 1 card on mobile
- Added Open DSP link to Geomotive DSP portfolio card

---

## [2026-06-04]

### Main Site — Structure & UX
- Added full-screen gate entry page (About Me / Protos split)
- Added EN/RU/UZ i18n with lang switcher in nav
- Replaced lang buttons with `<select>` dropdown in nav and banking-infra
- Added expand/collapse to Expertise, Portfolio, Prototypes, and Resume sections
- Collapsed About, Portfolio (1 visible), Prototypes (1 visible, full on direct nav)
- Added `/about` redirect to `/#top`; skip gate for all hashes
- Updated contact info; integrated EmailJS for contact form
- Added portfolio images; linked CJM for Paynet; removed all prototypeUrl links
- Removed duplicate "View Details" button from proto cards
- Removed "Coming Soon" protos; restored Islamic Banking Mobile Concept as Coming Soon

### Prototypes List
- Added **Enterprise Banking IT Infrastructure** prototype
- Added **Islamic Banking Web App**, **Banking Bonus Management**, **Banking Loan Management System**
- Added **Finport** (external link)
- Renamed prototype: Islamic Banking → Enterprise Banking IT Infrastructure
- Renamed proto: Enterprise Banking Web App → Islamic Banking Web App
- Fixed all banking-infra HTML page titles

### Banking-Infra Prototype — Initial
- Added `prototypes/banking-infra/` with AS-IS / TO-BE architecture explorer
- Multilingual support (UZ/RU/EN)
- Added `docs/banking-infra-executive-summary.md`
- Added `README.md` for banking-infra prototype

### Infrastructure
- Set EmailJS credentials
- Linked résumé buttons to Google Drive
- Added `vercel.json`: redirect `/protos` → `/#prototypes`
- Added `assets/` folder with CSS, JS, images

---

> **Convention for future entries:**
> - Add a new `## [YYYY-MM-DD]` section at the top when making changes
> - Group by prototype or site area using `### Name`
> - Use action verbs: Added / Fixed / Changed / Removed / Improved
