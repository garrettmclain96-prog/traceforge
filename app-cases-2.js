function safeCaseSlug(c){return c.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'case';}
function downloadBlob(content,type,filename){
  const blob=new Blob([content],{type}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function csvCell(v=''){const s=String(v??'');return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
function exportCaseMarkdown(c=currentCase()){
  if(!c)return toast('Open a case first.',true);
  const gaps=gapSuggestions(c);
  const lines=[`# ${c.name}`,'',`TraceForge case brief · generated ${new Date().toISOString()}`,'',`- Evidence: ${c.evidence.length}`,`- Entities: ${c.entities.length}`,`- Relationships: ${c.relations.length}`,`- Open questions/tasks/contradictions: ${c.questions.filter(q=>!q.resolved).length}`,'','## Evidence',''];
  c.evidence.forEach((e,i)=>{const strength=evidenceStrength(e);lines.push(`### ${i+1}. ${e.title}`,`- Subject: ${e.subject}`,`- Status: ${e.status}`,`- Source strength: ${strength.label}`,`- Provenance: ${e.provenance}`,`- Event date: ${e.sourceEventDate||'Undated'}`,`- Retrieved: ${e.retrievedAt||'—'}`,`- Source: ${e.sourceUrl||e.originalFilename||'—'}`,'',e.observation,'',e.notes?`Limit / notes: ${e.notes}`:'','');});
  lines.push('## Relationships','');
  if(c.relations.length)c.relations.forEach(r=>{const a=c.entities.find(e=>e.id===r.fromId)?.label||r.fromId,b=c.entities.find(e=>e.id===r.toId)?.label||r.toId;lines.push(`- ${a} — ${r.label} → ${b} [${r.mode}; ${(r.evidenceIds||[]).length} support item(s)]`);}); else lines.push('- None');
  lines.push('','## Open questions / contradictions','');
  const open=c.questions.filter(q=>!q.resolved); if(open.length)open.forEach(q=>lines.push(`- [${q.type}] ${q.text}`));else lines.push('- None');
  lines.push('','## Proof gaps',''); if(gaps.length)gaps.forEach(g=>lines.push(`- ${g}`));else lines.push('- No structural gaps detected by current rules.');
  downloadBlob(lines.join('\n'),'text/markdown',`traceforge-${safeCaseSlug(c)}.md`);
}
function exportEvidenceCsv(c=currentCase()){
  if(!c)return toast('Open a case first.',true);
  const header=['id','title','subject','status','source_strength','provider','source_type','source_url','original_filename','source_event_date','retrieved_at','observation','notes','tags'];
  const rows=c.evidence.map(e=>{const s=evidenceStrength(e);return [e.id,e.title,e.subject,e.status,s.label,e.provider||'',e.sourceType||'',e.sourceUrl||'',e.originalFilename||'',e.sourceEventDate||'',e.retrievedAt||'',e.observation||'',e.notes||'',(e.tags||[]).join('|')].map(csvCell).join(',');});
  downloadBlob([header.join(','),...rows].join('\n'),'text/csv',`traceforge-${safeCaseSlug(c)}-evidence.csv`);
}
function exportCase(c=currentCase()){ if(!c)return toast('Open a case first.',true); downloadBlob(JSON.stringify(c,null,2),'application/json',`traceforge-${safeCaseSlug(c)}.json`); }
async function importCaseFile(file){
  if(!file)return; if(file.size>MAX_IMPORT_BYTES)return toast('Import exceeds 1 MB limit.',true);
  let parsed; try{parsed=JSON.parse(await file.text());parsed=validateCase(parsed);}catch(e){return toast(`Case import rejected: ${e.message}. Existing data was not changed.`,true);}
  const ix=state.cases.findIndex(c=>c.id===parsed.id); if(ix>=0){state.cases[ix]=mergeCase(state.cases[ix],parsed);state.currentCaseId=state.cases[ix].id;toast('Duplicate case ID found; missing records were merged without overwriting existing records.');} else {state.cases.unshift(parsed);state.currentCaseId=parsed.id;toast('Case imported.');} persistCases();state.view='cases';render();
}
function printReport(c=currentCase()){
  if(!c)return toast('Open a case first.',true);
  const evidence=c.evidence.map((e,i)=>`<section><h3>${i+1}. ${esc(e.title)}</h3><p><b>Subject:</b> ${esc(e.subject)} · <b>Status:</b> ${esc(e.status)}</p><blockquote>${esc(e.observation)}</blockquote><p><b>Source:</b> ${e.sourceUrl?`<a href="${esc(e.sourceUrl)}">${esc(e.sourceUrl)}</a>`:esc(e.originalFilename||'—')}<br><b>Event date:</b> ${esc(e.sourceEventDate||'Undated')} · <b>Retrieved:</b> ${esc(e.retrievedAt)}</p></section>`).join('');
  const rels=c.relations.map(r=>{const f=c.entities.find(e=>e.id===r.fromId)?.label||r.fromId,t=c.entities.find(e=>e.id===r.toId)?.label||r.toId;return `<li>${esc(f)} — ${esc(r.label)} → ${esc(t)} [${esc(r.mode)}]</li>`}).join('');
  const qs=c.questions.map(q=>`<li>${esc(q.type)}: ${esc(q.text)} — ${q.resolved?'Resolved: '+esc(q.resolution):'Open'}</li>`).join('');
  const w=window.open('','_blank'); if(!w)return toast('Pop-up blocked. Allow pop-ups to print.',true); w.document.write(`<!doctype html><title>${esc(c.name)} — TraceForge</title><style>body{font:14px system-ui;max-width:820px;margin:40px auto;color:#17232a}h1,h2,h3{color:#101b22}section{border-top:1px solid #ccd7d7;padding:14px 0}blockquote{border-left:3px solid #087865;margin-left:0;padding-left:12px}a{color:#087865;word-break:break-all}@media print{body{margin:0}}</style><h1>${esc(c.name)}</h1><p>TraceForge case report · generated ${esc(new Date().toLocaleString())}</p><h2>Evidence</h2>${evidence||'<p>No evidence.</p>'}<h2>Connections</h2><ul>${rels||'<li>None</li>'}</ul><h2>Questions & contradictions</h2><ul>${qs||'<li>None</li>'}</ul>`);w.document.close();w.focus();setTimeout(()=>w.print(),250);
}

function previewEvidenceImport(text,filename='pasted-text.txt',kind='text'){
  if(new Blob([text]).size>MAX_IMPORT_BYTES) return toast('Evidence import exceeds 1 MB limit.',true);
  let items=[];
  try{
    if(kind==='json'){
      const p=JSON.parse(text); const arr=Array.isArray(p)?p:[p];
      items=arr.map((x,i)=>({title:String(x.title||`Imported item ${i+1}`),subject:String(x.subject||'Imported evidence'),observation:String(x.observation||x.text||JSON.stringify(x)),sourceUrl:/^https:\/\//.test(String(x.sourceUrl||''))?String(x.sourceUrl):'',originalFilename:filename,sourceEventDate:String(x.sourceEventDate||''),notes:String(x.notes||''),tags:Array.isArray(x.tags)?x.tags:[],status:['observed','inferred','disputed'].includes(x.status)?x.status:'observed'}));
    } else if(kind==='csv'){
      const lines=text.split(/\r?\n/).filter(Boolean); if(!lines.length)throw new Error('CSV is empty.'); const headers=parseCsvLine(lines.shift()).map(h=>h.trim());
      items=lines.map((line,i)=>{const vals=parseCsvLine(line),o=Object.fromEntries(headers.map((h,j)=>[h,vals[j]??'']));return {title:o.title||`Imported row ${i+1}`,subject:o.subject||'Imported evidence',observation:o.observation||o.text||line,sourceUrl:/^https:\/\//.test(o.sourceUrl||'')?o.sourceUrl:'',originalFilename:filename,sourceEventDate:o.sourceEventDate||'',notes:o.notes||'',tags:(o.tags||'').split('|').map(x=>x.trim()).filter(Boolean),status:['observed','inferred','disputed'].includes(o.status)?o.status:'observed'};});
    } else { items=[{title:`Imported text · ${filename}`,subject:'Imported evidence',observation:text.slice(0,100000),sourceUrl:'',originalFilename:filename,sourceEventDate:'',notes:'User-supplied text import.',tags:['import'],status:'observed'}]; }
  } catch(e){ return toast(`Evidence import rejected: ${e.message}. Existing data was not changed.`,true); }
  state.importPreview={items,filename};render();
}
function parseCsvLine(line){ let out=[],cur='',q=false; for(let i=0;i<line.length;i++){const ch=line[i]; if(ch==='"'){if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q;}else if(ch===','&&!q){out.push(cur);cur='';}else cur+=ch;}out.push(cur);return out; }
function commitEvidenceImport(){
  const c=currentCase(); if(!c||!state.importPreview)return;
  let saved=0,skipped=0;
  for(const x of state.importPreview.items){
    const ev={id:uid('ev'),...x,retrievedAt:nowIso(),provenance:'imported-user-supplied',provider:'Import',sourceType:x.sourceUrl?'manual-citation':'local-file'};
    if(isDuplicateEvidence(c,ev)){skipped++;continue;}
    c.evidence.push(ev);ensureEntity(c,ev.subject,'entity',[ev.id]);saved++;
  }
  state.importPreview=null;touchCase(c);render();toast(`${saved} imported evidence item${saved===1?'':'s'} saved${skipped?`; ${skipped} duplicate${skipped===1?'':'s'} skipped`:''}.`);
}
function clearSession(){ if(state.activeController)state.activeController.abort();state.query='';state.queryMeta=null;state.providers={};state.selectedFindingIds.clear();render();toast('Search session cleared. Saved cases were not changed.'); }
function deleteAllLocal(){ if(!confirm('Delete ALL TraceForge cases saved on this device? This cannot be undone.'))return;if(!confirm('Final confirmation: permanently delete all local TraceForge data?'))return;localStorage.removeItem(APP_KEY);localStorage.removeItem('traceforge.currentCaseId');state.cases=[];state.currentCaseId=null;state.view='cases';render();toast('All local TraceForge data deleted.'); }

