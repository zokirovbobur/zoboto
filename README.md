# Zoboto

Personal portfolio and prototype repository for Bobur Zokirov.

## Main prototype: Banking IT Infrastructure

This repository contains an interactive banking infrastructure prototype that explains the transition from a legacy AS-IS architecture to a target TO-BE middleware-centered architecture.

### Prototype pages

| Page | File | Purpose |
|---|---|---|
| TO-BE Architecture Explorer | `prototypes/banking-infra/index.html` | Target architecture with Middleware as the central integration, orchestration, security, monitoring, and API reuse layer. |
| AS-IS IT Infrastructure | `prototypes/banking-infra/joriy-infrastruktura.html` | Current/legacy architecture showing ABS-centric integration, ESB-as-wrapper limitations, vendor dependency, and point-to-point complexity. |

## Problem statement

In a legacy banking setup, new channels and platforms often require separate integrations with ABS modules, ESB wrappers, external switches, compliance systems, and vendor-specific APIs. This creates high delivery risk, longer time-to-market, weak API reuse, and dependency on ABS vendors for new methods.

## Target architecture thesis

The TO-BE architecture introduces a real Middleware layer as the central control point for:

- API orchestration and process routing;
- message queue and asynchronous processing;
- monitoring, APM, tracing, and operational visibility;
- DR/failover and environment management;
- API reuse across mobile, web, ATM/POS, corporate API, and chatbot channels;
- reduced direct dependency on ABS vendors for new product/platform launches.

## Key distinction: ESB vs Middleware

In the AS-IS model, ESB is treated mainly as an ABS API wrapper or API collection. It does not provide the full capabilities of a modern middleware layer.

In the TO-BE model, Middleware is a broader platform responsible for integration governance, orchestration, queueing, monitoring, DR, API lifecycle, and reuse.

## Vendor naming note

Vendor names shown in the prototype, such as Rendezvous, Velmie, Kinective, iABS, NCI, B2, Bitrix24, and others, are used as possible options or market examples. They should not be interpreted as a final vendor decision unless a separate selection document confirms it.

## Recommended audience

- Bank top management;
- IT architecture and infrastructure teams;
- Product and PMO teams;
- Digital banking transformation teams;
- Vendor selection committees.

## Related documentation

- `prototypes/banking-infra/README.md` — detailed explanation of the banking infra prototype.
- `docs/banking-infra-executive-summary.md` — executive summary and AS-IS vs TO-BE comparison.
