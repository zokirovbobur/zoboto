/* ============================================================
   Screens — Metrics Catalog · Alerts & Deviations · Factor Analysis
   ============================================================ */
const { useState: anUS, useMemo: anUM } = React;

/* ---------------- Metrics Catalog ---------------- */
function MetricsScreen({ navigate, toast, openAI }) {
  const D = window.DATA;
  const [q, setQ] = anUS('');
  const [ind, setInd] = anUS('All');
  const [sel, setSel] = anUS(null);
  const industries = ['All', ...Array.from(new Set(D.METRICS.map(m => m.industry))).filter(x => x !== 'All')];
  const list = anUM(() => D.METRICS.filter(m =>
    (ind === 'All' || m.industry === ind || m.industry === 'All') &&
    (m.name.toLowerCase().includes(q.toLowerCase()) || m.def.toLowerCase().includes(q.toLowerCase()))
  ), [q, ind]);

  return (
    <div className="screen">
      <div className="screen-head row between wrap gap-16">
        <div className="col gap-2"><h1 className="screen-title">Metrics Catalog</h1><div className="screen-sub">{D.METRICS.length} governed indicators · single source of truth</div></div>
        <button className="btn btn-primary" onClick={()=>toast('New metric draft created')}><Icon name="plus" size={15}/>New metric</button>
      </div>

      <div className="row gap-10 wrap" style={{ marginBottom:18 }}>
        <div className="search-box grow" style={{ maxWidth:380 }}><Icon name="search"/><input className="input" placeholder="Search metrics…" value={q} onChange={e=>setQ(e.target.value)} /></div>
        <Segmented options={industries.slice(0,5)} value={ind} onChange={setInd} size="sm" />
        <button className="btn btn-sm"><Icon name="filter" size={14}/>More filters</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {list.map(m => (
          <div key={m.id} className="card card-hover clickable card-pad" onClick={()=>setSel(m)}>
            <div className="row between" style={{ marginBottom:8 }}>
              <div className="row gap-8"><span style={{ fontWeight:700, fontSize:14.5 }}>{m.name}</span>{m.fav && <Icon name="star" size={14} style={{color:'var(--warn)'}}/>}</div>
              <TrustRing value={m.trust} />
            </div>
            <p className="muted" style={{ fontSize:12.5, lineHeight:1.5, margin:'0 0 12px', minHeight:36 }}>{m.def}</p>
            <div className="mono" style={{ fontSize:11.5, color:'var(--accent-2)', background:'var(--surface)', padding:'7px 10px', borderRadius:8, marginBottom:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.formula}</div>
            <div className="row between" style={{ fontSize:11.5 }}>
              <span className="row gap-8 muted"><span className="row gap-4"><Icon name="users" size={12}/>{m.owner}</span><span className="row gap-4"><Icon name="database" size={12}/>{m.source}</span></span>
              <span className="badge badge-neutral">{m.freq}</span>
            </div>
          </div>
        ))}
      </div>

      <Drawer open={!!sel} onClose={()=>setSel(null)} title={sel?.name} sub={sel?.industry+' · '+sel?.dept}
        footer={<><button className="btn" onClick={()=>{setSel(null); navigate('widget');}}><Icon name="widget" size={15}/>Use in dashboard</button><button className="btn btn-primary" onClick={()=>{toast('Metric added to widget builder'); setSel(null); navigate('widget');}}><Icon name="plus" size={15}/>Add to builder</button></>}>
        {sel && <div className="col gap-16">
          <div className="row gap-12" style={{ alignItems:'center' }}>
            <TrustRing value={sel.trust} size={52} />
            <div className="col gap-2"><span style={{ fontWeight:700 }}>Trust score {sel.trust}%</span><span className="dim" style={{ fontSize:12 }}>{sel.trust>=90?'High confidence · validated lineage':'Review recommended'}</span></div>
          </div>
          <div className="card card-pad" style={{ background:'var(--card-2)' }}><div className="eyebrow" style={{marginBottom:6}}>Definition</div><p style={{margin:0,fontSize:13.5,lineHeight:1.55}}>{sel.def}</p></div>
          <div className="card card-pad"><div className="eyebrow" style={{marginBottom:6}}>Formula</div><div className="mono" style={{fontSize:13,color:'var(--accent-2)'}}>{sel.formula}</div></div>
          <div className="grid" style={{ gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[['Data owner',sel.owner,'users'],['Source system',sel.source,'database'],['Update frequency',sel.freq,'clock'],['Department',sel.dept,'layers']].map((r,i)=>(
              <div key={i} className="card card-pad" style={{ padding:'12px 14px' }}><div className="dim row gap-6" style={{fontSize:11.5,marginBottom:5}}><Icon name={r[2]} size={13}/>{r[0]}</div><div style={{fontWeight:600,fontSize:13.5}}>{r[1]}</div></div>
            ))}
          </div>
          <button className="card card-pad row gap-10 clickable card-hover" onClick={()=>{setSel(null); openAI();}} style={{ borderLeft:'2px solid var(--accent-2)' }}>
            <Icon name="sparkle" size={18} style={{color:'var(--accent-2)'}}/><span style={{fontSize:13.5,fontWeight:600}}>Ask AI about this metric</span><Icon name="arrowRight" size={15} style={{marginLeft:'auto',color:'var(--text-3)'}}/>
          </button>
        </div>}
      </Drawer>
    </div>
  );
}

/* ---------------- Alerts & Deviations ---------------- */
function AlertsScreen({ navigate, toast }) {
  const D = window.DATA;
  const [filter, setFilter] = anUS('All');
  const [sel, setSel] = anUS(null);
  const [task, setTask] = anUS(null);
  const tabs = ['All','New','In progress','Resolved'];
  const list = D.ALERTS.filter(a => filter==='All' || a.status===filter);
  const counts = { High:D.ALERTS.filter(a=>a.sev==='High'&&a.status!=='Resolved').length, open:D.ALERTS.filter(a=>a.status!=='Resolved').length, impact:'−29.6 bn' };

  return (
    <div className="screen">
      <div className="screen-head row between wrap gap-16">
        <div className="col gap-2"><h1 className="screen-title">Alerts & Deviations</h1><div className="screen-sub">Automatic deviation detection across all metrics</div></div>
        <button className="btn btn-sm" onClick={()=>toast('Detection rules opened')}><Icon name="settings" size={15}/>Detection rules</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns:'repeat(3,1fr)', marginBottom:18 }}>
        {[['High-severity open',counts.High,'var(--neg)','alerts'],['Total open',counts.open,'var(--warn)','warning'],['Est. business impact',counts.impact+' UZS','var(--accent-2)','cash']].map((s,i)=>(
          <div key={i} className="card card-pad row gap-12"><span style={{width:38,height:38,borderRadius:11,background:`color-mix(in srgb, ${s[2]} 16%, transparent)`,color:s[2],display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name={s[3]} size={19}/></span><div className="col"><span className="mono" style={{fontSize:23,fontWeight:800}}>{s[1]}</span><span className="dim" style={{fontSize:12}}>{s[0]}</span></div></div>
        ))}
      </div>

      <div className="row between wrap gap-12" style={{ marginBottom:14 }}>
        <Segmented options={tabs} value={filter} onChange={setFilter} size="sm" />
        <span className="dim" style={{fontSize:12.5}}>{list.length} alerts</span>
      </div>

      <div className="col gap-10">
        {list.map(a => (
          <div key={a.id} className="card card-hover clickable" onClick={()=>setSel(a)} style={{ padding:'14px 16px', display:'grid', gridTemplateColumns:'8px 1fr auto', gap:14, alignItems:'center' }}>
            <span style={{ width:5, alignSelf:'stretch', borderRadius:99, background:a.sev==='High'?'var(--neg)':a.sev==='Medium'?'var(--warn)':'var(--info)' }} />
            <div className="col gap-6">
              <div className="row gap-10 wrap"><span style={{fontWeight:700,fontSize:14.5}}>{a.title}</span><SevBadge sev={a.sev}/><StatusBadge status={a.status}/></div>
              <div className="row gap-16 wrap muted" style={{fontSize:12}}>
                <span className="row gap-5"><Icon name="cash" size={13}/>Impact <strong style={{color:'var(--text)'}}>{a.impact}</strong></span>
                <span className="row gap-5"><Icon name="factor" size={13}/>{a.cause}</span>
                <span className="row gap-5"><Icon name="users" size={13}/>{a.owner}</span>
                <span className="row gap-5"><Icon name="clock" size={13}/>{a.when}</span>
              </div>
            </div>
            <Icon name="chevron" size={18} style={{color:'var(--text-3)'}}/>
          </div>
        ))}
      </div>

      {/* Alert detail */}
      <Drawer open={!!sel} onClose={()=>setSel(null)} title={sel?.title} sub={sel && `${sel.metric} · ${sel.region}`} width={540}
        footer={sel && <><button className="btn" onClick={()=>setTask(sel)}><Icon name="plus" size={15}/>Create task</button><button className="btn btn-primary" onClick={()=>{setSel(null); navigate('factor');}}><Icon name="factor" size={15}/>Analyze reason</button></>}>
        {sel && <div className="col gap-16">
          <div className="row gap-10 wrap"><SevBadge sev={sel.sev}/><StatusBadge status={sel.status}/><span className="badge badge-neutral"><Icon name="clock" size={12}/>{sel.when}</span></div>
          <div className="grid" style={{gridTemplateColumns:'1fr 1fr',gap:12}}>
            {[['Business impact',sel.impact,'var(--neg)'],['Responsible',sel.owner,'var(--text)'],['Metric',sel.metric,'var(--text)'],['Region',sel.region,'var(--text)']].map((r,i)=>(
              <div key={i} className="card card-pad" style={{padding:'12px 14px'}}><div className="dim" style={{fontSize:11.5,marginBottom:4}}>{r[0]}</div><div style={{fontWeight:700,fontSize:14,color:r[2]}}>{r[1]}</div></div>
            ))}
          </div>
          <div className="card card-pad"><div className="eyebrow" style={{marginBottom:8}}>Deviation timeline</div><AreaChart series={[100,98,96,90,84,82]} planData={[100,100,99,98,98,97]} labels={['W1','W2','W3','W4','W5','W6']} h={150} accent="var(--neg)" accent2="#fb7185"/></div>
          <div className="card card-pad" style={{borderLeft:'2px solid var(--accent-2)'}}><div className="eyebrow" style={{color:'var(--accent-2)',marginBottom:6}}>Root cause preview</div><p style={{margin:0,fontSize:13.5,lineHeight:1.55}}>{sel.cause}. Run factor analysis to decompose the contribution of each driver and get recommended actions.</p></div>
        </div>}
      </Drawer>

      {/* Create task modal */}
      <Modal open={!!task} onClose={()=>setTask(null)} title="Create task" sub={task?.title}
        footer={<><button className="btn" onClick={()=>setTask(null)}>Cancel</button><button className="btn btn-primary" onClick={()=>{setTask(null); setSel(null); toast('Task created & assigned');}}>Create task</button></>}>
        <div className="col gap-14">
          <div><span className="field-label">Task title</span><input className="input" defaultValue={task?`Investigate: ${task.title}`:''}/></div>
          <div className="row gap-12">
            <div className="grow"><span className="field-label">Assignee</span><select className="select"><option>{task?.owner}</option><option>Analytics team</option><option>Risk Office</option></select></div>
            <div className="grow"><span className="field-label">Priority</span><select className="select"><option>{task?.sev}</option><option>High</option><option>Medium</option><option>Low</option></select></div>
          </div>
          <div><span className="field-label">Due date</span><input className="input" type="date" defaultValue="2026-06-16"/></div>
          <div><span className="field-label">Notes</span><textarea className="input" style={{height:80,padding:'10px 12px'}} defaultValue="Investigate the deviation and propose corrective actions."/></div>
        </div>
      </Modal>
    </div>
  );
}

/* ---------------- Factor Analysis ---------------- */
function FactorScreen({ navigate, toast, openAI }) {
  const D = window.DATA;
  const [active, setActive] = anUS(D.FACTORS[0].id);
  const [summary, setSummary] = anUS(false);
  const cur = D.FACTORS.find(f => f.id===active);

  return (
    <div className="screen">
      <div className="screen-head row between wrap gap-16">
        <div className="col gap-2"><h1 className="screen-title">Factor Analysis</h1><div className="screen-sub">Root-cause decomposition · AI-assisted</div></div>
        <div className="row gap-8">
          <button className="btn btn-sm" onClick={()=>{setSummary(true);}}><Icon name="sparkle" size={15}/>Management summary</button>
          <button className="btn btn-sm btn-primary" onClick={()=>{navigate('reports'); toast('Added to report builder');}}><Icon name="download" size={15}/>Export to report</button>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom:16, background:'var(--card-2)', borderLeft:'3px solid var(--neg)' }}>
        <div className="row between wrap gap-10">
          <div className="row gap-12"><span style={{width:42,height:42,borderRadius:12,background:'var(--neg-soft)',color:'var(--neg)',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="trending" size={20} style={{transform:'scaleY(-1)'}}/></span>
            <div className="col gap-2"><span className="dim" style={{fontSize:12}}>Selected problem</span><span style={{fontWeight:800,fontSize:18,letterSpacing:'-0.02em'}}>Sales dropped in Fergana</span></div></div>
          <div className="row gap-24"><div className="col"><span className="dim" style={{fontSize:11.5}}>Deviation</span><span className="mono" style={{fontSize:20,fontWeight:800,color:'var(--neg)'}}>−18%</span></div><div className="col"><span className="dim" style={{fontSize:11.5}}>Impact</span><span className="mono" style={{fontSize:20,fontWeight:800}}>−13.5 bn</span></div></div>
        </div>
      </div>

      <div className="dash-grid">
        {/* factor tree / ranking */}
        <div className="card card-pad" style={{ gridColumn:'span 5' }}>
          <div className="section-title" style={{marginBottom:14}}>Contribution ranking</div>
          <div className="col gap-8">
            {D.FACTORS.map(f => { const on = f.id===active; return (
              <button key={f.id} onClick={()=>setActive(f.id)} className="col gap-6" style={{ padding:'11px 12px', borderRadius:10, textAlign:'left', background: on?'var(--active)':'var(--surface)', border:`1px solid ${on?'var(--accent)':'transparent'}`, transition:'all .15s' }}>
                <div className="row between"><span style={{fontWeight:600,fontSize:13.5}}>{f.name}</span><span className="mono num" style={{fontWeight:700,color:on?'var(--accent-2)':'var(--text)'}}>{f.contrib}%</span></div>
                <div className="meter"><span style={{width:`${f.contrib*2.6}%`,background: on?'linear-gradient(90deg,var(--accent),var(--accent-2))':'linear-gradient(90deg,var(--neg),#fb7185)'}}/></div>
              </button>
            ); })}
          </div>
        </div>

        {/* detail */}
        <div className="col gap-16" style={{ gridColumn:'span 7' }}>
          <div className="card card-pad">
            <div className="row between" style={{marginBottom:12}}><div className="col gap-2"><span className="section-title">{cur.name}</span><span className="dim" style={{fontSize:12}}>{cur.note}</span></div><span className={`badge ${cur.trend==='down'?'badge-neg':'badge-pos'}`}>{cur.delta>0?'+':''}{cur.delta}{Math.abs(cur.delta)<2?'pp':'%'}</span></div>
            <AreaChart series={[100,96,92,88,82,78,74]} planData={[100,99,98,98,97,97,96]} labels={['Apr 1','Apr 8','Apr 15','Apr 22','Apr 29','May 6','May 13']} h={180} accent="var(--neg)" accent2="#fb7185"/>
          </div>
          <div className="row gap-16">
            <div className="card card-pad grow"><div className="eyebrow" style={{marginBottom:10}}>Segment comparison</div>
              <div className="col gap-9">
                {[['Fergana valley',-22,'var(--neg)'],['Other regions',6,'var(--pos)'],['Company avg',2,'var(--text-2)']].map((s,i)=>(
                  <div key={i} className="row between" style={{fontSize:12.5}}><span>{s[0]}</span><span className="mono" style={{fontWeight:700,color:s[2]}}>{s[1]>0?'+':''}{s[1]}%</span></div>
                ))}
              </div>
            </div>
            <div className="card card-pad" style={{borderLeft:'2px solid var(--accent-2)',flex:1.4}}>
              <div className="eyebrow" style={{color:'var(--accent-2)',marginBottom:7}}>AI explanation</div>
              <p style={{margin:0,fontSize:13,lineHeight:1.55}}>Lower foot traffic and stock-outs together explain 65% of the Fergana shortfall. The decline accelerated after a competitor campaign on Apr 14.</p>
            </div>
          </div>
          <div className="card card-pad">
            <div className="eyebrow" style={{marginBottom:10}}>Recommended actions</div>
            <div className="col gap-8">
              {['Replenish top-5 SKUs in 3 flagship branches within 48h','Launch counter-promotion in Fergana valley','Add 2 floor staff during peak hours for 2 weeks'].map((a,i)=>(
                <div key={i} className="row gap-10" style={{padding:'10px 12px',borderRadius:9,background:'var(--surface)'}}><span style={{width:22,height:22,borderRadius:7,background:'var(--accent-soft)',color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0}}>{i+1}</span><span style={{fontSize:13}}>{a}</span><button className="btn btn-sm btn-ghost" style={{marginLeft:'auto'}} onClick={()=>toast('Action assigned')}>Assign</button></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal open={summary} onClose={()=>setSummary(false)} title="Management summary" sub="AI-generated · Fergana sales decline"
        footer={<><button className="btn" onClick={()=>setSummary(false)}>Close</button><button className="btn btn-primary" onClick={()=>{setSummary(false); navigate('reports'); toast('Summary exported to report');}}><Icon name="download" size={15}/>Export</button></>}>
        <div className="col gap-12">
          <span className="badge badge-info" style={{alignSelf:'flex-start'}}><Icon name="sparkle" size={11}/>Generated in 1.4s</span>
          <p style={{margin:0,fontSize:14,lineHeight:1.6}}>Fergana revenue is <strong>18% below plan</strong> (−13.5 bn UZS this quarter). Decomposition shows <strong>65% of the gap</strong> comes from lower foot traffic (−22%) and stock-outs in 3 flagship branches, amplified by a competitor campaign from Apr 14.</p>
          <div className="card card-pad" style={{background:'var(--card-2)'}}><div className="eyebrow" style={{marginBottom:8}}>Recommended decisions</div><ul style={{margin:0,paddingLeft:18,fontSize:13,lineHeight:1.7}}><li>Emergency SKU replenishment (48h)</li><li>Fergana counter-promotion budget approval</li><li>Temporary staffing reinforcement</li></ul></div>
          <p className="dim" style={{margin:0,fontSize:12}}>Expected recovery: ~9–11 bn UZS over the next two months if actions are taken this week.</p>
        </div>
      </Modal>
    </div>
  );
}

Object.assign(window, { MetricsScreen, AlertsScreen, FactorScreen });
