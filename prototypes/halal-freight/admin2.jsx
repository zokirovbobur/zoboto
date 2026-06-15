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
    { key: "broker", label: window.t('factor_broker'), weight: 50, icon: "building", desc: window.t('factor_broker_d') },
    { key: "carrier", label: window.t('factor_carrier'), weight: 25, icon: "truck", desc: window.t('factor_carrier_d') },
    { key: "document", label: window.t('factor_document'), weight: 20, icon: "doc", desc: window.t('factor_document_d') },
    { key: "route", label: window.t('factor_route'), weight: 5, icon: "route", desc: window.t('factor_route_d') },
  ];
  const extra = [
    { label: window.t('extra_dup'), icon: "layers", desc: window.t('extra_dup_d'), status: "ok" },
    { label: window.t('extra_shariah'), icon: "scale", desc: window.t('extra_shariah_d'), status: "ok" },
  ];
  return (
    <div>
      <PageHead title={window.t('scoring_title')} sub={window.t('scoring_sub')}
        actions={<Btn kind="primary" icon="check" onClick={() => toast(window.t('toast_model_saved'))}>{window.t('btn_save_model')}</Btn>} />

      <div className="grid" style={{ gridTemplateColumns: "1fr 300px", marginBottom: 18 }}>
        <Card>
          <CardHead icon="gauge" title={window.t('scoring_weights')} sub={window.t('scoring_weights_sub')} />
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
        <CardHead icon="list" title={window.t('scoring_rules')} sub={window.t('scoring_rules_sub')} right={<Btn kind="ghost" size="sm" icon="plus">{window.t('btn_add_rule')}</Btn>} />
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead><tr><th>{window.t('tbl_condition')}</th><th>{window.t('tbl_action')}</th><th>{window.t('tbl_status')}</th><th></th></tr></thead>
            <tbody>
              {D.rules.map(r => (
                <tr key={r.cond}>
                  <td className="strong">{r.cond}</td>
                  <td><Badge tone={r.tone}>{r.action}</Badge></td>
                  <td><Badge tone="green" dot>{window.t('col_active')}</Badge></td>
                  <td className="right"><Btn kind="quiet" size="sm">{window.t('btn_edit')}</Btn></td>
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
  const principles = [
    [window.t('shariah_c1'), "receipt", window.t('shariah_c1d')],
    [window.t('shariah_c2'), "coins", window.t('shariah_c2d')],
    [window.t('shariah_c3'), "clock", window.t('shariah_c3d')],
  ];
  return (
    <div>
      <PageHead title={window.t('shariah_title')} sub={window.t('shariah_sub')}
        actions={<Btn kind="ghost" icon="download">{window.t('btn_compliance_report')}</Btn>} />

      <Card pad style={{ marginBottom: 18, borderColor: "var(--green-line)", background: "var(--green-soft)" }}>
        <div className="row" style={{ gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: "var(--surface)", color: "var(--green-strong)", display: "grid", placeItems: "center", flex: "0 0 auto" }}><Icon name="scale" size={22} /></div>
          <div>
            <h3 style={{ fontSize: 17, color: "var(--green-deep)" }}>{window.t('shariah_struct_title')}</h3>
            <p style={{ marginTop: 8, lineHeight: 1.6, color: "var(--green-deep)", maxWidth: 760 }}>
              {window.t('shariah_struct_body')}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid g-3" style={{ marginBottom: 18 }}>
        {principles.map(([princLabel, ic, d]) => (
          <Card key={princLabel} pad>
            <div className="row" style={{ gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--green-soft)", color: "var(--green-strong)", display: "grid", placeItems: "center" }}><Icon name={ic} size={17} /></div><div className="strong" style={{ fontSize: 14 }}>{princLabel}</div></div>
            <p className="small muted" style={{ marginTop: 10, lineHeight: 1.55 }}>{d}</p>
          </Card>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 320px" }}>
        <Card>
          <CardHead icon="refresh" title={window.t('shariah_log')} sub={window.t('shariah_log_sub')} />
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead><tr><th>{window.t('tbl_date')}</th><th>{window.t('tbl_ref')}</th><th>{window.t('tbl_event')}</th><th>{window.t('tbl_status')}</th></tr></thead>
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
            <CardHead icon="shieldCheck" title={window.t('shariah_board')} />
            <div className="card-pad" style={{ paddingTop: 6 }}>
              <KV k={window.t('kv_review_status')} v={<Badge tone="green" icon="check">Approved</Badge>} />
              <KV k={window.t('kv_last_review')} v="May 2026" />
              <KV k={window.t('kv_next_review')} v="Nov 2026" />
              <KV k={window.t('kv_open_exc')} v="0" />
            </div>
          </Card>
          <Card>
            <CardHead icon="doc" title={window.t('shariah_templates')} />
            <div className="card-pad" style={{ paddingTop: 4, paddingBottom: 8 }}>
              {["Wakalah Agency Agreement", "Qard Hasan Advance Agreement", "Payment Assignment Instruction", "Fee Disclosure"].map(tmpl => (
                <div key={tmpl} className="row between" style={{ padding: "8px 0", borderBottom: "1px dashed var(--line)" }}>
                  <span className="small">{tmpl}</span><Badge tone="green" dot>Approved</Badge>
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
      <PageHead title={window.t('coll_title')} sub={window.t('coll_sub')}
        actions={<Btn kind="primary" icon="bell" onClick={() => toast(window.t('toast_reminders'))}>{window.t('btn_send_reminders')}</Btn>} />

      <div className="grid g-4" style={{ marginBottom: 18 }}>
        <Stat label={window.t('coll_stat1')} value={D.fmt(awaiting)} icon="clock" tone="blue" sub={window.t('coll_stat1s')} />
        <Stat label={window.t('coll_stat2')} value={overdue.length} icon="alert" tone="red" sub={D.fmt(overdue.reduce((a, c) => a + c.invoice, 0)) + " exposure"} />
        <Stat label={window.t('coll_stat3')} value={D.fmt(4100)} icon="checkCircle" tone="green" sub={window.t('coll_stat3s')} />
        <Stat label={window.t('coll_stat4')} value={D.fmt(1240)} icon="coins" tone="green" sub={window.t('coll_stat4s')} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 340px" }}>
        <Card style={{ overflow: "hidden" }}>
          <CardHead icon="coins" title={window.t('coll_broker_payments')} sub={window.t('coll_broker_sub')} />
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead><tr><th>{window.t('tbl_request')}</th><th>{window.t('tbl_broker')}</th><th className="right">{window.t('tbl_invoice')}</th><th>{window.t('tbl_due')}</th><th>{window.t('tbl_timeline')}</th><th>{window.t('tbl_status')}</th></tr></thead>
              <tbody>
                {D.collections.map(c => (
                  <tr key={c.id}>
                    <td className="mono strong">{c.id}</td>
                    <td className="nowrap"><span className="small">{c.broker}</span></td>
                    <td className="right mono num">{D.fmt(c.invoice)}</td>
                    <td className="small nowrap">{c.due}</td>
                    <td className="nowrap">
                      {c.daysLeft > 0 ? <span className="tiny muted">{window.t('days_left').replace('{0}', c.daysLeft)}</span>
                        : c.status === "Overdue" ? <span className="tiny strong" style={{ color: "var(--danger)" }}>{window.t('days_overdue').replace('{0}', Math.abs(c.daysLeft))}</span>
                        : <span className="tiny muted">{window.t('days_ago').replace('{0}', Math.abs(c.daysLeft))}</span>}
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
          <CardHead icon="handshake" title={window.t('settlement_title')} sub={f.id} />
          <div className="card-pad">
            <div className="offer-line"><span className="ol-label">{window.t('broker_payment')}</span><span className="ol-val num">{D.fmt(f.invoice)}</span></div>
            <div className="offer-line"><span className="ol-label muted">{window.t('minus_advance')}</span><span className="ol-val num" style={{ color: "var(--ink-3)" }}>−{D.fmt(f.advance)}</span></div>
            <div className="offer-line"><span className="ol-label muted">{window.t('minus_fee')}</span><span className="ol-val num" style={{ color: "var(--ink-3)" }}>−{D.fmt(f.fee)}</span></div>
            <div className="offer-line" style={{ background: "var(--green-soft)", margin: "0 -22px", padding: "16px 22px", borderRadius: 0, borderBottom: "none" }}>
              <span className="ol-label strong" style={{ color: "var(--green-deep)" }}>{window.t('remain_carrier')}</span>
              <span className="ol-val num" style={{ fontSize: 22, color: "var(--green-strong)" }}>{D.fmt(f.reserve)}</span>
            </div>
          </div>
          <div className="card-pad" style={{ borderTop: "1px solid var(--line)", background: "var(--surface-sunken)" }}>
            <Btn kind="primary" block icon="handshake" onClick={() => toast(window.t('toast_released'))}>{window.t('btn_release')}</Btn>
            <p className="tiny muted center" style={{ marginTop: 10 }}>{window.t('release_note')}</p>
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
      <PageHead title={window.t('rep_title')} sub={window.t('rep_sub')}
        actions={<><Btn kind="ghost" icon="calendar">{window.t('btn_date_range')}</Btn><Btn kind="ghost" icon="download">{window.t('btn_export')}</Btn></>} />

      <div className="grid g-4">
        <Stat label={window.t('rep_stat1')} value="$1.28M" icon="wallet" tone="green" sub={window.t('rep_stat1s')} />
        <Stat label={window.t('rep_stat2')} value={D.fmt(r.wakalahRevenue)} icon="coins" tone="green" sub={window.t('rep_stat2s')} />
        <Stat label={window.t('rep_stat3')} value={r.avgAdvancePct + "%"} icon="receipt" tone="blue" sub={window.t('rep_stat3s')} />
        <Stat label={window.t('rep_stat4')} value={r.lossRate + "%"} icon="alert" tone="green" sub={window.t('rep_stat4s')} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr", marginTop: 18 }}>
        <Card>
          <CardHead icon="chart" title={window.t('rep_volume')} sub={window.t('rep_volume_sub')} />
          <div className="card-pad"><BarChart data={r.monthly} height={180} suffix="K" /></div>
        </Card>
        <Card>
          <CardHead icon="building" title={window.t('rep_broker_days')} sub={window.t('rep_broker_days_sub')} />
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
          <div className="center"><Donut value="78%" label={window.t('rep_auto_label')} segments={[{ pct: 78, color: "var(--green-strong)" }, { pct: 22, color: "var(--warn-soft)" }]} /></div>
          <div className="row between" style={{ marginTop: 16 }}><span className="row small" style={{ gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--green-strong)" }} />{window.t('rep_auto_label')}</span><span className="mono small strong">{r.autoRatio}%</span></div>
          <div className="row between" style={{ marginTop: 8 }}><span className="row small" style={{ gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--warn)" }} />{window.t('rep_manual_label')}</span><span className="mono small strong">{r.manualRatio}%</span></div>
        </Card>
        <Card pad>
          <div className="small strong" style={{ marginBottom: 14 }}>{window.t('rep_repeat')}</div>
          <div className="num" style={{ fontFamily: "var(--display)", fontSize: 40, fontWeight: 700, color: "var(--green-strong)" }}>{r.repeatUsage}%</div>
          <div className="small muted" style={{ marginTop: 4 }}>{window.t('rep_repeat_sub')}</div>
          <div className="pbar" style={{ marginTop: 16 }}><span style={{ width: r.repeatUsage + "%" }} /></div>
          <div className="tiny muted" style={{ marginTop: 8 }}>{window.t('rep_repeat_note')}</div>
        </Card>
        <Card pad>
          <div className="small strong" style={{ marginBottom: 14 }}>{window.t('rep_shariah_exc')}</div>
          <div className="num" style={{ fontFamily: "var(--display)", fontSize: 40, fontWeight: 700, color: "var(--green-strong)" }}>{r.shariahExceptions}</div>
          <div className="small muted" style={{ marginTop: 4 }}>{window.t('rep_shariah_exc_sub')}</div>
          <div className="stack" style={{ gap: 6, marginTop: 16 }}>
            <CheckRow status="ok" label={window.t('chk_fee_verified')} meta="100%" />
            <CheckRow status="ok" label={window.t('chk_no_interest')} meta="100%" />
          </div>
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { ScoringEngine, ShariahModule, Collections, Reports });
})();
