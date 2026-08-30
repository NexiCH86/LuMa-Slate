(()=>{'use strict';
const V='0.12.4';
function css(){if(document.getElementById('np124css'))return;const s=document.createElement('style');s.id='np124css';s.textContent=`
/* In writing tools, ink must sit above positioned text blocks so handwriting/highlighter can cross text. */
#np122:not(.textmode) .np122-textlayer{z-index:3!important;pointer-events:none!important}
#np122:not(.textmode) .np122-ink{z-index:5!important;pointer-events:auto!important}
#np122:not(.textmode) .np122-text{pointer-events:none!important;background:transparent!important;border-color:transparent!important;outline:none!important}
/* In text mode, text blocks become editable again and ink stays visible underneath. */
#np122.textmode .np122-ink{z-index:2!important;pointer-events:none!important}
#np122.textmode .np122-textlayer{z-index:4!important;pointer-events:none!important}
#np122.textmode .np122-text{pointer-events:auto!important;background:transparent!important}
`;document.head.appendChild(s)}
function protect(){const root=document.getElementById('np122');if(!root)return;const clear=root.querySelector('#nClear');if(clear&&!clear.dataset.np124){clear.dataset.np124='1';clear.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();if(!confirm('Alle handschriftlichen Pen- und Marker-Inhalte auf dieser Seite wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.'))return;const raw=localStorage.getItem('luma.notes.v2');let st;try{st=JSON.parse(raw||'{}')}catch{return}const n=(st.notes||[]).find(x=>x.id===st.activeId);const p=n?.pages?.[Math.max(0,Math.min(Number(st.page)||0,(n.pages?.length||1)-1))];if(!p)return;p.strokes=[];n.updatedAt=Date.now();localStorage.setItem('luma.notes.v2',JSON.stringify(st));document.querySelector('#np122 #nInk')?.getContext('2d')?.clearRect(0,0,document.querySelector('#np122 #nInk').width,document.querySelector('#np122 #nInk').height);};}
const del=root.querySelector('#nDel');if(del&&!del.dataset.np124){del.dataset.np124='1';del.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();const raw=localStorage.getItem('luma.notes.v2');let st;try{st=JSON.parse(raw||'{}')}catch{return}const n=(st.notes||[]).find(x=>x.id===st.activeId);const title=n?.title||'diese Notiz';if(!confirm(`Notiz „${title}“ wirklich vollständig löschen?\n\nText, Handschrift, Marker und alle Seiten dieser Notiz werden gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.`))return;st.notes=(st.notes||[]).filter(x=>x.id!==st.activeId);st.activeId=st.notes[0]?.id||null;st.page=0;localStorage.setItem('luma.notes.v2',JSON.stringify(st));document.getElementById('np122')?.remove();setTimeout(()=>location.reload(),40);};}}
function enhance(){css();protect()}
let t=0;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(enhance,20)}).observe(document.documentElement,{childList:true,subtree:true});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();console.info(`LuMa Slate Notes safety ${V} ready`);
})();