function showEgg(title,text){
  document.querySelector('.egg-overlay')?.remove();
  const o=document.createElement('div');o.className='egg-overlay';
  o.innerHTML=`<div class="egg-panel"><div class="eyebrow">TRACEFORGE // HIDDEN CHANNEL</div><h2>${esc(title)}</h2><pre>${esc(text)}</pre><button class="btn primary egg-close">Return to evidence</button></div>`;
  document.body.append(o);o.querySelector('.egg-close').onclick=()=>o.remove();o.onclick=e=>{if(e.target===o)o.remove();};
}
function triggerSignalRain(){
  const old=document.querySelector('.signal-rain');if(old)old.remove();
  const r=document.createElement('div');r.className='signal-rain';
  const alphabet='TRACEFORGE01$#@/';
  for(let i=0;i<54;i++){const s=document.createElement('span');s.style.left=`${Math.random()*100}%`;s.style.animationDuration=`${2.5+Math.random()*4}s`;s.style.animationDelay=`${Math.random()*1.5}s`;s.textContent=Array.from({length:7+Math.floor(Math.random()*14)},()=>alphabet[Math.floor(Math.random()*alphabet.length)]).join('');r.append(s);}
  document.body.append(r);setTimeout(()=>r.remove(),7000);toast('Signal rain unlocked.');
}
function triggerBlacklight(){document.body.classList.toggle('blacklight-mode');showEgg('BLACKLIGHT','The absence of a result is not the absence of a trail.\n\nSource it. Time-stamp it. Preserve the limitation.');}
function triggerCaseZero(){showEgg('CASE ZERO','STATUS: compartment sealed\nCLEARANCE: curiosity accepted\nPAYLOAD: none — this is an easter egg, not hidden user data\n\nRule zero: never confuse a lead with proof.');}
function wireEasterEggs(){
  const mark=document.querySelector('.brand-mark');
  if(mark&&!mark.dataset.eggBound){mark.dataset.eggBound='1';let taps=0,timer;mark.addEventListener('click',()=>{taps++;clearTimeout(timer);timer=setTimeout(()=>taps=0,1800);if(taps>=7){taps=0;document.body.classList.toggle('specter-mode');toast(document.body.classList.contains('specter-mode')?'Specter mode unlocked.':'Specter mode disengaged.');}});}
  ['#searchInput','#recoveryInput'].forEach(sel=>{const el=document.querySelector(sel);if(!el||el.dataset.eggBound)return;el.dataset.eggBound='1';el.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const v=el.value.trim().toLowerCase();if(v==='forge://blacklight'){e.preventDefault();e.stopImmediatePropagation();triggerBlacklight();}if(v==='case zero'||v==='casezero'||v==='trace://case-zero'){e.preventDefault();e.stopImmediatePropagation();triggerCaseZero();}},true);});
  if(!window.__traceforgeKonamiBound){window.__traceforgeKonamiBound=true;const target=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];let ix=0;window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;ix=k===target[ix]?ix+1:(k===target[0]?1:0);if(ix===target.length){ix=0;triggerSignalRain();}});}
  const status=document.querySelector('.sidebar-status');if(status&&!status.dataset.eggBound){status.dataset.eggBound='1';let n=0;status.addEventListener('click',()=>{n++;if(n===5){n=0;showEgg('EVIDENCE NEVER SLEEPS','You found the quiet channel.\n\nFour hidden behaviors ship in this build. No hidden collection does.');}});}
}
