import {starters,eevee,pokemonArt,pokemonForm} from './pokemon-catalog.mjs?v=4';
import {sfx} from './sticker-fx.mjs?v=2';

const cloud=window.PowerUpCloud;
const map=document.getElementById('pokemon-map');
const mapHome=document.getElementById('pokemonMapHome');
const mapDialog=document.getElementById('pokemonMapDialog');
const mapToggle=document.getElementById('pokemonMapToggle');
const scene=map.querySelector('.pokemon-hero-scene');
const layer=document.getElementById('pokemonMapMarkers');
const preview=document.getElementById('pokemonHeroFriends');
const count=document.getElementById('pokemonMapCount');
const message=document.getElementById('pokemonMapMessage');
const dragHint=document.getElementById('pokemonMapDragHint');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Each claim keeps the same spot even after evolving or changing its sticker cover.
const locations={
 21:[17,59,'花园'],22:[49,57,'岩地'],23:[83,64,'水边'],
 24:[13,26,'林间'],25:[36,25,'林间'],26:[62,26,'林间'],27:[86,29,'林间'],
 28:[15,82,'林间'],29:[39,83,'林间'],30:[62,82,'林间'],31:[85,83,'林间']
};
const playMoves=['hop','twirl','wiggle'];
const playLines={
 hop:'开心地原地跳了两下！',
 twirl:'转了个俏皮的小圈圈！',
 wiggle:'摇摇身子向你打招呼！'
};
const markers=new Map();
let familyId=null;
let activeMotion=null;
let announcement='';
let drag=null,saving=null,suppressClick=null,bypassInterceptOnce=false;
let greetedClaimId=null,greetTimer=null,playCounter=0;
const savedPositions=new Map();

function setText(element,text){
 if(element.textContent!==text)element.textContent=text;
}
function clearGreet(){
 clearTimeout(greetTimer);
 greetTimer=null;
 if(greetedClaimId){
  const prev=markers.get(greetedClaimId);
  if(prev)delete prev.dataset.greeted;
  greetedClaimId=null;
 }
}
function markerContent(marker,form){
 marker.innerHTML=`<span class="pokemon-map-figure">${pokemonArt(form)}</span><span class="pokemon-map-name">${form.name}</span>`;
 marker.dataset.formId=form.id;
 marker.dataset.tone=form.tone||'leaf';
 marker.dataset.charm=form.charm||'paw';
 marker.setAttribute('aria-label','轻点互动或查看'+form.name);
}
function cancelMotion(){
 if(!activeMotion)return;
 const {marker,form,timer,revealTimer,stopAudio}=activeMotion;
 clearTimeout(timer);
 clearTimeout(revealTimer);
 if(typeof stopAudio==='function')stopAudio();
 delete marker.dataset.movement;
 markerContent(marker,form);
 activeMotion=null;
}
function place(marker,x,y){
 marker.style.setProperty('--map-x',x/10+'%');
 marker.style.setProperty('--map-y',y/10+'%');
 marker.dataset.posX=String(x);
 marker.dataset.posY=String(y);
}
function resetDrag(){
 if(!drag)return;
 const {marker,points}=drag;
 drag=null;
 delete marker.dataset.dragging;
 for(const id of points.keys())if(marker.hasPointerCapture(id))marker.releasePointerCapture(id);
}
function expandMap(){
 if(mapDialog.open)return;
 mapHome.style.minHeight=mapHome.getBoundingClientRect().height+'px';
 mapDialog.append(map);
 mapToggle.setAttribute('aria-expanded','true');
 setText(mapToggle,'收起地图');
 mapDialog.showModal();
}
mapToggle.addEventListener('click',()=>{
 if(mapDialog.open)mapDialog.close();
 else expandMap();
});
scene.addEventListener('click',event=>{
 if(event.target.closest('.pokemon-map-marker')||pickMarkerAtPoint(event.clientX,event.clientY))return;
 const previewFriend=event.target.closest('.pokemon-preview-friend');
 if(previewFriend){
  triggerPreviewHop(previewFriend);
  return;
 }
 expandMap();
});
mapDialog.addEventListener('close',()=>{
 if(drag)applyScale(drag.marker,drag.initialScale);
 resetDrag();
 clearGreet();
 mapHome.append(map);
 mapHome.style.removeProperty('min-height');
 mapToggle.setAttribute('aria-expanded','false');
 setText(mapToggle,'放大地图');
 renderPokemonMap(cloud.state().snapshot);
 mapToggle.focus({preventScroll:true});
});
function positionInMap(marker,clientX,clientY){
 const bounds=layer.getBoundingClientRect();
 const button=marker.getBoundingClientRect();
 function coordinate(pixel,length,padding){
  const inset=Math.min(length/2,padding);
  return Math.round(Math.min(length-inset,Math.max(inset,pixel))/length*1000);
 }
 return {
  x:coordinate(clientX-bounds.left,bounds.width,button.width/2+3),
  y:coordinate(clientY-bounds.top,bounds.height,button.height/2+3)
 };
}
function canMove(){
 const state=cloud.state();
 return state.status==='connected'&&!state.busy&&!saving;
}
async function savePosition(marker,position){
 const id=marker.dataset.claimId;
 const placement={id,family:familyId};
 saving=placement;
 const name=marker.querySelector('.pokemon-map-name').textContent;
 announcement='正在保存'+name+'的位置…';
 setText(message,announcement);
 try{
  const result=await cloud.movePokemon(id,position.x,position.y);
  if(saving!==placement)return;
  savedPositions.set(id,result);
  announcement=name+'换好位置啦！';
 }catch{
  await cloud.refresh().catch(()=>{});
  if(saving!==placement)return;
  const latest=cloud.state().snapshot?.pokemon_claims?.find(claim=>claim.id===id);
  announcement=latest?.map_x===position.x&&latest?.map_y===position.y
   ?name+'换好位置啦！'
   :'位置暂未保存，可以再拖一次。';
 }finally{
  if(saving===placement){
   saving=null;
   if(placement.family===familyId)renderPokemonMap(cloud.state().snapshot);
  }
 }
}
const minScale=.75,maxScale=2.5;
function scaleKey(marker){return 'powerup-map-size:'+familyId+':'+marker.dataset.claimId}
function loadScale(marker){
 try{
  const stored=Number(localStorage.getItem(scaleKey(marker)));
  if(stored>=minScale&&stored<=maxScale)return stored;
 }catch{}
 return 1;
}
function applyScale(marker,scale){marker.style.setProperty('--map-scale',String(scale))}
function distance(points){
 const [a,b]=points.values();
 return Math.hypot(a.x-b.x,a.y-b.y);
}
function popCharmBubble(container,charmName){
 if(reducedMotion.matches||!container||!charmName)return;
 container.querySelector('.pokemon-map-charm')?.remove();
 const bubble=document.createElement('span');
 bubble.className='pokemon-map-charm';
 bubble.setAttribute('aria-hidden','true');
 bubble.innerHTML=`<img src="assets/pokemon/${esc(charmName)}.webp" width="56" height="56" alt="">`;
 container.append(bubble);
 setTimeout(()=>bubble.remove(),960);
}
function triggerPreviewHop(el){
 const name=el.dataset.name||'宝可梦',charm=el.dataset.charm||'paw',tone=el.dataset.tone||'leaf';
 sfx.mapHop(tone);
 if(!reducedMotion.matches){
  delete el.dataset.play;
  void el.offsetWidth;
  el.dataset.play=playMoves[(playCounter++)%playMoves.length];
  popCharmBubble(el,charm);
  setTimeout(()=>{delete el.dataset.play;},820);
 }
 setText(message,`${name}开心地跳了两下！连接家庭领养伙伴后，它们会真正住进这里。`);
}
function pickMarkerAtPoint(clientX,clientY,fallback=null){
 if(!clientX&&!clientY)return fallback;
 // 1. Direct hit on a visible name pill always wins
 for(const marker of markers.values()){
  const pill=marker.querySelector('.pokemon-map-name');
  if(!pill)continue;
  const r=pill.getBoundingClientRect();
  if(clientX>=r.left&&clientX<=r.right&&clientY>=r.top&&clientY<=r.bottom)return marker;
 }
 // 2. Closest figure center among markers whose figure/button box contains the point
 let best=null,bestDist=Infinity;
 for(const marker of markers.values()){
  const box=marker.getBoundingClientRect();
  if(clientX<box.left||clientX>box.right||clientY<box.top||clientY>box.bottom)continue;
  const fig=marker.querySelector('.pokemon-map-figure')?.getBoundingClientRect()||box;
  const d=Math.hypot(clientX-(fig.left+fig.width/2),clientY-(fig.top+fig.height/2));
  if(d<bestDist){bestDist=d;best=marker;}
 }
 return best||fallback;
}
function triggerMarkerPlay(marker){
 const claimId=marker.dataset.claimId;
 const stickerId=marker.dataset.id;
 const name=marker.querySelector('.pokemon-map-name')?.textContent||'伙伴';
 const charm=marker.dataset.charm||'paw';
 const tone=marker.dataset.tone||'leaf';
 const figure=marker.querySelector('.pokemon-map-figure');
 const move=playCounter%3===0?'hop':playMoves[playCounter%playMoves.length];
 playCounter++;

 clearGreet();
 greetedClaimId=claimId;
 marker.dataset.greeted='true';
 sfx.mapHop(tone);

 if(!reducedMotion.matches&&figure){
  clearTimeout(marker._playTimer);
  delete marker.dataset.play;
  void figure.offsetWidth;
  marker.dataset.play=move;
  popCharmBubble(figure,charm);
  marker._playTimer=setTimeout(()=>{delete marker.dataset.play;},800);
 }

 message.innerHTML=`<span>${esc(name)}${playLines[move]}再轻点它一次打开详情，或 </span><button type="button" class="pokemon-map-open-pill" data-pk="open" data-id="${esc(stickerId)}">查看${esc(name)}词卡 ↗</button>`;
 greetTimer=setTimeout(()=>{
  if(greetedClaimId===claimId){
   clearGreet();
   if(!activeMotion)setText(message,'点地图上的伙伴互动跳跃，连点两次看看一起学过的词。');
  }
 },4600);
}

scene.addEventListener('pointerdown',event=>{
 const rawMarker=event.target.closest('.pokemon-map-marker');
 const marker=rawMarker?pickMarkerAtPoint(event.clientX,event.clientY,rawMarker):null;
 const point={x:event.clientX,y:event.clientY};
 if(drag){
  if(event.pointerType!=='touch'||drag.type!=='touch'||drag.points.size!==1||drag.pinched)return;
  drag.points.set(event.pointerId,point);
  drag.marker.setPointerCapture(event.pointerId);
  drag.span=Math.max(1,distance(drag.points));
  drag.pinched=true;
  drag.marker.dataset.dragging='true';
  suppressClick=drag.marker;
  return;
 }
 if(!marker||!event.isPrimary||event.button!==0||!canMove())return;
 suppressClick=null;
 const box=marker.getBoundingClientRect();
 const scale=Number(marker.style.getPropertyValue('--map-scale'))||1;
 drag={marker,type:event.pointerType,points:new Map([[event.pointerId,point]]),start:point,
  offsetX:point.x-box.left-box.width/2,offsetY:point.y-box.top-box.height/2,position:null,scale,initialScale:scale};
 marker.setPointerCapture(event.pointerId);
});
layer.addEventListener('pointermove',event=>{
 if(!drag?.points.has(event.pointerId))return;
 const {marker,points}=drag;
 points.set(event.pointerId,{x:event.clientX,y:event.clientY});
 if(drag.pinched){
  if(points.size===2){
   drag.scale=Math.min(maxScale,Math.max(minScale,drag.initialScale*distance(points)/drag.span));
   applyScale(marker,drag.scale);
  }
  return;
 }
 if(!drag.position&&Math.hypot(event.clientX-drag.start.x,event.clientY-drag.start.y)<6)return;
 if(activeMotion?.marker===marker)cancelMotion();
 clearGreet();
 drag.position=positionInMap(marker,event.clientX-drag.offsetX,event.clientY-drag.offsetY);
 marker.dataset.dragging='true';
 place(marker,drag.position.x,drag.position.y);
});
layer.addEventListener('pointerup',event=>{
 if(!drag?.points.has(event.pointerId))return;
 drag.points.delete(event.pointerId);
 if(drag.points.size)return;
 const {marker,position,pinched,scale}=drag;
 resetDrag();
 if(pinched){
  try{localStorage.setItem(scaleKey(marker),String(scale))}catch{}
 }
 if(pinched||position)suppressClick=marker;
 if(position)savePosition(marker,position);
});
function cancelDrag(event){
 if(!drag?.points.has(event.pointerId))return;
 applyScale(drag.marker,drag.initialScale);
 resetDrag();
 renderPokemonMap(cloud.state().snapshot);
}
layer.addEventListener('pointercancel',cancelDrag);
layer.addEventListener('lostpointercapture',cancelDrag);
layer.addEventListener('click',event=>{
 if(bypassInterceptOnce){bypassInterceptOnce=false;return;}
 if(event.detail!==0&&suppressClick){
  suppressClick=null;
  event.preventDefault();
  event.stopPropagation();
  return;
 }
 if(activeMotion)return;
 const rawMarker=event.target.closest('.pokemon-map-marker');
 const marker=event.detail===0?rawMarker:pickMarkerAtPoint(event.clientX,event.clientY,rawMarker);
 if(!marker)return;
 // First non-drag tap plays joyful habitat hop on THIS exact partner; second tap opens its detail dialog!
 if(greetedClaimId===marker.dataset.claimId){
  clearGreet();
  if(marker!==rawMarker){
   event.preventDefault();
   event.stopPropagation();
   bypassInterceptOnce=true;
   marker.click();
  }
  return;
 }
 event.preventDefault();
 event.stopPropagation();
 triggerMarkerPlay(marker);
},true);
const directions={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]};
layer.addEventListener('keydown',event=>{
 const marker=event.target.closest('.pokemon-map-marker');
 const direction=directions[event.key];
 if(!marker||!direction)return;
 event.preventDefault();
 if(event.repeat||!canMove()||drag)return;
 const box=marker.getBoundingClientRect();
 const position=positionInMap(marker,box.left+box.width/2+direction[0],box.top+box.height/2+direction[1]);
 place(marker,position.x,position.y);
 savePosition(marker,position);
});
export function renderPokemonMap(snapshot){
 const nextFamily=snapshot?.wallet.id||null;
 if(nextFamily!==familyId){
  familyId=nextFamily;
  announcement='';
  clearGreet();
  resetDrag();
  saving=null;
  suppressClick=null;
  savedPositions.clear();
  cancelMotion();
  markers.clear();
  layer.replaceChildren();
 }
 const records=snapshot?.pokemon_claims||[];
 const visible=new Set(records.map(claim=>claim.id));
 for(const [id,marker] of markers){
  if(visible.has(id))continue;
  if(activeMotion?.marker===marker)cancelMotion();
  if(drag?.marker===marker)resetDrag();
  if(greetedClaimId===id)clearGreet();
  savedPositions.delete(id);
  marker.remove();
  markers.delete(id);
 }
 for(const claim of records){
  let marker=markers.get(claim.id);
  if(!marker){
   marker=document.createElement('button');
   marker.type='button';
   marker.className='pokemon-map-marker';
   marker.dataset.pk='open';
   marker.dataset.id=String(claim.sticker_id);
   marker.dataset.claimId=claim.id;
   // Staggered breathing phase & tempo per partner for organic living micro-ecology
   marker.style.setProperty('--breath-delay',`-${((claim.sticker_id*0.73)%3.4).toFixed(2)}s`);
   marker.style.setProperty('--breath-duration',`${(3.1+(claim.sticker_id%4)*0.32).toFixed(2)}s`);
   applyScale(marker,loadScale(marker));
   marker.setAttribute('aria-keyshortcuts','ArrowLeft ArrowRight ArrowUp ArrowDown');
   markers.set(claim.id,marker);
   layer.append(marker);
  }
  if(drag?.marker!==marker&&saving?.id!==claim.id){
   const saved=savedPositions.get(claim.id);
   const waiting=saved&&Number(snapshot.version)<Number(saved.version);
   if(saved&&!waiting)savedPositions.delete(claim.id);
   const position=waiting?saved:claim;
   const [x,y]=locations[claim.sticker_id];
   place(marker,position.map_x??x*10,position.map_y??y*10);
  }
  const form=pokemonForm(claim);
  if(marker.dataset.formId!==form.id){
   if(activeMotion?.marker===marker)cancelMotion();
   markerContent(marker,form);
  }
 }
 dragHint.hidden=records.length===0;
 preview.hidden=!!snapshot;
 if(!snapshot&&!preview.firstElementChild){
  preview.innerHTML=[...starters.map(s=>s.forms[0]),eevee].map((form,idx)=>
   `<button type="button" class="pokemon-preview-friend" data-name="${esc(form.name)}" data-charm="${esc(form.charm)}" data-tone="${esc(form.tone)}" style="--breath-delay:-${(idx*0.85).toFixed(2)}s;--breath-duration:${(3.2+idx*0.25).toFixed(2)}s" aria-label="和${esc(form.name)}打招呼">${pokemonArt(form)}</button>`
  ).join('');
 }
 setText(count,snapshot?`${records.length} / 11 位伙伴`:'地图预览');
 if(!greetedClaimId){
  setText(message,announcement||(snapshot
   ?records.length?'轻点地图上的伙伴看它开心跳跃，连点两次打开单词卡。':'领养第一位伙伴，它就会来到这里。'
   :'轻点草地上的伙伴打个招呼；连接家庭后，领养的伙伴会住进这张地图。'));
 }
}
export async function showPokemonMapMoment(claim,before=null){
 const marker=markers.get(claim.id);
 if(!marker)return;
 clearGreet();
 cancelMotion();
 const form=pokemonForm(claim);
 const habitat=locations[claim.sticker_id][2];
 const finished=before?`恭喜！${before.name}进化成${form.name}了！`:`${form.name}来到${habitat}啦！`;
 if(!mapDialog.open)map.scrollIntoView({block:'nearest'});
 marker.focus({preventScroll:true});
 if(reducedMotion.matches){
  announcement=finished;
  setText(message,finished);
  return;
 }

 const motion={marker,form,timer:null,revealTimer:null,stopAudio:null};
 activeMotion=motion;
 const old=before?pokemonArt(before,'pokemon-map-before'):'';
 const flash=before?'<span class="pokemon-evolve-flash" aria-hidden="true"></span>':'';
 marker.querySelector('.pokemon-map-figure').innerHTML=old+pokemonArt(form,'pokemon-map-after')+flash;
 if(before)marker.querySelector('.pokemon-map-name').textContent='什么？'+before.name+'…';
 marker.dataset.movement='preparing';
 announcement=before?`什么？${before.name}的身体发出了耀眼的白光…`:finished;
 setText(message,announcement);
 const frames=[...marker.querySelectorAll('img')];
 frames.forEach(img=>img.loading='eager');
 await Promise.allSettled(frames.map(img=>img.decode()));
 if(activeMotion!==motion)return;
 marker.dataset.movement=before?'evolving':'arriving';
 if(before){
  motion.stopAudio=sfx.pokemonEvolveSequence();
  motion.revealTimer=setTimeout(()=>{
   if(activeMotion!==motion)return;
   const badge=marker.querySelector('.pokemon-map-name');
   if(badge)badge.textContent='✧ '+form.name;
   announcement=finished;
   setText(message,finished);
  },2180);
 }else{
  sfx.mapHop(form.tone);
 }
 motion.timer=setTimeout(()=>{
  if(activeMotion!==motion)return;
  cancelMotion();
  announcement=finished;
  setText(message,finished);
 },before?2860:920);
}
