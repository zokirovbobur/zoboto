/* ============================================================
   Admin — Scoring Engine, Shariah Compliance, Collections, Reports
   ============================================================ */
(function () {
const { useState } = React;
const { PageHead, Stat, Card, CardHead, Btn, Badge, StatusBadge, Icon,
  CheckRow, Donut, BarChart, KV, useToast } = window;
const D = window.HFF_DATA;

/* ---------------- Scoring Engine ---------------- */
function ScoringEngine() {
  const toast = useToast();
  const factors = [
    { key: "broker", label: "Broker payment risk", weight: 50, icon: "building", desc: "Days-to-pay, dispute history, credit standing of the paying broker." },
    { key: "carrier", label: "Carrier legitimacy risk", weight: 25, icon: "truck", desc: "DOT/MC active status, authority age, FMCSA safety rating." },
    { key: "document", label: "Document fraud risk", weight: 20, icon: "doc", desc: "BOL/POD match, signature detection, OCR confidence." },
    { key: "route", label: "Route verification risk", weight: 5, icon: "route", desc: "ELD/GPS route reconciliation vs. rate confirmation lane." },
  ];
  const extra = [
    { label: "Duplicate factoring risk", icon: "layers", desc: "Cross-platform check that the invoice has not been factored elsewhere.", status: "ok" },
    { label: "Shariah compliance status", icon: "scale", desc: "Confirms the advance uses Qard Hasan + fixed Wakalah fee — no interest.", status: "ok" },
  ];
  return (
    <div>
      <PageHead title="Scoring Engine" sub="How every funding request is scored and routed"
        actions={<Btn kind="primary" icon="check" onClick={() => toast("Scoring model saved")}>Save model</Btn>} />

      <div className="grid" style={{ gridTemplateColumns: "1fr 300px", marginBottom: 18 }}>
        <Card>
          <CardHead icon="gauge" title="Model weights" sub="How the composite 0–100 score is composed" />
          <div className="card-pad">
            {factors.map(fc => (
              <div key={fc.key} className="row" style={{ gap: 14, padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--green-soft)", color: "var(--green-strong)", display: "grid", placeItems: "center", flex: "0 0 auto" }}><Icon name={fc.icon} size={19} /></div>
                <div style={{ flex: 1 }}>
                  <div className="row between"><span className="strong" style={{ fontSize: 14 }}>{fc.label}</span><span className="mono strong">{fc.weight}%</span></div>
                  <div className="tiny muted" style={{ margin: "3px 0 7px" }}>{fc.desc}</div>
                  <div className="pbar"><span style={{ width: fc.weight + "%" }} /></div>
                </div>
              </div>
            ))}
            <div style={{ paddingTop: 14 }}>
              {extra.map(e => (
                <div key={e.label} className="row" style={{ gap: 14, padding: "10px 0" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface-sunken)", color: "var(--ink-2)", display: "grid", placeItems: "center", flex: "0 0 auto" }}><Icon name={e.icon} size={19} /></div>
                  <div style={{ flex: 1 }}><div className="strong" style={{ fontSize: 14 }}>{e.label}</div><div className="tiny muted">{e.desc}</div></div>
                  <Badge tone="green" dot>Gate</Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card pad>
          <div className="center">
            <Donut value="100%" label="Total weight" segments={[
              { pct: 50, color: "var(--green-strong)" }, { pct: 25, color: "var(--green)" },
              { pct: 20, color: "oklch(0.72 0.09 156)" }, { pct: 5, color: "var(--green-line)" },
            ]} size={150} />
          </div>
          <div className="stack" style={{ gap: 8, marginTop: 18 }}>
            {factors.map((fc, i) => (
              <div key={fc.key} className="row between"><span className="row small" style={{ gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: ["var(--green-strong)", "var(--green)", "oklch(0.72 0.09 156)", "var(--green-line)"][i] }} />{fc.label.split(" ")[0]}</span><span className="mono small strong">{fc.weight}%</span></div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHead icon="list" title="Configurable decision rules" sub="Automatically route or block requests" right={<Btn kind="ghost" size="sm" icon="plus">Add rule</Btn>} />
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>Condition</th><th>Action</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {D.rules.map(r => (
                <tr key={r.cond}>
                  <td className="strong">{r.cond}</td>
                  <td><Badge tone={r.tone}>{r.action}</Badge></td>
                  <td><Badge tone="green" dot>Active</Badge></td>
                  <td className="right"><Btn kind="quiet" size="sm">Edit</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Shariah Compliance ---------------- */
function ShariahModule() {
  return (
    <div>
      <PageHead title="Shariah Compliance" sub="Structure, board review, exceptions & audit trail"
        actions={<Btn kind="ghost" icon="download">Compliance report</Btn>} />

      <Card pad style={{ marginBottom: 18, borderColor: "var(--green-line)", background: "var(--green-soft)" }}>
        <div className="row" style={{ gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: "var(--surface)", color: "var(--green-strong)", display: "grid", placeItems: "center", flex: "0 0 auto" }}><Icon name="scale" size={22} /></div>
          <div>
            <h3 style={{ fontSize: 17, color: "var(--green-deep)" }}>Product structure: Wakalah + Qard Hasan</h3>
            <p style={{ marginTop: 8, lineHeight: 1.6, color: "var(--green-deep)", maxWidth: 760 }}>
              The platform acts as an agent (<strong>Wakil</strong>) for invoice administration and collection. The advance is structured as <strong>Qard Hasan</strong> — a benevolent loan with no markup. The fee is a <strong>fixed service fee</strong>, not interest or a discount on debt.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid g-3" style={{ marginBottom: 18 }}>
        {[["Fixed Wakalah fee logic", "receipt", "A flat agency fee agreed up front — independent of how long the broker takes to pay."], ["No interest calculation", "coins", "No APR, no rate applied to the advance amount at any point."], ["No time-based compounding", "clock", "Fees never increase with time; late broker payment changes nothing you owe."]].map(([t, ic, d]) => (
          <Card key={t} pad>
            <div className="row" style={{ gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--green-soft)", color: "var(--green-strong)", display: "grid", placeItems: "center" }}><Icon name={ic} size={17} /></div><div className="strong" style={{ fontSize: 14 }}>{t}</div></div>
            <p className="small muted" style={{ marginTop: 10, lineHeight: 1.55 }}>{d}</p>
          </Card>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 320px" }}>
        <Card>
          <CardHead icon="refresh" title="Exception log & audit trail" sub="Automated Shariah compliance monitoring" />
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead><tr><th>Date</th><th>Reference</th><th>Event</th><th>Status</th></tr></thead>
              <tbody>
                {D.shariahLog.map((l, i) => (
                  <tr key={i}>
                    <td className="nowrap small muted">{l.date}</td>
                    <td className="mono small">{l.ref}</td>
                    <td>{l.event}</td>
                    <td><Badge tone={l.tone} dot>{l.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="stack" style={{ gap: 18 }}>
          <Card>
            <CardHead icon="shieldCheck" title="Shariah board review" />
            <div className="card-pad" style={{ paddingTop: 6 }}>
              <KV k="Review status" v={<Badge tone="green" icon="check">Approved</Badge>} />
              <KV k="Last review" v="May 2026" />
              <KV k="Next review" v="Nov 2026" />
              <KV k="Open exceptions" v="0" />
            </div>
          </Card>
          <Card>
            <CardHead icon="doc" title="Agreement templates" />
            <div className="card-pad" style={{ paddingTop: 4, paddingBottom: 8 }}>
              {["Wakalah Agency Agreement", "Qard Hasan Advance Agreement", "Payment Assignment Instruction", "Fee Disclosure"].map(t => (
                <div key={t} className="row between" style={{ padding: "8px 0", borderBottom: "1px dashed var(--line)" }}>
                  <span className="small">{t}</span><Badge tone="green" dot>Approved</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <style>{`@media(max-width:980px){ .portal-body .grid[style*="320px"]{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}

/* ---------------- Collections & Settlement ---------------- */
function Collections() {
  const toast = useToast();
  const f = D.featured;
  const awaiting = D.collections.filter(c => c.status === "Awaiting payment").reduce((a, c) => a + c.invoice, 0);
  const overdue = D.collections.filter(c => c.status === "Overdue");
  return (
    <div>
      <PageHead title="Collections & Settlement" sub="Broker payments and reserve release"
        actions={<Btn kind="primary" icon="bell" onClick={() => toast("Payment reminders sent to 2 brokers")}>Send reminders</Btn>} />

      <div className="grid g-4" style={{ marginBottom: 18 }}>
        <Stat label="Awaiting broker payment" value={D.fmt(awaiting)} icon="clock" tone="blue" sub="2 invoices" />
        <Stat label="Overdue" value={overdue.length} icon="alert" tone="red" sub={D.fmt(overdue.reduce((a, c) => a + c.invoice, 0)) + " exposure"} />
        <Stat label="Received this week" value={D.fmt(4100)} icon="checkCircle" tone="green" sub="1 invoice settled today" />
        <Stat label="Reserve to release" value={D.fmt(1240)} icon="coins" tone="green" sub="Across 3 carriers" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 340px" }}>
        <Card style={{ overflow: "hidden" }}>
          <CardHead icon="coins" title="Broker payments" sub="Due dates & reminder schedule" />
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead><tr><th>Request</th><th>Broker</th><th className="right">Invoice</th><th>Due date</th><th>Timeline</th><th>Status</th></tr></thead>
              <tbody>
                {D.collections.map(c => (
                  <tr key={c.id}>
                    <td className="mono strong">{c.id}</td>
                    <td className="nowrap"><span className="small">{c.broker}</span></td>
                    <td className="right mono num">{D.fmt(c.invoice)}</td>
                    <td className="small nowrap">{c.due}</td>
                    <td className="nowrap">
                      {c.daysLeft > 0 ? <span className="tiny muted">in {c.daysLeft}d</span>
                        : c.status === "Overdue" ? <span className="tiny strong" style={{ color: "var(--danger)" }}>{Math.abs(c.daysLeft)}d overdue</span>
                        : <span className="tiny muted">{Math.abs(c.daysLeft)}d ago</span>}
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* settlement calculation */}
        <Card style={{ overflow: "hidden", alignSelf: "flex-start" }}>
          <CardHead icon="handshake" title="Settlement calculation" sub={f.id} />
          <div className="card-pad">
            <div className="offer-line"><span className="ol-label">Broker payment</span><span className="ol-val num">{D.fmt(f.invoice)}</span></div>
            <div className="offer-line"><span className="ol-label muted">− Qard Hasan advance</span><span className="ol-val num" style={{ color: "var(--ink-3)" }}>−{D.fmt(f.advance)}</span></div>
            <div className="offer-line"><span className="ol-label muted">− Fixed Wakalah fee</span><span className="ol-val num" style={{ color: "var(--ink-3)" }}>−{D.fmt(f.fee)}</span></div>
            <div className="offer-line" style={{ background: "var(--green-soft)", margin: "0 -22px", padding: "16px 22px", borderRadius: 0, borderBottom: "none" }}>
              <span className="ol-label strong" style={{ color: "var(--green-deep)" }}>Remaining balance to carrier</span>
              <span className="ol-val num" style={{ fontSize: 22, color: "var(--green-strong)" }}>{D.fmt(f.reserve)}</span>
            </div>
          </div>
          <div className="card-pad" style={{ borderTop: "1px solid var(--line)", background: "var(--surface-sunken)" }}>
            <Btn kind="primary" block icon="handshake" onClick={() => toast("Settlement released — $350 sent to Baraka Logistics")}>Release settlement</Btn>
            <p className="tiny muted center" style={{ marginTop: 10 }}>Reserve is released to the carrier once the broker payment clears.</p>
          </div>
        </Card>
      </div>
      <style>{`@media(max-width:980px){ .portal-body .grid[style*="340px"]{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}

/* ---------------- Reports ---------------- */
function Reports() {
  const r = D.reports;
  return (
    <div>
      <PageHead title="Reports & Analytics" sub="Portfolio performance · last 6 months"
        actions={<><Btn kind="ghost" icon="calendar">Date range</Btn><Btn kind="ghost" icon="download">Export</Btn></>} />

      <div className="grid g-4">
        <Stat label="Funded volume" value="$1.28M" icon="wallet" tone="green" sub="Cumulative, 6 months" />
        <Stat label="Wakalah fee revenue" value={D.fmt(r.wakalahRevenue)} icon="coins" tone="green" sub="3.0% effective service fee" />
        <Stat label="Avg advance %" value={r.avgAdvancePct + "%"} icon="receipt" tone="blue" sub="of invoice value" />
        <Stat label="Default / loss rate" value={r.lossRate + "%"} icon="alert" tone="green" sub="Below 1% target" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", marginTop: 18 }}>
        <Card>
          <CardHead icon="chart" title="Funded volume" sub="Monthly ($K)" />
          <div className="card-pad"><BarChart data={r.monthly} height={180} suffix="K" /></div>
        </Card>
        <Card>
          <CardHead icon="building" title="Broker days-to-pay" sub="Average by broker" />
          <div className="card-pad">
            <div className="stack" style={{ gap: 16, paddingTop: 6 }}>
              {r.brokerDays.map(bd => (
                <div key={bd.b}>
                  <div className="row between" style={{ marginBottom: 6 }}><span className="small strong">{bd.b}</span><span className="mono small strong">{bd.d} days</span></div>
                  <div className="pbar"><span style={{ width: (bd.d / 60 * 100) + "%", background: bd.d > 45 ? "var(--warn)" : "var(--green-strong)" }} /></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid g-3" style={{ marginTop: 18 }}>
        <Card pad>
          <div className="center"><Donut value="78%" label="Auto-approved" segments={[{ pct: 78, color: "var(--green-strong)" }, { pct: 22, color: "var(--warn-soft)" }]} /></div>
          <div className="row between" style={{ marginTop: 16 }}><span className="row small" style={{ gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--green-strong)" }} />Auto-approval</span><span className="mono small strong">{r.autoRatio}%</span></div>
          <div className="row between" style={{ marginTop: 8 }}><span className="row small" style={{ gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--warn)" }} />Manual review</span><span className="mono small strong">{r.manualRatio}%</span></div>
        </Card>
        <Card pad>
          <div className="small strong" style={{ marginBottom: 14 }}>Carrier repeat usage</div>
          <div className="num" style={{ fontFamily: "var(--display)", fontSize: 40, fontWeight: 700, color: "var(--green-strong)" }}>{r.repeatUsage}%</div>
          <div className="small muted" style={{ marginTop: 4 }}>of carriers fund more than one load</div>
          <div className="pbar" style={{ marginTop: 16 }}><span style={{ width: r.repeatUsage + "%" }} /></div>
          <div className="tiny muted" style={{ marginTop: 8 }}>Strong retention signals product-market fit</div>
        </Card>
        <Card pad>
          <div className="small strong" style={{ marginBottom: 14 }}>Shariah compliance exceptions</div>
          <div className="num" style={{ fontFamily: "var(--display)", fontSize: 40, fontWeight: 700, color: "var(--green-strong)" }}>{r.shariahExceptions}</div>
          <div className="small muted" style={{ marginTop: 4 }}>all resolved · 0 open</div>
          <div className="stack" style={{ gap: 6, marginTop: 16 }}>
            <CheckRow status="ok" label="Fee structure verified" meta="100%" />
            <CheckRow status="ok" label="No interest applied" meta="100%" />
          </div>
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { ScoringEngine, ShariahModule, Collections, Reports });
})();
