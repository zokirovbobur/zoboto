/* ============================================================
   Admin / Underwriter portal — shell, dashboard, queue, review
   ============================================================ */
(function () {
const { useState } = React;
const { Portal, PageHead, Stat, Card, CardHead, Btn, Badge, StatusBadge, Icon,
  CheckRow, RiskGauge, KV, BarChart, Donut, useToast, Modal } = window;
const D = window.HFF_DATA;

function AdminApp({ route, params, nav, lang }) {
  const ADMIN_NAV = [
    { items: [
      { id: "admin/dashboard", icon: "dashboard", label: window.t('anav_dashboard') },
      { id: "admin/review-queue", icon: "list", label: window.t('anav_queue'), badge: 4 },
    ]},
    { label: window.t('anav_risk'), items: [
      { id: "admin/scoring", icon: "gauge", label: window.t('anav_scoring') },
      { id: "admin/shariah", icon: "scale", label: window.t('anav_shariah') },
    ]},
    { label: window.t('anav_money'), items: [
      { id: "admin/collections", icon: "coins", label: window.t('anav_collections') },
      { id: "admin/reports", icon: "chart", label: window.t('anav_reports') },
    ]},
  ];
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
    "admin/dashboard": [window.t('admin_title'), window.t('admin_sub')],
    "admin/review-queue": [window.t('queue_title'), window.t('rev_crumb')],
    "admin/request-review": [window.t('rev_title'), params?.id || "FR-20431"],
    "admin/scoring": [window.t('scoring_title'), window.t('scoring_sub')],
    "admin/shariah": [window.t('shariah_title'), window.t('shariah_sub')],
    "admin/collections": [window.t('coll_title'), window.t('coll_sub')],
    "admin/reports": [window.t('rep_title'), window.t('rep_sub')],
  };
  const navActive = route === "admin/request-review" ? "admin/review-queue" : route;
  const [pageTitle, pageSub] = titles[route] || ["", ""];
  return (
    <Portal nav={ADMIN_NAV} active={navActive} onNav={(id) => nav(id)}
      title={pageTitle} sub={pageSub} role="Underwriter" user="Maryam Iqbal" onSwitch={() => nav("login")}
      topRight={<Btn kind="ghost" size="sm" icon="bell">3 alerts</Btn>}>
      {screens[route]}
    </Portal>
  );
}

/* ---------------- Admin dashboard ---------------- */
function AdminDashboard({ nav }) {
  const alerts = [
    ["flag", "red", window.t('alert_fraud'), window.t('alert_fraud_d')],
    ["scale", "amber", window.t('alert_shariah'), window.t('alert_shariah_d')],
    ["building", "red", window.t('alert_overdue'), window.t('alert_overdue_d')],
    ["clock", "amber", window.t('alert_manual'), window.t('alert_manual_d')],
  ];
  return (
    <div>
      <PageHead title={window.t('admin_title')} sub={window.t('admin_sub')}
        actions={<><Btn kind="ghost" icon="download">{window.t('btn_export')}</Btn><Btn kind="primary" icon="list" onClick={() => nav("admin/review-queue")}>{window.t('btn_open_queue')}</Btn></>} />

      <div className="grid g-4">
        <Stat label={window.t('astat1')} value="$1.28M" icon="layers" tone="blue" sub={window.t('astat1s')} />
        <Stat label={window.t('astat2')} value="$300K" icon="wallet" tone="green" sub={<><Icon name="trending" size={13} style={{ color: "var(--green-strong)" }} /> {window.t('astat2s')}</>} />
        <Stat label={window.t('astat3')} value="4" icon="clock" tone="amber" sub={window.t('astat3s')} />
        <Stat label={window.t('astat4')} value="33" icon="building" tone="blue" sub={window.t('astat4s')} />
      </div>

      <div className="grid g-4" style={{ marginTop: 18 }}>
        <Stat label={window.t('astat5')} value="78%" icon="checkCircle" tone="green" sub={window.t('astat5s')} />
        <Stat label={window.t('astat6')} value="22%" icon="eye" tone="amber" sub={window.t('astat6s')} />
        <Stat label={window.t('astat7')} value="3" icon="alert" tone="red" sub={window.t('astat7s').replace('{0}', D.fmt(17600))} />
        <Stat label={window.t('astat8')} value="1" icon="flag" tone="red" sub={window.t('astat8s')} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", marginTop: 18 }}>
        <Card>
          <CardHead icon="chart" title={window.t('card_volume')} sub={window.t('card_volume_sub')} right={<Badge tone="green" dot>{window.t('card_trending')}</Badge>} />
          <div className="card-pad"><BarChart data={D.reports.monthly} height={170} suffix="K" /></div>
        </Card>
        <Card>
          <CardHead icon="alert" title={window.t('card_attention')} />
          <div className="card-pad" style={{ paddingTop: 6 }}>
            {alerts.map(([ic, tone, alertTitle, d], i, arr) => (
              <div key={alertTitle} className="row" style={{ gap: 12, padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--line)" : "none", cursor: "pointer" }} onClick={() => nav("admin/review-queue")}>
                <div className="check-ico" style={{ background: tone === "red" ? "var(--danger-soft)" : "var(--warn-soft)", color: tone === "red" ? "var(--danger)" : "oklch(0.55 0.13 70)" }}><Icon name={ic} size={14} /></div>
                <div style={{ flex: 1 }}><div className="small strong">{alertTitle}</div><div className="tiny muted">{d}</div></div>
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
function ReviewQueue({ nav }) {
  const FILTERS = [
    ["all", window.t('fil_all')],
    ["auto", window.t('fil_auto')],
    ["manual", window.t('fil_manual')],
    ["high", window.t('fil_high')],
    ["docs", window.t('fil_docs')],
    ["overdue", window.t('fil_overdue')],
  ];
  const [filter, setFilter] = useState("all");
  const rows = D.adminQueue.filter(r => filter === "all" || r.flag === filter);
  const counts = {}; D.adminQueue.forEach(r => counts[r.flag] = (counts[r.flag] || 0) + 1);
  return (
    <div>
      <PageHead title={window.t('queue_title')} sub={window.t('queue_sub').replace('{0}', D.adminQueue.length)}
        actions={<><Btn kind="ghost" icon="filter">{window.t('btn_more_filters')}</Btn><Btn kind="ghost" icon="download">{window.t('btn_export')}</Btn></>} />

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
            <thead><tr><th>Request ID</th><th>{window.t('tbl_carrier')}</th><th>{window.t('tbl_broker')}</th><th className="right">{window.t('tbl_invoice')}</th><th>{window.t('tbl_risk')}</th><th>{window.t('tbl_verify')}</th><th className="right">{window.t('tbl_advance')}</th><th>{window.t('tbl_status')}</th><th></th></tr></thead>
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
                  <td><Btn kind="ghost" size="sm" onClick={(e) => { e.stopPropagation(); nav("admin/request-review", { id: r.id }); }}>{window.t('btn_review')}</Btn></td>
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
      <PageHead title={window.t('rev_title') + ' · ' + f.id}
        crumb={<div className="crumb"><span className="lnk" onClick={() => nav("admin/review-queue")}>{window.t('rev_crumb')}</span><span className="sep">/</span><span>{f.id}</span></div>}
        sub={`${f.carrier} · ${f.broker} · ${D.fmt(f.invoice)}`}
        actions={decision ? <Badge tone={decision.tone} icon="check">{decision.label}</Badge> : <Badge tone="amber" dot>{window.t('rev_awaiting')}</Badge>} />

      <div className="grid" style={{ gridTemplateColumns: "1fr 320px" }}>
        <div className="stack" style={{ gap: 18 }}>
          <Card>
            <CardHead icon="truck" title={window.t('rev_carrier_risk')} right={<Badge tone="green" dot>Score 90</Badge>} />
            <div className="card-pad" style={{ paddingTop: 6 }}>
              <div className="grid g-2" style={{ gap: 0, columnGap: 28 }}>
                <div><KV k="DOT status" v={<Badge tone="green" icon="check">Active</Badge>} /><KV k="MC authority age" v={D.carrier.mcAge} /><KV k="Safety status" v={<Badge tone="green" dot>{D.carrier.safety}</Badge>} /></div>
                <div><KV k="Fleet size" v={D.carrier.fleet + " trucks"} /><KV k="Prior invoices" v={D.carrier.repeat + " funded"} /><KV k="Invoice behavior" v={<Badge tone="green" dot>No disputes</Badge>} /></div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHead icon="building" title={window.t('rev_broker_risk')} right={<Badge tone="green" dot>Score 88</Badge>} />
            <div className="card-pad" style={{ paddingTop: 6 }}>
              <div className="strong" style={{ marginBottom: 6 }}>{b.name} <span className="tiny muted mono">{b.mc}</span></div>
              <div className="grid g-2" style={{ gap: 0, columnGap: 28 }}>
                <div><KV k="Payment history" v={b.paid + " invoices paid"} /><KV k="Avg days to pay" v={b.avgDays + " days"} /></div>
                <div><KV k="Dispute history" v={b.disputes + " disputes"} /><KV k="Credit risk" v={<Badge tone={b.creditTone} dot>{b.credit}</Badge>} /></div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHead icon="layers" title={window.t('rev_doc_risk')} right={<Badge tone="green" dot>Score 79</Badge>} />
            <div className="card-pad" style={{ paddingTop: 4, paddingBottom: 8 }}>
              <CheckRow status="ok" label="BOL / POD match" meta="BOL-558120" />
              <CheckRow status="ok" label="POD signature detected" meta="R. Mason · Jun 05" />
              <CheckRow status="ok" label="Duplicate invoice check" meta="No prior factoring" />
              <CheckRow status="ok" label="Route / GPS match" meta="88% lane match" />
              <CheckRow status="warn" label="Amount anomaly check" meta="Within 6% of lane avg" />
            </div>
          </Card>

          <Card>
            <CardHead icon="gauge" title={window.t('rev_score_breakdown')} />
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
            <div className="small strong" style={{ marginBottom: 10 }}>{window.t('rev_terms')}</div>
            <KV k="Invoice" v={<span className="mono num">{D.fmt(f.invoice)}</span>} />
            <KV k="Requested advance" v={<span className="mono num strong">{D.fmt(f.advance)} (90%)</span>} />
            <KV k="Wakalah fee" v={<span className="mono num">{D.fmt(f.fee)}</span>} />
            <KV k="Reserve" v={<span className="mono num">{D.fmt(f.reserve)}</span>} />
          </Card>

          <Card pad>
            <div className="small strong" style={{ marginBottom: 12 }}>{window.t('rev_decision')}</div>
            <div className="stack" style={{ gap: 9 }}>
              <Btn kind="primary" block icon="check" onClick={() => decide(window.t('dec_approved'), window.t('toast_approved'), "green")}>{window.t('btn_approve')}</Btn>
              <Btn kind="ghost" block icon="coins" onClick={() => decide(window.t('dec_approved_lower'), window.t('toast_approved_lower'), "amber")}>{window.t('btn_approve_lower')}</Btn>
              <Btn kind="ghost" block icon="file" onClick={() => decide(window.t('dec_more_docs'), window.t('toast_more_docs'), "blue")}>{window.t('btn_more_docs')}</Btn>
              <Btn kind="danger" block icon="x" onClick={() => decide(window.t('dec_rejected'), window.t('toast_rejected'), "red")}>{window.t('btn_reject')}</Btn>
            </div>
            {decision && <div className="row fade-in" style={{ gap: 8, marginTop: 12, padding: "10px 12px", background: "var(--surface-sunken)", borderRadius: "var(--r-sm)" }}><Icon name="checkCircle" size={15} style={{ color: "var(--green-strong)" }} /><span className="tiny strong">{window.t('decision_recorded').replace('{0}', decision.label)}</span></div>}
          </Card>
        </div>
      </div>
      <style>{`@media(max-width:980px){ .portal-body .grid[style*="320px"]{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}

window.AdminApp = AdminApp;
})();
