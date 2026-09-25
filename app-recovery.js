const RECOVERY_SOURCES = [
  {id:'classactions',icon:'CA',title:'Open class actions',group:'Claims',trust:'live + external',description:'Live feed of open settlements plus a directory of active lawsuits and investigations.',url:'https://www.classaction.org/settlements',secondary:'https://www.classaction.org/list-of-lawsuits',secondaryLabel:'Open lawsuits',input:'Company, product, app, employer, vehicle, or service name.'},
  {id:'unclaimed',icon:'
  {id:'ftc',icon:'FTC',title:'FTC refunds',group:'Money',trust:'official',description:'Active Federal Trade Commission refund programs for consumers harmed by unlawful business practices.',url:'https://www.ftc.gov/enforcement/refunds',input:'Look for companies or products you used.'},
  {id:'wages',icon:'W2',title:'Workers Owed Wages',group:'Work',trust:'official',description:'Back wages recovered by the U.S. Department of Labor that could not be delivered to workers.',url:'https://webapps.dol.gov/wow',input:'Search an employer name or industry, then check your name on the official site.'},
  {id:'pensions',icon:'401',title:'Missing retirement benefits',group:'Work',trust:'official',description:'PBGC database for unclaimed private-sector pension and retirement benefits from terminated plans.',url:'https://www.pbgc.gov/workers-retirees/find-unclaimed-retirement-benefits/search-unclaimed',input:'The official tool may request last name and the last four of SSN. Enter that only on PBGC.gov.'},
  {id:'fha',icon:'HUD',title:'FHA mortgage refunds',group:'Housing',trust:'official',description:'HUD/FHA mortgage-insurance premium refunds that may still be owed to former FHA borrowers.',url:'https://entp.hud.gov/dsrs/refunds/',input:'Search by last name or FHA case number directly on HUD.gov.'},
  {id:'sec',icon:'SEC',title:'SEC investor distributions',group:'Investing',trust:'official',description:'Fair Funds and disgorgement distributions created to return money to harmed investors.',url:'https://www.sec.gov/enforcement-litigation/distributions-harmed-investors',input:'Search the company, fund, broker or investment product involved.'},
  {id:'fdic',icon:'FDIC',title:'Failed-bank unclaimed funds',group:'Banking',trust:'official',description:'Unclaimed deposits, dividend checks and other funds from failed FDIC-insured institutions.',url:'https://closedbanks.fdic.gov/funds/',input:'Search name, business name, failed institution or check number on FDIC.gov.'},
  {id:'bankruptcy',icon:'BK',title:'Bankruptcy unclaimed funds',group:'Courts',trust:'official',description:'Money held by U.S. bankruptcy courts for creditors, debtors or other parties who did not receive payment.',url:'https://ucf.uscourts.gov/',input:'Search creditor or debtor name on the U.S. Courts locator. CAPTCHA stays on the court site.'}
];

state.recoveryQuery ??= '';
state.recoveryClassActions ??= [];
state.recoveryClassActionStatus ??= 'idle';
state.recoveryClassActionError ??= '';
state.recoveryLawsuits ??= [];
state.recoveryLawsuitStatus ??= 'idle';
state.recoveryLawsuitError ??= '';

function recoveryGlyph(id){return ({investigate:'⌕',recovery:'$',cases:'▣',sources:'◎'})[id]||'•';}
function navButton(id,label){return `<button data-nav="${id}" class="${state.view===id?'active':''}"><span class="nav-icon">${recoveryGlyph(id)}</span><span>${label}</span></button>`;}
function sidebar(){
  const saved=state.cases.length;
  return `<aside class="sidebar"><div class="brand"><div class="brand-mark" title="TraceForge">TF</div><div><strong>TraceForge</strong><small>McLain Systems</small></div></div><nav class="nav">${navButton('investigate','Investigate')}${navButton('recovery','Recovery')}${navButton('cases','Cases')}${navButton('sources','Coverage')}</nav><div class="sidebar-status"><strong><span class="live-dot"></span> Evidence-first mode</strong><p>${saved} saved case${saved===1?'':'s'} on this device. Searches stay ephemeral until you explicitly save findings.</p></div></aside>`;
}
function mobileNav(){return `<nav class="mobile-nav">${navButton('investigate','Search')}${navButton('recovery','Recovery')}${navButton('cases','Cases')}${navButton('sources','Coverage')}</nav>`;}
function topbar(){
  const titles={investigate:['Investigation console','Public-source checks with source-per-finding traceability.'],recovery:['Recovery & rights','Find legitimate places where money, claims or distributions may be waiting.'],cases:['Case workspace','Preserve evidence, relationships, timeline and contradictions.'],sources:['Source coverage','See exactly what TraceForge can check and where coverage stops.']};
  const [t,s]=titles[state.view]||titles.investigate;
  return `<header class="topbar"><div><div class="eyebrow">TraceForge / McLain Systems</div><h1>${t}</h1><p class="muted small">${s}</p></div><div class="actions no-print"><button class="btn ghost small" data-clear-session>Clear session</button></div></header>`;
}
function content(){if(state.view==='recovery')return recoveryView();if(state.view==='cases')return casesView();if(state.view==='sources')return sourcesView();return investigateView();}

function recoveryView(){
  const q=state.recoveryQuery;
  return `<section class="section"><div class="recovery-hero"><div><div class="eyebrow">RECOVERY SWEEP</div><h2>Search for money, claims and distributions you may have missed.</h2><p>One workspace for class-action settlements, state property, refunds, back wages, pensions, court funds and investor distributions.</p></div><div class="recovery-search"><input id="recoveryInput" class="search" value="${esc(q)}" placeholder="company, product, employer, app, vehicle…" autocomplete="off" spellcheck="false"><button class="btn primary" data-run-recovery>Scan opportunities</button></div><div class="privacy-strip"><strong>Privacy boundary:</strong> never enter SSN, DOB, claim PINs, passwords or account numbers into TraceForge. Sensitive identity checks stay on the official source site.</div></div></section>
  <section class="section"><div class="section-head"><div><h2>Live class-action settlements</h2><p class="small muted">Fetched server-side from ClassAction.org and filtered by your keyword when provided. Always verify eligibility on the official settlement website.</p></div><a class="btn ghost small" href="https://www.classaction.org/settlements" target="_blank" rel="noopener noreferrer">Browse all</a></div>${classActionResultsHtml()}</section>
  <section class="section"><div class="section-head"><div><h2>Open lawsuits & investigations</h2><p class="small muted">Active matters where attorneys are filing cases or investigating whether affected people may have claims.</p></div><a class="btn ghost small" href="https://www.classaction.org/list-of-lawsuits" target="_blank" rel="noopener noreferrer">Browse all</a></div>${lawsuitResultsHtml()}</section>
  <section class="section"><div class="section-head"><div><h2>Recovery sweep</h2><p class="small muted">Nine recovery paths. Seven of these are official U.S. government systems.</p></div><button class="btn ghost small" data-copy-recovery-query ${q?'':'disabled'}>Copy search term</button></div><div class="recovery-grid">${RECOVERY_SOURCES.map(recoveryCard).join('')}</div></section>
  <section class="section"><div class="card inset"><strong>TraceForge rule</strong><p class="small muted" style="margin-bottom:0">Discovery is not entitlement. A listing means “worth checking,” not “you are owed money.” Claim eligibility is determined by the administrator, agency or court that owns the source record.</p></div></section>`;
}

function recoveryCard(s){
  const second=s.secondary?`<a class="recovery-link secondary" href="${s.secondary}" target="_blank" rel="noopener noreferrer">${esc(s.secondaryLabel||'More')}</a>`:'';
  return `<article class="recovery-card"><div class="recovery-card-top"><div class="recovery-icon">${esc(s.icon)}</div><div><span class="badge teal">${esc(s.group)}</span><h3>${esc(s.title)}</h3></div></div><p>${esc(s.description)}</p><div class="recovery-input-note">${esc(s.input)}</div><div class="recovery-card-footer"><span class="small muted">${esc(s.trust)}</span><div class="recovery-links"><a class="recovery-link" href="${s.url}" target="_blank" rel="noopener noreferrer">Open source</a>${second}</div></div></article>`;
}

function classActionResultsHtml(){
  if(state.recoveryClassActionStatus==='loading') return `<div class="recovery-loading"><span class="scan-pulse"></span><strong>Scanning current settlements…</strong><span class="small muted">Filtering against open claim opportunities.</span></div>`;
  if(state.recoveryClassActionStatus==='error') return `<div class="notice danger">Live settlement feed failed: ${esc(state.recoveryClassActionError||'unknown error')}. The direct source link still works.</div>`;
  if(state.recoveryClassActionStatus==='idle') return `<div class="empty"><strong>Run a recovery scan.</strong><br><span class="small">Use a company, product, employer, app or vehicle keyword — or leave it blank for current featured/open settlements.</span></div>`;
  const rows=state.recoveryClassActions||[];
  if(!rows.length) return `<div class="empty">No settlement in the fetched set matched that keyword. Try a broader company/product term or browse the full settlement directory.</div>`;
  return `<div class="settlement-list">${rows.map(x=>`<article class="settlement-row"><div class="settlement-main"><div class="actions"><span class="badge ok">open settlement</span>${x.deadline?`<span class="badge ${x.deadline==='Varies'?'warn':'teal'}">deadline ${esc(x.deadline)}</span>`:''}${x.payout?`<span class="badge blue">${esc(x.payout)}</span>`:''}</div><h3>${esc(x.title)}</h3>${x.eligibility?`<p>${esc(x.eligibility)}</p>`:''}<span class="small muted">Source: ClassAction.org · verify on settlement administrator site</span></div><a class="btn ghost small" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">Official site ↗</a></article>`).join('')}</div>`;
}


function lawsuitResultsHtml(){
  if(state.recoveryLawsuitStatus==='loading') return `<div class="recovery-loading"><span class="scan-pulse"></span><strong>Scanning open lawsuits…</strong><span class="small muted">Looking for active investigations and filed matters.</span></div>`;
  if(state.recoveryLawsuitStatus==='error') return `<div class="notice danger">Live lawsuit feed failed: ${esc(state.recoveryLawsuitError||'unknown error')}. The direct source link still works.</div>`;
  if(state.recoveryLawsuitStatus==='idle') return `<div class="empty"><strong>Run a recovery scan.</strong><br><span class="small">Use the same company, product, employer, app or vehicle keyword.</span></div>`;
  const rows=state.recoveryLawsuits||[];
  if(!rows.length) return `<div class="empty">No open lawsuit or investigation in the fetched set matched that keyword. Try a broader term or browse the complete lawsuit directory.</div>`;
  return `<div class="settlement-list">${rows.map(x=>`<article class="settlement-row"><div class="settlement-main"><div class="actions"><span class="badge warn">open matter</span></div><h3>${esc(x.title)}</h3>${x.summary?`<p>${esc(x.summary)}</p>`:''}<span class="small muted">Source: ClassAction.org · this is not a determination that you qualify to participate</span></div><a class="btn ghost small" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">View matter ↗</a></article>`).join('')}</div>`;
}

async function loadRecoveryLawsuits(){
  const q=(state.recoveryQuery||'').trim();
  state.recoveryLawsuitStatus='loading';state.recoveryLawsuitError='';render();
  try{
    const r=await fetch(`/api/recovery?kind=lawsuits&q=${encodeURIComponent(q)}`,{headers:{Accept:'application/json'}});
    const body=await r.json().catch(()=>null);
    if(!r.ok) throw new Error(body?.error||`${r.status} ${r.statusText}`);
    state.recoveryLawsuits=Array.isArray(body?.items)?body.items:[];
    state.recoveryLawsuitStatus='success';
  }catch(e){state.recoveryLawsuitStatus='error';state.recoveryLawsuitError=e.message||String(e);}
  render();
}

async function loadRecoverySweep(){
  await Promise.allSettled([loadRecoveryClassActions(),loadRecoveryLawsuits()]);
}

async function loadRecoveryClassActions(){
  const q=(state.recoveryQuery||'').trim();
  state.recoveryClassActionStatus='loading';state.recoveryClassActionError='';render();
  try{
    const r=await fetch(`/api/recovery?kind=classactions&q=${encodeURIComponent(q)}`,{headers:{Accept:'application/json'}});
    const body=await r.json().catch(()=>null);
    if(!r.ok) throw new Error(body?.error||`${r.status} ${r.statusText}`);
    state.recoveryClassActions=Array.isArray(body?.items)?body.items:[];
    state.recoveryClassActionStatus='success';
  }catch(e){state.recoveryClassActionStatus='error';state.recoveryClassActionError=e.message||String(e);}
  render();
}

function wireRecovery(){
  if(state.view!=='recovery') return;
  const input=document.querySelector('#recoveryInput');
  if(input){
    input.addEventListener('input',e=>{state.recoveryQuery=e.target.value;});
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();loadRecoveryClassActions();}});
  }
  document.querySelector('[data-run-recovery]')?.addEventListener('click',loadRecoverySweep);
  document.querySelector('[data-copy-recovery-query]')?.addEventListener('click',async()=>{const q=(state.recoveryQuery||'').trim();if(!q)return;try{await navigator.clipboard.writeText(q);toast('Search term copied.');}catch{toast('Could not copy automatically.',true);}});
  if(state.recoveryClassActionStatus==='idle'&&state.recoveryLawsuitStatus==='idle'&&!state.recoveryClassActions.length&&!state.recoveryLawsuits.length)setTimeout(loadRecoverySweep,0);
}

const __traceforgeBaseRender=render;
render=function(){__traceforgeBaseRender();wireRecovery();if(typeof wireEasterEggs==='function')wireEasterEggs();};
,title:'State unclaimed property',group:'Money',trust:'official directory',description:'Bank accounts, insurance proceeds, checks and other property transferred to state custody.',url:'https://unclaimed.org/search/',secondary:'https://www.missingmoney.com/',secondaryLabel:'Multi-state search',input:'Check every state where you have lived or done business. MissingMoney covers many states at once.'},
  {id:'ftc',icon:'FTC',title:'FTC refunds',group:'Money',trust:'official',description:'Active Federal Trade Commission refund programs for consumers harmed by unlawful business practices.',url:'https://www.ftc.gov/enforcement/refunds',input:'Look for companies or products you used.'},
  {id:'wages',icon:'W2',title:'Workers Owed Wages',group:'Work',trust:'official',description:'Back wages recovered by the U.S. Department of Labor that could not be delivered to workers.',url:'https://webapps.dol.gov/wow',input:'Search an employer name or industry, then check your name on the official site.'},
  {id:'pensions',icon:'401',title:'Missing retirement benefits',group:'Work',trust:'official',description:'PBGC database for unclaimed private-sector pension and retirement benefits from terminated plans.',url:'https://www.pbgc.gov/workers-retirees/find-unclaimed-retirement-benefits/search-unclaimed',input:'The official tool may request last name and the last four of SSN. Enter that only on PBGC.gov.'},
  {id:'fha',icon:'HUD',title:'FHA mortgage refunds',group:'Housing',trust:'official',description:'HUD/FHA mortgage-insurance premium refunds that may still be owed to former FHA borrowers.',url:'https://entp.hud.gov/dsrs/refunds/',input:'Search by last name or FHA case number directly on HUD.gov.'},
  {id:'sec',icon:'SEC',title:'SEC investor distributions',group:'Investing',trust:'official',description:'Fair Funds and disgorgement distributions created to return money to harmed investors.',url:'https://www.sec.gov/enforcement-litigation/distributions-harmed-investors',input:'Search the company, fund, broker or investment product involved.'},
  {id:'fdic',icon:'FDIC',title:'Failed-bank unclaimed funds',group:'Banking',trust:'official',description:'Unclaimed deposits, dividend checks and other funds from failed FDIC-insured institutions.',url:'https://closedbanks.fdic.gov/funds/',input:'Search name, business name, failed institution or check number on FDIC.gov.'},
  {id:'bankruptcy',icon:'BK',title:'Bankruptcy unclaimed funds',group:'Courts',trust:'official',description:'Money held by U.S. bankruptcy courts for creditors, debtors or other parties who did not receive payment.',url:'https://ucf.uscourts.gov/',input:'Search creditor or debtor name on the U.S. Courts locator. CAPTCHA stays on the court site.'}
];

state.recoveryQuery ??= '';
state.recoveryClassActions ??= [];
state.recoveryClassActionStatus ??= 'idle';
state.recoveryClassActionError ??= '';

function recoveryGlyph(id){return ({investigate:'⌕',recovery:'$',cases:'▣',sources:'◎'})[id]||'•';}
function navButton(id,label){return `<button data-nav="${id}" class="${state.view===id?'active':''}"><span class="nav-icon">${recoveryGlyph(id)}</span><span>${label}</span></button>`;}
function sidebar(){
  const saved=state.cases.length;
  return `<aside class="sidebar"><div class="brand"><div class="brand-mark" title="TraceForge">TF</div><div><strong>TraceForge</strong><small>McLain Systems</small></div></div><nav class="nav">${navButton('investigate','Investigate')}${navButton('recovery','Recovery')}${navButton('cases','Cases')}${navButton('sources','Coverage')}</nav><div class="sidebar-status"><strong><span class="live-dot"></span> Evidence-first mode</strong><p>${saved} saved case${saved===1?'':'s'} on this device. Searches stay ephemeral until you explicitly save findings.</p></div></aside>`;
}
function mobileNav(){return `<nav class="mobile-nav">${navButton('investigate','Search')}${navButton('recovery','Recovery')}${navButton('cases','Cases')}${navButton('sources','Coverage')}</nav>`;}
function topbar(){
  const titles={investigate:['Investigation console','Public-source checks with source-per-finding traceability.'],recovery:['Recovery & rights','Find legitimate places where money, claims or distributions may be waiting.'],cases:['Case workspace','Preserve evidence, relationships, timeline and contradictions.'],sources:['Source coverage','See exactly what TraceForge can check and where coverage stops.']};
  const [t,s]=titles[state.view]||titles.investigate;
  return `<header class="topbar"><div><div class="eyebrow">TraceForge / McLain Systems</div><h1>${t}</h1><p class="muted small">${s}</p></div><div class="actions no-print"><button class="btn ghost small" data-clear-session>Clear session</button></div></header>`;
}
function content(){if(state.view==='recovery')return recoveryView();if(state.view==='cases')return casesView();if(state.view==='sources')return sourcesView();return investigateView();}

function recoveryView(){
  const q=state.recoveryQuery;
  return `<section class="section"><div class="recovery-hero"><div><div class="eyebrow">RECOVERY SWEEP</div><h2>Search for money, claims and distributions you may have missed.</h2><p>One workspace for class-action settlements, state property, refunds, back wages, pensions, court funds and investor distributions.</p></div><div class="recovery-search"><input id="recoveryInput" class="search" value="${esc(q)}" placeholder="company, product, employer, app, vehicle…" autocomplete="off" spellcheck="false"><button class="btn primary" data-run-recovery>Scan class actions</button></div><div class="privacy-strip"><strong>Privacy boundary:</strong> never enter SSN, DOB, claim PINs, passwords or account numbers into TraceForge. Sensitive identity checks stay on the official source site.</div></div></section>
  <section class="section"><div class="section-head"><div><h2>Live class-action settlements</h2><p class="small muted">Fetched server-side from ClassAction.org and filtered by your keyword when provided. Always verify eligibility on the official settlement website.</p></div><a class="btn ghost small" href="https://www.classaction.org/settlements" target="_blank" rel="noopener noreferrer">Browse all</a></div>${classActionResultsHtml()}</section>
  <section class="section"><div class="section-head"><div><h2>Recovery sweep</h2><p class="small muted">Nine recovery paths. Seven of these are official U.S. government systems.</p></div><button class="btn ghost small" data-copy-recovery-query ${q?'':'disabled'}>Copy search term</button></div><div class="recovery-grid">${RECOVERY_SOURCES.map(recoveryCard).join('')}</div></section>
  <section class="section"><div class="card inset"><strong>TraceForge rule</strong><p class="small muted" style="margin-bottom:0">Discovery is not entitlement. A listing means “worth checking,” not “you are owed money.” Claim eligibility is determined by the administrator, agency or court that owns the source record.</p></div></section>`;
}

function recoveryCard(s){
  const second=s.secondary?`<a class="recovery-link secondary" href="${s.secondary}" target="_blank" rel="noopener noreferrer">${esc(s.secondaryLabel||'More')}</a>`:'';
  return `<article class="recovery-card"><div class="recovery-card-top"><div class="recovery-icon">${esc(s.icon)}</div><div><span class="badge teal">${esc(s.group)}</span><h3>${esc(s.title)}</h3></div></div><p>${esc(s.description)}</p><div class="recovery-input-note">${esc(s.input)}</div><div class="recovery-card-footer"><span class="small muted">${esc(s.trust)}</span><div class="recovery-links"><a class="recovery-link" href="${s.url}" target="_blank" rel="noopener noreferrer">Open source</a>${second}</div></div></article>`;
}

function classActionResultsHtml(){
  if(state.recoveryClassActionStatus==='loading') return `<div class="recovery-loading"><span class="scan-pulse"></span><strong>Scanning current settlements…</strong><span class="small muted">Filtering against open claim opportunities.</span></div>`;
  if(state.recoveryClassActionStatus==='error') return `<div class="notice danger">Live settlement feed failed: ${esc(state.recoveryClassActionError||'unknown error')}. The direct source link still works.</div>`;
  if(state.recoveryClassActionStatus==='idle') return `<div class="empty"><strong>Run a recovery scan.</strong><br><span class="small">Use a company, product, employer, app or vehicle keyword — or leave it blank for current featured/open settlements.</span></div>`;
  const rows=state.recoveryClassActions||[];
  if(!rows.length) return `<div class="empty">No settlement in the fetched set matched that keyword. Try a broader company/product term or browse the full settlement directory.</div>`;
  return `<div class="settlement-list">${rows.map(x=>`<article class="settlement-row"><div class="settlement-main"><div class="actions"><span class="badge ok">open settlement</span>${x.deadline?`<span class="badge ${x.deadline==='Varies'?'warn':'teal'}">deadline ${esc(x.deadline)}</span>`:''}${x.payout?`<span class="badge blue">${esc(x.payout)}</span>`:''}</div><h3>${esc(x.title)}</h3>${x.eligibility?`<p>${esc(x.eligibility)}</p>`:''}<span class="small muted">Source: ClassAction.org · verify on settlement administrator site</span></div><a class="btn ghost small" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">Official site ↗</a></article>`).join('')}</div>`;
}

async function loadRecoveryClassActions(){
  const q=(state.recoveryQuery||'').trim();
  state.recoveryClassActionStatus='loading';state.recoveryClassActionError='';render();
  try{
    const r=await fetch(`/api/recovery?kind=classactions&q=${encodeURIComponent(q)}`,{headers:{Accept:'application/json'}});
    const body=await r.json().catch(()=>null);
    if(!r.ok) throw new Error(body?.error||`${r.status} ${r.statusText}`);
    state.recoveryClassActions=Array.isArray(body?.items)?body.items:[];
    state.recoveryClassActionStatus='success';
  }catch(e){state.recoveryClassActionStatus='error';state.recoveryClassActionError=e.message||String(e);}
  render();
}

function wireRecovery(){
  if(state.view!=='recovery') return;
  const input=document.querySelector('#recoveryInput');
  if(input){
    input.addEventListener('input',e=>{state.recoveryQuery=e.target.value;});
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();loadRecoveryClassActions();}});
  }
  document.querySelector('[data-run-recovery]')?.addEventListener('click',loadRecoveryClassActions);
  document.querySelector('[data-copy-recovery-query]')?.addEventListener('click',async()=>{const q=(state.recoveryQuery||'').trim();if(!q)return;try{await navigator.clipboard.writeText(q);toast('Search term copied.');}catch{toast('Could not copy automatically.',true);}});
  if(state.recoveryClassActionStatus==='idle'&&!state.recoveryClassActions.length)setTimeout(loadRecoveryClassActions,0);
}

const __traceforgeBaseRender=render;
render=function(){__traceforgeBaseRender();wireRecovery();if(typeof wireEasterEggs==='function')wireEasterEggs();};
