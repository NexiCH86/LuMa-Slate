(()=>{'use strict';
const V='0.12.24';
function root(){return document.getElementById('np122')}
function norm(t){return String(t||'').trim().toLowerCase().replace(/\s+/g,' ')}
function hideNormalStatus(){const r=root();if(!r)return;r.querySelectorAll('.np122-status').forEach(el=>el.style.setProperty('display','none','important'))}
function applyFullscreen(){const r=root(),sc=document.querySelector('[data-screen="notes"]'),on=document.body.classList.contains('np122-full');if(!r||!sc)return;
  if(on){
    /* The old Notes 0.9 card and its Save/AI buttons are siblings of #np122, not children of it. */
    [...sc.children].forEach(el=>{if(el!==r)el.dataset.np1224Hidden='1'});
    r.querySelector('aside')?.setAttribute('data-np1224-hidden','1');
    ['.np122-meta','.np122-tools','.np122-options','.np122-pages','.np122-foot'].forEach(sel=>r.querySelectorAll(sel).forEach(el=>el.setAttribute('data-np1224-hidden','1')));
    const main=r.querySelector('main');if(main)main.dataset.np1224Main='1';
    const paper=document.getElementById('nPaper');if(paper)paper.dataset.np1224Paper='1';
    const fs=r.querySelector('.np122-fsbar');if(fs){fs.dataset.np1224Fs='1';fs.querySelectorAll('*').forEach(x=>x.dataset.np1224FsChild='1')}
  }else{
    document.querySelectorAll('[data-np1224-hidden]').forEach(el=>el.removeAttribute('data-np1224-hidden'));
    r.querySelector('main')?.removeAttribute('data-np1224-main');document.getElementById('nPaper')?.removeAttribute('data-np1224-paper');
    r.querySelector('.np122-fsbar')?.removeAttribute('data-np1224-fs');r.querySelectorAll('[data-np1224-fs-child]').forEach(x=>x.removeAttribute('data-np1224-fs-child'));
  }
}
function css(){if(document.getElementById('np1224css'))return;const s=document.createElement('style');s.id='np1224css';s.textContent=`
body.np122-full [data-np1224-hidden="1"]{display:none!important}
body.np122-full #np122{display:block!important;margin:0!important;padding:0!important;width:100%!important;max-width:none!important}
body.np122-full #np122 [data-np1224-main="1"]{display:block!important;margin:0!important;padding:0!important;border:0!important;width:100%!important;max-width:none!important}
body.np122-full #np122 [data-np1224-paper="1"]{display:block!important;margin:0!important;width:100%!important;max-width:none!important;height:100vh!important;min-height:100vh!important;border:0!important;border-radius:0!important;aspect-ratio:auto!important}
body.np122-full #np122 [data-np1224-fs="1"]{display:flex!important;visibility:visible!important;position:fixed!important;right:10px!important;top:10px!important;z-index:2147483647!important;gap:6px!important}
body.np122-full #np122 [data-np1224-fs="1"] *,body.np122-full #np122 [data-np1224-fs-child="1"]{display:inline-flex!important;visibility:visible!important;opacity:1!important}
body.np122-full #np122 .np122-fsbar button{min-width:44px!important;min-height:44px!important;align-items:center!important;justify-content:center!important;background:#fff!important;color:#071117!important;border:2px solid #071117!important}
`;document.head.appendChild(s)}
function run(){css();hideNormalStatus();applyFullscreen()}
let tm;new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(run,15)}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
document.addEventListener('pointerdown',e=>{if(e.target.closest?.('#nFull,#nFsExit,[data-tool]'))setTimeout(run,20)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();console.info('LuMa Slate Notes fullscreen correction '+V+' ready');
})();