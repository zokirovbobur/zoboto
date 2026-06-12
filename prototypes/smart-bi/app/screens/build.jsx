/* ============================================================
   Screens — Dashboard Library · Widget Builder · Templates · Reports
   ============================================================ */
const { useState: bUS } = React;

/* ---------------- Dashboard Library ---------------- */
function LibraryScreen({ navigate, toast, t }) {
  t = t || ((k) => (window.I18N.en[k] || k));
  const D = window.DATA;
  const [view, setView] = bUS('grid');
  const [share, setShare] = bUS(null);
  const [favs, setFavs] = bUS({ ceo:true });
  const [menu, setMenu] = bUS(null);

  return (
    <div className="screen">
      <div className="screen-head row between wrap gap-16">
        <div className="col gap-2">
          <h1 className="screen-title">{t('nav_library')}</h1>
          <div className="screen-sub">{D.DASHBOARDS.length} dashboards · shared across the organization</div>
        </div>
        <div className="row gap-8">
          <Segmented options={[{value:'grid',icon:'grid',label:''},{value:'list',icon:'list',label:''}]} value={view} onChange={setView} size="sm" />
          <button className="btn btn-primary" onClick={()=>navigate('widget')}><Icon name="plus" size={15}/>{t('btn_new_dashboard')}</button>
        </div>
      </div>

      {view==='grid' ? (
        <div className="grid" style={{ gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))' }}>
          {D.DASHBOARDS.map(d => (
            <div key={d.id} className="card card-hover" style={{ overflow:'hidden' }}>
              <div className="clickable" onClick={()=>{toast(`Opening ${d.name}`); navigate('dashboard');}} style={{ height:128, position:'relative', background:`linear-gradient(135deg, ${d.accent}22, var(--surface))`, borderBottom:'1px solid var(--border)', padding:14, overflow:'hidden' }}>
                <div className="row gap-8" style={{ position:'absolute', top:12, left:12 }}><span className="badge" style={{ background:`${d.accent}22`, color:d.accent, borderColor:'transparent' }}>{d.tag}</span></div>
                <div style={{ position:'absolute', inset:'40px 14px 14px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, opacity:0.85 }}>
                  <div className="card" style={{ padding:8 }}><div className="skeleton" style={{height:6,width:'50%',marginBottom:6}}/><MiniBars data={[40,70,55,80]} h={28}/></div>
                  <div className="card" style={{ padding:8 }}><Sparkline data={[30,45,40,60,75]} color={d.accent} w={120} h={42}/></div>
                </div>
              </div>
              <div className="card-pad">
                <div className="row between" style={{ marginBottom:8 }}>
                  <span style={{ fontWeight:700, fontSize:14.5 }}>{d.name}</span>
                  <div className="row gap-2">
                    <button className="iconbtn" onClick={()=>setFavs(f=>({...f,[d.id]:!f[d.id]}))}><Icon name="star" size={16} style={{color:favs[d.id]?'var(--warn)':'var(--text-3)', fill:favs[d.id]?'var(--warn)':'none'}}/></button>
                    <div style={{position:'relative'}}>
                      <button className="iconbtn" onClick={()=>setMenu(menu===d.id?null:d.id)}><Icon name="more" size={16}/></button>
                      {menu===d.id && <>
                        <div style={{position:'fixed',inset:0,zIndex:50}} onClick={()=>setMenu(null)}/>
                        <div className="card scale-in" style={{position:'absolute',right:0,top:34,width:180,padding:6,zIndex:51,background:'var(--elevated)',boxShadow:'var(--shadow-3)'}}>
                          {[[t('menu_open'),'eye',()=>navigate('dashboard')],[t('menu_duplicate'),'copy',()=>toast(t('dashboard_duplicated'))],[t('menu_share'),'share',()=>setShare(d)],[t('menu_export_pdf'),'download',()=>toast(t('report_exported'))]].map((it,i)=>(
                            <button key={i} className="row gap-10" style={{width:'100%',padding:'8px 10px',borderRadius:7,fontSize:13,color:'var(--text-2)'}} onClick={()=>{setMenu(null); it[2]();}} onMouseEnter={e=>e.currentTarget.style.background='var(--hover)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><Icon name={it[1]} size={15}/>{it[0]}</button>
                          ))}
                        </div>
                      </>}
                    </div>
                  </div>
                </div>
                <div className="row between muted" style={{ fontSize:11.5 }}>
                  <span className="row gap-5"><span className="avatar" style={{width:20,height:20,fontSize:9,borderRadius:6,background:`linear-gradient(135deg,${d.accent},var(--accent-2))`}}>{d.owner.split(' ').map(w=>w[0]).join('').slice(0,2)}</span>{d.owner}</span>
                  <span className="row gap-10"><span className="row gap-4"><Icon name="widget" size={12}/>{d.widgets}</span><span className="row gap-4"><Icon name="lock" size={12}/>{d.access}</span></span>
                </div>
                <div className="dim" style={{ fontSize:11, marginTop:6 }}>{t('tbl_updated')} {d.updated}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ overflow:'hidden' }}>
          <table className="tbl">
            <thead><tr><th>{t('tbl_dashboard')}</th><th>{t('tbl_owner')}</th><th>{t('tbl_access')}</th><th className="num">{t('tbl_widgets')}</th><th>{t('tbl_updated')}</th><th></th></tr></thead>
            <tbody>{D.DASHBOARDS.map(d=>(
              <tr key={d.id} className="clickable" onClick={()=>navigate('dashboard')}>
                <td><span className="row gap-8"><span style={{width:8,height:8,borderRadius:3,background:d.accent}}/><strong>{d.name}</strong><span className="badge" style={{background:`${d.accent}22`,color:d.accent,borderColor:'transparent'}}>{d.tag}</span></span></td>
                <td className="muted">{d.owner}</td><td><span className="badge badge-neutral">{d.access}</span></td><td className="num mono">{d.widgets}</td><td className="muted">{d.updated}</td>
                <td><button className="iconbtn" onClick={e=>{e.stopPropagation(); setShare(d);}}><Icon name="share" size={15}/></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      <Modal open={!!share} onClose={()=>setShare(null)} title={t('share_dashboard')} sub={share?.name}
        footer={<><button className="btn" onClick={()=>setShare(null)}>{t('cancel')}</button><button className="btn btn-primary" onClick={()=>{setShare(null); toast(t('dashboard_shared'));}}>{t('share')}</button></>}>
        <div className="col gap-14">
          <div><span className="field-label">{t('invite_people')}</span><input className="input" placeholder="name@navigator.uz"/></div>
          <div><span className="field-label">{t('access_level')}</span><select className="select"><option>{t('can_view')}</option><option>{t('can_edit')}</option><option>{t('full_access')}</option></select></div>
          <div className="card card-pad" style={{background:'var(--card-2)'}}>
            <div className="row between" style={{marginBottom:10}}><span style={{fontSize:13,fontWeight:600}}>{t('people_access')}</span></div>
            <div className="col gap-8">
              {window.DATA.USERS.slice(0,3).map(u=>(
                <div key={u.id} className="row between"><span className="row gap-8"><span className="avatar" style={{width:28,height:28,fontSize:11,background:`linear-gradient(135deg,${u.color},var(--accent-2))`}}>{u.name.split(' ').map(w=>w[0]).join('')}</span><div className="col"><span style={{fontSize:12.5,fontWeight:600}}>{u.name}</span><span className="dim" style={{fontSize:11}}>{u.role}</span></div></span><span className="badge badge-neutral">{t('can_view')}</span></div>
              ))}
            </div>
          </div>
          <div className="row gap-8" style={{padding:'10px 12px',borderRadius:9,background:'var(--surface)',border:'1px solid var(--border)'}}><Icon name="link" size={16} style={{color:'var(--accent)'}}/><span className="mono" style={{fontSize:12,color:'var(--text-2)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>navigator.uz/d/{share?.id}-share</span><button className="btn btn-sm" onClick={()=>toast(t('link_copied'))}>{t('copy')}</button></div>
        </div>
      </Modal>
    </div>
  );
}

/* ---------------- Widget Builder ---------------- */
function WidgetScreen({ navigate, toast, t }) {
  t = t || ((k) => (window.I18N.en[k] || k));
  const D = window.DATA;
  const [src, setSrc] = bUS('Banking Core');
  const [metric, setMetric] = bUS('Net Revenue');
  const [dim, setDim] = bUS('Region');
  const [chart, setChart] = bUS('bar');
  const charts = [['kpi','KPI card','target'],['line','Line','trending'],['bar','Bar','metrics'],['donut','Donut','pie'],['table','Table','table'],['funnel','Funnel','funnel'],['heatmap','Heatmap','grid'],['gauge','Gauge','gauge']];

  const renderPreview = () => {
    if (chart==='kpi') return <div className="kpi" style={{padding:0}}><div className="kpi-label"><span className="kpi-icon"><Icon name="cash" size={15}/></span>{metric}</div><div className="kpi-value mono" style={{marginTop:14}}>568.1<span className="unit">bn UZS</span></div><div className="kpi-foot"><Delta value={6.8}/><Sparkline data={[440,489,512,548,568]} w={90} h={30}/></div></div>;
    if (chart==='line') return <AreaChart series={D.REV_TREND} planData={D.PLAN_TREND} labels={D.MONTHS} h={240}/>;
    if (chart==='bar') return <BarPlanFact data={D.PRODUCTS} h={240}/>;
    if (chart==='donut') return <Donut data={D.REGIONS.slice(0,5).map((r,i)=>({label:r.name,value:r.rev,color:['#3b82f6','#22d3ee','#34d399','#a78bfa','#f59e0b'][i]}))} center={{value:'568',label:'bn UZS'}} size={200}/>;
    if (chart==='table') return <table className="tbl"><thead><tr><th>{dim}</th><th className="num">{metric}</th><th className="num">Δ</th></tr></thead><tbody>{D.REGIONS.map(r=><tr key={r.id}><td>{r.name}</td><td className="num mono">{r.rev}</td><td className="num"><Delta value={r.growth}/></td></tr>)}</tbody></table>;
    if (chart==='funnel') return <Funnel data={[{label:'Visits',value:128400},{label:'Product views',value:64200},{label:'Add to cart',value:28100},{label:'Checkout',value:9800},{label:'Purchase',value:5930}]}/>;
    if (chart==='heatmap') return <Heatmap rows={D.REGIONS.slice(0,5).map(r=>r.name)} cols={['Jan','Feb','Mar','Apr','May','Jun']} values={D.REGIONS.slice(0,5).map(()=>Array.from({length:6},()=>Math.random()))}/>;
    if (chart==='gauge') return <div className="center"><Gauge value={87} max={100} label={metric} size={220}/></div>;
  };

  return (
    <div className="screen" style={{ maxWidth:'none' }}>
      <div className="screen-head row between wrap gap-16">
        <div className="col gap-2">
          <h1 className="screen-title">{t('nav_widget')}</h1>
          <div className="screen-sub">{t('widget_sub')}</div>
        </div>
        <div className="row gap-8">
          <button className="btn btn-sm" onClick={()=>toast(t('ai_suggested'))}><Icon name="sparkle" size={15}/>{t('ai_suggestion')}</button>
          <button className="btn btn-sm btn-primary" onClick={()=>toast(t('widget_saved'))}><Icon name="check" size={15}/>{t('save_widget')}</button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns:'300px 1fr', gap:18, alignItems:'start' }}>
        {/* config */}
        <div className="card card-pad col gap-16">
          <div><span className="field-label">{t('lbl_data_source')}</span><select className="select" value={src} onChange={e=>setSrc(e.target.value)}>{D.CONNECTORS.filter(c=>c.status==='connected').map(c=><option key={c.id}>{c.name}</option>)}</select></div>
          <div><span className="field-label">{t('lbl_metric')}</span><select className="select" value={metric} onChange={e=>setMetric(e.target.value)}>{D.METRICS.map(m=><option key={m.id}>{m.name}</option>)}</select></div>
          <div><span className="field-label">{t('lbl_dimension')}</span><select className="select" value={dim} onChange={e=>setDim(e.target.value)}><option>Region</option><option>Product</option><option>Time</option><option>Branch</option><option>Customer segment</option></select></div>
          <div><span className="field-label">{t('lbl_chart_type')}</span>
            <div className="grid" style={{ gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {charts.map(c=>(
                <button key={c[0]} onClick={()=>setChart(c[0])} className="col center gap-6" style={{ padding:'12px 6px', borderRadius:10, border:`1px solid ${chart===c[0]?'var(--accent)':'var(--border)'}`, background: chart===c[0]?'var(--active)':'var(--surface)', color: chart===c[0]?'var(--accent)':'var(--text-2)', transition:'all .15s' }}>
                  <Icon name={c[2]} size={18}/><span style={{fontSize:11,fontWeight:600}}>{c[1]}</span>
                </button>
              ))}
            </div>
          </div>
          <div><span className="field-label">{t('lbl_filters')}</span><div className="col gap-8"><div className="row gap-8"><select className="select"><option>Region</option></select><select className="select" style={{maxWidth:90}}><option>is</option></select></div><button className="btn btn-sm btn-ghost" style={{justifyContent:'flex-start'}}><Icon name="plus" size={14}/>{t('add_filter')}</button></div></div>
        </div>

        {/* preview */}
        <div className="card card-pad col gap-12" style={{ minHeight:420 }}>
          <div className="row between"><div className="col gap-2"><span className="dim" style={{fontSize:11.5}}>{t('preview_label')}</span><span style={{fontWeight:700,fontSize:15}}>{metric} {t('by_label')} {dim}</span></div><span className="badge badge-info">{charts.find(c=>c[0]===chart)[1]}</span></div>
          <div className="grow center" style={{ alignItems:'stretch', flexDirection:'column', justifyContent:'center', padding:'10px 4px' }}>{renderPreview()}</div>
          <div className="row gap-8 wrap" style={{borderTop:'1px solid var(--border)',paddingTop:12}}>
            <span className="badge badge-neutral"><Icon name="database" size={12}/>{src}</span>
            <span className="badge badge-neutral"><Icon name="clock" size={12}/>{t('live_hourly')}</span>
            <span className="badge badge-accent"><Icon name="sparkle" size={12}/>{t('ai_recommends_bar')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Industry Templates ---------------- */
function TemplatesScreen({ navigate, toast, t }) {
  t = t || ((k) => (window.I18N.en[k] || k));
  const D = window.DATA;
  const [sel, setSel] = bUS(null);
  return (
    <div className="screen">
      <div className="screen-head">
        <h1 className="screen-title">{t('nav_templates')}</h1>
        <div className="screen-sub">{t('templates_sub')}</div>
      </div>
      <div className="grid" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))' }}>
        {D.TEMPLATES.map(tp=>(
          <div key={tp.id} className="card card-hover clickable card-pad" onClick={()=>setSel(tp)}>
            <div className="row between" style={{marginBottom:14}}>
              <span style={{width:44,height:44,borderRadius:13,background:`linear-gradient(135deg,${tp.accent},var(--accent-2))`,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',boxShadow:`0 6px 16px -6px ${tp.accent}`}}><Icon name={{bank:'building',fintech:'connectors',retail:'box',construction:'layers',gov:'shield',horeca:'cash',edu:'docs',logistics:'map'}[tp.id]||'grid'} size={22}/></span>
              <Icon name="arrowRight" size={18} style={{color:'var(--text-3)'}}/>
            </div>
            <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>{tp.name}</div>
            <div className="dim" style={{fontSize:12,marginBottom:12}}>{tp.kpis.length} KPIs · {tp.dashboards.length} dashboards</div>
            <div className="row gap-6 wrap">{tp.kpis.slice(0,3).map(k=><span key={k} className="badge badge-neutral" style={{fontSize:10.5}}>{k}</span>)}<span className="badge badge-neutral" style={{fontSize:10.5}}>+{tp.kpis.length-3}</span></div>
          </div>
        ))}
      </div>

      <Modal open={!!sel} onClose={()=>setSel(null)} title={sel?.name+' template'} sub={t('rec_config')} width={680}
        footer={<><button className="btn" onClick={()=>setSel(null)}>{t('close')}</button><button className="btn btn-primary" onClick={()=>{setSel(null); navigate('library'); toast(`${sel.name} ${t('template_created')}`);}}><Icon name="plus" size={15}/>{t('use_template')}</button></>}>
        {sel && <div className="grid" style={{gridTemplateColumns:'1fr 1fr',gap:14}}>
          <div className="card card-pad"><div className="eyebrow row gap-6" style={{marginBottom:10}}><Icon name="target" size={13}/>{t('rec_kpis')}</div><div className="col gap-7">{sel.kpis.map(k=><div key={k} className="row gap-8" style={{fontSize:13}}><Icon name="check" size={13} style={{color:'var(--pos)'}}/>{k}</div>)}</div></div>
          <div className="card card-pad"><div className="eyebrow row gap-6" style={{marginBottom:10}}><Icon name="library" size={13}/>Dashboards</div><div className="col gap-7">{sel.dashboards.map(k=><div key={k} className="row gap-8" style={{fontSize:13}}><Icon name="dashboard" size={13} style={{color:'var(--accent)'}}/>{k}</div>)}</div></div>
          <div className="card card-pad"><div className="eyebrow row gap-6" style={{marginBottom:10}}><Icon name="database" size={13}/>{t('req_sources')}</div><div className="row gap-6 wrap">{sel.sources.map(k=><span key={k} className="badge badge-neutral">{k}</span>)}</div></div>
          <div className="card card-pad"><div className="eyebrow row gap-6" style={{marginBottom:10}}><Icon name="alerts" size={13}/>{t('example_alerts')}</div><div className="col gap-7">{sel.alerts.map(k=><div key={k} className="row gap-8" style={{fontSize:13}}><span style={{width:6,height:6,borderRadius:99,background:'var(--warn)'}}/>{k}</div>)}</div></div>
        </div>}
      </Modal>
    </div>
  );
}

/* ---------------- Reports ---------------- */
function ReportsScreen({ navigate, toast, t }) {
  t = t || ((k) => (window.I18N.en[k] || k));
  const D = window.DATA;
  const [gen, setGen] = bUS(null);
  const [genState, setGenState] = bUS('idle');
  const [sched, setSched] = bUS(null);

  const runGen = (r) => { setGen(r); setGenState('loading'); setTimeout(()=>setGenState('done'), 1400); };

  return (
    <div className="screen">
      <div className="screen-head row between wrap gap-16">
        <div className="col gap-2">
          <h1 className="screen-title">{t('nav_reports')}</h1>
          <div className="screen-sub">{t('reports_sub')}</div>
        </div>
        <button className="btn btn-primary" onClick={()=>toast(t('new_report_opened'))}><Icon name="plus" size={15}/>{t('btn_new_report')}</button>
      </div>
      <div className="grid" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))' }}>
        {D.REPORTS.map(r=>(
          <div key={r.id} className="card card-pad col gap-14">
            <div className="row between"><span style={{width:40,height:40,borderRadius:11,background:'var(--accent-soft)',color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name={r.icon} size={20}/></span><span className="badge badge-neutral">{r.format}</span></div>
            <div className="col gap-2"><span style={{fontWeight:700,fontSize:15}}>{r.name}</span><span className="dim" style={{fontSize:12}}>{r.cadence} · {r.recipients} recipients</span></div>
            <div className="dim" style={{fontSize:11.5}}>Last sent {r.last}</div>
            <div className="row gap-8" style={{borderTop:'1px solid var(--border)',paddingTop:12}}>
              <button className="btn btn-sm grow" onClick={()=>runGen(r)}><Icon name="play" size={13}/>{t('btn_generate')}</button>
              <button className="btn btn-sm" onClick={()=>setSched(r)}><Icon name="calendar" size={14}/>{t('btn_schedule_report')}</button>
            </div>
          </div>
        ))}
      </div>

      {/* Generate preview */}
      <Modal open={!!gen} onClose={()=>{setGen(null); setGenState('idle');}} title={gen?.name} sub={t('report_preview')} width={680}
        footer={genState==='done' && <><button className="btn" onClick={()=>setSched(gen)}><Icon name="calendar" size={15}/>{t('btn_schedule_report')}</button><button className="btn btn-primary" onClick={()=>{setGen(null); setGenState('idle'); toast(t('report_exported'));}}><Icon name="download" size={15}/>{t('export_pdf')}</button></>}>
        {genState==='loading' ? (
          <div className="col gap-12 center" style={{padding:'30px 0'}}><Spinner size={28} color="var(--accent)"/><span className="muted" style={{fontSize:13}}>{t('generating_prefix')} {gen?.name}…</span><div className="col gap-8" style={{width:'100%'}}>{[t('agg_metrics'),t('detecting_devs'),t('writing_summary')].map((s,i)=><div key={i} className="row gap-8" style={{fontSize:12.5,color:'var(--text-2)'}}><Icon name="check" size={14} style={{color:'var(--pos)'}}/>{s}</div>)}</div></div>
        ) : (
          <div className="col gap-14">
            <span className="badge badge-info" style={{alignSelf:'flex-start'}}><Icon name="sparkle" size={11}/>{t('ai_summary_incl')}</span>
            <div className="card card-pad" style={{background:'var(--card-2)'}}><div className="eyebrow" style={{marginBottom:6}}>{t('exec_summary')}</div><p style={{margin:0,fontSize:13.5,lineHeight:1.6}}>{t('exec_summary_text')}</p></div>
            <div className="grid" style={{gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div className="card card-pad"><div className="dim" style={{fontSize:11.5,marginBottom:8}}>{t('dash_rev_trend')}</div><AreaChart series={D.REV_TREND.slice(6)} labels={D.MONTHS.slice(6)} h={120}/></div>
              <div className="card card-pad"><div className="dim" style={{fontSize:11.5,marginBottom:8}}>{t('regional_perf')}</div><RegionBars regions={D.REGIONS.slice(0,4)}/></div>
            </div>
          </div>
        )}
      </Modal>

      {/* Schedule */}
      <Modal open={!!sched} onClose={()=>setSched(null)} title={t('schedule_delivery')} sub={sched?.name}
        footer={<><button className="btn" onClick={()=>setSched(null)}>{t('cancel')}</button><button className="btn btn-primary" onClick={()=>{setSched(null); toast(t('email_scheduled'));}}>{t('btn_schedule_report')}</button></>}>
        <div className="col gap-14">
          <div><span className="field-label">{t('lbl_frequency')}</span><Segmented options={['Daily','Weekly','Monthly']} value="Weekly" onChange={()=>{}} /></div>
          <div className="row gap-12"><div className="grow"><span className="field-label">{t('lbl_day')}</span><select className="select"><option>Monday</option><option>Friday</option></select></div><div className="grow"><span className="field-label">{t('lbl_time_field')}</span><input className="input" type="time" defaultValue="08:00"/></div></div>
          <div><span className="field-label">{t('lbl_recipients_field')}</span><input className="input" defaultValue="board@navigator.uz, ceo@navigator.uz"/></div>
          <div className="row gap-10" style={{padding:'11px 13px',borderRadius:10,background:'var(--surface)'}}><Icon name="info" size={16} style={{color:'var(--accent)'}}/><span style={{fontSize:12.5,color:'var(--text-2)'}}>{t('sched_note')}</span></div>
        </div>
      </Modal>
    </div>
  );
}

Object.assign(window, { LibraryScreen, WidgetScreen, TemplatesScreen, ReportsScreen });
