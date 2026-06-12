/* ============================================================
   FINPORT BLOG — landing page sections
   ============================================================ */

/* ---------- Hero ---------- */
function Hero({lang,go,onSearch}){
  const t=I18N[lang];
  return (
    <section style={{position:'relative',overflow:'hidden',background:'linear-gradient(180deg,#fff 0%,var(--surface-2) 100%)',borderBottom:'1px solid var(--line)'}}>
      <div className="geo-bg" style={{opacity:.4,maskImage:'radial-gradient(120% 90% at 80% 0%, #000 30%, transparent 75%)'}}></div>
      <div className="wrap hero-grid" style={{position:'relative',padding:'58px 24px 64px',display:'grid',gridTemplateColumns:'1.05fr .95fr',gap:54,alignItems:'center'}} >
        <div className="hero-left view-enter">
          <div className="eyebrow" style={{marginBottom:16}}>Moliyaviy savodxonlik · Islomiy moliya</div>
          <h1 style={{fontSize:'clamp(34px,5vw,56px)',fontWeight:800,lineHeight:1.04,letterSpacing:'-.03em'}}>{t.hero_title}</h1>
          <p style={{fontSize:'clamp(17px,2vw,20px)',color:'var(--ink-2)',marginTop:20,maxWidth:520,lineHeight:1.5}}>{t.hero_sub}</p>

          <div className="hero-search" onClick={onSearch} style={{marginTop:28,display:'flex',alignItems:'center',gap:12,background:'var(--surface)',border:'1px solid var(--line-2)',borderRadius:999,padding:'7px 7px 7px 20px',maxWidth:520,boxShadow:'var(--shadow-sm)',cursor:'text'}}>
            <Icon name="search" size={20} style={{color:'var(--faint)',flex:'0 0 auto'}}/>
            <span style={{color:'var(--faint)',fontSize:15.5,flex:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{t.search_ph}</span>
            <button className="btn btn-navy btn-sm" style={{flex:'0 0 auto'}}>Qidirish</button>
          </div>

          <div className="hero-btns" style={{display:'flex',gap:12,marginTop:24,flexWrap:'wrap'}}>
            <button className="btn btn-primary" onClick={()=>go({name:'category',id:'vs'})}>{t.cta1}<Icon name="arrowRight" size={18}/></button>
            <button className="btn btn-ghost" onClick={()=>go({name:'tools'})}>{t.cta2}</button>
            <button className="btn btn-ghost" onClick={()=>go({name:'tools'})}>{t.cta3}</button>
          </div>

          <div style={{display:'flex',gap:26,marginTop:30,flexWrap:'wrap'}}>
            {[['120+','Maqola'],['42','Lug‘at atamasi'],['7','Kalkulyator']].map(([n,l])=>(
              <div key={l}>
                <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:24,color:'var(--navy)'}}>{n}</div>
                <div style={{fontSize:13,color:'var(--muted)'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <FeaturedCompare lang={lang} go={go}/>
      </div>
    </section>
  );
}

/* ---------- Featured comparison card ---------- */
function FeaturedCompare({lang,go}){
  const t=I18N[lang];
  const rows=[
    {od:"Foiz va kredit", is:"Savdo, ijara, sheriklik", icon:"swap"},
    {od:"Qarz munosabati", is:"Aktivga bog‘liqlik", icon:"link"},
    {od:"Risk mijozda", is:"Risk taqsimlanadi", icon:"scale"},
    {od:"Ichki nazorat", is:"Shariat kengashi", icon:"shieldCheck"},
  ];
  return (
    <div className="card view-enter feat-cmp" style={{padding:0,overflow:'hidden',animationDelay:'.1s',boxShadow:'var(--shadow-lg)'}}>
      <div style={{background:'var(--navy)',color:'#fff',padding:'20px 24px 22px',position:'relative',overflow:'hidden'}}>
        <div className="geo-bg" style={{opacity:.12}}></div>
        <div style={{position:'relative',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}}>
          <div>
            <div className="mono" style={{color:'#43C997',marginBottom:5}}>Taqqoslash</div>
            <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:19,lineHeight:1.2}}>{t.featured_cmp}</div>
          </div>
          <span className="badge" style={{background:'rgba(67,201,151,.16)',color:'#7ce0b5',flex:'0 0 auto'}}>Asoslar</span>
        </div>
      </div>
      <div className="feat-head" style={{display:'grid',gridTemplateColumns:'1fr 1fr'}}>
        <div className="feat-cell" style={{padding:'14px 20px',borderRight:'1px solid var(--line)'}}>
          <div style={{display:'flex',alignItems:'center',gap:7,color:'var(--ink-2)',fontWeight:700,fontSize:14,marginBottom:6}}>
            <span style={{width:8,height:8,borderRadius:2,background:'var(--navy-soft)'}}></span>{t.odatiy}
          </div>
        </div>
        <div className="feat-cell" style={{padding:'14px 20px',background:'var(--emerald-wash)'}}>
          <div style={{display:'flex',alignItems:'center',gap:7,color:'var(--emerald-2)',fontWeight:700,fontSize:14,marginBottom:6}}>
            <span style={{width:8,height:8,borderRadius:2,background:'var(--emerald)'}}></span>{t.islamic_bank}
          </div>
        </div>
      </div>
      {rows.map((r,i)=>(
        <div key={i} className="feat-row" style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderTop:'1px solid var(--line)'}}>
          <div className="feat-cell" style={{padding:'13px 20px',fontSize:14,color:'var(--ink-2)',borderRight:'1px solid var(--line)',minWidth:0,wordBreak:'break-word'}}>{r.od}</div>
          <div className="feat-cell" style={{padding:'13px 20px',fontSize:14,color:'var(--emerald-2)',fontWeight:600,background:'var(--emerald-wash)',display:'flex',alignItems:'center',gap:8,minWidth:0}}>
            <Icon name={r.icon} size={15} style={{flexShrink:0}}/><span style={{minWidth:0,wordBreak:'break-word'}}>{r.is}</span>
          </div>
        </div>
      ))}
      <button onClick={()=>go({name:'article',id:'7-farq'})} style={{width:'100%',padding:'15px',borderTop:'1px solid var(--line)',display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontFamily:'var(--font-display)',fontWeight:600,color:'var(--emerald-2)',fontSize:14.5}}>
        To‘liq taqqoslashni o‘qish <Icon name="arrowRight" size={17}/>
      </button>
    </div>
  );
}

/* ---------- Category grid ---------- */
function CategoryGrid({lang,go}){
  const t=I18N[lang];
  return (
    <section className="wrap" style={{padding:'68px 24px 0'}}>
      <SectionHead eyebrow="Kategoriyalar" title={t.cat_title} sub={t.cat_sub}/>
      <div className="stagger" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(228px,1fr))',gap:16}}>
        {CATEGORIES.map(c=>(
          <button key={c.id} className="card card-hover" style={{padding:'22px 20px',textAlign:'left',display:'flex',flexDirection:'column',gap:12,alignItems:'flex-start'}}
            onClick={()=>go(c.id==='lugat'?{name:'glossary'}:{name:'category',id:c.id})}>
            <span style={{width:46,height:46,borderRadius:13,display:'grid',placeItems:'center',
              background:c.tone==='emerald'?'var(--emerald-tint)':'#eaf0f7',
              color:c.tone==='emerald'?'var(--emerald-2)':'var(--navy-2)'}}>
              <Icon name={c.icon} size={23}/>
            </span>
            <div>
              <h3 style={{fontSize:16.5,fontWeight:700,marginBottom:5}}>{c.title}</h3>
              <p style={{fontSize:13.5,color:'var(--muted)',lineHeight:1.45}}>{c.desc}</p>
            </div>
            <span className="mono" style={{color:'var(--faint)',marginTop:'auto'}}>{c.count} maqola</span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------- Learning path ---------- */
function LearningPath({lang,go}){
  const t=I18N[lang];
  const done=PATH.filter(p=>p.done).length;
  const pct=Math.round(done/PATH.length*100);
  return (
    <section className="wrap" style={{padding:'68px 24px 0'}}>
      <div className="card path-card" style={{overflow:'hidden',display:'grid',gridTemplateColumns:'340px 1fr'}} >
        <div className="path-side" style={{background:'var(--navy)',color:'#fff',padding:'34px 30px',position:'relative',overflow:'hidden',display:'flex',flexDirection:'column'}}>
          <div className="geo-bg" style={{opacity:.1}}></div>
          <div style={{position:'relative'}}>
            <div className="eyebrow" style={{color:'#43C997'}}>Yo‘l xaritasi</div>
            <h2 style={{color:'#fff',fontSize:28,fontWeight:800,marginTop:12,lineHeight:1.1}}>{t.path_title}</h2>
            <p style={{color:'#a9b8c7',fontSize:15,marginTop:12,lineHeight:1.55}}>{t.path_sub}</p>
          </div>
          <div style={{position:'relative',marginTop:'auto',paddingTop:28}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:8}}>
              <span style={{color:'#a9b8c7'}}>{done}/{PATH.length} bosqich</span>
              <span style={{color:'#43C997',fontWeight:700}}>{pct}%</span>
            </div>
            <div style={{height:8,background:'rgba(255,255,255,.14)',borderRadius:999,overflow:'hidden'}}>
              <div style={{width:pct+'%',height:'100%',background:'linear-gradient(90deg,#43C997,#14946A)',borderRadius:999}}></div>
            </div>
            <button className="btn btn-primary" style={{marginTop:20,width:'100%',justifyContent:'center'}}
              onClick={()=>go({name:'article',id:'murabaha'})}>{t.continue}<Icon name="arrowRight" size={18}/></button>
          </div>
        </div>
        <div style={{padding:'26px 28px',display:'flex',flexDirection:'column',justifyContent:'center',gap:6}}>
          {PATH.map((p,i)=>(
            <button key={p.n} onClick={()=>go({name:'article',id:i===0?'7-farq':'murabaha'})}
              style={{display:'flex',alignItems:'center',gap:16,padding:'14px 14px',borderRadius:14,textAlign:'left',transition:'.15s',background:'transparent'}}
              onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <span style={{flex:'0 0 auto',width:38,height:38,borderRadius:11,display:'grid',placeItems:'center',fontFamily:'var(--font-display)',fontWeight:800,fontSize:15,
                background:p.done?'var(--emerald)':'var(--surface-3)',color:p.done?'#fff':'var(--ink-2)'}}>
                {p.done?<Icon name="check" size={19}/>:p.n}
              </span>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--font-display)',fontWeight:600,fontSize:15.5,color:'var(--ink)'}}>{p.title}</div>
                <div style={{fontSize:12.5,color:'var(--faint)',display:'flex',alignItems:'center',gap:5,marginTop:3}}>
                  <Icon name="clock" size={13}/>{p.time} {t.min_read}
                </div>
              </div>
              <Icon name="chevron" size={18} style={{color:'var(--faint)'}}/>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Articles section ---------- */
function ArticlesSection({lang,go,marks,toggleMark}){
  const t=I18N[lang];
  return (
    <section className="wrap" style={{padding:'68px 24px 0'}}>
      <SectionHead eyebrow="Bilim bazasi" title={t.articles_title} sub={t.articles_sub}
        action={<button className="btn btn-ghost" onClick={()=>go({name:'articles'})}>{t.view_all}<Icon name="arrowRight" size={17}/></button>}/>
      <div className="stagger" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:20}}>
        {ARTICLES.slice(0,6).map(a=><ArticleCard key={a.id} a={a} lang={lang} go={go} marks={marks} toggleMark={toggleMark}/>)}
      </div>
    </section>
  );
}

Object.assign(window,{Hero,FeaturedCompare,CategoryGrid,LearningPath,ArticlesSection});
