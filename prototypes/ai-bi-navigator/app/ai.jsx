/* ============================================================
   AI engine — scripted GenBI conversation + right-side panel
   ============================================================ */
const { useState: aiUS, useEffect: aiUE, useRef: aiUR } = React;

/* Each script: clarifying question + option chips, then a generated result */
const AI_SCRIPTS = {
  'Show sales decline reasons in Fergana': {
    clarify: 'Which period should I analyze for the Fergana decline?',
    options: ['Last 30 days', 'This quarter', 'Year over year'],
    result: {
      insight: 'Fergana revenue is 18% below plan (−13.5 bn UZS). 65% of the gap traces to lower foot traffic (−22%) and stock-outs in 3 flagship branches.',
      chartType: 'factor', action: 'Open Factor Analysis', go:'factor',
      bullets: ['Traffic −22% YoY across valley branches', 'Stock-outs on top-5 SKUs for 9 days', 'Competitor promo launched Apr 14'],
    },
  },
  'Compare revenue by region for the last 6 months': {
    clarify: 'Compare by absolute revenue or vs plan?',
    options: ['Absolute revenue', 'Vs plan', 'Growth %'],
    result: {
      insight: 'Tashkent leads at 184 bn UZS (+8.4%), 3.5× Khorezm. Fergana is the only major region below plan (−18%); all others are at or above target.',
      chartType: 'regionbars', action: 'Add to dashboard',
      bullets: ['Tashkent +8.4% · 31% of total', 'Fergana −18% · only region under plan', 'Bukhara fastest small region +6.2%'],
    },
  },
  'Find products below plan': {
    clarify: 'Filter to a specific category?',
    options: ['All products', 'Banking', 'Retail'],
    result: {
      insight: 'POS terminals (−4.2%) is the only product line below plan, missing target by 6 bn UZS. Mobile transfers over-performs most at +17% vs plan.',
      chartType: 'barplan', action: 'Create alert',
      bullets: ['POS terminals −6 bn UZS vs plan', 'Mobile transfers +17% vs plan', '4 of 5 lines above target'],
    },
  },
  'Generate CEO summary for this week': {
    clarify: 'What tone and length for the summary?',
    options: ['Executive (short)', 'Detailed', 'Board-ready'],
    result: {
      insight: 'Revenue 568 bn UZS (+6.8%), 1.4% ahead of plan. Net profit +4.2%. Main risk: Fergana −18% and conversion −0.5pp. 7 active alerts, 1 high-severity unresolved.',
      chartType: 'summary', action: 'Export as report', go:'reports',
      bullets: ['Revenue & profit both ahead of plan', 'Fergana is the key drag on the quarter', '1 high-severity alert needs decision'],
    },
  },
  'Which branches have abnormal conversion drop?': {
    clarify: 'How sensitive should anomaly detection be?',
    options: ['Standard', 'Aggressive', 'Conservative'],
    result: {
      insight: '12 branches show conversion drops beyond 2σ, concentrated in the Fergana valley. The sharpest is Fergana-Central at −1.9pp, mostly from mobile checkout abandonment.',
      chartType: 'heatmap', action: 'Open Alerts', go:'alerts',
      bullets: ['12 branches beyond 2σ threshold', 'Fergana valley is the cluster', 'Mobile checkout is the common factor'],
    },
  },
  _default: {
    clarify: 'Want me to scope this to a region, period, or product line?',
    options: ['All regions', 'This quarter', 'Top products'],
    result: {
      insight: 'Across the company, revenue is 568 bn UZS (+6.8% MoM) and 1.4% ahead of plan. The clearest opportunity is recovering the Fergana shortfall.',
      chartType: 'regionbars', action: 'Add to dashboard',
      bullets: ['Company tracking ahead of plan', 'Fergana is the main gap to close', 'Mobile transfers the fastest grower'],
    },
  },
};

function getScript(prompt) {
  return AI_SCRIPTS[prompt] || AI_SCRIPTS._default;
}

/* renders a generated result chart based on chartType */
function ResultViz({ type }) {
  const D = window.DATA;
  if (type === 'regionbars') return <RegionBars regions={D.REGIONS} />;
  if (type === 'barplan') return <BarPlanFact data={D.PRODUCTS} h={180} />;
  if (type === 'factor') return (
    <div className="col gap-8">
      {D.FACTORS.map(f => (
        <div key={f.id} className="row between gap-10" style={{ fontSize:12.5 }}>
          <span style={{ width:130 }}>{f.name}</span>
          <div className="meter grow"><span style={{ width:`${f.contrib*2.4}%`, background:'linear-gradient(90deg,var(--neg),#fb7185)' }} /></div>
          <span className="mono num" style={{ width:34, textAlign:'right' }}>{f.contrib}%</span>
        </div>
      ))}
    </div>
  );
  if (type === 'heatmap') return <Heatmap rows={['Fergana','Andijan','Namangan']} cols={['W1','W2','W3','W4']}
    values={[[0.2,0.15,0.1,0.05],[0.6,0.5,0.55,0.45],[0.7,0.65,0.6,0.62]]} />;
  if (type === 'summary') return (
    <div className="col gap-10">
      <div className="row gap-10 wrap">
        {[['Revenue','568 bn','+6.8%'],['Net profit','132 bn','+4.2%'],['Plan','101.4%','+1.4%']].map((k,i)=>(
          <div key={i} className="card card-pad" style={{ flex:1, minWidth:120, padding:12 }}>
            <div className="dim" style={{ fontSize:11 }}>{k[0]}</div>
            <div className="mono" style={{ fontSize:19, fontWeight:800, marginTop:3 }}>{k[1]}</div>
            <div className="delta up" style={{ fontSize:11 }}>{k[2]}</div>
          </div>
        ))}
      </div>
      <AreaChart series={D.REV_TREND.slice(6)} planData={D.PLAN_TREND.slice(6)} labels={D.MONTHS.slice(6)} h={140} />
    </div>
  );
  return <AreaChart series={D.REV_TREND.slice(6)} planData={D.PLAN_TREND.slice(6)} labels={D.MONTHS.slice(6)} h={150} />;
}

/* a single AI generated answer card */
function AIAnswer({ res, navigate, toast, onAddDash, compact }) {
  return (
    <div className="col gap-12 fade-up">
      <div className="card card-pad glow-border" style={{ background:'var(--card-2)' }}>
        <div className="row gap-8" style={{ marginBottom:10 }}>
          <span className="badge badge-info"><Icon name="sparkle" size={11} />Generated</span>
          <span className="dim" style={{ fontSize:11 }}>· {res.chartType} · 1.2s</span>
        </div>
        <ResultViz type={res.chartType} />
      </div>
      <div className="card card-pad" style={{ borderLeft:'2px solid var(--accent-2)' }}>
        <div className="eyebrow" style={{ marginBottom:7, color:'var(--accent-2)' }}>Executive insight</div>
        <p style={{ margin:0, fontSize:compact?13:14, lineHeight:1.55 }}>{res.insight}</p>
        {res.bullets && <ul style={{ margin:'12px 0 0', paddingLeft:0, listStyle:'none', display:'flex', flexDirection:'column', gap:7 }}>
          {res.bullets.map((b,i) => <li key={i} className="row gap-8" style={{ fontSize:12.5, color:'var(--text-2)' }}>
            <Icon name="check" size={13} style={{ color:'var(--pos)', flexShrink:0, marginTop:2 }} />{b}</li>)}
        </ul>}
      </div>
      <div className="row gap-8 wrap">
        <button className="btn btn-sm btn-primary" onClick={() => { onAddDash ? onAddDash() : toast('Added to dashboard'); }}><Icon name="plus" size={14} />Add to dashboard</button>
        {res.go && <button className="btn btn-sm" onClick={() => navigate(res.go)}><Icon name="arrowRight" size={14} />{res.action}</button>}
        <button className="btn btn-sm btn-ghost" onClick={() => toast('Showing data lineage')}><Icon name="database" size={14} />Data source</button>
        <button className="btn btn-sm btn-ghost" onClick={() => toast('Explanation generated')}><Icon name="info" size={14} />Explain</button>
      </div>
    </div>
  );
}

/* Conversation thread — used in panel + full screen */
function ChatThread({ navigate, toast, compact, seedPrompt }) {
  const [msgs, setMsgs] = aiUS([
    { who:'ai', kind:'text', text:'Hi — I\'m your AI analyst. Ask a business question in plain language, or pick a suggestion below.' },
  ]);
  const [input, setInput] = aiUS('');
  const [busy, setBusy] = aiUS(false);
  const scroller = aiUR(null);
  aiUE(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [msgs, busy]);
  aiUE(() => { if (seedPrompt) { ask(seedPrompt); } }, [seedPrompt]);

  const ask = (prompt) => {
    const script = getScript(prompt);
    setMsgs(m => [...m, { who:'user', kind:'text', text:prompt }]);
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setMsgs(m => [...m, { who:'ai', kind:'clarify', text:script.clarify, options:script.options, prompt }]);
    }, 750);
  };

  const answerClarify = (prompt, choice) => {
    const script = getScript(prompt);
    setMsgs(m => [...m, { who:'user', kind:'text', text:choice }]);
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setMsgs(m => [...m, { who:'ai', kind:'result', res:script.result }]);
    }, 1100);
  };

  const submit = () => { if (!input.trim()) return; ask(input.trim()); setInput(''); };

  return (
    <div className="col grow" style={{ minHeight:0 }}>
      <div ref={scroller} className="col gap-14 grow" style={{ overflowY:'auto', padding:compact?'4px 2px':'4px', minHeight:0 }}>
        {msgs.map((m, i) => {
          if (m.who === 'user') return (
            <div key={i} className="row" style={{ justifyContent:'flex-end' }}>
              <div style={{ maxWidth:'82%', background:'linear-gradient(135deg,var(--accent),#2563eb)', color:'#fff', padding:'9px 13px', borderRadius:'13px 13px 3px 13px', fontSize:13.5, lineHeight:1.45 }}>{m.text}</div>
            </div>
          );
          return (
            <div key={i} className="row gap-10" style={{ alignItems:'flex-start' }}>
              <span style={{ width:28, height:28, borderRadius:8, flexShrink:0, marginTop:2, background:'linear-gradient(135deg,var(--accent),var(--accent-2))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 3px 10px -3px var(--cyan-glow)' }}><Icon name="sparkle" size={15} style={{ color:'#fff' }} /></span>
              <div className="col gap-10" style={{ flex:1, minWidth:0 }}>
                {m.kind === 'text' && <div style={{ background:'var(--card-2)', border:'1px solid var(--border)', padding:'10px 13px', borderRadius:'3px 13px 13px 13px', fontSize:13.5, lineHeight:1.5 }}>{m.text}</div>}
                {m.kind === 'clarify' && <>
                  <div style={{ background:'var(--card-2)', border:'1px solid var(--border)', padding:'10px 13px', borderRadius:'3px 13px 13px 13px', fontSize:13.5, lineHeight:1.5 }}>{m.text}</div>
                  <div className="row gap-8 wrap">{m.options.map(o => <button key={o} className="chip" onClick={() => answerClarify(m.prompt, o)}>{o}</button>)}</div>
                </>}
                {m.kind === 'result' && <AIAnswer res={m.res} navigate={navigate} toast={toast} />}
              </div>
            </div>
          );
        })}
        {busy && (
          <div className="row gap-10" style={{ alignItems:'center' }}>
            <span style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,var(--accent),var(--accent-2))', display:'flex', alignItems:'center', justifyContent:'center' }}><Icon name="sparkle" size={15} style={{ color:'#fff' }} /></span>
            <div className="row gap-6" style={{ background:'var(--card-2)', border:'1px solid var(--border)', padding:'12px 15px', borderRadius:'3px 13px 13px 13px' }}>
              {[0,1,2].map(i => <span key={i} style={{ width:7, height:7, borderRadius:99, background:'var(--text-3)', animation:`pulse 1s ${i*0.15}s infinite` }} />)}
            </div>
          </div>
        )}
      </div>
      {/* suggestion chips */}
      <div className="row gap-8 wrap" style={{ padding:'12px 2px 10px' }}>
        {window.DATA.AI_PROMPTS.slice(0, compact?3:5).map(p => (
          <button key={p} className="chip" onClick={() => ask(p)} style={{ fontSize:12 }}><Icon name="sparkle" size={12} />{compact ? p.slice(0,28)+(p.length>28?'…':'') : p}</button>
        ))}
      </div>
      {/* input */}
      <div className="row gap-8" style={{ padding:'2px', alignItems:'center' }}>
        <div className="row gap-8 grow" style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'5px 6px 5px 14px' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && submit()}
            placeholder="Ask a business question…" style={{ flex:1, background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13.5 }} />
          <button className="iconbtn" title="Voice input" onClick={() => toast('Listening…', { icon:'mic' })}><Icon name="mic" size={16} /></button>
          <button className="btn btn-sm btn-accent2 btn-icon" onClick={submit}><Icon name="send" size={15} /></button>
        </div>
      </div>
    </div>
  );
}

/* Right-side panel */
function AIPanel({ open, onClose, navigate, toast }) {
  if (!open) return null;
  return (
    <aside className="col" style={{ width:'var(--aipanel-w)', flexShrink:0, borderLeft:'1px solid var(--border)', background:'var(--surface)', animation:'slideInRight .3s cubic-bezier(0.22,1,0.36,1)', height:'100%', maxWidth:'100vw' }}>
      <div className="row between" style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div className="row gap-10">
          <span style={{ width:30, height:30, borderRadius:9, background:'linear-gradient(135deg,var(--accent),var(--accent-2))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 3px 12px -3px var(--cyan-glow)' }}><Icon name="sparkle" size={16} style={{ color:'#fff' }} /></span>
          <div className="col" style={{ lineHeight:1.15 }}><span style={{ fontWeight:700, fontSize:14 }}>AI Analyst</span><span className="dim" style={{ fontSize:11 }}>GenBI Assistant</span></div>
        </div>
        <div className="row gap-4">
          <button className="iconbtn" title="Open full screen" onClick={() => { navigate('ai'); onClose(); }}><Icon name="grid" size={16} /></button>
          <button className="iconbtn" onClick={onClose}><Icon name="close" /></button>
        </div>
      </div>
      <div className="col grow" style={{ padding:'12px 14px', minHeight:0 }}>
        <ChatThread navigate={navigate} toast={toast} compact />
      </div>
    </aside>
  );
}

Object.assign(window, { ChatThread, AIPanel, AIAnswer, ResultViz, getScript });
