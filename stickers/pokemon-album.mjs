import {renderPokemonMap,showPokemonMapMoment} from './pokemon-map.mjs?v=8';
import {eligibleStickers,stickerRewardState} from './sticker-rewards.mjs?v=1';
import {VOCABULARY,RETIRED_VOCABULARY} from '../words-data.mjs?v=9';
import {loadVocabularyVoice} from '../vocabulary-voice.mjs?v=4';
import {starters,starterFor,eevee,evolutions,stageOf,pokemonForm,pokemonArt} from './pokemon-catalog.mjs?v=4';
import {playPeelAndStickCeremony} from './sticker-fx.mjs?v=2';

const cloud=window.PowerUpCloud;
const $=selector=>document.querySelector(selector);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byWord=new Map([...VOCABULARY,...RETIRED_VOCABULARY].map(w=>[w.key,w]));
const dialog=$('#pokemonDialog'),detail=$('#pokemonDetail'),voiceStatus=$('#pokemonVoice');
const snapshot=()=>cloud.state().snapshot;
const claims=()=>snapshot()?.pokemon_claims||[];
const getClaim=id=>claims().find(c=>c.sticker_id===id);
// The claim API uses 24 to start any new Eevee, but 24 is also the first owned Eevee.
const eeveeClaimTarget=24;
const newEevee='new-eevee';
const pendingEevee=()=>claims().find(c=>c.sticker_id>=eeveeClaimTarget&&!c.eevee_form);
const group=()=>snapshot()?.pending_groups[0];
const canWrite=()=>cloud.state().status==='connected'&&!cloud.state().busy;
const button=(action,text,disabled=false,attrs='')=>`<button type="button" class="primary" data-pk="${action}" ${disabled?'disabled':''} ${attrs}>${text}</button>`;
const stageNames=['初遇','首次进化','终极进化'];
let opened=null,confirmation=null,detailSignature='',editionSignature='',lastFamily=snapshot()?.wallet.id;
let latestClaimId=null;
let voiceReady,audio=new Audio(),voiceToken=0,objectUrl;

function setEdition(){
 const pokemon=['#pokemon','#pokemon-collection','#pokemon-owned','#pokemon-map','#pokemon-eevee-family'].includes(location.hash);
 $('#starEdition').hidden=pokemon;
 $('#pokemonEdition').hidden=!pokemon;
 $('#editionStar').toggleAttribute('aria-current',!pokemon);
 $('#editionPokemon').toggleAttribute('aria-current',pokemon);
 (pokemon?$('#editionPokemon'):$('#editionStar')).setAttribute('aria-current','page');
 if(pokemon)render();
 else $('#pokemonMapDialog').close();
}
function words(keys){
 return `<div class="pokemon-words">${keys.map(key=>{
  const w=byWord.get(key);
  return `<div class="pokemon-word"><b lang="en">${esc(w?.word||key)}</b><span>${esc(w?.zh||'家长已确认')}</span>${w?`<button type="button" class="pokemon-listen" data-pk="listen" data-key="${esc(key)}" aria-label="点读 ${esc(w.word)}">♪</button>`:''}</div>`;
 }).join('')}</div>`;
}
function render(){
 const f=snapshot(),records=claims(),eeveeCount=records.filter(c=>c.eevee_form).length;
 const exchangeCount=eligibleStickers(f).length;
 const signature=JSON.stringify([records,group(),f?.wallet.id,f?.wallet_enabled,exchangeCount,cloud.state().status,f?.first_count,latestClaimId]);
 if(signature!==editionSignature){
  editionSignature=signature;
  renderPokemonMap(f);
  renderOwned(records,f);
  const exchange=$('#pokemonExchange');
  exchange.hidden=f?.wallet_enabled!==true;
  if(!exchange.hidden){
   const progress=exchangeCount>=3?'可以选 3 张兑换':`还差 ${3-exchangeCount} 张已进化贴纸`;
   exchange.innerHTML=`<section class="pokemon-exchange"><div><h2>星光兑换站</h2><p>星光和宝可梦贴纸可以混选，3 张换 5 枚枝枝币。</p><strong>${exchangeCount} 张可兑换 · ${progress}</strong></div><button type="button" class="primary" data-action="exchange">选贴纸去兑换</button></section>`;
  }
  const next=group(),remaining=3-(f?.first_count||0)%3;
  const pocket=!f?`<div><strong>先看看伙伴的成长路线</strong><p>点开贴纸看看角色和进化形态。连接家庭后，可以用学过的词领养。</p></div><button class="secondary" data-family-open>登录／连接家庭</button>`:
   next?`<div><strong>你的 3 个词准备好了</strong><p>点一位新伙伴，或挑一位已进化的御三家继续培养。</p></div>${words(next.word_keys)}`:
   `<div><strong>再掌握 ${remaining} 个新词</strong><p>学完后，请家长在单词抽屉确认。</p></div><a class="secondary" href="../words.html?unit=all">去单词抽屉 →</a>`;
  $('#pokemonPocket').innerHTML=`<div class="pokemon-pocket">${pocket}</div>`;
  $('#pokemonStarters').innerHTML=starters.map(s=>{
   const c=getClaim(s.id),stage=stageOf(c),f=c?pokemonForm(c,true):s.forms[0];
   const status=!c?'等待领养':c.final_at?'终极进化完成':c.final_word_keys?`综合复习 ${c.final_reviews.length} / 6`:c.upgraded_at?'可以继续培养':`复习 ${c.reviews.length} / 3`;
   return `<button type="button" class="pokemon-starter tone-${f.tone} ${c?'is-collected':'uncollected'}" data-pk="open" data-id="${s.id}">${pokemonArt(f)}<div class="pokemon-card-copy"><strong>${s.forms[stage].name}</strong>${c?'<span class="pokemon-owned-stamp">✓ 已收藏</span>':''}<span>${status}${c?.redeemed_entry_id?' · 已兑换':''}</span><ol class="pokemon-track">${s.forms.map((x,i)=>`<li class="${c&&i<=stage?'reached':''}">${x.name}</li>`).join('')}</ol></div></button>`;
  }).join('');
  $('#eeveeCount').textContent=`已收集 ${eeveeCount} / 8`;
  const pending=pendingEevee(),complete=eeveeCount===8;
  const eeveeTitle=complete?'伊布家族集齐啦':pending?'正在陪伊布长大':'认识一只新的伊布';
  const eeveeHint=complete?'点开任一伙伴，回顾一起学过的词。':pending?(pending.reviews.length===3?'复习完成，去选一个进化方向。':`已复习 ${pending.reviews.length} / 3 个词`):'用一组新的 3 个词领养，复习通过后挑选进化方向。';
  const eeveeAction=complete?'':pending
   ?button('open',pending.reviews.length===3?'选择进化方向':'继续培养伊布',false,`data-id="${pending.sticker_id}"`)
   :button('adopt-eevee','领养新伊布');
  $('#pokemonEevee').innerHTML=`<div class="eevee-pending ${pending?'is-collected':'uncollected'}">${pokemonArt(eevee)}<div><strong>${eeveeTitle}</strong><p>${eeveeHint}</p></div>${eeveeAction}</div>`;
  $('#pokemonForms').innerHTML=evolutions.map(f=>{
   const c=records.find(x=>x.eevee_form===f.id);
   return `<button type="button" class="pokemon-form tone-${f.tone} ${c?'is-collected':'uncollected'}" data-pk="${c?'open':'preview'}" ${c?`data-id="${c.sticker_id}"`:`data-form="${f.id}"`}>${pokemonArt(f)}<strong>${f.name}</strong><small>${c?(c.redeemed_entry_id?'✓ 已兑换':'✓ 已收藏'):'待收集'}</small></button>`;
  }).join('');
 }
 if(opened!==null)renderDetail();
}
function renderOwned(records,f){
 const section=$('#pokemon-owned'),heroAction=$('#pokemonHeroAction');
 section.hidden=!f;
 heroAction.href=f?'#pokemon-owned':'#pokemon-collection';
 heroAction.textContent=f?`我的贴纸 · ${records.length} 张 ↓`:'去看宝可梦 ↓';
 if(!f){$('#pokemonOwnedCards').replaceChildren();return;}
 $('#pokemonOwnedCount').textContent=`已收藏 ${records.length} / 11`;
 $('#pokemonOwnedCards').innerHTML=records.length?`<div class="pokemon-owned-grid">${[...records].reverse().map(claim=>{
  const form=pokemonForm(claim,true),current=pokemonForm(claim),reward=stickerRewardState(claim);
  const status=f.wallet_enabled?({eligible:'可兑换枝枝币',redeemed:'已兑换',pending:'进化后可兑换'})[reward]:'已收入贴纸册';
  const stampLabel=claim.id===latestClaimId||!claim.upgraded_at?'✦ 初遇纪念':'✓ 已收藏';
  return `<button type="button" class="pokemon-owned-card tone-${form.tone} ${claim.id===latestClaimId?'is-new':''}" data-pk="open" data-id="${claim.sticker_id}"><span class="pokemon-owned-stamp">${stampLabel}</span>${pokemonArt(form)}<strong>${form.name}</strong><small>${form!==current?'已进化至 '+current.name+' · ':''}${status}</small></button>`;
 }).join('')}</div>`:'<div class="pokemon-owned-empty">学会 3 个新词，领养的第一位伙伴会贴在这里。</div>';
}
function reviewList(keys,reviews,action){
 const parent=snapshot()?.member.role==='parent';
 return `<div class="word-review-list">${keys.map(key=>{
  const w=byWord.get(key),done=reviews.find(r=>r.word_key===key);
  return `<div class="word-review"><span><b lang="en">${esc(w?.word||key)}</b><small>${esc(w?.zh||'')}</small></span><button type="button" data-pk="${action}" data-key="${esc(key)}" class="${done?'reviewed':''}" ${done||!parent||!canWrite()?'disabled':''}>${done?'✓ 已通过':parent?'确认通过':'请家长确认'}</button></div>`;
 }).join('')}</div>`;
}
function previewLink(f){
 return `<a class="pokemon-dex" href="https://dex.pokemon.cn/play/pokedex/${String(f.dex).padStart(4,'0')}" target="_blank" rel="noopener noreferrer">在官方图鉴认识${f.name} ↗</a>`;
}
function renderDetail(){
 const c=getClaim(opened),s=starterFor(opened),next=group();
 const pending=opened===newEevee?pendingEevee():null;
 const preview=typeof opened==='string'&&evolutions.find(f=>f.id===opened);
 const f=preview||(c?pokemonForm(c):(s?.forms[0]||eevee));
 const stage=stageOf(c);
 const signature=JSON.stringify([opened,c,next,confirmation,snapshot()?.member.role,snapshot()?.wallet_enabled,canWrite(),claims().map(c=>c.eevee_form)]);
 if(signature===detailSignature)return;
 detailSignature=signature;
 let markup=`<div class="pokemon-detail-heading"><p class="eyebrow">${preview?'形态预览':c?(s?stageNames[stage]:c.eevee_form?'已进化':'初遇'):'新的伙伴'}</p><h2 id="pokemonDetailTitle">${f.name}</h2>${c?.redeemed_entry_id?'<small>✓ 已兑换</small>':''}</div>`;
 if(c)markup+=`<section class="pokemon-word-section"><h3>初遇时学会的 3 个词</h3>${words(c.word_keys)}</section>${c.final_word_keys?`<section class="pokemon-word-section"><h3>终极培养新增的 3 个词</h3>${words(c.final_word_keys)}</section>`:''}`;
 markup+=`<div class="pokemon-stage" id="pokemonStage">${pokemonArt(f)}</div>`;
 if(preview)markup+=`<p class="pokemon-hint">领养一只伊布，复习它的 3 个词后，就能选择尚未收藏的方向。</p>`;
 else if(!c){
  if(!snapshot())markup+=`<div class="detail-actions"><button class="secondary" data-family-open>连接家庭后领养</button></div>`;
  else if(pending){
   markup+=`<p class="pokemon-hint">先完成这只伊布的进化，再领养下一只。</p><div class="detail-actions">${button('open','继续培养伊布',false,`data-id="${pending.sticker_id}"`)}</div>`;
  }
  else if(opened===newEevee&&claims().filter(claim=>claim.eevee_form).length===evolutions.length)markup+=`<p class="pokemon-hint">八种伊布进化形态已经集齐啦！</p>`;
  else if(!next)markup+=`<p class="pokemon-hint">攒够 3 个首次掌握的词，就能领养这位伙伴。</p><a class="pokemon-dex" href="../words.html?unit=all">去单词抽屉 →</a>`;
  else markup+=allocation('claim',next,`用这组词领养${f.name}`);
 }else if(!c.upgraded_at&&(!s&&c.reviews.length===3)){
  markup+=`<h3 class="pokemon-task-title">选一个进化方向</h3><div class="pokemon-directions">${evolutions.map(option=>{
   const collected=claims().some(x=>x.eevee_form===option.id);
   return `<button type="button" class="pokemon-form tone-${option.tone}" data-pk="choose" data-form="${option.id}" ${collected||!canWrite()?'disabled':''} aria-pressed="${confirmation?.form===option.id}">${pokemonArt(option)}<strong>${option.name}</strong>${collected?'<small>已收藏</small>':''}</button>`;
  }).join('')}</div>`;
  if(confirmation?.form){
   const chosen=evolutions.find(x=>x.id===confirmation.form);
   markup+=`<div class="detail-actions">${button('evolve',`确认进化为${chosen.name}`,!canWrite())}<button class="secondary" data-pk="cancel">再想一想</button></div>`;
  }
 }else if(!c.upgraded_at){
  markup+=`<h3 class="pokemon-task-title">复习原来的 3 个词 · ${c.reviews.length} / 3</h3>${reviewList(c.word_keys,c.reviews,'review')}`;
 }else if(s&&stage===1){
  if(c.final_word_keys)markup+=`<h3 class="pokemon-task-title">终极进化 · 综合复习 ${c.final_reviews.length} / 6</h3><p class="pokemon-hint">原来 3 个词也要在这一轮再通过一次，可以分次完成。</p>${reviewList([...c.word_keys,...c.final_word_keys],c.final_reviews,'final_review')}`;
  else if(next)markup+=allocation('train',next,`用这组词开启${s.forms[2].name}的终极培养`);
  else markup+=`<p class="pokemon-hint">再分配 3 个新词，开启 6 词综合复习。</p><a class="pokemon-dex" href="../words.html?unit=all">去单词抽屉 →</a>`;
 }else markup+=`<p class="pokemon-hint">${s?'终极进化完成 · 6 个词均已复习通过':'进化完成 · 3 个词均已复习通过'}</p>`;
 if(s&&c?.upgraded_at)markup+=`<div class="pokemon-cover"><span>选择展示卡面</span>${s.forms.slice(0,stage+1).map((x,i)=>`<button type="button" class="secondary" data-pk="cover" data-stage="${i}" aria-pressed="${(c.cover_stage??stage)===i}" ${canWrite()?'':'disabled'}>${x.name}</button>`).join('')}</div>`;
 if(c?.upgraded_at){
  const reward=stickerRewardState(c);
  markup+=`<div class="detail-actions">${button('replay','在地图重播进化 ✧')}${snapshot()?.wallet_enabled&&reward==='eligible'?'<button type="button" class="secondary" data-action="exchange">去兑换枝枝币</button>':''}</div>`;
 }
 if(s)markup+=`<section class="pokemon-evolution-gallery" aria-labelledby="pokemonRouteTitle">
  <h3 id="pokemonRouteTitle">进化路线</h3>
  <ol>${s.forms.map((form,i)=>`<li>${pokemonArt(form)}<strong>${form.name}</strong><small>${stageNames[i]}</small></li>`).join('')}</ol>
 </section>`;
 markup+=previewLink(f);
 const scroll=dialog.scrollTop;
 detail.innerHTML=markup;
 if(dialog.open)dialog.scrollTop=scroll;
}
function allocation(action,next,label){
 if(confirmation?.action===action){
  return `<section class="pokemon-word-section"><h3>${label}</h3>${words(confirmation.keys)}<div class="detail-actions">${button('allocate','确认使用这组词',!canWrite()||confirmation.slot!==next.slot)}<button class="secondary" data-pk="cancel">返回</button></div></section>`;
 }
 return `<div class="detail-actions">${button('prepare',label,!canWrite(),`data-allocation="${action}" data-slot="${next.slot}"`)}</div>`;
}
function open(id){
 opened=id;confirmation=null;detailSignature='';voiceStatus.textContent='';renderDetail();
 if(!dialog.open)dialog.showModal();
 dialog.scrollTop=0;
}
function stopVoice(){
 voiceToken++;audio.pause();audio.removeAttribute('src');
 if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null;}
}
async function listen(key,inline){
 const w=byWord.get(key);
 if(!w)return;
 stopVoice();
 const token=voiceToken;
 if(inline)voiceStatus.textContent='准备朗读…';
 voiceReady??=loadVocabularyVoice();
 const voice=await voiceReady;
 if(token!==voiceToken)return;
 const source=voice(w,'word');
 if(!source)throw new Error('暂时找不到这个词的录音。');
 if(source instanceof Blob)objectUrl=URL.createObjectURL(source);
 audio.src=objectUrl||source;
 if(inline)voiceStatus.textContent='正在朗读 '+w.word;
 await audio.play();
 audio.onended=()=>{if(token===voiceToken&&inline)voiceStatus.textContent='听完了，试着说一遍。';};
}
async function returnToMap(claimId,before,family){
 // A refresh that started before the write may have returned the older form.
 const origin=opened;
 let claim=getClaim(claimId);
 if(!claim||before&&pokemonForm(claim).id===before.id){
  await cloud.refresh().catch(()=>{});
  claim=getClaim(claimId);
 }
 if(!claim||family!==snapshot()?.wallet.id||!dialog.open||opened!==origin||$('#pokemonEdition').hidden)return;
 if(before&&pokemonForm(claim).id===before.id)return;
 render();
 dialog.close();
 if(location.hash!=='#pokemon-map')history.pushState(history.state,'','#pokemon-map');
 await showPokemonMapMoment(claim,before);
}
dialog.addEventListener('close',()=>{
 opened=null;confirmation=null;detailSignature='';stopVoice();voiceStatus.textContent='';
});
document.addEventListener('click',async e=>{
 const b=e.target.closest('button[data-pk]');
 if(!b||b.disabled)return;
 const action=b.dataset.pk,c=getClaim(opened),before=c&&pokemonForm(c);
 try{
  if(action==='open')open(Number(b.dataset.id));
  else if(action==='adopt-eevee')open(newEevee);
  else if(action==='preview')open(b.dataset.form);
  else if(action==='close')dialog.close();
  else if(action==='listen')await listen(b.dataset.key,dialog.open);
  else if(action==='prepare'){
   const next=group();
   if(next?.slot!==Number(b.dataset.slot))throw new Error('词组已更新，请重新选择。');
   confirmation={action:b.dataset.allocation,slot:next.slot,keys:next.word_keys};
   renderDetail();
  }else if(action==='cancel'){confirmation=null;renderDetail();}
  else if(action==='allocate'){
   if(!confirmation||confirmation.slot!==group()?.slot)throw new Error('词组已更新，请重新选择。');
   const {action,slot,keys}=confirmation;
   confirmation=null;
   if(action==='claim'){
    const family=snapshot()?.wallet.id;
    const saved=await cloud.claimSticker(slot,opened===newEevee?eeveeClaimTarget:opened);
    if(family===snapshot()?.wallet.id){
     latestClaimId=saved.id;
     const adoptedForm=pokemonForm(saved);
     const wordNames=(keys||saved.word_keys||[]).map(k=>byWord.get(k)?.word||k.split(':').pop());
     render();
     dialog.close();
     await playPeelAndStickCeremony({
      artHtml:pokemonArt(adoptedForm),
      numberLabel:'NO.'+String(saved.sticker_id).padStart(2,'0'),
      name:adoptedForm.name,
      series:'宝可梦伙伴',
      color:'#6b9477',
      words:wordNames,
      getTargetElement:()=>document.querySelector(`#pokemon-owned [data-id="${saved.sticker_id}"]`),
      onLanded:()=>{}
     });
     const latestClaim=getClaim(saved.sticker_id)||saved;
     if(location.hash!=='#pokemon-map')history.pushState(history.state,'','#pokemon-map');
     await showPokemonMapMoment(latestClaim,null);
    }
   }else await cloud.pokemonAction(c.id,'train',slot);
  }else if(action==='review'||action==='final_review'){
   const family=snapshot()?.wallet.id;
   const result=action==='review'?await cloud.reviewSticker(c.id,b.dataset.key):await cloud.pokemonAction(c.id,action,null,b.dataset.key);
   if(result.newly_upgraded&&opened===c.sticker_id)await returnToMap(c.sticker_id,before,family);
  }else if(action==='choose'){confirmation={form:b.dataset.form};renderDetail();}
  else if(action==='evolve'){
   const selected=confirmation?.form;
   if(!selected)return;
   confirmation=null;
   const family=snapshot()?.wallet.id;
   const result=await cloud.pokemonAction(c.id,'evolve',null,selected);
   if(result.newly_upgraded&&opened===c.sticker_id)await returnToMap(c.sticker_id,before,family);
  }else if(action==='cover')await cloud.pokemonAction(c.id,'cover',null,b.dataset.stage);
  else if(action==='replay'){
   const previous=starterFor(c.sticker_id)?.forms[stageOf(c)-1]||eevee;
   await returnToMap(c.sticker_id,previous,snapshot()?.wallet.id);
  }
 }catch(error){
  const toast=$('#toast');
  toast.textContent=error.message;toast.classList.add('visible');
  setTimeout(()=>toast.classList.remove('visible'),4200);
 }
});
cloud.onChange(state=>{
 const family=state.snapshot?.wallet.id;
 if(family!==lastFamily){lastFamily=family;latestClaimId=null;renderPokemonMap(state.snapshot);dialog.close();}
 if(!$('#pokemonEdition').hidden)render();
});
window.addEventListener('hashchange',setEdition);
setEdition();
