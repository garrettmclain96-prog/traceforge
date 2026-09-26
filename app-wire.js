function wire(){
  document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{state.view=b.dataset.nav;render();});
  document.querySelector('[data-clear-session]')?.addEventListener('click',clearSession);
  const input=document.querySelector('#searchInput'); if(input){ input.addEventListener('input',e=>{state.query=e.target.value; state.queryMeta=detectIdentifier(state.query); if(state.activeController)state.activeController.abort();state.providers={};state.selectedFindingIds.clear();render(); setTimeout(()=>document.querySelector('#searchInput')?.focus(),0);}); input.addEventListener('keydown',e=>{if(e.key==='Enter')runSearch(e.currentTarget.value)}); document.querySelector('#searchBtn')?.addEventListener('click',()=>runSearch(document.querySelector('#searchInput').value)); }
  document.querySelectorAll('[data-finding-check]').forEach(x=>x.onchange=()=>{x.checked?state.selectedFindingIds.add(x.dataset.findingCheck):state.selectedFindingIds.delete(x.dataset.findingCheck);});
  document.querySelectorAll('[data-example]').forEach(b=>b.onclick=()=>{const value=b.dataset.example||'';state.query=value;state.queryMeta=detectIdentifier(value);render();setTimeout(()=>runSearch(value),0);});
  document.querySelector('[data-select-all]')?.addEventListener('click',()=>{const ids=allFindings().map(f=>f.id);const all=ids.length&&ids.every(id=>state.selectedFindingIds.has(id));ids.forEach(id=>all?state.selectedFindingIds.delete(id):state.selectedFindingIds.add(id));render();});
  document.querySelectorAll('[data-retry]').forEach(b=>b.onclick=()=>retryProvider(b.dataset.retry));
  document.querySelector('[data-save-selected]')?.addEventListener('click',saveSelectedFindings);
  document.querySelector('[data-new-case]')?.addEventListener('click',()=>{const n=prompt('Case name','New investigation');if(n)createCase(n)});
  document.querySelectorAll('[data-open-case]').forEach(b=>b.onclick=()=>selectCase(b.dataset.openCase));
  document.querySelectorAll('[data-rename-case]').forEach(b=>b.onclick=()=>renameCase(b.dataset.renameCase));
  document.querySelectorAll('[data-delete-case]').forEach(b=>b.onclick=()=>deleteCase(b.dataset.deleteCase));
  document.querySelectorAll('[data-case-tab]').forEach(b=>b.onclick=()=>{state.caseTab=b.dataset.caseTab;render();});
  document.querySelectorAll('[data-export-case]').forEach(b=>b.addEventListener('click',()=>exportCase()));
  document.querySelectorAll('[data-export-md]').forEach(b=>b.addEventListener('click',()=>exportCaseMarkdown()));
  document.querySelectorAll('[data-export-csv]').forEach(b=>b.addEventListener('click',()=>exportEvidenceCsv()));
  document.querySelectorAll('[data-print]').forEach(b=>b.addEventListener('click',()=>printReport()));
  document.querySelector('[data-delete-all]')?.addEventListener('click',deleteAllLocal);
  document.querySelector('[data-import-case]')?.addEventListener('change',e=>importCaseFile(e.target.files?.[0]));
  document.querySelector('#manualEvidence')?.addEventListener('submit',e=>{e.preventDefault();addManualEvidence(e.currentTarget)});
  document.querySelectorAll('[data-delete-evidence]').forEach(b=>b.onclick=()=>deleteEvidence(b.dataset.deleteEvidence));
  document.querySelector('#entityForm')?.addEventListener('submit',e=>{e.preventDefault();addEntity(e.currentTarget)});
  document.querySelector('#relationForm')?.addEventListener('submit',e=>{e.preventDefault();addRelation(e.currentTarget)});
  document.querySelectorAll('[data-delete-relation]').forEach(b=>b.onclick=()=>deleteRelation(b.dataset.deleteRelation));
  document.querySelector('#questionForm')?.addEventListener('submit',e=>{e.preventDefault();addQuestion(e.currentTarget)});
  document.querySelectorAll('[data-resolve-q]').forEach(b=>b.onclick=()=>resolveQuestion(b.dataset.resolveQ));
  document.querySelectorAll('[data-reopen-q]').forEach(b=>b.onclick=()=>reopenQuestion(b.dataset.reopenQ));
  document.querySelectorAll('[data-delete-q]').forEach(b=>b.onclick=()=>deleteQuestion(b.dataset.deleteQ));
  document.querySelector('[data-preview-paste]')?.addEventListener('click',()=>{const t=document.querySelector('#pasteImport').value;if(!t.trim())return toast('Paste text first.',true);previewEvidenceImport(t,'pasted-text.txt','text')});
  document.querySelector('[data-evidence-file]')?.addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>MAX_IMPORT_BYTES)return toast('Evidence import exceeds 1 MB limit.',true);const ext=f.name.split('.').pop()?.toLowerCase();if(!['txt','json','csv'].includes(ext))return toast('Only .txt, .json and .csv imports are supported.',true);previewEvidenceImport(await f.text(),f.name,ext==='json'?'json':ext==='csv'?'csv':'text');});
  document.querySelector('[data-commit-import]')?.addEventListener('click',commitEvidenceImport);
  document.querySelector('[data-cancel-import]')?.addEventListener('click',()=>{state.importPreview=null;render();});
}

if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
if(state.currentCaseId && !state.cases.some(c=>c.id===state.currentCaseId)) state.currentCaseId=state.cases[0]?.id||null;
render();

// Expose a narrow test surface for automated browser verification.
window.__TRACEFORGE__ = {
  state,
  detectIdentifier,
  validateCase,
  gapSuggestions,
  runSearch,
  clearSession,
  getCurrentCase: currentCase,
};
