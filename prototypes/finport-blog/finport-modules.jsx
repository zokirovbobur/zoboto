/* ============================================================
   FINPORT BLOG — modules: comparison, tools, newsletter, trust
   ============================================================ */

/* ---------- Comparison module (interactive) ---------- */
function ComparisonModule({lang}){
  const t=I18N[lang];
  const [tab,setTab]=useState('shaxs');
  const rows=CMP_DATA[tab];
  return (
    <section className="wrap" style={{padding:'68px 24px 0'}}>
      <SectionHead eyebrow="Interaktiv jadval" title={t.cmp_title} sub={t.cmp_sub}/>
      <div style={{display:'flex',gap:8,marginBottom:18,flexWrap:'wrap'}}>
        {CMP_TABS.map(tb=>(
          <button key={tb.id} className={"btn btn-sm"+(tab===tb.id?" btn-navy":" btn-ghost")} onClick={()=>setTab(tb.id)}>{tb.label}</button>
        ))}
      </div>
      <div className="card" style={{overflow:'hidden',padding:0}}>
        <div className="cmp-table">
          <div className="cmp-row cmp-head">
            <div>Mezoni</div>
            <div>{t.odatiy}</div>
            <div className="cmp-em">{t.islamic_bank}</div>
            <div>Oddiy izoh</div>
          </div>
          {rows.map((r,i)=>(
            <div className="cmp-row" key={i} style={{animation:'fadeIn .3s ease both',animationDelay:(i*0.03)+'s'}}>
              <div className="cmp-k">{r.k}</div>
              <div className="cmp-c">{r.c}</div>
              <div className="cmp-i"><Icon name="check" size={15} style={{color:'var(--emerald)',flex:'0 0 auto',marginTop:2}}/>{r.i}</div>
              <div className="cmp-note">{r.note}</div>
            </div>
          ))}
        </div>
      </div>
      <p style={{fontSize:13,color:'var(--faint)',marginTop:14,display:'flex',gap:8,alignItems:'center'}}>
        <Icon name="bulb" size={16}/> Jadval ta’limiy soddalashtirish. Aniq mahsulot shartlari bank bo‘yicha farq qiladi.
      </p>
    </section>
  );
}

/* ---------- Tools section ---------- */
function ToolsSection({lang,openTool}){
  const t=I18N[lang];
  return (
    <section className="wrap" style={{padding:'68px 24px 0'}} id="tools">
      <SectionHead eyebrow="Vositalar" title={t.tools_title} sub={t.tools_sub}/>
      <div className="stagger" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(258px,1fr))',gap:16}}>
        {TOOLS.map(tool=>(
          <div key={tool.id} className="card card-hover" style={{padding:'22px 22px',display:'flex',flexDirection:'column',gap:14,cursor:'pointer'}}
            onClick={()=>openTool(tool)}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <span style={{width:46,height:46,borderRadius:13,display:'grid',placeItems:'center',background:'var(--emerald-tint)',color:'var(--emerald-2)'}}>
                <Icon name={tool.icon} size={23}/>
              </span>
              <span className="mono" style={{color:'var(--faint)',border:'1px solid var(--line)',padding:'4px 8px',borderRadius:7}}>Vosita</span>
            </div>
            <div style={{flex:1}}>
              <h3 style={{fontSize:17,fontWeight:700,marginBottom:6}}>{tool.title}</h3>
              <p style={{fontSize:13.5,color:'var(--muted)',lineHeight:1.45}}>{tool.desc}</p>
            </div>
            <span className="btn btn-soft btn-sm" style={{alignSelf:'flex-start'}}>
              {t[tool.cta]}<Icon name="arrowRight" size={16}/>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Newsletter ---------- */
function Newsletter({lang}){
  const t=I18N[lang];
  const [email,setEmail]=useState('');
  const [nLang,setNLang]=useState('uz');
  const [ok,setOk]=useState(false);
  const valid=/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  return (
    <section className="wrap" style={{padding:'68px 24px 0'}}>
      <div className="card" style={{position:'relative',overflow:'hidden',background:'linear-gradient(120deg,var(--emerald-2),var(--emerald))',color:'#fff',border:'none'}}>
        <div className="geo-bg" style={{opacity:.13}}></div>
        <div style={{position:'relative',padding:'44px 44px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,alignItems:'center'}} className="news-grid">
          <div>
            <div className="mono" style={{color:'rgba(255,255,255,.8)'}}>Newsletter</div>
            <h2 style={{color:'#fff',fontSize:30,fontWeight:800,marginTop:12,lineHeight:1.1}}>{t.news_title}</h2>
            <p style={{color:'rgba(255,255,255,.9)',fontSize:16,marginTop:12,lineHeight:1.5,maxWidth:420}}>{t.news_sub}</p>
          </div>
          <div style={{background:'rgba(255,255,255,.12)',borderRadius:18,padding:24,backdropFilter:'blur(6px)'}}>
            {ok ? (
              <div style={{textAlign:'center',padding:'18px 0'}}>
                <div style={{width:54,height:54,borderRadius:'50%',background:'#fff',color:'var(--emerald-2)',display:'grid',placeItems:'center',margin:'0 auto 14px'}}>
                  <Icon name="check" size={28}/>
                </div>
                <div style={{fontWeight:700,fontSize:18}}>Obuna tasdiqlandi!</div>
                <p style={{color:'rgba(255,255,255,.85)',fontSize:14,marginTop:6}}>{email} manziliga xush kelibsiz.</p>
              </div>
            ) : (
              <React.Fragment>
                <label style={{fontSize:13,fontWeight:600,opacity:.9}}>Email</label>
                <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="siz@email.com"
                  style={{width:'100%',marginTop:6,marginBottom:14,padding:'13px 16px',borderRadius:11,border:'none',fontSize:15,fontFamily:'inherit',outline:'none'}}/>
                <label style={{fontSize:13,fontWeight:600,opacity:.9}}>Til</label>
                <div style={{display:'flex',gap:8,marginTop:6,marginBottom:18}}>
                  {[['uz','O‘zbek'],['ru','Русский'],['en','English']].map(([k,l])=>(
                    <button key={k} onClick={()=>setNLang(k)} style={{flex:1,padding:'10px',borderRadius:10,fontSize:13.5,fontWeight:600,
                      background:nLang===k?'#fff':'rgba(255,255,255,.16)',color:nLang===k?'var(--emerald-2)':'#fff',transition:'.15s'}}>{l}</button>
                  ))}
                </div>
                <button disabled={!valid} onClick={()=>setOk(true)} style={{width:'100%',padding:'14px',borderRadius:11,fontFamily:'var(--font-display)',fontWeight:700,fontSize:15.5,
                  background:valid?'#fff':'rgba(255,255,255,.4)',color:valid?'var(--emerald-2)':'rgba(255,255,255,.7)',cursor:valid?'pointer':'not-allowed',transition:'.15s'}}>
                  {t.subscribe}
                </button>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Trust layer ---------- */
function TrustLayer({lang,onFeedback}){
  const t=I18N[lang];
  const items=[
    {icon:"shieldCheck",h:"Ekspert ko‘rib chiqqan",d:"Har bir maqola moliya yoki Shariat bo‘yicha mutaxassis tomonidan tekshiriladi."},
    {icon:"doc",h:"Manbalar ko‘rsatilgan",d:"Asosiy da’volar manba va havolalar bilan tasdiqlanadi."},
    {icon:"clock",h:"Yangilanib turadi",d:"Maqolalar “oxirgi yangilanish” sanasi bilan belgilanadi."},
    {icon:"flag",h:"Editorial siyosat",d:"Mustaqillik, neytrallik va shaffoflik tamoyillariga amal qilamiz."},
  ];
  return (
    <section className="wrap" style={{padding:'68px 24px 0'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16}}>
        {items.map((it,i)=>(
          <div key={i} className="card" style={{padding:'24px 22px'}}>
            <span style={{width:44,height:44,borderRadius:12,display:'grid',placeItems:'center',background:'var(--gold-tint)',color:'#8a6418',marginBottom:14}}>
              <Icon name={it.icon} size={22}/>
            </span>
            <h3 style={{fontSize:16,fontWeight:700,marginBottom:7}}>{it.h}</h3>
            <p style={{fontSize:13.5,color:'var(--muted)',lineHeight:1.5}}>{it.d}</p>
          </div>
        ))}
      </div>
      <div style={{marginTop:22,padding:'20px 24px',borderRadius:16,background:'var(--surface-3)',display:'flex',gap:16,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap'}}>
        <p style={{fontSize:14,color:'var(--ink-2)',maxWidth:760,lineHeight:1.55}}>
          <strong>Eslatma:</strong> {t.disclaimer}
        </p>
        <button className="btn btn-ghost btn-sm" onClick={onFeedback}><Icon name="flag" size={16}/>{t.found_error}</button>
      </div>
    </section>
  );
}

/* ============================================================
   Interactive calculator modal
   ============================================================ */
function fmt(n){return new Intl.NumberFormat('uz-UZ').format(Math.round(n));}

function ToolModal({tool,lang,onClose}){
  const t=I18N[lang];
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal scroll-thin" onClick={e=>e.stopPropagation()}>
        <div style={{padding:'22px 26px',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',gap:14,position:'sticky',top:0,background:'var(--surface)',zIndex:2}}>
          <span style={{width:44,height:44,borderRadius:12,display:'grid',placeItems:'center',background:'var(--emerald-tint)',color:'var(--emerald-2)',flex:'0 0 auto'}}>
            <Icon name={tool.icon} size={22}/>
          </span>
          <div style={{flex:1}}>
            <h3 style={{fontSize:19,fontWeight:700}}>{tool.title}</h3>
            <p style={{fontSize:13,color:'var(--muted)'}}>{tool.desc}</p>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="close" size={20}/></button>
        </div>
        <div style={{padding:'24px 26px'}}>
          {tool.kind==='budget' && <BudgetCalc/>}
          {tool.kind==='debt' && <DebtCalc/>}
          {tool.kind==='zakat' && <ZakatCalc/>}
          {tool.kind==='goal' && <GoalCalc/>}
          {tool.kind==='mura' && <MuraCalc/>}
          {tool.kind==='score' && <HealthScore/>}
          {tool.kind==='check' && <ContractCheck/>}
          <div style={{marginTop:20,paddingTop:16,borderTop:'1px solid var(--line)',fontSize:12.5,color:'var(--faint)',lineHeight:1.5}}>
            {t.disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
}

/* input helper */
function Field({label,value,onChange,suffix}){
  return (
    <label style={{display:'block',marginBottom:16}}>
      <span style={{fontSize:13.5,fontWeight:600,color:'var(--ink-2)'}}>{label}</span>
      <div style={{display:'flex',alignItems:'center',marginTop:6,border:'1px solid var(--line-2)',borderRadius:11,overflow:'hidden',background:'var(--surface)'}}>
        <input type="number" value={value} onChange={e=>onChange(e.target.value)}
          style={{flex:1,padding:'12px 14px',border:'none',fontSize:15.5,fontFamily:'inherit',outline:'none',background:'transparent'}}/>
        {suffix && <span style={{padding:'0 14px',color:'var(--faint)',fontSize:13,fontFamily:'var(--font-mono)'}}>{suffix}</span>}
      </div>
    </label>
  );
}
function ResultBar({label,value,total,color}){
  const pct=total>0?Math.min(100,value/total*100):0;
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:13.5,marginBottom:5}}>
        <span style={{fontWeight:600}}>{label}</span><span style={{color:'var(--muted)'}}>{fmt(value)} so‘m</span>
      </div>
      <div style={{height:9,background:'var(--surface-3)',borderRadius:999,overflow:'hidden'}}>
        <div style={{width:pct+'%',height:'100%',background:color,borderRadius:999,transition:'width .4s var(--ease)'}}></div>
      </div>
    </div>
  );
}

function BudgetCalc(){
  const [inc,setInc]=useState(8000000);
  const n=Number(inc)||0;
  return (
    <div>
      <Field label="Oylik daromad" value={inc} onChange={setInc} suffix="so‘m"/>
      <div style={{background:'var(--surface-2)',borderRadius:14,padding:'18px 18px',marginTop:4}}>
        <div style={{fontSize:13,fontWeight:700,color:'var(--ink-2)',marginBottom:14}}>50 / 30 / 20 taqsimot</div>
        <ResultBar label="Ehtiyojlar (50%)" value={n*0.5} total={n} color="var(--navy)"/>
        <ResultBar label="Istaklar (30%)" value={n*0.3} total={n} color="var(--emerald)"/>
        <ResultBar label="Jamg‘arma (20%)" value={n*0.2} total={n} color="var(--gold)"/>
      </div>
    </div>
  );
}
function DebtCalc(){
  const [inc,setInc]=useState(8000000);
  const [pay,setPay]=useState(2500000);
  const ratio=Number(inc)>0?(Number(pay)/Number(inc)*100):0;
  const status=ratio<20?['Sog‘lom','var(--emerald)']:ratio<36?['O‘rtacha','var(--gold)']:['Yuqori xavf','var(--rose)'];
  return (
    <div>
      <Field label="Oylik daromad" value={inc} onChange={setInc} suffix="so‘m"/>
      <Field label="Oylik qarz to‘lovi" value={pay} onChange={setPay} suffix="so‘m"/>
      <div style={{background:'var(--surface-2)',borderRadius:14,padding:'22px',textAlign:'center'}}>
        <div style={{fontSize:13,color:'var(--muted)'}}>Qarz yuki (DTI)</div>
        <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:42,color:status[1],lineHeight:1.1,margin:'4px 0'}}>{ratio.toFixed(0)}%</div>
        <span className="badge" style={{background:status[1]+'22',color:status[1]}}>{status[0]}</span>
        <p style={{fontSize:12.5,color:'var(--faint)',marginTop:12,lineHeight:1.5}}>Tavsiya: qarz to‘lovlari daromadning 36% dan oshmasligi maqsadga muvofiq.</p>
      </div>
    </div>
  );
}
function ZakatCalc(){
  const [cash,setCash]=useState(50000000);
  const [gold,setGold]=useState(0);
  const [debt,setDebt]=useState(0);
  const nisob=42000000; // taxminiy
  const base=Math.max(0,(Number(cash)||0)+(Number(gold)||0)-(Number(debt)||0));
  const due=base>=nisob;
  const zakat=due?base*0.025:0;
  return (
    <div>
      <Field label="Naqd va jamg‘arma" value={cash} onChange={setCash} suffix="so‘m"/>
      <Field label="Oltin / kumush qiymati" value={gold} onChange={setGold} suffix="so‘m"/>
      <Field label="Joriy qarzlar" value={debt} onChange={setDebt} suffix="so‘m"/>
      <div style={{background:'var(--surface-2)',borderRadius:14,padding:'22px',textAlign:'center'}}>
        <div style={{fontSize:13,color:'var(--muted)'}}>Zakat miqdori (2.5%)</div>
        <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:34,color:'var(--emerald-2)',margin:'4px 0'}}>{fmt(zakat)} so‘m</div>
        <p style={{fontSize:12.5,color:'var(--faint)',marginTop:6,lineHeight:1.5}}>
          {due?'Boylik nisobdan oshgan — zakat vojib.':'Boylik taxminiy nisob ('+fmt(nisob)+' so‘m) dan past.'}<br/>Nisob qiymati joriy narxlarga qarab o‘zgaradi.
        </p>
      </div>
    </div>
  );
}
function GoalCalc(){
  const [goal,setGoal]=useState(60000000);
  const [month,setMonth]=useState(2000000);
  const months=Number(month)>0?Math.ceil(Number(goal)/Number(month)):0;
  const yrs=Math.floor(months/12), rem=months%12;
  return (
    <div>
      <Field label="Maqsad summasi" value={goal} onChange={setGoal} suffix="so‘m"/>
      <Field label="Oylik jamg‘arma" value={month} onChange={setMonth} suffix="so‘m"/>
      <div style={{background:'var(--surface-2)',borderRadius:14,padding:'22px',textAlign:'center'}}>
        <div style={{fontSize:13,color:'var(--muted)'}}>Maqsadga yetish muddati</div>
        <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:34,color:'var(--navy)',margin:'4px 0'}}>{months} oy</div>
        <span className="badge badge-cat">{yrs>0?yrs+' yil ':''}{rem} oy</span>
      </div>
    </div>
  );
}
function MuraCalc(){
  const [price,setPrice]=useState(20000000);
  const [term,setTerm]=useState(12);
  const [rate,setRate]=useState(24);
  const [markup,setMarkup]=useState(15);
  const credTotal=Number(price)*(1+(Number(rate)/100)*(Number(term)/12));
  const muraTotal=Number(price)*(1+Number(markup)/100);
  return (
    <div>
      <Field label="Mahsulot narxi" value={price} onChange={setPrice} suffix="so‘m"/>
      <Field label="Muddat" value={term} onChange={setTerm} suffix="oy"/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Field label="Kredit yillik %" value={rate} onChange={setRate} suffix="%"/>
        <Field label="Murabaha ustama %" value={markup} onChange={setMarkup} suffix="%"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:4}}>
        <div style={{background:'#eaf0f7',borderRadius:14,padding:'18px',textAlign:'center'}}>
          <div style={{fontSize:12.5,color:'var(--navy-2)',fontWeight:700}}>Odatiy kredit</div>
          <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:21,color:'var(--navy)',margin:'6px 0 2px'}}>{fmt(credTotal)}</div>
          <div style={{fontSize:11.5,color:'var(--muted)'}}>jami so‘m</div>
        </div>
        <div style={{background:'var(--emerald-wash)',borderRadius:14,padding:'18px',textAlign:'center'}}>
          <div style={{fontSize:12.5,color:'var(--emerald-2)',fontWeight:700}}>Murabaha</div>
          <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:21,color:'var(--emerald-2)',margin:'6px 0 2px'}}>{fmt(muraTotal)}</div>
          <div style={{fontSize:11.5,color:'var(--muted)'}}>jami so‘m</div>
        </div>
      </div>
      <p style={{fontSize:12,color:'var(--faint)',marginTop:12,lineHeight:1.5}}>Murabahada ustama oldindan qat’iy belgilanadi; kreditda esa effektiv stavka qo‘shimcha to‘lovlar bilan o‘zgarishi mumkin.</p>
    </div>
  );
}
function HealthScore(){
  const qs=[
    "3–6 oylik zaxira jamg‘armam bor",
    "Daromadimning kamida 10%ini jamg‘araman",
    "Qarz to‘lovlarim daromadning 36%idan kam",
    "Oylik budjetni rejalashtiraman",
    "Moliyaviy maqsadlarim yozilgan",
  ];
  const [ans,setAns]=useState(Array(qs.length).fill(false));
  const score=ans.filter(Boolean).length/qs.length*100;
  const lvl=score>=80?['Mustahkam','var(--emerald)']:score>=50?['O‘rtacha','var(--gold)']:['Zaif','var(--rose)'];
  return (
    <div>
      <div style={{marginBottom:8}}>
        {qs.map((q,i)=>(
          <button key={i} onClick={()=>setAns(a=>a.map((v,j)=>j===i?!v:v))}
            style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:11,marginBottom:8,textAlign:'left',
              background:ans[i]?'var(--emerald-wash)':'var(--surface-2)',border:'1px solid '+(ans[i]?'var(--emerald)':'var(--line)'),transition:'.15s'}}>
            <span style={{width:24,height:24,borderRadius:7,flex:'0 0 auto',display:'grid',placeItems:'center',background:ans[i]?'var(--emerald)':'var(--surface)',color:'#fff',border:ans[i]?'none':'1px solid var(--line-2)'}}>
              {ans[i]&&<Icon name="check" size={15}/>}
            </span>
            <span style={{fontSize:14.5}}>{q}</span>
          </button>
        ))}
      </div>
      <div style={{background:'var(--surface-2)',borderRadius:14,padding:'20px',textAlign:'center'}}>
        <div style={{fontSize:13,color:'var(--muted)'}}>Moliyaviy sog‘liq</div>
        <div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:38,color:lvl[1],margin:'2px 0'}}>{score.toFixed(0)}<span style={{fontSize:20}}>/100</span></div>
        <span className="badge" style={{background:lvl[1]+'22',color:lvl[1]}}>{lvl[0]}</span>
      </div>
    </div>
  );
}
function ContractCheck(){
  const items=[
    "Bitim qaysi aktivga asoslangan?",
    "Yakuniy to‘lov summasi aniqmi?",
    "Ustama yoki foyda oldindan belgilanganmi?",
    "Kechiktirilgan to‘lov shartlari qanday?",
    "Erta to‘lashda chegirma bormi?",
    "Yashirin to‘lov va komissiyalar bormi?",
    "Shariat kengashi tasdig‘i bormi?",
    "Bekor qilish sharti tushunarli yozilganmi?",
  ];
  const [ck,setCk]=useState(Array(items.length).fill(false));
  const done=ck.filter(Boolean).length;
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:13.5,marginBottom:12}}>
        <span style={{fontWeight:700}}>{done}/{items.length} tekshirildi</span>
        <span style={{color:'var(--emerald-2)',fontWeight:700}}>{Math.round(done/items.length*100)}%</span>
      </div>
      {items.map((q,i)=>(
        <button key={i} onClick={()=>setCk(a=>a.map((v,j)=>j===i?!v:v))}
          style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'11px 14px',borderRadius:11,marginBottom:7,textAlign:'left',
            background:ck[i]?'var(--emerald-wash)':'var(--surface-2)',border:'1px solid '+(ck[i]?'var(--emerald)':'var(--line)'),transition:'.15s'}}>
          <span style={{width:22,height:22,borderRadius:'50%',flex:'0 0 auto',display:'grid',placeItems:'center',background:ck[i]?'var(--emerald)':'var(--surface)',color:'#fff',border:ck[i]?'none':'1px solid var(--line-2)'}}>
            {ck[i]&&<Icon name="check" size={14}/>}
          </span>
          <span style={{fontSize:14.5,textDecoration:ck[i]?'line-through':'none',color:ck[i]?'var(--muted)':'var(--ink)'}}>{q}</span>
        </button>
      ))}
    </div>
  );
}

Object.assign(window,{ComparisonModule,ToolsSection,Newsletter,TrustLayer,ToolModal});
