/* ============================================================
   Screens — Connectors · Documents · Admin · Audit · Settings
   ============================================================ */
const { useState: gUS, useEffect: gUE } = React;

/* ---------------- Data Sources / Connectors ---------------- */
function ConnectorsScreen({ toast }) {
  const D = window.DATA;
  const [wiz, setWiz] = gUS(null);
  const [step, setStep] = gUS(0);
  const [syncing, setSyncing] = gUS({});
  const cats = ['Database','File','Cloud','ERP','CRM','Core'];
  const steps = ['Credentials','Tables','Permissions','Schedule','Test'];

  const doSync = (id) => { setSyncing(s=>({...s,[id]:true})); setTimeout(()=>{ setSyncing(s=>({...s,[id]:false})); toast('Sync completed'); }, 1600); };
  const icon = (c) => ({Database:'database',File:'docs',Cloud:'globe',ERP:'layers',CRM:'users',Core:'shield'}[c]||'connectors');

  return (
    <div className="screen">
      <div className="screen-head row between wrap gap-16">
        <div className="col gap-2"><h1 className="screen-title">Data Sources</h1><div className="screen-sub">{D.CONNECTORS.filter(c=>c.status==='connected').length} of {D.CONNECTORS.length} connectors active</div></div>
        <button className="btn btn-primary" onClick={()=>{setWiz({name:'New connector'}); setStep(0);}}><Icon name="plus" size={15}/>Add connector</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns:'repeat(4,1fr)', marginBottom:18 }}>
        {[['Connected',D.CONNECTORS.filter(c=>c.status==='connected').length,'var(--pos)'],['Syncing',D.CONNECTORS.filter(c=>c.status==='syncing').length,'var(--info)'],['Idle',D.CONNECTORS.filter(c=>c.status==='idle').length,'var(--text-2)'],['Errors',D.CONNECTORS.filter(c=>c.status==='error').length,'var(--neg)']].map((s,i)=>(
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
                  <div className="row between"><span>Last sync</span><span className="mono" style={{color:'var(--text-2)'}}>{isSync?'now':c.sync}</span></div>
                  <div className="row between"><span>Volume</span><span className="mono" style={{color:'var(--text-2)'}}>{c.vol}</span></div>
                  <div className="row between"><span>Security</span><span className="badge" style={{height:18,fontSize:10,...(c.sec==='Critical'?{color:'var(--neg)',background:'var(--neg-soft)'}:c.sec==='High'?{color:'var(--warn)',background:'var(--warn-soft)'}:{})}}>{c.sec}</span></div>
                </div>
                <button className="btn btn-sm" style={{width:'100%',marginTop:12}} onClick={e=>{e.stopPropagation(); doSync(c.id);}}>{isSync?<><Spinner size={13}/>Syncing…</>:<><Icon name="refresh" size={13}/>Sync now</>}</button>
              </div>
            ); })}
          </div>
        </div>
      ); })}

      {/* Connection wizard */}
      <Modal open={!!wiz} onClose={()=>setWiz(null)} title={`Connect ${wiz?.name||''}`} sub={`Step ${step+1} of ${steps.length} · ${steps[step]}`} width={600}
        footer={<><button className="btn" onClick={()=>step>0?setStep(step-1):setWiz(null)}>{step>0?'Back':'Cancel'}</button>{step<steps.length-1?<button className="btn btn-primary" onClick={()=>setStep(step+1)}>Continue</button>:<button className="btn btn-primary" onClick={()=>{setWiz(null); setStep(0); toast('Connector configured & connected');}}><Icon name="check" size={15}/>Finish</button>}</>}>
        <div className="col gap-16">
          <div className="row gap-4">{steps.map((s,i)=>(<div key={i} className="grow" style={{height:4,borderRadius:99,background:i<=step?'linear-gradient(90deg,var(--accent),var(--accent-2))':'var(--surface)',transition:'background .3s'}}/>))}</div>
          {step===0 && <div className="col gap-12"><div><span className="field-label">Host</span><input className="input mono" defaultValue="db.internal.navigator.uz"/></div><div className="row gap-12"><div className="grow"><span className="field-label">Port</span><input className="input mono" defaultValue="5432"/></div><div className="grow"><span className="field-label">Database</span><input className="input mono" defaultValue="analytics"/></div></div><div className="row gap-12"><div className="grow"><span className="field-label">Username</span><input className="input"/></div><div className="grow"><span className="field-label">Password</span><input className="input" type="password" defaultValue="••••••••"/></div></div></div>}
          {step===1 && <div className="col gap-8"><span className="field-label">Select tables to sync</span>{['transactions','customers','branches','products','loan_applications'].map((t,i)=>(<label key={t} className="row between card card-pad clickable" style={{padding:'10px 13px'}}><span className="row gap-8 mono" style={{fontSize:13}}><Icon name="table" size={15} style={{color:'var(--accent)'}}/>{t}</span><input type="checkbox" defaultChecked={i<3}/></label>))}</div>}
          {step===2 && <div className="col gap-12"><div className="card card-pad" style={{background:'var(--card-2)'}}><div className="eyebrow" style={{marginBottom:8}}>Row-level security</div><label className="row between"><span style={{fontSize:13}}>Apply regional data restrictions</span><input type="checkbox" defaultChecked/></label></div><div><span className="field-label">Access role</span><select className="select"><option>Analytics (read-only)</option><option>Admin (full)</option></select></div></div>}
          {step===3 && <div className="col gap-12"><div><span className="field-label">Sync frequency</span><Segmented options={['Real-time','Hourly','Daily']} value="Hourly" onChange={()=>{}}/></div><div className="row gap-10" style={{padding:'11px 13px',borderRadius:10,background:'var(--surface)'}}><Icon name="clock" size={16} style={{color:'var(--accent)'}}/><span style={{fontSize:12.5,color:'var(--text-2)'}}>Incremental sync every hour, full refresh nightly at 02:00.</span></div></div>}
          {step===4 && <div className="col gap-12 center" style={{padding:'10px 0'}}><div style={{width:54,height:54,borderRadius:99,background:'var(--pos-soft)',color:'var(--pos)',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="check" size={28}/></div><span style={{fontWeight:700,fontSize:15}}>Connection successful</span><span className="muted" style={{fontSize:12.5,textAlign:'center'}}>Tested in 0.4s · 3 tables · 1.2M rows ready to sync</span></div>}
        </div>
      </Modal>
    </div>
  );
}

/* ---------------- Document Library ---------------- */
function DocsScreen({ toast, navigate }) {
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

  return (
    <div className="screen">
      <div className="screen-head row between wrap gap-16">
        <div className="col gap-2"><h1 className="screen-title">Document Library</h1><div className="screen-sub">AI document intelligence · summarize, query, extract</div></div>
        <button className="btn btn-primary" onClick={()=>toast('Upload dialog opened')}><Icon name="upload" size={15}/>Upload</button>
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
          <Segmented options={[{value:'summary',label:'Summarize'},{value:'ask',label:'Ask'},{value:'extract',label:'Extract'},{value:'brief',label:'Brief'}]} value={mode} onChange={setMode} size="sm"/>
          {loading ? <div className="col center gap-10" style={{padding:'24px 0'}}><Spinner size={24} color="var(--accent)"/><span className="muted" style={{fontSize:12.5}}>Reading document…</span></div> : <>
            {mode==='summary' && <div className="card card-pad" style={{borderLeft:'2px solid var(--accent-2)'}}><div className="eyebrow" style={{color:'var(--accent-2)',marginBottom:7}}>AI summary</div><p style={{margin:0,fontSize:13.5,lineHeight:1.6}}>This {sel.pages?sel.pages+'-page ':''}report covers Q2 performance. Revenue is ahead of plan but the Fergana region underperforms by 18%. It recommends emergency replenishment and a regional promotion. Cost of risk is rising and warrants monitoring.</p></div>}
            {mode==='ask' && <div className="col gap-12">
              <div className="row gap-8 wrap">{['What are the key risks?','Summarize recommendations','Which region underperforms?'].map(q=><button key={q} className="chip" onClick={askDoc} style={{fontSize:11.5}}><Icon name="sparkle" size={12}/>{q}</button>)}</div>
              {chat.map((c,i)=>(<div key={i} className="col gap-10"><div className="row" style={{justifyContent:'flex-end'}}><span style={{background:'linear-gradient(135deg,var(--accent),#2563eb)',color:'#fff',padding:'8px 12px',borderRadius:'12px 12px 3px 12px',fontSize:13}}>{c.q}</span></div><div className="card card-pad" style={{fontSize:13.5,lineHeight:1.55}}>{c.a}</div></div>))}
            </div>}
            {mode==='extract' && <div className="card" style={{overflow:'hidden'}}><table className="tbl"><thead><tr><th>Metric</th><th className="num">Value</th></tr></thead><tbody>{[['Revenue','568 bn UZS'],['Net profit','132 bn UZS'],['Plan fulfillment','101.4%'],['Fergana variance','−18%']].map((r,i)=><tr key={i}><td>{r[0]}</td><td className="num mono">{r[1]}</td></tr>)}</tbody></table><button className="btn btn-sm" style={{margin:12}} onClick={()=>{toast('Metrics suggested for catalog'); navigate('metrics');}}><Icon name="plus" size={13}/>Add to Metrics Catalog</button></div>}
            {mode==='brief' && <div className="card card-pad"><div className="eyebrow" style={{marginBottom:8}}>Meeting brief</div><ul style={{margin:0,paddingLeft:18,fontSize:13,lineHeight:1.7}}><li>Revenue +6.8%, ahead of plan</li><li>Fergana −18% — decision needed on recovery plan</li><li>Approve emergency SKU replenishment budget</li><li>Review rising cost of risk</li></ul></div>}
          </>}
        </div>}
      </Drawer>
    </div>
  );
}

/* ---------------- Admin & Access Control ---------------- */
function AdminScreen({ toast }) {
  const D = window.DATA;
  const [tab, setTab] = gUS('Users');
  const [addUser, setAddUser] = gUS(false);
  const [matrix, setMatrix] = gUS(D.ROLE_MATRIX);
  const toggle = (role,i) => setMatrix(m=>({...m,[role]:m[role].map((v,j)=>j===i?!v:v)}));

  return (
    <div className="screen">
      <div className="screen-head row between wrap gap-16">
        <div className="col gap-2"><h1 className="screen-title">Admin & Access Control</h1><div className="screen-sub">Enterprise governance · {D.USERS.length} users · {Object.keys(D.ROLE_MATRIX).length} roles</div></div>
        <button className="btn btn-primary" onClick={()=>setAddUser(true)}><Icon name="plus" size={15}/>Add user</button>
      </div>

      <div className="grid" style={{gridTemplateColumns:'repeat(2,1fr)',marginBottom:18}}>
        <div className="card card-pad row gap-10" style={{borderLeft:'3px solid var(--accent)'}}><Icon name="shield" size={20} style={{color:'var(--accent)'}}/><div className="col"><span style={{fontWeight:700,fontSize:13.5}}>On-premise deployment</span><span className="dim" style={{fontSize:12}}>Self-hosted in client datacenter · air-gap option available</span></div></div>
        <div className="card card-pad row gap-10" style={{borderLeft:'3px solid var(--accent-2)'}}><Icon name="map" size={20} style={{color:'var(--accent-2)'}}/><div className="col"><span style={{fontWeight:700,fontSize:13.5}}>Data residency: Uzbekistan</span><span className="dim" style={{fontSize:12}}>All data stored within national borders · compliant</span></div></div>
      </div>

      <Segmented options={['Users','Roles','Access Matrix','Workflow']} value={tab} onChange={setTab} size="sm"/>
      <div style={{marginTop:16}}>
        {tab==='Users' && <div className="card" style={{overflow:'hidden'}}><table className="tbl"><thead><tr><th>User</th><th>Role</th><th>Department</th><th>MFA</th><th>Status</th></tr></thead><tbody>{D.USERS.map(u=>(
          <tr key={u.id}><td><span className="row gap-10"><span className="avatar" style={{width:30,height:30,fontSize:11,background:`linear-gradient(135deg,${u.color},var(--accent-2))`}}>{u.name.split(' ').map(w=>w[0]).join('')}</span><div className="col"><span style={{fontWeight:600,fontSize:13}}>{u.name}</span><span className="dim mono" style={{fontSize:11}}>{u.email}</span></div></span></td><td>{u.role}</td><td className="muted">{u.dept}</td><td>{u.mfa?<span className="badge badge-pos"><Icon name="check" size={11}/>On</span>:<span className="badge badge-warn">Off</span>}</td><td><StatusBadge status={u.status}/></td></tr>
        ))}</tbody></table></div>}

        {tab==='Roles' && <div className="grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))'}}>{Object.keys(D.ROLE_MATRIX).map(role=>(
          <div key={role} className="card card-pad col gap-10"><div className="row between"><span style={{fontWeight:700,fontSize:14}}>{role}</span><span className="badge badge-neutral">{D.USERS.filter(u=>u.role===role).length} users</span></div><div className="col gap-6">{D.PERMISSIONS.map((p,i)=>(<div key={p} className="row gap-8" style={{fontSize:12.5,color:matrix[role][i]?'var(--text)':'var(--text-3)'}}><Icon name={matrix[role][i]?'check':'close'} size={13} style={{color:matrix[role][i]?'var(--pos)':'var(--text-3)'}}/>{p}</div>))}</div></div>
        ))}</div>}

        {tab==='Access Matrix' && <div className="card" style={{overflow:'auto'}}><table className="tbl"><thead><tr><th>Role / Permission</th>{D.PERMISSIONS.map(p=><th key={p} style={{textAlign:'center'}}>{p}</th>)}</tr></thead><tbody>{Object.keys(matrix).map(role=>(
          <tr key={role}><td style={{fontWeight:600}}>{role}</td>{matrix[role].map((v,i)=>(<td key={i} style={{textAlign:'center'}}><button onClick={()=>toggle(role,i)} style={{width:36,height:21,borderRadius:99,position:'relative',background:v?'linear-gradient(90deg,var(--accent),var(--accent-2))':'var(--border-strong)',transition:'background .2s'}}><span style={{position:'absolute',top:2.5,left:v?17:2.5,width:16,height:16,borderRadius:99,background:'#fff',transition:'left .2s'}}/></button></td>))}</tr>
        ))}</tbody></table></div>}

        {tab==='Workflow' && <div className="col gap-10">{[['Dashboard publish','Department Head','2 approvers'],['New data connector','Data Admin','1 approver'],['External share','CEO','Required'],['Role elevation','Data Admin','2 approvers']].map((w,i)=>(
          <div key={i} className="card card-pad row between"><div className="row gap-12"><span style={{width:34,height:34,borderRadius:9,background:'var(--accent-soft)',color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="check" size={17}/></span><div className="col"><span style={{fontWeight:600,fontSize:13.5}}>{w[0]}</span><span className="dim" style={{fontSize:12}}>Approver: {w[1]} · {w[2]}</span></div></div><span className="badge badge-pos"><span className="dot"/>Active</span></div>
        ))}</div>}
      </div>

      <Modal open={addUser} onClose={()=>setAddUser(false)} title="Add user" sub="Invite a team member"
        footer={<><button className="btn" onClick={()=>setAddUser(false)}>Cancel</button><button className="btn btn-primary" onClick={()=>{setAddUser(false); toast('Invitation sent');}}>Send invite</button></>}>
        <div className="col gap-14"><div className="row gap-12"><div className="grow"><span className="field-label">Full name</span><input className="input" placeholder="e.g. Aziz Karimov"/></div><div className="grow"><span className="field-label">Email</span><input className="input" placeholder="name@navigator.uz"/></div></div><div className="row gap-12"><div className="grow"><span className="field-label">Role</span><select className="select">{Object.keys(D.ROLE_MATRIX).map(r=><option key={r}>{r}</option>)}</select></div><div className="grow"><span className="field-label">Department</span><select className="select"><option>Executive</option><option>Retail</option><option>Finance</option><option>Analytics</option><option>IT</option></select></div></div><label className="row between card card-pad" style={{padding:'12px 14px'}}><span className="row gap-8" style={{fontSize:13}}><Icon name="lock" size={15} style={{color:'var(--accent)'}}/>Require multi-factor authentication</span><input type="checkbox" defaultChecked/></label></div>
      </Modal>
    </div>
  );
}

/* ---------------- Audit Log ---------------- */
function AuditScreen() {
  const D = window.DATA;
  const [type, setType] = gUS('All');
  const types = ['All','security','data','export','access','system','error'];
  const list = D.AUDIT.filter(a=>type==='All'||a.type===type);
  const tColor = {security:'var(--purple)',data:'var(--accent)',export:'var(--accent-2)',access:'var(--pos)',system:'var(--text-2)',error:'var(--neg)'};
  const tIcon = {security:'shield',data:'database',export:'download',access:'share',system:'refresh',error:'warning'};

  return (
    <div className="screen">
      <div className="screen-head"><h1 className="screen-title">Audit Log</h1><div className="screen-sub">Immutable record of all platform activity</div></div>
      <div className="row gap-8 wrap" style={{marginBottom:16}}><Segmented options={types} value={type} onChange={setType} size="sm"/></div>
      <div className="card" style={{overflow:'hidden'}}>
        <table className="tbl"><thead><tr><th>Event</th><th>User</th><th>Target</th><th>IP</th><th>Time</th></tr></thead>
          <tbody>{list.map(a=>(
            <tr key={a.id}><td><span className="row gap-10"><span style={{width:28,height:28,borderRadius:8,flexShrink:0,background:`color-mix(in srgb, ${tColor[a.type]} 16%, transparent)`,color:tColor[a.type],display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name={tIcon[a.type]} size={14}/></span><span style={{fontWeight:600}}>{a.action}</span></span></td><td className="muted">{a.user}</td><td className="muted">{a.target}</td><td className="mono dim">{a.ip}</td><td className="muted mono" style={{fontSize:12}}>{a.when}</td></tr>
          ))}</tbody></table>
      </div>
    </div>
  );
}

/* ---------------- Settings ---------------- */
function SettingsScreen({ theme, setTheme, lang, setLang, toast }) {
  const [tab, setTab] = gUS('Company');
  const tabs = ['Company','Appearance','Notifications','AI Assistant','Data','Security'];
  const Toggle = ({on,onClick}) => <button onClick={onClick} style={{width:40,height:23,borderRadius:99,position:'relative',background:on?'linear-gradient(90deg,var(--accent),var(--accent-2))':'var(--border-strong)',transition:'background .2s',flexShrink:0}}><span style={{position:'absolute',top:2.5,left:on?19.5:2.5,width:18,height:18,borderRadius:99,background:'#fff',transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,0.3)'}}/></button>;
  const [tog, setTog] = gUS({ alerts:true, reports:true, weekly:false, voice:true, autoInsight:true, masking:true, sso:true });
  const flip = (k) => setTog(t=>({...t,[k]:!t[k]}));

  return (
    <div className="screen" style={{maxWidth:980}}>
      <div className="screen-head"><h1 className="screen-title">Settings</h1><div className="screen-sub">Configure your workspace</div></div>
      <div className="grid" style={{gridTemplateColumns:'200px 1fr',gap:20,alignItems:'start'}}>
        <div className="col gap-2 card" style={{padding:8}}>{tabs.map(t=>(<button key={t} onClick={()=>setTab(t)} className="row gap-10" style={{padding:'10px 12px',borderRadius:8,fontSize:13.5,fontWeight:tab===t?600:500,textAlign:'left',color:tab===t?'var(--text)':'var(--text-2)',background:tab===t?'var(--active)':'transparent'}}>{t}</button>))}</div>
        <div className="col gap-16">
          {tab==='Company' && <div className="card card-pad col gap-14"><div className="section-title">Company profile</div><div className="row gap-12"><div className="grow"><span className="field-label">Company name</span><input className="input" defaultValue="Navigator Holding"/></div><div className="grow"><span className="field-label">Industry</span><select className="select"><option>Banking & Finance</option><option>Retail</option><option>Conglomerate</option></select></div></div><div className="row gap-12"><div className="grow"><span className="field-label">Country</span><input className="input" defaultValue="Uzbekistan"/></div><div className="grow"><span className="field-label">Base currency</span><select className="select"><option>UZS — Uzbek soʻm</option><option>USD</option></select></div></div><div><span className="field-label">Fiscal year start</span><select className="select" style={{maxWidth:200}}><option>January</option><option>April</option></select></div></div>}

          {tab==='Appearance' && <div className="card card-pad col gap-16"><div className="section-title">Appearance</div>
            <div><span className="field-label">Theme</span><div className="row gap-12">{[['dark','moon','Dark'],['light','sun','Light']].map(th=>(<button key={th[0]} onClick={()=>setTheme(th[0])} className="card card-pad col gap-8 grow" style={{cursor:'pointer',border:`1px solid ${theme===th[0]?'var(--accent)':'var(--border)'}`,background:theme===th[0]?'var(--active)':'var(--card)'}}><Icon name={th[1]} size={18} style={{color:theme===th[0]?'var(--accent)':'var(--text-2)'}}/><span style={{fontWeight:600,fontSize:13}}>{th[2]}</span></button>))}</div></div>
            <div><span className="field-label">Language</span><Segmented options={[{value:'en',label:'English'},{value:'ru',label:'Русский'},{value:'uz',label:'Oʻzbekcha'}]} value={lang} onChange={setLang}/></div>
          </div>}

          {tab==='Notifications' && <div className="card card-pad col gap-12"><div className="section-title">Notifications</div>{[['alerts','High-severity alerts','Instant push + email'],['reports','Scheduled reports','When a report is delivered'],['weekly','Weekly digest','Monday morning summary']].map(n=>(<label key={n[0]} className="row between" style={{padding:'10px 0',borderBottom:'1px solid var(--border)'}}><div className="col"><span style={{fontSize:13.5,fontWeight:600}}>{n[1]}</span><span className="dim" style={{fontSize:12}}>{n[2]}</span></div><Toggle on={tog[n[0]]} onClick={()=>flip(n[0])}/></label>))}</div>}

          {tab==='AI Assistant' && <div className="card card-pad col gap-12"><div className="section-title">AI Assistant</div><div><span className="field-label">Response style</span><Segmented options={['Concise','Balanced','Detailed']} value="Concise" onChange={()=>{}}/></div>{[['voice','Voice input','Enable microphone for questions'],['autoInsight','Proactive insights','Surface anomalies automatically']].map(n=>(<label key={n[0]} className="row between" style={{padding:'10px 0',borderTop:'1px solid var(--border)'}}><div className="col"><span style={{fontSize:13.5,fontWeight:600}}>{n[1]}</span><span className="dim" style={{fontSize:12}}>{n[2]}</span></div><Toggle on={tog[n[0]]} onClick={()=>flip(n[0])}/></label>))}<div><span className="field-label">Data scope</span><select className="select"><option>Company-wide (respecting permissions)</option><option>My department only</option></select></div></div>}

          {tab==='Data' && <div className="card card-pad col gap-12"><div className="section-title">Data refresh</div><div><span className="field-label">Default refresh interval</span><Segmented options={['Real-time','Hourly','Daily']} value="Hourly" onChange={()=>{}}/></div><div><span className="field-label">Cache duration</span><select className="select" style={{maxWidth:220}}><option>5 minutes</option><option>15 minutes</option><option>1 hour</option></select></div><div className="row gap-10" style={{padding:'11px 13px',borderRadius:10,background:'var(--surface)'}}><Icon name="info" size={16} style={{color:'var(--accent)'}}/><span style={{fontSize:12.5,color:'var(--text-2)'}}>Lower intervals increase load on source systems.</span></div></div>}

          {tab==='Security' && <div className="card card-pad col gap-12"><div className="section-title">Security</div>{[['sso','Single sign-on (SSO)','SAML 2.0 / OIDC'],['masking','Data masking','Mask sensitive fields for non-admins']].map(n=>(<label key={n[0]} className="row between" style={{padding:'10px 0',borderBottom:'1px solid var(--border)'}}><div className="col"><span style={{fontSize:13.5,fontWeight:600}}>{n[1]}</span><span className="dim" style={{fontSize:12}}>{n[2]}</span></div><Toggle on={tog[n[0]]} onClick={()=>flip(n[0])}/></label>))}<div><span className="field-label">Session timeout</span><select className="select" style={{maxWidth:200}}><option>30 minutes</option><option>1 hour</option><option>8 hours</option></select></div></div>}

          <div className="row" style={{justifyContent:'flex-end'}}><button className="btn btn-primary" onClick={()=>toast('Settings saved')}>Save changes</button></div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ConnectorsScreen, DocsScreen, AdminScreen, AuditScreen, SettingsScreen });
