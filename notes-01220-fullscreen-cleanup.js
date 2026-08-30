(()=>{'use strict';
const V='0.12.20';
function css(){if(document.getElementById('np1220css'))return;const s=document.createElement('style');s.id='np1220css';s.textContent=`
/* Autosave is canonical: the manual save action is redundant. */
#np122 [data-a="save"],#np122 #nSave,#np122 .np-save{display:none!important}
/* In fullscreen, the paper is the workspace. Keep only the compact top-right status/exit control. */
#np122:fullscreen .np122-head,#np122:fullscreen .np122-sidebar,#np122:fullscreen .np122-tools,#np122:fullscreen .np122-options,#np122:fullscreen #np1218bar,#np122:fullscreen #np1219bar,#np122:fullscreen .np122-pages,#np122:fullscreen .np122-actions,#np122:fullscreen [data-a="save"],#np122:fullscreen [data-a="ai"],
#np122.np1220-full .np122-head,#np122.np1220-full .np122-sidebar,#np122.np1220-full .np122-tools,#np122.np1220-full .np122-options,#np122.np1220-full #np1218bar,#np122.np1220-full #np1219bar,#np122.np1220-full .np122-pages,#np122.np1220-full .np122-actions,#np122.np1220-full [data-a="save"],#np122.np1220-full [data-a="ai"]{display:none!important}
#np122:fullscreen,#np122.np1220-full{padding:0!important;margin:0!important;background:#fff!important}
#np122:fullscreen .np122-main,#np122.np1220-full .np122-main{display:block!important;margin:0!important;padding:0!important;width:100%!important;max-width:none!important}
#np122:fullscreen #nPaper,#np122.np1220-full #nPaper{margin:0!important;width:100%!important;max-width:none!important;min-height:100vh!important;height:100vh!important;border:0!important;border-radius:0!important}
#np1220hud{position:fixed;right:12px;top:10px;z-index:2147483645;display:none;align-items:center;gap:7px}
#np1220hud.on{display:flex!important}#np1220hud .mode,#np1220hud button{min-height:42px;border:2px solid #071117;border-radius:6px;background:#fff;color:#071117;font:700 14px/1 sans-serif;padding:8px 12px}#np1220hud button{font-size:22px;padding:5px 11px}
`;document.head.appendChild(s)}
let hud;
function root(){return document.getElementById('np122')}
function isFull(){const r=root();return !!r&&(document.fullscreenElement===r||document.fullscreenElement?.contains?.(r)||r.classList.contains('np1220-full'))}
function toolLabel(){const r=root();if(!r)return'';const active=r.querySelector('[data-tool].active,[data-tool].selected,[data-tool][aria-pressed="true"]');if(active)return active.textContent.trim().replace(/\s+/g,' ');const cls=['textmode','penmode','markermode','erasermode'].find(c=>r.classList.contains(c));return ({textmode:'Text',penmode:'Pen',markermode:'Marker',erasermode:'Radierer'})[cls]||'Notes'}
function build(){if(hud)return;hud=document.createElement('div');hud.id='np1220hud';hud.innerHTML='<span class="mode">Notes</span><button type="button" aria-label="Vollbild schliessen">×</button>';document.body.appendChild(hud);hud.addEventListener('pointerdown',e=>e.stopPropagation());hud.querySelector('button').addEventListener('click',async e=>{e.preventDefault();e.stopPropagation();const r=root();try{if(document.fullscreenElement)await document.exitFullscreen();else r?.classList.remove('np1220-full')}catch{r?.classList.remove('np1220-full')}sync()})}
function sync(){css();build();const r=root();if(!r){hud.classList.remove('on');return}const full=isFull();hud.classList.toggle('on',full);hud.querySelector('.mode').textContent=toolLabel();if(full)r.classList.add('np1220-full');else if(!document.fullscreenElement)r.classList.remove('np1220-full')}
/* Hide a manual save button even if its markup has no stable id/class. Do not touch Autosave labels. */
function hideRedundantSave(){const r=root();if(!r)return;r.querySelectorAll('button').forEach(b=>{const t=b.textContent.trim().toLowerCase();if(t==='speichern'||t==='save')b.style.setProperty('display','none','important')})}
document.addEventListener('fullscreenchange',()=>setTimeout(sync,0));document.addEventListener('pointerdown',e=>{if(e.target.closest?.('[data-tool]'))setTimeout(sync,30)},true);
let tm;new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(()=>{hideRedundantSave();sync()},30)}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
function boot(){css();build();hideRedundantSave();sync();console.info('LuMa Slate Notes fullscreen cleanup '+V+' ready')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();