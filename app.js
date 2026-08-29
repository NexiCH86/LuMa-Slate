const screens=[...document.querySelectorAll('.screen')];
const nav=[...document.querySelectorAll('.bottom-nav [data-go]')];
function go(target){screens.forEach(s=>s.classList.toggle('active',s.dataset.screen===target));nav.forEach(b=>b.classList.toggle('active',b.dataset.go===target));window.scrollTo({top:0,behavior:'instant'});}
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
document.querySelectorAll('.mode-switch button').forEach(b=>b.addEventListener('click',()=>{b.parentElement.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');}));
function updateClock(){document.getElementById('clock').textContent=new Date().toLocaleTimeString('de-CH',{hour:'2-digit',minute:'2-digit'});}updateClock();setInterval(updateClock,30000);
const librarySearch=document.getElementById('librarySearch');
const libraryDocs=[...document.querySelectorAll('.library-doc')];
const libraryTabs=[...document.querySelectorAll('[data-library-tab]')];
const categoryButtons=[...document.querySelectorAll('[data-library-category]')];
const libraryResultCount=document.getElementById('libraryResultCount');
const libraryListTitle=document.getElementById('libraryListTitle');
const libraryEmpty=document.getElementById('libraryEmpty');
let activeLibraryTab='all';let activeLibraryCategory='all';
function renderLibrary(){const q=(librarySearch?.value||'').trim().toLocaleLowerCase('de-CH');let visible=0;libraryDocs.forEach(doc=>{const title=(doc.dataset.title||'').toLocaleLowerCase('de-CH');const matchesSearch=!q||title.includes(q);const matchesCategory=activeLibraryCategory==='all'||doc.dataset.category===activeLibraryCategory;const matchesTab=activeLibraryTab==='all'||doc.dataset[activeLibraryTab]==='true';const show=matchesSearch&&matchesCategory&&matchesTab;doc.hidden=!show;if(show)visible++;});if(libraryResultCount)libraryResultCount.textContent=`${visible} angezeigt`;if(libraryEmpty)libraryEmpty.hidden=visible!==0;}
librarySearch?.addEventListener('input',renderLibrary);
libraryTabs.forEach(tab=>tab.addEventListener('click',()=>{activeLibraryTab=tab.dataset.libraryTab;libraryTabs.forEach(t=>t.classList.toggle('active',t===tab));const titles={all:'ALLE DOKUMENTE',recent:'ZULETZT GEÖFFNET',favorites:'FAVORITEN',offline:'OFFLINE VERFÜGBAR'};if(libraryListTitle)libraryListTitle.textContent=titles[activeLibraryTab]||'ALLE DOKUMENTE';renderLibrary();}));
categoryButtons.forEach(button=>button.addEventListener('click',()=>{const category=button.dataset.libraryCategory;activeLibraryCategory=activeLibraryCategory===category?'all':category;categoryButtons.forEach(b=>b.classList.toggle('selected',b.dataset.libraryCategory===activeLibraryCategory));renderLibrary();}));
document.querySelectorAll('.view-switch button').forEach(button=>button.addEventListener('click',()=>{button.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));button.classList.add('selected');}));
renderLibrary();
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
