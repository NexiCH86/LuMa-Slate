(()=>{'use strict';
const V='0.12.6',KEY='luma.notes.v2';
const rd=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}},wr=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
function cur(){const s=rd(KEY,{notes:[],activeId:null,page:0}),n=(s.notes||[]).find(x=>x.id===s.activeId);if(!n)return {s};const i=Math.max(0,Math.min(Number(s.page)||0,(n.pages?.length||1)-1)),p=n.pages?.[i];return {s,n,p,i}}
function css(){if(document.getElementById('np126css'))return;const s=document.createElement('style');s.id='np126css';s.textContent=`.np125-text-hint{display:none!important}#np122.textmode .np122-textlayer{pointer-events:none!important}#np122.textmode .np122-text{pointer-events:auto!important}`;document.head.appendChild(s)}
function removeHint(){document.querySelectorAll('.np125-text-hint').forEach(x=>x.remove())}
function escAttr(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function createTextBlock(e){const root=document.getElementById('np122');if(!root?.classList.contains('textmode'))return false;const paper=document.getElementById('nPaper');if(!paper||!paper.contains(e.target)||e.target.closest?.('.np122-text'))return false;const {s,n,p}=cur();if(!p||!n)return false;const r=paper.getBoundingClientRect();if(!r.width||!r.height)return false;const x=Math.max(.01,Math.min(.80,(e.clientX-r.left)/r.width)),y=Math.max(.01,Math.min(.90,(e.clientY-r.top)/r.height)),id='t-'+Date.now();p.texts=p.texts||[];const obj={id,x,y,w:.44,text:'',format:{font:'Arial, sans-serif',size:18,color:'#071117',bold:false,italic:false,underline:false,align:'left',background:'transparent'}};p.texts.push(obj);n.updatedAt=Date.now();wr(KEY,s);
 const layer=document.getElementById('nTexts');if(!layer)return false;const ta=document.createElement('textarea');ta.className='np122-text';ta.dataset.tid=id;ta.setAttribute('autocomplete','off');ta.setAttribute('autocorrect','on');ta.setAttribute('spellcheck','true');ta.style.left=`${x*100}%`;ta.style.top=`${y*100}%`;ta.style.width='44%';ta.style.fontFamily='Arial, sans-serif';ta.style.fontSize='18px';ta.style.color='#071117';ta.style.fontWeight='400';ta.style.fontStyle='normal';ta.style.textDecoration='none';ta.style.textAlign='left';ta.style.background='rgba(255,255,255,.88)';layer.appendChild(ta);
 ta.oninput=ev=>{const z=cur(),t=z.p?.texts?.find(q=>q.id===id);if(t){t.text=ev.target.value;z.n.updatedAt=Date.now();wr(KEY,z.s)}};
 // Keep focus in the original trusted pointer gesture; this is important for Android/BOOX IME.
 ta.focus({preventScroll:true});try{ta.setSelectionRange(0,0)}catch{};ta.dispatchEvent(new Event('focus',{bubbles:true}));return true}
function intercept(e){if(createTextBlock(e)){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}}
function blockLegacyPointerUp(e){const root=document.getElementById('np122');if(!root?.classList.contains('textmode'))return;const paper=document.getElementById('nPaper');if(!paper||!paper.contains(e.target)||e.target.closest?.('.np122-text'))return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}
function enhance(){css();removeHint()}
// Capture on document before the legacy paper pointerup handler. New text blocks are created on pointerdown,
// synchronously focused in the same user gesture so BOOX can open its virtual keyboard.
document.addEventListener('pointerdown',intercept,true);document.addEventListener('pointerup',blockLegacyPointerUp,true);
new MutationObserver(()=>{removeHint()}).observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance,{once:true});else enhance();
console.info(`LuMa Slate Notes text input repair ${V} ready`);
})();