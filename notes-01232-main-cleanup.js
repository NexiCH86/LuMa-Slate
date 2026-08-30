(()=>{'use strict';const V='0.12.32';
function norm(v){return String(v||'').trim().toLowerCase().replace(/\s+/g,' ')}
function hide(el){if(el)el.style.setProperty('display','none','important')}
function clean(){
  /* Main Notes screen only. Fullscreen/editor behavior remains untouched. */
  if(document.body.classList.contains('np122-full'))return;
  const notes=document.getElementById('notes')||document.querySelector('[data-screen="notes"],.screen-notes');
  const scope=notes||document.body;
  scope.querySelectorAll('button,a').forEach(el=>{
    const t=norm(el.textContent);
    if(t==='speichern'||t==='save'||t==='mit luma ai öffnen'||t==='mit luma ai oeffnen') hide(el);
  });
  /* Remove the informational Notes Pro/Autosave card, not the actual Notes sidebar/editor. */
  scope.querySelectorAll('div,section,article').forEach(el=>{
    const t=norm(el.textContent);
    if(el.querySelector('#np122,.np122-tools,#nPaper'))return;
    if((t.includes('notes pro 0.9')||t.includes('notes pro 0.12.2'))&&t.includes('autosave')&&t.includes('persistente textnotizen')) hide(el);
  });
  /* Version belongs in About/Settings, not the daily Notes sidebar. Keep the Notes Pro label itself. */
  scope.querySelectorAll('div,span,p,small').forEach(el=>{
    if(el.children.length)return;
    const t=String(el.textContent||'');
    if(/^\s*0\.12\.2\s*$/.test(t)||/^\s*notes pro\s+0\.12\.2\s*$/i.test(t)){
      if(/^\s*notes pro/i.test(t))el.textContent='Notes Pro'; else hide(el);
    }
  });
}
let tm;new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(clean,25)}).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean,{once:true});else clean();
console.info('LuMa Slate Notes main cleanup '+V+' ready');})();