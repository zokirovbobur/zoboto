/* ============================================================
   Broker Confirmation View (external) + success
   ============================================================ */
(function () {
const { useState } = React;
const { Brand, Btn, Badge, Icon, Card, KV, DocThumb, Modal, useToast } = window;
const D = window.HFF_DATA;
const f = D.featured;

function BrokerApp({ route, nav, lang }) {
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
            <Badge tone="violet" icon="building">{window.t('broker_view')}</Badge>
            <Btn kind="ghost" size="sm" icon="refresh" onClick={() => nav("login")}>{window.t('switch_role')}</Btn>
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
                <div className="eyebrow">{window.t('invoice_confirm_title')}</div>
                <h1 style={{ fontSize: 28, marginTop: 8 }}>{window.t('invoice_confirm_h1')}</h1>
              </div>
              <Badge tone="amber" dot>{window.t('action_required')}</Badge>
            </div>
            <p className="lead" style={{ fontSize: 15, maxWidth: 600, marginBottom: 24 }}>
              <strong>{f.carrier}</strong> {window.t('invoice_confirm_lead').replace('{0}', f.carrier).replace(f.carrier + ' ', '')}
            </p>

            <Card style={{ overflow: "hidden", marginBottom: 18 }}>
              <div className="card-head"><div className="stat-ico" style={{ background: "var(--violet-soft)", color: "oklch(0.5 0.12 295)" }}><Icon name="receipt" /></div>
                <div style={{ flex: 1 }}><h3>Invoice {f.id}</h3><div className="sub">Submitted {f.submitted}</div></div>
                <span className="mono num strong" style={{ fontSize: 20 }}>{D.fmt(f.invoice)}</span>
              </div>
              <div className="card-pad">
                <div className="grid g-2" style={{ gap: 0, columnGap: 28 }}>
                  <div><KV k="Carrier" v={f.carrier} /><KV k="Load number" v={<span className="mono">{f.load}</span>} /><KV k="Pickup" v={`${f.pickup} · ${f.pickupDate}`} /></div>
                  <div><KV k={window.t('offer_invoice')} v={<span className="mono num strong">{D.fmt(f.invoice)}</span>} /><KV k="Delivery" v={`${f.delivery} · ${f.deliveryDate}`} /><KV k="BOL number" v={<span className="mono">{f.bol}</span>} /></div>
                </div>
              </div>
            </Card>

            <Card style={{ marginBottom: 18 }}>
              <div className="card-head"><Icon name="layers" size={18} style={{ color: "var(--ink-3)" }} /><h3 style={{ flex: 1 }}>{window.t('attachments')}</h3><span className="tiny muted">{window.t('tap_preview')}</span></div>
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
                  <div className="strong" style={{ color: "var(--green-deep)" }}>{window.t('payment_instruction')}</div>
                  <p className="small" style={{ color: "var(--green-deep)", marginTop: 6, lineHeight: 1.55 }}>
                    {window.t('payment_instruction_body')}
                  </p>
                  <div className="grid g-2" style={{ gap: 0, columnGap: 24, marginTop: 10 }}>
                    <KV k={window.t('kv_account_name')} v="Tijara Settlement LLC" />
                    <KV k={window.t('kv_routing')} v={<span className="mono">021000021</span>} />
                    <KV k={window.t('kv_account')} v={<span className="mono">•••• 7730</span>} />
                    <KV k={window.t('kv_reference')} v={<span className="mono">{f.id}</span>} />
                  </div>
                </div>
              </div>
            </Card>

            <div className="row" style={{ gap: 12 }}>
              <Btn kind="primary" size="lg" icon="check" onClick={() => { setState("confirmed"); toast(window.t('toast_confirmed')); }}>{window.t('btn_confirm')}</Btn>
              <Btn kind="danger" size="lg" icon="x" onClick={() => setDisputeOpen(true)}>{window.t('btn_dispute')}</Btn>
            </div>
          </div>
        )}
      </div>

      <Modal open={disputeOpen} onClose={() => setDisputeOpen(false)} title={window.t('dispute_title')}>
        <div className="card-pad">
          <p className="small muted" style={{ marginBottom: 14 }}>Let us know why you're disputing invoice {f.id}. The carrier and our team will be notified.</p>
          <div className="field"><label>{window.t('dispute_reason')}</label><select className="select"><option>Amount does not match rate confirmation</option><option>Load not yet delivered</option><option>Missing or invalid POD</option><option>Duplicate invoice</option><option>Other</option></select></div>
          <div style={{ height: 12 }} />
          <div className="field"><label>{window.t('dispute_notes')}</label><textarea className="input" rows="3" placeholder={window.t('dispute_placeholder')}></textarea></div>
        </div>
        <div className="card-head" style={{ borderTop: "1px solid var(--line)", borderBottom: "none", justifyContent: "flex-end" }}>
          <Btn kind="ghost" onClick={() => setDisputeOpen(false)}>{window.t('btn_cancel')}</Btn>
          <Btn kind="danger" icon="flag" onClick={() => { setDisputeOpen(false); setState("disputed"); }}>{window.t('btn_submit_dispute')}</Btn>
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
      <h1 style={{ fontSize: 28, marginTop: 18 }}>{confirmed ? window.t('invoice_confirmed') : window.t('dispute_submitted')}</h1>
      <p className="lead" style={{ margin: "12px auto 0", fontSize: 15, maxWidth: 420 }}>
        {confirmed
          ? <>{window.t('broker_confirmed_body').replace('{0}', D.fmt(f.invoice)).replace('{1}', f.id)}</>
          : <>{window.t('broker_disputed_body').replace('{0}', f.id)}</>}
      </p>
      {confirmed && (
        <Card pad style={{ margin: "24px 0", textAlign: "left", background: "var(--surface)" }}>
          <KV k={window.t('kv_account_name')} v="Tijara Settlement LLC" />
          <KV k={window.t('kv_routing')} v={<span className="mono">021000021</span>} />
          <KV k={window.t('kv_account')} v={<span className="mono">•••• 7730</span>} />
          <KV k={window.t('kv_reference')} v={<span className="mono">{f.id}</span>} />
          <KV k={window.t('kv_amount_due')} v={<span className="mono num strong">{D.fmt(f.invoice)}</span>} />
        </Card>
      )}
      <Btn kind="ghost" icon="arrowLeft" onClick={() => nav("login")} style={{ marginTop: confirmed ? 0 : 24 }}>{window.t('btn_back_portals')}</Btn>
    </div>
  );
}

window.BrokerApp = BrokerApp;
})();
