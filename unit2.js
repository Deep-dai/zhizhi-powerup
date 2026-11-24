import {PICTURES,FAMILY,BODY,BODY_ART,GRAMMAR_SCENES,LESSONS,PORTRAIT_CHOICES} from './unit2-content.mjs?v=5';

const root=document.getElementById('unit2');
const toastNode=document.getElementById('toast');
const SAVE_KEY='flower-unit2-progress-v1';
const DB_NAME='flower-unit2-audio-v1';
const WHY={
 speaker:'I 是正在说话的人；you 是我正对着说话的人；he 或 she 是我正在向别人介绍的人。同一张照片，换个说话位置，开头就要变。',
 'have-has':'got 后面是眼睛还是头发，都不决定 have 或 has。先看句子最前面的主角：I、you 用 have；he、she 用 has。',
 mirror:'女孩照镜子自己说 I；小红花面对她说 you；小红花转向枝枝介绍她，就说 she。图片没有变，视角变了。',
 lens:'has got 是「有」，hasn’t got 是「没有」。两张画像很像时，只找句子提到的头发或眼睛，不靠猜。',
 questions:'把说明的话变成问题，have 或 has 跑到最前面：You have got… → Have you got…?；She has got… → Has she got…?',
 answers:'问题里问 you，女孩自己回答就换成 I；问 she 或 he，替照片里的人回答仍用 she 或 he。简短回答说 Yes, she has.，不用再说 got。',
 repair:'先找句子的主角，再检查 have、has；如果是问句，还要检查它们有没有走到句首。',
 album:'这本相册是 Lily 的，所以 my 是 Lily 的「我的」。看照片先答是谁，再描述他或她有怎样的头发和眼睛。'
};
const S={view:new URLSearchParams(location.search).get('view')==='words'?'words':'home',kind:'',index:0,sceneIndex:0,answered:false,errors:0,choice:-1,feedback:'',tasks:[],lesson:null,bodyGroup:'',albumChoice:0,albumStep:0};
let progress={completed:[],mistakes:[],plays:0};
let manifest=[],clipByText=new Map(),published={},imported=new Map(),db=null,playing=null,toastTimer=null;
try{const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');if(Array.isArray(saved.completed))progress.completed=saved.completed;if(Array.isArray(saved.mistakes))progress.mistakes=saved.mistakes;if(Number.isFinite(saved.plays))progress.plays=saved.plays;}catch{}
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const img=(src,alt)=>'<img src="'+esc(src)+'" alt="'+esc(alt)+'" loading="lazy">';
const button=(label,action,cls='',extra='')=>'<button type="button" class="'+cls+'" data-action="'+action+'" '+extra+'>'+esc(label)+'</button>';
const shuffle=a=>a.slice().sort(()=>Math.random()-.5);
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(progress));}catch{}}
function sayButton(text,label='▶ 听一听'){
 const clip=clipByText.get(text),ready=clip&&(imported.has(clip.id)||published[clip.id]);
 return '<button type="button" class="audio-button '+(ready?'ready':'')+'" data-action="say" data-text="'+esc(text)+'" aria-label="'+esc(label+'：'+text)+'">'+esc(ready?label:'◌ 待录音')+'</button>';
}
function notice(message){toastNode.textContent=message;toastNode.style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastNode.style.display='none',4000);}
function stopAudio(){
 if(!playing)return;
 const old=playing;playing=null;
 old.onended=null;old.onerror=null;
 old.pause();
 if(old._clipUrl){URL.revokeObjectURL(old._clipUrl);old._clipUrl=null;}
 old.removeAttribute('src');old.load();
}
function playText(text){
 const clip=clipByText.get(text);if(!clip){notice('这句还没有录音，可以先看文字读一遍。');return;}
 const blob=imported.get(clip.id),source=blob?URL.createObjectURL(blob):published[clip.id];
 if(!source){notice('这句还没有录音，可以先看文字读一遍。');return;}
 stopAudio();const audio=new Audio(source);audio._clipUrl=blob?source:null;playing=audio;
 const release=()=>{if(audio._clipUrl){URL.revokeObjectURL(audio._clipUrl);audio._clipUrl=null;}};
 audio.onended=()=>{release();if(playing===audio)playing=null;};
 audio.onerror=()=>{release();if(playing!==audio)return;playing=null;notice('这条录音播放失败，请在家长角检查。');};
 audio.play().catch(()=>{if(playing!==audio)return;release();playing=null;notice('请再点一次播放。');});
}
function playIfReady(text){const clip=clipByText.get(text);if(clip&&(imported.has(clip.id)||published[clip.id]))playText(text);}
function markDone(id){if(!progress.completed.includes(id)){progress.completed.push(id);save();}}
function mistake(id){progress.mistakes.push({id,date:new Date().toISOString()});progress.mistakes=progress.mistakes.slice(-80);save();}
function stepbar(total,index){return '<div class="stepbar" aria-label="第 '+(index+1)+' 题，共 '+total+' 题">'+Array.from({length:total},(_,i)=>'<span class="'+(i<index?'past':i===index?'current':'')+'"></span>').join('')+'</div>';}
function top(label,total=0,index=0){return '<div class="topline">'+button('← 返回相册','home','quiet')+(total?stepbar(total,index):'<span class="small">POWER UP 1 · UNIT 2</span>')+'</div><p class="eyebrow">'+esc(label)+'</p>';}
function go(view){stopAudio();S.view=view;S.feedback='';S.answered=false;S.errors=0;S.choice=-1;render();window.scrollTo({top:0,behavior:'instant'});}
function home(){
 const done=progress.completed.length;
 root.innerHTML='<section class="hero"><div><p class="eyebrow">POWER UP 1 · UNIT 2</p><h1>小红花的相册冒险</h1><p>认识家人和身体，用 I’ve got、You have got、She has got 说一说。</p>'+button('从家人相册开始 →','family-learn','primary')+'<p class="small">每关约 3–5 分钟；可以跳关，不计时。</p></div>'+img(PICTURES.flower,'红色毛绒小红花')+'</section>'+
 '<div class="section-title"><div><h2>先看图，认识人和身体</h2><p>词语总在句子里使用，听完还要说一说。</p></div><span class="small">已完成 '+done+' 站</span></div>'+
 '<section class="station-grid">'+
 '<button class="station" data-action="family-learn"><strong>👨‍👩‍👧 家人相册</strong><p>mum、dad、sister、brother、grandma、grandpa</p><span class="stamp">'+(progress.completed.includes('family')?'✓ 已完成':'认识与认图')+'</span>'+img(PICTURES.lily,'Lily')+'</button>'+
 '<button class="station" data-action="body-learn"><strong>👀 身体寻宝</strong><p>点眼睛、鼻子、手、脚，找到灰兔的尾巴。</p><span class="stamp">'+(progress.completed.includes('body-face')&&progress.completed.includes('body-body')?'✓ 已完成':'13 个词')+'</span>'+img(PICTURES.bunny,'灰兔')+'</button>'+
 '<button class="station" data-action="album"><strong>🖼️ 我的角色卡</strong><p>选一个角色，介绍头发和眼睛，再回答问题。</p><span class="stamp">'+(progress.completed.includes('avatar')?'✓ 已完成':'把句子用起来')+'</span>'+img(PICTURES.sister,'绿眼女孩')+'</button></section>'+
 '<div class="section-title"><div><h2>小红花的语法任务</h2><p>先听懂为什么这样说，再动手选、开口讲。</p></div></div>'+
 '<section class="lesson-grid">'+LESSONS.map(l=>'<button class="lesson-card" data-action="lesson" data-id="'+esc(l.id)+'"><span class="stamp">'+esc(l.tag)+'</span><b>'+esc(l.name)+'</b><small>'+esc(l.skill)+'</small><span class="done">'+(progress.completed.includes(l.id)?'✓ 已完成':'开始 →')+'</span></button>').join('')+'</section>'+
 '<div class="book-band"><div><h2>给家长</h2><p>查看哪些句式需要再练，制作或导入逐句录音。</p></div>'+button('打开家长角','parent','secondary')+'</div>';
}
function familyLearn(){
 root.innerHTML='<section class="panel">'+top('FAMILY · 家人相册')+'<h1>Lily 的家人</h1><div class="learn-intro">'+img(PICTURES.lily,'红发蓝眼的 Lily')+'<p>Lily 说 <b>my family</b>，就是「我的家人」。'+sayButton('family','▶ 听 family')+' 看照片认人，再听一句完整介绍。</p></div>'+
 '<div class="card-grid">'+FAMILY.map(f=>'<article class="family-card">'+img(f.image,f.zh)+'<h2>'+esc(f.word)+'</h2><span class="alias">'+esc(f.formal)+'</span><p>'+esc(f.zh)+'</p><p><b>This is my '+esc(f.word)+'.</b></p>'+sayButton(f.word,'▶ 听单词')+' '+(f.formal!==f.word?sayButton(f.formal,'▶ 听另一种叫法')+' ':'')+sayButton('This is my '+f.word+'.','▶ 听句子')+'</article>').join('')+'</div>'+
 '<div class="actions">'+button('小红花来提问 →','family-start','primary')+'</div></section>';
}
function familyStart(){
 S.kind='family';S.index=0;S.answered=false;S.errors=0;
 S.tasks=shuffle(FAMILY).map(f=>({id:'family-'+f.id,image:f.image,cue:'看 Lily 的相册。Who is '+f.pronoun+'?',say:'Who is '+f.pronoun+'?',answer:(f.pronoun==='she'?'She':'He')+' is my '+f.formal+'.',correctText:(f.pronoun==='she'?'She':'He')+' is my '+f.formal+'.',options:shuffle(FAMILY.filter(x=>x.pronoun===f.pronoun).map(x=>(f.pronoun==='she'?'She':'He')+' is my '+x.formal+'.')),explain:'照片属于 Lily；my 指 Lily。先看是 he 还是 she，再说是哪位家人。'}));
 go('family-quiz');
}
const ROLE_SCENES={
 speaker:[['self','girl'],['direct','girl'],['about','girl']],
 'have-has':[['direct','girl'],['about','girl']],
 mirror:[['self','girl'],['direct','girl'],['about','girl']],
 questions:[['direct','girl'],['about','girl']],
 answers:[['reply-self','girl'],['reply-about','girl']]
};
const SCENE_HINTS={
 speaker:['镜子里的女孩说自己，开头是 I。','小红花面对女孩说话，开头是 you。','女孩在相框里，向灰兔介绍她就说 she。'],
 'have-has':['面对女孩说 you，后面跟 have。','向灰兔介绍相框里的 she，后面跟 has。'],
 mirror:['自己说，用 I；I 后面跟 have。','面对她说，用 you；you 后面跟 have。','谈论她，用 she；she 后面跟 has。'],
 questions:['直接问女孩，Have you 放在句首。','问相框里的女孩，Has she 放在句首。'],
 answers:['女孩自己回答，问句里的 you 变成 I。','和灰兔替女孩回答，仍然用 she。']
};
function taskScene(task){
 const id=task.id;
 if(/^(sp|hh|mi|qu|an)/.test(id)){
  const subject=/^(sp4|mi4|mi5|hh4|qu3|qu4|an5|an6)$/.test(id)?'boy':/^(sp5|hh1|an7)$/.test(id)?'flower':'girl';
  if(id==='qu5')return null;
  const mode=/^(sp1|sp5|hh1|hh5|mi1|mi4|an7)$/.test(id)?'self':/^(sp2|hh2|mi2|qu1|qu4)$/.test(id)?'direct':/^(an1|an2)$/.test(id)?'reply-self':/^(an3|an4|an5|an6)$/.test(id)?'reply-about':'about';
  return [mode,subject];
 }
 return null;
}
function storyImage(mode,subject){const shot=mode==='reply-self'?'direct':mode==='reply-about'?'about':mode;return GRAMMAR_SCENES[subject]?.[shot]||PICTURES[subject==='girl'?'sister':subject==='boy'?'brother':'flower'];}
function storyLine(sentence){return esc(sentence).replace(/^(I’ve|I have|I haven’t|You’ve|You have|She has|She hasn’t|He has|He hasn’t|Have you|Has she|Has he|Yes, I|No, I|Yes, she|No, she|Yes, he|No, he)/,'<mark>$1</mark>');}
function storybookScene(mode,subject,{sentence='',compact=false}={}){
 const who=subject==='boy'?'男孩':subject==='flower'?'小红花':'女孩';
 const captions={self:`${who}照镜子，说自己的事。`,direct:`小红花看着${who}，直接和${who}说话。`,about:`${who}在相框里。小红花和灰兔正在聊${who}。`,'reply-self':`${who}听到了问题，自己开口回答。`,'reply-about':`和灰兔一起看相框，回答小红花的问题。`};
 const title=mode==='self'?'照镜子':mode==='direct'?'面对面':mode==='about'?'看相框':mode==='reply-self'?'自己回答':'替她／他回答';
 return '<div class="storybook-scene '+(compact?'compact ':'')+esc(mode)+'" aria-label="'+esc(title+'：'+captions[mode])+'"><div class="storybook-art">'+img(storyImage(mode,subject),title+'的故事画面')+(sentence?'<div class="storybook-bubble">'+storyLine(sentence)+'</div>':'')+'</div><p class="storybook-caption">'+esc(captions[mode])+'</p></div>';
}
function sceneLesson(){
 const l=S.lesson,scenes=ROLE_SCENES[l.id];if(!scenes)return '';
 const i=Math.min(S.sceneIndex,scenes.length-1),e=l.examples[i],scene=scenes[i];
 return '<div class="scene-lesson"><p>点一幅画，看画面里的角色怎样说。</p><div class="scene-tabs">'+l.examples.map((x,n)=>'<button type="button" class="scene-tile '+(n===i?'selected':'')+'" data-action="scene" data-index="'+n+'" aria-pressed="'+(n===i)+'">'+img(storyImage(scenes[n][0],scenes[n][1]),'')+'<span>'+esc(x.who)+'</span></button>').join('')+'</div>'+storybookScene(scene[0],scene[1],{sentence:e.text})+'<p class="scene-hint">✦ '+esc(SCENE_HINTS[l.id][i])+'</p><div class="actions">'+sayButton(e.text,'▶ 听这一句')+'</div></div>';
}
function quizTask(){
 const task=S.tasks[S.index],isFamily=S.kind==='family',heading=isFamily?'家人相册 · 认图回答':S.lesson.name;
 let choices='';
 if(task.type==='images'){
   choices='<div class="choice-grid images">'+task.images.map((source,i)=>'<button type="button" class="choice images '+choiceClass(i,task.correct)+'" data-action="answer" data-index="'+i+'" '+(S.answered?'disabled':'')+'>'+img(source,'候选图片 '+(i+1))+'<span>图片 '+(i+1)+'</span></button>').join('')+'</div>';
 }else{
   const correct=isFamily?task.options.indexOf(task.correctText):task.correct;
   choices='<div class="choice-grid">'+task.options.map((option,i)=>'<button type="button" class="choice '+choiceClass(i,correct)+'" data-action="answer" data-index="'+i+'" '+(S.answered?'disabled':'')+'>'+esc(option)+'</button>').join('')+'</div>';
 }
 root.innerHTML='<section class="panel">'+top((isFamily?'FAMILY':S.lesson.tag+' · '+S.lesson.skill),S.tasks.length,S.index)+
 '<div class="task-head">'+img(PICTURES.flower,'小红花')+'<div><h1>'+esc(heading)+'</h1><p>先自己说，再点选；小红花会告诉你为什么。</p></div></div>'+
 (taskScene(task)?storybookScene(...taskScene(task),{sentence:S.answered?task.answer:'',compact:true}):'<div class="task-figure">'+img(task.image||PICTURES.flower,'题目图片')+'</div>')+'<p class="task-english">'+esc(task.cue)+'</p>'+
 (task.say?sayButton(task.say,'▶ 听问题'):'')+choices+
 (S.feedback?'<div class="feedback '+(S.answered?'good':'')+'">'+esc(S.feedback)+(S.answered?'<div>'+sayButton(task.answer,'▶ 听完整句')+'</div>':'')+'</div>':'')+
 (S.answered?'<div class="actions">'+button(S.index===S.tasks.length-1?'完成这一站 →':'下一题 →','next','primary')+'</div>':'')+'</section>';
}
function choiceClass(index,correct){return S.answered&&index===correct?'correct':S.choice===index&&!S.answered?'wrong':'';}
function answer(index){
 if(S.answered)return;const task=S.tasks[S.index],correct=S.kind==='family'?task.options.indexOf(task.correctText):task.correct;
 if(index===correct){S.answered=true;S.choice=index;S.feedback='答对了！'+(task.explain||'')+' 请把完整句子说一遍：'+task.answer;playIfReady(task.answer);}
 else{S.errors++;S.choice=index;mistake(task.id);S.feedback=S.errors===1?(taskScene(task)?'再看一眼画面，找找是谁在开口说话。':S.kind==='family'?'再看一眼照片，找到对应的家人。':'再看一眼题目和图片。'):'先跟小红花读正确句子，再继续：'+task.answer+' '+(task.explain||'');if(S.errors>=2){S.answered=true;S.choice=correct;playIfReady(task.answer);}}
 render();
}
function next(){S.index++;S.answered=false;S.errors=0;S.choice=-1;S.feedback='';if(S.index>=S.tasks.length){markDone(S.kind==='family'?'family':S.lesson.id);go('complete');}else render();}
function lessonIntro(){
 const l=S.lesson;
 root.innerHTML='<section class="panel">'+top('语法任务 '+l.tag)+'<h1>'+esc(l.name)+'</h1><p class="small">'+esc(l.skill)+'</p>'+(ROLE_SCENES[l.id]?'':'<div class="learn-intro">'+img(PICTURES.flower,'小红花')+'<p>'+esc(l.intro)+'</p></div>')+
 (ROLE_SCENES[l.id]?sceneLesson():'<div class="lesson-examples">'+l.examples.map(x=>'<article class="example-card">'+img(x.image,x.who)+'<small>'+esc(x.who)+'</small><b>'+esc(x.text)+'</b>'+sayButton(x.text,'▶ 听句子')+'</article>').join('')+'</div>')+
 (ROLE_SCENES[l.id]?'<details class="teacher-note"><summary>想知道为什么？</summary><p>'+esc(WHY[l.id])+'</p></details>':'<p class="lesson-explain"><b>小红花说：</b>'+esc(WHY[l.id])+'</p>')+
 '<div class="actions">'+button('我懂了，开始练习 →','lesson-start','primary')+'</div></section>';
}
function lessonStart(){S.kind='lesson';S.tasks=S.lesson.tasks;S.index=0;S.answered=false;S.errors=0;go('lesson-quiz');}
function bodyLearn(){
 root.innerHTML='<section class="panel">'+top('BODY · 身体寻宝')+'<h1>小红花的身体寻宝</h1><div class="learn-intro">'+img(PICTURES.flower,'小红花')+'<p>小红花有眼睛、嘴巴和手臂，却没有鼻子。身体词要对着图找，也可以摸摸自己身上相同的位置。</p></div>'+
 '<div class="mini-grid"><article>'+img(PICTURES.sister,'女孩头部')+'<h2>脸和头</h2><div class="body-list">'+BODY.filter(b=>b.group==='face').map(b=>'<button data-action="body-word" data-text="'+esc(b.word)+'">'+esc(b.word)+' · '+esc(b.zh)+'</button>').join('')+'</div></article>'+
 '<article>'+img(PICTURES.body,'女孩全身身体图')+'<h2>身体和四肢</h2><div class="body-list">'+BODY.filter(b=>b.group==='body').map(b=>'<button data-action="body-word" data-text="'+esc(b.word)+'">'+esc(b.word)+' · '+esc(b.zh)+'</button>').join('')+'</div></article></div>'+
 '<p class="body-note">灰兔的尾巴叫 <b>tail</b>。<button data-action="body-word" data-text="tail" class="audio-button">▶ 听 tail</button> 一只脚 <b>foot</b>，两只脚 <b>feet</b>。'+sayButton('feet','▶ 听 feet')+'</p>'+
 '<div class="actions">'+button('找脸上的部位 →','body-face','primary')+button('找身体和尾巴 →','body-body','secondary')+'</div></section>';
}
const APPEARANCE=[
 {word:'green eyes',zh:'绿色的眼睛',image:PICTURES.sister,say:'She has got green eyes.'},
 {word:'blue eyes',zh:'蓝色的眼睛',image:PICTURES.sisterBlue,say:'She has got blue eyes.'},
 {word:'brown hair',zh:'棕色的头发',image:PICTURES.sister,say:'She has got brown hair.'},
 {word:'black hair',zh:'黑色的头发',image:PICTURES.brother,say:'He has got black hair.'},
 {word:'red hair',zh:'红色的头发',image:PICTURES.lily,say:'She has got red hair.'}
];
function wordDrawer(){location.replace('words.html?unit=all');}

function bodyStart(group){
 S.bodyGroup=group;S.kind='body';S.index=0;S.answered=false;S.errors=0;
 S.tasks=shuffle(BODY.filter(b=>group==='face'?b.group==='face':b.group!=='face')).map(b=>({...b,dots:shuffle([{xy:b.target,right:true},...b.others.map(xy=>({xy,right:false}))])}));
 if(group==='body')S.tasks.push({id:'feet-pair',pair:true,word:'feet',say:'Touch your feet.'});
 go('body-quiz');
}
function bodyQuiz(){
 const task=S.tasks[S.index],pair=!!task.pair,source=task.group==='face'?PICTURES.sister:task.group==='bunny'?PICTURES.bunny:PICTURES.body;
 const board=pair?'<div class="choice-grid"><button class="choice '+choiceClass(0,1)+'" data-action="spot" data-index="0" '+(S.answered?'disabled':'')+'>🦶 foot · 一只脚</button><button class="choice '+choiceClass(1,1)+'" data-action="spot" data-index="1" '+(S.answered?'disabled':'')+'>🦶🦶 feet · 两只脚</button></div>':
 '<div class="body-board">'+img(source,'请在图上找 '+task.zh)+task.dots.map((dot,i)=>'<button type="button" style="--x:'+dot.xy[0]+'%;--y:'+dot.xy[1]+'%" data-action="spot" data-index="'+i+'" aria-label="位置 '+(i+1)+'" class="'+(S.answered&&dot.right?'target':'')+'" '+(S.answered?'disabled':'')+'>'+(i+1)+'</button>').join('')+'</div>';
 root.innerHTML='<section class="panel">'+top('BODY · '+(S.bodyGroup==='face'?'脸和头':'身体和尾巴'),S.tasks.length,S.index)+
 '<div class="task-head">'+img(PICTURES.flower,'小红花')+'<div><h1>'+esc(pair?'一只脚，还是两只脚？':'帮我找到 '+task.word)+'</h1><p>听一听，先在自己身上指一指，再点图。</p></div></div>'+
 '<p class="task-english">'+esc(task.say)+'</p>'+sayButton(task.say,'▶ 听指令')+board+
 (S.feedback?'<div class="feedback '+(S.answered?'good':'')+'">'+esc(S.feedback)+'</div>':'')+
 (S.answered?'<div class="actions">'+button(S.index===S.tasks.length-1?'完成寻宝 →':'下一题 →','body-next','primary')+'</div>':'')+'</section>';
}
function bodyAnswer(index){
 if(S.answered)return;const task=S.tasks[S.index],correct=task.pair?index===1:!!task.dots[index]?.right;
 if(correct){S.answered=true;S.feedback='找到了！这是 '+task.word+'。跟小红花读一遍：'+task.say;playIfReady(task.say);}
 else{S.errors++;mistake('body-'+task.id);S.feedback=S.errors===1?'再看看位置，摸摸自己身上同一个部位。':'看绿色圆点，再一起说：'+task.say;if(S.errors>=2){S.answered=true;playIfReady(task.say);}}
 S.choice=index;render();
}
function bodyNext(){S.index++;S.answered=false;S.errors=0;S.choice=-1;S.feedback='';if(S.index>=S.tasks.length){markDone('body-'+S.bodyGroup);go('complete');}else render();}
function complete(){
 const name=S.kind==='family'?'家人相册':S.kind==='body'?'身体寻宝':S.lesson?.name||'这站';
 root.innerHTML='<section class="hero"><div><p class="eyebrow">任务完成 ✿</p><h1>'+esc(name)+'，做好啦！</h1><p>你认真看图、说句子、完成了这一站。下次可以拿着真实照片，再说一遍今天用过的句子。</p>'+button('回到小红花相册','home','primary')+'</div>'+img(PICTURES.flower,'小红花')+'</section>';
}
function album(){
 const p=PORTRAIT_CHOICES[S.albumChoice],falseEyes=({green:'blue',blue:'green',brown:'blue'})[p.eyes],isFinal=S.albumStep>=3;
 root.innerHTML='<section class="panel">'+top('我的角色卡 · 应用任务')+'<h1>选一个角色，开口介绍</h1><p>这是练习角色，不会把角色画像当成枝枝本人。想一想：角色自己说 I，小红花向别人介绍时说 she 或 he。</p>'+
 '<div class="album-options">'+PORTRAIT_CHOICES.map((x,i)=>'<button data-action="avatar" data-index="'+i+'" class="'+(i===S.albumChoice?'selected':'')+'">'+img(x.image,x.name)+'<span>'+esc(x.name)+'</span></button>').join('')+'</div>'+
 '<div class="album-preview">'+img(p.image,p.name)+'<div><p>I’ve got '+esc(p.hair)+' hair.<br>I’ve got '+esc(p.eyes)+' eyes.</p>'+sayButton('I’ve got '+p.hair+' hair.','▶ 听头发')+' '+sayButton('I’ve got '+p.eyes+' eyes.','▶ 听眼睛')+'<p class="small">小红花介绍：'+(p.pronoun==='she'?'She':'He')+' has got '+esc(p.eyes)+' eyes.</p></div></div>'+
 (S.albumStep===0?'<div class="lesson-explain">请先照着卡片说两句。说完点下面按钮；点选无法判断口语是否说对，家长可以陪着听。</div><div class="actions">'+button('我说好了，来回答问题 →','album-begin','primary')+'</div>':
 isFinal?'<div class="feedback good">角色卡完成！现在试着不看文字，再说两句。</div><div class="actions">'+button('保存角色卡图片','album-download','primary')+button('再换一个角色','album-reset','secondary')+'</div>':
 '<div class="lesson-explain"><b>小红花问：</b>Have you got '+esc(S.albumStep===1?p.eyes:falseEyes)+' eyes? '+sayButton('Have you got '+(S.albumStep===1?p.eyes:falseEyes)+' eyes?','▶ 听问题')+'</div>'+
 '<div class="choice-grid">'+button('Yes, I have.','album-answer','choice','data-value="yes"')+button('No, I haven’t.','album-answer','choice','data-value="no"')+'</div>'+
 (S.feedback?'<div class="feedback">'+esc(S.feedback)+'</div>':'')+
 '<p class="small">这题请以角色身份回答。答案只凭所选角色的眼睛颜色判断。</p>')+'</section>';
}
function albumAnswer(value){
 const p=PORTRAIT_CHOICES[S.albumChoice],yes=S.albumStep===1;
 if((value==='yes')!==yes){S.feedback='再看角色眼睛颜色。回答时你是这个角色，所以用 I。';render();return;}
 playIfReady(yes?'Yes, I have.':'No, I haven’t.');S.feedback='';S.albumStep++;if(S.albumStep>=3)markDone('avatar');render();
}
async function albumDownload(){
 const p=PORTRAIT_CHOICES[S.albumChoice],canvas=document.createElement('canvas');canvas.width=800;canvas.height=1050;const c=canvas.getContext('2d');
 c.fillStyle='#fff8ef';c.fillRect(0,0,800,1050);c.fillStyle='#bf3451';c.fillRect(0,0,800,110);c.fillStyle='white';c.font='bold 40px sans-serif';c.fillText('My character card',55,70);
 const picture=new Image();picture.src=p.image;await picture.decode();c.drawImage(picture,115,135,570,600);c.fillStyle='#6d3145';c.font='bold 39px sans-serif';c.fillText('I’ve got '+p.hair+' hair.',70,800);c.fillText('I’ve got '+p.eyes+' eyes.',70,860);c.font='26px sans-serif';c.fillText('Power Up 1 · Unit 2',70,970);
 canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='小红花-Unit2-角色卡.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);},'image/png');
}
function parent(){
 const ready=manifest.filter(c=>imported.has(c.id)||published[c.id]).length,counts=progress.completed.length;
 root.innerHTML='<section class="panel">'+top('FOR GROWN-UPS')+'<h1>家长角</h1><p>已完成 '+counts+' / 12 站。答错记录 '+progress.mistakes.length+' 次。记录只保存在这台设备的当前浏览器；点对一道题，不等于已经能独立开口说。</p>'+
 '<div class="parent-status"><div><b>'+counts+'/12</b>站点完成</div><div><b>'+ready+'/'+manifest.length+'</b>逐句录音可用</div><div><b>'+progress.mistakes.length+'</b>答错与重试</div></div>'+
 '<h2>小红花的声音</h2><p>Unit 2 使用逐句文件；缺音频时页面明确显示「待录音」，不会调用电脑内置语音。录音由本机后台按清单批量制作，自动跳过已有文件；也可以导入现成录音。</p>'+
 '<div class="actions">'+button('下载逐句配音文案','script','secondary')+'</div>'+
 '<label class="file-input">导入现成录音（按文件名匹配）<input id="unit2-import" type="file" accept=".wav,.mp3,.m4a,.ogg,audio/*" multiple></label>'+
 '<p class="small">后台生成的录音保存在项目文件夹；手工导入的录音保存在当前浏览器，请另外保留原文件。刷新页面可读取新生成的录音。</p>'+
 '<details><summary>查看句子清单及状态</summary><div class="audio-list">'+manifest.map(c=>'<div><b>'+(imported.has(c.id)||published[c.id]?'✓':'○')+'</b> '+esc(c.text)+' <code>'+esc(c.file)+'</code> '+sayButton(c.text,'▶ 试听')+'</div>').join('')+'</div></details>'+
 '<h2>最近需要再练的句子</h2><p>'+esc(progress.mistakes.slice(-8).reverse().map(x=>x.id).join('、')||'目前没有重试记录。')+'</p>'+
 '<div class="actions">'+button('导出学习记录','export','secondary')+button('清空 Unit 2 学习记录','clear','quiet')+'</div></section>';
}
function downloadText(filename,content,type='text/plain;charset=utf-8'){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function render(){if(S.view==='home')home();else if(S.view==='words')wordDrawer();else if(S.view==='family-learn')familyLearn();else if(S.view==='family-quiz'||S.view==='lesson-quiz')quizTask();else if(S.view==='lesson-intro')lessonIntro();else if(S.view==='body-learn')bodyLearn();else if(S.view==='body-quiz')bodyQuiz();else if(S.view==='complete')complete();else if(S.view==='album')album();else if(S.view==='parent')parent();}
root.addEventListener('click',async event=>{
 const el=event.target.closest('button[data-action]');if(!el)return;
 const action=el.dataset.action,index=Number(el.dataset.index);
 if(action==='home')go('home');
 else if(action==='words')go('words');
 else if(action==='family-learn')go('family-learn');
 else if(action==='family-start')familyStart();
 else if(action==='body-learn')go('body-learn');
 else if(action==='body-face'||action==='body-body')bodyStart(action==='body-face'?'face':'body');
 else if(action==='body-word')playText(el.dataset.text);
 else if(action==='spot')bodyAnswer(index);
 else if(action==='body-next')bodyNext();
 else if(action==='lesson'){S.lesson=LESSONS.find(x=>x.id===el.dataset.id);S.sceneIndex=0;go('lesson-intro');}
 else if(action==='scene'){S.sceneIndex=index;stopAudio();render();}
 else if(action==='lesson-start')lessonStart();
 else if(action==='answer')answer(index);
 else if(action==='next')next();
 else if(action==='say')playText(el.dataset.text);
 else if(action==='album'){S.albumStep=0;go('album');}
 else if(action==='avatar'){S.albumChoice=index;S.albumStep=0;S.feedback='';render();}
 else if(action==='album-begin'){S.albumStep=1;render();}
 else if(action==='album-answer')albumAnswer(el.dataset.value);
 else if(action==='album-download')albumDownload().catch(()=>notice('角色卡暂时无法保存，请再试一次。'));
 else if(action==='album-reset'){S.albumStep=0;render();}
 else if(action==='parent')go('parent');
 else if(action==='script')downloadText('Unit2-逐句配音清单.txt','Power Up 1 · Unit 2 · Neural2 逐句录音\n建议语速 0.87；逐句生成，保留问号的问句语气。\n\n'+manifest.map(c=>c.file+'\n'+c.text+'\n').join('\n'));
 else if(action==='export')downloadText('Unit2-学习记录.json',JSON.stringify(progress,null,2),'application/json');
 else if(action==='clear'){if(confirm('只清空 Unit 2 的完成和重试记录。确定吗？')){progress={completed:[],mistakes:[],plays:0};save();render();}}
});
document.querySelector('.u2-header').addEventListener('click',e=>{const el=e.target.closest('[data-nav]');if(el)go(el.dataset.nav);});
root.addEventListener('change',async e=>{if(e.target.id!=='unit2-import')return;let count=0;for(const file of e.target.files){const clip=manifest.find(c=>file.name===c.file||file.name.replace(/\.[^.]+$/,'')===c.id);if(!clip)continue;await putAudio(clip.id,file);imported.set(clip.id,file);count++;}notice(count?'已导入 '+count+' 条录音。':'没有找到匹配的文件名；请下载逐句清单核对。');render();});
function openDB(){return new Promise(resolve=>{if(!('indexedDB'in window)){resolve(null);return;}const request=indexedDB.open(DB_NAME,1);request.onupgradeneeded=()=>request.result.createObjectStore('clips');request.onsuccess=()=>resolve(request.result);request.onerror=()=>resolve(null);});}
function dbReadAll(){return new Promise(resolve=>{if(!db){resolve();return;}const tx=db.transaction('clips','readonly'),store=tx.objectStore('clips'),req=store.openCursor();req.onsuccess=()=>{const cursor=req.result;if(cursor){imported.set(cursor.key,cursor.value);cursor.continue();}else resolve();};req.onerror=()=>resolve();});}
function putAudio(id,blob){return new Promise(resolve=>{if(!db){resolve();return;}const tx=db.transaction('clips','readwrite');tx.objectStore('clips').put(blob,id);tx.oncomplete=resolve;tx.onerror=resolve;});}
async function init(){
 const [m,p]=await Promise.all([fetch('unit2-audio.json?fresh='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[]),fetch('audio/unit2/published.json?fresh='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({}))]);
 manifest=Array.isArray(m)?m:[];clipByText=new Map(manifest.map(c=>[c.text,c]));published=p&&typeof p==='object'?p:{};db=await openDB();await dbReadAll();render();
}
window.addEventListener('pagehide',stopAudio);
render();init();
