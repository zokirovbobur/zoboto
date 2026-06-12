/* ============================================================
   FINPORT BLOG — shared components
   ============================================================ */
const {useState, useEffect, useRef, useCallback} = React;

/* bookmark store (localStorage) */
function useBookmarks(){
  const [marks,setMarks]=useState(()=>{
    try{return JSON.parse(localStorage.getItem('fp_marks')||'[]')}catch(e){return []}
  });
  const toggle=useCallback((id)=>{
    setMarks(m=>{
      const next = m.includes(id)? m.filter(x=>x!==id) : [...m,id];
      try{localStorage.setItem('fp_marks',JSON.stringify(next))}catch(e){}
      return next;
    });
  },[]);
  return [marks,toggle];
}

/* ---------- Header ---------- */
function Header({lang,setLang,go,view,onSearch}){
  const t=I18N[lang];
  const [mobile,setMobile]=useState(false);
  const items=[
    ['articles','articles'],['islamic','category:vs'],['calc','tools'],
    ['glossary','glossary'],['tests','tools'],['about','about'],
  ];
  const isActive=(target)=>{
    if(target==='articles') return view.name==='articles'||view.name==='article';
    if(target==='glossary') return view.name==='glossary';
    if(target==='tools') return view.name==='tools';
    if(target.startsWith('category')) return view.name==='category';
    return false;
  };
  return (
    <header className="hdr">
      <div className="wrap hdr-row">
        <a className="logo" onClick={()=>go({name:'home'})} style={{cursor:'pointer'}}>
          <LogoMark/>
          <span>Finport <span style={{color:'var(--emerald)'}}>Blog</span></span>
        </a>
        <nav className="nav-links">
          {items.map(([key,target])=>(
            <a key={key} className={"nav-link"+(isActive(target)?" active":"")}
               onClick={()=>{
                 if(target==='articles') go({name:'articles'});
                 else if(target.startsWith('category')) go({name:'category',id:target.split(':')[1]});
                 else if(target==='tools') go({name:'tools'});
                 else if(target==='glossary') go({name:'glossary'});
                 else go({name:'about'});
               }}>{t.nav[key]}</a>
          ))}
        </nav>
        <div className="hdr-tools">
          <button className="icon-btn" onClick={onSearch} aria-label="Search"><Icon name="search" size={20}/></button>
          <div className="lang-switch">
            {['uz','ru','en'].map(l=>(
              <button key={l} className={lang===l?'on':''} onClick={()=>setLang(l)}>{l.toUpperCase()}</button>
            ))}
          </div>
          <button className="icon-btn burger" onClick={()=>setMobile(m=>!m)} aria-label="Menu"><Icon name={mobile?'close':'menu'} size={22}/></button>
        </div>
      </div>
      {mobile && (
        <div style={{borderTop:'1px solid var(--line)',background:'var(--surface)'}}>
          <div className="wrap" style={{padding:'10px 24px',display:'flex',flexDirection:'column',gap:2}}>
            {items.map(([key,target])=>(
              <a key={key} className="nav-link" style={{padding:'12px 8px',fontSize:16}}
                 onClick={()=>{setMobile(false);
                   if(target==='articles') go({name:'articles'});
                   else if(target.startsWith('category')) go({name:'category',id:target.split(':')[1]});
                   else if(target==='tools') go({name:'tools'});
                   else if(target==='glossary') go({name:'glossary'});
                   else go({name:'about'});
                 }}>{t.nav[key]}</a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------- Section header ---------- */
function SectionHead({eyebrow,title,sub,action}){
  return (
    <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:24,marginBottom:28,flexWrap:'wrap'}}>
      <div style={{flex:'1 1 420px',minWidth:0,maxWidth:660}}>
        {eyebrow && <div className="eyebrow" style={{marginBottom:10}}>{eyebrow}</div>}
        <h2 style={{fontSize:'clamp(26px,3.4vw,38px)',fontWeight:800}}>{title}</h2>
        {sub && <p style={{color:'var(--muted)',fontSize:17,marginTop:10,maxWidth:560}}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Level dots ---------- */
function Level({level,lang}){
  const t=I18N[lang];
  return (
    <span className="level" title={t.levels[level]}>
      <span style={{display:'inline-flex',gap:3}}>
        {[1,2,3].map(i=><span key={i} className={"dot"+(i<=level?" on":"")}/>)}
      </span>
      {t.levels[level]}
    </span>
  );
}

/* ---------- Article card ---------- */
function ArticleCard({a,lang,go,marks,toggleMark,compact}){
  const t=I18N[lang];
  const saved=marks.includes(a.id);
  return (
    <article className="card card-hover" style={{display:'flex',flexDirection:'column',overflow:'hidden',cursor:'pointer'}}
      onClick={()=>go({name:'article',id:a.id})}>
      <div className="ph" style={{height:compact?120:148,borderBottom:'1px solid var(--line)'}}>
        <span>illustration · {a.tag}</span>
      </div>
      <div style={{padding:'18px 20px 20px',display:'flex',flexDirection:'column',flex:1}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12,flexWrap:'wrap'}}>
          <span className="badge badge-cat">{a.catLabel}</span>
          {a.reviewed && <span className="badge badge-review"><Icon name="shieldCheck" size={13}/>{t.reviewed}</span>}
        </div>
        <h3 style={{fontSize:compact?17:19,fontWeight:700,lineHeight:1.25,marginBottom:8}}>{a.title}</h3>
        <p style={{color:'var(--muted)',fontSize:14.5,lineHeight:1.5,marginBottom:16,flex:1}}>{a.summary}</p>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,paddingTop:14,borderTop:'1px solid var(--line)'}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <Level level={a.level} lang={lang}/>
            <span style={{display:'inline-flex',alignItems:'center',gap:5,color:'var(--faint)',fontSize:13}}>
              <Icon name="clock" size={14}/>{a.time} {t.min_read}
            </span>
          </div>
          <button className="icon-btn" style={{width:34,height:34,color:saved?'var(--emerald)':'var(--faint)'}}
            onClick={(e)=>{e.stopPropagation();toggleMark(a.id);}} aria-label="Save">
            <Icon name="bookmark" size={18} fill={saved?'currentColor':'none'}/>
          </button>
        </div>
      </div>
    </article>
  );
}

/* ---------- Toast ---------- */
function Toast({msg}){
  if(!msg) return null;
  return <div className="toast"><Icon name="check" size={16}/>{msg}</div>;
}

/* ---------- Footer ---------- */
function Footer({lang,go}){
  const t=I18N[lang];
  const cols=[
    {h:"Finport Blog", links:["Biz haqimizda","Editorial siyosati","Mualliflar","Shariat ko‘rib chiqish metodikasi"]},
    {h:"Mavzular", links:["Islomiy moliya asoslari","Islomiy bank vs odatiy bank","Kredit va qarzlar","Budjet va shaxsiy moliya"]},
    {h:"Kalkulyatorlar", links:["Moliyaviy sog‘liq testi","Budjet kalkulyatori","Zakat kalkulyatori","Murabaha vs kredit"]},
    {h:"Legal", links:["Disclaimer","Maxfiylik siyosati","Foydalanish shartlari","Manbalar"]},
  ];
  return (
    <footer className="ftr">
      <div className="geo-bg" style={{opacity:.06}}></div>
      <div className="wrap" style={{position:'relative',padding:'56px 24px 30px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1.4fr repeat(4,1fr)',gap:32}} className="ftr-grid">
          <div>
            <div className="logo" style={{color:'#fff',marginBottom:14}}>
              <LogoMark/><span>Finport <span style={{color:'#43C997'}}>Blog</span></span>
            </div>
            <p style={{fontSize:14,lineHeight:1.6,maxWidth:280,color:'#a9b8c7'}}>
              Moliyaviy savodxonlik va Islomiy moliya bo‘yicha sodda, ekspert ko‘rib chiqqan ta’lim platformasi.
            </p>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              {['telegram','instagram','youtube'].map(s=>(
                <a key={s} href="#" onClick={e=>e.preventDefault()} style={{width:40,height:40,borderRadius:11,display:'grid',placeItems:'center',background:'rgba(255,255,255,.08)'}}>
                  <Icon name={s} size={19}/>
                </a>
              ))}
            </div>
          </div>
          {cols.map((c,i)=>(
            <div key={i}>
              <h4 style={{color:'#fff',fontSize:14,letterSpacing:'.02em',marginBottom:14}}>{c.h}</h4>
              <ul style={{display:'flex',flexDirection:'column',gap:10}}>
                {c.links.map((l,j)=><li key={j}><a href="#" onClick={e=>{e.preventDefault();}} style={{fontSize:14}}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <hr style={{border:0,borderTop:'1px solid rgba(255,255,255,.1)',margin:'34px 0 20px'}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <span style={{fontSize:13,color:'#8295a6'}}>© 2026 Finport Blog · Tashkent, O‘zbekiston</span>
          <span style={{fontSize:13,color:'#8295a6',display:'inline-flex',alignItems:'center',gap:7}}>
            <Icon name="globe" size={15}/> {lang==='uz'?'O‘zbek (lotin)':lang==='ru'?'Русский':'English'}
          </span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window,{useBookmarks,Header,Footer,SectionHead,Level,ArticleCard,Toast});
