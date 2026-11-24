import {words} from './words.mjs';
import {speak as play, stop, setRate} from './voice.mjs';
import {startActivity} from './activities.mjs';

const stops = [
  ['street','街道找一找','听指令，在街上找东西','bus','#eee6cd'],
  ['animals','动物观察员','听名字，寻找动物','giraffe','#e4ecda'],
  ['photo','给动物拍合影','摆出正确的动物和数量','zebra','#f0e4cf'],
  ['map','长颈鹿问一问','看看这里有什么','motorbike','#e2e9ef'],
  ['next','商量下一站','用英语提议去哪里','train','#e9e6d5'],
  ['habitats','动物的家','听线索，找栖息地','polar-bear','#dce8ec'],
  ['sounds','声音小火车','听一听，找相同的音','snake','#e6ebd6'],
  ['tour','我来当小导游','安排三站，介绍路线','zoo','#f1e3d2']
];
const book = [
  ["Let's go to the zoo.",'我们一起去动物园吧。'],
  ["There are two zebras. There aren't any tigers here.",'这里有两只斑马，没有老虎。'],
  ["Let's look at the giraffe. That's a good idea.",'我们一起去看长颈鹿吧。好主意。'],
  ['What a lovely day!','多么美好的一天！']
];
const root=document.querySelector('#lesson');
const art=id=>new URL('./art/'+id+'.webp',import.meta.url).href;
const progressKey='powerup-unit6-visits-v1';
let visited=new Set();
try {
  const items=JSON.parse(localStorage.getItem(progressKey)||'[]');
  if(Array.isArray(items)) visited=new Set(items.filter(id=>stops.some(([key])=>key===id)));
} catch {}
let exitActivity, playback=0;
const stopButton=document.querySelector('#stop-audio'), message=document.querySelector('#audio-message');
function silence(){
  playback++; stop(); stopButton.hidden=true; message.textContent='';
}
async function speak(line){
  const token=++playback;
  stopButton.hidden=false; message.textContent='正在播放';
  const ok=await play(line);
  if(token===playback){
    stopButton.hidden=true;
    message.textContent=ok?'':'播放未完成，可再点一次。';
  }
  return ok;
}
stopButton.onclick=silence;
window.addEventListener('pagehide',silence);
function home(){
  const next=stops.find(([id])=>!visited.has(id))||stops[0];
  root.innerHTML=`<section class="cover"><div class="cover-copy"><span class="eyeline" lang="en">Unit 6 · Power Up</span><h1 lang="en">A day out</h1><h2>长颈鹿的出游手记</h2><p>带上望远镜，和长颈鹿去找动物吧。</p><a class="start" href="#${next[0]}">${visited.size?'继续出游':'一起出发'} →</a></div><img class="cover-guide" src="${art('guide')}" alt="毛绒长颈鹿向导"></section>
  <div class="section-bar"><h2>今天想去哪里？</h2><span>${visited.size} / 8 站已完成</span></div>
  <nav class="stations" aria-label="出游活动">${stops.map(([id,name,desc,img,color])=>`<a class="station" href="#${id}" style="--wash:${color}"><img src="${art(img)}" alt=""><strong>${name}</strong><small>${desc}</small>${visited.has(id)?'<span class="stamp" aria-label="已完成">✓</span>':''}</a>`).join('')}</nav><a class="story-link" href="#book">一起读绘本 · A lovely day ↗</a>`;
}
function navigation(id){
  return `<nav class="subnav"><a href="#home">← 出游地图</a><select id="stop-select" aria-label="选择活动">${[...stops,['book','出游绘本']].map(([key,label])=>`<option value="${key}" ${key===id?'selected':''}>${label}</option>`).join('')}</select></nav>`;
}
function showBook(i=0){
  const [line,cn]=book[i];
  root.innerHTML=navigation('book')+`<h1 class="activity-title">A lovely day</h1><article class="book"><img src="${art('story-'+(i+1))}" alt="出游手记第 ${i+1} 幅插画"><h2 lang="en">${line}</h2><details><summary>看中文</summary><p>${cn}</p></details><div class="book-controls"><button id="read">▶ 听这一页</button><button id="prev" ${i?'':'disabled'}>← 上一页</button><span>${i+1} / 4</span><button id="next" ${i===3?'disabled':''}>下一页 →</button></div>${i===3?`<h3>How do you feel?</h3><div class="book-controls">${['happy','tired','excited'].map(m=>`<button data-mood="${m}">I feel ${m}.</button>`).join('')}</div>`:''}</article>`;
  selectListener();
  document.querySelector('#read').onclick=()=>speak(line);
  for(const [key,step] of [['prev',-1],['next',1]]) document.querySelector('#'+key).onclick=()=>{silence();showBook(i+step)};
  for(const btn of root.querySelectorAll('[data-mood]')) btn.onclick=()=>speak(btn.textContent);
}
function selectListener(){
  document.querySelector('#stop-select').onchange=e=>location.hash=e.target.value;
}
function route(){
  if(typeof exitActivity==='function') exitActivity();
  exitActivity=null; silence();
  const id=location.hash.slice(1), index=stops.findIndex(([key])=>key===id);
  if(id==='book') showBook();
  else if(index<0) home();
  else{
    root.innerHTML=navigation(id)+`<h1 class="activity-title">${stops[index][1]}</h1><section id="activity-host"></section>`;
    selectListener();
    const finish=()=>{
      visited.add(id);
      try{localStorage.setItem(progressKey,JSON.stringify([...visited]));}catch{}
    };
    exitActivity=startActivity(index,document.querySelector('#activity-host'),{speak,finish,art,words});
  }
  window.scrollTo(0,0);
}
if(location.hostname.endsWith('.chatgpt.site')) document.querySelector('#drawer').href='../words?unit=6';
const speed=document.createElement('select');
speed.setAttribute('aria-label','朗读语速');
speed.innerHTML='<option value="1">自然语速</option><option value="0.85">慢一点</option>';
speed.onchange=()=>setRate(Number(speed.value));
stopButton.before(speed);
window.addEventListener('hashchange',route);route();
