function evidenceFingerprint(e={}){
  const norm=v=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ');
  return [norm(e.provider),norm(e.subject),norm(e.sourceUrl),norm(e.observation)].join('|');
}
function evidenceStrength(e={}){
  if(e.status==='disputed') return {label:'Disputed',className:'error',rank:0};
  if(e.status==='inferred') return {label:'Inference',className:'warn',rank:1};
  if(['registry-api','api','public-log'].includes(e.sourceType)) return {label:'Direct / registry',className:'ok',rank:4};
  if(e.sourceType==='web-archive') return {label:'Archived context',className:'teal',rank:3};
  if(e.provenance==='fetched-public-source') return {label:'Fetched source',className:'ok',rank:3};
  if(e.sourceUrl) return {label:'User-cited source',className:'teal',rank:2};
  return {label:'User-supplied',className:'warn',rank:1};
}
function isDuplicateEvidence(c,candidate){
  const fp=evidenceFingerprint(candidate);
  return c.evidence.some(e=>evidenceFingerprint(e)===fp);
}
function allFindings(){ return Object.values(state.providers).flatMap(p=>p.findings||[]).filter(f=>!f.failed); }
function createCase(name){ const c=normalizeCase({id:uid('case'),name:name.trim()||'Untitled case'}); state.cases.unshift(c); state.currentCaseId=c.id; persistCases(); state.view='cases'; state.caseTab='evidence'; render(); toast('Case created. Saved on this device.'); }
function renameCase(id){ const c=state.cases.find(c=>c.id===id); if(!c)return; const n=prompt('Rename case',c.name); if(n?.trim()){c.name=n.trim();touchCase(c);render();} }
function deleteCase(id){ const c=state.cases.find(c=>c.id===id); if(!c)return; if(!confirm(`Delete “${c.name}” from this device? This cannot be undone.`)) return; state.cases=state.cases.filter(x=>x.id!==id); if(state.currentCaseId===id) state.currentCaseId=state.cases[0]?.id||null; persistCases();render(); }
function selectCase(id){ state.currentCaseId=id; persistCases(); state.view='cases'; state.caseTab='evidence'; render(); }
function saveSelectedFindings(){
  let c=currentCase();
  if(!c){ const n=prompt('Create a case name before saving evidence','New investigation'); if(!n) return; c=normalizeCase({id:uid('case'),name:n}); state.cases.unshift(c); state.currentCaseId=c.id; }
  const selected=allFindings().filter(f=>state.selectedFindingIds.has(f.id));
  if(!selected.length){toast('Select at least one fetched finding first.',true);return;}
  let saved=0,skipped=0;
  for(const f of selected){
    const ev={id:uid('ev'),title:`${f.provider}: ${f.subject}`,subject:f.subject,observation:f.observation,sourceUrl:f.url,originalFilename:'',sourceEventDate:'',retrievedAt:f.checkedAt||nowIso(),notes:f.limitation||'',tags:[String(f.provider||'source').toLowerCase()],status:'observed',provenance:'fetched-public-source',provider:f.provider,sourceType:f.sourceType||'api',raw:f.raw||null};
    if(isDuplicateEvidence(c,ev)){skipped++;continue;}
    c.evidence.push(ev);saved++;
    ensureEntity(c,f.subject,'identifier',[ev.id]);
  }
  touchCase(c); state.selectedFindingIds.clear(); state.view='cases'; state.caseTab='evidence'; render();
  toast(`${saved} finding${saved===1?'':'s'} saved${skipped?`; ${skipped} duplicate${skipped===1?'':'s'} skipped`:''} to ${c.name}.`);
}function ensureEntity(c,label,type='entity',evidenceIds=[]){
  const key=label.trim().toLowerCase(); let e=c.entities.find(x=>x.label.trim().toLowerCase()===key);
  if(!e){e={id:uid('ent'),label:label.trim(),type,evidenceIds:[...new Set(evidenceIds)]};c.entities.push(e);} else e.evidenceIds=[...new Set([...(e.evidenceIds||[]),...evidenceIds])]; return e;
}

function addManualEvidence(form){
  const c=currentCase(); if(!c)return toast('Open or create a case first.',true);
  const fd=new FormData(form); const title=String(fd.get('title')||'').trim(), subject=String(fd.get('subject')||'').trim(), observation=String(fd.get('observation')||'').trim();
  const sourceUrl=String(fd.get('sourceUrl')||'').trim(), originalFilename=String(fd.get('originalFilename')||'').trim();
  if(!title||!subject||!observation) return toast('Title, subject, and observation are required.',true);
  if(!sourceUrl&&!originalFilename) return toast('Provide either an HTTPS source URL or an original filename.',true);
  if(sourceUrl && !/^https:\/\//i.test(sourceUrl)) return toast('Source URL must use HTTPS.',true);
  const ev={id:uid('ev'),title,subject,observation,sourceUrl,originalFilename,sourceEventDate:String(fd.get('sourceEventDate')||''),retrievedAt:nowIso(),notes:String(fd.get('notes')||''),tags:String(fd.get('tags')||'').split(',').map(x=>x.trim()).filter(Boolean),status:String(fd.get('status')||'observed'),provenance:'manual-user-supplied',provider:'Manual',sourceType:sourceUrl?'manual-citation':'local-file'};
  if(isDuplicateEvidence(c,ev)) return toast('That evidence already exists in this case.',true);
  c.evidence.push(ev); ensureEntity(c,subject,'entity',[ev.id]); touchCase(c); form.reset(); render(); toast('Evidence saved on this device.');
}function deleteEvidence(id){ const c=currentCase(); if(!c)return; if(!confirm('Delete this evidence item?'))return; c.evidence=c.evidence.filter(e=>e.id!==id); c.relations.forEach(r=>r.evidenceIds=(r.evidenceIds||[]).filter(x=>x!==id)); c.entities.forEach(e=>e.evidenceIds=(e.evidenceIds||[]).filter(x=>x!==id)); c.questions.forEach(q=>q.evidenceIds=(q.evidenceIds||[]).filter(x=>x!==id)); touchCase(c);render(); }

function addEntity(form){ const c=currentCase(); if(!c)return; const fd=new FormData(form), label=String(fd.get('label')||'').trim(); if(!label)return; ensureEntity(c,label,String(fd.get('type')||'entity'),[]); touchCase(c);form.reset();render(); }
function addRelation(form){
  const c=currentCase(); if(!c)return; const fd=new FormData(form); const fromId=String(fd.get('fromId')||''),toId=String(fd.get('toId')||''),label=String(fd.get('label')||'').trim(); if(!fromId||!toId||fromId===toId||!label) return toast('Choose two different entities and a relationship label.',true);
  const evidenceIds=[...form.querySelector('[name="evidenceIds"]').selectedOptions].map(o=>o.value);
  c.relations.push({id:uid('rel'),fromId,toId,label,mode:String(fd.get('mode')||'observed'),evidenceIds}); touchCase(c);form.reset();render();
}
function deleteRelation(id){ const c=currentCase(); if(!c)return; if(!confirm('Delete this relationship?'))return; c.relations=c.relations.filter(r=>r.id!==id);touchCase(c);render(); }

function addQuestion(form){ const c=currentCase(); if(!c)return; const fd=new FormData(form); const text=String(fd.get('text')||'').trim(); if(!text)return; const evidenceIds=[...form.querySelector('[name="evidenceIds"]').selectedOptions].map(o=>o.value); c.questions.push({id:uid('q'),type:String(fd.get('type')||'question'),text,evidenceIds,resolved:false,resolution:'',createdAt:nowIso()});touchCase(c);form.reset();render(); }
function resolveQuestion(id){ const c=currentCase(), q=c?.questions.find(q=>q.id===id); if(!q)return; const exp=prompt('Resolution / explanation',q.resolution||''); if(exp===null)return; q.resolved=true;q.resolution=exp.trim();touchCase(c);render(); }
function reopenQuestion(id){ const c=currentCase(),q=c?.questions.find(q=>q.id===id); if(!q)return;q.resolved=false;touchCase(c);render(); }
function deleteQuestion(id){ const c=currentCase();if(!c)return;if(!confirm('Delete this item?'))return;c.questions=c.questions.filter(q=>q.id!==id);touchCase(c);render(); }
function gapSuggestions(c){
  const gaps=[];
  const noDates=c.evidence.filter(e=>!e.sourceEventDate); if(noDates.length) gaps.push(`${noDates.length} evidence item${noDates.length===1?'':'s'} lack a source-event date; they stay outside the historical timeline.`);
  const weakSource=c.evidence.filter(e=>!e.sourceUrl&&!e.originalFilename); if(weakSource.length) gaps.push(`${weakSource.length} evidence item${weakSource.length===1?'':'s'} lack a source URL or original filename.`);
  const unsupported=c.relations.filter(r=>r.mode==='hypothesis' && !(r.evidenceIds||[]).length); if(unsupported.length) gaps.push(`${unsupported.length} hypothesis relationship${unsupported.length===1?'':'s'} have no supporting evidence linked.`);
  const openContr=c.questions.filter(q=>q.type==='contradiction'&&!q.resolved); if(openContr.length) gaps.push(`${openContr.length} contradiction${openContr.length===1?' remains':'s remain'} unresolved.`);
  const inferred=c.evidence.filter(e=>e.status==='inferred'); if(inferred.length) gaps.push(`${inferred.length} evidence item${inferred.length===1?' is':'s are'} marked inferred and should be corroborated before being treated as established.`);
  const providers=new Set(c.evidence.map(e=>e.provider||e.provenance).filter(Boolean)); if(c.evidence.length>=3&&providers.size<2) gaps.push('The case currently depends on one source/provider family; add an independent source before relying on consequential claims.');
  return gaps;
}function validateCase(obj){
  if(!obj||typeof obj!=='object') throw new Error('JSON must contain an object.');
  if(Number(obj.schemaVersion)!==SCHEMA_VERSION) throw new Error(`Unsupported schemaVersion. Expected ${SCHEMA_VERSION}.`);
  if(!obj.id||!obj.name) throw new Error('Case id and name are required.');
  for(const k of ['evidence','entities','relations','questions']) if(!Array.isArray(obj[k])) throw new Error(`${k} must be an array.`);
  return normalizeCase(obj);
}
function mergeById(a=[],b=[]){ const m=new Map(a.map(x=>[x.id,x])); for(const x of b) if(!m.has(x.id))m.set(x.id,x); return [...m.values()]; }
function mergeCase(existing,incoming){ return {...existing,name:existing.name,updatedAt:nowIso(),evidence:mergeById(existing.evidence,incoming.evidence),entities:mergeById(existing.entities,incoming.entities),relations:mergeById(existing.relations,incoming.relations),questions:mergeById(existing.questions,incoming.questions)}; }
