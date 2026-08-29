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

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
