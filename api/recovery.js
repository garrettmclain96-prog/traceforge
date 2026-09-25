function decodeHtml(s=''){
  const named={'&amp;':'&','&quot;':'"','&#39;':"'",'&apos;':"'",'&lt;':'<','&gt;':'>','&nbsp;':' '};
  s=s.replace(/&(amp|quot|#39|apos|lt|gt|nbsp);/g,m=>named[m]||m);
  return s.replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n))).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCharCode(parseInt(n,16)));
}
function stripTags(s=''){return decodeHtml(s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();}
function safeUrl(url){try{const u=new URL(url,'https://www.classaction.org');return /^https?:$/.test(u.protocol)?u.href:'';}catch{return '';}}
function parseSettlements(html){
  const out=[];const re=/<h3[^>]*>\s*<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>\s*<\/h3>([\s\S]*?)(?=<h3\b|$)/gi;let m;
  while((m=re.exec(html))&&out.length<60){
    const title=stripTags(m[2]);const block=stripTags(m[3]);
    if(!title||!/Settlement/i.test(block))continue;
    const payout=(block.match(/Payout\s+(.+?)\s+Deadline/i)||[])[1]?.trim()||'';
    const deadline=(block.match(/Deadline\s+([^\s]+|Varies)/i)||[])[1]?.trim()||'';
    const eligibility=(block.match(/((?:You may|If you|This settlement|Class members)[^.]{20,500}\.)/i)||[])[1]?.trim()||'';
    const url=safeUrl(m[1]);if(!url)continue;
    out.push({title,payout:payout.slice(0,80),deadline:deadline.slice(0,32),eligibility:eligibility.slice(0,520),url});
  }
  return out;
}

function parseLawsuits(html){
  const out=[];const re=/<h3[^>]*>\s*<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>\s*<\/h3>([\s\S]*?)(?=<h3\b|<h2\b|$)/gi;let m;
  while((m=re.exec(html))&&out.length<100){
    const title=stripTags(m[2]);const summary=stripTags(m[3]).replace(/\s+(Take Me There|Additional Investigations).*$/i,'').trim();
    if(!title||!summary||/^(More|Take Me There)$/i.test(title))continue;
    const url=safeUrl(m[1]);if(!url)continue;
    out.push({title,summary:summary.slice(0,650),url});
  }
  return out;
}

module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','s-maxage=1800, stale-while-revalidate=43200');
  const kind=String(req.query?.kind||'');
  if(!['classactions','lawsuits'].includes(kind))return res.status(400).json({error:'Unsupported recovery feed.'});
  try{
    const source=kind==='lawsuits'?'https://www.classaction.org/list-of-lawsuits':'https://www.classaction.org/settlements';
    const upstream=await fetch(source,{headers:{'user-agent':'TraceForge/3.0 (+https://traceforge-pink.vercel.app)','accept':'text/html'}});
    if(!upstream.ok)throw new Error(`Upstream ${upstream.status}`);
    let items=kind==='lawsuits'?parseLawsuits(await upstream.text()):parseSettlements(await upstream.text());
    const q=String(req.query?.q||'').trim().toLowerCase().slice(0,100);
    if(q)items=items.filter(x=>`${x.title} ${x.summary||''} ${x.eligibility||''}`.toLowerCase().includes(q));
    res.status(200).json({source,fetchedAt:new Date().toISOString(),query:q||null,count:items.length,items:items.slice(0,18)});
  }catch(e){res.status(502).json({error:`Could not refresh class-action ${kind==='lawsuits'?'lawsuits':'settlements'}.`,detail:String(e?.message||e)});}
};
