
/* ---- React / Router globals (provided by the vendored UMD bundles above) ---- */
const { createContext, forwardRef, lazy, Suspense, useCallback, useContext,
        useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef,
        useState } = React;
const { createPortal } = ReactDOM;
const { Routes, Route, Navigate, useLocation, useNavigate, useParams,
        NavLink, Link, Outlet } = ReactRouterDOM;
/* file:// can't use the History API → route on the URL hash */
const BrowserRouter = ReactRouterDOM.HashRouter;

/* ---- inlined mock DB (was public/mock/db.json, fetched at ~320ms).
        Edit __DB_SEED__ to change the demo data. ---- */
const __DB_SEED__ = {
  "orgs": [
    { "id": "acme", "name": "Acme Corp", "initial": "A", "plan": "Enterprise", "slug": "acme",
      "owner": "ada@acme.io", "idp": "Okta", "domains": ["acme.io", "acme.dev"],
      "billingEmail": "billing@acme.io", "budget": 9000 },
    { "id": "globex", "name": "Globex Inc", "initial": "G", "plan": "Team", "slug": "globex",
      "owner": "hank@globex.com", "idp": "Azure AD", "domains": ["globex.com"],
      "billingEmail": "ap@globex.com", "budget": 2000 }
  ],
  "collectionTrees": {
    "payments": [
      { "p": "/checkout", "name": "checkout", "owner": "grace@acme.io", "desc": "Customer-facing checkout & payment flows.", "children": [
        { "p": "/checkout/web", "name": "web", "owner": "grace@acme.io", "desc": "Web storefront checkout." },
        { "p": "/checkout/mobile", "name": "mobile", "owner": "mei@acme.io", "desc": "Mobile app checkout." }
      ] },
      { "p": "/risk", "name": "risk", "owner": "ada@acme.io", "desc": "Fraud detection & risk scoring." },
      { "p": "/batch", "name": "batch", "owner": "lin@acme.io", "desc": "Scheduled reconciliation & batch jobs." }
    ],
    "core": [
      { "p": "/identity", "name": "identity", "owner": "grace@acme.io", "desc": "Authentication & identity services." },
      { "p": "/notifications", "name": "notifications", "owner": "lin@acme.io", "desc": "Outbound email, webhook & push notifications." }
    ],
    "data": [
      { "p": "/ingestion", "name": "ingestion", "owner": "ada@acme.io", "desc": "Streaming & batch data ingestion pipelines." },
      { "p": "/reporting", "name": "reporting", "owner": "ada@acme.io", "desc": "Scheduled analytical reports." }
    ],
    "internal": [{ "p": "/tooling", "name": "tooling", "owner": "hank@globex.com", "desc": "Internal automation & tooling." }],
    "partners": [{ "p": "/inbound", "name": "inbound", "owner": "dwayne@globex.com", "desc": "Partner inbound integrations." }]
  },
  "designerFlow": [
    { "id": "n1", "kind": "httptrigger", "title": "HTTP Trigger", "body": "GET ?pnfl=", "x": 70, "y": 230 },
    { "id": "n2", "kind": "httpreq", "title": "ABS get-customer", "body": "GET ${API_BASE_URL}/abs-proxy/customer", "x": 380, "y": 110 },
    { "id": "n3", "kind": "httpreq", "title": "i-Hamkor salary", "body": "POST ${API_BASE_URL}/integrations/salary", "x": 380, "y": 350 },
    { "id": "n4", "kind": "merge", "title": "Merge results", "body": "Deep merge", "x": 700, "y": 230 },
    { "id": "n5", "kind": "return", "title": "Return 200", "body": "{{merge1.output}}", "x": 1000, "y": 230 }
  ],
  "designerWires": [["n1", "n2"], ["n1", "n3"], ["n2", "n4"], ["n3", "n4"], ["n4", "n5"]],
  "flows": [
    { "id": "f1", "Workspace": "payments", "Collection": "/checkout/web", "Flow": "payments-api", "Trigger": "HTTP", "Method": "POST", "Path": "/checkout", "Adapter": "HTTP REST", "RouteGroup": "payments-public", "Nodes": "7 · 2 container", "Plan": "v42", "State": "live", "p95": "86ms", "env": [{ "k": "API_BASE_URL", "v": "https://api.acme.io/v2" }, { "k": "DB_HOST", "v": "payments-db.prod.acme.io" }, { "k": "MAX_RETRY", "v": "3" }], "secrets": [{ "Name": "STRIPE_API_KEY", "Prefix": "sk_live_8f3c…", "Status": "active", "Created": "2026-01-15", "Rotated": "2026-03-20", "Expiry": "365d" }, { "Name": "TWILIO_AUTH_TOKEN", "Prefix": "tw_4a17…", "Status": "active", "Created": "2025-12-01", "Rotated": "—", "Expiry": "never" }] },
    { "id": "f2", "Workspace": "payments", "Collection": "/checkout/mobile", "Flow": "mobile-checkout", "Trigger": "HTTP", "Method": "POST", "Path": "/checkout/mobile", "Adapter": "HTTP REST", "RouteGroup": "payments-public", "Nodes": "6 · 1 container", "Plan": "v12", "State": "live", "p95": "94ms", "env": [{ "k": "API_BASE_URL", "v": "https://api.acme.io/v2" }, { "k": "DB_HOST", "v": "payments-db.checkout.acme.io" }, { "k": "TIMEOUT_MS", "v": "5000" }], "secrets": [{ "Name": "STRIPE_API_KEY", "Prefix": "sk_live_8f3c…", "Status": "active", "Created": "2026-01-15", "Rotated": "2026-03-20", "Expiry": "365d" }] },
    { "id": "f3", "Workspace": "payments", "Collection": "/checkout", "Flow": "refund-processor", "Trigger": "HTTP", "Method": "POST", "Path": "/refunds", "Adapter": "HTTP REST", "RouteGroup": "payments-public", "Nodes": "5 inline", "Plan": "v7", "State": "live", "p95": "61ms", "env": [{ "k": "DB_HOST", "v": "payments-db.checkout.acme.io" }, { "k": "API_BASE_URL", "v": "https://api.acme.io/v2" }], "secrets": [{ "Name": "STRIPE_API_KEY", "Prefix": "sk_live_8f3c…", "Status": "active", "Created": "2026-01-15", "Rotated": "2026-03-20", "Expiry": "365d" }] },
    { "id": "f4", "Workspace": "payments", "Collection": "/risk", "Flow": "fraud-score", "Trigger": "Kafka", "Nodes": "5 · 1 container", "Plan": "v18", "State": "degraded", "p95": "240ms", "env": [{ "k": "DB_HOST", "v": "payments-db.prod.acme.io" }, { "k": "MODEL_VERSION", "v": "v3.2" }, { "k": "MAX_RETRY", "v": "3" }], "secrets": [{ "Name": "FRAUD_API_KEY", "Prefix": "fr_c2e0…", "Status": "active", "Created": "2026-02-20", "Rotated": "—", "Expiry": "180d" }] },
    { "id": "f5", "Workspace": "payments", "Collection": "/batch", "Flow": "nightly-recon", "Trigger": "Timer", "Nodes": "6 · 1 container", "Plan": "v3", "State": "scaled to 0", "p95": "—", "env": [{ "k": "API_BASE_URL", "v": "https://api.acme.io/v2" }, { "k": "DB_HOST", "v": "payments-db.prod.acme.io" }], "secrets": [] },
    { "id": "f6", "Workspace": "core", "Collection": "/identity", "Flow": "auth-service", "Trigger": "HTTP", "Method": "POST", "Path": "/auth/token", "Adapter": "HTTP REST", "RouteGroup": "core-api", "Nodes": "8 · 1 container", "Plan": "v31", "State": "live", "p95": "44ms", "env": [{ "k": "TOKEN_TTL_S", "v": "3600" }, { "k": "ISSUER", "v": "acme-auth" }], "secrets": [{ "Name": "JWT_SIGNING_KEY", "Prefix": "jwt_a4e1…", "Status": "active", "Created": "2025-11-02", "Rotated": "—", "Expiry": "365d" }] },
    { "id": "f7", "Workspace": "core", "Collection": "/notifications", "Flow": "webhook-fanout", "Trigger": "Webhook", "Method": "POST", "Path": "/hooks/inbound", "Adapter": "Webhook", "RouteGroup": "core-api", "Nodes": "4 inline", "Plan": "v9", "State": "degraded", "p95": "54ms", "env": [{ "k": "NOTIFICATION_TOPIC", "v": "core.notifications.v1" }], "secrets": [] },
    { "id": "f8", "Workspace": "core", "Collection": "/notifications", "Flow": "email-digest", "Trigger": "Timer", "Nodes": "5 · 1 container", "Plan": "v6", "State": "live", "p95": "120ms", "env": [{ "k": "SMTP_HOST", "v": "smtp.acme.io" }, { "k": "SMTP_PORT", "v": "587" }], "secrets": [{ "Name": "SENDGRID_KEY", "Prefix": "sg_7b9a…", "Status": "active", "Created": "2025-11-10", "Rotated": "2026-04-01", "Expiry": "365d" }] },
    { "id": "f9", "Workspace": "data", "Collection": "/ingestion", "Flow": "etl-pipeline", "Trigger": "Kafka", "Nodes": "9 · 3 container", "Plan": "v22", "State": "live", "p95": "310ms", "env": [{ "k": "KAFKA_BROKERS", "v": "kafka-1.acme.io:9092,kafka-2.acme.io:9092" }, { "k": "S3_BUCKET", "v": "acme-data-warehouse" }], "secrets": [{ "Name": "AWS_ACCESS_KEY", "Prefix": "AKIA_d4f1…", "Status": "active", "Created": "2025-10-22", "Rotated": "—", "Expiry": "never" }, { "Name": "S3_SECRET_KEY", "Prefix": "sk_e8b3…", "Status": "active", "Created": "2025-10-22", "Rotated": "—", "Expiry": "never" }] },
    { "id": "f10", "Workspace": "data", "Collection": "/reporting", "Flow": "daily-report", "Trigger": "Timer", "Nodes": "4 · 1 container", "Plan": "v5", "State": "scaled to 0", "p95": "—", "env": [{ "k": "S3_BUCKET", "v": "acme-data-warehouse" }, { "k": "REPORT_PREFIX", "v": "reports/daily/" }], "secrets": [{ "Name": "AWS_ACCESS_KEY", "Prefix": "AKIA_d4f1…", "Status": "active", "Created": "2025-10-22", "Rotated": "—", "Expiry": "never" }] },
    { "id": "f11", "Workspace": "internal", "Collection": "/tooling", "Flow": "asset-sync", "Trigger": "Timer", "Nodes": "3 inline", "Plan": "v2", "State": "live", "p95": "30ms", "env": [{ "k": "ASSET_BASE_URL", "v": "https://cdn.acme.io" }], "secrets": [] },
    { "id": "f12", "Workspace": "partners", "Collection": "/inbound", "Flow": "partner-inbound", "Trigger": "Webhook", "Method": "POST", "Path": "/inbound", "Adapter": "Webhook", "RouteGroup": "partner-webhooks", "Nodes": "5 · 1 container", "Plan": "v4", "State": "live", "p95": "78ms", "env": [{ "k": "PARTNER_API_URL", "v": "https://partners.acme.io/v1" }], "secrets": [{ "Name": "PARTNER_HMAC_KEY", "Prefix": "hmac_b2c8…", "Status": "active", "Created": "2026-02-01", "Rotated": "—", "Expiry": "never" }] }
  ],
  "functions": [
    { "id": "fn1", "Workspace": "payments", "Flow": "payments-api", "Function": "risk-score", "Image": "risk-score@sha256:9f3c…", "Runtime/FDK": "Docker · fdk-go", "Mem": "256M", "Memory": 256, "Timeout": "30s", "TimeoutSec": 30, "IdleTimeoutSec": 30, "Format": "http-stream", "Status": "warm", "Config": [{ "k": "MODEL", "v": "v3.2" }, { "k": "THRESHOLD", "v": "0.78" }], "secrets": [],
      "scaling": {
        "minReplicaCount": 1, "maxReplicaCount": 12,
        "cooldownPeriod": 120, "pollingInterval": 5,
        "triggers": [
          { "type": "prometheus", "name": "pending-invocations", "query": "sum(flow_pending_invocations{fn=\"payments-api/risk-score\"})", "threshold": "20" },
          { "type": "prometheus", "name": "concurrency-saturation", "query": "avg(runner_concurrency_used / runner_concurrency_max)", "threshold": "0.7" }
        ],
        "behavior": {
          "scaleUp":   { "stabilizationWindowSeconds": 0,   "percent": 200, "periodSeconds": 15 },
          "scaleDown": { "stabilizationWindowSeconds": 120, "percent": 25,  "periodSeconds": 60 }
        }
      } },
    { "id": "fn2", "Workspace": "payments", "Flow": "fraud-score", "Function": "fraud-model", "Image": "fraud-model@sha256:4a17…", "Runtime/FDK": "Firecracker · fdk-py", "Mem": "512M", "Memory": 512, "Timeout": "60s", "TimeoutSec": 60, "IdleTimeoutSec": 60, "Format": "http-stream", "Status": "scaling 1→8", "Config": [{ "k": "MAX_BATCH", "v": "32" }], "secrets": [],
      "scaling": {
        "minReplicaCount": 1, "maxReplicaCount": 20,
        "cooldownPeriod": 180, "pollingInterval": 5,
        "triggers": [
          { "type": "kafka", "name": "broker-lag", "topic": "fn.fraud-score.fraud-model", "lagThreshold": "100" }
        ],
        "behavior": {
          "scaleUp":   { "stabilizationWindowSeconds": 0,   "percent": 200, "periodSeconds": 15 },
          "scaleDown": { "stabilizationWindowSeconds": 180, "percent": 25,  "periodSeconds": 60 }
        }
      } },
    { "id": "fn3", "Workspace": "data", "Flow": "etl-pipeline", "Function": "pdf-render", "Image": "pdf-render@sha256:c2e0…", "Runtime/FDK": "Docker · fdk-node", "Mem": "1G", "Memory": 1024, "Timeout": "120s", "TimeoutSec": 120, "IdleTimeoutSec": 120, "Format": "http-stream", "Status": "scaled to 0", "Config": [], "secrets": [],
      "scaling": {
        "minReplicaCount": 0, "maxReplicaCount": 4,
        "cooldownPeriod": 300, "pollingInterval": 10,
        "triggers": [
          { "type": "prometheus", "name": "pending-invocations", "query": "sum(flow_pending_invocations{fn=\"etl-pipeline/pdf-render\"})", "threshold": "5" }
        ],
        "behavior": {
          "scaleUp":   { "stabilizationWindowSeconds": 0,   "percent": 100, "periodSeconds": 30 },
          "scaleDown": { "stabilizationWindowSeconds": 300, "percent": 50,  "periodSeconds": 60 }
        }
      } },
    { "id": "fn4", "Workspace": "core", "Flow": "webhook-fanout", "Function": "fanout-worker", "Image": "fanout-worker@sha256:7b9…", "Runtime/FDK": "Docker · fdk-node", "Mem": "256M", "Memory": 256, "Timeout": "30s", "TimeoutSec": 30, "IdleTimeoutSec": 30, "Format": "http-stream", "Status": "warm", "Config": [{ "k": "FANOUT_RPS", "v": "200" }], "secrets": [],
      "scaling": {
        "minReplicaCount": 2, "maxReplicaCount": 50,
        "cooldownPeriod": 90, "pollingInterval": 5,
        "triggers": [
          { "type": "prometheus", "name": "rps", "query": "rate(http_requests_total{flow=\"webhook-fanout\"}[1m])", "threshold": "200" },
          { "type": "cpu", "name": "cpu-utilization", "value": "70" }
        ],
        "behavior": {
          "scaleUp":   { "stabilizationWindowSeconds": 0,   "percent": 300, "periodSeconds": 15 },
          "scaleDown": { "stabilizationWindowSeconds": 90,  "percent": 25,  "periodSeconds": 60 }
        }
      } }
  ],
  "users": [
    { "id": "ada", "User": "Ada Lovelace", "Email": "ada@acme.io", "Status": "active", "Role": "Owner", "Scope": "Org", "MFA": "on", "SSO": "OIDC", "Last active": "2m ago", "title": "Principal Engineer" },
    { "id": "grace", "User": "Grace Hopper", "Email": "grace@acme.io", "Status": "active", "Role": "Admin", "Scope": "WS payments", "MFA": "on", "SSO": "SAML", "Last active": "1h ago", "title": "Eng Manager" },
    { "id": "alan", "User": "Alan Turing", "Email": "alan@acme.io", "Status": "active", "Role": "Developer", "Scope": "Collection /payments/prod", "MFA": "on", "SSO": "OIDC", "Last active": "3h ago", "title": "Staff Engineer" },
    { "id": "edsger", "User": "Edsger D.", "Email": "edsger@acme.io", "Status": "invited", "Role": "Viewer", "Scope": "WS data", "MFA": "—", "SSO": "OIDC", "Last active": "—", "title": "Analyst" },
    { "id": "kj", "User": "Katherine J.", "Email": "kj@acme.io", "Status": "suspended", "Role": "Operator", "Scope": "WS core", "MFA": "on", "SSO": "SAML", "Last active": "20d ago", "title": "SRE" }
  ],
  "serviceAccounts": [
    { "id": "sv1", "Service account": "ci-deployer", "Workspace": "payments", "Role": "Operator", "Auth": "API key · deploy", "Created": "2026-01-12", "Last used": "5m ago", "Status": "active" },
    { "id": "sv2", "Service account": "billing-bot", "Workspace": "org", "Role": "Billing", "Auth": "API key", "Created": "2025-12-01", "Last used": "1d ago", "Status": "active" },
    { "id": "sv3", "Service account": "metrics-reader", "Workspace": "core", "Role": "Viewer", "Auth": "API key · read", "Created": "2026-02-20", "Last used": "3h ago", "Status": "active" }
  ],
  "invitations": [
    { "id": "iv1", "Email": "edsger@acme.io", "Scope": "WS data", "Role": "Viewer", "Invited by": "ada@acme.io", "Sent": "2d ago", "Status": "invited" },
    { "id": "iv2", "Email": "margaret@acme.io", "Scope": "Collection /core/api", "Role": "Developer", "Invited by": "grace@acme.io", "Sent": "6d ago", "Status": "expired" }
  ],
  "grants": [
    { "id": "g1", "userId": "ada", "Scope": "Org: Acme Corp", "Role": "Owner", "Granted by": "system", "Granted": "2025-11-02", "Status": "active" },
    { "id": "g2", "userId": "ada", "Scope": "WS: core", "Role": "Admin", "Granted by": "system", "Granted": "2025-11-02", "Status": "active" },
    { "id": "g3", "userId": "grace", "Scope": "WS: payments", "Role": "Admin", "Granted by": "ada@acme.io", "Granted": "2026-01-08", "Status": "active" },
    { "id": "g4", "userId": "alan", "Scope": "Collection: /checkout", "Role": "Developer", "Granted by": "grace@acme.io", "Granted": "2026-03-15", "Status": "active" }
  ],
  "apiKeys": [
    { "id": "k1", "Workspace": "payments", "Name": "ci-deployer", "Prefix": "evd_ci_8f…", "Scopes": "deploy, read", "Rate limit": "200 rps · b400 · c50", "Status": "active", "Expires": "90d" },
    { "id": "k2", "Workspace": "payments", "Name": "partner-acme", "Prefix": "evd_pk_2a…", "Scopes": "invoke", "Rate limit": "50 rps · b100 · c20", "Status": "active", "Expires": "—" },
    { "id": "k3", "Workspace": "core", "Name": "legacy-cron", "Prefix": "evd_pk_d1…", "Scopes": "invoke", "Rate limit": "10 rps · b20 · c5", "Status": "revoked", "Expires": "—" }
  ],
  "routeGroups": [
    { "id": "r1", "Workspace": "payments", "Name": "payments-public", "Path namespace": "/payments", "Policy": "API key + 200rps + IP-allow", "Scaling shard": "dedicated", "Status": "reconciled" },
    { "id": "r2", "Workspace": "core", "Name": "core-api", "Path namespace": "/core", "Policy": "API key + 200rps", "Scaling shard": "shared pool", "Status": "reconciled" },
    { "id": "r3", "Workspace": "partners", "Name": "partner-webhooks", "Path namespace": "/partners", "Policy": "HMAC + 50rps", "Scaling shard": "shared pool", "Status": "reconciled" }
  ],
  "workspaces": [
    { "id": "w1", "Org": "Acme Corp", "Workspace": "payments", "Env": "prod+staging", "Members": "11", "API keys": "3", "Secrets": "Vault scope", "Collections": "5", "Owner": "grace@acme.io", "Status": "active" },
    { "id": "w2", "Org": "Acme Corp", "Workspace": "core", "Env": "prod", "Members": "8", "API keys": "2", "Secrets": "Vault scope", "Collections": "2", "Owner": "lin@acme.io", "Status": "active" },
    { "id": "w3", "Org": "Acme Corp", "Workspace": "data", "Env": "staging", "Members": "5", "API keys": "1", "Secrets": "Vault scope", "Collections": "2", "Owner": "ada@acme.io", "Status": "read-only" },
    { "id": "w4", "Org": "Globex Inc", "Workspace": "internal", "Env": "prod", "Members": "4", "API keys": "1", "Secrets": "Vault scope", "Collections": "1", "Owner": "hank@globex.com", "Status": "active" },
    { "id": "w5", "Org": "Globex Inc", "Workspace": "partners", "Env": "staging", "Members": "2", "API keys": "1", "Secrets": "Vault scope", "Collections": "1", "Owner": "dwayne@globex.com", "Status": "read-only" }
  ],
  "schedules": [
    { "id": "s1", "Workspace": "payments", "enabled": true, "Name": "nightly-recon", "Type": "cron", "Spec": "0 2 * * *", "TargetType": "flow", "Target": "nightly-recon", "Flow": "nightly-recon", "Next": "in 4h", "Owner": "replica-2 (leader)", "State": "active" },
    { "id": "s2", "Workspace": "core", "enabled": true, "Name": "daily-email-digest", "Type": "cron", "Spec": "0 8 * * *", "TargetType": "flow", "Target": "email-digest", "Flow": "email-digest", "Next": "in 6h", "Owner": "replica-2 (leader)", "State": "active" },
    { "id": "s3", "Workspace": "data", "enabled": false, "Name": "weekly-report", "Type": "one-shot", "Spec": "2026-06-01 09:00Z", "TargetType": "flow", "Target": "daily-report", "Flow": "daily-report", "Next": "paused", "Owner": "replica-2 (leader)", "State": "pending" },
    { "id": "s4", "Workspace": "payments", "enabled": true, "Name": "fraud-recompute", "Type": "interval", "Spec": "15m", "TargetType": "function", "Target": "fraud-model", "Flow": "—", "Next": "in 8m", "Owner": "replica-1 (leader)", "State": "active" },
    { "id": "s5", "Workspace": "data", "enabled": true, "Name": "pdf-render-warmup", "Type": "cron", "Spec": "*/30 * * * *", "TargetType": "function", "Target": "pdf-render", "Flow": "—", "Next": "in 22m", "Owner": "replica-1 (leader)", "State": "active" }
  ],
  "dlq": [
    { "id": "d1", "Workspace": "payments", "ExecID": "01HX8…A1", "Flow": "fraud-score", "Node": "risk-score", "Reason": "runner OOM", "Attempts": "2", "Age": "9m" },
    { "id": "d2", "Workspace": "payments", "ExecID": "01HX8…B7", "Flow": "payments-api", "Node": "http-sink", "Reason": "503 upstream", "Attempts": "3", "Age": "4m" },
    { "id": "d3", "Workspace": "payments", "ExecID": "01HX8…E2", "Flow": "refund-processor", "Node": "stripe-call", "Reason": "rate-limited", "Attempts": "5", "Age": "32m" },
    { "id": "d4", "Workspace": "core", "ExecID": "01HX8…C3", "Flow": "webhook-fanout", "Node": "http-sink", "Reason": "timeout", "Attempts": "3", "Age": "2m" },
    { "id": "d5", "Workspace": "core", "ExecID": "01HX8…D9", "Flow": "auth-service", "Node": "jwt-sign", "Reason": "KMS unavailable", "Attempts": "1", "Age": "47s" },
    { "id": "d6", "Workspace": "data", "ExecID": "01HX8…F4", "Flow": "etl-pipeline", "Node": "pdf-render", "Reason": "runner OOM", "Attempts": "2", "Age": "11m" },
    { "id": "d7", "Workspace": "data", "ExecID": "01HX8…G6", "Flow": "daily-report", "Node": "s3-write", "Reason": "AccessDenied", "Attempts": "4", "Age": "1h" },
    { "id": "d8", "Workspace": "partners", "ExecID": "01HX8…H1", "Flow": "partner-inbound", "Node": "hmac-verify", "Reason": "signature mismatch", "Attempts": "1", "Age": "3m" }
  ],
  "deployments": [
    { "id": "h1", "Workspace": "payments", "Flow": "payments-api", "Version": "v42", "Plan": "PlanSpec", "Author": "ci-deployer", "Trigger": "GitOps", "Started": "12:01Z", "Duration": "4m 12s", "Status": "rolling out" },
    { "id": "h2", "Workspace": "payments", "Flow": "payments-api", "Version": "v41", "Plan": "PlanSpec", "Author": "grace@acme.io", "Trigger": "manual", "Started": "09:18Z", "Duration": "3m 50s", "Status": "reconciled" },
    { "id": "h3", "Workspace": "core", "Flow": "auth-service", "Version": "v31", "Plan": "PlanSpec", "Author": "ci-deployer", "Trigger": "GitOps", "Started": "yesterday 17:42Z", "Duration": "4m 22s", "Status": "reconciled" },
    { "id": "h4", "Workspace": "payments", "Flow": "fraud-score", "Version": "v18", "Plan": "PlanSpec", "Author": "ci-deployer", "Trigger": "GitOps", "Started": "yesterday 11:09Z", "Duration": "5m 04s", "Status": "reconciled" }
  ],
  "audit": [
    { "id": "a1", "agoMin": 25, "Time": "12:01:55Z", "Actor": "ada@acme.io", "Action": "apikey.rate_limit.update", "Target": "partner-acme", "Hash": "a91f…3c2" },
    { "id": "a2", "agoMin": 160, "Time": "11:58:10Z", "Actor": "ci-deployer", "Action": "deploy.publish", "Target": "payments-api v42", "Hash": "7d0c…b41" },
    { "id": "a3", "agoMin": 600, "Time": "11:40:02Z", "Actor": "grace@acme.io", "Action": "routegroup.create", "Target": "payments-public", "Hash": "2a55…9e8" },
    { "id": "a4", "agoMin": 2400, "Time": "yesterday 11:22Z", "Actor": "ada@acme.io", "Action": "flowtap.start", "Target": "payments-api", "Hash": "f3b1…0aa" },
    { "id": "a5", "agoMin": 7000, "Time": "5d ago 10:11Z", "Actor": "grace@acme.io", "Action": "user.invite", "Target": "edsger@acme.io", "Hash": "b220…4d1" }
  ],
  "protos": [
    {
      "id": "proto-payments-v3", "Workspace": "payments", "Name": "payments", "Version": "v3",
      "Ref": "oci://registry/proto/payments@v3",
      "services": [
        {
          "name": "payments.Checkout",
          "methods": [
            { "name": "Charge",    "streaming": "unary",            "requestType": "CheckoutRequest", "responseType": "CheckoutResponse" },
            { "name": "Refund",    "streaming": "unary",            "requestType": "RefundRequest",   "responseType": "RefundResponse"   },
            { "name": "Subscribe", "streaming": "server-streaming", "requestType": "SubscribeRequest","responseType": "PaymentEvent"     }
          ]
        },
        {
          "name": "payments.Status",
          "methods": [
            { "name": "Stream",  "streaming": "bidi",            "requestType": "StatusReq",    "responseType": "StatusResp" },
            { "name": "GetOne",  "streaming": "unary",           "requestType": "StatusReq",    "responseType": "StatusResp" }
          ]
        }
      ],
      "messages": {
        "CheckoutRequest":  { "amount": "double", "currency": "string", "customer_id": "string", "metadata": "map<string,string>" },
        "CheckoutResponse": { "transaction_id": "string", "status": "enum(PENDING,APPROVED,DECLINED)", "fee_breakdown": "repeated Fee" },
        "RefundRequest":    { "transaction_id": "string", "reason": "string" },
        "RefundResponse":   { "refund_id": "string", "status": "enum(QUEUED,COMPLETED,FAILED)" },
        "SubscribeRequest": { "customer_id": "string", "since": "google.protobuf.Timestamp" },
        "PaymentEvent":     { "id": "string", "type": "string", "ts": "google.protobuf.Timestamp", "payload": "google.protobuf.Struct" },
        "StatusReq":        { "transaction_id": "string" },
        "StatusResp":       { "status": "string", "ts": "google.protobuf.Timestamp" }
      }
    },
    {
      "id": "proto-billing-v2", "Workspace": "payments", "Name": "billing", "Version": "v2",
      "Ref": "oci://registry/proto/billing@v2",
      "services": [
        {
          "name": "billing.Subscription",
          "methods": [
            { "name": "Create",  "streaming": "unary", "requestType": "CreateSubReq",  "responseType": "Subscription" },
            { "name": "Cancel",  "streaming": "unary", "requestType": "CancelSubReq",  "responseType": "Subscription" },
            { "name": "List",    "streaming": "unary", "requestType": "ListSubReq",    "responseType": "ListSubResp"  }
          ]
        }
      ],
      "messages": {
        "CreateSubReq":  { "customer_id": "string", "plan": "string" },
        "CancelSubReq":  { "subscription_id": "string" },
        "ListSubReq":    { "customer_id": "string", "limit": "int32" },
        "Subscription":  { "id": "string", "customer_id": "string", "plan": "string", "status": "enum(ACTIVE,CANCELLED,PAUSED)" },
        "ListSubResp":   { "items": "repeated Subscription", "next_page": "string" }
      }
    },
    {
      "id": "proto-notification-v1", "Workspace": "core", "Name": "notification", "Version": "v1",
      "Ref": "oci://registry/proto/notification@v1",
      "services": [
        {
          "name": "notification.Email",
          "methods": [
            { "name": "Send",   "streaming": "unary",            "requestType": "EmailReq",  "responseType": "SendResp" },
            { "name": "Tail",   "streaming": "server-streaming", "requestType": "TailReq",   "responseType": "EmailEvent" }
          ]
        },
        {
          "name": "notification.Push",
          "methods": [
            { "name": "Send", "streaming": "unary", "requestType": "PushReq", "responseType": "SendResp" }
          ]
        }
      ],
      "messages": {
        "EmailReq":   { "to": "repeated string", "subject": "string", "body_html": "string" },
        "TailReq":    { "since": "google.protobuf.Timestamp" },
        "EmailEvent": { "message_id": "string", "delivered": "bool", "ts": "google.protobuf.Timestamp" },
        "PushReq":    { "device_token": "string", "title": "string", "body": "string" },
        "SendResp":   { "message_id": "string", "queued": "bool" }
      }
    },
    {
      "id": "proto-etl-v1", "Workspace": "data", "Name": "etl", "Version": "v1",
      "Ref": "oci://registry/proto/etl@v1",
      "services": [
        {
          "name": "etl.Pipeline",
          "methods": [
            { "name": "Trigger",  "streaming": "unary",            "requestType": "TriggerReq",  "responseType": "RunResp" },
            { "name": "Watch",    "streaming": "server-streaming", "requestType": "WatchReq",    "responseType": "RunEvent" }
          ]
        }
      ],
      "messages": {
        "TriggerReq": { "pipeline_id": "string", "params": "google.protobuf.Struct" },
        "WatchReq":   { "run_id": "string" },
        "RunResp":    { "run_id": "string", "started_at": "google.protobuf.Timestamp" },
        "RunEvent":   { "run_id": "string", "stage": "string", "progress": "double" }
      }
    },
    {
      "id": "proto-middleware-v1", "Workspace": "payments", "Name": "middleware", "Version": "v1",
      "Ref": "oci://registry/proto/middleware@v1",
      "description": "HTTP-to-gRPC gateway middleware contracts: auth (JWT/API-key), rate limiting and request enrichment.",
      "services": [
        {
          "name": "middleware.Auth",
          "methods": [
            { "name": "ValidateToken",  "streaming": "unary", "requestType": "TokenReq",    "responseType": "TokenResp"   },
            { "name": "RefreshToken",   "streaming": "unary", "requestType": "RefreshReq",  "responseType": "TokenResp"   },
            { "name": "RevokeToken",    "streaming": "unary", "requestType": "RevokeReq",   "responseType": "RevokeResp"  }
          ]
        },
        {
          "name": "middleware.RateLimit",
          "methods": [
            { "name": "Check",   "streaming": "unary", "requestType": "RateLimitReq",  "responseType": "RateLimitResp" },
            { "name": "Reset",   "streaming": "unary", "requestType": "RateLimitReq",  "responseType": "RateLimitResp" }
          ]
        },
        {
          "name": "middleware.Enricher",
          "methods": [
            { "name": "Enrich",  "streaming": "unary",            "requestType": "EnrichReq",  "responseType": "EnrichResp"  },
            { "name": "Watch",   "streaming": "server-streaming", "requestType": "WatchReq",   "responseType": "EnrichEvent" }
          ]
        }
      ],
      "messages": {
        "TokenReq":      { "token": "string", "audience": "string" },
        "TokenResp":     { "valid": "bool", "subject": "string", "expires_at": "google.protobuf.Timestamp", "claims": "google.protobuf.Struct" },
        "RefreshReq":    { "refresh_token": "string" },
        "RevokeReq":     { "token": "string", "reason": "string" },
        "RevokeResp":    { "revoked": "bool" },
        "RateLimitReq":  { "key": "string", "limit": "int32", "window_sec": "int32" },
        "RateLimitResp": { "allowed": "bool", "remaining": "int32", "reset_at": "google.protobuf.Timestamp" },
        "EnrichReq":     { "request_id": "string", "headers": "map<string,string>", "payload": "google.protobuf.Struct" },
        "EnrichResp":    { "request_id": "string", "enriched": "google.protobuf.Struct", "latency_ms": "double" },
        "WatchReq":      { "filter": "string" },
        "EnrichEvent":   { "request_id": "string", "stage": "string", "ts": "google.protobuf.Timestamp" }
      }
    }
  ],
  "permissions": [
    { "id": "flow.read",          "label": "Read flows",            "group": "Flow" },
    { "id": "flow.create",        "label": "Create flow",           "group": "Flow" },
    { "id": "flow.update",        "label": "Update flow metadata",  "group": "Flow" },
    { "id": "flow.deploy",        "label": "Deploy flow",           "group": "Flow" },
    { "id": "flow.run",           "label": "Run flow (manual)",     "group": "Flow" },
    { "id": "flow.delete",        "label": "Delete flow",           "group": "Flow" },
    { "id": "function.read",      "label": "Read functions",        "group": "Function" },
    { "id": "function.create",    "label": "Create function",       "group": "Function" },
    { "id": "function.update",    "label": "Update function",       "group": "Function" },
    { "id": "function.invoke",    "label": "Invoke function",       "group": "Function" },
    { "id": "function.delete",    "label": "Delete function",       "group": "Function" },
    { "id": "schedule.read",      "label": "Read schedules",        "group": "Schedule" },
    { "id": "schedule.create",    "label": "Create schedule",       "group": "Schedule" },
    { "id": "schedule.update",    "label": "Update schedule",       "group": "Schedule" },
    { "id": "schedule.delete",    "label": "Delete schedule",       "group": "Schedule" },
    { "id": "apikey.read",        "label": "Read API keys",         "group": "API key" },
    { "id": "apikey.create",      "label": "Create API key",        "group": "API key" },
    { "id": "apikey.revoke",      "label": "Revoke API key",        "group": "API key" },
    { "id": "routegroup.update",  "label": "Update route group",    "group": "Route group" },
    { "id": "routegroup.delete",  "label": "Delete route group",    "group": "Route group" },
    { "id": "secret.read",        "label": "Read secret metadata",  "group": "Secret" },
    { "id": "secret.rotate",      "label": "Rotate secret",         "group": "Secret" },
    { "id": "secret.revoke",      "label": "Revoke secret",         "group": "Secret" },
    { "id": "audit.read",         "label": "Read audit log",        "group": "Audit" },
    { "id": "audit.export",       "label": "Export audit log",      "group": "Audit" },
    { "id": "role.read",          "label": "Read roles",            "group": "Role" },
    { "id": "role.create",        "label": "Create custom role",    "group": "Role" },
    { "id": "role.update",        "label": "Update custom role",    "group": "Role" },
    { "id": "role.delete",        "label": "Delete custom role",    "group": "Role" },
    { "id": "user.invite",        "label": "Invite user",           "group": "User" },
    { "id": "user.update",        "label": "Update user",           "group": "User" },
    { "id": "user.suspend",       "label": "Suspend / re-activate", "group": "User" },
    { "id": "workspace.create",   "label": "Create workspace",      "group": "Workspace" },
    { "id": "workspace.update",   "label": "Update workspace",      "group": "Workspace" },
    { "id": "workspace.archive",  "label": "Archive workspace",     "group": "Workspace" }
  ],
  "roles": [
    {
      "id": "role-owner", "Name": "Owner", "builtin": true,
      "Description": "Full control across all workspaces — only Owner can manage org policy, billing and other Owners.",
      "permissions": [
        "flow.read","flow.create","flow.update","flow.deploy","flow.run","flow.delete",
        "function.read","function.create","function.update","function.invoke","function.delete",
        "schedule.read","schedule.create","schedule.update","schedule.delete",
        "apikey.read","apikey.create","apikey.revoke",
        "routegroup.update","routegroup.delete",
        "secret.read","secret.rotate","secret.revoke",
        "audit.read","audit.export",
        "role.read","role.create","role.update","role.delete",
        "user.invite","user.update","user.suspend",
        "workspace.create","workspace.update","workspace.archive"
      ]
    },
    {
      "id": "role-admin", "Name": "Admin", "builtin": true,
      "Description": "Manage workspaces, members, keys, secrets — everything except creating/deleting custom roles and other Admins.",
      "permissions": [
        "flow.read","flow.create","flow.update","flow.deploy","flow.run","flow.delete",
        "function.read","function.create","function.update","function.invoke","function.delete",
        "schedule.read","schedule.create","schedule.update","schedule.delete",
        "apikey.read","apikey.create","apikey.revoke",
        "routegroup.update","routegroup.delete",
        "secret.read","secret.rotate","secret.revoke",
        "audit.read","audit.export",
        "role.read",
        "user.invite","user.update","user.suspend",
        "workspace.update","workspace.archive"
      ]
    },
    {
      "id": "role-developer", "Name": "Developer", "builtin": true,
      "Description": "Build and ship flows / functions / schedules. No member or workspace admin powers.",
      "permissions": [
        "flow.read","flow.create","flow.update","flow.deploy","flow.run",
        "function.read","function.create","function.update","function.invoke",
        "schedule.read","schedule.create","schedule.update",
        "apikey.read",
        "secret.read",
        "audit.read",
        "role.read"
      ]
    },
    {
      "id": "role-operator", "Name": "Operator", "builtin": true,
      "Description": "Operate live systems — deploy, run, replay DLQ, rotate secrets. Cannot create / delete flows.",
      "permissions": [
        "flow.read","flow.deploy","flow.run",
        "function.read","function.invoke",
        "schedule.read","schedule.update",
        "apikey.read",
        "secret.read","secret.rotate",
        "audit.read","audit.export",
        "role.read"
      ]
    },
    {
      "id": "role-viewer", "Name": "Viewer", "builtin": true,
      "Description": "Read-only access across all resources. Cannot mutate anything.",
      "permissions": [
        "flow.read","function.read","schedule.read",
        "apikey.read","secret.read","audit.read","role.read"
      ]
    }
  ],
  "marketplace": [
    { "id": "p1", "name": "Stripe connector", "cat": "Payments", "sub": "verified · official", "installs": "12k", "installed": true },
    { "id": "p2", "name": "OpenAI node", "cat": "AI", "sub": "LLM call · streaming", "installs": "8k", "installed": false },
    { "id": "p3", "name": "Snowflake sink", "cat": "Data", "sub": "sandboxed · IAM", "installs": "3k", "installed": false },
    { "id": "p4", "name": "Slack notification", "cat": "Notification", "sub": "incoming webhooks", "installs": "21k", "installed": true },
    { "id": "p5", "name": "Kafka enrich", "cat": "Data", "sub": "inline transform", "installs": "6k", "installed": false },
    { "id": "p6", "name": "Twilio SMS", "cat": "Notification", "sub": "send + status", "installs": "9k", "installed": false },
    { "id": "p7", "name": "Anthropic Claude", "cat": "AI", "sub": "LLM call", "installs": "5k", "installed": false },
    { "id": "p8", "name": "Postgres outbox", "cat": "Data", "sub": "transactional outbox", "installs": "4k", "installed": true }
  ]
};
const __wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function loadDb() {
  await __wait(320);
  return JSON.parse(JSON.stringify(__DB_SEED__)); // pristine clone per load
}

/* ---- CodeMirror stub: the editor is replaced by a styled <textarea> so the
        single-file prototype stays dependency-free. Highlighting is dropped;
        the write/build/test/deploy flow is otherwise intact. ---- */
const python = () => [], javascript = () => [], go = null, oneDark = null;
const StreamLanguage = { define: () => null };
function CodeMirror({ value, height = '360px', editable = true, onChange }) {
  return (
    <textarea
      className="cm-stub mono"
      style={{ height, width: '100%' }}
      spellCheck={false}
      readOnly={!editable}
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
    />
  );
}


