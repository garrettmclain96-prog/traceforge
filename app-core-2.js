async function runGithub(meta,signal){
  const p=providerState('github','GitHub','loading'); state.providers.github=p; render();
  try {
    const h=encodeURIComponent(meta.normalized);
    const url=`https://api.github.com/users/${h}`;
    const data=await fetchJson(url,{headers:{'Accept':'application/vnd.github+json'}},signal);
    p.status='success';
    p.findings=[finding('GitHub',meta.normalized,
      `Exact public handle exists. Account type: ${data.type || 'unknown'}; public repos: ${data.public_repos ?? 'unknown'}; created: ${data.created_at || 'unknown'}${data.bio?`; bio: ${data.bio}`:''}.`,
      data.html_url || `https://github.com/${h}`,
      'GitHub public profile metadata only. A matching handle does not prove a person’s identity or ownership.',
      {sourceType:'api',raw:{login:data.login,type:data.type,public_repos:data.public_repos,created_at:data.created_at,bio:data.bio,blog:data.blog}}
    )];
  } catch(e){ if(signal.aborted) return; p.status=e.status===404?'no-match':(e.name==='TimeoutError'?'timeout':'error'); p.error=e.message; }
  render();
}

async function dnsQuery(name,type,signal){
  const q=`name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;
  try {
    const url=`https://cloudflare-dns.com/dns-query?${q}`;
    const data=await fetchJson(url,{headers:{'Accept':'application/dns-json'}},signal);
    return {provider:'Cloudflare DNS',url,data};
  } catch(first){
    if(signal.aborted) throw first;
    const url=`https://dns.google/resolve?${q}`;
    const data=await fetchJson(url,{},signal);
    return {provider:'Google Public DNS',url,data};
  }
}
async function runDns(meta,signal){
  const domain=meta.domain || meta.normalized;
  const p=providerState('dns','DNS','loading'); state.providers.dns=p; render();
  const specs=[['A',domain],['AAAA',domain],['MX',domain],['TXT',domain],['DMARC TXT',`_dmarc.${domain}`]];
  try {
    const results=[];
    for(const [label,name] of specs){
      const type=label==='DMARC TXT'?'TXT':label;
      try {
        const q=await dnsQuery(name,type,signal);
        const answers=Array.isArray(q.data?.Answer)?q.data.Answer:[];
        const vals=answers.map(a=>String(a.data)).filter(Boolean);
        const obs=label==='MX' && vals.some(v=>/^0\s+\.$/.test(v.trim()))
          ? 'Null MX is published (domain explicitly does not accept email).'
          : vals.length ? `${label}: ${vals.join(' · ')}` : `${label}: no answer returned.`;
        results.push(finding(q.provider,domain,obs,q.url,
          label==='MX' ? 'DNS describes domain mail routing, not whether a specific mailbox exists.' : 'DNS is public infrastructure data and may change over time.',
          {recordType:label,sourceType:'api'}));
      } catch(e){
        if(signal.aborted) throw e;
        results.push(finding('DNS',domain,`${label} check failed: ${e.message}`,`https://dns.google/query?name=${encodeURIComponent(name)}&rr_type=${encodeURIComponent(type)}`,'Manual link only; this line is not a successful fetched DNS observation.',{recordType:label,sourceType:'manual-link',failed:true}));
      }
    }
    p.findings=results;
    const fetched=results.filter(x=>!x.failed);
    p.status=fetched.length?'success':'error';
    if(!fetched.length) p.error='All DNS checks failed.';
  } catch(e){ if(signal.aborted) return; p.status=e.name==='TimeoutError'?'timeout':'error'; p.error=e.message; }
  render();
}

async function runRipe(meta,signal){
  const p=providerState('ripe','RIPEstat','loading'); state.providers.ripe=p; render();
  try {
    const url=`https://stat.ripe.net/data/network-info/data.json?resource=${encodeURIComponent(meta.normalized)}`;
    const data=await fetchJson(url,{},signal);
    const d=data?.data || {};
    const parts=[];
    if(d.prefix) parts.push(`prefix ${d.prefix}`);
    if(Array.isArray(d.asns) && d.asns.length) parts.push(`origin ASN${d.asns.length>1?'s':''} ${d.asns.join(', ')}`);
    p.status=parts.length?'success':'no-match';
    if(parts.length) p.findings=[finding('RIPEstat',meta.normalized,`Network information: ${parts.join('; ')}.`,url,'Routing information identifies network allocation/origin context, not a specific person or precise device location.',{sourceType:'api',raw:d})];
  } catch(e){ if(signal.aborted) return; p.status=e.name==='TimeoutError'?'timeout':'error'; p.error=e.message; }
  render();
}

async function runGitlab(meta,signal){
  const p=providerState('gitlab','GitLab','loading'); state.providers.gitlab=p; render();
  try{
    const url=`https://gitlab.com/api/v4/users?username=${encodeURIComponent(meta.normalized)}`;
    const data=await fetchJson(url,{},signal);
    const arr=Array.isArray(data)?data:[];
    const user=arr.find(x=>String(x.username||'').toLowerCase()===meta.normalized.toLowerCase());
    if(!user){p.status='no-match';}
    else{
      p.status='success';
      p.findings=[finding('GitLab',meta.normalized,
        `Exact public handle exists. Account state: ${user.state||'unknown'}${user.name?`; display name: ${user.name}`:''}.`,
        user.web_url||`https://gitlab.com/${encodeURIComponent(meta.normalized)}`,
        'GitLab public profile metadata only. A matching handle does not prove identity or ownership.',
        {sourceType:'api',raw:{id:user.id,username:user.username,name:user.name,state:user.state,web_url:user.web_url}}
      )];
    }
  }catch(e){if(signal.aborted)return;p.status=e.name==='TimeoutError'?'timeout':'error';p.error=e.message;}
  render();
}

async function runRdapDomain(meta,signal){
  const domain=meta.domain||meta.normalized;
  const p=providerState('rdap','RDAP domain','loading'); state.providers.rdap=p; render();
  try{
    const url=`https://rdap.org/domain/${encodeURIComponent(domain)}`;
    const d=await fetchJson(url,{},signal);
    const events=Array.isArray(d?.events)?d.events:[];
    const reg=events.find(e=>e.eventAction==='registration')?.eventDate;
    const exp=events.find(e=>e.eventAction==='expiration')?.eventDate;
    const bits=[d?.ldhName||domain];
    if(Array.isArray(d?.status)&&d.status.length) bits.push(`status ${d.status.join(', ')}`);
    if(reg) bits.push(`registered ${reg}`);
    if(exp) bits.push(`expires ${exp}`);
    p.status='success';
    p.findings=[finding('RDAP',domain,`Registration context: ${bits.join('; ')}.`,url,'Registry data describes the domain registration, not a specific person behind an email address.',{sourceType:'api'})];
  }catch(e){if(signal.aborted)return;p.status=e.status===404?'no-match':(e.name==='TimeoutError'?'timeout':'error');p.error=e.message;}
  render();
}

async function runRdapIp(meta,signal){
  const p=providerState('rdapip','RDAP IP','loading'); state.providers.rdapip=p; render();
  try{
    const url=`https://rdap.org/ip/${encodeURIComponent(meta.normalized)}`;
    const d=await fetchJson(url,{},signal);
    const bits=[];
    if(d?.name) bits.push(d.name);
    if(d?.handle) bits.push(`handle ${d.handle}`);
    if(d?.startAddress&&d?.endAddress) bits.push(`${d.startAddress} – ${d.endAddress}`);
    if(d?.country) bits.push(`country code ${d.country}`);
    p.status=bits.length?'success':'no-match';
    if(bits.length) p.findings=[finding('RDAP',meta.normalized,`IP registry context: ${bits.join('; ')}.`,url,'Registry allocation data identifies address-block administration, not a person or precise device location.',{sourceType:'api'})];
  }catch(e){if(signal.aborted)return;p.status=e.status===404?'no-match':(e.name==='TimeoutError'?'timeout':'error');p.error=e.message;}
  render();
}


function archiveStamp(ts=''){
  if(!/^\d{14}$/.test(ts))return ts||'unknown';
  return `${ts.slice(0,4)}-${ts.slice(4,6)}-${ts.slice(6,8)} ${ts.slice(8,10)}:${ts.slice(10,12)} UTC`;
}
async function runDomainHistory(meta,signal){
  const domain=meta.domain||meta.normalized;
  const p=providerState('history','Domain history','loading');state.providers.history=p;render();
  try{
    const data=await fetchJson(`/api/intel?kind=domain-history&domain=${encodeURIComponent(domain)}`,{},signal);
    const findings=[];
    const ct=data?.certificateTransparency;
    if(ct?.ok){
      const names=Array.isArray(ct.names)?ct.names:[];
      const sample=names.slice(0,14);
      const obs=names.length
        ? `Certificate Transparency returned ${ct.rowCount||names.length} record rows and ${names.length} unique domain/hostname names in the processed sample. ${sample.length?`Sample: ${sample.join(' · ')}${names.length>sample.length?' …':''}.`:''}`
        : 'Certificate Transparency returned no domain/hostname names in the processed response.';
      findings.push(finding('crt.sh',domain,obs,ct.source||`https://crt.sh/?q=%25.${domain}`,'Certificate logs are historical naming evidence. Expired, wildcard, shared, or old certificates do not prove a hostname is live or currently controlled by the subject.',{sourceType:'public-log',raw:{rowCount:ct.rowCount,names,earliest:ct.earliest,latest:ct.latest}}));
    }
    const wb=data?.wayback;
    if(wb?.ok){
      const captures=Array.isArray(wb.captures)?wb.captures:[];
      if(captures.length){
        const first=captures[0],last=captures[captures.length-1];
        findings.push(finding('Wayback Machine',domain,`Returned ${captures.length} unique successful HTML captures in the sampled archive response, spanning ${archiveStamp(first.timestamp)} to ${archiveStamp(last.timestamp)}.`,wb.source||`https://web.archive.org/web/*/${domain}/*`,'Archive coverage is incomplete. Capture time is not publication time, and archived content may differ from the live site.',{sourceType:'web-archive',raw:{captures}}));
      }
    }
    p.findings=findings;
    const errors=[ct&&!ct.ok?ct.error:'',wb&&!wb.ok?wb.error:''].filter(Boolean);
    p.status=findings.length?'success':(errors.length?'error':'no-match');
    if(errors.length)p.error=errors.join(' · ');
  }catch(e){if(signal.aborted)return;p.status=e.name==='TimeoutError'?'timeout':'error';p.error=e.message;}
  render();
}

function domainLike(meta){return ['domain','email','url'].includes(meta.type) && !!meta.domain;}
async function runSearch(raw){
  if(state.activeController) state.activeController.abort();
  state.providers={}; state.selectedFindingIds.clear();
  state.query=raw.trim(); state.queryMeta=detectIdentifier(raw);
  const meta=state.queryMeta;
  if(!meta.valid){render();if(raw.trim())toast('That input format is not recognized.',true);return;}
  if(meta.type==='keyword'&&meta.forcedLane)state.researchLane=meta.forcedLane;
  state.activeController=new AbortController(); const sig=state.activeController.signal;
  if(meta.type==='username'){
    state.providers.github=providerState('github','GitHub','idle');
    state.providers.gitlab=providerState('gitlab','GitLab','idle');
  }
  if(domainLike(meta)){
    state.providers.dns=providerState('dns','DNS','idle');
    state.providers.rdap=providerState('rdap','RDAP domain','idle');
    state.providers.history=providerState('history','Domain history','idle');
    if(meta.type==='email') state.providers.hibp=providerState('hibp','Breach coverage','unsupported',{note:'Breach-provider access is not configured. No breach conclusion is made.'});
  }
  if(meta.type==='ip'){
    state.providers.ripe=providerState('ripe','RIPEstat','idle');
    state.providers.rdapip=providerState('rdapip','RDAP IP','idle');
  }
  if(meta.type==='phone') state.providers.phone=providerState('phone','Phone ownership','unsupported',{note:'Automatic owner attribution is intentionally not performed. Use vetted public pivots and verify identity separately.'});
  if(meta.type==='hash') state.providers.hash=providerState('hash','Hash reputation','unsupported',{note:'No reputation provider is configured in this client build. Use the public threat-triage pivots shown below.'});
  if(meta.type==='keyword') state.providers.research=providerState('research','Research lane','unsupported',{note:'Choose person, company, organization, or general research below. TraceForge will route you to relevant public sources without pretending a keyword is an identifier.'});
  render();
  const jobs=[];
  if(meta.type==='username')jobs.push(runGithub(meta,sig),runGitlab(meta,sig));
  if(domainLike(meta))jobs.push(runDns(meta,sig),runRdapDomain(meta,sig),runDomainHistory(meta,sig));
  if(meta.type==='ip')jobs.push(runRipe(meta,sig),runRdapIp(meta,sig));
  await Promise.allSettled(jobs);
}
function retryProvider(id){
  const m=state.queryMeta;if(!m?.valid)return;
  const sig=state.activeController?.signal||new AbortController().signal;
  if(id==='github')runGithub(m,sig);
  if(id==='gitlab')runGitlab(m,sig);
  if(id==='dns')runDns(m,sig);
  if(id==='rdap')runRdapDomain(m,sig);
  if(id==='history')runDomainHistory(m,sig);
  if(id==='ripe')runRipe(m,sig);
  if(id==='rdapip')runRdapIp(m,sig);
}
