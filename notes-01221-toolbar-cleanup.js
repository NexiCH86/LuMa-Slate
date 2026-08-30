(()=>{'use strict';
const V='0.12.21';
function root(){return document.getElementById('np122')}
function isSummaryText(t){t=String(t||'').trim().toLowerCase().replace(/\s+/g,' ');return /(?:füllfeder|fuellfeder|fineliner|bleistift|kugelschreiber|marker|pen)\s*[·•\-:]?\s*\d+\s*px/.test(t)}
function hideSummaryPill(){const r=root();if(!r)return;const tools=r.querySelector('.np122-tools')||r;tools.querySelectorAll('span,div,button').forEach(el=>{if(el.matches('[data-tool],select,option')||el.querySelector('[data-tool],select'))return;if(isSummaryText(el.textContent)){el.dataset.np1221Summary='1';el.style.setProperty('display','none','important')}})}
function css(){if(document.getElementById('np1221css'))return;const s=document.createElement('style');s.id='np1221css';s.textContent='[data-np1221-summary="1"]{display:none!important}';document.head.appendChild(s)}
let tm;new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(hideSummaryPill,25)}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
document.addEventListener('pointerdown',e=>{if(e.target.closest?.('[data-tool]'))setTimeout(hideSummaryPill,30)},true);
function boot(){css();hideSummaryPill();console.info('LuMa Slate Notes toolbar cleanup '+V+' ready')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();