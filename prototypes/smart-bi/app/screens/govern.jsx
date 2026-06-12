/* ============================================================
   Screens — Connectors · Documents · Admin · Audit · Settings
   ============================================================ */
const { useState: gUS, useEffect: gUE } = React;

/* ---------------- Data Sources / Connectors ---------------- */
function ConnectorsScreen({ toast, t }) {
  t = t || ((k) => (window.I18N.en[k] || k));
  const D = window.DATA;
  const [wiz, setWiz] = gUS(null);
  const [step, setStep] = gUS(0);
  const [syncing, setSyncing] = gUS({});
  const cats = ['Database','File','Cloud','ERP','CRM','Core'];
  const steps = [t('step_credentials'),t('step_tables'),t('step_permissions'),t('step_schedule'),t('step_test')];

  const doSync = (id) => { setSyncing(s=>({...s,[id]:true})); setTimeout(()=>{ setSyncing(s=>({...s,[id]:false})); toast(t('sync_completed')); }, 1600); };
  const icon = (c) => ({Database:'database',File:'docs',Cloud:'globe',ERP:'layers',CRM:'users',Core:'shield'}[c]||'connectors');

  return (
    <div className="screen">
      <div className="screen-head row between wrap gap-16">
        <div className="col gap-2">
          <h1 className="screen-title">{t('nav_connectors')}</h1>
          <div className="screen-sub">{D.CONNECTORS.filter(c=>c.status==='connected').length} of {D.CONNECTORS.length} {t('btn_add_connector').toLowerCase()} active</div>
        </div>
        <button className="btn btn-primary" onClick={()=>{setWiz({name:'New connector'}); setStep(0);}}><Icon name="plus" size={15}/>{t('btn_add_connector')}</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:18 }}>
        {[[t('status_connected'),D.CONNECTORS.filter(c=>c.status==='connected').length,'var(--pos)'],[t('status_syncing'),D.CONNECTORS.filter(c=>c.status==='syncing').length,'var(--info)'],[t('status_idle'),D.CONNECTORS.filter(c=>c.status==='idle').length,'var(--text-2)'],[t('status_errors'),D.CONNECTORS.filter(c=>c.status==='error').length,'var(--neg)']].map((s,i)=>(
          <div key={i} className="card card-pad row gap-10"><span style={{width:10,height:10,borderRadius:99,background:s[2],marginTop:6}}/><div className="col"><span className="mono" style={{fontSize:22,fontWeight:800}}>{s[1]}</span><span className="dim" style={{fontSize:12}}>{s[0]}</span></div></div>
        ))}
      </div>

      {cats.map(cat=>{ const items=D.CONNECTORS.filter(c=>c.cat===cat); if(!items.length) return null; return (
        <div key={cat} className="col gap-10" style={{marginBottom:22}}>
          <div className="eyebrow row gap-8"><Icon name={icon(cat)} size={13}/>{cat}</div>
          <div className="grid" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))' }}>
            {items.map(c=>{ const isSync = syncing[c.id]||c.status==='syncing'; return (
              <div key={c.id} className="card card-hover clickable card-pad" onClick={()=>{setWiz(c); setStep(0);}}>
                <div className="row between" style={{marginBottom:12}}>
                  <span style={{width:38,height:38,borderRadius:10,background:'var(--surface)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',color:c.status==='error'?'var(--neg)':'var(--accent)'}}><Icon name={icon(c.cat)} size={18}/></span>
                  <StatusBadge status={isSync?'syncing':c.status}/>
                </div>
                <div style={{fontWeight:700,fontSize:14.5,marginBottom:8}}>{c.name}</div>
                <div className="col gap-5 muted" style={{fontSize:11.5}}>
                  <div className="row between"><span>{t('lbl_last_sync')}</span><span className="mono" style={{color:'var(--text-2)'}}>{isSync?'now':c.sync}</span></div>
                  <div className="row between"><span>{t('lbl_volume')}</span><span className="mono" style={{color:'var(--text-2)'}}>{c.vol}</span></div>
                  <div className="row between"><span>{t('lbl_security')}</span><span className="badge" style={{height:18,fontSize:10,...(c.sec==='Critical'?{color:'var(--neg)',background:'var(--neg-soft)'}:c.sec==='High'?{color:'var(--warn)',background:'var(--warn-soft)'}:{})}}>{c.sec}</span></div>
                </div>
                <button className="btn btn-sm" style={{width:'100%',marginTop:12}} onClick={e=>{e.stopPropagation(); doSync(c.id);}}>{isSync?<><Spinner size={13}/>{t('syncing_label')}</>:<><Icon name="refresh" size={13}/>{t('btn_sync_now')}</>}</button>
              </div>
            ); })}
          </div>
        </div>
      ); })}

      {/* Connection wizard */}
      <Modal open={!!wiz} onClose={()=>setWiz(null)} title={`${t('connect_prefix')} ${wiz?.name||''}`} sub={`${t('step_label')} ${step+1} / ${steps.length} · ${steps[step]}`} width={600}
        footer={<><button className="btn" onClick={()=>step>0?setStep(step-1):setWiz(null)}>{step>0?t('back'):t('cancel')}</button>{step<steps.length-1?<button className="btn btn-primary" onClick={()=>setStep(step+1)}>{t('continue_')}</button>:<button className="btn btn-primary" onClick={()=>{setWiz(null); setStep(0); toast(t('conn_configured'));}}><Icon name="check" size={15}/>{t('finish')}</button>}</>}>
        <div className="col gap-16">
          <div className="row gap-4">{steps.map((s,i)=>(<div key={i} className="grow" style={{height:4,borderRadius:99,background:i<=step?'linear-gradient(90deg,var(--accent),var(--accent-2))':'var(--surface)',transition:'background .3s'}}/>))}</div>
          {step===0 && <div className="col gap-12"><div><span className="field-label">{t('lbl_host')}</span><input className="input mono" defaultValue="db.internal.navigator.uz"/></div><div className="row gap-12"><div className="grow"><span className="field-label">{t('lbl_port')}</span><input className="input mono" defaultValue="5432"/></div><div className="grow"><span className="field-label">{t('lbl_database')}</span><input className="input mono" defaultValue="analytics"/></div></div><div className="row gap-12"><div className="grow"><span className="field-label">{t('lbl_username')}</span><input className="input"/></div><div className="grow"><span className="field-label">{t('lbl_password')}</span><input className="input" type="password" defaultValue="••••••••"/></div></div></div>}
          {step===1 && <div className="col gap-8"><span className="field-label">{t('select_tables')}</span>{['transactions','customers','branches','products','loan_applications'].map((tbl,i)=>(<label key={tbl} className="row between card card-pad clickable" style={{padding:'10px 13px'}}><span className="row gap-8 mono" style={{fontSize:13}}><Icon name="table" size={15} style={{color:'var(--accent)'}}/>{tbl}</span><input type="checkbox" defaultChecked={i<3}/></label>))}</div>}
          {step===2 && <div className="col gap-12"><div className="card card-pad" style={{background:'var(--card-2)'}}><div className="eyebrow" style={{marginBottom:8}}>{t('rls_title')}</div><label className="row between"><span style={{fontSize:13}}>{t('apply_regional')}</span><input type="checkbox" defaultChecked/></label></div><div><span className="field-label">{t('lbl_access_role')}</span><select className="select"><option>{t('analytics_read')}</option><option>{t('admin_full')}</option></select></div></div>}
          {step===3 && <div className="col gap-12"><div><span className="field-label">{t('sync_freq')}</span><Segmented options={['Real-time','Hourly','Daily']} value="Hourly" onChange={()=>{}}/></div><div className="row gap-10" style={{padding:'11px 13px',borderRadius:10,background:'var(--surface)'}}><Icon name="clock" size={16} style={{color:'var(--accent)'}}/><span style={{fontSize:12.5,color:'var(--text-2)'}}>{t('incremental_note')}</span></div></div>}
          {step===4 && <div className="col gap-12 center" style={{padding:'10px 0'}}><div style={{width:54,height:54,borderRadius:99,background:'var(--pos-soft)',color:'var(--pos)',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="check" size={28}/></div><span style={{fontWeight:700,fontSize:15}}>{t('conn_success')}</span><span className="muted" style={{fontSize:12.5,textAlign:'center'}}>{t('conn_tested')}</span></div>}
        </div>
      </Modal>
    </div>
  );
}

/* ---------------- Document Library ---------------- */
function DocsScreen({ toast, navigate, t }) {
  t = t || ((k) => (window.I18N.en[k] || k));
  const D = window.DATA;
  const [sel, setSel] = gUS(null);
  const [mode, setMode] = gUS('summary');
  const [loading, setLoading] = gUS(false);
  const [chat, setChat] = gUS([]);
  const folders = Array.from(new Set(D.DOCS.map(d=>d.folder)));
  const [folder, setFolder] = gUS('All');
  const list = D.DOCS.filter(d=>folder==='All'||d.folder===folder);
  const typeColor = {pdf:'var(--neg)',ppt:'var(--warn)',xls:'var(--pos)'};

  const openDoc = (d) => { setSel(d); setMode('summary'); setChat([]); setLoading(true); setTimeout(()=>setLoading(false),1100); };
  const askDoc = () => { setChat(c=>[...c,{q:'What are the key risks mentioned?',a:'The document flags three risks: Fergana revenue decline (−18%), rising cost of risk in consumer loans, and CRM sync failures affecting pipeline visibility.'}]); };

  const modes = [
    {value:'summary',label:t('mode_summary')},
    {value:'ask',label:t('mode_ask')},
    {value:'extract',label:t('mode_extract')},
    {value:'brief',label:t('mode_brief')},
  ];

  return (
    <div className="screen">
      <div className="screen-head row between wrap gap-16">
        <div className="col gap-2">
          <h1 className="screen-title">{t('nav_docs')}</h1>
          <div className="screen-sub">{t('docs_sub')}</div>
        </div>
        <button className="btn btn-primary" onClick={()=>toast(t('upload_opened'))}><Icon name="upload" size={15}/>{t('upload')}</button>
      </div>
      <div className="row gap-8 wrap" style={{marginBottom:16}}>
        <Segmented options={['All',...folders]} value={folder} onChange={setFolder} size="sm"/>
      </div>
      <div className="grid" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))' }}>
        {list.map(d=>(
          <div key={d.id} className="card card-hover clickable card-pad" onClick={()=>openDoc(d)}>
            <div className="row between" style={{marginBottom:14}}>
              <span style={{width:40,height:48,borderRadius:8,background:`color-mix(in srgb, ${typeColor[d.type]} 14%, var(--surface))`,border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',color:typeColor[d.type]}}><Icon name="docs" size={20}/></span>
              <span className="badge badge-neutral mono" style={{textTransform:'uppercase',fontSize:10}}>{d.type}</span>
            </div>
            <div style={{fontWeight:600,fontSize:13.5,marginBottom:6,lineHeight:1.35}}>{d.name}</div>
            <div className="row between dim" style={{fontSize:11}}><span>{d.folder}</span><span>{d.size}{d.pages?` · ${d.pages}p`:''}</span></div>
          </div>
        ))}
      </div>

      <Drawer open={!!sel} onClose={()=>setSel(null)} title={sel?.name} sub={sel && `${sel.folder} · ${sel.size}`} width={560}>
        {sel && <div className="col gap-14">
          <PlaceholderViz label={`${sel.type.toUpperCase()} preview${sel.pages?` · ${sel.pages} pages`:''}`} h={150}/>
          <Segmented options={modes} value={mode} onChange={setMode} size="sm"/>
          {loading ? <div className="col center gap-10" style={{padding:'24px 0'}}><Spinner size={24} color="var(--accent)"/><span className="muted" style={{fontSize:12.5}}>{t('reading_doc')}</span></div> : <>
            {mode==='summary' && <div className="card card-pad" style={{borderLeft:'2px solid var(--accent-2)'}}><div className="eyebrow" style={{color:'var(--accent-2)',marginBottom:7}}>{t('ai_summary_label')}</div><p style={{margin:0,fontSize:13.5,lineHeight:1.6}}>{t('ai_summary_doc_text')}</p></div>}
            {mode==='ask' && <div className="col gap-12">
              <div className="row gap-8 wrap">{['What are the key risks?','Summarize recommendations','Which region underperforms?'].map(q=><button key={q} className="chip" onClick={askDoc} style={{fontSize:11.5}}><Icon name="sparkle" size={12}/>{q}</button>)}</div>
              {chat.map((c,i)=>(<div key={i} className="col gap-10"><div className="row" style={{justifyContent:'flex-end'}}><span style={{background:'linear-gradient(135deg,var(--accent),#2563eb)',color:'#fff',padding:'8px 12px',borderRadius:'12px 12px 3px 12px',fontSize:13}}>{c.q}</span></div><div className="card card-pad" style={{fontSize:13.5,lineHeight:1.55}}>{c.a}</div></div>))}
            </div>}
            {mode==='extract' && <div className="card" style={{overflow:'hidden'}}><table className="tbl"><thead><tr><th>{t('lbl_metric')}</th><th className="num">Value</th></tr></thead><tbody>{[['Revenue','568 bn UZS'],['Net profit','132 bn UZS'],['Plan fulfillment','101.4%'],['Fergana variance','−18%']].map((r,i)=><tr key={i}><td>{r[0]}</td><td className="num mono">{r[1]}</td></tr>)}</tbody></table><button className="btn btn-sm" style={{margin:12}} onClick={()=>{toast(t('metrics_suggested')); navigate('metrics');}}><Icon name="plus" size={13}/>{t('add_to_catalog')}</button></div>}
            {mode==='brief' && <div className="card card-pad"><div className="eyebrow" style={{marginBottom:8}}>{t('meeting_brief')}</div><ul style={{margin:0,paddingLeft:18,fontSize:13,lineHeight:1.7}}><li>{t('brief_item1')}</li><li>{t('brief_item2')}</li><li>{t('brief_item3')}</li><li>{t('brief_item4')}</li></ul></div>}
          </>}
        </div>}
      </Drawer>
    </div>
  );
}

/* ---------------- Admin & Access Control ---------------- */
function AdminScreen({ toast, t }) {
  t = t || ((k) => (window.I18N.en[k] || k));
  const D = window.DATA;
  const [tab, setTab] = gUS('Users');
  const [addUser, setAddUser] = gUS(false);
  const [matrix, setMatrix] = gUS(D.ROLE_MATRIX);
  const toggle = (role,i) => setMatrix(m=>({...m,[role]:m[role].map((v,j)=>j===i?!v:v)}));

  const tabLabels = [t('tab_users'), t('tab_roles'), t('tab_access_matrix'), t('tab_workflow')];
  const tabKeys   = ['Users', 'Roles', 'Access Matrix', 'Workflow'];

  return (
    <div className="screen">
      <div className="screen-head row between wrap gap-16">
        <div className="col gap-2">
          <h1 className="screen-title">{t('nav_admin')}</h1>
          <div className="screen-sub">Enterprise governance · {D.USERS.length} {t('lbl_n_users')} · {Object.keys(D.ROLE_MATRIX).length} {t('tab_roles').toLowerCase()}</div>
        </div>
        <button className="btn btn-primary" onClick={()=>setAddUser(true)}><Icon name="plus" size={15}/>{t('btn_add_user')}</button>
      </div>

      <div className="grid" style={{gridTemplateColumns:'repeat(2,1fr)',marginBottom:18}}>
        <div className="card card-pad row gap-10" style={{borderLeft:'3px solid var(--accent)'}}><Icon name="shield" size={20} style={{color:'var(--accent)'}}/><div className="col"><span style={{fontWeight:700,fontSize:13.5}}>{t('on_premise')}</span><span className="dim" style={{fontSize:12}}>{t('on_premise_desc')}</span></div></div>
        <div className="card card-pad row gap-10" style={{borderLeft:'3px solid var(--accent-2)'}}><Icon name="map" size={20} style={{color:'var(--accent-2)'}}/><div className="col"><span style={{fontWeight:700,fontSize:13.5}}>{t('data_residency')}</span><span className="dim" style={{fontSize:12}}>{t('data_residency_desc')}</span></div></div>
      </div>

      <Segmented options={tabLabels} value={tabLabels[tabKeys.indexOf(tab)]} onChange={(v)=>setTab(tabKeys[tabLabels.indexOf(v)])} size="sm"/>
      <div style={{marginTop:16}}>
        {tab==='Users' && <div className="card" style={{overflow:'hidden'}}><table className="tbl"><thead><tr><th>{t('tbl_user')}</th><th>{t('tbl_role')}</th><th>{t('tbl_dept')}</th><th>{t('tbl_mfa')}</th><th>{t('tbl_status')}</th></tr></thead><tbody>{D.USERS.map(u=>(
          <tr key={u.id}><td><span className="row gap-10"><span className="avatar" style={{width:30,height:30,fontSize:11,background:`linear-gradient(135deg,${u.color},var(--accent-2))`}}>{u.name.split(' ').map(w=>w[0]).join('')}</span><div className="col"><span style={{fontWeight:600,fontSize:13}}>{u.name}</span><span className="dim mono" style={{fontSize:11}}>{u.email}</span></div></span></td><td>{u.role}</td><td className="muted">{u.dept}</td><td>{u.mfa?<span className="badge badge-pos"><Icon name="check" size={11}/>{t('mfa_on')}</span>:<span className="badge badge-warn">{t('mfa_off')}</span>}</td><td><StatusBadge status={u.status}/></td></tr>
        ))}</tbody></table></div>}

        {tab==='Roles' && <div className="grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))'}}>{Object.keys(D.ROLE_MATRIX).map(role=>(
          <div key={role} className="card card-pad col gap-10"><div className="row between"><span style={{fontWeight:700,fontSize:14}}>{role}</span><span className="badge badge-neutral">{D.USERS.filter(u=>u.role===role).length} {t('lbl_n_users')}</span></div><div className="col gap-6">{D.PERMISSIONS.map((p,i)=>(<div key={p} className="row gap-8" style={{fontSize:12.5,color:matrix[role][i]?'var(--text)':'var(--text-3)'}}><Icon name={matrix[role][i]?'check':'close'} size={13} style={{color:matrix[role][i]?'var(--pos)':'var(--text-3)'}}/>{p}</div>))}</div></div>
        ))}</div>}

        {tab==='Access Matrix' && <div className="card" style={{overflow:'auto'}}><table className="tbl"><thead><tr><th>{t('tbl_role')} / Permission</th>{D.PERMISSIONS.map(p=><th key={p} style={{textAlign:'center'}}>{p}</th>)}</tr></thead><tbody>{Object.keys(matrix).map(role=>(
          <tr key={role}><td style={{fontWeight:600}}>{role}</td>{matrix[role].map((v,i)=>(<td key={i} style={{textAlign:'center'}}><button onClick={()=>toggle(role,i)} style={{width:36,height:21,borderRadius:99,position:'relative',background:v?'linear-gradient(90deg,var(--accent),var(--accent-2))':'var(--border-strong)',transition:'background .2s'}}><span style={{position:'absolute',top:2.5,left:v?17:2.5,width:16,height:16,borderRadius:99,background:'#fff',transition:'left .2s'}}/></button></td>))}</tr>
        ))}</tbody></table></div>}

        {tab==='Workflow' && <div className="col gap-10">{[['Dashboard publish','Department Head','2 approvers'],['New data connector','Data Admin','1 approver'],['External share','CEO','Required'],['Role elevation','Data Admin','2 approvers']].map((w,i)=>(
          <div key={i} className="card card-pad row between"><div className="row gap-12"><span style={{width:34,height:34,borderRadius:9,background:'var(--accent-soft)',color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="check" size={17}/></span><div className="col"><span style={{fontWeight:600,fontSize:13.5}}>{w[0]}</span><span className="dim" style={{fontSize:12}}>{t('approver_label')} {w[1]} · {w[2]}</span></div></div><span className="badge badge-pos"><span className="dot"/>{t('workflow_active')}</span></div>
        ))}</div>}
      </div>

      <Modal open={addUser} onClose={()=>setAddUser(false)} title={t('add_user_title')} sub={t('add_user_sub')}
        footer={<><button className="btn" onClick={()=>setAddUser(false)}>{t('cancel')}</button><button className="btn btn-primary" onClick={()=>{setAddUser(false); toast(t('invite_sent'));}}>{t('send_invite')}</button></>}>
        <div className="col gap-14"><div className="row gap-12"><div className="grow"><span className="field-label">{t('lbl_full_name')}</span><input className="input" placeholder="e.g. Bobur Zokirov"/></div><div className="grow"><span className="field-label">{t('lbl_email')}</span><input className="input" placeholder="name@navigator.uz"/></div></div><div className="row gap-12"><div className="grow"><span className="field-label">{t('lbl_role_label')}</span><select className="select">{Object.keys(D.ROLE_MATRIX).map(r=><option key={r}>{r}</option>)}</select></div><div className="grow"><span className="field-label">{t('lbl_dept_label')}</span><select className="select"><option>Executive</option><option>Retail</option><option>Finance</option><option>Analytics</option><option>IT</option></select></div></div><label className="row between card card-pad" style={{padding:'12px 14px'}}><span className="row gap-8" style={{fontSize:13}}><Icon name="lock" size={15} style={{color:'var(--accent)'}}/>{t('require_mfa')}</span><input type="checkbox" defaultChecked/></label></div>
      </Modal>
    </div>
  );
}

/* ---------------- Audit Log ---------------- */
function AuditScreen({ t }) {
  t = t || ((k) => (window.I18N.en[k] || k));
  const D = window.DATA;
  const [type, setType] = gUS('All');
  const types = ['All','security','data','export','access','system','error'];
  const list = D.AUDIT.filter(a=>type==='All'||a.type===type);
  const tColor = {security:'var(--purple)',data:'var(--accent)',export:'var(--accent-2)',access:'var(--pos)',system:'var(--text-2)',error:'var(--neg)'};
  const tIcon = {security:'shield',data:'database',export:'download',access:'share',system:'refresh',error:'warning'};

  return (
    <div className="screen">
      <div className="screen-head">
        <h1 className="screen-title">{t('nav_audit')}</h1>
        <div className="screen-sub">{t('audit_sub')}</div>
      </div>
      <div className="row gap-8 wrap" style={{marginBottom:16}}><Segmented options={types} value={type} onChange={setType} size="sm"/></div>
      <div className="card" style={{overflow:'hidden'}}>
        <table className="tbl"><thead><tr><th>{t('tbl_event')}</th><th>{t('tbl_user_col')}</th><th>{t('tbl_target')}</th><th>{t('tbl_ip')}</th><th>{t('tbl_time')}</th></tr></thead>
          <tbody>{list.map(a=>(
            <tr key={a.id}><td><span className="row gap-10"><span style={{width:28,height:28,borderRadius:8,flexShrink:0,background:`color-mix(in srgb, ${tColor[a.type]} 16%, transparent)`,color:tColor[a.type],display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name={tIcon[a.type]} size={14}/></span><span style={{fontWeight:600}}>{a.action}</span></span></td><td className="muted">{a.user}</td><td className="muted">{a.target}</td><td className="mono dim">{a.ip}</td><td className="muted mono" style={{fontSize:12}}>{a.when}</td></tr>
          ))}</tbody></table>
      </div>
    </div>
  );
}

/* ---------------- Settings ---------------- */
function SettingsScreen({ theme, setTheme, lang, setLang, toast, t }) {
  t = t || ((k) => (window.I18N.en[k] || k));
  const tabLabels = [t('tab_company'), t('tab_appearance'), t('tab_notifications'), t('tab_ai_asst'), t('tab_data'), t('tab_security_tab')];
  const tabKeys   = ['Company','Appearance','Notifications','AI Assistant','Data','Security'];
  const [tabIdx, setTabIdx] = gUS(0);
  const tab = tabKeys[tabIdx];

  const Toggle = ({on,onClick}) => <button onClick={onClick} style={{width:40,height:23,borderRadius:99,position:'relative',background:on?'linear-gradient(90deg,var(--accent),var(--accent-2))':'var(--border-strong)',transition:'background .2s',flexShrink:0}}><span style={{position:'absolute',top:2.5,left:on?19.5:2.5,width:18,height:18,borderRadius:99,background:'#fff',transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,0.3)'}}/></button>;
  const [tog, setTog] = gUS({ alerts:true, reports:true, weekly:false, voice:true, autoInsight:true, masking:true, sso:true });
  const flip = (k) => setTog(t2=>({...t2,[k]:!t2[k]}));

  return (
    <div className="screen" style={{maxWidth:980}}>
      <div className="screen-head">
        <h1 className="screen-title">{t('nav_settings')}</h1>
        <div className="screen-sub">{t('settings_sub')}</div>
      </div>
      <div className="grid" style={{gridTemplateColumns:'200px 1fr',gap:20,alignItems:'start'}}>
        <div className="col gap-2 card" style={{padding:8}}>{tabLabels.map((lbl,i)=>(<button key={lbl} onClick={()=>setTabIdx(i)} className="row gap-10" style={{padding:'10px 12px',borderRadius:8,fontSize:13.5,fontWeight:tabIdx===i?600:500,textAlign:'left',color:tabIdx===i?'var(--text)':'var(--text-2)',background:tabIdx===i?'var(--active)':'transparent'}}>{lbl}</button>))}</div>
        <div className="col gap-16">
          {tab==='Company' && <div className="card card-pad col gap-14"><div className="section-title">{t('company_profile')}</div><div className="row gap-12"><div className="grow"><span className="field-label">{t('lbl_company_name')}</span><input className="input" defaultValue="Navigator Holding"/></div><div className="grow"><span className="field-label">{t('lbl_industry')}</span><select className="select"><option>Banking & Finance</option><option>Retail</option><option>Conglomerate</option></select></div></div><div className="row gap-12"><div className="grow"><span className="field-label">{t('lbl_country')}</span><input className="input" defaultValue="Uzbekistan"/></div><div className="grow"><span className="field-label">{t('lbl_currency')}</span><select className="select"><option>UZS — Uzbek soʻm</option><option>USD</option></select></div></div><div><span className="field-label">{t('lbl_fiscal')}</span><select className="select" style={{maxWidth:200}}><option>January</option><option>April</option></select></div></div>}

          {tab==='Appearance' && <div className="card card-pad col gap-16"><div className="section-title">{t('appearance_title')}</div>
            <div><span className="field-label">{t('lbl_theme')}</span><div className="row gap-12">{[['dark','moon',t('theme_dark')],['light','sun',t('theme_light')]].map(th=>(<button key={th[0]} onClick={()=>setTheme(th[0])} className="card card-pad col gap-8 grow" style={{cursor:'pointer',border:`1px solid ${theme===th[0]?'var(--accent)':'var(--border)'}`,background:theme===th[0]?'var(--active)':'var(--card)'}}><Icon name={th[1]} size={18} style={{color:theme===th[0]?'var(--accent)':'var(--text-2)'}}/><span style={{fontWeight:600,fontSize:13}}>{th[2]}</span></button>))}</div></div>
            <div><span className="field-label">{t('lbl_language')}</span><Segmented options={[{value:'en',label:'English'},{value:'ru',label:'Русский'},{value:'uz',label:'Oʻzbekcha'}]} value={lang} onChange={setLang}/></div>
          </div>}

          {tab==='Notifications' && <div className="card card-pad col gap-12"><div className="section-title">{t('notif_title')}</div>{[[t('notif_alerts_lbl'),t('notif_alerts_desc'),'alerts'],[t('notif_reports_lbl'),t('notif_reports_desc'),'reports'],[t('notif_weekly_lbl'),t('notif_weekly_desc'),'weekly']].map((n,i)=>(<label key={i} className="row between" style={{padding:'10px 0',borderBottom:'1px solid var(--border)'}}><div className="col"><span style={{fontSize:13.5,fontWeight:600}}>{n[0]}</span><span className="dim" style={{fontSize:12}}>{n[1]}</span></div><Toggle on={tog[n[2]]} onClick={()=>flip(n[2])}/></label>))}</div>}

          {tab==='AI Assistant' && <div className="card card-pad col gap-12"><div className="section-title">{t('ai_asst_title')}</div><div><span className="field-label">{t('lbl_response_style')}</span><Segmented options={[t('style_concise'),t('style_balanced'),t('style_detailed')]} value={t('style_concise')} onChange={()=>{}}/></div>{[[t('voice_input'),t('voice_input_desc'),'voice'],[t('proactive_insights'),t('proactive_insights_desc'),'autoInsight']].map((n,i)=>(<label key={i} className="row between" style={{padding:'10px 0',borderTop:'1px solid var(--border)'}}><div className="col"><span style={{fontSize:13.5,fontWeight:600}}>{n[0]}</span><span className="dim" style={{fontSize:12}}>{n[1]}</span></div><Toggle on={tog[n[2]]} onClick={()=>flip(n[2])}/></label>))}<div><span className="field-label">{t('lbl_data_scope')}</span><select className="select"><option>{t('scope_company')}</option><option>{t('scope_dept')}</option></select></div></div>}

          {tab==='Data' && <div className="card card-pad col gap-12"><div className="section-title">{t('data_refresh_title')}</div><div><span className="field-label">{t('lbl_refresh')}</span><Segmented options={['Real-time','Hourly','Daily']} value="Hourly" onChange={()=>{}}/></div><div><span className="field-label">{t('lbl_cache')}</span><select className="select" style={{maxWidth:220}}><option>{t('cache_5m')}</option><option>{t('cache_15m')}</option><option>{t('cache_1h')}</option></select></div><div className="row gap-10" style={{padding:'11px 13px',borderRadius:10,background:'var(--surface)'}}><Icon name="info" size={16} style={{color:'var(--accent)'}}/><span style={{fontSize:12.5,color:'var(--text-2)'}}>{t('lower_intervals_note')}</span></div></div>}

          {tab==='Security' && <div className="card card-pad col gap-12"><div className="section-title">{t('security_title')}</div>{[[t('sso_label'),t('sso_desc'),'sso'],[t('masking_label'),t('masking_desc'),'masking']].map((n,i)=>(<label key={i} className="row between" style={{padding:'10px 0',borderBottom:'1px solid var(--border)'}}><div className="col"><span style={{fontSize:13.5,fontWeight:600}}>{n[0]}</span><span className="dim" style={{fontSize:12}}>{n[1]}</span></div><Toggle on={tog[n[2]]} onClick={()=>flip(n[2])}/></label>))}<div><span className="field-label">{t('session_timeout')}</span><select className="select" style={{maxWidth:200}}><option>{t('timeout_30m')}</option><option>{t('timeout_1h')}</option><option>{t('timeout_8h')}</option></select></div></div>}

          <div className="row" style={{justifyContent:'flex-end'}}><button className="btn btn-primary" onClick={()=>toast(t('settings_saved'))}>{t('save_changes')}</button></div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ConnectorsScreen, DocsScreen, AdminScreen, AuditScreen, SettingsScreen });
