/* ============================================================
   Carrier portal — shell, dashboard, onboarding
   ============================================================ */
(function () {
const { useState } = React;
const { Portal, PageHead, Stat, Card, CardHead, Btn, Badge, StatusBadge, Icon,
  Steps, CheckRow, Field, Avatar, KV, useToast } = window;
const D = window.HFF_DATA;

const CARRIER_NAV = [
  { items: [
    { id: "carrier/dashboard", icon: "dashboard", label: "Dashboard" },
    { id: "carrier/new-request", icon: "plus", label: "New Funding Request" },
  ]},
  { label: "Account", items: [
    { id: "carrier/onboarding", icon: "shieldCheck", label: "Verification" },
  ]},
];

function CarrierApp({ route, params, nav }) {
  const screens = {
    "carrier/dashboard": <CarrierDashboard nav={nav} />,
    "carrier/onboarding": <CarrierOnboarding nav={nav} />,
    "carrier/new-request": window.FundingWizard ? <window.FundingWizard nav={nav} /> : null,
    "carrier/request-detail": window.RequestDetail ? <window.RequestDetail nav={nav} params={params} /> : null,
  };
  const titles = {
    "carrier/dashboard": ["Dashboard", "Welcome back, Ali"],
    "carrier/onboarding": ["Carrier Verification", "Complete your profile to unlock funding"],
    "carrier/new-request": ["New Funding Request", "Submit a completed-load invoice"],
    "carrier/request-detail": ["Funding Request", params?.id || "FR-20418"],
  };
  const navActive = route === "carrier/request-detail" ? "carrier/dashboard" : route;
  const [t, s] = titles[route] || ["", ""];
  return (
    <Portal nav={CARRIER_NAV} active={navActive} onNav={(id) => nav(id)}
      title={t} sub={s} role="Carrier" user="Ali Karimov" onSwitch={() => nav("login")}
      topRight={<Btn kind="soft" size="sm" icon="plus" onClick={() => nav("carrier/new-request")}>New request</Btn>}
      navFooter={<NavFooter nav={nav} />}>
      {screens[route]}
    </Portal>
  );
}

function NavFooter({ nav }) {
  return (
    <div style={{ borderTop: "1px solid var(--line)", padding: 12 }}>
      <div className="card" style={{ padding: 14, background: "var(--green-soft)", borderColor: "var(--green-line)" }}>
        <div className="row" style={{ gap: 8 }}><Icon name="shieldCheck" size={16} style={{ color: "var(--green-strong)" }} /><span className="small strong" style={{ color: "var(--green-deep)" }}>Verified carrier</span></div>
        <div className="tiny muted" style={{ marginTop: 6 }}>Available funding limit</div>
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
      <PageHead title="Dashboard" sub="Your funding activity at a glance"
        actions={<><Btn kind="ghost" icon="download">Export</Btn><Btn kind="primary" icon="plus" onClick={() => nav("carrier/new-request")}>Create New Funding Request</Btn></>} />

      <div className="grid g-4">
        <Stat label="Total funded" value={D.fmt(counts.funded)} icon="wallet" tone="green" sub={<><Icon name="trending" size={13} style={{ color: "var(--green-strong)" }} /> 11 requests this quarter</>} />
        <Stat label="Pending requests" value={counts.pending} icon="clock" tone="amber" sub="1 under review · 1 draft" />
        <Stat label="Approved" value={counts.approved} icon="checkCircle" tone="green" sub="Ready for funding" />
        <Stat label="Awaiting broker payment" value={D.fmt(6480)} icon="building" tone="blue" sub="1 invoice · NorthBridge" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 320px", marginTop: 18 }}>
        {/* recent requests */}
        <Card style={{ overflow: "hidden" }}>
          <CardHead icon="list" title="Recent funding requests" sub="Click a request to view detail"
            right={<Btn kind="quiet" size="sm" iconRight="chevronRight">View all</Btn>} />
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead><tr><th>Request</th><th>Broker</th><th>Lane</th><th className="right">Invoice</th><th className="right">Advance</th><th>Status</th><th></th></tr></thead>
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
            <div className="row between"><span className="small muted">Available funding limit</span><Badge tone="green" dot>Active</Badge></div>
            <div className="num" style={{ fontFamily: "var(--display)", fontSize: 32, fontWeight: 700, marginTop: 8 }}>{D.fmt(D.carrier.limit - D.carrier.used)}</div>
            <div className="tiny muted">of {D.fmt(D.carrier.limit)} total estimated limit</div>
            <div className="pbar" style={{ marginTop: 12 }}><span style={{ width: (D.carrier.used / D.carrier.limit * 100) + "%" }} /></div>
            <div className="row between" style={{ marginTop: 8 }}><span className="tiny muted">{D.fmt(D.carrier.used)} in use</span><span className="tiny muted">{Math.round((1 - D.carrier.used / D.carrier.limit) * 100)}% available</span></div>
            <Btn kind="primary" block icon="plus" style={{ marginTop: 16 }} onClick={() => nav("carrier/new-request")}>Create New Funding Request</Btn>
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
            <Btn kind="ghost" block size="sm" style={{ marginTop: 12 }} onClick={() => nav("carrier/onboarding")}>View verification</Btn>
          </Card>
        </div>
      </div>

      <style>{`@media(max-width:980px){ .portal-body .grid[style*="320px"]{ grid-template-columns:1fr !important; } }`}</style>
    </div>
  );
}

/* ---------------- Onboarding wizard ---------------- */
const ONB_STEPS = ["Business Info", "Trucking Verification", "Bank Account", "Compliance Consent"];

function CarrierOnboarding({ nav }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [payout, setPayout] = useState("same-day");
  const [bankLinked, setBankLinked] = useState(false);
  const [consents, setConsents] = useState({ kyb: true, fmcsa: true, broker: false });

  const checklist = [
    { label: "DOT active", status: "ok", meta: "DOT 3849201" },
    { label: "MC active", status: "ok", meta: "MC-928411" },
    { label: "Insurance valid", status: step >= 1 ? "ok" : "pend", meta: step >= 1 ? "Expires 02/2027" : "Awaiting upload" },
    { label: "Bank account verified", status: bankLinked ? "ok" : "pend", meta: bankLinked ? "•••• 4821 · Chase" : "Not linked" },
    { label: "Compliance consent completed", status: (consents.kyb && consents.fmcsa && consents.broker) ? "ok" : "pend", meta: (consents.kyb && consents.fmcsa && consents.broker) ? "All consents signed" : "Pending" },
  ];
  const doneCount = checklist.filter(c => c.status === "ok").length;

  return (
    <div>
      <PageHead title="Carrier Verification" sub="Complete these steps to unlock your funding limit" />
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
            <Btn kind="ghost" icon="arrowLeft" disabled={step === 0} onClick={() => setStep(s => s - 1)}>Back</Btn>
            {step < ONB_STEPS.length - 1
              ? <Btn kind="primary" iconRight="arrowRight" onClick={() => setStep(s => s + 1)}>Continue</Btn>
              : <Btn kind="primary" icon="check" onClick={() => { toast("Carrier profile verified — funding unlocked"); nav("carrier/dashboard"); }}>Complete verification</Btn>}
          </div>
        </Card>

        <div className="stack" style={{ gap: 18 }}>
          <Card>
            <CardHead icon="shieldCheck" title="Verification checklist" />
            <div className="card-pad" style={{ paddingTop: 6, paddingBottom: 10 }}>
              {checklist.map(c => <CheckRow key={c.label} {...c} />)}
            </div>
            <div style={{ padding: "0 22px 18px" }}>
              <div className="pbar"><span style={{ width: (doneCount / 5 * 100) + "%" }} /></div>
              <div className="tiny muted" style={{ marginTop: 8 }}>{doneCount} of 5 verified</div>
            </div>
          </Card>
          <Card pad style={{ background: "var(--surface-sunken)" }}>
            <div className="row" style={{ gap: 8 }}><Icon name="info" size={15} style={{ color: "var(--green-strong)" }} /><span className="small strong">Why we verify</span></div>
            <p className="tiny muted" style={{ marginTop: 8, lineHeight: 1.6 }}>FMCSA, banking and consent checks protect both you and the platform, and keep every advance within our Shariah-compliant structure.</p>
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
      <h3 style={{ fontSize: 18 }}>Business information</h3>
      <Field label="Legal business name" req><input className="input" defaultValue="Baraka Logistics LLC" /></Field>
      <div className="grid g-2">
        <Field label="Company type" req>
          <select className="select"><option>Owner-operator (LLC)</option><option>Sole proprietor</option><option>Small fleet (LLC)</option><option>Corporation (Inc)</option></select>
        </Field>
        <Field label="EIN / SSN" req hint="Used for KYB verification"><input className="input mono" defaultValue="87-•••••21" /></Field>
      </div>
      <Field label="Business address" req><input className="input" defaultValue="1420 Trade Center Blvd, Dallas, TX 75247" /></Field>
      <div className="grid g-2">
        <Field label="Contact person" req><input className="input" defaultValue="Ali Karimov" /></Field>
        <Field label="Phone" req><input className="input" defaultValue="(469) 555-0148" /></Field>
      </div>
    </div>
  );
}

function StepTrucking() {
  const [uploaded, setUploaded] = useState(false);
  return (
    <div className="stack" style={{ gap: 16 }}>
      <h3 style={{ fontSize: 18 }}>Trucking verification</h3>
      <div className="grid g-2">
        <Field label="DOT Number" req><input className="input mono" defaultValue="3849201" /></Field>
        <Field label="MC Number" req><input className="input mono" defaultValue="MC-928411" /></Field>
      </div>
      <div className="grid g-2">
        <Field label="Fleet size" req><select className="select" defaultValue="3 trucks"><option>1 truck</option><option>2 trucks</option><option>3 trucks</option><option>4–10 trucks</option><option>10+ trucks</option></select></Field>
        <Field label="Operating states" req><input className="input" defaultValue="TX, OK, AR, NM, LA" /></Field>
      </div>
      <Field label="Insurance certificate" req hint="COI showing active cargo & liability coverage">
        <div className={"upload " + (uploaded ? "done" : "")} onClick={() => setUploaded(true)}>
          {uploaded ? (
            <div className="row" style={{ gap: 12 }}>
              <div className="check-ico ok"><Icon name="check" size={14} /></div>
              <div><div className="small strong">certificate-of-insurance.pdf</div><div className="tiny muted">Verified · expires 02/2027</div></div>
              <Badge tone="green" dot>Valid</Badge>
            </div>
          ) : (
            <div><Icon name="upload" size={22} style={{ color: "var(--green-strong)" }} /><div className="small strong" style={{ marginTop: 8 }}>Upload insurance certificate</div><div className="tiny muted">PDF or image · click to simulate upload</div></div>
          )}
        </div>
      </Field>
      <div className="row" style={{ gap: 10, padding: "12px 14px", background: "var(--ok-soft)", borderRadius: "var(--r-sm)", border: "1px solid var(--green-line)" }}>
        <Icon name="checkCircle" size={18} style={{ color: "var(--green-strong)" }} />
        <span className="small">FMCSA check passed — <strong>authority active</strong>, safety rating <strong>Satisfactory</strong>, MC age <strong>4y 2m</strong>.</span>
      </div>
    </div>
  );
}

function StepBank({ payout, setPayout, bankLinked, setBankLinked }) {
  const opts = [["instant", "Instant Payout", "Within minutes · 1% express"], ["same-day", "Same-Day ACH", "By 5pm ET · no fee"], ["ach", "Standard ACH", "1–2 business days · no fee"]];
  return (
    <div className="stack" style={{ gap: 18 }}>
      <h3 style={{ fontSize: 18 }}>Bank account & payout</h3>
      <Field label="Connect your payout account" req>
        <div className={"upload " + (bankLinked ? "done" : "")} onClick={() => setBankLinked(true)} style={{ padding: bankLinked ? 16 : 24 }}>
          {bankLinked ? (
            <div className="row" style={{ gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: "var(--surface)", border: "1px solid var(--green-line)", display: "grid", placeItems: "center", color: "var(--green-strong)" }}><Icon name="bank" size={19} /></div>
              <div><div className="small strong">Chase Business Checking</div><div className="tiny muted mono">•••• •••• 4821</div></div>
              <Badge tone="green" icon="check">Verified</Badge>
            </div>
          ) : (
            <div><div style={{ width: 44, height: 44, borderRadius: 11, background: "var(--surface)", border: "1px solid var(--line-2)", display: "grid", placeItems: "center", margin: "0 auto", color: "var(--green-strong)" }}><Icon name="bank" size={21} /></div>
              <div className="small strong" style={{ marginTop: 10 }}>Securely connect your bank</div><div className="tiny muted">Bank-grade connection · click to simulate</div></div>
          )}
        </div>
      </Field>
      <div className="field">
        <label>Default payout method</label>
        <div className="radio-cards">
          {opts.map(([id, t, s]) => (
            <div key={id} className={"radio-card " + (payout === id ? "sel" : "")} onClick={() => setPayout(id)}>
              <div className="rc-title">{payout === id && <Icon name="check" size={15} style={{ color: "var(--green-strong)" }} />}{t}</div>
              <div className="rc-sub">{s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepConsent({ consents, setConsents }) {
  const items = [
    ["kyb", "KYB / KYC verification", "Authorize identity and business verification checks."],
    ["fmcsa", "FMCSA / DOT / MC checks", "Authorize ongoing authority and safety status monitoring."],
    ["broker", "Broker & invoice verification", "Authorize us to verify invoices and contact brokers as your agent (Wakil)."],
  ];
  return (
    <div className="stack" style={{ gap: 16 }}>
      <h3 style={{ fontSize: 18 }}>Compliance consent</h3>
      <p className="muted small" style={{ marginTop: -6 }}>Required to keep every advance within our Wakalah + Qard Hasan structure.</p>
      {items.map(([k, t, d]) => (
        <div key={k} className={"radio-card " + (consents[k] ? "sel" : "")} onClick={() => setConsents(c => ({ ...c, [k]: !c[k] }))} style={{ display: "flex", gap: 13, alignItems: "flex-start", padding: 16 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, border: "2px solid " + (consents[k] ? "var(--green-strong)" : "var(--line-strong)"), background: consents[k] ? "var(--green-strong)" : "transparent", display: "grid", placeItems: "center", flex: "0 0 auto", marginTop: 1 }}>
            {consents[k] && <Icon name="check" size={14} style={{ color: "#fff" }} />}
          </div>
          <div><div className="rc-title">{t}</div><div className="rc-sub">{d}</div></div>
        </div>
      ))}
    </div>
  );
}

window.CarrierApp = CarrierApp;
})();
