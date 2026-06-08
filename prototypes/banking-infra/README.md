# Banking IT Infrastructure Prototype

This folder contains an interactive prototype for explaining a bank infrastructure transformation from AS-IS legacy architecture to TO-BE middleware-centered architecture.

## Files

| File | Description |
|---|---|
| `index.html` | TO-BE architecture explorer. Shows Middleware as the central platform for integration, orchestration, monitoring, queueing, DR, API reuse, and channel connectivity. |
| `joriy-infrastruktura.html` | AS-IS architecture explorer. Shows ABS-centric legacy architecture, limited ESB wrapper usage, direct integrations, and vendor dependency. |

## Core storyline

### AS-IS

The current architecture is ABS-centric. Channels and external systems are connected through a mix of NGINX, ESB, direct SDKs, custom adapters, and ABS module-level integrations. The ESB in this context is not a full middleware layer; it mostly works as an ABS API wrapper or API collection.

Main risks:

- many point-to-point integrations;
- new platform launch requires several separate integration points;
- ABS vendor dependency for new methods;
- slow time-to-market;
- difficult impact analysis because modules are tightly coupled;
- monitoring and troubleshooting are fragmented;
- compliance and reporting processes may be batch/manual instead of real-time.

### TO-BE

The target architecture introduces Middleware as the central platform. Channels and external/internal systems connect through controlled integration points. Business logic can be orchestrated in Middleware rather than being tightly embedded in ABS modules.

Expected benefits:

- one main integration point for new platforms;
- stronger API reuse;
- reduced ABS vendor dependency;
- faster product launch cycle;
- central monitoring and tracing;
- clearer PCI DSS scope;
- better DR/failover and environment management;
- cleaner separation between channels, integration, core banking, and external systems.

## AS-IS vs TO-BE comparison

| Area | AS-IS | TO-BE |
|---|---|---|
| Integration model | Point-to-point, ABS/ESB/direct SDK mix | Centralized through Middleware |
| ESB/Middleware role | ESB mainly wraps ABS APIs | Middleware orchestrates APIs, queues, monitoring, DR, and reuse |
| New platform launch | Multiple integrations and vendor coordination | One primary integration to Middleware |
| Vendor dependency | High, especially for new ABS methods | Lower; bank specialists can create/reuse methods in Middleware |
| Time-to-market | Slower, often dependent on vendor timeline | Faster due to reusable APIs and integration hub |
| Monitoring | Fragmented by system/vendor | Centralized APM/tracing through Middleware |
| PCI DSS scope | Can become unclear or spread across components | More controllable through gateway and Middleware boundaries |
| Operational risk | High coupling and change impact | Lower coupling and clearer integration governance |

## Demo scenario: adding a new platform

The prototype includes a “Yangi platforma” scenario.

In AS-IS, adding a platform may require connections to channels, ESB, ABS, external payment systems, regulator/reporting systems, and separate adapters. If a required ABS method does not exist, the bank may need to wait for the ABS vendor, which can create a delay of 2–6 months.

In TO-BE, the platform connects to Middleware once. Middleware already has integrations with core systems, external systems, compliance components, and channels. If a new method is required, it can be created or orchestrated inside Middleware using existing APIs, reducing vendor dependency.

## Vendor naming policy

Vendor names in the prototype are examples/options for analysis and conversation. They are not final selected vendors unless confirmed in a separate vendor selection decision document.

Recommended label in presentations: “example vendor options”.

## Recommended next improvements

1. Add a visible Executive Summary panel to both AS-IS and TO-BE pages.
2. Add an on-page AS-IS vs TO-BE comparison table or modal.
3. Add a clear callout: “ESB is not Middleware”.
4. Replace ambiguous vendor subtitles with “example options”.
5. Refactor large HTML files into separate `styles.css`, `data.js`, `i18n.js`, and `diagram.js` files after the prototype messaging is stable.
