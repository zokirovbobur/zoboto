/* ============================================================
   Broker Confirmation View (external) + success
   ============================================================ */
(function () {
const { useState } = React;
const { Brand, Btn, Badge, Icon, Card, KV, DocThumb, Modal, useToast } = window;
const D = window.HFF_DATA;
const f = D.featured;

function BrokerApp({ route, nav }) {
  const [state, setState] = useState("review"); // review | confirmed | disputed
  return route === "broker/confirm" || route === "broker/success"
    ? <BrokerConfirm nav={nav} state={state} setState={setState} />
    : null;
}

function BrokerConfirm({ nav, state, setState }) {
  const toast = useToast();
  const [disputeOpen, setDisputeOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-2)" }}>
      {/* top status bar */}
      <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", gap: 14 }}>
          <Brand />
          <div style={{ marginLeft: "auto" }} className="row">
            <Badge tone="violet" icon="building">Broker view</Badge>
            <Btn kind="ghost" size="sm" icon="refresh" onClick={() => nav("login")}>Switch role</Btn>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px 64px" }}>
        {state === "confirmed" ? <BrokerSuccess nav={nav} kind="confirmed" />
          : state === "disputed" ? <BrokerSuccess nav={nav} kind="disputed" />
          : (
          <div className="fade-up">
            <div className="row between wrap" style={{ gap: 12, marginBottom: 6 }}>
              <div>
                <div className="eyebrow">Invoice confirmation request</div>
                <h1 style={{ fontSize: 28, marginTop: 8 }}>Please confirm this invoice</h1>
              </div>
              <Badge tone="amber" dot>Action required</Badge>
            </div>
            <p className="lead" style={{ fontSize: 15, maxWidth: 600, marginBottom: 24 }}>
              <strong>{f.carrier}</strong> submitted an invoice for a completed load to Halal Freight Finance. Please confirm the details below so funds can be administered.
            </p>

            <Card style={{ overflow: "hidden", marginBottom: 18 }}>
              <div className="card-head"><div className="stat-ico" style={{ background: "var(--violet-soft)", color: "oklch(0.5 0.12 295)" }}><Icon name="receipt" /></div>
                <div style={{ flex: 1 }}><h3>Invoice {f.id}</h3><div className="sub">Submitted {f.submitted}</div></div>
                <span className="mono num strong" style={{ fontSize: 20 }}>{D.fmt(f.invoice)}</span>
              </div>
              <div className="card-pad">
                <div className="grid g-2" style={{ gap: 0, columnGap: 28 }}>
                  <div><KV k="Carrier" v={f.carrier} /><KV k="Load number" v={<span className="mono">{f.load}</span>} /><KV k="Pickup" v={`${f.pickup} · ${f.pickupDate}`} /></div>
                  <div><KV k="Invoice amount" v={<span className="mono num strong">{D.fmt(f.invoice)}</span>} /><KV k="Delivery" v={`${f.delivery} · ${f.deliveryDate}`} /><KV k="BOL number" v={<span className="mono">{f.bol}</span>} /></div>
                </div>
              </div>
            </Card>

            <Card style={{ marginBottom: 18 }}>
              <div className="card-head"><Icon name="layers" size={18} style={{ color: "var(--ink-3)" }} /><h3 style={{ flex: 1 }}>Attachments</h3><span className="tiny muted">Tap to preview</span></div>
              <div className="card-pad">
                <div className="grid g-2" style={{ gap: 12 }}>
                  <div><DocThumb label="Bill of Lading · PDF" h={96} /><div className="tiny strong center" style={{ marginTop: 6 }}>BOL-558120</div></div>
                  <div><DocThumb label="Proof of Delivery · PDF" h={96} /><div className="tiny strong center" style={{ marginTop: 6 }}>POD — signed Jun 05</div></div>
                </div>
              </div>
            </Card>

            {/* payment instruction */}
            <Card pad style={{ marginBottom: 22, borderColor: "var(--green-line)", background: "var(--green-soft)" }}>
              <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--surface)", color: "var(--green-strong)", display: "grid", placeItems: "center", flex: "0 0 auto" }}><Icon name="bank" size={20} /></div>
                <div style={{ flex: 1 }}>
                  <div className="strong" style={{ color: "var(--green-deep)" }}>Payment instruction</div>
                  <p className="small" style={{ color: "var(--green-deep)", marginTop: 6, lineHeight: 1.55 }}>
                    Please pay this invoice to the <strong>Halal Freight Finance settlement account</strong>. The carrier has assigned payment to us as their agent (Wakil).
                  </p>
                  <div className="grid g-2" style={{ gap: 0, columnGap: 24, marginTop: 10 }}>
                    <KV k="Account name" v="HFF Settlement LLC" />
                    <KV k="Routing" v={<span className="mono">021000021</span>} />
                    <KV k="Account" v={<span className="mono">•••• 7730</span>} />
                    <KV k="Reference" v={<span className="mono">{f.id}</span>} />
                  </div>
                </div>
              </div>
            </Card>

            <div className="row" style={{ gap: 12 }}>
              <Btn kind="primary" size="lg" icon="check" onClick={() => { setState("confirmed"); toast("Invoice confirmed — thank you"); }}>Confirm invoice</Btn>
              <Btn kind="danger" size="lg" icon="x" onClick={() => setDisputeOpen(true)}>Dispute invoice</Btn>
            </div>
          </div>
        )}
      </div>

      <Modal open={disputeOpen} onClose={() => setDisputeOpen(false)} title="Dispute invoice">
        <div className="card-pad">
          <p className="small muted" style={{ marginBottom: 14 }}>Let us know why you're disputing invoice {f.id}. The carrier and our team will be notified.</p>
          <div className="field"><label>Reason</label><select className="select"><option>Amount does not match rate confirmation</option><option>Load not yet delivered</option><option>Missing or invalid POD</option><option>Duplicate invoice</option><option>Other</option></select></div>
          <div style={{ height: 12 }} />
          <div className="field"><label>Notes</label><textarea className="input" rows="3" placeholder="Add any details…"></textarea></div>
        </div>
        <div className="card-head" style={{ borderTop: "1px solid var(--line)", borderBottom: "none", justifyContent: "flex-end" }}>
          <Btn kind="ghost" onClick={() => setDisputeOpen(false)}>Cancel</Btn>
          <Btn kind="danger" icon="flag" onClick={() => { setDisputeOpen(false); setState("disputed"); }}>Submit dispute</Btn>
        </div>
      </Modal>
    </div>
  );
}

function BrokerSuccess({ nav, kind }) {
  const confirmed = kind === "confirmed";
  return (
    <div className="center fade-up" style={{ maxWidth: 540, margin: "40px auto", textAlign: "center" }}>
      <div style={{ width: 86, height: 86, borderRadius: 99, background: confirmed ? "var(--green-soft)" : "var(--warn-soft)", border: "1px solid " + (confirmed ? "var(--green-line)" : "color-mix(in oklch, var(--warn) 35%, var(--line))"), display: "grid", placeItems: "center", margin: "0 auto" }}>
        <div style={{ width: 58, height: 58, borderRadius: 99, background: confirmed ? "var(--green-strong)" : "var(--warn)", display: "grid", placeItems: "center" }}><Icon name={confirmed ? "check" : "flag"} size={30} style={{ color: "#fff" }} /></div>
      </div>
      <h1 style={{ fontSize: 28, marginTop: 18 }}>{confirmed ? "Invoice confirmed" : "Dispute submitted"}</h1>
      <p className="lead" style={{ margin: "12px auto 0", fontSize: 15, maxWidth: 420 }}>
        {confirmed
          ? <>Thank you. Please remit <strong>{D.fmt(f.invoice)}</strong> to the Halal Freight Finance settlement account, reference <strong>{f.id}</strong>.</>
          : <>We've recorded your dispute on invoice <strong>{f.id}</strong>. Our team and the carrier have been notified and will follow up.</>}
      </p>
      {confirmed && (
        <Card pad style={{ margin: "24px 0", textAlign: "left", background: "var(--surface)" }}>
          <KV k="Account name" v="HFF Settlement LLC" />
          <KV k="Routing" v={<span className="mono">021000021</span>} />
          <KV k="Account" v={<span className="mono">•••• 7730</span>} />
          <KV k="Reference" v={<span className="mono">{f.id}</span>} />
          <KV k="Amount due" v={<span className="mono num strong">{D.fmt(f.invoice)}</span>} />
        </Card>
      )}
      <Btn kind="ghost" icon="arrowLeft" onClick={() => nav("login")} style={{ marginTop: confirmed ? 0 : 24 }}>Back to portals</Btn>
    </div>
  );
}

window.BrokerApp = BrokerApp;
})();
