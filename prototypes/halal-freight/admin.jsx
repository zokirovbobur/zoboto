/* ============================================================
   Admin / Underwriter portal — shell, dashboard, queue, review
   ============================================================ */
(function () {
const { useState } = React;
const { Portal, PageHead, Stat, Card, CardHead, Btn, Badge, StatusBadge, Icon,
  CheckRow, RiskGauge, KV, BarChart, Donut, useToast, Modal } = window;
const D = window.HFF_DATA;

const ADMIN_NAV = [
  { items: [
    { id: "admin/dashboard", icon: "dashboard", label: "Dashboard" },
    { id: "admin/review-queue", icon: "list", label: "Review Queue", badge: 4 },
  ]},
  { label: "Risk & Compliance", items: [
    { id: "admin/scoring", icon: "gauge", label: "Scoring Engine" },
    { id: "admin/shariah", icon: "scale", label: "Shariah Compliance" },
  ]},
  { label: "Money", items: [
    { id: "admin/collections", icon: "coins", label: "Collections" },
    { id: "admin/reports", icon: "chart", label: "Reports" },
  ]},
];

function AdminApp({ route, params, nav }) {
  const screens = {
    "admin/dashboard": <AdminDashboard nav={nav} />,
    "admin/review-queue": <ReviewQueue nav={nav} />,
    "admin/request-review": <RequestReview nav={nav} params={params} />,
    "admin/scoring": window.ScoringEngine ? <window.ScoringEngine /> : null,
    "admin/shariah": window.ShariahModule ? <window.ShariahModule /> : null,
    "admin/collections": window.Collections ? <window.Collections /> : null,
    "admin/reports": window.Reports ? <window.Reports /> : null,
  };
  const titles = {
    "admin/dashboard": ["Underwriting Console", "Portfolio overview"],
    "admin/review-queue": ["Review Queue", "Funding requests awaiting decision"],
    "admin/request-review": ["Underwriting Review", params?.id || "FR-20431"],
    "admin/scoring": ["Scoring Engine", "Model weights & decision rules"],
    "admin/shariah": ["Shariah Compliance", "Structure, board review & audit trail"],
    "admin/collections": ["Collections & Settlement", "Broker payments & reserve release"],
    "admin/reports": ["Reports & Analytics", "Portfolio performance"],
  };
  const navActive = route === "admin/request-review" ? "admin/review-queue" : route;
  const [t, s] = titles[route] || ["", ""];
  return (
    <Portal nav={ADMIN_NAV} active={navActive} onNav={(id) => nav(id)}
      title={t} sub={s} role="Underwriter" user="Maryam Iqbal" onSwitch={() => nav("login")}
      topRight={<Btn kind="ghost" size="sm" icon="bell">3 alerts</Btn>}>
      {screens[route]}
    </Portal>
  );
}

/* ---------------- Admin dashboard ---------------- */
function AdminDashboard({ nav }) {
  return (
    <div>
      <PageHead title="Underwriting Console" sub="Today · June 15, 2026"
        actions={<><Btn kind="ghost" icon="download">Export</Btn><Btn kind="primary" icon="list" onClick={() => nav("admin/review-queue")}>Open review queue</Btn></>} />

      <div className="grid g-4">
        <Stat label="Total portfolio exposure" value="$1.28M" icon="layers" tone="blue" sub="Across 214 active advances" />
        <Stat label="Today's funding volume" value="$300K" icon="wallet" tone="green" sub={<><Icon name="trending" size={13} style={{ color: "var(--green-strong)" }} /> +16% vs. yesterday</>} />
        <Stat label="Pending review queue" value="4" icon="clock" tone="amber" sub="2 manual · 1 high risk · 1 docs" />
        <Stat label="Avg broker days-to-pay" value="33" icon="building" tone="blue" sub="Weighted across portfolio" />
      </div>

      <div className="grid g-4" style={{ marginTop: 18 }}>
        <Stat label="Auto-approved (today)" value="78%" icon="checkCircle" tone="green" sub="14 of 18 requests" />
        <Stat label="Manual review required" value="22%" icon="eye" tone="amber" sub="4 requests" />
        <Stat label="Overdue broker payments" value="3" icon="alert" tone="red" sub={D.fmt(17600) + " exposure"} />
        <Stat label="Fraud alerts" value="1" icon="flag" tone="red" sub="Duplicate invoice flagged" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", marginTop: 18 }}>
        <Card>
          <CardHead icon="chart" title="Funding volume" sub="Last 6 months ($K)" right={<Badge tone="green" dot>Trending up</Badge>} />
          <div className="card-pad"><BarChart data={D.reports.monthly} height={170} suffix="K" /></div>
        </Card>
        <Card>
          <CardHead icon="alert" title="Needs attention" />
          <div className="card-pad" style={{ paddingTop: 6 }}>
            {[["flag", "red", "Fraud alert", "Duplicate invoice on FR-20425", "high"], ["scale", "amber", "Shariah exception", "Penalty flag auto-removed · FR-20419", "shariah"], ["building", "red", "Broker overdue", "Summit · 3 invoices, 6 days late", "overdue"], ["clock", "amber", "Manual review", "FR-20431 · MC age < 6 months", "manual"]].map(([ic, tone, t, d], i, arr) => (
              <div key={t} className="row" style={{ gap: 12, padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--line)" : "none", cursor: "pointer" }} onClick={() => nav("admin/review-queue")}>
                <div className="check-ico" style={{ background: tone === "red" ? "var(--danger-soft)" : "var(--warn-soft)", color: tone === "red" ? "var(--danger)" : "oklch(0.55 0.13 70)" }}><Icon name={ic} size={14} /></div>
                <div style={{ flex: 1 }}><div className="small strong">{t}</div><div className="tiny muted">{d}</div></div>
                <Icon name="chevronRight" size={15} style={{ color: "var(--ink-4)" }} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Review Queue ---------------- */
const FILTERS = [
  ["all", "All"], ["auto", "Auto approve"], ["manual", "Manual review"], ["high", "High risk"], ["docs", "Awaiting documents"], ["overdue", "Broker overdue"],
];
function ReviewQueue({ nav }) {
  const [filter, setFilter] = useState("all");
  const rows = D.adminQueue.filter(r => filter === "all" || r.flag === filter);
  const counts = {}; D.adminQueue.forEach(r => counts[r.flag] = (counts[r.flag] || 0) + 1);
  return (
    <div>
      <PageHead title="Review Queue" sub={`${D.adminQueue.length} funding requests`}
        actions={<><Btn kind="ghost" icon="filter">More filters</Btn><Btn kind="ghost" icon="download">Export</Btn></>} />

      <div className="filters" style={{ marginBottom: 16 }}>
        {FILTERS.map(([id, label]) => (
          <div key={id} className={"filter-pill " + (filter === id ? "active" : "")} onClick={() => setFilter(id)}>
            {label}<span className="cnt">{id === "all" ? D.adminQueue.length : (counts[id] || 0)}</span>
          </div>
        ))}
      </div>

      <Card style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>Request ID</th><th>Carrier</th><th>Broker</th><th className="right">Invoice</th><th>Risk score</th><th>Verification</th><th className="right">Advance</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="clickable" onClick={() => nav("admin/request-review", { id: r.id })}>
                  <td className="mono strong">{r.id}</td>
                  <td className="nowrap">{r.carrier}</td>
                  <td><span className="small nowrap">{r.broker.split(" ").slice(0, 1)}</span> <Badge tone={r.brokerTone} dot></Badge></td>
                  <td className="right mono num">{D.fmt(r.invoice)}</td>
                  <td><ScorePill score={r.score} risk={r.risk} /></td>
                  <td className="small muted nowrap">{r.verify}</td>
                  <td className="right mono num strong">{r.advance ? D.fmt(r.advance) : "—"}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td><Btn kind="ghost" size="sm" onClick={(e) => { e.stopPropagation(); nav("admin/request-review", { id: r.id }); }}>Review</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ScorePill({ score, risk }) {
  const tone = score >= 80 ? "green" : score >= 60 ? "amber" : "red";
  const color = { green: "var(--green-strong)", amber: "var(--warn)", red: "var(--danger)" }[tone];
  return (
    <div className="row" style={{ gap: 8 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: tone === "green" ? "var(--ok-soft)" : tone === "amber" ? "var(--warn-soft)" : "var(--danger-soft)", display: "grid", placeItems: "center" }}>
        <span className="mono strong" style={{ fontSize: 12.5, color }}>{score}</span>
      </div>
      <Badge tone={tone} dot>{risk}</Badge>
    </div>
  );
}

/* ---------------- Underwriting Review ---------------- */
function RequestReview({ nav, params }) {
  const toast = useToast();
  const [decision, setDecision] = useState(null);
  const f = D.featured;
  const b = D.brokers[f.brokerKey];

  const decide = (label, msg, tone) => { setDecision({ label, tone }); toast(msg); };

  return (
    <div>
      <PageHead title={`Underwriting Review · ${f.id}`}
        crumb={<div className="crumb"><span className="lnk" onClick={() => nav("admin/review-queue")}>Review Queue</span><span className="sep">/</span><span>{f.id}</span></div>}
        sub={`${f.carrier} · ${f.broker} · ${D.fmt(f.invoice)}`}
        actions={decision ? <Badge tone={decision.tone} icon="check">{decision.label}</Badge> : <Badge tone="amber" dot>Awaiting decision</Badge>} />

      <div className="grid" style={{ gridTemplateColumns: "1fr 320px" }}>
        <div className="stack" style={{ gap: 18 }}>
          {/* carrier risk */}
          <Card>
            <CardHead icon="truck" title="Carrier risk profile" right={<Badge tone="green" dot>Score 90</Badge>} />
            <div className="card-pad" style={{ paddingTop: 6 }}>
              <div className="grid g-2" style={{ gap: 0, columnGap: 28 }}>
                <div><KV k="DOT status" v={<Badge tone="green" icon="check">Active</Badge>} /><KV k="MC authority age" v={D.carrier.mcAge} /><KV k="Safety status" v={<Badge tone="green" dot>{D.carrier.safety}</Badge>} /></div>
                <div><KV k="Fleet size" v={D.carrier.fleet + " trucks"} /><KV k="Prior invoices" v={D.carrier.repeat + " funded"} /><KV k="Invoice behavior" v={<Badge tone="green" dot>No disputes</Badge>} /></div>
              </div>
            </div>
          </Card>

          {/* broker risk */}
          <Card>
            <CardHead icon="building" title="Broker risk profile" right={<Badge tone="green" dot>Score 88</Badge>} />
            <div className="card-pad" style={{ paddingTop: 6 }}>
              <div className="strong" style={{ marginBottom: 6 }}>{b.name} <span className="tiny muted mono">{b.mc}</span></div>
              <div className="grid g-2" style={{ gap: 0, columnGap: 28 }}>
                <div><KV k="Payment history" v={b.paid + " invoices paid"} /><KV k="Avg days to pay" v={b.avgDays + " days"} /></div>
                <div><KV k="Dispute history" v={b.disputes + " disputes"} /><KV k="Credit risk" v={<Badge tone={b.creditTone} dot>{b.credit}</Badge>} /></div>
              </div>
            </div>
          </Card>

          {/* document risk */}
          <Card>
            <CardHead icon="layers" title="Invoice / document risk" right={<Badge tone="green" dot>Score 79</Badge>} />
            <div className="card-pad" style={{ paddingTop: 4, paddingBottom: 8 }}>
              <CheckRow status="ok" label="BOL / POD match" meta="BOL-558120" />
              <CheckRow status="ok" label="POD signature detected" meta="R. Mason · Jun 05" />
              <CheckRow status="ok" label="Duplicate invoice check" meta="No prior factoring" />
              <CheckRow status="ok" label="Route / GPS match" meta="88% lane match" />
              <CheckRow status="warn" label="Amount anomaly check" meta="Within 6% of lane avg" />
            </div>
          </Card>

          {/* score breakdown */}
          <Card>
            <CardHead icon="gauge" title="Risk score breakdown" />
            <div className="card-pad">
              {D.scoring.map(s => (
                <div key={s.key} style={{ marginBottom: 14 }}>
                  <div className="row between" style={{ marginBottom: 6 }}>
                    <span className="small strong">{s.label} <span className="tiny muted">· weight {s.weight}%</span></span>
                    <span className="mono small strong" style={{ color: s.tone === "green" ? "var(--green-strong)" : "var(--warn)" }}>{s.score}/100</span>
                  </div>
                  <div className="pbar"><span style={{ width: s.score + "%", background: s.tone === "green" ? "var(--green-strong)" : "var(--warn)" }} /></div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* decision rail */}
        <div className="stack" style={{ gap: 18 }}>
          <Card pad><div className="center"><RiskGauge score={f.score} /><div className="small muted" style={{ marginTop: 8 }}>Weighted across 4 risk factors</div></div></Card>

          <Card pad>
            <div className="small strong" style={{ marginBottom: 10 }}>Requested terms</div>
            <KV k="Invoice" v={<span className="mono num">{D.fmt(f.invoice)}</span>} />
            <KV k="Requested advance" v={<span className="mono num strong">{D.fmt(f.advance)} (90%)</span>} />
            <KV k="Wakalah fee" v={<span className="mono num">{D.fmt(f.fee)}</span>} />
            <KV k="Reserve" v={<span className="mono num">{D.fmt(f.reserve)}</span>} />
          </Card>

          <Card pad>
            <div className="small strong" style={{ marginBottom: 12 }}>Underwriting decision</div>
            <div className="stack" style={{ gap: 9 }}>
              <Btn kind="primary" block icon="check" onClick={() => decide("Approved", "Request approved at 90% advance", "green")}>Approve</Btn>
              <Btn kind="ghost" block icon="coins" onClick={() => decide("Approved · lower advance", "Approved at reduced 80% advance", "amber")}>Approve with lower advance</Btn>
              <Btn kind="ghost" block icon="file" onClick={() => decide("More documents requested", "Document request sent to carrier", "blue")}>Request more documents</Btn>
              <Btn kind="danger" block icon="x" onClick={() => decide("Rejected", "Request rejected", "red")}>Reject</Btn>
            </div>
            {decision && <div className="row fade-in" style={{ gap: 8, marginTop: 12, padding: "10px 12px", background: "var(--surface-sunken)", borderRadius: "var(--r-sm)" }}><Icon name="checkCircle" size={15} style={{ color: "var(--green-strong)" }} /><span className="tiny strong">Decision recorded: {decision.label}</span></div>}
          </Card>
        </div>
      </div>
      <style>{`@media(max-width:980px){ .portal-body .grid[style*="320px"]{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}

window.AdminApp = AdminApp;
})();
