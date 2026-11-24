/* Generated illustration sheets are displayed through native SVG viewports.
   Source bitmaps remain intact; rectangles were checked against the actual images. */
const ART = {
  animals: {file:'animals.png',width:1448,height:1086},
  comparisons: {file:'comparisons.png',width:1024,height:1536},
  feelings: {file:'feelings.png',width:1536,height:1024}
};
const animals = [
  {id:'cow',cn:'牛',plural:'cows',counter:'头',rect:[13,45,400,358],tip:'看看黑白花纹和四条腿。'},
  {id:'donkey',cn:'驴',plural:'donkeys',rect:[417,5,298,402],tip:'驴的耳朵很长。和旁边的马对照看一看。'},
  {id:'horse',cn:'马',plural:'horses',rect:[742,1,367,408],tip:'马有长长的鬃毛和尾巴；这匹马的耳朵比驴短。'},
  {id:'goat',cn:'山羊',plural:'goats',rect:[1159,26,281,382],tip:'这只山羊有小胡子，头上还有弯弯的角。'},
  {id:'cat',cn:'猫',plural:'cats',rect:[43,408,238,333],tip:'cat：猫。观察它的耳朵、胡须和尾巴。'},
  {id:'dog',cn:'狗',plural:'dogs',rect:[402,418,292,334],tip:'dog：狗。这只狗有垂下来的耳朵。'},
  {id:'sheep',cn:'绵羊',plural:'sheep',rect:[765,420,310,332],tip:'绵羊的身体覆盖着卷卷的羊毛。两只绵羊也说 sheep。'},
  {id:'chicken',cn:'鸡',plural:'chickens',rect:[1133,412,255,343],tip:'鸡有鸡冠、翅膀和两条腿。'},
  {id:'duck',cn:'鸭',plural:'ducks',rect:[35,747,255,312],tip:'鸭的嘴比较宽，脚趾之间有蹼。'},
  {id:'spider',cn:'蜘蛛',plural:'spiders',rect:[369,816,317,206],tip:'蜘蛛有八条腿。它不是六条腿的昆虫。'}
];
const animalById = Object.fromEntries(animals.map(a=>[a.id,a]));
const stages = [
  {id:'animals',name:'农场朋友',desc:'认识 10 位动物朋友',tag:'WORDS'},
  {id:'compare',name:'观察放大镜',desc:'发现大小、长短与新旧',tag:'LOOK'},
  {id:'feelings',name:'心情观察站',desc:'看看心情，认识形容词',tag:'FEEL'},
  {id:'grammar',name:'句子实验室',desc:'它怎么样？它有什么？',tag:'SAY'},
  {id:'plural',name:'一个与一群',desc:'数一数，换一个说法',tag:'COUNT'},
  {id:'yesno',name:'真假线索',desc:'问一问，再看图回答',tag:'ASK'},
  {id:'detective',name:'小侦探出动',desc:'根据两条线索找朋友',tag:'FIND'},
  {id:'create',name:'我的小农场',desc:'邀请朋友，做介绍卡',tag:'MAKE'}
];
const compareGroups = [
  {names:['big','small'],cn:['大的','小的'],rects:[[0,0,534,372],[534,0,490,372]],note:'这是同一设计的两头成年牛，只改变大小。big / small 说的是大小。'},
  {names:['long','short'],cn:['长的','短的'],rects:[[0,373,512,375],[512,373,512,375]],note:'猫的身体差不多，尾巴的长度不同。我们这一次只观察尾巴。'},
  {names:['new','old'],cn:['新的','旧的'],rects:[[0,749,512,281],[512,749,512,281]],note:'两个箱子的样式一样。一个刚做好，另一个已经用了很久。这里 old 表示“旧的”。'},
  {names:['old','young'],cn:['年老的','年幼的'],rects:[[0,1036,512,500],[512,1036,512,500]],note:'故事先介绍了年老的绵羊爷爷和年幼的小羊。这里 old 说的是年龄。'}
];
const feelingData = [
  ['happy','开心的','这只狗笑起来了，看起来很开心。'],
  ['sad','难过的','它低着头，眼里有一滴泪。'],
  ['angry','生气的','它皱起眉头，身体绷得紧紧的。'],
  ['funny','有趣的、滑稽的','它把叶子当帽子，做出滑稽的样子。funny 不等于 happy。'],
  ['beautiful','漂亮的','故事里，小羊把这幅花的画叫作 beautiful。'],
  ['ugly','丑的','故事里，小猫把这幅怪兽画叫作 ugly。这是角色的评价，你也可以有不同看法。']
];
const cases = [
  {options:['horse','donkey','chicken'],answer:'donkey',clues:['It has got four legs.','It has got long ears.'],cn:'它有四条腿，而且耳朵很长。'},
  {options:['dog','spider','duck'],answer:'spider',clues:['It is brown.','It has got eight legs.'],cn:'它是棕色的，而且有八条腿。'},
  {options:['chicken','horse','duck'],answer:'duck',clues:['It is white.','It has got two legs.'],cn:'它是白色的，而且有两条腿。'}
];
const state = {route:'home',wordQuiz:false,wordIndex:0,showCN:true,compareGroup:0,compareQuiz:false,compareTarget:0,compareOrder:[0,1],grammarMode:0,pluralAnimal:'cow',count:1,negative:false,cat:0,tailQuestion:0,caseIndex:0,farm:[]};
const app = document.getElementById('app');
const nav = document.getElementById('stageNav');
const safe = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let spriteCounter=0;
function sprite(kind,rect,label){
  const art=ART[kind];
  const clip='sprite-clip-'+(++spriteCounter);
  return `<svg class="sprite" viewBox="${rect.join(' ')}" role="img" aria-label="${safe(label)}"><defs><clipPath id="${clip}"><rect x="${rect[0]}" y="${rect[1]}" width="${rect[2]}" height="${rect[3]}"/></clipPath></defs><image href="assets/${art.file}" width="${art.width}" height="${art.height}" clip-path="url(#${clip})"/></svg>`;
}
function animalImage(id){const a=animalById[id];return sprite('animals',a.rect,a.cn);}
function animalCard(id,action,hideLabel=false){const a=animalById[id];return `<button class="animal-card" data-action="${action}" data-id="${id}" aria-label="选择${a.cn}">${animalImage(id)}${hideLabel?'':`<strong lang="en">${id}</strong>${state.showCN?`<small>${a.cn}</small>`:''}`}</button>`;}
function guide(text){return `<div class="guide"><img src="assets/linabell.png" alt="玲娜贝儿"><p>${text}</p></div>`;}
function heading(eyebrow,title,text){return `<div class="page-heading"><div class="eyebrow">${eyebrow}</div><h2 tabindex="-1">${title}</h2><p>${text}</p></div>`;}
function feedback(text='看清画面，再试一试。'){return `<div id="feedback" class="feedback" role="status" aria-live="polite">${text}</div>`;}
function setFeedback(text,type='',next=''){const el=document.getElementById('feedback');el.className='feedback '+type;el.innerHTML=`<span>${text}</span>${next}`;}
function end(next,name){return `<div class="section-end"><button class="secondary" data-route="${next}">${name} →</button></div>`;}
function renderNav(){nav.innerHTML=`<button data-route="home" class="${state.route==='home'?'current':''}" ${state.route==='home'?'aria-current="page"':''}>农场地图</button>`+stages.map((s,i)=>`<button data-route="${s.id}" class="${state.route===s.id?'current':''}" ${state.route===s.id?'aria-current="page"':''}><span class="num">${i+1}</span>${s.name}</button>`).join('');}
function home(){return `<section class="hero"><div class="hero-copy"><div class="eyebrow">UNIT 3 · FUN ON THE FARM</div><h1>和玲娜贝儿<br>一起发现农场</h1><p>认识动物，观察特征，收集线索。<br>小侦探，准备好做一份<br>属于你的农场观察册了吗？</p><div class="button-row"><button class="primary" data-route="animals">开始认识朋友 →</button><button class="secondary" data-route="grammar">先玩句子实验</button></div></div><img class="hero-character" src="assets/linabell.png" alt="拿着放大镜、向小侦探挥手的玲娜贝儿"></section><div class="journey-heading"><h2>我们的观察之旅</h2><span>一次一个任务，随时可以停下来</span></div><div class="journey-grid">${stages.map((s,i)=>`<button class="journey-card" data-route="${s.id}"><span class="tag">${String(i+1).padStart(2,'0')} / ${s.tag}</span><h3>${s.name}</h3><p>${s.desc}</p></button>`).join('')}</div>`;}
function words(){const order=['donkey','sheep','duck','goat','spider','cow','cat','horse','chicken','dog'];const target=order[state.wordIndex%order.length];return heading('01 / WORDS','农场朋友','先认识朋友，再试着只看图片找出它。')+guide(state.wordQuiz?`请帮我找到 <strong lang="en">${target}</strong>。先想起它的样子。`:'我会陪你认识每一位朋友。点一张图卡，看看它最容易认出的特征。')+`<section class="workspace"><div class="toolbar"><div class="modes"><button class="pill ${!state.wordQuiz?'active':''}" data-action="wordMode" data-mode="learn">认识朋友</button><button class="pill ${state.wordQuiz?'active':''}" data-action="wordMode" data-mode="quiz">找一找</button></div>${!state.wordQuiz?`<label class="checkbox"><input id="showCN" type="checkbox" ${state.showCN?'checked':''}>显示中文</label>`:`<div class="question">找出 <b lang="en">${target}</b></div>`}</div><div class="animal-grid">${animals.map(a=>animalCard(a.id,'word',state.wordQuiz)).join('')}</div>${feedback(state.wordQuiz?'图卡的文字已经藏起来了。':'点一张图卡，认识它。')}</section>`+end('compare','去观察不同的特征');}
function comparison(){const g=compareGroups[state.compareGroup];return heading('02 / LOOK','观察放大镜','先看清两个画面哪里不同，再认识对应的形容词。')+guide(g.note)+`<section class="workspace"><div class="toolbar"><div class="modes">${['大小','尾巴长短','箱子新旧','年龄'].map((n,i)=>`<button class="pill ${state.compareGroup===i?'active':''}" data-action="compareGroup" data-index="${i}">${n}</button>`).join('')}</div><button class="secondary" data-action="compareQuiz">${state.compareQuiz?'再换一个词':'试着找一找'}</button></div>${state.compareQuiz?`<p class="question">找出 <b lang="en">${g.names[state.compareTarget]}</b>（${g.cn[state.compareTarget]}）</p>`:''}<div class="comparison-grid">${state.compareOrder.map(i=>`<button class="comparison-card" data-action="compareChoice" data-index="${i}">${sprite('comparisons',g.rects[i],g.cn[i])}${state.compareQuiz?'':`<strong lang="en">${g.names[i]}</strong><small>${g.cn[i]}</small>`}</button>`).join('')}</div>${feedback(state.compareQuiz?'只看图片，指出正确的一张。':'点图片，留意这一次描述的特征。')}</section>`+end('feelings','去看看朋友的心情');}
function feelings(){return heading('03 / FEEL','心情观察站','同一只狗也会有不同心情。点一张图，看看这个词在说什么。')+guide('开心、生气、难过，都可以说出来。再看看 funny 和 happy 有什么不同。')+`<section class="workspace"><div class="feelings-grid">${feelingData.map(([word,cn],i)=>{const rect=i<3?[i*512,0,512,451]:[(i-3)*512,450,512,574];return `<button class="feeling-card" data-action="feeling" data-index="${i}">${sprite('feelings',rect,cn)}<strong lang="en">${word}</strong><small>${cn}</small></button>`;}).join('')}</div>${feedback('选一个词，和玲娜贝儿一起观察。')}<div class="nice-scene"><img src="assets/nice.png" alt="小猫把蓝色小球送还给小羊"><div><div class="eyebrow">A NICE CAT</div><h3>小猫帮朋友找回了球</h3><p>小羊丢了球，小猫主动把球送回来。故事里，我们可以说它是一只友好的猫。</p><p lang="en"><strong>It is a nice cat.</strong></p><p>nice 在这里说的是它对朋友很友好。</p></div></div></section>`+end('grammar','把观察到的事情说出来');}
function grammar(){const forms=[{label:'它怎么样',sentence:'It <span class="verb">is</span> small.',cn:'它很小。',note:'看整体大小：is 后面接 small。',q:'It ___ small.',answer:'is'},{label:'它是什么动物',sentence:'It <span class="verb">is</span> a small cow.',cn:'它是一头体型小的牛。',note:'a small cow 是“形容词＋动物名”。这里 small 说的是体型小，不是在说年龄。',q:'It ___ a small cow.',answer:'is'},{label:'它有什么',sentence:'It <span class="verb">has got</span> a tail.',cn:'它有一条尾巴。',note:'观察身体后面的尾巴：has got 表示“有”。',q:'It ___ a tail.',answer:'has got'}];const f=forms[state.grammarMode];return heading('04 / SAY','句子实验室','牛没有变。换一个观察的问题，句子就会变化。')+guide('先说它怎么样，再说它是什么，最后说它有什么。我们一直看同一张图。')+`<section class="workspace"><div class="split"><div class="picture-panel">${sprite('comparisons',compareGroups[0].rects[1],'体型较小、带尾巴的成年牛')}<p>一直是这头体型小的牛</p></div><div><div class="modes">${forms.map((x,i)=>`<button class="pill ${state.grammarMode===i?'active':''}" data-action="grammarMode" data-index="${i}">${x.label}</button>`).join('')}</div><div class="sentence" lang="en">${f.sentence}</div><div class="meaning">${f.cn}</div><p class="soft-note">${f.note}</p><p class="question" lang="en">${f.q}</p><div class="answer-buttons"><button class="answer" data-action="grammarAnswer" data-answer="is">is</button><button class="answer" data-action="grammarAnswer" data-answer="has got">has got</button></div></div></div>${feedback('选一个词块，把这句话补完整。')}</section>`+end('plural','再看看一个和一群');}
function plural(){const isOld=state.pluralAnimal==='old-sheep';const a=animalById[isOld?'sheep':state.pluralAnimal];const noun=isOld?(state.count===1?'an old sheep':'old sheep'):(state.count===1?`a ${a.id}`:a.plural);const counter=a.counter||'只';const name=isOld?'年老的绵羊':a.cn;const sentence=state.negative?(state.count===1?'It <span class="verb">isn’t</span> a horse.':'They <span class="verb">aren’t</span> horses.'):(state.count===1?`It <span class="verb">is</span> ${noun}.`:`They <span class="verb">are</span> ${noun}.`);return heading('05 / COUNT','一个与一群','先数图里的动物，再看主语、be 动词和动物名怎样变化。')+guide(state.negative?'图上的朋友不是马。看看否定句怎么说。':'一个动物用 It is，多只用 They are。说多只动物时，不保留 a。')+`<section class="workspace"><div class="toolbar"><div class="modes">${['cow','sheep','chicken','goat','old-sheep'].map(id=>`<button class="pill ${state.pluralAnimal===id?'active':''}" data-action="pluralAnimal" data-id="${id}">${id==='old-sheep'?'old sheep':id}</button>`).join('')}</div><label class="checkbox"><input type="checkbox" id="negative" ${state.negative?'checked':''}>换成否定句</label></div><div class="split"><div class="picture-panel"><div class="number-display">${Array.from({length:state.count},()=>isOld?sprite('comparisons',compareGroups[3].rects[0],'年老的绵羊'):animalImage(a.id)).join('')}</div><p>${state.count===1?'一':'两'}${counter}${name}</p></div><div><div class="count-control"><button data-action="count" data-count="1" class="${state.count===1?'active':''}">1 位朋友</button><button data-action="count" data-count="2" class="${state.count===2?'active':''}">2 位朋友</button></div><div class="sentence" lang="en">${sentence}</div><p class="meaning">${state.negative?(state.count===1?'它不是一匹马。':'它们不是马。'):(state.count===1?`它是一${counter}${name}。`:`它们是${name}。`)}</p><p class="soft-note">${isOld?'an old sheep：一只年老的绵羊。old 前面这里用 an；说多只时去掉 an。':a.id==='sheep'?'sheep 的单数和复数写法相同。':'动物变多，动物名也要换成复数形式。'}${state.negative?'否定句也要和图上的事实相符。':''}</p></div></div></section>`+end('yesno','问问它有没有');}
function yesno(){const tail=state.tailQuestion===0?'long':'short';return heading('06 / ASK','真假线索','先看猫的尾巴，再回答玲娜贝儿的问题。')+guide('短回答保留 has，不用再加 got。图换了，回答也可能变化。')+`<section class="workspace"><div class="split"><div class="picture-panel">${sprite('comparisons',compareGroups[1].rects[state.cat],state.cat===0?'长尾巴猫':'短尾巴猫')}<p>${state.cat===0?'长尾巴':'短尾巴'}</p></div><div><div class="modes"><button class="pill ${state.cat===0?'active':''}" data-action="cat" data-index="0">看长尾巴猫</button><button class="pill ${state.cat===1?'active':''}" data-action="cat" data-index="1">看短尾巴猫</button></div><div class="sentence" lang="en">Has it got a <span class="feature">${tail} tail</span>?</div><p class="meaning">它有一条${tail==='long'?'长':'短'}尾巴吗？</p><div class="answer-buttons"><button class="answer" data-action="yesno" data-answer="yes">Yes, it has.</button><button class="answer" data-action="yesno" data-answer="no">No, it hasn’t.</button></div><div class="button-row"><button class="secondary" data-action="tailQuestion">换一个问题</button></div></div></div>${feedback('选 Yes 或 No，再看看完整的描述句。')}</section>`+end('detective','带着线索找朋友');}
function detective(){const c=cases[state.caseIndex%cases.length];return heading('07 / FIND','小侦探出动','两条线索都符合，才是我们要找的动物。')+guide('先数腿，再观察耳朵或颜色。不要只看第一条线索就着急回答。')+`<section class="workspace"><div class="clue-list">${c.clues.map((line,i)=>`<div class="clue"><span>${i+1}</span><div lang="en">${line}</div></div>`).join('')}</div><div class="detective-grid">${c.options.map(id=>animalCard(id,'detective',true)).join('')}</div>${feedback('点选你找到的动物。')}</section>`+end('create','完成我的小农场');}
function farmSentence(){if(!state.farm.length)return '';const numbers=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];const counts=animals.map(a=>[a,state.farm.filter(id=>id===a.id).length]).filter(x=>x[1]);const parts=counts.map(([a,n])=>`${numbers[n]} ${n===1?a.id:a.plural}`);const joined=parts.length===1?parts[0]:parts.slice(0,-1).join(', ')+(parts.length>2?', and ':' and ')+parts.at(-1);return 'Our farm has got '+joined+'.';}
function create(){return heading('08 / MAKE','我的小农场','邀请动物朋友加入，再用英语介绍你的农场。点农场里的动物，可以送它回家。')+guide('每增加一只动物，介绍卡都会跟着变化。看看两只绵羊的名字怎么写。')+`<section class="workspace"><div class="farm-layout"><div><h3>邀请一位朋友</h3><div class="farm-select">${animals.map(a=>`<button data-action="addAnimal" data-id="${a.id}" aria-label="添加${a.cn}">${animalImage(a.id)}<span>${a.id}</span></button>`).join('')}</div><p class="soft-note">这张观察卡最多放 12 位朋友。</p></div><div><div class="print-only">My farm · 我的小农场</div><div class="farm-canvas">${state.farm.length?`<div class="farm-animals">${state.farm.map((id,i)=>`<button class="farm-animal" data-action="removeAnimal" data-index="${i}" aria-label="移除第${i+1}只${animalById[id].cn}">${animalImage(id)}<small>点我回家</small></button>`).join('')}</div>`:'<div class="empty">点左边的图卡，邀请动物朋友来农场。</div>'}</div><div class="farm-summary"><h3>我的介绍卡</h3>${state.farm.length?`<div class="sentence" lang="en">${farmSentence()}</div><p>图里一共 ${state.farm.length} 位动物朋友。</p>`:'<p>加入朋友后，这里会出现农场介绍。</p>'}</div><div class="button-row"><button class="primary" data-action="print" ${state.farm.length?'':'disabled'}>打印介绍卡</button><button class="secondary" data-action="clearFarm" ${state.farm.length?'':'disabled'}>重新布置</button></div></div></div>${feedback('从一位朋友开始，慢慢完成你的农场。')}</section>`;}
const renderers={home,animals:words,compare:comparison,feelings,grammar,plural,yesno,detective,create};
function render(){renderNav();app.innerHTML=renderers[state.route]();}
function route(id){if(!renderers[id])return;state.route=id;render();window.scrollTo({top:0,behavior:'instant'});const h=app.querySelector('h2');if(h)h.focus({preventScroll:true});}
document.addEventListener('click',e=>{const button=e.target.closest('[data-route]');if(button)route(button.dataset.route);});
document.getElementById('parentButton').addEventListener('click',e=>{const panel=document.getElementById('parentPanel');panel.hidden=!panel.hidden;e.currentTarget.setAttribute('aria-expanded',String(!panel.hidden));});
app.addEventListener('change',e=>{if(e.target.id==='showCN'){state.showCN=e.target.checked;render();}if(e.target.id==='negative'){state.negative=e.target.checked;render();}});
app.addEventListener('click',e=>{
  const button=e.target.closest('[data-action]');if(!button)return;
  const d=button.dataset;
  switch(d.action){
    case 'wordMode':state.wordQuiz=d.mode==='quiz';render();break;
    case 'word':{
      const a=animalById[d.id];if(!state.wordQuiz){setFeedback(`<strong lang="en">${a.id}</strong> · ${a.cn}。${a.tip}`);break;}
      const target=['donkey','sheep','duck','goat','spider','cow','cat','horse','chicken','dog'][state.wordIndex%10];
      if(d.id===target)setFeedback(`找到了！${a.id} 是${a.cn}。${a.tip}`,'ok','<button data-action="nextWord">再找一位朋友 →</button>');
      else setFeedback(`这张图是${a.cn}。${animalById[target].tip}`,'try');break;
    }
    case 'nextWord':state.wordIndex++;render();break;
    case 'compareGroup':state.compareGroup=Number(d.index);state.compareQuiz=false;state.compareOrder=[0,1];render();break;
    case 'compareQuiz':state.compareQuiz=true;state.compareTarget=Math.random()<.5?0:1;state.compareOrder=Math.random()<.5?[0,1]:[1,0];render();break;
    case 'compareChoice':{
      const g=compareGroups[state.compareGroup],i=Number(d.index);
      if(!state.compareQuiz)setFeedback(`${g.names[i]} · ${g.cn[i]}。${g.note}`);
      else if(i===state.compareTarget)setFeedback(`找对了！${g.names[i]} 表示${g.cn[i]}。`,'ok');
      else setFeedback(`你选的是 ${g.names[i]}（${g.cn[i]}）。再看看我们要找的特征。`,'try');break;
    }
    case 'feeling':{const f=feelingData[Number(d.index)];setFeedback(`<strong lang="en">${f[0]}</strong> · ${f[1]}。${f[2]}`);break;}
    case 'grammarMode':state.grammarMode=Number(d.index);render();break;
    case 'grammarAnswer':{
      const correct=state.grammarMode===2?'has got':'is';
      if(d.answer===correct)setFeedback(state.grammarMode===2?'对了！has got 说的是“有”：它有一条尾巴。':'对了！is 可以介绍它，也可以说它怎么样。','ok');
      else setFeedback(state.grammarMode===2?'这一句说它“有”尾巴，试试 has got。':'这一句说它怎么样或是什么动物，试试 is。','try');break;
    }
    case 'pluralAnimal':state.pluralAnimal=d.id;render();break;
    case 'count':state.count=Number(d.count);render();break;
    case 'cat':state.cat=Number(d.index);render();break;
    case 'tailQuestion':state.tailQuestion=1-state.tailQuestion;render();break;
    case 'yesno':{
      const isYes=state.cat===state.tailQuestion,chosen=d.answer==='yes',actual=state.cat===0?'long':'short',asked=state.tailQuestion===0?'long':'short';
      const full=isYes?`It has got a ${actual} tail.`:`It hasn’t got a ${asked} tail. It has got a ${actual} tail.`;
      if(chosen===isYes)setFeedback(`<span lang="en">${isYes?'Yes, it has.':'No, it hasn’t.'} ${full}</span>`,'ok');
      else setFeedback(`再看尾巴：这只猫有${actual==='long'?'长':'短'}尾巴。我们问的是${asked==='long'?'长':'短'}尾巴。`,'try');break;
    }
    case 'detective':{
      const c=cases[state.caseIndex%cases.length];if(d.id===c.answer)setFeedback(`<span lang="en">It is a ${c.answer}.</span> 两条线索都符合：${c.cn}`,'ok','<button data-action="nextCase">下一个观察任务 →</button>');
      else setFeedback(`你选的是${animalById[d.id].cn}。再核对第二条线索：<span lang="en">${c.clues[1]}</span>`,'try');break;
    }
    case 'nextCase':state.caseIndex++;render();break;
    case 'addAnimal':if(state.farm.length<12){state.farm.push(d.id);render();}else setFeedback('这张介绍卡已经有 12 位朋友。可以送一位回家，再邀请新的朋友。');break;
    case 'removeAnimal':state.farm.splice(Number(d.index),1);render();break;
    case 'clearFarm':state.farm=[];render();break;
    case 'print':window.print();break;
  }
});
render();
