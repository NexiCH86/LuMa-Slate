const LUMA_UI_VERSION='0.6.0';
const LUMA_SHELL_VERSION='1.0.0';
const screens=[...document.querySelectorAll('.screen')];
const nav=[...document.querySelectorAll('.bottom-nav [data-go]')];
function go(target){screens.forEach(s=>s.classList.toggle('active',s.dataset.screen===target));nav.forEach(b=>b.classList.toggle('active',b.dataset.go===target));window.scrollTo(0,0);}
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
function updateClock(){const el=document.getElementById('clock');if(el)el.textContent=new Date().toLocaleTimeString('de-CH',{hour:'2-digit',minute:'2-digit'});}updateClock();setInterval(updateClock,30000);

const librarySearch=document.getElementById('librarySearch');
const libraryDocs=[...document.querySelectorAll('.library-doc')];
const libraryTabs=[...document.querySelectorAll('[data-library-tab]')];
const categoryButtons=[...document.querySelectorAll('[data-library-category]')];
const libraryResultCount=document.getElementById('libraryResultCount');
const libraryListTitle=document.getElementById('libraryListTitle');
const libraryEmpty=document.getElementById('libraryEmpty');
let activeLibraryTab='all';
let activeLibraryCategory='all';
function renderLibrary(){const q=(librarySearch?.value||'').trim().toLocaleLowerCase('de-CH');let visible=0;libraryDocs.forEach(doc=>{const title=(doc.dataset.title||'').toLocaleLowerCase('de-CH');const matchesSearch=!q||title.includes(q);const matchesCategory=activeLibraryCategory==='all'||doc.dataset.category===activeLibraryCategory;const matchesTab=activeLibraryTab==='all'||doc.dataset[activeLibraryTab]==='true';const show=matchesSearch&&matchesCategory&&matchesTab;doc.hidden=!show;if(show)visible++;});if(libraryResultCount)libraryResultCount.textContent=`${visible} angezeigt`;if(libraryEmpty)libraryEmpty.hidden=visible!==0;}
librarySearch?.addEventListener('input',renderLibrary);
libraryTabs.forEach(tab=>tab.addEventListener('click',()=>{activeLibraryTab=tab.dataset.libraryTab;libraryTabs.forEach(t=>t.classList.toggle('active',t===tab));const titles={all:'ALLE DOKUMENTE',recent:'ZULETZT GEÖFFNET',favorites:'FAVORITEN',offline:'OFFLINE VERFÜGBAR'};if(libraryListTitle)libraryListTitle.textContent=titles[activeLibraryTab]||'ALLE DOKUMENTE';renderLibrary();}));
categoryButtons.forEach(button=>button.addEventListener('click',()=>{const category=button.dataset.libraryCategory;activeLibraryCategory=activeLibraryCategory===category?'all':category;categoryButtons.forEach(b=>b.classList.toggle('selected',b.dataset.libraryCategory===activeLibraryCategory));renderLibrary();}));
document.querySelectorAll('.view-switch button').forEach(button=>button.addEventListener('click',()=>{button.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));button.classList.add('selected');}));
renderLibrary();

const readerData={
'SIA 382/1 – Lüftungs- und Klimaanlagen':{page:132,pages:356,section:'Lüftung und Luftqualität'},
'SIA 181 – Schallschutz im Hochbau':{page:18,pages:96,section:'Anforderungen und Beurteilung'},
'Eurocode 3':{page:76,pages:214,section:'Verbindungsmittel'},
'Building Physics':{page:205,pages:336,section:'Heat, Air and Moisture'},
'Advanced Python Programming':{page:45,pages:168,section:'Functions and Data Structures'},
'BOOX Tab Ultra C Pro – User Guide':{page:12,pages:84,section:'Display and E-Ink Settings'},
'Revit MEP Best Practices':{page:31,pages:240,section:'Model Coordination'},
'Lüftungskonzept MFH – Ausführung':{page:27,pages:82,section:'Luftführung und Ausführung'}
};
let activeReaderDoc='SIA 382/1 – Lüftungs- und Klimaanlagen';
let readerPage=132;
function loadReader(title){activeReaderDoc=title||activeReaderDoc;const data=readerData[activeReaderDoc]||{page:1,pages:100,section:'Document'};readerPage=data.page;document.getElementById('readerDocTitle').textContent=activeReaderDoc;document.getElementById('readerPage').textContent=readerPage;document.getElementById('readerPages').textContent=data.pages;document.getElementById('readerSectionTitle').textContent=data.section;go('reader');}
document.querySelectorAll('.open-reader').forEach(b=>b.addEventListener('click',()=>loadReader(b.dataset.doc)));
document.getElementById('readerPrev')?.addEventListener('click',()=>{readerPage=Math.max(1,readerPage-1);document.getElementById('readerPage').textContent=readerPage;});
document.getElementById('readerNext')?.addEventListener('click',()=>{const max=Number(document.getElementById('readerPages').textContent)||999;readerPage=Math.min(max,readerPage+1);document.getElementById('readerPage').textContent=readerPage;});
document.querySelectorAll('[data-reader-tool]').forEach(b=>b.addEventListener('click',()=>{b.classList.toggle('selected');if(b.dataset.readerTool==='bookmark')b.textContent=b.classList.contains('selected')?'★ Bookmarked':'☆ Bookmark';}));

const projectCards=[...document.querySelectorAll('.project-card')];
function selectProject(card){projectCards.forEach(c=>c.classList.toggle('selected',c===card));document.getElementById('projectTitle').textContent=card.dataset.project;document.getElementById('projectProgress').textContent=`${card.dataset.progress}%`;document.getElementById('projectTasks').textContent=card.dataset.tasks;document.getElementById('projectProgressBar').style.width=`${card.dataset.progress}%`;}
projectCards.forEach(card=>card.addEventListener('click',()=>selectProject(card)));
document.querySelectorAll('[data-work-tab]').forEach(tab=>tab.addEventListener('click',()=>{tab.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('active'));tab.classList.add('active');}));

const noteCards=[...document.querySelectorAll('.note-card')];
function selectNote(card){noteCards.forEach(c=>c.classList.toggle('selected',c===card));document.getElementById('noteTitle').value=card.dataset.note;document.getElementById('noteDate').textContent=card.dataset.date;}
noteCards.forEach(card=>card.addEventListener('click',()=>selectNote(card)));
document.querySelectorAll('.open-note').forEach(b=>b.addEventListener('click',()=>{const card=noteCards.find(c=>c.dataset.note===b.dataset.note);if(card)selectNote(card);go('notes');}));
document.querySelectorAll('.note-tools button').forEach(b=>b.addEventListener('click',()=>{b.parentElement.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');}));
document.getElementById('newNote')?.addEventListener('click',()=>{document.getElementById('noteTitle').value='Neue Notiz';document.getElementById('noteDate').textContent=new Date().toLocaleDateString('de-CH');noteCards.forEach(c=>c.classList.remove('selected'));});

const modeButtons=[...document.querySelectorAll('.mode-switch button')];
modeButtons.forEach(b=>b.addEventListener('click',()=>{modeButtons.forEach(x=>x.classList.remove('selected'));b.classList.add('selected');}));
let aiContext='general';
function setAiContext(context){aiContext=context;const labels={general:'General workspace',reader:`Document: ${activeReaderDoc}`,project:`Project: ${document.getElementById('projectTitle')?.textContent||'Active project'}`,notes:`Note: ${document.getElementById('noteTitle')?.value||'Selected note'}`};document.getElementById('aiContextLabel').textContent=`Context: ${labels[context]}`;document.querySelectorAll('[data-ai-context]').forEach(b=>b.classList.toggle('selected',b.dataset.aiContext===context));}
document.querySelectorAll('[data-ai-context]').forEach(b=>b.addEventListener('click',()=>setAiContext(b.dataset.aiContext)));
document.querySelectorAll('.ask-ai').forEach(b=>b.addEventListener('click',()=>{setAiContext(b.dataset.context||'general');go('ai');}));
function addMessage(className,text){const chat=document.getElementById('chatCard');const box=document.createElement('div');box.className=`message ${className}`;const p=document.createElement('p');p.textContent=text;box.appendChild(p);chat.appendChild(box);}
function sendAi(text){const input=document.getElementById('aiInput');const value=(text||input.value).trim();if(!value)return;addMessage('user',value);const contextText={general:'dem LuMa Workspace',reader:`dem geöffneten Dokument ${activeReaderDoc}`,project:`dem aktiven Projekt ${document.getElementById('projectTitle')?.textContent}`,notes:`der ausgewählten Notiz ${document.getElementById('noteTitle')?.value}`}[aiContext];addMessage('assistant',`Kontext aus ${contextText} ist aktiv. Die Benutzeroberfläche ist bereits vollständig verbunden; die echte Modellantwort folgt mit dem LuMa-AI-Backend.`);input.value='';}
document.getElementById('aiSend')?.addEventListener('click',()=>sendAi());
document.getElementById('aiInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')sendAi();});
document.querySelectorAll('.ai-suggestions button').forEach(b=>b.addEventListener('click',()=>sendAi(b.textContent)));

function versionParts(value){return String(value||'0').split('.').map(v=>Number.parseInt(v,10)||0);}
function compareVersions(a,b){const av=versionParts(a),bv=versionParts(b);for(let i=0;i<Math.max(av.length,bv.length);i++){const d=(av[i]||0)-(bv[i]||0);if(d!==0)return d;}return 0;}
function injectUpdaterStyle(){if(document.getElementById('lumaUpdaterStyle'))return;const style=document.createElement('style');style.id='lumaUpdaterStyle';style.textContent='.luma-update{position:fixed;z-index:50;left:50%;transform:translateX(-50%);bottom:112px;width:min(calc(100vw - 32px),860px);border:2px solid #0c4d50;background:#fbfcfa;padding:16px 18px;display:flex;gap:18px;align-items:center;justify-content:space-between;box-shadow:none}.luma-update strong,.luma-update span{display:block}.luma-update span{margin-top:4px;font-size:12px;color:#687679}.luma-update-actions{display:flex;gap:8px}.luma-update button{min-height:44px;border:1px solid #0c4d50;background:#fff;padding:0 14px;font-weight:700}.luma-update .install{background:#0c4d50;color:#fff}.luma-version-badge{position:fixed;right:12px;top:118px;z-index:20;font-size:10px;color:#687679;background:#f6f7f5;border:1px solid #cfd8d5;padding:5px 7px}@media(max-width:720px){.luma-update{bottom:102px;align-items:stretch;flex-direction:column}.luma-update-actions{display:grid;grid-template-columns:1fr 1fr}.luma-version-badge{top:94px}}';document.head.appendChild(style);}
function showVersionBadge(){injectUpdaterStyle();const badge=document.createElement('div');badge.className='luma-version-badge';badge.textContent=`UI ${LUMA_UI_VERSION} · Shell ${LUMA_SHELL_VERSION}`;document.body.appendChild(badge);}
function showUpdateBanner(manifest){if(document.querySelector('.luma-update'))return;injectUpdaterStyle();const wrap=document.createElement('section');wrap.className='luma-update';const copy=document.createElement('div');const title=document.createElement('strong');title.textContent=`LuMa Slate ${manifest.latestUiVersion} verfügbar`;const sub=document.createElement('span');sub.textContent=manifest.mandatory?'Erforderliches Update':'Stable Update · Benutzerdaten bleiben erhalten';copy.append(title,sub);const actions=document.createElement('div');actions.className='luma-update-actions';const later=document.createElement('button');later.textContent='Später';const install=document.createElement('button');install.className='install';install.textContent='Update installieren';actions.append(later,install);wrap.append(copy,actions);document.body.appendChild(wrap);later.addEventListener('click',()=>wrap.remove());install.addEventListener('click',()=>applyUiUpdate(install));}
async function applyUiUpdate(button){button.disabled=true;button.textContent='Aktualisiere…';try{if('serviceWorker' in navigator){const registration=await navigator.serviceWorker.getRegistration();if(registration)await registration.update();}if('caches' in window){const names=await caches.keys();await Promise.all(names.filter(name=>name.startsWith('luma-slate-')).map(name=>caches.delete(name)));}localStorage.setItem('lumaSlateLastUpdate',new Date().toISOString());window.location.reload();}catch(error){button.disabled=false;button.textContent='Erneut versuchen';}}
async function checkForUpdates(){try{const response=await fetch(`./update-manifest.json?t=${Date.now()}`,{cache:'no-store'});if(!response.ok)return;const manifest=await response.json();const shellCompatible=compareVersions(LUMA_SHELL_VERSION,manifest.minimumShellVersion)>=0;if(shellCompatible&&compareVersions(manifest.latestUiVersion,LUMA_UI_VERSION)>0)showUpdateBanner(manifest);}catch(error){}}
showVersionBadge();
if('serviceWorker' in navigator){window.addEventListener('load',async()=>{try{await navigator.serviceWorker.register('./sw.js');}catch(error){}checkForUpdates();});}else{window.addEventListener('load',checkForUpdates);}
