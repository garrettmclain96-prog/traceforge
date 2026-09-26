/*
 * TraceForge source catalog / orchestration layer.
 *
 * Purpose:
 * - Keep a structured inventory of useful public-source research tools.
 * - Separate what TraceForge actually fetches from what it only recommends.
 * - Suggest next-step pivots based on the identifier currently being investigated.
 * - Preserve the evidence-first contract: manual tools do not become "findings"
 *   until the user reviews and saves evidence with provenance.
 *
 * This file intentionally does NOT automate credentialed services, breach dumps,
 * stealer logs, private databases, or covert tracking.
 */

const SOURCE_CATALOG = [
  {
    id:'github', name:'GitHub', category:'People & social',
    inputs:['username'], outputs:['public profile','repositories'],
    access:['API','Browser'], pricing:'Free', mode:'integrated',
    url:'https://github.com/', checked:'2026-09-25',
    bestFor:'Exact public developer-handle checks.',
    limit:'A matching handle does not prove a person’s identity or ownership.'
  },
  {
    id:'gitlab', name:'GitLab', category:'People & social',
    inputs:['username'], outputs:['public profile'],
    access:['API','Browser'], pricing:'Free', mode:'integrated',
    url:'https://gitlab.com/', checked:'2026-09-25',
    bestFor:'Exact public GitLab handle checks.',
    limit:'A matching handle does not prove identity or account ownership.'
  },
  {
    id:'dns', name:'Cloudflare DNS + Google Public DNS', category:'Domain / DNS',
    inputs:['domain','email'], outputs:['A','AAAA','MX','TXT','DMARC'],
    access:['API'], pricing:'Free', mode:'integrated',
    url:'https://dns.google/', checked:'2026-09-25',
    bestFor:'Public DNS and mail-routing context.',
    limit:'DNS can describe infrastructure; it does not prove a mailbox or person exists.'
  },
  {
    id:'rdap-domain', name:'RDAP domain', category:'Domain / DNS',
    inputs:['domain','email'], outputs:['registration context','status'],
    access:['API','Browser'], pricing:'Free', mode:'integrated',
    url:'https://rdap.org/', checked:'2026-09-25',
    bestFor:'Registry-level domain registration and lifecycle context.',
    limit:'Registry data does not establish who controls a specific email address.'
  },
  {
    id:'ripestat', name:'RIPEstat', category:'Infrastructure',
    inputs:['ip'], outputs:['prefix','ASN','routing context'],
    access:['API','Browser'], pricing:'Free', mode:'integrated',
    url:'https://stat.ripe.net/', checked:'2026-09-25',
    bestFor:'Network origin and routing context for public IP addresses.',
    limit:'Routing data is not person attribution or precise device geolocation.'
  },
  {
    id:'rdap-ip', name:'RDAP IP', category:'Infrastructure',
    inputs:['ip'], outputs:['allocation','registry context'],
    access:['API','Browser'], pricing:'Free', mode:'integrated',
    url:'https://rdap.org/', checked:'2026-09-25',
    bestFor:'Public IP allocation and registry context.',
    limit:'Allocation records describe address blocks, not individual people or devices.'
  },

  {
    id:'archivebox', name:'ArchiveBox', category:'Archives',
    inputs:['url','domain'], outputs:['preserved page','snapshots'],
    access:['Self-hosted','Browser'], pricing:'Free', mode:'candidate',
    url:'https://archivebox.io/', checked:'2026-09-19',
    bestFor:'Keeping a durable local archive of public web evidence.',
    limit:'Requires deployment and storage ownership; preserved content still needs source context.'
  },
  {
    id:'browsertrix', name:'Browsertrix', category:'Archives',
    inputs:['url','domain'], outputs:['replayable web archive'],
    access:['Self-hosted','SaaS','API'], pricing:'Paid / open components', mode:'candidate',
    url:'https://browsertrix.com/', checked:'2026-09-19',
    bestFor:'Repeatable capture of dynamic public websites.',
    limit:'Operationally heavier than a simple screenshot or single-page save.'
  },
  {
    id:'wayback', name:'Internet Archive Wayback Machine', category:'Archives',
    inputs:['url','domain'], outputs:['historical snapshots'],
    access:['Browser'], pricing:'Free', mode:'manual',
    url:'https://web.archive.org/', checked:'2026-09-25',
    bestFor:'Historical versions of public web pages.',
    limit:'Coverage is incomplete and capture dates are not the same as publication dates.'
  },
  {
    id:'firecrawl', name:'Firecrawl', category:'Collection',
    inputs:['url','domain'], outputs:['structured page content'],
    access:['API','SaaS','Self-hosted'], pricing:'Freemium', mode:'candidate',
    url:'https://firecrawl.dev/', checked:'2026-09-19',
    bestFor:'Converting permitted public pages into structured research inputs.',
    limit:'Collection scope, robots rules, site terms, and rate limits still apply.'
  },
  {
    id:'crawl4ai', name:'Crawl4AI', category:'Collection',
    inputs:['url','domain'], outputs:['structured page content'],
    access:['Self-hosted','Desktop'], pricing:'Free', mode:'candidate',
    url:'https://docs.crawl4ai.com/', checked:'2026-09-19',
    bestFor:'Local configurable crawling where you control extraction and storage.',
    limit:'Self-hosting shifts maintenance, compliance, and data-retention duties to you.'
  },
  {
    id:'amass', name:'OWASP Amass', category:'Domain / DNS',
    inputs:['domain'], outputs:['subdomains','asset relationships'],
    access:['Self-hosted','Desktop'], pricing:'Free', mode:'candidate',
    url:'https://owasp.org/www-project-amass/', checked:'2026-09-19',
    bestFor:'Authorized external asset discovery around domains you control or are permitted to assess.',
    limit:'Use only within a clearly scoped, authorized asset-inventory workflow.'
  },
  {
    id:'theharvester', name:'theHarvester', category:'Domain / DNS',
    inputs:['domain'], outputs:['hosts','emails','public leads'],
    access:['Self-hosted','Desktop'], pricing:'Free', mode:'candidate',
    url:'https://github.com/laramies/theHarvester', checked:'2026-09-19',
    bestFor:'First-pass passive discovery around an organization’s public footprint.',
    limit:'Returned leads require verification; collection sources and terms vary.'
  },
  {
    id:'crtsh', name:'crt.sh', category:'Domain / DNS',
    inputs:['domain'], outputs:['certificate transparency names'],
    access:['Browser'], pricing:'Free', mode:'manual',
    url:'https://crt.sh/', checked:'2026-09-25',
    bestFor:'Finding certificate-transparency names related to a domain.',
    limit:'Certificate names can be stale, shared, or unrelated to a currently active host.'
  },
  {
    id:'urlscan', name:'urlscan.io', category:'Threat triage',
    inputs:['url','domain'], outputs:['public scan metadata','page artifacts'],
    access:['API','Browser'], pricing:'Freemium', mode:'candidate',
    url:'https://urlscan.io/', checked:'2026-09-25',
    bestFor:'Reviewing public URL/domain scan context and page artifacts.',
    limit:'Submitting a URL can make it public depending on scan settings; avoid private or sensitive URLs.'
  },
  {
    id:'intelowl', name:'IntelOwl', category:'Threat triage',
    inputs:['domain','ip','url','hash'], outputs:['enrichment results'],
    access:['Self-hosted','API','Browser'], pricing:'Free', mode:'candidate',
    url:'https://intelowlproject.github.io/', checked:'2026-09-19',
    bestFor:'Orchestrating controlled indicator enrichment across configured services.',
    limit:'Quality depends on connector configuration, permissions, and source-specific limits.'
  },
  {
    id:'opencti', name:'OpenCTI', category:'Threat intelligence',
    inputs:['domain','ip','url','hash','event'], outputs:['entities','relationships','reports'],
    access:['Self-hosted','API','SaaS'], pricing:'Freemium', mode:'candidate',
    url:'https://filigran.io/solutions/opencti/', checked:'2026-09-19',
    bestFor:'Structured knowledge, provenance, and relationship management for threat-intelligence teams.',
    limit:'Deployment, ontology, connector maintenance, and duplicate handling require ongoing ownership.'
  },
  {
    id:'misp', name:'MISP', category:'Threat intelligence',
    inputs:['domain','ip','url','hash','event'], outputs:['indicators','events','sharing packages'],
    access:['Self-hosted','API'], pricing:'Free', mode:'candidate',
    url:'https://www.misp-project.org/', checked:'2026-09-25',
    bestFor:'Controlled threat-intelligence sharing and correlation.',
    limit:'Designed for governed intelligence workflows, not casual identity lookups.'
  },

  {
    id:'propublica-nonprofit', name:'ProPublica Nonprofit Explorer', category:'Company research',
    inputs:['company','organization','person'], outputs:['Form 990 filings','officers','financials'],
    access:['Browser'], pricing:'Free', mode:'manual',
    url:'https://projects.propublica.org/nonprofits/', checked:'2026-09-19',
    bestFor:'Researching U.S. nonprofit filings, finances, and officers.',
    limit:'Coverage is nonprofit-specific and filing years may lag current operations.'
  },
  {
    id:'sec-edgar', name:'SEC EDGAR', category:'Company research',
    inputs:['company','organization'], outputs:['public company filings'],
    access:['API','Browser'], pricing:'Free', mode:'manual',
    url:'https://www.sec.gov/edgar/search/', checked:'2026-09-25',
    bestFor:'Primary-source U.S. securities filings.',
    limit:'EDGAR covers SEC filers; not every private company appears.'
  },
  {
    id:'littlesis', name:'LittleSis', category:'Company research',
    inputs:['person','company','organization'], outputs:['public relationships','organizations'],
    access:['Browser'], pricing:'Free', mode:'manual',
    url:'https://littlesis.org/', checked:'2026-09-19',
    bestFor:'Exploring public relationships among organizations and public figures.',
    limit:'Treat relationships as research leads and verify important links against primary sources.'
  },

  {
    id:'mapwarper', name:'Map Warper', category:'Maps / geolocation',
    inputs:['location','document'], outputs:['georeferenced historical map'],
    access:['Browser','Self-hosted'], pricing:'Free', mode:'manual',
    url:'https://mapwarper.net/', checked:'2026-09-19',
    bestFor:'Aligning historical maps with modern geography.',
    limit:'Georeferencing accuracy depends on map quality and control points.'
  },

  {
    id:'foca', name:'FOCA', category:'Documents',
    inputs:['document','domain'], outputs:['document metadata','exposure clues'],
    access:['Desktop','Self-hosted'], pricing:'Free', mode:'manual',
    url:'https://github.com/ElevenPaths/FOCA', checked:'2026-09-19',
    bestFor:'Inspecting metadata in public documents for exposure-review clues.',
    limit:'Metadata can be stripped, stale, templated, or unrelated to the current publisher.'
  },
  {
    id:'pinpoint', name:'Google Pinpoint', category:'Documents',
    inputs:['document','corpus'], outputs:['searchable document collection'],
    access:['Browser'], pricing:'Free', mode:'manual',
    url:'https://journaliststudio.google.com/pinpoint/', checked:'2026-09-19',
    bestFor:'Searching large permitted collections of reports, scans, and recordings.',
    limit:'Use only corpora you are allowed to upload or analyze.'
  },
  {
    id:'duckdb', name:'DuckDB', category:'Analysis',
    inputs:['csv','parquet','dataset'], outputs:['SQL analysis'],
    access:['Desktop','Library'], pricing:'Free', mode:'candidate',
    url:'https://duckdb.org/', checked:'2026-09-19',
    bestFor:'Fast local analysis of structured research files without a database server.',
    limit:'It analyzes the data you give it; provenance and source quality remain your responsibility.'
  },
  {
    id:'datasette', name:'Datasette', category:'Analysis',
    inputs:['sqlite','dataset'], outputs:['searchable evidence interface','queries'],
    access:['Self-hosted','API','Browser'], pricing:'Free', mode:'candidate',
    url:'https://datasette.io/', checked:'2026-09-19',
    bestFor:'Publishing or browsing structured investigation records with reproducible queries.',
    limit:'Access controls and sensitive-data handling must be designed before sharing.'
  },
  {
    id:'4cat', name:'4CAT', category:'Social research',
    inputs:['social dataset','corpus'], outputs:['analysis','derived datasets'],
    access:['Self-hosted','Browser'], pricing:'Free', mode:'candidate',
    url:'https://4cat.nl/', checked:'2026-09-19',
    bestFor:'Reproducible analysis of permitted social-platform datasets.',
    limit:'Platform terms, collection permissions, and dataset provenance still govern use.'
  },
  {
    id:'ghunt', name:'GHunt', category:'People & social',
    inputs:['email','google-account-clue'], outputs:['public account signals'],
    access:['Self-hosted','Desktop'], pricing:'Free', mode:'manual',
    url:'https://github.com/mxrch/GHunt', checked:'2026-09-19',
    bestFor:'Authorized review of public Google-account signals.',
    limit:'Use only for accounts you own or are authorized to investigate; results are leads, not identity proof.'
  },
  {
    id:'spiderfoot', name:'SpiderFoot', category:'Automation',
    inputs:['domain','ip','email','username','company'], outputs:['public-source leads','enrichment results'],
    access:['Self-hosted'], pricing:'Freemium', mode:'candidate',
    url:'https://www.spiderfoot.net/', checked:'2026-05-07',
    bestFor:'Broad first-pass enrichment around a clearly scoped, authorized lead.',
    limit:'Automation can create noisy or stale leads; consequential relationships still require manual verification.'
  },
  {
    id:'maigret', name:'Maigret', category:'People & social',
    inputs:['username'], outputs:['public account leads','report'],
    access:['Desktop','Self-hosted'], pricing:'Free', mode:'candidate',
    url:'https://github.com/soxoj/maigret', checked:'2026-05-27',
    bestFor:'Broad public username discovery and exportable lead generation.',
    limit:'A username match is a lead only; shared handles and false positives require corroboration.'
  },
  {
    id:'sherlock', name:'Sherlock', category:'People & social',
    inputs:['username'], outputs:['public account leads'],
    access:['Desktop','Self-hosted'], pricing:'Free', mode:'candidate',
    url:'https://github.com/sherlock-project/sherlock', checked:'2026-05-27',
    bestFor:'Checking a distinctive username across public services.',
    limit:'Site responses can change and a handle match does not establish common ownership.'
  },
  {
    id:'whatsmyname', name:'WhatsMyName', category:'People & social',
    inputs:['username'], outputs:['public account leads'],
    access:['Desktop','Self-hosted'], pricing:'Free', mode:'manual',
    url:'https://github.com/WebBreacher/WhatsMyName', checked:'2026-05-07',
    bestFor:'Reviewing public username leads across a broad service list.',
    limit:'Treat matches as leads and verify them against profile content or another independent source.'
  },
  {
    id:'shodan', name:'Shodan', category:'Infrastructure',
    inputs:['ip','domain'], outputs:['public service exposure','banners','technology clues'],
    access:['SaaS','Browser'], pricing:'Freemium', mode:'manual',
    url:'https://www.shodan.io/', checked:'2026-05-27',
    bestFor:'First-pass public-internet exposure review for scoped hosts and organizations.',
    limit:'Exposure data can be stale; use only for lawful, authorized security or infrastructure research.'
  }
];

state.sourceCatalogQuery ??= '';
state.sourceCatalogFilter ??= 'all';

function catalogModeLabel(mode){
  return ({integrated:'Integrated now',candidate:'Integration candidate',manual:'Manual pivot'})[mode] || mode;
}
function catalogModeBadge(mode){
  return mode==='integrated' ? 'ok' : mode==='candidate' ? 'teal' : 'warn';
}
function catalogInputForCurrentQuery(){
  const t=state.queryMeta?.type;
  if(t==='email'||t==='username'||t==='domain'||t==='ip'||t==='phone') return t;
  return null;
}
function buildCatalogUrl(source){
  const meta=state.queryMeta;
  if(!meta?.valid) return source.url;
  const v=encodeURIComponent(meta.normalized);
  const domain=encodeURIComponent(meta.domain || meta.normalized);
  if(source.id==='github' && meta.type==='username') return `https://github.com/${v}`;
  if(source.id==='gitlab' && meta.type==='username') return `https://gitlab.com/${v}`;
  if(source.id==='rdap-domain' && ['domain','email'].includes(meta.type)) return `https://rdap.org/domain/${domain}`;
  if(source.id==='rdap-ip' && meta.type==='ip') return `https://rdap.org/ip/${v}`;
  if(source.id==='dns' && ['domain','email'].includes(meta.type)) return `https://dns.google/query?name=${domain}`;
  if(source.id==='crtsh' && meta.type==='domain') return `https://crt.sh/?q=%25.${domain}`;
  if(source.id==='urlscan' && meta.type==='domain') return `https://urlscan.io/search/#domain:${domain}`;
  if(source.id==='wayback' && meta.type==='domain') return `https://web.archive.org/web/*/${domain}/*`;
  return source.url;
}
function sourceMatchesQuery(source, query, filter){
  if(filter!=='all' && !source.inputs.includes(filter) && source.mode!==filter && source.category!==filter) return false;
  if(!query) return true;
  const hay=[source.name,source.category,source.bestFor,source.limit,source.inputs.join(' '),source.outputs.join(' '),source.access.join(' '),source.pricing,catalogModeLabel(source.mode)].join(' ').toLowerCase();
  return hay.includes(query.toLowerCase());
}
function catalogCard(source, compact=false){
  const href=buildCatalogUrl(source);
  return `<article class="catalog-card ${compact?'compact':''}">
    <div class="catalog-head">
      <div>
        <div class="actions">
          <span class="badge ${catalogModeBadge(source.mode)}">${esc(catalogModeLabel(source.mode))}</span>
          <span class="badge">${esc(source.category)}</span>
        </div>
        <h3>${esc(source.name)}</h3>
      </div>
      <span class="catalog-access">${esc(source.access.join(' · '))}</span>
    </div>
    <p>${esc(source.bestFor)}</p>
    <div class="catalog-io"><strong>Works from</strong> ${esc(source.inputs.join(', '))}<br><strong>Produces</strong> ${esc(source.outputs.join(', '))}</div>
    <div class="small muted">Limit: ${esc(source.limit)}</div>
    <div class="catalog-footer">
      <span class="small muted">${esc(source.pricing)} · checked ${esc(source.checked)}</span>
      <a class="btn small ghost" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${state.queryMeta?.valid && source.inputs.includes(catalogInputForCurrentQuery()) ? 'Open pivot ↗' : 'Open source ↗'}</a>
    </div>
  </article>`;
}

function suggestedCatalogSources(){
  const input=catalogInputForCurrentQuery();
  if(!input) return [];
  const preferred={
    username:['maigret','sherlock','whatsmyname','spiderfoot'],
    email:['ghunt','spiderfoot'],
    domain:['crtsh','wayback','amass','urlscan','firecrawl','archivebox'],
    ip:['shodan','intelowl','spiderfoot','opencti','misp']
  };
  const ids=preferred[input]||[];
  const picked=ids.map(id=>SOURCE_CATALOG.find(s=>s.id===id)).filter(Boolean);
  if(picked.length) return picked.slice(0,6);
  return SOURCE_CATALOG.filter(s=>s.inputs.includes(input) && s.mode!=='integrated').slice(0,6);
}

const __traceforgeInvestigateViewWithCatalogBase = investigateView;
investigateView=function(){
  const base=__traceforgeInvestigateViewWithCatalogBase();
  const meta=state.queryMeta;
  if(!meta?.valid) return base;
  const suggestions=suggestedCatalogSources();
  if(!suggestions.length) return base + `<section class="section"><div class="card inset"><strong>No additional automated pivot configured for ${esc(meta.label)}.</strong><p class="small muted" style="margin-bottom:0">TraceForge keeps unsupported coverage visible rather than substituting an unrelated lookup.</p></div></section>`;
  return base + `<section class="section"><div class="section-head"><div><div class="eyebrow">NEXT PIVOTS</div><h2>Useful follow-on sources for this identifier</h2><p class="small muted">These are recommendations, not findings. Nothing becomes evidence until you review it and save provenance.</p></div><button class="btn small ghost" data-nav="sources">Open full catalog</button></div><div class="catalog-grid compact-grid">${suggestions.map(s=>catalogCard(s,true)).join('')}</div></section>`;
};

function sourcesView(){
  const q=state.sourceCatalogQuery||'';
  const filter=state.sourceCatalogFilter||'all';
  const current=catalogInputForCurrentQuery();
  const filters=['all','integrated','candidate','manual','username','email','domain','ip','url','company','person','document','location'];
  const rows=SOURCE_CATALOG.filter(s=>sourceMatchesQuery(s,q,filter));
  const integrated=SOURCE_CATALOG.filter(s=>s.mode==='integrated').length;
  const candidates=SOURCE_CATALOG.filter(s=>s.mode==='candidate').length;
  const manual=SOURCE_CATALOG.filter(s=>s.mode==='manual').length;
  return `<section class="section"><div class="hero catalog-hero"><div class="hero-copy"><div class="eyebrow">SOURCE ORCHESTRATOR</div><h2>Use the directory as infrastructure, not a pile of bookmarks.</h2><p>TraceForge separates live integrations, integration candidates, and manual pivots. Search by source, task, evidence type, or access model.</p></div>
    <div class="catalog-search-row">
      <input id="sourceCatalogSearch" class="search" value="${esc(q)}" placeholder="tool, task, source type, workflow…" autocomplete="off" spellcheck="false">
      <select id="sourceCatalogFilter" class="input" aria-label="Filter source catalog">${filters.map(f=>`<option value="${esc(f)}" ${filter===f?'selected':''}>${esc(f==='all'?'All sources':f)}</option>`).join('')}</select>
    </div>
    ${current?`<div class="search-meta"><span class="badge teal">Current identifier: ${esc(current)}</span><button class="search-example" data-catalog-current>Show matching sources</button></div>`:''}
  </div></section>
  <section class="section"><div class="stats-row"><div class="stat"><span>Catalog</span><strong>${SOURCE_CATALOG.length}</strong><small>structured sources</small></div><div class="stat"><span>Integrated</span><strong>${integrated}</strong><small>TraceForge fetches now</small></div><div class="stat"><span>Candidates</span><strong>${candidates}</strong><small>API / self-host options</small></div><div class="stat"><span>Manual</span><strong>${manual}</strong><small>review-first pivots</small></div></div></section>
  <section class="section"><div class="section-head"><div><h2>${rows.length} matching source${rows.length===1?'':'s'}</h2><p class="small muted">Manual and candidate sources never silently become evidence. Review first, then preserve what the source actually supports.</p></div></div>
    ${rows.length?`<div class="catalog-grid">${rows.map(s=>catalogCard(s)).join('')}</div>`:`<div class="empty">No source matches that filter.</div>`}
  </section>
  <section class="section"><div class="card inset"><strong>Catalog provenance</strong><p class="small muted" style="margin-bottom:0">This registry is a TraceForge-maintained shortlist informed by OSINT4ALL’s current directory and primary tool sites. It is not a mirror of OSINT4ALL, and inclusion is not an endorsement. Tool availability, terms, pricing, and capabilities can change.</p></div></section>`;
}

function wireSourceCatalog(){
  const input=document.querySelector('#sourceCatalogSearch');
  if(input) input.addEventListener('input',e=>{state.sourceCatalogQuery=e.target.value;render();setTimeout(()=>document.querySelector('#sourceCatalogSearch')?.focus(),0);});
  const filter=document.querySelector('#sourceCatalogFilter');
  if(filter) filter.addEventListener('change',e=>{state.sourceCatalogFilter=e.target.value;render();});
  document.querySelector('[data-catalog-current]')?.addEventListener('click',()=>{const current=catalogInputForCurrentQuery();if(!current)return;state.sourceCatalogFilter=current;render();});
}

const __traceforgeCatalogRenderBase = render;
render=function(){__traceforgeCatalogRenderBase();wireSourceCatalog();};
