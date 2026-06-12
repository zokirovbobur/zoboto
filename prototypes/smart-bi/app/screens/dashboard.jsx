/* ============================================================
   Screen — Executive Dashboard (showpiece)
   ============================================================ */
const { useState: dUS } = React;

function KpiCard({ k, onClick }) {
  const danger = k.danger;
  return (
    <div className="card card-hover clickable kpi" onClick={onClick} style={{ animation:'fadeUp .5s both' }}>
      <div className="kpi-label">
        <span className="kpi-icon" style={ danger ? { background:'var(--neg-soft)', color:'var(--neg)' } : null }><Icon name={k.icon} size={15} /></span>
        {k.label}
      </div>
      <div className="row between" style={{ alignItems:'flex-end', marginTop:12 }}>
        <div className="kpi-value mono"><CountUp value={k.value} decimals={String(k.value).includes('.')?(k.value.split('.')[1]?.length||1):0} /><span className="unit">{k.unit}</span></div>
      </div>
      <div className="kpi-foot">
        <Delta value={k.delta} suffix={k.id==='growth'||k.id==='risk'?'':(k.unit==='%'?'pp':'%')} />
        <Sparkline data={k.spark} color={ danger ? 'var(--neg)' : (k.trend==='down'?'var(--warn)':'var(--accent-2)')} w={72} h={26} />
      </div>
    </div>
  );
}

function DashboardScreen({ navigate, openAI, toast, role }) {
  const D = window.DATA;
  const [region, setRegion] = dUS(null);
  const [drill, setDrill] = dUS(null);
  const [customize, setCustomize] = dUS(false);
  const [hidden, setHidden] = dUS({});
  const visKpis = D.KPIS.filter(k => !hidden[k.id]);
  const filteredLabel = region ? D.REGIONS.find(r=>r.id===region)?.name : null;

  return (
    <div className="screen">
      {/* header */}
      <div className="screen-head row between wrap gap-16">
        <div className="col gap-2">
          <div className="row gap-10" style={{ alignItems:'center' }}>
            <h1 className="screen-title">Executive Dashboard</h1>
            {filteredLabel && <span className="badge badge-accent">Filtered: {filteredLabel} <button onClick={()=>setRegion(null)} style={{display:'flex',marginLeft:2}}><Icon name="close" size={12}/></button></span>}
          </div>
          <div className="screen-sub">Welcome back, {role.name.split(' ')[0]} · Company performance · Updated 12 min ago</div>
        </div>
        <div className="row gap-8 wrap">
          <Segmented options={[{value:'mtd',label:'MTD'},{value:'qtd',label:'QTD'},{value:'ytd',label:'YTD'}]} value="qtd" onChange={()=>toast('Period changed')} size="sm" />
          <button className="btn btn-sm" onClick={()=>toast('Dashboard exported')}><Icon name="download" size={15}/>Export</button>
          <button className="btn btn-sm" onClick={()=>setCustomize(true)}><Icon name="widget" size={15}/>Customize</button>
          <button className="btn btn-sm btn-accent2" onClick={openAI}><Icon name="sparkle" size={15}/>Ask AI</button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid" style={{ gridTemplateColumns:'repeat(4, 1fr)', marginBottom:16 }}>
        {visKpis.map(k => <KpiCard key={k.id} k={k} onClick={()=>setDrill(k)} />)}
      </div>

      {/* charts row 1 */}
      <div className="dash-grid" style={{ marginBottom:16 }}>
        <div className="card card-pad" style={{ gridColumn:'span 8' }}>
          <div className="row between" style={{ marginBottom:14 }}>
            <div className="col gap-2"><span className="section-title">Revenue trend</span><span className="dim" style={{ fontSize:12 }}>Actual vs plan · bn UZS · 12 months</span></div>
            <div className="row gap-14" style={{ fontSize:12 }}>
              <span className="row gap-6"><span style={{ width:14, height:3, borderRadius:9, background:'linear-gradient(90deg,var(--accent),var(--accent-2))' }} />Actual</span>
              <span className="row gap-6"><span style={{ width:14, height:0, borderTop:'2px dashed var(--text-3)' }} />Plan</span>
            </div>
          </div>
          <AreaChart series={D.REV_TREND} planData={D.PLAN_TREND} labels={D.MONTHS} h={240} />
        </div>
        <div className="card card-pad clickable card-hover" style={{ gridColumn:'span 4' }} onClick={()=>setDrill({label:'AI Insight'})}>
          <div className="row between" style={{ marginBottom:12 }}>
            <span className="section-title row gap-8"><span style={{ width:24, height:24, borderRadius:7, background:'linear-gradient(135deg,var(--accent),var(--accent-2))', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name="sparkle" size={13} style={{color:'#fff'}}/></span>AI Insights</span>
            <span className="badge badge-info">3 new</span>
          </div>
          <div className="col gap-10">
            {D.INSIGHTS.map((ins,i) => (
              <div key={i} className="col gap-6" style={{ padding:'10px 11px', borderRadius:10, background:'var(--surface)', borderLeft:`2px solid ${ins.tone==='neg'?'var(--neg)':ins.tone==='pos'?'var(--pos)':'var(--warn)'}` }}>
                <p style={{ margin:0, fontSize:12.8, lineHeight:1.5 }}>{ins.text}</p>
                <button className="row gap-4" style={{ fontSize:11.5, fontWeight:600, color:'var(--accent-2)' }} onClick={(e)=>{e.stopPropagation(); openAI();}}>{ins.action}<Icon name="arrowRight" size={12}/></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* charts row 2 */}
      <div className="dash-grid" style={{ marginBottom:16 }}>
        <div className="card card-pad" style={{ gridColumn:'span 5' }}>
          <div className="row between" style={{ marginBottom:14 }}>
            <span className="section-title">Regional performance</span>
            <button className="btn btn-sm btn-ghost" onClick={()=>navigate('factor')}>Details<Icon name="arrowRight" size={13}/></button>
          </div>
          <UzbekistanMap regions={D.REGIONS} activeId={region} onClick={(r)=>setRegion(region===r.id?null:r.id)} />
        </div>
        <div className="card card-pad" style={{ gridColumn:'span 4' }}>
          <div className="col gap-2" style={{ marginBottom:14 }}><span className="section-title">Plan vs Fact</span><span className="dim" style={{ fontSize:12 }}>By product line · bn UZS</span></div>
          <BarPlanFact data={D.PRODUCTS} h={210} />
        </div>
        <div className="card card-pad" style={{ gridColumn:'span 3' }}>
          <div className="col gap-2" style={{ marginBottom:8 }}><span className="section-title">Operational efficiency</span></div>
          <div className="center" style={{ flexDirection:'column' }}>
            <Gauge value={87.5} max={100} label="vs 90% target" size={170} />
            <div className="row gap-16" style={{ marginTop:8 }}>
              <div className="col center"><span className="mono" style={{ fontSize:15, fontWeight:700 }}>4.62%</span><span className="dim" style={{ fontSize:11 }}>Conversion</span></div>
              <div style={{ width:1, background:'var(--border)' }} />
              <div className="col center"><span className="mono" style={{ fontSize:15, fontWeight:700, color:'var(--neg)' }}>7</span><span className="dim" style={{ fontSize:11 }}>Alerts</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* charts row 3: products + alerts */}
      <div className="dash-grid">
        <div className="card card-pad" style={{ gridColumn:'span 7' }}>
          <div className="row between" style={{ marginBottom:8 }}>
            <span className="section-title">Product / category performance</span>
            <button className="btn btn-sm btn-ghost" onClick={()=>setDrill({label:'Products'})}>Open report<Icon name="arrowRight" size={13}/></button>
          </div>
          <div className="tbl-scroll">
            <table className="tbl">
              <thead><tr><th>Product line</th><th className="num">Revenue</th><th className="num">Plan</th><th className="num">vs Plan</th><th className="num">Growth</th></tr></thead>
              <tbody>
                {D.PRODUCTS.map((p,i) => { const vp = ((p.rev/p.plan-1)*100); return (
                  <tr key={i} className="clickable" onClick={()=>setDrill({label:p.name})}>
                    <td style={{ fontWeight:600 }}>{p.name}</td>
                    <td className="num mono">{p.rev}</td>
                    <td className="num mono muted">{p.plan}</td>
                    <td className="num"><span className={`badge ${vp>=0?'badge-pos':'badge-neg'}`}>{vp>=0?'+':''}{vp.toFixed(1)}%</span></td>
                    <td className="num"><Delta value={p.growth} /></td>
                  </tr>); })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card card-pad" style={{ gridColumn:'span 5' }}>
          <div className="row between" style={{ marginBottom:12 }}>
            <span className="section-title row gap-8"><Icon name="alerts" size={16} style={{color:'var(--neg)'}}/>Active alerts</span>
            <button className="btn btn-sm btn-ghost" onClick={()=>navigate('alerts')}>View all<Icon name="arrowRight" size={13}/></button>
          </div>
          <div className="col gap-8">
            {D.ALERTS.filter(a=>a.status!=='Resolved').slice(0,4).map(a => (
              <button key={a.id} className="row gap-10 between" onClick={()=>navigate('alerts')} style={{ padding:'10px 11px', borderRadius:10, background:'var(--surface)', textAlign:'left', width:'100%' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--hover)'} onMouseLeave={e=>e.currentTarget.style.background='var(--surface)'}>
                <div className="row gap-10" style={{ minWidth:0 }}>
                  <span style={{ width:6, height:34, borderRadius:99, flexShrink:0, background:a.sev==='High'?'var(--neg)':a.sev==='Medium'?'var(--warn)':'var(--info)' }} />
                  <div className="col gap-2" style={{ minWidth:0 }}>
                    <span style={{ fontSize:12.8, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.title}</span>
                    <span className="dim" style={{ fontSize:11 }}>{a.impact} · {a.owner}</span>
                  </div>
                </div>
                <SevBadge sev={a.sev} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drill-down modal */}
      <Modal open={!!drill} onClose={()=>setDrill(null)} title={drill?.label || ''} sub="Drill-down detail · mock data" width={720}
        footer={<><button className="btn" onClick={()=>setDrill(null)}>Close</button><button className="btn btn-primary" onClick={()=>{setDrill(null); openAI();}}><Icon name="sparkle" size={15}/>Ask AI about this</button></>}>
        <div className="col gap-16">
          <div className="row gap-12 wrap">
            {[['This period','568 bn','+6.8%'],['Last period','532 bn','+2.1%'],['vs Plan','+1.4%','ahead'],['Forecast','591 bn','+4.0%']].map((s,i)=>(
              <div key={i} className="card card-pad" style={{ flex:1, minWidth:130, background:'var(--card-2)' }}>
                <div className="dim" style={{ fontSize:11.5 }}>{s[0]}</div>
                <div className="mono" style={{ fontSize:20, fontWeight:800, marginTop:4 }}>{s[1]}</div>
                <div className="delta up" style={{ fontSize:11.5 }}>{s[2]}</div>
              </div>
            ))}
          </div>
          <div className="card card-pad"><div className="section-title" style={{ marginBottom:10 }}>Trend breakdown</div><AreaChart series={D.REV_TREND} planData={D.PLAN_TREND} labels={D.MONTHS} h={200} /></div>
          <div className="card card-pad" style={{ borderLeft:'2px solid var(--accent-2)' }}>
            <div className="eyebrow" style={{ color:'var(--accent-2)', marginBottom:6 }}>AI interpretation</div>
            <p style={{ margin:0, fontSize:13.5, lineHeight:1.55 }}>Performance is 1.4% ahead of plan, led by mobile transfers and card issuance. Fergana remains the single largest drag; recovering it would add ~13.5 bn UZS this quarter.</p>
          </div>
        </div>
      </Modal>

      {/* Customize panel */}
      <Drawer open={customize} onClose={()=>setCustomize(false)} title="Customize dashboard" sub="Toggle KPI cards and widgets"
        footer={<><button className="btn" onClick={()=>setHidden({})}>Reset</button><button className="btn btn-primary" onClick={()=>{setCustomize(false); toast('Dashboard layout saved');}}>Save layout</button></>}>
        <div className="col gap-10">
          <div className="eyebrow">KPI cards</div>
          {D.KPIS.map(k => (
            <label key={k.id} className="row between card card-pad clickable" style={{ padding:'12px 14px', cursor:'pointer' }}>
              <span className="row gap-10"><span className="kpi-icon"><Icon name={k.icon} size={15}/></span><span style={{ fontWeight:600, fontSize:13.5 }}>{k.label}</span></span>
              <span onClick={(e)=>{e.preventDefault(); setHidden(h=>({...h,[k.id]:!h[k.id]}));}} style={{ width:40, height:23, borderRadius:99, position:'relative', background: hidden[k.id]?'var(--border-strong)':'linear-gradient(90deg,var(--accent),var(--accent-2))', transition:'background .2s' }}>
                <span style={{ position:'absolute', top:2.5, left: hidden[k.id]?2.5:19.5, width:18, height:18, borderRadius:99, background:'#fff', transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,0.3)' }} />
              </span>
            </label>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
window.DashboardScreen = DashboardScreen;
