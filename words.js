import {loadVocabularyVoice} from './vocabulary-voice.mjs?v=4';
import {unitArt} from './units.mjs?v=6';
import {cloudMastered,masteryControl,cloudStatus,saveMastery,watchCloud} from './word-cloud.mjs?v=2';
import {UNITS,VOCABULARY,CATEGORIES,SHEETS} from './words-data.mjs?v=9';
import {filterWords} from './word-mastery.mjs?v=1';

const root=document.getElementById('drawer'),validKeys=new Set(VOCABULARY.map(w=>w.key)),byKey=new Map(VOCABULARY.map(w=>[w.key,w]));
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let mastered=cloudMastered(VOCABULARY),storageOK=true,recordNotice='',pendingMark=null,lastCloudRender='';
function readView(){const p=new URLSearchParams(location.search),u=p.get('unit');return {unit:['all',...UNITS.map(unit=>String(unit.id))].includes(u)?u:'all',mastery:['mastered','unmastered'].includes(p.get('mastery'))?p.get('mastery'):'all',category:p.get('category')||'全部',query:p.get('q')||'',number:p.get('number')==='3'?3:1};}
let view=readView();
function writeView(push=false){const p=new URLSearchParams();p.set('unit',view.unit);if(view.mastery!=='all')p.set('mastery',view.mastery);if(view.category!=='全部')p.set('category',view.category);if(view.query)p.set('q',view.query);if(view.number===3)p.set('number','3');history[push?'pushState':'replaceState'](null,'',location.pathname+'?'+p);}
let spriteID=0;
const artObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>{
  for(const {target,isIntersecting} of entries){
    if(!isIntersecting||!target.isConnected)continue;
    artObserver.unobserve(target);
    target.innerHTML=illustration(byKey.get(target.closest('[data-word-key]').dataset.wordKey));
  }
},{rootMargin:'420px'}):null;
function atlasImage(art,label){const a=SHEETS[art.sheet],id='drawer-clip-'+(++spriteID),[x,y,width,height]=art.rect;return `<svg class="vocab-sprite" viewBox="${art.rect.join(' ')}" role="img" aria-label="${safe(label)}"><defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${width}" height="${height}"/></clipPath></defs><image href="${a.base||'unit3/assets/'}${a.file}" width="${a.width}" height="${a.height}" clip-path="url(#${id})"/></svg>`;}
function illustration(w){
  const a=w.art;
  if(a.kind==='image')return `<img src="${safe(a.file)}" alt="${safe(w.zh)}" loading="lazy">`;
  if(a.kind==='atlas')return `<div class="atlas-group">${Array.from({length:a.repeat||1},()=>atlasImage(a,w.zh)).join('')}</div>`;
  if(a.kind==='text')return `<div class="expression-tile" aria-hidden="true"><span>${w.category==='位置表达'?'POSITION':w.category==='校园合作'?'SCHOOL LIFE':'WORD'}</span><b>${safe(w.word)}</b></div>`;
  const n=w.countable?view.number:1,item=a.item,rows=item.sheet==='classroom'?4:2;
  return `<div class="school-objects count-${n}" role="img" aria-label="${n===1?'':n+' 个'}${safe(w.zh)}">${Array.from({length:n},()=>item.sheet==='chair'?'<span class="school-object chair-object"></span>':`<span class="school-object" style="background-image:url('assets/${item.sheet==='classroom'?'classroom-atlas':'stationery'}.png');background-size:400% ${rows*100}%;background-position:${item.sprite%4*100/3}% ${Math.floor(item.sprite/4)*100/(rows-1)}%"></span>`).join('')}</div>`;
}
function wordForm(w){return w.unit===1&&view.number===3&&w.countable?w.plural:w.word;}
function exampleForm(w){return w.unit===1&&view.number===3&&w.countable?w.exampleMany:w.example;}
function card(w){const pending=pendingMark?.key===w.key,done=pending?pendingMark.checked:Boolean(mastered[w.key]);return `<article class="vocab-card ${done?'is-mastered':''}" data-word-key="${safe(w.key)}"><div class="card-art">${artObserver?'':illustration(w)}</div><div class="card-copy"><div class="card-tags"><span class="unit-tag unit-${w.unit}">Unit ${w.unit}</span><span>${safe(w.category)}</span></div><h2 lang="en">${safe(wordForm(w))}${w.alias?`<small> / ${safe(w.alias)}</small>`:''}</h2><p class="word-meaning">${safe(w.zh)}</p><div class="voice-buttons">${w.wordAudio===false?'':`<button type="button" data-voice="word" data-key="${safe(w.key)}" aria-label="听词：${safe(wordForm(w))}">${w.audioWord?'▶ 听词组 '+safe(w.audioWord):'▶ 听词'}</button>`}${w.alias?`<button type="button" data-voice="alias" data-key="${safe(w.key)}">${safe(w.aliasLabel||'听另一种叫法')}</button>`:''}${w.unit===1&&w.art.kind==='unit1'?`<a class="practice-link" href="index.html?activity=word&amp;word=${encodeURIComponent(w.id)}">练这个词</a>`:''}</div></div>${w.example?`<div class="card-example"><p lang="en">${safe(exampleForm(w))}</p>${w.meaning?`<p class="example-meaning">${safe(w.meaning)}</p>`:''}<button type="button" data-voice="example" data-key="${safe(w.key)}">▶ 听例句</button></div>`:''}${w.note?`<p class="word-note">${safe(w.note)}</p>`:''}${masteryControl(w,done,pending)}</article>`;}
function contextWords(){return filterWords(VOCABULARY,{...view,mastery:'all'},mastered);}
function render(){
  const current=UNITS.find(u=>u.id===Number(view.unit)),unitWords=VOCABULARY.filter(w=>view.unit==='all'||w.unit===Number(view.unit));
  const categories=view.unit==='all'?[...new Set(VOCABULARY.map(w=>w.category))]:CATEGORIES[view.unit];
  if(!categories.includes(view.category)&&view.category!=='全部')view.category='全部';
  const base=contextWords(),list=filterWords(VOCABULARY,view,mastered),done=base.filter(w=>mastered[w.key]).length,unitDone=unitWords.filter(w=>mastered[w.key]).length;
  document.body.dataset.unit=view.unit;
  document.body.dataset.wordDrawerReady='true';
  artObserver?.disconnect();
  root.innerHTML=`<section class="drawer-intro"><div><p class="eyebrow">LISTEN · SAY · WRITE</p><h1>单词小抽屉</h1><p>先看图、听词，再用听写检查掌握情况。</p></div><div class="companion-pictures">${(current?[current]:UNITS).map(u=>unitArt(u)).join('')}</div></section>
  <section class="parent-marking" aria-label="家长听写标记"><div><h2>家长标记 · 听写掌握情况</h2><p>家长检查后确认掌握；听录音和做练习不会自动标记。每3个首次通过的词，可到贴纸册选择一位伙伴。</p><p class="storage-note">${cloudStatus()}${recordNotice?' '+safe(recordNotice):''}</p></div><div class="mastery-total"><strong>${unitDone}<small> / ${unitWords.length}</small></strong><span>${current?current.name:'全部单元'} 已掌握</span></div></section>
  ${view.unit==='7'?'<p class="unit-scope-note">本单元共19个核心词条：运动与爱好10项、球类拓展与动作9项；动作词卡片可同时点读动词原形与 -ing 进行时。</p>':''}
  ${view.unit==='5'?'<p class="unit-scope-note">18个核心词与4个形状补充词；box / toy box、teddy / teddy bear 分别共用一个词条。</p>':''}
  ${view.unit==='4'?'<p class="unit-scope-note">19个核心词与7个食谱补充词分开分类；burger / hamburger 共用一个词条。eggs 在 Unit 3 中复习。</p>':''}
  ${view.unit==='1'?'<p class="unit-scope-note">本单元共28项：教室、文具与人物20项，位置表达4项，校园合作4项。按官方词汇页和词框整理。</p>':''}
  <section class="filter-panel" aria-label="筛选词条"><div class="drawer-unit-filters" role="group" aria-label="学习单元筛选"><span>学习单元</span>${[{id:"all",name:"全部单元"},...UNITS].map(u=>`<button type="button" data-filter-unit="${u.id}" aria-pressed="${String(u.id)===view.unit}" class="${String(u.id)===view.unit?"selected":""}">${safe(u.name)}<small>${VOCABULARY.filter(w=>u.id==="all"||w.unit===u.id).length}</small></button>`).join("")}</div><div class="filter-top"><div class="status-filters" role="group" aria-label="掌握情况">${[['all','全部',base.length],['mastered','已掌握',done],['unmastered','未掌握',base.length-done]].map(([id,label,n])=>`<button type="button" data-mastery="${id}" aria-pressed="${view.mastery===id}" class="${view.mastery===id?'selected':''}">${label}<span>${n}</span></button>`).join('')}</div><label class="word-search"><span>找单词</span><input type="search" id="wordSearch" placeholder="英文或中文" value="${safe(view.query)}" autocomplete="off"></label></div><div class="category-filters" role="group" aria-label="词汇分类">${['全部',...categories].map(c=>`<button type="button" data-category="${safe(c)}" class="${view.category===c?'selected':''}" aria-pressed="${view.category===c}">${c==='全部'?'全部分类':safe(c)}</button>`).join('')}</div>${view.unit==='1'?`<div class="number-filter" role="group" aria-label="单数和复数">看图数量：<button type="button" data-number="1" aria-pressed="${view.number===1}">1 个</button><button type="button" data-number="3" aria-pressed="${view.number===3}">几个</button><span>同一词条的单复数共用掌握标记。</span></div>`:''}</section>
  <div class="results-heading"><p id="resultCount" role="status">${current?current.name:'全部单元'} · ${view.category==='全部'?'所有分类':safe(view.category)} · ${view.mastery==='all'?'全部词条':view.mastery==='mastered'?'已掌握':'未掌握'}<strong>显示 ${list.length} / ${base.length} 个词条</strong></p><div class="course-links">${view.unit==='1'?'<a href="index.html?activity=phrases">位置与校园表达练习 →</a>':''}${current?`<a href="${current.course}">回到 ${current.name} 课程 →</a>`:''}</div></div>
  <section class="vocabulary-grid" aria-label="单词卡片">${list.length?list.map(card).join(''):`<div class="empty-results"><h2>${view.mastery==='mastered'?'这里还没有已掌握的词条':view.mastery==='unmastered'?'这个范围内的词条都已标记掌握':'没有找到对应词条'}</h2><p>可以调整单元、分类或搜索词，再看一看。</p><button type="button" id="clearFilters">显示当前单元全部词条</button></div>`}</section><footer>以家长确认的听写结果为准，词条可反复复习。<span>Power Up 1 · ${current?current.name:'All units'}</span></footer>`;
  if(artObserver)root.querySelectorAll('.card-art').forEach(el=>artObserver.observe(el));
  emitNavState();
}
function emitNavState(){
  const stats=Object.fromEntries(UNITS.map(u=>{const list=VOCABULARY.filter(w=>w.unit===u.id);return [u.id,{done:list.filter(w=>mastered[w.key]).length,total:list.length}];}));
  stats.all={done:VOCABULARY.filter(w=>mastered[w.key]).length,total:VOCABULARY.length};
  window.dispatchEvent(new CustomEvent('powerup:unit-change',{detail:{unit:view.unit,stats}}));
}
window.addEventListener('powerup:request-unit-state',emitNavState);
window.addEventListener('powerup:select-unit',e=>{const unit=String(e.detail.unit);if(['all',...UNITS.map(u=>String(u.id))].includes(unit))changeView({unit,category:'全部',query:'',number:1},true);});
function changeView(change,push=false){view={...view,...change};stopAudio();writeView(push);render();}
async function updateMark(key,checked){
  if(!validKeys.has(key))return;
  recordNotice='';pendingMark={key,checked};
  try{await saveMastery(key,checked);recordNotice='已保存到家庭档案。';}
  catch(error){recordNotice=error.message;}
  pendingMark=null;mastered=cloudMastered(VOCABULARY);render();
  const same=[...root.querySelectorAll('[data-master-key]')].find(el=>el.dataset.masterKey===key);
  same?.focus({preventScroll:true});document.getElementById('markAnnouncement').textContent=recordNotice;
}
root.addEventListener('click',e=>{
  const filterUnit=e.target.closest('[data-filter-unit]');if(filterUnit){changeView({unit:filterUnit.dataset.filterUnit,category:'全部',query:'',number:1},true);root.querySelector('[data-filter-unit="'+view.unit+'"]')?.focus({preventScroll:true});return;}
  const unit=e.target.closest('.unit-entry[data-unit]');if(unit){e.preventDefault();changeView({unit:unit.dataset.unit,category:'全部',query:'',number:1},true);return;}
  const status=e.target.closest('[data-mastery]');if(status){changeView({mastery:status.dataset.mastery});root.querySelector(`[data-mastery="${view.mastery}"]`).focus({preventScroll:true});return;}
  const category=e.target.closest('[data-category]');if(category){changeView({category:category.dataset.category});return;}
  const number=e.target.closest('[data-number]');if(number){changeView({number:Number(number.dataset.number)});return;}
  const voice=e.target.closest('[data-voice]');if(voice){speakWord(byKey.get(voice.dataset.key),voice.dataset.voice);return;}
  if(e.target.closest('#clearFilters'))changeView({mastery:'all',category:'全部',query:''});
});
root.addEventListener('change',e=>{if(e.target.matches('[data-master-key]'))updateMark(e.target.dataset.masterKey,e.target.checked);});
function searchInput(e){if(e.target.id!=='wordSearch'||e.isComposing)return;const value=e.target.value,position=e.target.selectionStart;if(value===view.query)return;view.query=value;writeView();render();const input=document.getElementById('wordSearch');input.focus({preventScroll:true});if(position!==null)input.setSelectionRange(position,position);}
root.addEventListener('input',searchInput);
root.addEventListener('compositionend',searchInput);
window.addEventListener('popstate',()=>{stopAudio();view=readView();render();});


const audio=document.getElementById('wordAudio'),voiceStatus=document.getElementById('voiceStatus');let playSequence=0,activeObjectURL=null;
function releaseURL(){if(activeObjectURL){URL.revokeObjectURL(activeObjectURL);activeObjectURL=null;}}
function stopAudio(message=true){playSequence++;audio.pause();audio.removeAttribute('src');audio.load();releaseURL();if(message)voiceStatus.textContent='已停止，可以重新点读。';}
async function speakWord(w,kind){
  if(!w)return;stopAudio(false);const sequence=playSequence;voiceStatus.textContent='准备朗读…';const voice=await (voiceReady??=loadVocabularyVoice());if(sequence!==playSequence)return;
  const source=voice(w,kind,w.unit===1&&view.number===3&&w.countable);if(!source){voiceStatus.textContent='这段录音暂时无法读取，请稍后再试。';return;}
  if(source instanceof Blob)activeObjectURL=URL.createObjectURL(source);
  audio.src=activeObjectURL||source;audio.playbackRate=Number(document.getElementById('voiceRate').value);audio.preservesPitch=true;
  const text=kind==='example'?exampleForm(w):kind==='alias'?w.alias:(w.audioWord||wordForm(w));
  voiceStatus.textContent='正在朗读：'+text;
  audio.onended=()=>{releaseURL();if(sequence===playSequence)voiceStatus.textContent='听完了，可以再说一遍或试着听写。';};
  audio.onerror=()=>{releaseURL();if(sequence===playSequence)voiceStatus.textContent='录音未能播放，请检查网络后再点一次。';};
  try{await audio.play();}catch{if(sequence===playSequence)voiceStatus.textContent='播放未开始，请再点一次。';}
}
document.getElementById('voiceStop').addEventListener('click',()=>stopAudio());
document.getElementById('voiceRate').addEventListener('change',e=>{audio.playbackRate=Number(e.target.value);});
window.addEventListener('pagehide',()=>stopAudio(false));
watchCloud(state=>{const signature=JSON.stringify([state.user?.id,state.status,state.busy,state.snapshot?.version,state.snapshot?.wallet.version]);if(signature===lastCloudRender)return;lastCloudRender=signature;const focused=document.activeElement,position=focused?.id==='wordSearch'?focused.selectionStart:null;mastered=cloudMastered(VOCABULARY);render();if(position!==null){const input=document.getElementById('wordSearch');input.focus({preventScroll:true});input.setSelectionRange(position,position);}});
render();
let voiceReady;
