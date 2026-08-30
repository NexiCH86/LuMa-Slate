(()=>{'use strict';const V='0.12.31',PREF='luma.notes.tools.v3';
function tool(){try{return JSON.parse(localStorage.getItem(PREF))?.tool||'pen'}catch{return'pen'}}
function isolate(){const r=document.getElementById('np122'),o=r?.querySelector('.np122-options');if(!o)return;const mode=tool(),kids=[...o.children];const show=e=>e.style.removeProperty('display'),hide=e=>e.style.setProperty('display','none','important');kids.forEach(show);
  const txt=e=>(e.textContent||'').trim();
  const isPen=e=>txt(e)==='Pen-Art'||txt(e)==='Dicke'||txt(e)==='Pen-Farbe'||e.id==='nStyle'||e.matches?.('[data-pw],[data-pc]');
  const isMarker=e=>txt(e)==='Marker-Farbe'||e.id==='nMW'||e.id==='nMO'||e.matches?.('[data-mc]');
  if(mode==='pen')kids.forEach(e=>{if(isMarker(e))hide(e)});
  else if(mode==='marker')kids.forEach(e=>{if(isPen(e))hide(e)});
  else kids.forEach(hide);
  o.style.setProperty('display',(mode==='pen'||mode==='marker')?'flex':'none','important');
}
function schedule(){setTimeout(isolate,0);setTimeout(isolate,25);setTimeout(isolate,90)}
document.addEventListener('pointerdown',e=>{if(e.target.closest?.('[data-tool],[data-pw],[data-pc],[data-mc],#nStyle,#nMW,#nMO'))schedule()},true);
document.addEventListener('click',e=>{if(e.target.closest?.('[data-tool],[data-pw],[data-pc],[data-mc]'))schedule()},true);
document.addEventListener('change',e=>{if(e.target.closest?.('#nStyle,#nMW,#nMO'))schedule()},true);
let tm;new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(isolate,15)}).observe(document.documentElement,{subtree:true,childList:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',isolate,{once:true});else isolate();console.info('LuMa Slate strict mode isolation '+V+' ready')})();