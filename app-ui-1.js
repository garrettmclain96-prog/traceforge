function render(){
  const app=document.querySelector('#app');
  app.innerHTML=`<div class="shell">${sidebar()}<main class="main"><div class="main-inner">${topbar()}${content()}</div></main>${mobileNav()}</div>${modalHtml()}`;
  wire();
}
function navGlyph(id){ return id==='investigate'?'01':id==='cases'?'02':'03'; }
function navButton(id,label){return `<button data-nav="${id}" class="${state.view===id?'active':''}"><span class="nav-icon">${navGlyph(id)}</span><span>${label}</span></button>`;}
function sidebar(){
  const saved=state.cases.length;
  return `<aside class="sidebar">
    <div class="brand"><div class="brand-mark">TF</div><div><strong>TraceForge</strong><small>McLain Systems</small></div></div>
    <nav class="nav">${navButton('investigate','Investigate')}${navButton('cases','Cases')}${navButton('sources','Coverage')}</nav>
    <div class="sidebar-status">
      <strong><span class="live-dot"></span> Evidence-first mode</strong>
      <p>${saved} saved case${saved===1?'':'s'} on this device. Searches stay ephemeral until you explicitly save findings.</p>
    </div>
  </aside>`;
}
function mobileNav(){return `<nav class="mobile-nav">${navButton('investigate','Search')}${navButton('cases','Cases')}${navButton('sources','Coverage')}</nav>`;}
function topbar(){
  const titles={
    investigate:['Investigation console','Public-source checks with source-per-finding traceability.'],
    cases:['Case workspace','Preserve evidence, map relationships, track contradictions, export the record.'],
    sources:['Source coverage','See exactly what TraceForge can check and where coverage stops.']
  };
  const [t,s]=titles[state.view]||titles.investigate;
  return `<header class="topbar"><div class="topbar-copy"><div class="eyebrow">TraceForge / McLain Systems</div><h1>${t}</h1><p class="muted small">${s}</p></div><div class="actions no-print"><button class="btn ghost small" data-clear-session>Clear session</button></div></header>`;
}
function content(){if(state.view==='cases')return casesView();if(state.view==='sources')return sourcesView();return investigateView();}
function providerGlyph(id){return ({github:'GH',gitlab:'GL',dns:'DNS',rdap:'RD',ripe:'ASN',hibp:'BR',phone:'TEL'})[id]||'SRC';}
function sessionStats(){
  const entries=Object.values(state.providers);
  const loaded=entries.filter(p=>!['idle','loading'].includes(p.status)).length;
  const good=entries.filter(p=>p.status==='success').length;
  const findings=allFindings().length;
  const issues=entries.filter(p=>['error','timeout'].includes(p.status)).length;
  return {total:entries.length,loaded,good,findings,issues};
}
function capabilityCards(){
  return `<div class="capability-grid">
    <div class="capability"><div><div class="capability-icon">@</div><h3>Username</h3><p>Exact-handle checks across supported public developer platforms.</p></div><span class="badge teal">multi-source</span></div>
    <div class="capability"><div><div class="capability-icon">MX</div><h3>Email / domain</h3><p>Domain DNS, mail routing, policy records, and registration context.</p></div><span class="badge blue">infrastructure</span></div>
    <div class="capability"><div><div class="capability-icon">IP</div><h3>IP address</h3><p>Routing, ASN, allocation, and registry context without person attribution.</p></div><span class="badge blue">network</span></div>
    <div class="capability"><div><div class="capability-icon">TEL</div><h3>Phone</h3><p>Normalization is ready; ownership lookup stays disabled until a vetted provider is configured.</p></div><span class="badge warn">limited</span></div>
  </div>`;
}
function investigateView(){
  const meta=state.queryMeta;
  const pEntries=Object.values(state.providers);
  const stats=sessionStats();
  return `<section class="section">
    <div class="hero">
      <div class="hero-copy"><div class="eyebrow">PUBLIC-SOURCE INTELLIGENCE WORKSPACE</div><h2>Search an identifier. Keep only what the source can prove.</h2><p>TraceForge checks supported public sources independently, shows gaps instead of inventing conclusions, and lets you preserve selected findings into an auditable case.</p></div>
      <div class="search-shell">
        <input id="searchInput" class="search" value="${esc(state.query)}" placeholder="email, username, domain, IP, or phone" autocomplete="off" autocapitalize="none" spellcheck="false">
        <button class="btn primary" id="searchBtn">${pEntries.some(p=>p.status==='loading')?'Checking...':'Run trace'}</button/Ù]]Û\ÜÏHÙX\ÚY^[\\È]ÛÛ\ÜÏHÙX\ÚY^[\H]KY^[\OHÚ]X\Ù\[YH^[\OØ]Û]ÛÛ\ÜÏHÙX\ÚY^[\H]KY^[\OH^[\KÛÛHÛXZ[^[\OØ]Û]ÛÛ\ÜÏHÙX\ÚY^[\H]KY^[\OHKKKHT^[\OØ]ÛÙ]	ÛY]OØ]Û\ÜÏHÙX\Ú[Y]HÜ[Û\ÜÏHYÙH	ÛY]K[YÉÝX[	ÎÙ\ÜßHÙ\ØÊY]KX[
_OÜÜ[ÛY]K[YØÜ[Û\ÜÏHÛX[]]YÙ\ØÊY]KÜX[^Y
_OÜÜ[ÉßOÙ]ÉßBÙ]ÜÙXÝ[Û	Ü[Y\Ë[ÝØÙXÝ[ÛÛ\ÜÏHÙXÝ[Û]Û\ÜÏHÝ]Ë\ÝÈ]Û\ÜÏHÝ]Ü[ÛÝ\Ù\ÏÜÜ[ÝÛÏÜÝ]ËÝ[OÜÝÛÏÛX[ÜÝ]ËØYYH[\ÚYÜÛX[Ù]]Û\ÜÏHÝ]Ü[]ÚYÜÜ[ÝÛÏÜÝ]ËÛÛÙOÜÝÛÏÛX[ÝXØÙ\ÜÙ[ÝY\ÏÜÛX[Ù]]Û\ÜÏHÝ]Ü[[[ÜÏÜÜ[ÝÛÏÜÝ]Ë[[ÜßOÜÝÛÏÛX[ÛÝ\ÙKXXÚÙY[\ÏÜÛX[Ù]]Û\ÜÏHÝ]Ü[\ÜÏÜÜ[ÝÛÏÜÝ]Ë\ÜÝY\ßOÜÝÛÏÛX[\ÚXK]\Y[ÜÛX[Ù]Ù]ÜÙXÝ[ÛÙXÝ[ÛÛ\ÜÏHÙXÝ[Û]Û\ÜÏH\Ý[]ÛÛ\]ÝÛÏÜÝ]Ë[[ÜÏØ	ÜÝ]Ë[[ÜßH[[ÉÜÝ]Ë[[ÜÏOOLOÉÉÎÜÉßHXYHÈ]Y]ØÐÛÝ\YÙH]\YÈØ]Y[[ÈY]	ßOÜÝÛÏ]Û\ÜÏHÛX[]]YÙ[XÝÛHH[\È[ÝHØ[\Ù\Y\È]Y[ÙKÙ]Ù]	ÜÝ]Ë[[ÜÏØ]Û\ÜÏHXÝ[ÛÈ]ÛÛ\ÜÏHÚÜÝÛX[]K\Ù[XÝX[Ù[XÝ[Ø]Û]ÛÛ\ÜÏH[X\HÛX[]K\Ø]K\Ù[XÝYØ]HÙ[XÝYØ]ÛÙ]ÉßBÙ]]Û\ÜÏHÝY\[\ÝÜ[Y\ËX\
ÝY\[
KÚ[	ÉÊ_OÙ]ÜÙXÝ[ÛÙXÝ[ÛÛ\ÜÏHÙXÝ[Û]Û\ÜÏHÙXÝ[ÛZXY]Ú]\ÈZ[Ø[[ÜXÝÚÛ\ÜÏH]]YÛX[Ý\Ú]ÛHY[YY\XÙQÜÙHÝ]\È]ÈHÝY\È]XÝX[H\KÜÙ]Ù]ØØ\X[]PØ\Ê
_OÜÙXÝ[ÛÙXÝ[ÛÛ\ÜÏHÙXÝ[Û]Û\ÜÏHØ\[Ù]ÝÛÏ]Y[ÙH[OÜÝÛÏÛ\ÜÏHÛX[]]YÝ[OHX\Ú[XÝÛNH\Ý[\ÈÝ[Y[]HÛZ[K]\H]ÚY[HÙY\È]ÈÝY\ÛÝ\ÙHTÚXÚÈ[YK[[Z]][Û[Ý\ÜYÛÝ\YÙHÝ^\È\ÚXH[Ý\ÜYÜÙ]ÜÙXÝ[ÛXÂB[Ý[ÛÝ]\ÐYÙJ
^ÂÛÛÝO^ÛØY[ÎÉÝX[	Ë	ÐÚXÚÚ[É×KÝXØÙ\ÜÎÉÛÚÉË	Ñ]ÚY	×KÉÛË[X]Ú	×NÉÝØ\Ë	ÓÈX]Ú	×K\ÜÉÙ\ÜË	Ñ\Ü×K[Y[Ý]ÉÙ\ÜË	Õ[Y[Ý]	×K[Ý\ÜYÉÝØ\Ë	Õ[]Z[XI×KYNÉÉË	Ô]Y]YY	×_NÂÛÛÝØËO[VÜÝ]\×_ÉÉËÝ]\×NÂ]\Ü[Û\ÜÏHYÙH	ØßHÜ[Û\ÜÏHÝ]\ËYÝÜÜ[ÛOÜÜ[ÂB[Ý[ÛÝY\[

^Â]\\XÛHÛ\ÜÏHÝY\]K\Ý]\ÏHÙ\ØÊÝ]\Ê_H]Û\ÜÏHÝY\ZXY]Û\ÜÏHÝY\]]H]Û\ÜÏHÝY\YÛ\ÜÝY\Û\
Y
_OÙ]]ÏÙ\ØÊ[YJ_OÚÏ]Û\ÜÏHÛX[]]YÜÝY\ØÛÜJY
_OÙ]Ù]Ù]]Û\ÜÏHXÝ[ÛÈÜÝ]\ÐYÙJ
_IÖÉÙ\ÜË	Ý[Y[Ý]	Ë	ÛË[X]Ú	×K[ÛY\ÊÝ]\ÊIÉÙÚ]XË	ÙÚ]XË	ÙÉË	Ü\	Ë	Ü\\	Ë	Ü\I×K[ÛY\ÊY
OØ]ÛÛ\ÜÏHÛX[ÚÜÝ]K\]OHÜYH]OØ]ÛÉßOÙ]Ù]	ÜÝOØ]Û\ÜÏHÝXÙHØ\Ù\ØÊÝJ_OÙ]ÉßB	Ü\ÜØ]Û\ÜÏHÝXÙH[Ù\Ù\ØÊ\Ü_OÙ]ÉßB	ÜÝ]\ÏOOIÛË[X]Ú	ÏØ]Û\ÜÏHÝXÙH\ÈÝY\]\YÈX]Ú[È\Ý[]\ÈÝÛÙHY[YY\\È[\ÙY[Ù]Ú\KÙ]ÉßB	Ü[[ÜÏË[ÝÜ[[ÜËX\
[[Ò[
KÚ[	ÉÊNÉßBØ\XÛOÂB[Ý[ÛÝY\ØÛÜJY
^Â]\
ÙÚ]XÜXXÈ][Ü\Ù[IËÚ]XÜXXÈ][Ü\Ù[IËÎÜXXÈÈXÛÜÉË\ÙÛXZ[YÚ\Ý][ÛYÚ\ÝIË\\ÒTYÚ\ÝH[ØØ][ÛË\NÜÝ][È[TÓÛÛ^	ËXØXXÚÝY\ËÛNÜÛHÝÛ\Ú\ÝY\ßJVÚY_	ÜXXÈÛÝ\ÙIÎÂB[Ý[Û[[Ò[
^Â]\]Û\ÜÏHÚXÚÛ[H[]\XK[X[HÙ[XÝ[[È\OHÚXÚØÞ]KY[[ËXÚXÚÏHÙYH	ÜÝ]KÙ[XÝY[[ÒYË\ÊY
OÉØÚXÚÙY	ÎÉßO]Û\ÜÏH[[ÈÙ\ØÊØÙ\][Û_OÜ]Û\ÜÏH[[Ë[Y]HÜ[Ù\ØÊÝY\_OÜÜ[Ü[Ù\ØÊ]]JÚXÚÙY]
J_OÜÜ[HYHÙ\ØÊ\
_H\Ù]HØ[È[HÛÜ[\ÜY\\Ü[ÛÝ\ÙOØOÙ]]Û\ÜÏHÛX[]]Y[Z]	Ù\ØÊ[Z]][Û_OÙ]Ù]Ù]ÂB