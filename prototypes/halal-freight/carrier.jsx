/* ============================================================
   Carrier portal — shell, dashboard, onboarding
   ============================================================ */
(function () {
const { useState } = React;
const { Portal, PageHead, Stat, Card, CardHead, Btn, Badge, StatusBadge, Icon,
  Steps, CheckRow, Field, Avatar, KV, useToast } = window;
const D = window.HFF_DATA;

function CarrierApp({ route, params, nav, lang }) {
  const CARRIER_NAV = [
    { items: [
      { id: "carrier/dashboard", icon: "dashboard", label: window.t('cnav_dashboard') },
      { id: "carrier/new-request", icon: "plus", label: window.t('cnav_new_request') },
    ]},
    { label: window.t('cnav_account'), items: [
      { id: "carrier/onboarding", icon: "shieldCheck", label: window.t('cnav_verification') },
    ]},
  ];
  const screens = {
    "carrier/dashboard": <CarrierDashboard nav={nav} />,
    "carrier/onboarding": <CarrierOnboarding nav={nav} />,
    "carrier/new-request": window.FundingWizard ? <window.FundingWizard nav={nav} /> : null,
    "carrier/request-detail": window.RequestDetail ? <window.RequestDetail nav={nav} params={params} /> : null,
  };
  const titles = {
    "carrier/dashboard": [window.t('dash_title'), window.t('dash_sub')],
    "carrier/onboarding": [window.t('onb_title'), window.t('onb_sub')],
    "carrier/new-request": [window.t('wiz_title'), "Submit a completed-load invoice"],
    "carrier/request-detail": [window.t('wiz_title'), params?.id || "FR-20418"],
  };
  const navActive = route === "carrier/request-detail" ? "carrier/dashboard" : route;
  const [pageTitle, pageSub] = titles[route] || ["", ""];
  return (
    <Portal nav={CARRIER_NAV} active={navActive} onNav={(id) => nav(id)}
      title={pageTitle} sub={pageSub} role="Carrier" user="Ali Karimov" onSwitch={() => nav("login")}
      topRight={<Btn kind="soft" size="sm" icon="plus" onClick={() => nav("carrier/new-request")}>{window.t('new_request')}</Btn>}
      navFooter={<NavFooter nav={nav} />}>
      {screens[route]}
    </Portal>
  );
}

function NavFooter({ nav }) {
  return (
    <div style={{ borderTop: "1px solid var(--line)", padding: 12 }}>
      <div className="card" style={{ padding: 14, background: "var(--green-soft)", borderColor: "var(--green-line)" }}>
        <div className="row" style={{ gap: 8 }}><Icon name="shieldCheck" size={16} style={{ color: "var(--green-strong)" }} /><span className="small strong" style={{ color: "var(--green-deep)" }}>{window.t('verified_carrier')}</span></div>
        <div className="tiny muted" style={{ marginTop: 6 }}>{window.t('avail_limit')}</div>
        <div className="num" style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 20, color: "var(--green-deep)" }}>{D.fmt(D.carrier.limit - D.carrier.used)}</div>
        <div className="pbar" style={{ marginTop: 8 }}><span style={{ width: (D.carrier.used / D.carrier.limit * 100) + "%" }} /></div>
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function CarrierDashboard({ nav }) {
  const reqs = D.carrierRequests;
  const counts = {
    funded: reqs.filter(r => ["Funded", "Broker Paid", "Settled", "Approved"].includes(r.status)).reduce((a, r) => a + r.advance, 0),
    pending: reqs.filter(r => ["Under Review", "Draft"].includes(r.status)).length,
    approved: reqs.filter(r => r.status === "Approved").length,
    awaiting: reqs.filter(r => r.status === "Funded").length,
  };
  return (
    <div>
      <PageHead title={window.t('dash_title')} sub={window.t('dash_sub')}
        actions={<><Btn kind="ghost" icon="download">{window.t('btn_export')}</Btn><Btn kind="primary" icon="plus" onClick={() => nav("carrier/new-request")}>{window.t('btn_new_request')}</Btn></>} />

      <div className="grid g-4">
        <Stat label={window.t('stat_funded')} value={D.fmt(counts.funded)} icon="wallet" tone="green" sub={<><Icon name="trending" size={13} style={{ color: "var(--green-strong)" }} /> {window.t('stat_funded_sub')}</>} />
        <Stat label={window.t('stat_pending')} value={counts.pending} icon="clock" tone="amber" sub={window.t('stat_pending_sub')} />
        <Stat label={window.t('stat_approved')} value={counts.approved} icon="checkCircle" tone="green" sub={window.t('stat_approved_sub')} />
        <Stat label={window.t('stat_awaiting')} value={D.fmt(6480)} icon="building" tone="blue" sub={window.t('stat_awaiting_sub')} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 320px", marginTop: 18 }}>
        {/* recent requests */}
        <Card style={{ overflow: "hidden" }}>
          <CardHead icon="list" title={window.t('card_recent')} sub={window.t('card_recent_sub')}
            right={<Btn kind="quiet" size="sm" iconRight="chevronRight">{window.t('btn_view_all')}</Btn>} />
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead><tr><th>{window.t('tbl_request')}</th><th>{window.t('tbl_broker')}</th><th>{window.t('tbl_lane')}</th><th className="right">{window.t('tbl_invoice')}</th><th className="right">{window.t('tbl_advance')}</th><th>{window.t('tbl_status')}</th><th></th></tr></thead>
              <tbody>
                {reqs.map(r => (
                  <tr key={r.id} className="clickable" onClick={() => nav("carrier/request-detail", { id: r.id })}>
                    <td><div className="mono strong">{r.id}</div><div className="tiny muted">{r.date}</div></td>
                    <td><div style={{ maxWidth: 150 }}>{r.broker}</div></td>
                    <td className="small muted nowrap">{r.lane}</td>
                    <td className="right mono num">{D.fmt(r.invoice)}</td>
                    <td className="right mono num strong">{r.advance ? D.fmt(r.advance) : "—"}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td><Icon name="chevronRight" size={16} style={{ color: "var(--ink-4)" }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* funding limit + quick */}
        <div className="stack" style={{ gap: 18 }}>
          <Card pad>
            <div className="row between"><span className="small muted">{window.t('card_limit_label')}</span><Badge tone="green" dot>{window.t('card_limit_active')}</Badge></div>
            <div className="num" style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 700, marginTop: 8 }}>{D.fmt(D.carrier.limit - D.carrier.used)}</div>
            <div className="tiny muted">{window.t('card_limit_total').replace('{0}', D.fmt(D.carrier.limit))}</div>
            <div className="pbar" style={{ marginTop: 12 }}><span style={{ width: (D.carrier.used / D.carrier.limit * 100) + "%" }} /></div>
            <div className="row between" style={{ marginTop: 8 }}><span className="tiny muted">{window.t('card_limit_in_use').replace('{0}', D.fmt(D.carrier.used))}</span><span className="tiny muted">{window.t('card_limit_avail').replace('{0}', Math.round((1 - D.carrier.used / D.carrier.limit) * 100))}</span></div>
            <Btn kind="primary" block icon="plus" style={{ marginTop: 16 }} onClick={() => nav("carrier/new-request")}>{window.t('btn_new_request')}</Btn>
          </Card>
          <Card pad>
            <div className="row" style={{ gap: 11, marginBottom: 4 }}><div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--green-soft)", color: "var(--green-strong)", display: "grid", placeItems: "center" }}><Icon name="truck" size={19} /></div>
              <div><div className="strong" style={{ fontSize: 14 }}>{D.carrier.name}</div><div className="tiny muted">{D.carrier.owner}</div></div></div>
            <div style={{ marginTop: 10 }}>
              <KV k="DOT" v={<span className="mono">{D.carrier.dot}</span>} />
              <KV k="MC" v={<span className="mono">{D.carrier.mc}</span>} />
              <KV k="Fleet size" v={D.carrier.fleet + " trucks"} />
              <KV k="Safety rating" v={<Badge tone="green" dot>{D.carrier.safety}</Badge>} />
            </div>
            <Btn kind="ghost" block size="sm" style={{ marginTop: 12 }} onClick={() => nav("carrier/onboarding")}>{window.t('btn_view_verify')}</Btn>
          </Card>
        </div>
      </div>

      <style>{`@media(max-width:980px){ .portal-body .grid[style*="320px"]{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}

/* ---------------- Onboarding wizard ---------------- */
function CarrierOnboarding({ nav }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [payout, setPayout] = useState("same-day");
  const [bankLinked, setBankLinked] = useState(false);
  const [consents, setConsents] = useState({ kyb: true, fmcsa: true, broker: false });

  const ONB_STEPS = [window.t('onb_step1'), window.t('onb_step2'), window.t('onb_step3'), window.t('onb_step4')];

  const checklist = [
    { label: window.t('chk_dot'), status: "ok", meta: "DOT 3849201" },
    { label: window.t('chk_mc'), status: "ok", meta: "MC-928411" },
    { label: window.t('chk_insurance'), status: step >= 1 ? "ok" : "pend", meta: step >= 1 ? window.t('chk_insurance_done') : window.t('chk_insurance_pend') },
    { label: window.t('chk_bank'), status: bankLinked ? "ok" : "pend", meta: bankLinked ? window.t('chk_bank_done') : window.t('chk_bank_pend') },
    { label: window.t('chk_consent'), status: (consents.kyb && consents.fmcsa && consents.broker) ? "ok" : "pend", meta: (consents.kyb && consents.fmcsa && consents.broker) ? window.t('chk_consent_done') : window.t('chk_consent_pend') },
  ];
  const doneCount = checklist.filter(c => c.status === "ok").length;

  return (
    <div>
      <PageHead title={window.t('onb_title')} sub={window.t('onb_sub')} />
      <div style={{ marginBottom: 22 }}><Steps steps={ONB_STEPS} current={step} /></div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 300px" }}>
        <Card style={{ overflow: "hidden" }}>
          <div className="card-pad fade-in" key={step}>
            {step === 0 && <StepBusiness />}
            {step === 1 && <StepTrucking />}
            {step === 2 && <StepBank payout={payout} setPayout={setPayout} bankLinked={bankLinked} setBankLinked={setBankLinked} />}
            {step === 3 && <StepConsent consents={consents} setConsents={setConsents} />}
          </div>
          <div className="card-head" style={{ borderTop: "1px solid var(--line)", borderBottom: "none", justifyContent: "space-between" }}>
            <Btn kind="ghost" icon="arrowLeft" disabled={step === 0} onClick={() => setStep(s => s - 1)}>{window.t('btn_back')}</Btn>
            {step < ONB_STEPS.length - 1
              ? <Btn kind="primary" iconRight="arrowRight" onClick={() => setStep(s => s + 1)}>{window.t('btn_continue')}</Btn>
              : <Btn kind="primary" icon="check" onClick={() => { toast(window.t('toast_verified')); nav("carrier/dashboard"); }}>{window.t('btn_complete')}</Btn>}
          </div>
        </Card>

        <div className="stack" style={{ gap: 18 }}>
          <Card>
            <CardHead icon="shieldCheck" title={window.t('onb_checklist')} />
            <div className="card-pad" style={{ paddingTop: 6, paddingBottom: 10 }}>
              {checklist.map(c => <CheckRow key={c.label} {...c} />)}
            </div>
            <div style={{ padding: "0 22px 18px" }}>
              <div className="pbar"><span style={{ width: (doneCount / 5 * 100) + "%" }} /></div>
              <div className="tiny muted" style={{ marginTop: 8 }}>{window.t('onb_progress').replace('{0}', doneCount)}</div>
            </div>
          </Card>
          <Card pad style={{ background: "var(--surface-sunken)" }}>
            <div className="row" style={{ gap: 8 }}><Icon name="info" size={15} style={{ color: "var(--green-strong)" }} /><span className="small strong">{window.t('onb_why')}</span></div>
            <p className="tiny muted" style={{ marginTop: 8, lineHeight: 1.6 }}>{window.t('onb_why_text')}</p>
          </Card>
        </div>
      </div>
      <style>{`@media(max-width:980px){ .portal-body .grid[style*="300px"]{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}

function StepBusiness() {
  return (
    <div className="stack" style={{ gap: 16 }}>
      <h3 style={{ fontSize: 18 }}>{window.t('biz_title')}</h3>
      <Field label={window.t('biz_name')} req><input className="input" defaultValue="Baraka Logistics LLC" /></Field>
      <div className="grid g-2">
        <Field label={window.t('biz_type')} req>
          <select className="select"><option>Owner-operator (LLC)</option><option>Sole proprietor</option><option>Small fleet (LLC)</option><option>Corporation (Inc)</option></select>
        </Field>
        <Field label={window.t('biz_ein')} req hint={window.t('biz_ein_hint')}><input className="input mono" defaultValue="87-•••••21" /></Field>
      </div>
      <Field label={window.t('biz_addr')} req><input className="input" defaultValue="1420 Trade Center Blvd, Dallas, TX 75247" /></Field>
      <div className="grid g-2">
        <Field label={window.t('biz_contact')} req><input className="input" defaultValue="Ali Karimov" /></Field>
        <Field label={window.t('biz_phone')} req><input className="input" defaultValue="(469) 555-0148" /></Field>
      </div>
    </div>
  );
}

function StepTrucking() {
  const [uploaded, setUploaded] = useState(false);
  return (
    <div className="stack" style={{ gap: 16 }}>
      <h3 style={{ fontSize: 18 }}>{window.t('trk_title')}</h3>
      <div className="grid g-2">
        <Field label={window.t('trk_dot')} req><input className="input mono" defaultValue="3849201" /></Field>
        <Field label={window.t('trk_mc')} req><input className="input mono" defaultValue="MC-928411" /></Field>
      </div>
      <div className="grid g-2">
        <Field label={window.t('trk_fleet')} req><select className="select" defaultValue="3 trucks"><option>1 truck</option><option>2 trucks</option><option>3 trucks</option><option>4–10 trucks</option><option>10+ trucks</option></select></Field>
        <Field label={window.t('trk_states')} req><input className="input" defaultValue="TX, OK, AR, NM, LA" /></Field>
      </div>
      <Field label={window.t('trk_insurance')} req hint={window.t('trk_insurance_hint')}>
        <div className={"upload " + (uploaded ? "done" : "")} onClick={() => setUploaded(true)}>
          {uploaded ? (
            <div className="row" style={{ gap: 12 }}>
              <div className="check-ico ok"><Icon name="check" size={14} /></div>
              <div><div className="small strong">certificate-of-insurance.pdf</div><div className="tiny muted">{window.t('trk_ins_verified')}</div></div>
              <Badge tone="green" dot>{window.t('trk_ins_valid')}</Badge>
            </div>
          ) : (
            <div><Icon name="upload" size={22} style={{ color: "var(--green-strong)" }} /><div className="small strong" style={{ marginTop: 8 }}>{window.t('trk_upload_ins')}</div><div className="tiny muted">{window.t('trk_upload_ins_sub')}</div></div>
          )}
        </div>
      </Field>
      <div className="row" style={{ gap: 10, padding: "12px 14px", background: "var(--ok-soft)", borderRadius: "var(--r-sm)", border: "1px solid var(--green-line)" }}>
        <Icon name="checkCircle" size={18} style={{ color: "var(--green-strong)" }} />
        <span className="small">{window.t('trk_fmcsa_ok')}</span>
      </div>
    </div>
  );
}

function StepBank({ payout, setPayout, bankLinked, setBankLinked }) {
  const opts = [
    ["instant", window.t('bank_instant'), window.t('bank_instant_sub')],
    ["same-day", window.t('bank_same_day'), window.t('bank_same_day_sub')],
    ["ach", window.t('bank_ach'), window.t('bank_ach_sub')],
  ];
  return (
    <div className="stack" style={{ gap: 18 }}>
      <h3 style={{ fontSize: 18 }}>{window.t('bank_title')}</h3>
      <Field label={window.t('bank_connect')} req>
        <div className={"upload " + (bankLinked ? "done" : "")} onClick={() => setBankLinked(true)} style={{ padding: bankLinked ? 16 : 24 }}>
          {bankLinked ? (
            <div className="row" style={{ gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: "var(--surface)", border: "1px solid var(--green-line)", display: "grid", placeItems: "center", color: "var(--green-strong)" }}><Icon name="bank" size={19} /></div>
              <div><div className="small strong">{window.t('bank_linked')}</div><div className="tiny muted mono">•••• •••• 4821</div></div>
              <Badge tone="green" icon="check">{window.t('bank_verified')}</Badge>
            </div>
          ) : (
            <div><div style={{ width: 44, height: 44, borderRadius: 11, background: "var(--surface)", border: "1px solid var(--line-2)", display: "grid", placeItems: "center", margin: "0 auto", color: "var(--green-strong)" }}><Icon name="bank" size={21} /></div>
              <div className="small strong" style={{ marginTop: 10 }}>{window.t('bank_secure')}</div><div className="tiny muted">{window.t('bank_secure_sub')}</div></div>
          )}
        </div>
      </Field>
      <div className="field">
        <label>{window.t('bank_payout_method')}</label>
        <div className="radio-cards">
          {opts.map(([id, optLabel, optSub]) => (
            <div key={id} className={"radio-card " + (payout === id ? "sel" : "")} onClick={() => setPayout(id)}>
              <div className="rc-title">{payout === id && <Icon name="check" size={15} style={{ color: "var(--green-strong)" }} />}{optLabel}</div>
              <div className="rc-sub">{optSub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepConsent({ consents, setConsents }) {
  const items = [
    ["kyb", window.t('consent_kyb'), window.t('consent_kyb_d')],
    ["fmcsa", window.t('consent_fmcsa'), window.t('consent_fmcsa_d')],
    ["broker", window.t('consent_broker'), window.t('consent_broker_d')],
  ];
  return (
    <div className="stack" style={{ gap: 16 }}>
      <h3 style={{ fontSize: 18 }}>{window.t('consent_title')}</h3>
      <p className="muted small" style={{ marginTop: -6 }}>{window.t('consent_sub')}</p>
      {items.map(([k, consentLabel, d]) => (
        <div key={k} className={"radio-card " + (consents[k] ? "sel" : "")} onClick={() => setConsents(c => ({ ...c, [k]: !c[k] }))} style={{ display: "flex", gap: 13, alignItems: "flex-start", padding: 16 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, border: "2px solid " + (consents[k] ? "var(--green-strong)" : "var(--line-strong)"), background: consents[k] ? "var(--green-strong)" : "transparent", display: "grid", placeItems: "center", flex: "0 0 auto", marginTop: 1 }}>
            {consents[k] && <Icon name="check" size={14} style={{ color: "#fff" }} />}
          </div>
          <div><div className="rc-title">{consentLabel}</div><div className="rc-sub">{d}</div></div>
        </div>
      ))}
    </div>
  );
}

window.CarrierApp = CarrierApp;
})();
