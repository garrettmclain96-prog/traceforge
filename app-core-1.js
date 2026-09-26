const APP_VERSION = '4.0.0';
const APP_KEY = 'traceforge.v1.cases';
const SCHEMA_VERSION = 1;
const MAX_IMPORT_BYTES = 1_000_000;
const REQUEST_TIMEOUT = 12000;

const state = {
  view: 'investigate',
  caseTab: 'evidence',
  cases: loadCases(),
  currentCaseId: localStorage.getItem('traceforge.currentCaseId') || null,
  query: '',
  queryMeta: null,
  researchLane: 'auto',
  providers: {},
  selectedFindingIds: new Set(),
  activeController: null,
  modal: null,
  importPreview: null,
};

function uid(prefix='id') {
  return `${prefix}_${Date.now().toString(36)}_${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;
}
function nowIso(){ return new Date().toISOString(); }
function esc(v=''){ return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
function fmtDate(v){ if(!v) return '—'; const d=new Date(v); return Number.isNaN(d.valueOf())?String(v):d.toLocaleString(); }
function fmtDay(v){ if(!v) return 'Undated'; const d=new Date(v+'T12:00:00'); return Number.isNaN(d.valueOf())?String(v):d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}); }
function currentCase(){ return state.cases.find(c=>c.id===state.currentCaseId) || null; }
function normalizeCase(c){
  return {
    schemaVersion: SCHEMA_VERSION,
    id: c.id || uid('case'),
    name: String(c.name || 'Untitled case'),
    createdAt: c.createdAt || nowIso(),
    updatedAt: c.updatedAt || nowIso(),
    evidence: Array.isArray(c.evidence)?c.evidence:[],
    entities: Array.isArray(c.entities)?c.entities:[],
    relations: Array.isArray(c.relations)?c.relations:[],
    questions: Array.isArray(c.questions)?c.questions:[],
  };
}
function loadCases(){
  try { const raw=localStorage.getItem(APP_KEY); const parsed=raw?JSON.parse(raw):[]; return Array.isArray(parsed)?parsed.map(normalizeCase):[]; }
  catch { return []; }
}
function persistCases(){
  try {
    localStorage.setItem(APP_KEY, JSON.stringify(state.cases));
    if(state.currentCaseId) localStorage.setItem('traceforge.currentCaseId',state.currentCaseId); else localStorage.removeItem('traceforge.currentCaseId');
    return true;
  } catch(err){ toast(`Local save failed: ${err.message}. Export your case before closing this page.`, true); return false; }
}
function touchCase(c){ c.updatedAt=nowIso(); persistCases(); }
function toast(msg,error=false){
  let wrap=document.querySelector('.toast-wrap'); if(!wrap){wrap=document.createElement('div');wrap.className='toast-wrap';document.body.append(wrap)}
  const t=document.createElement('div'); t.className=`toast${error?' error':''}`; t.textContent=msg; wrap.append(t); setTimeout(()=>t.remove(),4200);
}

function isDomain(value){
  return /^(?=.{3,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(value);
}
function detectIdentifier(raw){
  const original=String(raw||'').trim();
  if(!original) return {type:'empty',normalized:'',valid:false,label:'Empty'};

  const forced=/^(person|company|org|organization|topic|keyword)\s*:\s*(.+)$/i.exec(original);
  if(forced){
    const lane=forced[1].toLowerCase();
    const normalized=forced[2].replace(/\s+/g,' ').trim();
    if(!normalized)return {type:'unknown',normalized:original,valid:false,label:'Empty research subject'};
    const forcedLane=lane==='org'||lane==='organization'?'organization':lane==='topic'||lane==='keyword'?'auto':lane;
    return {type:'keyword',normalized,valid:true,forcedLane,label:`Research subject · ${forcedLane==='auto'?'general':forcedLane}`};
  }

  if(/^https?:\/\//i.test(original)){
    try{
      const u=new URL(original);
      const domain=u.hostname.toLowerCase().replace(/^www\./,'');
      if(!isDomain(domain) && !/^\d{1,3}(?:\.\d{1,3}){3}$/.test(domain)) return {type:'unknown',normalized:original,valid:false,label:'Invalid URL'};
      u.hash='';
      return {type:'url',normalized:u.href,domain,hostname:u.hostname.toLowerCase(),valid:true,label:'URL'};
    }catch{return {type:'unknown',normalized:original,valid:false,label:'Invalid URL'};}
  }

  const email=/^[^\s@]+@([^\s@]+\.[^\s@]+)$/.exec(original);
  if(email) return {type:'email',normalized:original.toLowerCase(),domain:email[1].toLowerCase(),valid:true,label:'Email · domain + public pivots'};

  const ipv4=/^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
  if(ipv4.test(original)) return {type:'ip',ipVersion:4,normalized:original,valid:true,label:'IPv4'};
  if(original.includes(':') && /^[0-9a-fA-F:]+$/.test(original) && original.split(':').length>=3) return {type:'ip',ipVersion:6,normalized:original.toLowerCase(),valid:true,label:'IPv6'};

  if(/^[a-fA-F0-9]{32}$/.test(original)) return {type:'hash',hashType:'MD5',normalized:original.toLowerCase(),valid:true,label:'MD5 hash'};
  if(/^[a-fA-F0-9]{40}$/.test(original)) return {type:'hash',hashType:'SHA-1',normalized:original.toLowerCase(),valid:true,label:'SHA-1 hash'};
  if(/^[a-fA-F0-9]{64}$/.test(original)) return {type:'hash',hashType:'SHA-256',normalized:original.toLowerCase(),valid:true,label:'SHA-256 hash'};

  const phoneDigits=original.replace(/[^0-9]/g,'');
  if(/^\+?[0-9().\-\s]{7,20}$/.test(original) && phoneDigits.length>=7 && phoneDigits.length<=15) return {type:'phone',normalized:`+${phoneDigits}`,valid:true,label:'Phone · public pivots only'};

  const domain=original.toLowerCase().replace(/^www\./,'');
  if(isDomain(domain)) return {type:'domain',normalized:domain,domain,valid:true,label:'Domain'};

  const handle=original.replace(/^@/,'').trim();
  if(/^[A-Za-z0-9](?:[A-Za-z0-9_.-]{0,62}[A-Za-z0-9])?$/.test(handle) && !/\s/.test(original)) return {type:'username',normalized:handle,valid:true,label:'Username'};

  if(original.length>=2 && original.length<=160 && !/[<>]/.test(original)){
    return {type:'keyword',normalized:original.replace(/\s+/g,' ').trim(),valid:true,label:'Research keyword · choose a lane'};
  }

  return {type:'unknown',normalized:original,valid:false,label:'Unrecognized'};
}

function timeoutSignal(parentSignal, ms=REQUEST_TIMEOUT){
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(new DOMException('Timed out','TimeoutError')),ms);
  const abort=()=>ctrl.abort(parentSignal.reason || new DOMException('Aborted','AbortError'));
  if(parentSignal) parentSignal.addEventListener('abort',abort,{once:true});
  return {signal:ctrl.signal,cleanup:()=>{clearTimeout(timer); if(parentSignal) parentSignal.removeEventListener('abort',abort);}};
}
async function fetchJson(url,opts={},parentSignal){
  const {signal,cleanup}=timeoutSignal(parentSignal);
  try {
    const r=await fetch(url,{...opts,signal});
    const body=await r.json().catch(()=>null);
    if(!r.ok) { const e=new Error(body?.message || body?.error || `${r.status} ${r.statusText}`); e.status=r.status; throw e; }
    return body;
  } finally { cleanup(); }
}
function providerState(id,name,status='idle',extra={}) { return {id,name,status,findings:[],error:null,...extra}; }
function finding(provider,subject,observation,url,limitation,extra={}){
  return {id:uid('finding'),provider,subject,observation,url,limitation,checkedAt:nowIso(),...extra};
}
