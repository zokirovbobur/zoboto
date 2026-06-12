/* ============================================================
   Screens — Metrics Catalog · Alerts & Deviations · Factor Analysis
   ============================================================ */
const { useState: anUS, useMemo: anUM } = React;

/* ---------------- Metrics Catalog ---------------- */
function MetricsScreen({ navigate, toast, openAI, t }) {
  t = t || ((k) => (window.I18N.en[k] || k));
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
        <div className="col gap-2">
          <h1 className="screen-title">{t('nav_metrics')}</h1>
          <div className="screen-sub">{D.METRICS.length} {t('metrics_sub_1')}</div>
        </div>
        <button className="btn btn-primary" onClick={()=>toast(t('metric_draft_created'))}><Icon name="plus" size={15}/>{t('btn_new_metric')}</button>
      </div>

      <div className="row gap-10 wrap" style={{ marginBottom:18 }}>
        <div className="search-box grow" style={{ maxWidth:380 }}><Icon name="search"/><input className="input" placeholder={t('search_metrics')} value={q} onChange={e=>setQ(e.target.value)} /></div>
        <Segmented options={industries.slice(0,5)} value={ind} onChange={setInd} size="sm" />
        <button className="btn btn-sm"><Icon name="filter" size={14}/>{t('more_filters')}</button>
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

      <Drawer open={!!sel} onClose={()=>setSel(null)} title={sel?.name} sub={sel && sel.industry+' · '+sel.dept}
        footer={<><button className="btn" onClick={()=>{setSel(null); navigate('widget');}}><Icon name="widget" size={15}/>{t('use_in_dashboard')}</button><button className="btn btn-primary" onClick={()=>{toast(t('metric_added_widget')); setSel(null); navigate('widget');}}><Icon name="plus" size={15}/>{t('add_to_builder')}</button></>}>
        {sel && <div className="col gap-16">
          <div className="row gap-12" style={{ alignItems:'center' }}>
            <TrustRing value={sel.trust} size={52} />
            <div className="col gap-2"><span style={{ fontWeight:700 }}>{t('trust_score')} {sel.trust}%</span><span className="dim" style={{ fontSize:12 }}>{sel.trust>=90?t('high_confidence'):t('review_recommended')}</span></div>
          </div>
          <div className="card card-pad" style={{ background:'var(--card-2)' }}><div className="eyebrow" style={{marginBottom:6}}>{t('lbl_definition')}</div><p style={{margin:0,fontSize:13.5,lineHeight:1.55}}>{sel.def}</p></div>
          <div className="card card-pad"><div className="eyebrow" style={{marginBottom:6}}>{t('lbl_formula')}</div><div className="mono" style={{fontSize:13,color:'var(--accent-2)'}}>{sel.formula}</div></div>
          <div className="grid" style={{ gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[[t('lbl_data_owner'),sel.owner,'users'],[t('lbl_source_system'),sel.source,'database'],[t('lbl_update_freq'),sel.freq,'clock'],[t('lbl_department'),sel.dept,'layers']].map((r,i)=>(
              <div key={i} className="card card-pad" style={{ padding:'12px 14px' }}><div className="dim row gap-6" style={{fontSize:11.5,marginBottom:5}}><Icon name={r[2]} size={13}/>{r[0]}</div><div style={{fontWeight:600,fontSize:13.5}}>{r[1]}</div></div>
            ))}
          </div>
          <button className="card card-pad row gap-10 clickable card-hover" onClick={()=>{setSel(null); openAI();}} style={{ borderLeft:'2px solid var(--accent-2)' }}>
            <Icon name="sparkle" size={18} style={{color:'var(--accent-2)'}}/><span style={{fontSize:13.5,fontWeight:600}}>{t('ask_ai_metric')}</span><Icon name="arrowRight" size={15} style={{marginLeft:'auto',color:'var(--text-3)'}}/>
          </button>
        </div>}
      </Drawer>
    </div>
  );
}

/* ---------------- Alerts & Deviations ---------------- */
function AlertsScreen({ navigate, toast, t }) {
  t = t || ((k) => (window.I18N.en[k] || k));
  const D = window.DATA;
  const [filter, setFilter] = anUS('All');
  const [sel, setSel] = anUS(null);
  const [task, setTask] = anUS(null);
  const tabs = [t('tab_all'), t('tab_new'), t('tab_inprogress'), t('tab_resolved')];
  const tabKeys = ['All','New','In progress','Resolved'];
  const list = D.ALERTS.filter(a => filter==='All' || a.status===filter);
  const counts = { High:D.ALERTS.filter(a=>a.sev==='High'&&a.status!=='Resolved').length, open:D.ALERTS.filter(a=>a.status!=='Resolved').length, impact:'−29.6 bn' };

  return (
    <div className="screen">
      <div className="screen-head row between wrap gap-16">
        <div className="col gap-2">
          <h1 className="screen-title">{t('nav_alerts')}</h1>
          <div className="screen-sub">{t('alerts_sub')}</div>
        </div>
        <button className="btn btn-sm" onClick={()=>toast(t('detection_rules_opened'))}><Icon name="settings" size={15}/>{t('detection_rules')}</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns:'repeat(3,1fr)', marginBottom:18 }}>
        {[[t('high_sev_open'),counts.High,'var(--neg)','alerts'],[t('total_open'),counts.open,'var(--warn)','warning'],[t('est_impact'),counts.impact+' UZS','var(--accent-2)','cash']].map((s,i)=>(
          <div key={i} className="card card-pad row gap-12"><span style={{width:38,height:38,borderRadius:11,background:`color-mix(in srgb, ${s[2]} 16%, transparent)`,color:s[2],display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name={s[3]} size={19}/></span><div className="col"><span className="mono" style={{fontSize:23,fontWeight:800}}>{s[1]}</span><span className="dim" style={{fontSize:12}}>{s[0]}</span></div></div>
        ))}
      </div>

      <div className="row between wrap gap-12" style={{ marginBottom:14 }}>
        <Segmented options={tabs} value={tabs[tabKeys.indexOf(filter) === -1 ? 0 : tabKeys.indexOf(filter)]} onChange={(v)=>setFilter(tabKeys[tabs.indexOf(v)])} size="sm" />
        <span className="dim" style={{fontSize:12.5}}>{list.length} {t('lbl_n_alerts')}</span>
      </div>

      <div className="col gap-10">
        {list.map(a => (
          <div key={a.id} className="card card-hover clickable" onClick={()=>setSel(a)} style={{ padding:'14px 16px', display:'grid', gridTemplateColumns:'8px 1fr auto', gap:14, alignItems:'center' }}>
            <span style={{ width:5, alignSelf:'stretch', borderRadius:99, background:a.sev==='High'?'var(--neg)':a.sev==='Medium'?'var(--warn)':'var(--info)' }} />
            <div className="col gap-6">
              <div className="row gap-10 wrap"><span style={{fontWeight:700,fontSize:14.5}}>{a.title}</span><SevBadge sev={a.sev}/><StatusBadge status={a.status}/></div>
              <div className="row gap-16 wrap muted" style={{fontSize:12}}>
                <span className="row gap-5"><Icon name="cash" size={13}/>{t('lbl_impact')} <strong style={{color:'var(--text)'}}>{a.impact}</strong></span>
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
        footer={sel && <><button className="btn" onClick={()=>setTask(sel)}><Icon name="plus" size={15}/>{t('create_task')}</button><button className="btn btn-primary" onClick={()=>{setSel(null); navigate('factor');}}><Icon name="factor" size={15}/>{t('analyze_reason')}</button></>}>
        {sel && <div className="col gap-16">
          <div className="row gap-10 wrap"><SevBadge sev={sel.sev}/><StatusBadge status={sel.status}/><span className="badge badge-neutral"><Icon name="clock" size={12}/>{sel.when}</span></div>
          <div className="grid" style={{gridTemplateColumns:'1fr 1fr',gap:12}}>
            {[[t('lbl_biz_impact'),sel.impact,'var(--neg)'],[t('lbl_responsible'),sel.owner,'var(--text)'],[t('lbl_metric'),sel.metric,'var(--text)'],[t('lbl_region'),sel.region,'var(--text)']].map((r,i)=>(
              <div key={i} className="card card-pad" style={{padding:'12px 14px'}}><div className="dim" style={{fontSize:11.5,marginBottom:4}}>{r[0]}</div><div style={{fontWeight:700,fontSize:14,color:r[2]}}>{r[1]}</div></div>
            ))}
          </div>
          <div className="card card-pad"><div className="eyebrow" style={{marginBottom:8}}>{t('deviation_timeline')}</div><AreaChart series={[100,98,96,90,84,82]} planData={[100,100,99,98,98,97]} labels={['W1','W2','W3','W4','W5','W6']} h={150} accent="var(--neg)" accent2="#fb7185"/></div>
          <div className="card card-pad" style={{borderLeft:'2px solid var(--accent-2)'}}><div className="eyebrow" style={{color:'var(--accent-2)',marginBottom:6}}>{t('root_cause_preview')}</div><p style={{margin:0,fontSize:13.5,lineHeight:1.55}}>{sel.cause}. {t('root_cause_cta')}</p></div>
        </div>}
      </Drawer>

      {/* Create task modal */}
      <Modal open={!!task} onClose={()=>setTask(null)} title={t('create_task')} sub={task?.title}
        footer={<><button className="btn" onClick={()=>setTask(null)}>{t('cancel')}</button><button className="btn btn-primary" onClick={()=>{setTask(null); setSel(null); toast(t('task_created'));}}>{t('create_task')}</button></>}>
        <div className="col gap-14">
          <div><span className="field-label">{t('task_title_lbl')}</span><input className="input" defaultValue={task?`${t('investigate_prefix')} ${task.title}`:''}/></div>
          <div className="row gap-12">
            <div className="grow"><span className="field-label">{t('lbl_assignee')}</span><select className="select"><option>{task?.owner}</option><option>Analytics team</option><option>Risk Office</option></select></div>
            <div className="grow"><span className="field-label">{t('lbl_priority')}</span><select className="select"><option>{task?.sev}</option><option>High</option><option>Medium</option><option>Low</option></select></div>
          </div>
          <div><span className="field-label">{t('lbl_due_date')}</span><input className="input" type="date" defaultValue="2026-06-16"/></div>
          <div><span className="field-label">{t('lbl_notes')}</span><textarea className="input" style={{height:80,padding:'10px 12px'}} defaultValue={t('default_notes')}/></div>
        </div>
      </Modal>
    </div>
  );
}

/* ---------------- Factor Analysis ---------------- */
function FactorScreen({ navigate, toast, openAI, t }) {
  t = t || ((k) => (window.I18N.en[k] || k));
  const D = window.DATA;
  const [active, setActive] = anUS(D.FACTORS[0].id);
  const [summary, setSummary] = anUS(false);
  const cur = D.FACTORS.find(f => f.id===active);

  return (
    <div className="screen">
      <div className="screen-head row between wrap gap-16">
        <div className="col gap-2">
          <h1 className="screen-title">{t('nav_factor')}</h1>
          <div className="screen-sub">{t('factor_sub')}</div>
        </div>
        <div className="row gap-8">
          <button className="btn btn-sm" onClick={()=>{setSummary(true);}}><Icon name="sparkle" size={15}/>{t('mgmt_summary')}</button>
          <button className="btn btn-sm btn-primary" onClick={()=>{navigate('reports'); toast(t('added_to_report'));}}><Icon name="download" size={15}/>{t('export_to_report')}</button>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom:16, background:'var(--card-2)', borderLeft:'3px solid var(--neg)' }}>
        <div className="row between wrap gap-10">
          <div className="row gap-12"><span style={{width:42,height:42,borderRadius:12,background:'var(--neg-soft)',color:'var(--neg)',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="trending" size={20} style={{transform:'scaleY(-1)'}}/></span>
            <div className="col gap-2"><span className="dim" style={{fontSize:12}}>{t('sel_problem')}</span><span style={{fontWeight:800,fontSize:18,letterSpacing:'-0.02em'}}>{t('problem_title')}</span></div></div>
          <div className="row gap-24"><div className="col"><span className="dim" style={{fontSize:11.5}}>{t('lbl_deviation')}</span><span className="mono" style={{fontSize:20,fontWeight:800,color:'var(--neg)'}}>−18%</span></div><div className="col"><span className="dim" style={{fontSize:11.5}}>{t('lbl_impact')}</span><span className="mono" style={{fontSize:20,fontWeight:800}}>−13.5 bn</span></div></div>
        </div>
      </div>

      <div className="dash-grid">
        {/* factor tree / ranking */}
        <div className="card card-pad" style={{ gridColumn:'span 5' }}>
          <div className="section-title" style={{marginBottom:14}}>{t('contribution_ranking')}</div>
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
            <div className="card card-pad grow"><div className="eyebrow" style={{marginBottom:10}}>{t('segment_comparison')}</div>
              <div className="col gap-9">
                {[['Fergana valley',-22,'var(--neg)'],['Other regions',6,'var(--pos)'],['Company avg',2,'var(--text-2)']].map((s,i)=>(
                  <div key={i} className="row between" style={{fontSize:12.5}}><span>{s[0]}</span><span className="mono" style={{fontWeight:700,color:s[2]}}>{s[1]>0?'+':''}{s[1]}%</span></div>
                ))}
              </div>
            </div>
            <div className="card card-pad" style={{borderLeft:'2px solid var(--accent-2)',flex:1.4}}>
              <div className="eyebrow" style={{color:'var(--accent-2)',marginBottom:7}}>{t('ai_explanation')}</div>
              <p style={{margin:0,fontSize:13,lineHeight:1.55}}>{t('ai_explanation_text')}</p>
            </div>
          </div>
          <div className="card card-pad">
            <div className="eyebrow" style={{marginBottom:10}}>{t('recommended_actions')}</div>
            <div className="col gap-8">
              {[t('factor_action1'), t('factor_action2'), t('factor_action3')].map((a,i)=>(
                <div key={i} className="row gap-10" style={{padding:'10px 12px',borderRadius:9,background:'var(--surface)'}}><span style={{width:22,height:22,borderRadius:7,background:'var(--accent-soft)',color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0}}>{i+1}</span><span style={{fontSize:13}}>{a}</span><button className="btn btn-sm btn-ghost" style={{marginLeft:'auto'}} onClick={()=>toast(t('assign'))}>{t('assign')}</button></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal open={summary} onClose={()=>setSummary(false)} title={t('mgmt_summary')} sub={t('mgmt_summary_sub')}
        footer={<><button className="btn" onClick={()=>setSummary(false)}>{t('close')}</button><button className="btn btn-primary" onClick={()=>{setSummary(false); navigate('reports'); toast(t('report_exported'));}}><Icon name="download" size={15}/>{t('export_to_report')}</button></>}>
        <div className="col gap-12">
          <span className="badge badge-info" style={{alignSelf:'flex-start'}}><Icon name="sparkle" size={11}/>{t('mgmt_summary_badge')}</span>
          <p style={{margin:0,fontSize:14,lineHeight:1.6}}>{t('mgmt_summary_text')}</p>
          <div className="card card-pad" style={{background:'var(--card-2)'}}><div className="eyebrow" style={{marginBottom:8}}>{t('mgmt_rec_title')}</div><ul style={{margin:0,paddingLeft:18,fontSize:13,lineHeight:1.7}}><li>{t('mgmt_rec1')}</li><li>{t('mgmt_rec2')}</li><li>{t('mgmt_rec3')}</li></ul></div>
          <p className="dim" style={{margin:0,fontSize:12}}>{t('mgmt_recovery')}</p>
        </div>
      </Modal>
    </div>
  );
}

Object.assign(window, { MetricsScreen, AlertsScreen, FactorScreen });
