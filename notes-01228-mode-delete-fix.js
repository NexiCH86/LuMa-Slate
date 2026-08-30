(()=>{'use strict';const V='0.12.28',KEY='luma.notes.v2';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY))}catch{return null}};
function notesScreen(){return document.querySelector('[data-screen="notes"]')}
function keepNotes(){const s=notesScreen();if(!s)return;document.querySelectorAll('.screen,[data-screen]').forEach(x=>{if(x.matches('[data-screen]'))x.classList.toggle('active',x===s)});document.querySelectorAll('.bottom-nav [data-go]').forEach(b=>b.classList.toggle('active',b.dataset.go==='notes'))}
function currentTool(){const r=document.getElementById('np122');const sel=r?.querySelector('[data-tool].sel,[data-tool].active,[data-tool][aria-pressed="true"]');if(sel?.dataset.tool)return sel.dataset.tool;try{return JSON.parse(localStorage.getItem('luma.notes.tools.v3'))?.tool||'pen'}catch{return'pen'}}
function isolate(){const r=document.getElementById('np122');if(!r)return;const o=r.querySelector('.np122-options');if(!o)return;const tool=currentTool();const kids=[...o.children];kids.forEach(el=>el.style.removeProperty('display'));
 const hide=el=>el.style.setProperty('display','none','important');
 if(tool==='pen'){
   kids.forEach(el=>{const t=(el.textContent||'').trim();if(t==='Marker-Farbe'||el.id==='nMW'||el.id==='nMO'||el.matches?.('[data-mc]'))hide(el)});
 }else if(tool==='marker'){
   kids.forEach(el=>{const t=(el.textContent||'').trim();if(t==='Pen-Art'||t==='Dicke'||t==='Pen-Farbe'||el.id==='nStyle'||el.matches?.('[data-pw],[data-pc]'))hide(el)});
 }else if(tool==='eraser'){
   kids.forEach(hide);
 }else if(tool==='text'){
   /* Text formatting is supplied by the stable text toolbar; hide pen/marker options. */ kids.forEach(hide);
 }
 o.style.setProperty('display',tool==='eraser'?'none':'flex','important');
 if(tool==='text' && !o.querySelector(':scope > *:not([style*="display: none"])'))o.style.setProperty('display','none','important');
}
/* Base delete renders synchronously and can expose Home through surrounding app state. Capture the action and perform the state mutation ourselves, then keep Notes active. */
document.addEventListener('click',e=>{const b=e.target.closest?.('#nDel');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const st=read();if(!st?.notes)return;const active=st.activeId;st.notes=st.notes.filter(n=>n.id!==active);st.activeId=st.notes[0]?.id||null;st.page=0;localStorage.setItem(KEY,JSON.stringify(st));keepNotes();setTimeout(()=>{keepNotes();document.querySelector('[data-go="notes"]')?.click();keepNotes()},0);setTimeout(keepNotes,80)},true);
document.addEventListener('pointerdown',e=>{if(e.target.closest?.('[data-tool],[data-pw],[data-pc],[data-mc],#nStyle,#nMW,#nMO'))setTimeout(isolate,20)},true);document.addEventListener('change',e=>{if(e.target.closest?.('#nStyle,#nMW,#nMO'))setTimeout(isolate,20)},true);
let tm;new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(isolate,20)}).observe(document.documentElement,{subtree:true,childList:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',isolate,{once:true});else isolate();console.info('LuMa Slate mode/delete fix '+V+' ready')})();