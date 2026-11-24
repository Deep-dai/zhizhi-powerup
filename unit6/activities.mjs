const town = ['bus','bus stop','car','flower','garden','lorry','motorbike','park','shop','train','tree'];
const animals = ['bear','crocodile','elephant','giraffe','hippo','lizard','monkey','snake','tiger','zebra','polar bear','zoo'];
const albumAnimals = ['zebra','tiger','giraffe','elephant'];
const names = ['zero','one','two','three'];
const id = name => name.replaceAll(' ', '-');
const single = name => (/^[aeiou]/.test(name) ? 'an ' : 'a ') + name;
const exists = (name,n) => n===0 ? `There aren't any ${name}s.` : n===1 ? `There's ${single(name)}.` : `There are ${names[n]} ${name}s.`;
const suggest = name => `Let's go to the ${name}.`;
const animalVisit = (name,n=2) => `Let's look at the ${name}${n===1?'':'s'}.`;
const seek = name => `Find the ${name}.`;
const shuffle = entries => {
  const shuffled = [...entries];
  for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
  return shuffled;
};
const questions = [
  {scene:['giraffe','giraffe','elephant'], line:'Is there an elephant?', answer:'Yes, there is.', pair:'No, there isn’t.'},
  {scene:['tiger','tiger','zebra'], line:'Are there any monkeys?', answer:'No, there aren’t.', pair:'Yes, there are.'},
  {scene:['hippo','hippo','bear'], line:'Are there any hippos?', answer:'Yes, there are.', pair:'No, there aren’t.'},
  {scene:['lizard','snake','snake'], line:'Is there a crocodile?', answer:'No, there isn’t.', pair:'Yes, there is.'}
];
const habitats = [
  ['grassland','grassland','Look for the giraffe in the grassland.','giraffe','草原'],
  ['forest','jungle','Let’s explore the jungle.','monkey','丛林'],
  ['ocean','ocean','Let’s explore the ocean.',null,'海洋'],
  ['arctic','ice','Look for the polar bear on the ice.','polar bear','冰面']
];
const sounds = ['train','snake','cake','plane','cat','hat'];
const destinations = ['zoo','park','garden','shop'];
const reply = "That's a good idea.";
const commissions = [{name:'zebra',n:2},{name:'giraffe',n:1},{name:'tiger',n:3}];
const normalize = t => t.replaceAll('’',"'");
export const activityLines = [...new Set([
  ...town,...animals,...town.concat(animals).map(seek),...sounds,
  ...albumAnimals.flatMap(n=>[0,1,2,3].map(k=>exists(n,k))),
  ...albumAnimals.flatMap(name=>[animalVisit(name,1),animalVisit(name,2)]), ...destinations.map(suggest),reply,
  ...questions.flatMap(q=>[q.line,q.answer,q.pair]),
  ...habitats.flatMap(h=>[h[1],h[2]]),...commissions.map(c=>`Find ${c.n===1?single(c.name):names[c.n]+' '+c.name+'s'}.`)
].map(normalize))];
const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeRead = key => {try{return JSON.parse(localStorage.getItem(key));}catch{return null;}};
function store(key,data){try{localStorage.setItem(key,JSON.stringify(data));}catch{/* Guests may practise without browser storage. */}}
const icon = (i) => ['⌕','◉','▣','?','➜','⌂','♫','⚑'][i];
const stageNames = ['Street search','Animal spotting','Photo studio','Ask the guide','Next stop','Wild homes','Sound train','My wildlife tour'];
const intro = ['先点街上的东西，听听它叫什么。','认识观察区的动物，也听听动物园的英文。','按加号或减号，听听合影里的句子怎样变。','先看看照片，听听一问一答。','点一个你想去的地方，听长颈鹿提建议。','去不同的野外环境听一听。','听每个词中间的声音，观察亮起来的字母。','先练习介绍一站，然后来安排三站行程。'];
const tasks = ['点耳朵听线索，在街景中找到它。','听长颈鹿报名字，点选观察对象。','听委托，布置合影；再给照片配一句介绍。','看清这张照片，听长颈鹿问了什么。','先根据建议选目的地，再提出自己的建议。','听导游的整句提示，把它带到对应环境。','先听参照词，再听车票上的词，选元音相同的车厢。','按委托完成第一站，另外两站由你安排。'];
const negativeSubject = 'tiger';
const wordMeta = name => sounds.includes(name) && ({train:'tr<mark>ai</mark>n',snake:'sn<mark>a</mark>k<mark>e</mark>',cake:'c<mark>a</mark>k<mark>e</mark>',plane:'pl<mark>a</mark>n<mark>e</mark>',cat:'c<mark>a</mark>t',hat:'h<mark>a</mark>t'})[name];
const savedKey = index => 'powerup-u6-activity-02-'+index;

export function startActivity(index,host,{speak,finish,art,words}){
  if(index<0||index>7) throw Error('Unknown Unit 6 activity');
  const speaker = text => {try{return Promise.resolve(speak(normalize(text))).catch(()=>false);}catch{return Promise.resolve(false);}};
  const pic = (name,description=name) => `<img class="u6-object" draggable="false" src="${esc(art(id(name)))}" alt="${esc(description)}">`;
  const btn = (action,html,extra='') => `<button type="button" class="u6-btn ${extra}" data-u6="${esc(action)}">${html}</button>`;
  const say = (line,label='▶ 听一听') => btn('say:'+line,esc(label),'u6-voice');
  const imageButton = (action,name,label='') => btn(action,pic(name)+(label?`<span>${esc(label)}</span>`:''),'u6-img-choice');
  const restored = safeRead(savedKey(index));
  const bank = index===0?town:animals;
  const available = Array.from({length:index===0||index===1?bank.length:index===2?6:index===3||index===5?4:index===4?3:index===6?6:1},(_,i)=>i);
  function fresh(){return {mode:'learn',deck:index<=1||index===3||index===5||index===6?shuffle(available):[...available],pos:0,step:'open',assisted:false,anyHint:false,caption:false,choice:'',selected:'zebra',count:1,place:'park',stops:[],brief:Math.floor(Math.random()*commissions.length),options:[],feedback:'',roundHelp:0};}
  let s=fresh();
  if(restored && Array.isArray(restored.deck)&&restored.deck.length===available.length&&new Set(restored.deck).size===available.length&&restored.deck.every(n=>available.includes(n))&&restored.pos>=0&&restored.pos<=available.length&&['learn','play','done'].includes(restored.mode))s={...s,...restored};
  const persist = ()=>store(savedKey(index),s);
  const lang = (text)=>`<span lang="en">${esc(text)}</span>`;
  const deckId = ()=>s.deck[s.pos]??0;
  const brief = ()=>commissions[s.brief]??commissions[0];
  function tiles(target,others,size=3) {
    if(!s.options.length)s.options=shuffle([target,...shuffle(others.filter(n=>n!==target)).slice(0,size-1)]);
    return s.options;
  }
  function scene(name,inner,extra=''){return `<div class="u6-scene ${extra}" style="--u6-bg:url('${esc(art(name))}')">${inner}</div>`;}
  function photo(name,n,guest){
    const animalsInFrame = [...(guest ? [guest] : []), ...Array(n).fill(name)];
    return scene('meadow',animalsInFrame.map(animal=>pic(animal)).join(''),'u6-photo');
  }
  function vocabulary(list){return `<div class="u6-vocab">${list.map(name=>imageButton('word:'+name,name,name)).join('')}</div>`;}
  function look(name){const meta=words.find(w=>w.word===name||w.id===id(name));return meta?`<div class="u6-word-detail"><b lang="en">${esc(meta.word)}</b> ${say(meta.word,'▶ 听词')} ${say(meta.example,'▶ 听例句')}<p lang="en">${esc(meta.example)}</p><details><summary>看中文</summary>${esc(meta.zh)}</details></div>`:'';}
  function demo(){
    if(index<2)return vocabulary(bank)+(bank.includes(s.choice)?look(s.choice):'');
    if(index===2)return photo('zebra',s.count)+`<div class="u6-tools">${btn('dec','−')}${lang(String(s.count))}${btn('inc','＋')}${say(exists('zebra',s.count),exists('zebra',s.count))}</div>`;
    if(index===3){const q=questions[0];return scene('meadow',q.scene.map(n=>pic(n)).join(''),'u6-photo')+`<div class="u6-tools">${say(q.line,q.line)} ${say(q.answer,q.answer)}</div>`;}
    if(index===4)return vocabulary(destinations)+(destinations.includes(s.choice)?say(suggest(s.choice),suggest(s.choice)):'')+' '+say(reply,reply);
    if(index===5)return `<div class="u6-habitats">${habitats.map(([key,en,line,animal,zh])=>btn('say:'+line,pic(key,en)+`<span>${animal?pic(animal):''} ${lang(en)}</span><small>${esc(zh)}</small>`,'u6-habitat')).join('')}</div>`;
    if(index===6)return `<div class="u6-tools">${sounds.map(name=>btn('say:'+name,wordMeta(name),'u6-sound')).join('')}</div>`;
    return photo('elephant',1)+`<div class="u6-tools">${say(animalVisit('elephant',1),animalVisit('elephant',1))}${say(exists('elephant',1),exists('elephant',1))}</div>`;
  }
  function request(line,visible=false){
    return `<div class="u6-listen">${say(line,'▶ 听英语')}${visible?lang(line):btn('caption',s.caption?'收起英文':'查看英文','u6-caption')}${!visible&&s.caption?lang(line):''}</div>`;
  }
  const promptsPhoto=[['zebra',2],['elephant',1],['tiger',0],['giraffe',3],['tiger',1],['zebra',0]];
  function formScene(){return photo(s.selected,s.count)+`<div class="u6-editor"><div class="u6-choices">${albumAnimals.map(n=>`<button type="button" class="u6-btn u6-img-choice" data-u6="animal:${n}" aria-pressed="${n===s.selected}">${pic(n)}</button>`).join('')}</div><div class="u6-tools">${btn('dec','− 移走一只')}${s.count}${btn('inc','＋ 加一只')}${btn('submitPhoto','拍照','u6-primary')}</div></div>`;}
  function routeStops(){return `<div class="u6-stops">${s.stops.map(({name,n},i)=>`<article><small>Stop ${i+1}</small>${photo(name,n)}${say(animalVisit(name,n),animalVisit(name,n))}${say(exists(name,n),exists(name,n))}</article>`).join('')}</div>`;}
  function task(){
    const k=deckId();
    if(index<=1){
      const name=bank[k];
      return request(seek(name))+scene(index===0?'town':'meadow',tiles(name,bank,4).map(n=>imageButton('answer:'+n,n)).join(''),'u6-find')+(s.pos>0&&index===1?`<div class="u6-collection">${s.deck.slice(0,s.pos).map(n=>pic(bank[n])).join('')}</div>`:'');
    }
    if(index===2){
      const [name,n]=promptsPhoto[k];
      if(k<2)return request(exists(name,n))+formScene();
      if(k===2){
        const choices=tiles('zebra:1',['tiger:1','tiger:2']);
        return request(exists(negativeSubject,0)) + `<div class="u6-photo-choices">${choices.map(choice=>{
          const [species,count]=choice.split(':');
          return btn('negative:'+choice,photo(species,Number(count)));
        }).join('')}</div>`;
      }
      const answer=exists(name,n);
      return photo(name,n,n===0?'elephant':null)+`<div class="u6-choices">${tiles(answer,[exists(name,n===1?2:1),exists(name,n===0?2:0),exists(name,n===3?2:3)].filter((x,i,a)=>a.indexOf(x)===i)).map(x=>btn('answer:'+x,lang(x))).join('')}</div>`;
    }
    if(index===3){const q=questions[k];return request(q.line)+scene('meadow',q.scene.map(n=>pic(n)).join(''),'u6-photo')+`<div class="u6-choices">${tiles(q.answer,[q.pair,q.answer.startsWith('Yes')?(q.answer.endsWith('are.')?'Yes, there is.':'Yes, there are.'):(q.answer.includes('aren’t')?'No, there isn’t.':'No, there aren’t.')],3).map(x=>`<div class="u6-answer-audio">${say(x,'♫')}${btn('answer:'+x,lang(x))}</div>`).join('')}</div>`;}
    if(index===4){
      if(k<2){const place=['zoo','garden'][k];return request(suggest(place))+scene('town',tiles(place,destinations).map(n=>imageButton('answer:'+n,n)).join(''),'u6-find');}
      if(s.step==='open')return `<p>选一个你想去的地方。</p><div class="u6-choices">${destinations.map(n=>imageButton('destination:'+n,n,n)).join('')}</div>`;
      return pic(s.place)+`<p lang="en">Let's ${s.step==='verb'?'___': 'go to the'} ${s.step==='verb'?'the '+esc(s.place):'___'}.</p><div class="u6-choices">${(s.step==='verb'?['go to','goes to','going to']:destinations).map(x=>btn('build:'+x,lang(x))).join('')}</div>`;
    }
    if(index===5){const [key,,line]=habitats[k];return request(line)+`<div class="u6-habitats">${tiles(key,habitats.map(h=>h[0])).map(h=>btn('answer:'+h,pic(h,habitats.find(x=>x[0]===h)[1]),'u6-habitat')).join('')}</div>`;}
    if(index===6){const target=sounds[k];return `<div class="u6-tickets">${request(target)}<div class="u6-choices">${['train','cat'].map(n=>`<div class="u6-carriage">${say(n,'▶ '+n)}${btn('answer:'+n,'Board this train')}</div>`).join('')}</div></div>`;}
    if(s.step==='open'){const {name,n}=brief();return request(`Find ${n===1?single(name):names[n]+' '+name+'s'}.`)+formScene();}
    if(s.step==='add')return routeStops()+`<p>选下一站要看的动物，自己决定数量。</p>`+formScene();
    if(s.step==='describe'){const i=s.stops.length-1,{name,n}=s.stops[i];const a=exists(name,n);return photo(name,n)+`<p>给这一站配一句介绍。</p><div class="u6-choices">${tiles(a,[exists(name,n===1?2:1),exists(name,n===3?0:3)]).map(x=>btn('describe:'+x,lang(x))).join('')}</div>`;}
    return routeStops();
  }
  function souvenir(){
    const k=deckId();
    if(index<2)return pic(bank[k]);
    if(index===2){const [name,count]=promptsPhoto[k];return `<figure class="u6-snapshot">${photo(name,count,count===0?(k===2?'zebra':'elephant'):null)}<figcaption>Photo ${k+1}</figcaption></figure>`;}
    if(index===3)return scene('meadow',questions[k].scene.map(n=>pic(n)).join(''),'u6-photo');
    if(index===4){
      const place=k<2?['zoo','garden'][k]:s.place;
      return `<figure class="u6-arrival">${scene('town',pic('guide')+pic(place),'u6-photo')}<figcaption lang="en">${esc(place)}</figcaption></figure>${say(reply,reply)}`;
    }
    if(index===5){const [key,,line,animal]=habitats[k];return scene(key,animal?pic(animal):'','u6-photo')+say(line);}
    if(index===6)return `<div class="u6-sound">${wordMeta(sounds[k])}</div>`;
    return routeStops();
  }
  function correct(message,line){s.step='right';s.feedback=message;s.anyHint ||= s.assisted;if(line)speaker(line);render();}
  function retry(){s.feedback=index===2||index===7?'再看看动物和数量，重听后可以重新布置。':index===6?'再听参照词和车票，每个词中间的声音有什么不同？':'再听一次，看看英文说的是哪一个。';s.assisted=true;render();}
  function next(){
    s.pos++;
    if(s.pos>=s.deck.length){s.mode='done';persist();render();finish();return;}
    s.step='open';s.feedback='';s.caption=false;s.assisted=false;s.choice='';s.selected='zebra';s.count=1;s.options=[];
    render();
  }
  function render(){
    let content='';
    if(s.mode==='learn'){content=`<p>${intro[index]}</p>${demo()}<div class="u6-tools">${btn('begin','开始挑战 →','u6-primary')}</div>`;}
    else if(s.mode==='done'){
      const details=index===7?routeStops()+`<p>沿着自己的三站路线，试着给家人讲一次。</p>${btn('print','打印路线卡')}`:index===1?`<div class="u6-collection">${bank.map(n=>pic(n)).join('')}</div>`:'';
      content=`<h3>完成了！</h3><p>${s.anyHint?'本次使用了提示或重试。':'这轮挑战已完成。'}</p>${details}<div class="u6-tools">${btn('restart','再玩一次')}${btn('review','回到学习')}</div>`;
    }else {
      const pause=index<=1&&s.pos>0&&s.pos%4===0&&s.step==='open'&&s.roundHelp!==s.pos;
      if(pause)content=`<h3>这一小段走完了</h3><p>已找到 ${s.pos} 个，随时回来都能接着玩。</p>${btn('continue','出发下一段 →','u6-primary')}`;
      else if(s.step==='right'){
        content=`<div class="u6-success"><b>✓</b><p>${esc(s.feedback)}</p>${souvenir()}${btn('next',s.pos+1===s.deck.length?'完成挑战':'下一题 →','u6-primary')}</div>`;
      }else content=`<p>${tasks[index]}</p>${task()}<p class="u6-feedback" role="status">${esc(s.feedback)}</p>`;
    }
    const pose=s.mode==='done'||s.step==='right'?'guide-happy':s.feedback?'guide-encourage':s.mode==='learn'?'guide-point':index===3?'guide-think':'guide-listen';
    host.innerHTML=`<section class="u6-work"><div class="u6-work-head"><span lang="en">${pic(pose,'')} ${icon(index)} &nbsp;${stageNames[index]}</span><small>${s.mode==='learn'?'学习':s.mode==='done'?'已完成':(s.pos+1)+' / '+s.deck.length}</small></div>${content}</section>`;persist();
  }
  host.onclick = event=>{
    const button=event.target.closest('[data-u6]');if(!button||!host.contains(button))return;
    const [a,...tail]=button.dataset.u6.split(':');const v=tail.join(':');const k=deckId();
    if(a==='say'){speaker(v);return;}
    if(a==='word'){s.choice=v;speaker(index===4?suggest(v):v);render();return;}
    if(a==='begin'){s.mode='play';render();return;}
    if(a==='restart'||a==='review'){s=fresh();s.mode=a==='review'?'learn':'play';render();return;}
    if(a==='next'){next();return;}
    if(a==='continue'){s.roundHelp=s.pos;render();return;}
    if(a==='caption'){s.caption=!s.caption;s.assisted=true;render();return;}
    if(a==='animal'){s.selected=v;if(s.count===0)s.count=1;render();return;}
    if(a==='inc'||a==='dec'){s.count=Math.max(0,Math.min(3,s.count+(a==='inc'?1:-1)));render();return;}
    if(a==='destination'){s.place=v;s.step='verb';render();return;}
    if(a==='build'){
      if(v!==(s.step==='verb'?'go to':s.place)){retry();return;}
      if(s.step==='verb'){s.step='noun';s.feedback='';render();return;}
      correct(suggest(s.place)+' '+reply,suggest(s.place));return;
    }
    if(a==='negative'){
      if(v!=='zebra:1'){retry();return;}
      const line=exists(negativeSubject,0);
      correct(line,line);return;
    }
    if(a==='submitPhoto'){
      if(index===2){const [name,n]=promptsPhoto[k];if(s.count!==n||(n&&name!==s.selected)){retry();return;}correct(exists(name,n),exists(name,n));return;}
      if(s.step==='open'&&(s.selected!==brief().name||s.count!==brief().n)){retry();return;}
      if(!s.count){s.feedback='这一次要介绍看得见的动物，请至少加一只。';render();return;}
      s.stops.push({name:s.selected,n:s.count});s.step='describe';s.options=[];s.feedback='';render();return;
    }
    if(a==='describe'){
      const stop=s.stops[s.stops.length-1],line=exists(stop.name,stop.n);if(v!==line){retry();return;}
      if(s.stops.length===3){correct('三站安排好了，试着介绍自己的路线。',line);return;}
      s.step='add';s.options=[];s.feedback='';s.count=1;s.selected='giraffe';speaker(line);render();return;
    }
    if(a==='print'){window.print();return;}
    if(a==='answer'){
      let target,spoken;
      if(index<=1)target=bank[k];
      if(index===2)target=exists(...promptsPhoto[k]);
      if(index===3)target=questions[k].answer;
      if(index===4){target=['zoo','garden'][k];spoken=suggest(target);}
      if(index===5){target=habitats[k][0];spoken=habitats[k][2];}
      if(index===6){target=k<4?'train':'cat';spoken=sounds[k];}
      if(v!==target){retry();return;}
      const message=index===6?`${sounds[k]} · ${target}`:spoken||target;
      correct(message,spoken||target);
    }
  };
  render();
  return ()=>{host.onclick=null;};
}
