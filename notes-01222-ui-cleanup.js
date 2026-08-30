(()=>{'use strict';
const V='0.12.22';
function root(){return document.getElementById('np122')}
function norm(t){return String(t||'').trim().toLowerCase().replace(/\s+/g,' ')}
function isRedundantPill(t){t=norm(t);return t==='text' || t==='radierer' || /(?:füllfeder|fuellfeder|fineliner|bleistift|kugelschreiber|marker|pen)\s*[·•\-:]?\s*\d+\s*px/.test(t)}
function hidePills(){const r=root();if(!r)return;const tools=r.querySelector('.np122-tools')||r;tools.querySelectorAll('span,div,button').forEach(el=>{if(el.matches('[data-tool],select,option')||el.querySelector('[data-tool],select'))return;if(isRedundantPill(el.textContent)){el.dataset.np1222Pill='1';el.style.setProperty('display','none','important')}})}
function full(){const r=root();return !!r&&(document.fullscreenElement===r||document.fullscreenElement?.contains?.(r)||r.classList.contains('np1220-full'))}
function cleanFull(){const r=root();if(!r||!full())return;/* BOOX fullscreen keeps parts of the normal shell alive; hide by content as fallback. */r.querySelectorAll('button').forEach(b=>{const t=norm(b.textContent);if(t==='speichern'||t==='save'||t.includes('mit luma ai'))b.style.setProperty('display','none','important')});r.querySelectorAll('div,section,header').forEach(el=>{const t=norm(el.textContent);if((t.startsWith('notes pro 0.9')||t.includes('lokale, persistente textnotizen mit direktem luma-ai-kontext'))&&el.children.length<8)el.style.setProperty('display','none','important')})}
function css(){if(document.getElementById('np1222css'))return;const s=document.createElement('style');s.id='np1222css';s.textContent=`[data-np1222-pill="1"]{display:none!important}
#np122:fullscreen button,#np122.np1220-full button{visibility:hidden!important}
#np122:fullscreen #nPaper button,#np122.np1220-full #nPaper button,#np122:fullscreen #np1220hud button,#np122.np1220-full #np1220hud button{visibility:visible!important}
#np1220hud button{visibility:visible!important}`;document.head.appendChild(s)}
function run(){css();hidePills();cleanFull()}
let tm;new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(run,20)}).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
document.addEventListener('fullscreenchange',()=>setTimeout(run,0));document.addEventListener('pointerdown',e=>{if(e.target.closest?.('[data-tool],button'))setTimeout(run,25)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();