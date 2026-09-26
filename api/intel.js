function isDomain(value=''){
  return /^(?=.{3,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(value);
}
async function fetchText(url,ms=9000){
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(),ms);
  try{
    const r=await fetch(url,{signal:ctrl.signal,headers:{'accept':'application/json,text/plain,*/*','user-agent':'TraceForge/4.0 (+https://traceforge-pink.vercel.app)'}});
    if(!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    const len=Number(r.headers.get('content-length')||0);
    if(len>5_000_000) throw new Error('Upstream response too large');
    return await r.text();
  }finally{clearTimeout(timer);}
}
function unique(values){return [...new Set(values.filter(Boolean))];}
function parseCrt(text,domain){
  const rows=JSON.parse(text);
  const list=Array.isArray(rows)?rows:[];
  const names=[];
  let earliest='',latest='';
  for(const row of list.slice(0,5000)){
    const values=String(row?.name_value||'').split(/\s+/).map(x=>x.trim().toLowerCase().replace(/^\*\./,'')).filter(Boolean);
    for(const n of values) if(n===domain||n.endsWith(`.${domain}`)) names.push(n);
    const nb=String(row?.not_before||'');
    const na=String(row?.not_after||'');
    if(nb&&(!earliest||nb<earliest))earliest=nb;
    if(na&&(!latest||na>latest))latest=na;
  }
  return {rowCount:list.length,names:unique(names).sort().slice(0,80),earliest,latest};
}
function parseWayback(text){
  const rows=JSON.parse(text);
  if(!Array.isArray(rows)||rows.length<2)return {captures:[]};
  const header=rows[0], captures=[];
  for(const row of rows.slice(1,61)){
    if(!Array.isArray(row))continue;
    const o=Object.fromEntries(header.map((h,i)=>[h,row[i]]));
    if(o.timestamp&&o.original)captures.push({timestamp:o.timestamp,original:o.original,statuscode:o.statuscode||'',mimetype:o.mimetype||''});
  }
  return {captures};
}
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','s-maxage=1800, stale-while-revalidate=21600');
  const kind=String(req.query?.kind||'');
  if(kind!=='domain-history')return res.status(400).json({error:'Unsupported intelligence feed.'});
  const domain=String(req.query?.domain||'').trim().toLowerCase().replace(/^www\./,'').slice(0,253);
  if(!isDomain(domain))return res.status(400).json({error:'A valid domain is required.'});

  const crtSource=`https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`;
  const waybackSource=`https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}%2F*&output=json&fl=timestamp,original,statuscode,mimetype&filter=statuscode%3A200&filter=mimetype%3Atext%2Fhtml&collapse=digest&limit=60`;
  const [crt,wayback]=await Promise.allSettled([fetchText(crtSource),fetchText(waybackSource)]);
  const body={domain,fetchedAt:new Date().toISOString(),certificateTransparency:null,wayback:null};

  if(crt.status==='fulfilled'){
    try{body.certificateTransparency={ok:true,source:`https://crt.sh/?q=%25.${domain}`,...parseCrt(crt.value,domain)};}
    catch(e){body.certificateTransparency={ok:false,source:`https://crt.sh/?q=%25.${domain}`,error:`Parse failed: ${e.message}`};}
  }else body.certificateTransparency={ok:false,source:`https://crt.sh/?q=%25.${domain}`,error:String(crt.reason?.message||crt.reason)};

  if(wayback.status==='fulfilled'){
    try{
      const parsed=parseWayback(wayback.value);
      body.wayback={ok:true,source:`https://web.archive.org/web/*/${domain}/*`,...parsed};
    }catch(e){body.wayback={ok:false,source:`https://web.archive.org/web/*/${domain}/*`,error:`Parse failed: ${e.message}`};}
  }else body.wayback={ok:false,source:`https://web.archive.org/web/*/${domain}/*`,error:String(wayback.reason?.message||wayback.reason)};

  res.status(200).json(body);
};
