/* ============================================================
   Screen — Login / Role selection
   ============================================================ */
function LoginScreen({ onEnter, lang, setLang, theme, setTheme }) {
  const [sel, setSel] = React.useState('CEO');
  const roles = [
    { id:'CEO', name:'CEO', desc:'Chairman / Top manager', icon:'crown', color:'#3b82f6' },
    { id:'Analyst', name:'Analyst', desc:'Business & data analyst', icon:'metrics', color:'#22d3ee' },
    { id:'Department Head', name:'Department Head', desc:'Regional & finance lead', icon:'layers', color:'#34d399' },
    { id:'Data Admin', name:'Data Admin', desc:'IT & platform admin', icon:'shield', color:'#a78bfa' },
  ];
  const langs = [{id:'uz',l:'Oʻzbekcha'},{id:'ru',l:'Русский'},{id:'en',l:'English'}];

  return (
    <div className="login-root" style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1.05fr 0.95fr' }}>
      {/* left brand panel */}
      <div className="login-brand col between" style={{ padding:'42px 48px', position:'relative', overflow:'hidden',
        background:'radial-gradient(900px 500px at 20% 0%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(700px 500px at 90% 100%, rgba(34,211,238,0.14), transparent 55%), var(--surface)',
        borderRight:'1px solid var(--border)' }}>
        <div className="row gap-12">
          <Logo size={40} />
          <div className="col" style={{ lineHeight:1.2, whiteSpace:'nowrap' }}>
            <span style={{ fontWeight:800, fontSize:18, letterSpacing:'-0.02em' }}>Smart BI</span>
            <span className="dim" style={{ fontSize:11.5, letterSpacing:'0.06em' }}>UZBEKISTAN</span>
          </div>
        </div>

        <div className="col gap-20" style={{ maxWidth:480 }}>
          <span className="badge badge-info" style={{ alignSelf:'flex-start' }}><Icon name="sparkle" size={12} />AI-native Business Intelligence</span>
          <h1 style={{ fontSize:42, fontWeight:800, letterSpacing:'-0.035em', lineHeight:1.05, margin:0 }}>
            Decisions, driven by<br/><span style={{ background:'linear-gradient(120deg,var(--accent),var(--accent-2))', WebkitBackgroundClip:'text', backgroundClip:'text', color:'transparent' }}>data you can trust.</span>
          </h1>
          <p className="muted" style={{ fontSize:15, lineHeight:1.6, margin:0 }}>
            Connect every source, ask questions in plain language, detect deviations before they cost you, and brief your board in seconds — built for banks, retail, fintech and government across Uzbekistan.
          </p>
          <div className="row gap-20 wrap" style={{ marginTop:6 }}>
            {[['16+','Data connectors'],['7','Industry templates'],['<2s','AI answers']].map((s,i)=>(
              <div key={i} className="col"><span className="mono" style={{ fontSize:24, fontWeight:800 }}>{s[0]}</span><span className="dim" style={{ fontSize:12 }}>{s[1]}</span></div>
            ))}
          </div>
        </div>

        <div className="row gap-16 dim" style={{ fontSize:11.5 }}>
          <span className="row gap-6"><Icon name="shield" size={13} />On-premise ready</span>
          <span className="row gap-6"><Icon name="lock" size={13} />Data residency in UZ</span>
          <span className="row gap-6"><Icon name="audit" size={13} />Full audit trail</span>
        </div>

        <div aria-hidden style={{ position:'absolute', right:-120, top:'50%', transform:'translateY(-50%)', width:340, height:340, borderRadius:'50%', background:'conic-gradient(from 180deg, var(--accent), var(--accent-2), var(--purple), var(--accent))', filter:'blur(80px)', opacity:0.20 }} />
      </div>

      {/* right login card */}
      <div className="login-form-wrap col center" style={{ padding:'42px', position:'relative' }}>
        <div className="row gap-8" style={{ position:'absolute', top:24, right:28 }}>
          <button className="iconbtn" onClick={() => setTheme(theme==='dark'?'light':'dark')}><Icon name={theme==='dark'?'sun':'moon'} size={17} /></button>
        </div>
        <div className="col gap-24" style={{ width:'100%', maxWidth:420 }}>
          <div className="col gap-6">
            <h2 style={{ fontSize:24, fontWeight:800, letterSpacing:'-0.025em', margin:0 }}>Enter the demo</h2>
            <p className="muted" style={{ fontSize:14, margin:0 }}>Choose a role to preview a tailored experience.</p>
          </div>

          <div className="grid" style={{ gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {roles.map(r => {
              const active = sel === r.id;
              return (
                <button key={r.id} onClick={() => setSel(r.id)} className="card card-hover"
                  style={{ padding:'16px', textAlign:'left', cursor:'pointer', borderColor: active?'transparent':'var(--border)',
                    background: active ? `linear-gradient(135deg, ${r.color}22, var(--card))` : 'var(--card)',
                    boxShadow: active ? `0 0 0 1.5px ${r.color}, 0 8px 24px -10px ${r.color}88` : 'none' }}>
                  <div className="row between" style={{ marginBottom:12 }}>
                    <span style={{ width:38, height:38, borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center',
                      background:`linear-gradient(135deg, ${r.color}, var(--accent-2))`, color:'#fff', boxShadow:`0 5px 14px -5px ${r.color}` }}><Icon name={r.icon} size={19} /></span>
                    <span style={{ width:18, height:18, borderRadius:99, border:`2px solid ${active?r.color:'var(--border-strong)'}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {active && <span style={{ width:8, height:8, borderRadius:99, background:r.color }} />}
                    </span>
                  </div>
                  <div style={{ fontWeight:700, fontSize:14.5 }}>{r.name}</div>
                  <div className="dim" style={{ fontSize:12, marginTop:2 }}>{r.desc}</div>
                </button>
              );
            })}
          </div>

          <div className="col gap-8">
            <span className="field-label">Language</span>
            <div className="tabs">
              {langs.map(l => <button key={l.id} className={`tab ${lang===l.id?'active':''}`} style={{ flex:1, justifyContent:'center' }} onClick={() => setLang(l.id)}>{l.l}</button>)}
            </div>
          </div>

          <button className="btn btn-lg btn-primary" style={{ width:'100%' }} onClick={() => onEnter(sel)}>
            Enter demo as {roles.find(r=>r.id===sel).name}<Icon name="arrowRight" size={17} />
          </button>
          <p className="dim" style={{ fontSize:11.5, textAlign:'center', margin:0 }}>Demo environment · mock data only · no authentication</p>
        </div>
      </div>
    </div>
  );
}
window.LoginScreen = LoginScreen;
