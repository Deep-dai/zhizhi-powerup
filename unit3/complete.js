/* Listening, unit completion and local progress. All audio is shipped with the course. */
ART.products={file:'products.png',width:1774,height:887};
ART.story={file:'story.png',width:1536,height:1024};
const productRects=[[0,0,443,414],[449,20,430,389],[904,24,396,379],[1332,64,440,337],[0,455,443,422],[453,416,430,460],[890,458,438,422],[1334,467,437,411]];
const storyRects=[[0,0,503,503],[519,0,500,503],[1034,0,502,503],[0,519,503,505],[519,519,500,505],[1034,519,502,505]];
function productImage(index,label){return sprite('products',productRects[index],label);}
function storyImage(index){return sprite('story',storyRects[index],'奶牛故事第'+(index+1)+'幅');}
const STORAGE='powerup-unit3-progress-v1';
let saved={};try{saved=JSON.parse(localStorage.getItem(STORAGE)||'{}')||{};}catch{}
const progress={completed:new Set((Array.isArray(saved.completed)?saved.completed:[]).filter(x=>stages.some(s=>s.id===x)||['phonics','products','story','practice','review'].includes(x))),last:saved.last||'home',review:saved.review||null};
state.farm=Array.isArray(saved.farm)?saved.farm.filter(id=>animalById[id]).slice(0,12):[];
let storageOK=true;
function saveProgress(){try{localStorage.setItem(STORAGE,JSON.stringify({completed:[...progress.completed],last:progress.last,review:progress.review,farm:state.farm}));}catch{storageOK=false;}}
stages.splice(7,1);
stages.push(
  {id:'phonics',name:'声音小线索',desc:'听辨 c、k、ck 的声音',tag:'SOUNDS'},
  {id:'products',name:'农场带来什么',desc:'配对食物与材料，认识羊驼',tag:'DISCOVER'},
  {id:'story',name:'凯西的泥巴故事',desc:'听故事，观察心情与友善',tag:'STORY'},
  {id:'practice',name:'单词拼写屋',desc:'听一听，数一数，拼一拼',tag:'SPELL'},
  {id:'create',name:'我的小农场',desc:'邀请朋友，做有声介绍卡',tag:'MAKE'},
  {id:'review',name:'单元小挑战',desc:'综合练习，找到复习方向',tag:'REVIEW'}
);
Object.assign(state,{productIndex:0,productAlpaca:false,storyIndex:0,storyReveal:false,phonicsIndex:0,phonicsQuiz:false,phonicsTarget:0,spellIndex:0,spellHint:false,reviewIndex:0,reviewFirst:{},reviewSolved:{},reviewDone:false});
const normAudio=t=>String(t).replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g,' ').trim().replace(/[.!?。！？]+$/,'').toLowerCase();
const speechIndex=window.UNIT3_AUDIO||{};
const plain=t=>{const el=document.createElement('div');el.innerHTML=t;return el.textContent.trim();};
function speechParts(text,lang){
  if(speechIndex[lang+'|'+normAudio(text)])return [text];
  const parts=String(text).match(/[^.!?。！？]+[.!?。！？]*/g)||[];
  return parts.map(x=>x.trim()).filter(Boolean);
}
function hasSpeech(text,lang){const p=speechParts(text,lang);return p.length>0&&p.every(x=>speechIndex[lang+'|'+normAudio(x)]);}
function sayButton(text,lang='en',label='听一听'){
  return `<button class="say-button" data-say="${safe(text)}" data-lang="${lang}" aria-label="${safe(label+'：'+text)}"><span aria-hidden="true">◖))</span> ${label}</button>`;
}
const player=document.createElement('section');player.className='audio-dock';player.setAttribute('aria-label','点读播放器');
player.innerHTML='<div><strong>农场点读</strong><span id="audioStatus" role="status" aria-live="polite">点图卡或“听一听”开始</span></div><div class="audio-tools"><button id="autoVoice" aria-pressed="true">图卡点读：开</button><label><span class="sr-only">朗读速度</span><select id="audioRate"><option value="1">正常速度</option><option value="0.8">慢一点</option></select></label><button id="stopAudio">停止</button></div><audio id="unitAudio" preload="none"></audio>';
document.body.append(player);
const audio=document.getElementById('unitAudio'),audioStatus=document.getElementById('audioStatus');
let audioSequence=0,autoVoice=true;
function stopVoice(){audioSequence++;audio.pause();audio.removeAttribute('src');audio.load();audioStatus.textContent='已停止，可以重新点读';}
async function speak(text,lang='en'){
  const entries=(Array.isArray(text)?text:[text]).flatMap(t=>speechParts(t,lang));
  const files=entries.map(t=>speechIndex[lang+'|'+normAudio(t)]);
  const sequence=++audioSequence;audio.pause();
  if(!files.length||files.some(x=>!x)){audioStatus.textContent='这段录音暂不可用，请重试其他点读';return;}
  for(let i=0;i<files.length;i++){
    if(sequence!==audioSequence)return;
    audio.src='audio/'+files[i];audio.playbackRate=Number(document.getElementById('audioRate').value);audio.preservesPitch=true;
    audioStatus.textContent='正在朗读：'+entries[i];
    try{
      await new Promise((resolve,reject)=>{audio.onended=resolve;audio.onerror=()=>reject(new Error('load'));audio.onpause=()=>{if(sequence!==audioSequence)resolve();};const p=audio.play();if(p)p.catch(reject);});
    }catch{if(sequence===audioSequence)audioStatus.textContent='录音未能播放，请检查网络后再点一次';return;}
  }
  if(sequence===audioSequence)audioStatus.textContent='朗读完成，再听一次也可以';
}
document.getElementById('stopAudio').onclick=stopVoice;
document.getElementById('autoVoice').onclick=e=>{autoVoice=!autoVoice;e.currentTarget.textContent='图卡点读：'+(autoVoice?'开':'关');e.currentTarget.setAttribute('aria-pressed',String(autoVoice));if(!autoVoice)stopVoice();};
document.getElementById('audioRate').onchange=e=>{audio.playbackRate=Number(e.target.value);};
document.addEventListener('click',e=>{const b=e.target.closest('[data-say]');if(b){e.preventDefault();speak(b.dataset.say,b.dataset.lang||'en');}});
const baseGuide=guide;
guide=function(text){return baseGuide(text).replace('</p>',`</p>${sayButton(plain(text),'zh','听讲解')}`);};
end=function(next,name){const index=stages.findIndex(s=>s.id===state.route);const actual=stages[index+1]?.id||next;const label=stages[index+1]?.name||name;return `<div class="section-end"><button class="primary" data-complete="${state.route}" data-route="${actual}">我练好了 · ${label} →</button></div>`;};
document.addEventListener('click',e=>{const b=e.target.closest('[data-complete]');if(b){progress.completed.add(b.dataset.complete);saveProgress();}},true);
farmSentence=function(){if(!state.farm.length)return '';const numbers=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];return animals.map(a=>{const n=state.farm.filter(id=>id===a.id).length;return n?`Our farm has got ${numbers[n]} ${n===1?a.id:a.plural}.`:'';}).filter(Boolean).join(' ');};
const baseCreate=create;
renderers.create=function(){return baseCreate()+end('review','去单元小挑战');};
const baseGrammar=grammar;
renderers.grammar=function(){
  const html=baseGrammar();
  const happy=()=>sprite('feelings',[0,0,512,451],'开心的狗');
  const pair=`<section class="workspace grammar-pair"><h3>换成两位朋友，再说说它们的心情</h3><div class="comparison-grid"><div class="picture-panel">${happy()}<p class="reading-line" lang="en">It is happy.</p><p class="reading-line" lang="en">It is a happy dog.</p><p class="reading-line" lang="en">It isn't sad.</p></div><div class="picture-panel"><div class="number-display">${happy()}${happy()}</div><p class="reading-line" lang="en">They are happy.</p><p class="reading-line" lang="en">They are happy dogs.</p><p class="reading-line" lang="en">They aren't sad.</p></div></div><p class="soft-note">happy 不因数量改变。一个用 It is，多只用 They are；a happy dog 变成 happy dogs，去掉 a，dog 加 s。isn't = is not，aren't = are not：它不难过，它们也不难过。</p></section>`;
  return html.replace('<div class="section-end">',pair+'<div class="section-end">');
};
const baseYesno=yesno;
renderers.yesno=function(){const tail=state.cat===0?'long':'short';return baseYesno().replace('</section>',`<div class="spec-card"><strong>听听缩写，和完整句比较一下。</strong><p class="reading-line" lang="en">It's a cat.</p><p>这里 It's = It is，介绍它是什么。</p><p class="reading-line" lang="en">It's got a ${tail} tail.</p><p>这里 It's got = It has got，说它有什么。再看后面的词，就知道是哪一种。</p></div></section>`);};
function phonics(){
  const current=unit3Extra.phonics[state.phonicsIndex];
  return heading('SOUNDS / c · k · ck','声音小线索','同一个声音，可以穿不同的字母外衣。')+guide(unit3Extra.speech.phonics)+`<section class="workspace"><div class="phonics-grid">${unit3Extra.phonics.map((p,i)=>`<button class="phonics-card ${i===state.phonicsIndex?'selected':''}" data-action="phonicsWord" data-index="${i}">${animalImage(p.id)}<strong lang="en">${p.parts.map(x=>x===p.letters?'<mark>'+x+'</mark>':x).join('')}</strong><small>${p.cn}</small></button>`).join('')}</div><div class="sound-focus"><b>/${'k'}/</b><div><p>${current.cn}</p><p>看高亮的位置，再听整个词。c 在其他单词里也可能发不同的音。</p>${sayButton(current.id,'en','听这个词')}</div></div><div class="spec-card"><strong>ck 是两个字母，在 duck 里一起表示一个音。</strong>donkey 中的 k 在词的中间；不要把字母名称当成这个音来读。</div><div class="mini-task"><h3>听音找图</h3><p>先点“听题目”，再选择动物。图片上不显示单词。</p>${sayButton(unit3Extra.phonics[state.phonicsTarget].id,'en','听题目')}<div class="detective-grid">${unit3Extra.phonics.map(p=>animalCard(p.id,'phonicsAnswer',true)).join('')}</div></div>${feedback('先听一遍，再选择。')}</section>`+end('products','认识农场产品');
}
function products(){
  const p=unit3Extra.products[state.productIndex];
  return heading('DISCOVER / ANIMAL PRODUCTS','农场带来什么','把食物、材料和动物联系起来，再认识生活在秘鲁的羊驼。')+guide(unit3Extra.speech.products)+`<section class="workspace"><div class="modes"><button class="pill ${!state.productAlpaca?'active':''}" data-action="productTab" data-mode="match">动物与产品</button><button class="pill ${state.productAlpaca?'active':''}" data-action="productTab" data-mode="alpaca">认识羊驼</button></div>${state.productAlpaca?`<div class="split alpaca-panel"><div class="picture-panel">${productImage(5,'羊驼')}<b lang="en">alpaca</b>${sayButton('alpaca')}</div><div>${unit3Extra.alpaca.map(([en,cn])=>`<p class="reading-line" lang="en">${en}</p><p class="reading-cn">${cn}</p>`).join('')}<p class="soft-note">羊驼生活在包括秘鲁在内的南美洲安第斯山区。剪下、清理和加工后的羊驼毛可以制成衣物。</p></div></div><div class="process"><div>${productImage(5,'羊驼')}<span>剪取毛</span></div><span aria-hidden="true">→</span><div>${productImage(4,'清理加工后的毛线')}<span>清理、加工</span></div><span aria-hidden="true">→</span><div>${productImage(6,'毛衣')}<span>制作衣物</span></div></div><p class="soft-note">毛线和毛衣是加工结果，不是动物身上直接长出来的物品。</p>`:`<div class="product-tabs">${unit3Extra.products.map((x,i)=>`<button class="product-card ${i===state.productIndex?'selected':''}" data-action="product" data-index="${i}">${productImage(x.image,x.cn)}<strong lang="en">${x.word}</strong><small>${x.cn}</small></button>`).join('')}</div><div class="mini-task"><h3>${p.question}</h3>${sayButton(p.word,'en','听产品名称')}<div class="product-answers">${['cow','chicken','bee','sheep'].map(id=>`<button class="animal-card" data-action="productAnswer" data-id="${id}">${id==='bee'?productImage(0,'蜜蜂'):animalImage(id)}<strong lang="en">${id}</strong></button>`).join('')}</div>${feedback('选择对应的动物。正确后，听听完整句子。')}</div>`}</section>`+end('story','听凯西的故事');
}
function story(){
  const s=unit3Extra.story[state.storyIndex];
  return heading('STORY / A MUDDY DAY','凯西的泥巴故事','根据本单元故事主线编写的学习短篇，配图与英文均为教学改写。')+guide(unit3Extra.speech.story)+`<section class="workspace"><div class="story-layout"><div class="story-main">${storyImage(state.storyIndex)}</div><div><span class="tag">第 ${state.storyIndex+1} / 6 幅</span><p class="story-en" lang="en">${s.en}</p><p>${s.cn}</p><div class="button-row">${sayButton(s.en,'en','听这一幅')}${sayButton(s.cn,'zh','听中文')}</div><div class="mini-task"><h3>${s.question}</h3><div class="answer-buttons">${s.options.map(x=>`<button class="answer" data-action="storyAnswer" data-answer="${safe(x)}">${x}</button>`).join('')}</div>${feedback('先看看角色正在经历什么。')}</div></div></div><div class="story-strip">${unit3Extra.story.map((x,i)=>`<button class="${i===state.storyIndex?'selected':''}" data-action="storyPage" data-index="${i}" aria-label="第${i+1}幅">${storyImage(i)}<span>${i+1}</span></button>`).join('')}</div><div class="button-row"><button class="secondary" data-action="storyPrev" ${state.storyIndex===0?'disabled':''}>上一幅</button><button class="primary" data-action="storyNext" ${state.storyIndex===5?'disabled':''}>下一幅</button><button class="secondary" data-action="storyAll">听完整个故事</button></div><div class="spec-card"><strong>这是一个想象故事。</strong>泥巴只暂时弄脏了毛发。真实奶牛的毛色和花纹由遗传等因素决定，不是玩泥巴变出来的。故事中的主要观察点是心情变化和友好相处。</div></section>`+end('practice','去单词拼写屋');
}
const spellingWords=[...animals.map(a=>({word:a.id,cn:a.cn,id:a.id})),...unit3Extra.products.map(p=>({word:p.word,cn:p.cn,image:p.image}))];
function practice(){
  const w=spellingWords[state.spellIndex%spellingWords.length];
  return heading('SPELL / LISTEN AND WRITE','单词拼写屋','用图片和声音找回单词。空格不算字母。')+guide(unit3Extra.speech.practice)+`<section class="workspace"><div class="split"><div class="picture-panel">${w.id?animalImage(w.id):productImage(w.image,w.cn)}<p>${w.cn}</p></div><div><p class="step-caption">第 ${state.spellIndex+1} / ${spellingWords.length} 个</p>${sayButton(w.word,'en','听单词')}<p class="letter-slots" aria-label="这个词有${w.word.length}个字母">${Array.from(w.word).map(()=>'<span></span>').join('')}</p><label class="input-label" for="spelling">输入单词</label><input class="spell-input" id="spelling" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="20" inputmode="text" aria-describedby="spellCount"><p id="spellCount">已输入 0 个字母，共需要 ${w.word.length} 个。</p><div class="button-row"><button class="primary" data-action="spellCheck">检查拼写</button><button class="secondary" data-action="spellHint">给我一点提示</button></div>${state.spellHint?`<p class="hint">首字母是 <b lang="en">${w.word[0]}</b>，共 ${w.word.length} 个字母。</p>`:''}</div></div>${feedback('听一听，再在空格里输入。')}<div class="button-row"><button class="secondary" data-action="spellPrev" ${state.spellIndex===0?'disabled':''}>上一个</button><button class="secondary" data-action="spellNext">${state.spellIndex===13?'再练一轮':'下一个'}</button></div></section>`+end('create','完成我的小农场');
}
const reviewQuestions=[
  {skill:'动物词汇',prompt:'听单词，选择动物。',listen:'donkey',choices:['horse','donkey','goat'],correct:'donkey',pictures:true,why:'donkey 是驴。再观察长耳朵。'},
  {skill:'形容词',prompt:'看图，选词描述尾巴。',picture:()=>sprite('comparisons',compareGroups[1].rects[0],'长尾巴猫'),choices:['short','long','young'],correct:'long',why:'图中猫的尾巴很长，用 long。'},
  {skill:'is 与 has got',prompt:'It ___ small.',picture:()=>sprite('comparisons',compareGroups[0].rects[1],'体型小的牛'),choices:['is','has got','are'],correct:'is',why:'说它怎么样用 is。It is small.'},
  {skill:'形容词与名词',prompt:'It is a ___ cow.',picture:()=>sprite('comparisons',compareGroups[0].rects[1],'体型小的牛'),choices:['small','has got','are'],correct:'small',why:'a small cow 是“形容词＋动物名”。'},
  {skill:'单复数',prompt:'___ are sheep.',picture:()=>animalImage('sheep')+animalImage('sheep'),choices:['It','They','A'],correct:'They',why:'两只动物用 They are。sheep 的单数和复数相同。'},
  {skill:'否定句',prompt:'图中是鸭子。补全：It ___ a horse.',picture:()=>animalImage('duck'),choices:["isn't",'is','are'],correct:"isn't",why:"It isn't a horse. 它不是马。"},
  {skill:'has got',prompt:'It ___ four legs.',picture:()=>animalImage('goat'),choices:['is','has got','are'],correct:'has got',why:'说它有四条腿，用 has got。'},
  {skill:'疑问与短回答',prompt:'Has it got a long tail?',picture:()=>sprite('comparisons',compareGroups[1].rects[1],'短尾巴猫'),choices:['Yes, it has.',"No, it hasn't.",'Yes, it is.'],correct:"No, it hasn't.",why:"这只猫的尾巴短。No, it hasn't. It has got a short tail."},
  {skill:'自然拼读',prompt:'duck 结尾，哪两个字母一起表示 /k/ 这个音？',listen:'duck',choices:['ck','ch','ee'],correct:'ck',why:'duck 结尾的 ck 两个字母一起表示 /k/。'},
  {skill:'动物产品',prompt:'Honey comes from ___.',picture:()=>productImage(1,'蜂蜜'),choices:['cows','bees','sheep'],correct:'bees',why:'蜂蜜由蜜蜂酿造。Honey comes from bees.'},
  {skill:'故事与心情',prompt:'凯西被其他的牛嘲笑，这时她是什么心情？',picture:()=>storyImage(3),choices:['happy','sad','angry'],correct:'sad',why:'这幅图里的凯西很难过，用 sad。'},
  {skill:'羊驼与材料',prompt:'羊驼的毛经过加工，可以用来制作什么？',picture:()=>productImage(5,'羊驼'),choices:['毛衣','蜂蜜','鸡蛋'],correct:'毛衣',why:'羊驼毛可以经过清理、加工，制成衣物。'}
];
function review(){
  if(state.reviewDone){
    const right=reviewQuestions.filter((q,i)=>state.reviewFirst[i]===q.correct).length;
    const needs=[...new Set(reviewQuestions.filter((q,i)=>state.reviewFirst[i]!==q.correct).map(q=>q.skill))];
    return heading('REVIEW / MY DISCOVERIES','这一轮的发现','每一道错题都告诉我们，下一次可以重点练什么。')+`<section class="workspace review-result"><img src="assets/linabell.png" alt="玲娜贝儿"><h3>第一次选择答对 ${right} / ${reviewQuestions.length} 题</h3><p>${needs.length?'下次重点再练：'+needs.join('、')+'。':'本轮题目都答对了。也可以试着自己介绍农场。'}</p><p>这里只记录选择题结果，朗读和口语可以请家长一起听。</p><div class="button-row"><button class="primary" data-action="reviewRestart">再挑战一次</button><button class="secondary" data-route="home">回到农场地图</button><button class="secondary" data-route="create">介绍我的农场</button></div></section>`;
  }
  const q=reviewQuestions[state.reviewIndex];
  return heading('REVIEW / '+(state.reviewIndex+1)+' OF '+reviewQuestions.length,'单元小挑战','每道题先自己想一想，再选择。')+guide(unit3Extra.speech.review)+`<section class="workspace"><div class="review-progress"><span style="width:${state.reviewIndex/reviewQuestions.length*100}%"></span></div>${q.picture?`<div class="review-picture">${q.picture()}</div>`:''}<h3 class="review-prompt" ${/^[A-Za-z].*\?/.test(q.prompt)?'lang="en"':''}>${q.prompt}</h3>${q.listen?sayButton(q.listen,'en','听题目'):''}<div class="${q.pictures?'detective-grid':'answer-buttons'}">${q.choices.map(x=>q.pictures?animalCard(x,'reviewAnswer',true):`<button class="answer" data-action="reviewAnswer" data-id="${safe(x)}">${x}</button>`).join('')}</div>${feedback('选择后会出现解释。')}${state.reviewSolved[state.reviewIndex]?`<div class="button-row"><button class="primary" data-action="reviewNext">${state.reviewIndex===reviewQuestions.length-1?'看看本轮结果':'下一题'}</button></div>`:''}</section>`;
}
Object.assign(renderers,{phonics,products,story,practice,review});
const baseRender=render;
render=function(){
  baseRender();
  const number=stages.findIndex(s=>s.id===state.route)+1;
  const eyebrow=app.querySelector('.page-heading .eyebrow');if(eyebrow)eyebrow.textContent=String(number).padStart(2,'0')+' / '+stages[number-1]?.tag;
  nav.querySelectorAll('[data-route]').forEach(b=>{if(progress.completed.has(b.dataset.route)){b.classList.add('completed');b.setAttribute('aria-label',b.textContent+'，已练习');}});
  if(state.route==='home'){
    const banner=document.createElement('div');banner.className='progress-banner';banner.innerHTML=`<div><b>已练习 ${progress.completed.size} / ${stages.length} 个环节</b>${progress.review?`<p>上次小挑战：第一次选择答对 ${Number(progress.review.right)||0} / 12 题。</p>`:''}<p>${storageOK?'学习进度和农场保存在这台设备的当前浏览器。':'当前浏览器无法保存进度，本次仍可学习。'}</p></div><button class="secondary" data-route="${renderers[progress.last]&&progress.last!=='home'?progress.last:'animals'}">继续学习</button>`;app.querySelector('.hero').after(banner);
    app.querySelectorAll('.journey-card').forEach(b=>{if(progress.completed.has(b.dataset.route))b.insertAdjacentHTML('beforeend','<span class="done-label">✓ 已练习</span>');});
  }
  decorateSpeech();saveProgress();
};
function decorateSpeech(){
  app.querySelectorAll('.sentence[lang="en"],.reading-line[lang="en"],.clue [lang="en"],.nice-scene p[lang="en"],#feedback [lang="en"]').forEach(el=>{
    if(el.dataset.voiced)return;el.dataset.voiced='true';const text=el.textContent.trim();if(text&&!text.includes('___'))el.insertAdjacentHTML('afterend',sayButton(text));
  });
  if(state.route==='animals'&&state.wordQuiz){const t=['donkey','sheep','duck','goat','spider','cow','cat','horse','chicken','dog'][state.wordIndex%10];app.querySelector('.toolbar').insertAdjacentHTML('beforeend',sayButton(t,'en','听题目'));}
}
const observer=new MutationObserver(()=>{const feedbackEl=app.querySelector('#feedback');if(feedbackEl)feedbackEl.querySelectorAll('[lang="en"]:not([data-voiced])').forEach(el=>{el.dataset.voiced='true';el.insertAdjacentHTML('afterend',sayButton(el.textContent));});});
observer.observe(app,{childList:true,subtree:true});
const baseRoute=route;
route=function(id){stopVoice();if(id!=='home'&&renderers[id])progress.last=id;baseRoute(id);};
app.addEventListener('input',e=>{if(e.target.id==='spelling'){const w=spellingWords[state.spellIndex%14];const length=e.target.value.replace(/[^a-z]/gi,'').length;document.getElementById('spellCount').textContent=`已输入 ${length} 个字母，共需要 ${w.word.length} 个。`;}});
app.addEventListener('keydown',e=>{if(e.target.id==='spelling'&&e.key==='Enter'){e.preventDefault();checkSpelling();}});
function checkSpelling(){const w=spellingWords[state.spellIndex%14],value=document.getElementById('spelling').value.trim().toLowerCase();if(value===w.word){setFeedback(`拼对了！<span lang="en">${w.word}</span> 有 ${w.word.length} 个字母。`,'ok');if(autoVoice)speak(w.word);}else setFeedback(value?'还没拼对。再听一次，对照首字母和字母个数。':'先听单词，再输入你想到的拼写。','try');}
app.addEventListener('click',e=>{
  const b=e.target.closest('[data-action]');if(!b)return;const d=b.dataset;
  switch(d.action){
    case 'phonicsWord':state.phonicsIndex=Number(d.index);render();if(autoVoice)speak(unit3Extra.phonics[state.phonicsIndex].id);break;
    case 'phonicsAnswer':{const word=unit3Extra.phonics[state.phonicsTarget].id;if(d.id===word){setFeedback(`找对了！<span lang="en">${word}</span>`,'ok','<button data-action="phonicsNext">再听一个</button>');if(autoVoice)speak(word);}else setFeedback('再听一次，想一想这个词对应的动物。','try');break;}
    case 'phonicsNext':state.phonicsTarget=(state.phonicsTarget+1)%4;render();break;
    case 'productTab':state.productAlpaca=d.mode==='alpaca';render();break;
    case 'product':state.productIndex=Number(d.index);render();if(autoVoice)speak(unit3Extra.products[state.productIndex].word);break;
    case 'productAnswer':{const p=unit3Extra.products[state.productIndex];if(d.id===p.source){setFeedback(`<span lang="en">${p.sentence}</span>`,'ok');if(autoVoice)speak(p.sentence);}else setFeedback('再想想，这种食物或材料来自哪种动物。','try');break;}
    case 'storyPage':state.storyIndex=Number(d.index);render();break;
    case 'storyPrev':state.storyIndex=Math.max(0,state.storyIndex-1);render();break;
    case 'storyNext':state.storyIndex=Math.min(5,state.storyIndex+1);render();break;
    case 'storyAll':speak(unit3Extra.story.map(s=>s.en));break;
    case 'storyAnswer':{const s=unit3Extra.story[state.storyIndex];if(d.answer===s.answer){setFeedback('想对了。说说你在图上看到了什么。','ok');if(autoVoice&&/^[a-z]+$/.test(s.answer))speak(s.answer);}else setFeedback('再看看正在发生的事和角色的表情。','try');break;}
    case 'spellCheck':checkSpelling();break;
    case 'spellHint':{const input=document.getElementById('spelling').value;state.spellHint=true;render();document.getElementById('spelling').value=input;break;}
    case 'spellPrev':state.spellIndex=Math.max(0,state.spellIndex-1);state.spellHint=false;render();break;
    case 'spellNext':state.spellIndex=(state.spellIndex+1)%14;state.spellHint=false;render();break;
    case 'reviewAnswer':{
      const q=reviewQuestions[state.reviewIndex];if(!(state.reviewIndex in state.reviewFirst))state.reviewFirst[state.reviewIndex]=d.id;
      if(d.id===q.correct){state.reviewSolved[state.reviewIndex]=true;render();setFeedback(q.why,'ok');if(autoVoice&&hasSpeech(q.correct,'en'))speak(q.correct);}else setFeedback('这一题还需要再观察。'+q.why,'try');break;
    }
    case 'reviewNext':if(!state.reviewSolved[state.reviewIndex])break;if(state.reviewIndex<reviewQuestions.length-1){state.reviewIndex++;render();}else{state.reviewDone=true;progress.completed.add('review');progress.review={right:reviewQuestions.filter((q,i)=>state.reviewFirst[i]===q.correct).length,total:reviewQuestions.length,at:new Date().toISOString()};render();}break;
    case 'reviewRestart':state.reviewIndex=0;state.reviewFirst={};state.reviewSolved={};state.reviewDone=false;render();break;
    case 'word':if(autoVoice)speak(d.id);break;
    case 'compareChoice':if(autoVoice)speak(compareGroups[state.compareGroup].names[Number(d.index)]);break;
    case 'feeling':if(autoVoice)speak(feelingData[Number(d.index)][0]);break;
    case 'grammarMode':case 'count':case 'pluralAnimal':case 'cat':case 'tailQuestion':{const el=app.querySelector('.sentence');if(autoVoice&&el)speak(el.textContent);break;}
    case 'yesno':if(autoVoice&&app.querySelector('#feedback.ok [lang="en"]'))speak(app.querySelector('#feedback.ok [lang="en"]').textContent);break;
    case 'detective':if(autoVoice&&hasSpeech('It is a '+d.id+'.','en'))speak('It is a '+d.id+'.');break;
    case 'addAnimal':if(autoVoice)speak(d.id);saveProgress();break;
    case 'removeAnimal':case 'clearFarm':saveProgress();break;
  }
});
document.getElementById('parentPanel').innerHTML=`<strong>Unit 3 完整学习版 · 使用说明</strong><p>包含动物、形容词、句型、单复数、否定与问答、自然拼读、动物产品、羊驼、故事、拼写、农场作品和综合练习。英文使用英式合成配音，中文讲解也可点读。可调慢语速；点读按钮随时重听。</p><p>内容依照已核查的 Power Up 1 第一版单元范围与家长指南编写。图片和练习为原创教学设计；奶牛故事是简短改写。没有机构原版 PPT、原版歌曲和原版动画录音。本版用原创观察与听力任务覆盖相关学习目标。</p><p>进度与农场保存在当前浏览器；“已练习”由孩子点击确认。小挑战记录每题第一次选择，不进行语音识别或口语评分。</p><a href="课程说明.md">课程内容与来源</a><a href="../">在线 Unit 1</a><a href="../unit2.html">在线 Unit 2</a>`;
document.querySelector('.preview-label').textContent='有声学习版';
render();
