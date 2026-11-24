import {CORE,SHAPES,BY_ID,STAGES,GUIDES,OWNERS,VOICES,WISH_Q,STORY,STORY_Q,GIFTS,SLOTS} from './content.mjs?v=2';
const app=document.querySelector('#app'),audio=document.querySelector('#lessonAudio'),status=document.querySelector('#voiceStatus');
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).replace(/[‘’]/g,"'").replace(/\s+/g,' ').trim().replace(/[.!?。！？]+$/,'').toLowerCase();
const shuffle=a=>[...a].sort(()=>Math.random()-.5),valid=new Set(STAGES.map(s=>s.id)),storageKey='powerup-unit5-progress-v1';
let saved={},storageOK=true;try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}');if(saved?.version!==1)saved={};}catch{storageOK=false;}
const subset=(a,set)=>new Set((Array.isArray(a)?a:[]).filter(x=>set.has(x)));
const state={route:'home',completed:subset(saved.completed,valid),seen:subset(saved.seen,new Set(CORE.map(w=>w.id))),sounds:subset(saved.sounds,new Set(['house','helicopter','happy'])),group:1,toy:'ball',view:0,story:0,storySeen:new Set(),shape:'circle',slot:'hat',placed:subset(saved.placed,new Set(SLOTS.map(s=>s.id))),recipient:'Ben',wishes:{Ben:GIFTS.includes(saved.wishes?.Ben)?saved.wishes.Ben:shuffle(GIFTS)[0],Mia:GIFTS.includes(saved.wishes?.Mia)?saved.wishes.Mia:shuffle(GIFTS)[0]},gift:null,cards:Object.fromEntries(['Ben','Mia'].map(x=>[x,SHAPES.some(w=>w.id===saved.cards?.[x])?saved.cards[x]:'circle'])),delivered:subset(saved.delivered,new Set(['Ben','Mia']))};
function persist(){try{localStorage.setItem(storageKey,JSON.stringify({version:1,completed:[...state.completed],seen:[...state.seen],sounds:[...state.sounds],placed:[...state.placed],wishes:state.wishes,cards:state.cards,delivered:[...state.delivered]}));}catch{storageOK=false;}}
function complete(id){state.completed.add(id);persist();updateBar();}
let audioIndex={},seq=0,activeResolve=null;
const audioReady=fetch('audio-index.json?v=2').then(r=>{if(!r.ok)throw Error('audio-index');return r.json();}).then(x=>audioIndex=x).catch(()=>{status.textContent='录音暂未读取成功，请刷新后再试。';});
function stop(){seq++;audio.pause();audio.removeAttribute('src');audio.load();document.body.dataset.speaking='false';if(activeResolve){activeResolve(false);activeResolve=null;}status.textContent='已停止，可以重新点读。';}
async function playOne(text,lang,token){await audioReady;if(token!==seq)return false;const file=audioIndex[lang+'|'+norm(text)];if(!file){status.textContent='这段录音暂时无法读取，请稍后再试。';return false;}return new Promise(resolve=>{activeResolve=resolve;audio.src='audio/'+file;audio.playbackRate=Number(document.querySelector('#voiceRate').value);audio.preservesPitch=true;status.textContent='正在播放';document.body.dataset.speaking='true';const finish=ok=>{if(token!==seq)return;activeResolve=null;document.body.dataset.speaking='false';status.textContent=ok?'听完了，再试着自己说一遍。':'播放未完成，请检查网络后重试。';resolve(ok);};audio.onended=()=>finish(true);audio.onerror=()=>finish(false);audio.play().catch(()=>finish(false));});}
async function say(text,lang='en',done){stop();const token=seq;if(await playOne(text,lang,token))done?.();}
async function lines(texts,onLine){stop();const token=seq;for(let i=0;i<texts.length;i++){if(token!==seq)return;onLine?.(i);if(!await playOne(texts[i],'en',token))return;}}
const speak=(text,label='▶ 听一听',lang='en')=>`<button class="small secondary" data-say="${safe(text)}" data-lang="${lang}">${safe(label)}</button>`;
const pic=(id,cls='',alt='')=>`<img class="${cls}" src="assets/${safe(id)}.webp" alt="${safe(alt||BY_ID[id]?.zh||id)}" loading="lazy">`;
function shapeSVG(id,color='#e0b85e'){const body=({circle:'<circle cx="50" cy="50" r="40"/>',square:'<rect x="10" y="10" width="80" height="80"/>',triangle:'<polygon points="50,8 94,90 6,90"/>',rectangle:'<rect x="5" y="25" width="90" height="50"/>'})[id];return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${safe(BY_ID[id]?.zh||id)}" style="fill:${color}">${body||''}</svg>`;}
const art=w=>w.shape?shapeSVG(w.id):pic(w.id);
function wordCard(w,action='word',selected=false,cn=true){return `<button class="word-card ${selected?'selected':''} ${state.seen.has(w.id)?'heard':''}" data-action="${action}" data-id="${w.id}" aria-label="${action==='word'?'点读':'选择'}${w.zh}">${art(w)}${cn?`<strong lang="en">${safe(w.word)}</strong><small>${safe(w.zh)}${w.audioWord?' · 听词组 '+safe(w.audioWord):''}</small>`:''}</button>`;}
function updateBar(){document.querySelector('#progressText').textContent=`已完成 ${state.completed.size} / 8 关`;document.querySelector('#stageSelect').value=state.route;}
document.querySelector('#stageSelect').innerHTML='<option value="home">单元首页</option>'+STAGES.map(s=>`<option value="${s.id}">${s.number} ${s.title}</option>`).join('');
function heading(id){const s=STAGES.find(s=>s.id===id),g=STAGES.findIndex(s=>s.id===id)+1;return `<section class="heading"><div class="heading-top"><div><p class="eyebrow">LITTLE DUCK'S BIRTHDAY · ${s.number}</p><h1 tabindex="-1">${s.title}</h1><p>${s.subtitle}</p></div>${speak(GUIDES[g===8?4:g],'▶ 听中文说明','zh')}</div></section>`;}
function below(id){const i=STAGES.findIndex(s=>s.id===id);return `<div class="lesson-links"><a href="#home">← 返回学习地图</a>${i<7?`<a href="#${STAGES[i+1].id}">下一关：${STAGES[i+1].title} →</a>`:'<a href="../words.html?unit=5">去小抽屉复习 →</a>'}</div>`;}
function home(){return `<section class="hero"><div><p class="eyebrow">UNIT 05 · HAPPY BIRTHDAY!</p><h1>小黄鸭的<br><em>生日礼物派对</em></h1><p class="description">认识新玩具，听听朋友的小心愿。<br>和小黄鸭一起，把礼物送到对的人手里。</p><div class="button-row"><a class="primary" href="#${STAGES.find(s=>!state.completed.has(s.id))?.id||'party'}">一起开始吧 <span>↗</span></a>${speak(GUIDES[0],'▶ 听欢迎','zh')}</div></div><div class="hero-art">${pic('duck-master','','黄色毛绒小黄鸭挥手欢迎')}<span class="hero-badge">一份心愿，一份小小的惊喜</span></div></section><div class="section-heading"><h2>今天，从哪里开始？</h2><p>8 个小任务 · 都可以自由进入</p></div><section class="route-grid" aria-label="八个学习关卡">${STAGES.map(s=>`<a class="route-card ${state.completed.has(s.id)?'done':''}" href="#${s.id}"><span class="route-number">${s.number}</span><span class="route-arrow">↗</span><h3>${s.title}</h3><p>${s.subtitle}<br>${s.action}</p>${state.completed.has(s.id)?'<span class="done-mark">✓ 练习已完成</span>':''}</a>`).join('')}</section><div class="home-note">${pic('duck-gift','','小黄鸭捧着礼物')}<p>练习记录与听写掌握分开。家长可以到<a class="text-link" href="../words.html?unit=5">单词小抽屉</a>确认听写结果。${!storageOK?' 当前浏览器无法保存练习进度。':''}</p></div>`;}
const quizzes=new Map();
state.slot=shuffle(SLOTS.filter(item=>!state.placed.has(item.id)))[0]?.id||'hat';
const questions={listen:()=>shuffle(CORE).map(w=>({prompt:'听一听，找出对应的玩具。',answer:w.id,text:w.audioWord||w.word,pictureOptions:shuffle([w,...shuffle(CORE.filter(x=>x.id!==w.id)).slice(0,3)]).map(x=>x.id),why:`${w.word} 是${w.zh}。`})),owners:()=>shuffle(OWNERS).map(o=>({prompt:o.question,answer:o.owner,options:['Ben','Mia'],text:o.answer,saidAnswer:o.answer,toy:o.id,why:`${BY_ID[o.id].zh}的主人是 ${o.owner}。${o.answer}`})),voices:()=>shuffle(VOICES).map(v=>({prompt:`It's ___ ${BY_ID[v.toy].word}.`,answer:v.term,options:['my','your','his','her','our','their'],text:v.text,toy:v.toy,context:v,why:v.why})),wishes:()=>shuffle(WISH_Q),soundCheck:()=>shuffle(['house','mouse','helicopter']).map(w=>({prompt:'Does it start with the sound in happy?',text:w,answer:w==='mouse'?'No':'Yes',options:['Yes','No'],why:w==='mouse'?'mouse starts with m.':w+' starts with h.'})),story:()=>STORY_Q};
function quizState(id){if(!quizzes.has(id))quizzes.set(id,{i:0,answered:false,items:questions[id]()});return quizzes.get(id);}
function quizComplete(id){if(id==='soundCheck'&&state.sounds.size===3)complete('sounds');if(id==='listen'&&state.seen.size===18)complete('toys');if(['owners','voices','wishes'].includes(id))complete(id);if(id==='story'&&state.storySeen.size===4)complete('story');}
function context(v){return `<div class="ownership-context"><div class="context-label"><small>谁在说话 → 对谁说</small><strong>${v.speaker}</strong><span>→ ${v.listener}</span></div><div class="context-label"><small>这件物品属于谁</small><strong>${v.owner}</strong><span>${BY_ID[v.toy].zh}</span></div></div>`;}
function completedQuizHint(id){
  return id==='listen'&&state.seen.size<18
    ?'再点读完18张词卡，就完成玩具屋的全部练习。'
    :'再自己说一遍，看看能不能说得更顺。';
}
function quizSuccess(id,question,progress){
  return `✓ ${safe(question.why)}<div class="button-row"><button class="small primary" data-action="next" data-quiz="${id}">${progress.i+1===progress.items.length?'完成这一轮':'下一题'} →</button></div>`;
}
function quiz(id){const st=quizState(id);if(st.i>=st.items.length){quizComplete(id);return `<div class="complete-card">${pic('duck-gift','','小黄鸭祝贺你')}<h2 tabindex="-1">这一轮完成啦</h2><p class="hint">${completedQuizHint(id)}</p><button class="small" data-action="restart" data-quiz="${id}">再练一轮</button></div>`;}const q=st.items[st.i];return `<div class="quiz-meta"><span>${id==='listen'?'听音选图':'想一想，再选一选'}</span><span>第 ${st.i+1} / ${st.items.length} 题</span></div>${q.context?context(q.context):''}${['story','soundCheck'].includes(id)?speak(q.prompt,'▶ 听问题'):''}<div class="${q.toy?'question-row':''}">${q.toy?pic(q.toy,'question-art'):''}<div><h3 class="question" tabindex="-1">${safe(q.prompt)}</h3>${q.text&&!q.prompt.includes('___')?speak(q.text,id==='listen'?'▶ 听单词':id==='owners'?'▶ 听物品归属':'▶ 听问题'):''}${q.clue?speak(q.clue,'▶ 听心愿'):''}</div></div><div class="${q.pictureOptions?'word-grid':'choices'}">${(q.pictureOptions||q.options).map(x=>`<button ${st.answered?'disabled':''} class="${q.pictureOptions?'word-card':''} ${st.answered&&x===q.answer?'correct':''}" data-answer="${safe(x)}" data-quiz="${id}">${q.pictureOptions?art(BY_ID[x]):safe(x)}</button>`).join('')}</div><div class="feedback ${st.answered?'ok':''}" id="quizFeedback" role="status">${st.answered?quizSuccess(id,q,st):'可以重听，再慢慢选择。'}</div>`;}
function toyCards(){
  return CORE.filter(word=>word.group===state.group).map(word=>wordCard(word)).join('');
}
function toyDetail(word){
  return `<div><p class="english" lang="en">${safe(word.example)}</p><p class="hint">${safe(word.note||'先听，再自己说一遍。')}</p></div><div class="button-row">${speak(word.example,'▶ 听例句')}${word.alias?speak(word.alias,'另一种叫法'):''}</div>`;
}
function toys(){
  return heading('toys')+`<section class="workspace">
    ${pic('scene-toyroom','story-strip','小黄鸭的玩具屋')}
    <div class="tabs" role="group" aria-label="两组核心词">${[[1,'我的玩具 · 8词'],[2,'生日礼物架 · 10词']].map(([group,label])=>`<button aria-pressed="${state.group===group}" data-action="group" data-id="${group}">${label}</button>`).join('')}</div>
    <p class="hint">点图片听单词，再听完整例句。听完词卡 <span id="toyHeardCount">${state.seen.size}</span> / 18。</p>
    <div class="word-grid" id="toyWordGrid">${toyCards()}</div>
    <div class="toy-detail">${toyDetail(BY_ID[state.toy])}</div>
  </section><section class="workspace">
    <h2>小黄鸭听音找玩具</h2>
    <p class="hint">ball 和 balloon、plane 和 helicopter 看起来有什么不同？这一轮会覆盖全部18词。</p>
    <div id="toyListenQuiz">${quiz('listen')}</div>
  </section>`+below('toys');
}
function readToy(button){
  const word=BY_ID[button.dataset.id];
  if(state.toy!==word.id){
    state.toy=word.id;
    app.querySelector('.toy-detail').innerHTML=toyDetail(word);
  }
  say(word.audioWord||word.word,'en',()=>{
    state.seen.add(word.id);
    if(state.seen.size===18&&quizState('listen').i===18) complete('toys');
    else persist();
    button.classList.add('heard');
    app.querySelector('#toyHeardCount').textContent=state.seen.size;
    const hint=app.querySelector('#toyListenQuiz .complete-card .hint');
    if(hint&&state.seen.size===18) hint.textContent=completedQuizHint('listen');
  });
}
function switchToyGroup(group){
  if(state.group===group) return;
  stop();
  state.group=group;
  for(const tab of app.querySelectorAll('[data-action="group"]')){
    tab.setAttribute('aria-pressed',String(Number(tab.dataset.id)===group));
  }
  app.querySelector('#toyWordGrid').innerHTML=toyCards();
}
function registers(wish=false){return `<div class="${wish?'wish-register':'owner-register'}"><div class="person-record">${pic('ben','','男孩 Ben')}<div><strong>Ben · 男孩</strong><p>${wish?'想要 robot ✓<br>不想要 teddy ✕':'他的玩具：bike · robot · ball'}</p></div></div><div class="person-record">${pic('mia','','女孩 Mia')}<div><strong>Mia · 女孩</strong><p>${wish?'想要 doll ✓<br>不想要 plane ✕':'她的玩具：doll · kite · plane'}</p></div></div></div>`;}
function owners(){
  return heading('owners')+`<section class="workspace"><h2>Listen and return the toy</h2><p>听礼物的归属，再点选主人。</p>${quiz('owners')}</section>`+below('owners');
}
function voices(){const v=VOICES[state.view];return heading('voices')+`<section class="workspace"><details><summary>先看示范</summary><div class="tabs" aria-label="六种所属表达">${VOICES.map((x,i)=>`<button data-action="view" data-index="${i}" aria-pressed="${i===state.view}">${x.term}</button>`).join('')}</div><div class="question-row"><div class="speaker-avatars">${v.speaker==='Ben 和 Mia'?pic('ben','','Ben')+pic('mia','','Mia'):pic(v.speaker==='Mia'?'mia':v.speaker==='Ben'?'ben':'duck-pointing','',v.speaker)}</div><div>${context(v)}<p class="phrase" lang="en">${v.text}</p><p class="hint">${v.zh}</p>${speak(v.text,'▶ 听这句话')}</div></div><p class="note">${v.why}</p><p class="hint">共同的棋盘游戏：It's Ben and Mia's board game. 两位主人自己说用 our；小黄鸭介绍他们用 their。</p>${speak("It's Ben and Mia's board game.")}</details></section><section class="workspace"><h2>看清说话者，再选词</h2>${quiz('voices')}</section>`+below('voices');}
function wishes(){return heading('wishes')+`<section class="workspace">${pic('scene-shop','story-strip','小黄鸭的生日礼物店')}<details><summary>先听示范</summary><div class="button-row">${speak('I want a robot.','Ben · ▶')}${speak('I want a doll.','Mia · ▶')}${speak("I don't want a teddy.",'Ben · ✕ ▶')}${speak("I don't want a plane.",'Mia · ✕ ▶')}</div><div class="button-row">${speak('I want a robot.','Ben 自己说')}${speak('He wants a robot.','小黄鸭介绍 Ben')}${speak('She wants a doll.','小黄鸭介绍 Mia')}</div><p class="note">I want…；He / She wants…。遇到 does 或 doesn't，后面的动词都用 want。这里问的是想要什么礼物。</p></details>${quiz('wishes')}</section>`+below('wishes');}
function slotSVG(s,color){const body=s.shape==='circle'?`<circle cx="${s.w/2}" cy="${s.h/2}" r="${Math.min(s.w,s.h)/2}"/>`:s.shape==='triangle'?`<polygon points="${s.w/2},0 ${s.w},${s.h} 0,${s.h}"/>`:`<rect width="${s.w}" height="${s.h}"/>`;return `<svg viewBox="0 0 ${s.w} ${s.h}" role="img" aria-label="${BY_ID[s.shape].zh}" style="fill:${color}">${body}</svg>`;}
function robotCard(interactive=true){return `<div class="robot-card" aria-label="形状机器人贺卡">${SLOTS.map(s=>`<${interactive?'button':'div'} class="robot-slot ${state.placed.has(s.id)?'filled':'empty'} ${interactive&&state.slot===s.id?'target':''}" style="left:${s.x}px;top:${s.y}px;width:${s.w}px;height:${s.h}px" ${interactive?`data-action="slot" data-id="${s.id}" aria-label="给${s.label}选择形状"`:''}>${state.placed.has(s.id)?slotSVG(s,({hat:'#d98f70',body:'#a8bd91',head:'#f2d476','left-eye':'#476c59','right-eye':'#476c59',mouth:'#d98f70'})[s.id]):`<span class="slot-label">${interactive?s.label:''}</span>`}</${interactive?'button':'div'}>`).join('')}</div>`;}
function shapes(){
  const slot=SLOTS.find(s=>s.id===state.slot);
  return heading('shapes')+`<section class="workspace"><details><summary>认识四种形状</summary><div class="shape-grid">${SHAPES.map(w=>`<button data-say="${w.word}">${shapeSVG(w.id)}<strong>${w.word}</strong></button>`).join('')}</div></details>
  <div class="craft-layout"><div>${robotCard(false)}<p>已拼好 ${state.placed.size} / 6 处</p></div><div class="craft-tools"><h2>Listen and build</h2><p>听小黄鸭点名的零件，选对形状，一块块拼出机器人。</p>${speak(slot.shape,'▶ 听下一块零件')}<div class="shape-grid">${SHAPES.map(w=>`<button data-action="place" data-id="${w.id}" aria-label="${w.word}">${shapeSVG(w.id)}</button>`).join('')}</div><p id="craftFeedback" role="status">${state.placed.size===6?'机器人拼好了！':''}</p><button data-action="resetCraft">重新拼</button></div></div></section>`+below('shapes');
}
function sounds(){return heading('sounds')+`<section class="workspace"><div class="practice-intro"><div><h2>h，开头轻轻呼一口气</h2><p class="hint">听完整单词，再和家长一起跟读。注意开头的轻轻呼气声；字母名和单词里的声音不一样。</p><p class="note">这里使用已学词作补充观察，示例为原创；不代替原教材拼读录音，也不自动评判发音。</p></div>${pic('duck-thinking','','小黄鸭和你一起听声音')}</div><div class="word-grid">${['house','helicopter','happy'].map(id=>`<button class="word-card ${state.sounds.has(id)?'heard':''}" data-action="sound" data-id="${id}">${pic(id==='happy'?'duck-master':id,'',id)}<strong lang="en">${id.replace('h','<mark>h</mark>')}</strong><small>${id==='happy'?'开心的':BY_ID[id].zh}</small></button>`).join('')}</div><p class="hint">已经完整听过 <span id="soundHeardCount">${state.sounds.size}</span> / 3 个单词。</p><h3>Listen for h</h3>${quiz('soundCheck')}</section>`+below('sounds');}
function readSound(button){
  const word=button.dataset.id;
  say(word,'en',()=>{
    state.sounds.add(word);
    if(state.sounds.size===3&&quizState('soundCheck').i===3) complete('sounds');
    else persist();
    button.classList.add('heard');
    app.querySelector('#soundHeardCount').textContent=state.sounds.size;
  });
}
function story(){const s=STORY[state.story];state.storySeen.add(state.story);if(state.storySeen.size===4&&quizState('story').i===3)complete('story');return heading('story')+`<section class="workspace"><div class="quiz-meta"><span>原创教学故事 · 小黄鸭的派对</span><span>第 ${state.story+1} / 4 幅</span></div>${pic(s.art,'story-image',s.zh)}<div class="story-pages">${STORY.map((x,i)=>`<button class="small" data-action="storyPage" data-index="${i}" aria-current="${i===state.story?'step':'false'}" aria-label="第${i+1}幅：${x.title}">${i+1}</button>`).join('')}</div><div class="story-text"><h2>${s.title}</h2><p class="sentence" lang="en">${s.text}</p><details><summary>看中文</summary><p>${s.zh}</p></details><div class="button-row" style="justify-content:center">${speak(s.text,'▶ 听这一幅')}<button class="small" data-action="storyPlay">▶ 听完整故事</button></div>${state.story===3?`<div class="button-row" style="justify-content:center">${speak("I'm sorry, Ben.",'Mia 道歉')}${speak("I'm sorry, Mia.",'Ben 道歉')}${speak("That's OK.",'回应道歉')}</div>`:''}</div></section><section class="workspace"><div class="story-mascot">${pic('duck-sorry','','小黄鸭说对不起')}<div><h2>故事里的小发现</h2><p class="hint">核对主人，归还物品，再真诚道歉。</p></div></div>${quiz('story')}</section>`+below('story');}
function party(){
  const who=state.recipient,wish=BY_ID[state.wishes[who]],gift=BY_ID[state.gift];
  const decorate=state.delivered.size===2?`<details><summary>设计另一场派对</summary><p>为两位朋友换上你自己挑选的礼物，打印专属派对卡。</p>${['Ben','Mia'].map(name=>`<label>${name} <select data-creative="${name}"><option value="">选择礼物</option>${GIFTS.map(i=>`<option value="${i}">${BY_ID[i].word}</option>`).join('')}</select></label>`).join('')}</details>`:'';
  return heading('party')+`<section class="workspace"><div class="tabs">${['Ben','Mia'].map(x=>`<button data-action="recipient" data-id="${x}" aria-pressed="${who===x}">${x}${state.delivered.has(x)?' ✓':''}</button>`).join('')}</div>
  <div class="party-person">${pic(who.toLowerCase(),'',who)}<div><h2>What does ${who} want?</h2>${speak('I want a '+wish.word+'.','▶ 听朋友的心愿')}</div></div>
  <div class="word-grid party-gifts">${GIFTS.map(id=>wordCard(BY_ID[id],'gift',id===state.gift,false)).join('')}</div>
  <p>选一张喜欢的贺卡图案。</p><div class="shape-grid">${SHAPES.map(w=>`<button data-action="partyShape" data-id="${w.id}" aria-pressed="${state.cards[who]===w.id}">${shapeSVG(w.id)} ${w.word}</button>`).join('')}</div>
  <button data-action="deliver" class="primary" ${gift?'':'disabled'}>Give it to ${who} →</button><p class="feedback" role="status" id="partyFeedback">${state.delivered.size===2?'两位朋友都收到礼物啦。':''}</p>
  <div class="button-row"><button data-action="partyDialogue">▶ 听送礼对话</button><button data-action="print" ${state.delivered.size===2?'':'disabled'}>打印派对作品</button><button data-action="newParty">换一轮心愿</button></div>${decorate}</section><section class="workspace"><h2>派对邀请小侦探</h2><p class="hint">补充听力：先听介绍，记下一个名字和两个数字。原创练习，练习 Starters Listening Part 2 中的名字与数量信息。</p>${speak('His name is Ben. He is seven. He has got two robots.','▶ 听完整介绍')}<div class="assessment-fields"><label>男孩名字 <input id="listenName" autocomplete="off" maxlength="20"></label><label>年龄 <input id="listenAge" type="number" min="1" max="20"></label><label>机器人数量 <input id="listenCount" type="number" min="0" max="20"></label></div><button class="small" data-action="checkInvite">核对答案</button><p class="hint" id="inviteFeedback" role="status">名字可以写英文，年龄和数量用数字。</p><h3>再和家长聊一聊</h3><p class="hint">试着回答真实的自己。这里只提供提问点读，由家长听你说。</p><div class="button-row">${speak("What's your name?",'你叫什么名字？')}${speak('How old are you?','你几岁？')}${speak("What's your favourite toy?",'你最喜欢什么玩具？')}</div>${speak(GUIDES[8],'▶ 听掌握标记说明','zh')}</section><section class="print-work"><p>POWER UP 1 · UNIT 5</p><h1>我的生日礼物派对</h1><p>Happy birthday! This present is for you.</p><div class="print-presents">${['Ben','Mia'].map(x=>`<div><h2>For ${x}</h2>${pic(state.wishes[x])}<p>${x} wants a ${BY_ID[state.wishes[x]].word}.</p><p>It's ${x}'s ${BY_ID[state.wishes[x]].word}.</p>${shapeSVG(state.cards[x])}<p>I can see a ${state.cards[x]}.</p></div>`).join('')}</div><p class="print-only">练习完成不代表听写掌握。家长可以在单词小抽屉确认。</p></section>`+below('party');}
function selectGift(button){
  const gift=BY_ID[button.dataset.id];
  if(state.gift!==gift.id){
    app.querySelector('.party-gifts .selected')?.classList.remove('selected');
    button.classList.add('selected');
    state.gift=gift.id;
    app.querySelector('[data-action=deliver]').disabled=false;
  }
  say(gift.audioWord||gift.word);
}
function updateQuiz(id){
  if(id==='listen') app.querySelector('#toyListenQuiz').innerHTML=quiz(id);
  else render();
}
const renders={home,toys,owners,voices,wishes,shapes,sounds,story,party};
function render(){app.innerHTML=renders[state.route]();updateBar();}
function route(){let id=location.hash.slice(1)||'home';if(!renders[id])id='home';stop();state.route=id;render();window.scrollTo({top:0,behavior:'instant'});app.querySelector('h1')?.focus({preventScroll:true});}
window.addEventListener('hashchange',route);document.querySelector('#stageSelect').addEventListener('change',e=>location.hash=e.target.value);document.querySelector('#voiceStop').addEventListener('click',stop);document.querySelector('#voiceRate').addEventListener('change',e=>audio.playbackRate=Number(e.target.value));window.addEventListener('pagehide',stop);
app.addEventListener('change',e=>{if(e.target.dataset.creative&&GIFTS.includes(e.target.value)){
  const name=e.target.dataset.creative;
  const word=BY_ID[e.target.value];
  const card=app.querySelectorAll('.print-presents > div')[name==='Ben'?0:1];
  card.querySelector('img').src='assets/'+word.id+'.webp';
  card.querySelector('img').alt=word.word;
  card.querySelectorAll('p')[0].textContent=name+' wants a '+word.word+'.';
  card.querySelectorAll('p')[1].textContent="It's "+name+"'s "+word.word+'.';
  say(name+' wants a '+word.word+'.');
}if(e.target.id==='partyWish'&&GIFTS.includes(e.target.value)){stop();state.wishes[state.recipient]=e.target.value;state.delivered.delete(state.recipient);state.completed.delete('party');persist();render();}});
app.addEventListener('click',e=>{const s=e.target.closest('[data-say]');if(s){say(s.dataset.say,s.dataset.lang||'en');return;}const answer=e.target.closest('[data-answer]');if(answer){const id=answer.dataset.quiz,st=quizState(id),q=st.items[st.i];if(st.answered)return;if(answer.dataset.answer===q.answer){st.answered=true;
    if(id==='listen'){
      for(const choice of app.querySelectorAll('#toyListenQuiz [data-answer]')){
        choice.disabled=true;
        choice.classList.remove('wrong');
      }
      answer.classList.add('correct');
      const feedback=app.querySelector('#quizFeedback');
      feedback.className='feedback ok';
      feedback.innerHTML=quizSuccess(id,q,st);
    }else render();
    if(q.saidAnswer)say(q.saidAnswer);else if(q.answer.match(/[.!?]$/))say(q.answer);else if(q.text&&id!=='listen')say(q.text);}else{answer.classList.add('wrong');const f=document.querySelector('#quizFeedback');f.className='feedback try';f.textContent=id==='listen'?'再听一次，看看哪张图对应这个单词。':id==='owners'?'再听一遍，留意名字。':id==='voices'?'看看谁在说话，东西属于谁？':id==='wishes'?(q.clue?'再听一遍心愿，留意想要的是哪件礼物。':'看看谁在说话，留意主语和动词。'):'再回到故事里找找线索。';}return;}const b=e.target.closest('[data-action]');if(!b)return;const d=b.dataset;switch(d.action){
  case 'word': readToy(b); break;
  case 'group': switchToyGroup(Number(d.id)); break;
  case 'next':{stop();const st=quizState(d.quiz);if(!st.answered)return;st.i++;st.answered=false;if(st.i===st.items.length)quizComplete(d.quiz);updateQuiz(d.quiz);app.querySelector('.question,.complete-card h2')?.scrollIntoView({block:'center'});break;}
  case 'restart': stop(); quizzes.delete(d.quiz); updateQuiz(d.quiz); break;
  case 'view':state.view=Number(d.index);render();say(VOICES[state.view].text);break;case 'slot':state.slot=d.id;render();break;case 'place':{const slot=SLOTS.find(s=>s.id===state.slot);if(d.id===slot.shape){state.placed.add(slot.id);const next=shuffle(SLOTS.filter(s=>!state.placed.has(s.id)))[0];if(next)state.slot=next.id;if(state.placed.size===6)complete('shapes');persist();render();say(d.id);}else{const f=document.querySelector('#craftFeedback');f.className='feedback try';f.textContent='再听一次零件名。';say(slot.shape);}break;}case 'resetCraft':state.placed.clear();state.slot=shuffle(SLOTS)[0].id;persist();render();break;
  case 'sound': readSound(b); break;
  case 'storyPage':state.story=Number(d.index);render();say(STORY[state.story].text);break;case 'storyPlay':lines(STORY.map(s=>s.text),i=>{state.story=i;render();});break;case 'recipient':stop();state.recipient=d.id;state.gift=null;render();break;
  case 'newParty':state.wishes={Ben:shuffle(GIFTS)[0],Mia:shuffle(GIFTS)[0]};state.gift=null;state.delivered.clear();persist();render();break;case 'gift': selectGift(b); break;
  case 'partyShape':state.cards[state.recipient]=d.id;persist();render();say(`I can see a ${d.id}.`);break;case 'deliver':{const f=document.querySelector('#partyFeedback');if(state.gift!==state.wishes[state.recipient]){f.className='feedback try';f.textContent=`再听听 ${state.recipient} 的心愿，选一份他／她想要的礼物。`;break;}state.delivered.add(state.recipient);if(state.delivered.size===2)complete('party');persist();render();say('This present is for you.');break;}case 'partyDialogue':lines(['Happy birthday!','This present is for you.','Here you are.','Thank you.','I like my present.']);break;case 'checkInvite':{const name=document.querySelector('#listenName').value.trim().toLowerCase(),age=document.querySelector('#listenAge').value,count=document.querySelector('#listenCount').value;document.querySelector('#inviteFeedback').textContent=name==='ben'&&age==='7'&&count==='2'?'✓ 名字 Ben，7岁，2个机器人。信息都找对啦！':'再听一次，分别找出名字、年龄和机器人数量。';break;}case 'print':if(state.delivered.size===2)window.print();break;}});
route();
