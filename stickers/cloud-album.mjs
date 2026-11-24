import {eligibleStickers} from './sticker-rewards.mjs?v=1';
import {pokemonReward} from './pokemon-catalog.mjs?v=4';
import {VOCABULARY,RETIRED_VOCABULARY} from '../words-data.mjs?v=7';
import {sfx,playPeelAndStickCeremony,createStardustMarkup} from './sticker-fx.mjs?v=2';
const cloud=window.PowerUpCloud,catalog=window.STICKER_CATALOG,art=window.renderStickerArt;
const $=s=>document.querySelector(s),byId=id=>catalog.find(c=>c.id===Number(id)),byWord=new Map([...VOCABULARY,...RETIRED_VOCABULARY].map(w=>[w.key,w]));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let mode=cloud.state().snapshot?'mine':'preview',form='upgraded',series='全部朋友',detailId=null,selected=[],animation=0,animating=false,peelingId=null,toastTimer,previousFamily=cloud.state().snapshot?.wallet.id;
let starHeroReady=false,replayTimers=[];
const cards=new Map();
const setText=(el,text)=>{if(el.textContent!==text)el.textContent=text;};
const clearReplayTimers=()=>{replayTimers.forEach(clearTimeout);replayTimers=[];};
$('#seriesTabs').innerHTML=['全部朋友',...new Set(catalog.map(c=>c.series))].map(name=>`<button data-series="${esc(name)}">${esc(name)}</button>`).join('');
let panelMarkup='',detailSignature='';
const state=()=>cloud.state(),snap=()=>state().snapshot,owned=id=>snap()?.claims.find(c=>c.sticker_id===Number(id)),eligible=()=>eligibleStickers(snap());
const walletEnabled=()=>snap()?.wallet_enabled===true;
const canWrite=()=>state().status==='connected'&&!state().busy;
function toast(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);}
function login(){window.dispatchEvent(new Event('powerup:open-family'));}
function wordsForSticker(c,explicitKeys=null){
 const keys=explicitKeys||owned(c.id)?.word_keys||snap()?.pending_groups?.[0]?.word_keys;
 if(keys?.length===3)return keys.map(k=>byWord.get(k)?.word||k.split(':').pop());
 const pool=VOCABULARY.filter(w=>w.word&&w.word.length<=11);
 if(pool.length>=3){const start=(c.id*3)%pool.length;return [0,1,2].map(i=>pool[(start+i)%pool.length].word);}
 return ['star','friend','magic'];
}
function render(){
 const s=state(),family=s.snapshot,m=family?.member;
 document.querySelectorAll('[data-wallet-only]').forEach(el=>el.hidden=!walletEnabled());
 setText($('.collection-footnote'),'每位朋友都有两种造型 · 动作、装扮与水晶场景一起升级'+(walletEnabled()?' · 兑换后贴纸完整保留':''));
 setText($('#rulesDialog .parent-note'),'掌握和复习由家长确认，复习时间由家长判断。游客不累计收藏。'+(walletEnabled()?'每张升级贴纸只能参与一次兑换，奖励直接进入同一家庭的枝枝钱包。':''));
 if(!walletEnabled()&&$('#exchangeDialog').open)$('#exchangeDialog').close();
 setText($('#albumFamilyStatus'),m?m.name+' · '+(m.role==='parent'?'家长':'孩子'):['restoring','connecting'].includes(s.status)?'正在连接家庭…':'游客浏览 · 连接家庭');
 if(location.hash.startsWith('#pokemon'))return;
 if(!starHeroReady){$('.hero-sticker').innerHTML=art(byId(20),true,'hero');starHeroReady=true;}
 $('#starEdition').querySelectorAll('[data-mode]').forEach(b=>{const active=b.dataset.mode===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active);});
 $('#starEdition').querySelectorAll('[data-form]').forEach(b=>{const active=b.dataset.form===form;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active);});
 $('.state-switch').hidden=mode!=='preview';
 $('#starEdition').querySelectorAll('[data-series]').forEach(b=>{const active=b.dataset.series===series;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active);});
 const markup=panel();if(markup!==panelMarkup){$('#modePanel').innerHTML=markup;panelMarkup=markup;}
 renderGrid();
 if($('#stickerDialog').open&&detailId&&!animating)showDetail(detailId);
}
function renderGrid(){
 const grid=$('#albumGrid');
 // Wait for the initial identity read so a saved family does not download
 // preview upgrades immediately followed by its own initial forms.
 if(!snap()&&['restoring','connecting'].includes(state().status)){grid.setAttribute('aria-busy','true');return;}
 grid.removeAttribute('aria-busy');
 const visible=catalog.filter(c=>series==='全部朋友'||c.series===series),wanted=new Set(visible.map(c=>String(c.id)));
 for(const child of [...grid.children])if(!wanted.has(child.dataset.sticker))child.remove();
 visible.forEach((c,index)=>{
  const claim=owned(c.id),awaitingPeel=peelingId===c.id;
  const locked=(mode==='mine'&&!claim)||awaitingPeel;
  const up=mode==='preview'?form==='upgraded':!!claim?.upgraded_at&&!awaitingPeel;
  const redeemed=!!(mode==='mine'&&claim?.redeemed_entry_id&&!awaitingPeel);
  const stamped=!!(mode==='mine'&&claim&&!redeemed&&!awaitingPeel);
  let card=cards.get(c.id);
  if(!card){
   const el=document.createElement('button');el.type='button';el.className='sticker-card';el.dataset.sticker=c.id;el.style.setProperty('--card-tint',c.color+'45');
   el.innerHTML=`<span class="card-no">${String(c.id).padStart(2,'0')}</span><span class="card-series">${esc(c.series)}</span><span class="redeemed-badge" hidden>✓ 已兑换</span><span class="first-meet-stamp" hidden>✦ 初遇纪念</span><span class="card-art"></span><span class="card-name">${esc(c.name)}</span><span class="card-subtitle"></span><span class="card-footer"></span>`;
   card={el,art:el.querySelector('.card-art'),badge:el.querySelector('.redeemed-badge'),stamp:el.querySelector('.first-meet-stamp'),subtitle:el.querySelector('.card-subtitle'),footer:el.querySelector('.card-footer'),forms:new Map()};cards.set(c.id,card);
  }
  card.el.classList.toggle('is-locked',locked);
  card.el.classList.toggle('awaiting-peel-arrival',awaitingPeel);
  if(card.badge.hidden===redeemed)card.badge.hidden=!redeemed;
  if(card.stamp.hidden===stamped)card.stamp.hidden=!stamped;
  const label=`${c.name}，${locked?'未收藏':up?'已升级':'初遇'}${redeemed?'，已兑换':stamped?'，初遇纪念':''}`;
  if(card.el.getAttribute('aria-label')!==label)card.el.setAttribute('aria-label',label);
  if(card.up!==up){
   if(!card.forms.has(up)){const template=document.createElement('template');template.innerHTML=art(c,up,'lazy');card.forms.set(up,template.content.firstElementChild);}
   card.art.replaceChildren(card.forms.get(up));card.up=up;
  }
  setText(card.subtitle,up?c.upgradeName:'等一个温柔的抱抱');
  setText(card.footer,awaitingPeel?'揭下贴纸贴到这里':mode==='preview'?'点开看初遇与升级':locked?'3个新词，选我作伴':up?'点开重温星光变身':'复习这3个词，让我变身');
  // Keep unchanged DOM nodes, decoded images and focus across cloud syncs.
  if(grid.children[index]!==card.el)grid.insertBefore(card.el,grid.children[index]||null);
 });
}

function wordTile(key){const w=byWord.get(key);return `<div class="word-confirm done"><b>${esc(w?.word||key)}</b><span>✓ ${esc(w?.zh||'家长已确认')}</span></div>`;}
function panel(){const s=state(),f=s.snapshot;
 if(!f)return `<div class="demo-banner"><div><strong>${s.status==='error'?'家庭连接暂未恢复':s.status==='restoring'||s.status==='connecting'?'正在恢复家庭连接…':'游客浏览 · 先认识20位朋友'}</strong><p>${s.status==='error'?esc(s.error):'游客可以练习和查看款式；连接家庭后，才保存进度、收藏贴纸并领取奖励。'}</p></div><button data-family-open>登录／连接家庭</button></div>`;
 const claims=f.claims,available=eligible(),groups=f.pending_groups,pending=groups[0],full=claims.length===catalog.length;
 const pocket=full?'<h3>第一辑已经收齐啦</h3><p>新的词组可以到 <a href="#pokemon">宝可梦专区</a> 领养或培养伙伴。</p>':pending?`<h3>这一袋3个词，已经准备好了</h3><p>家长已确认，选一位尚未收藏的伙伴吧。</p><div class="pocket-words">${pending.word_keys.map(wordTile).join('')}</div><button class="secondary full" data-action="choose">选择我的新伙伴 →</button>`:`<h3>下一位伙伴，正在等你</h3><p>再首次通过 ${3-f.first_count%3} 个词，就能选择一张新贴纸。相同英文词的首次奖励只计一次。</p><a class="secondary full" style="display:block;text-align:center;text-decoration:none" href="../words.html?unit=all">${f.member.role==='parent'?'去单词抽屉确认掌握':'去单词抽屉练一练'} →</a>`;
 return `<div class="demo-banner"><div><strong>${esc(f.wallet.name)}的家庭收藏 · ${esc(f.member.name)}</strong><p>${s.status==='error'?esc(s.error):f.member.role==='parent'?(walletEnabled()?'由家长确认掌握和复习，孩子可以选贴纸、领已确认的奖励。':'由家长确认掌握和复习，孩子可以选择伙伴、收集进化造型。'):'和家长一起检查单词，让伙伴一起闪耀。'}</p></div><button data-action="refresh">刷新进度</button></div><div class="demo-dashboard ${walletEnabled()?'':'learning-only'}"><div class="word-pocket">${pocket}</div>${walletEnabled()?`<div class="reward-box"><h3>我的星光兑换站</h3><p>星光和宝可梦的已进化贴纸可以混选，3张换5枚枝枝币。</p><div class="coin-progress"><b>${available.length}</b><span>张可兑换 / 每次3张</span></div><button class="primary" data-action="exchange" ${available.length>=3&&canWrite()?'':'disabled'}>${available.length>=3?'选3张，兑换5枚币':'还差'+(3-available.length)+'张升级贴纸'}</button><div class="wallet-line">钱包余额：${Number(f.wallet.balance)/200} 枚枝枝币 · <a href="${cloud.walletUrl}" target="_blank" rel="noopener">打开钱包 ↗</a></div></div>`:''}</div><div class="demo-statline"><span>首次通过 ${f.first_count} 个词 · 收藏 ${claims.length} / 20 · 已升级 ${claims.filter(c=>c.upgraded_at).length}${walletEnabled()?` · 已兑换 ${f.redemptions.length} 次`:''}</span><span>${s.busy?'正在保存…':s.status==='connected'?'家庭记录已同步':'连接待恢复'}</span></div>`;
}
function comparison(c){return `<div class="comparison"><div class="comparison-cell">${art(c)}<small>初次掌握3个词</small><b>初遇 · ${esc(c.name)}</b></div><div class="comparison-cell">${art(c,true)}<small>同一组3个词复习通过</small><b>${esc(c.upgradeName)}</b></div></div><p class="motion-description">${esc(c.action)}<br>${esc(c.magic)}</p>`;}
function showDetail(id){const c=byId(id);if(!c)return;detailId=c.id;const f=snap(),claim=owned(id),parent=f?.member.role==='parent';
 const signature=JSON.stringify([id,mode,claim||null,parent,walletEnabled(),canWrite()]);if($('#stickerDialog').open&&signature===detailSignature)return;detailSignature=signature;
 let html=`<div class="detail-heading"><p class="eyebrow">${esc(c.series)} · NO.${String(c.id).padStart(2,'0')}</p><h2>${esc(c.name)}</h2><p>${esc(c.upgradeName)}</p></div>`;
 if(mode==='mine'&&claim?.upgraded_at){
  html+=`<div class="detail-actions detail-actions-top"><button class="primary" data-action="replay" data-id="${c.id}">✧ 重温星光变身动画</button>${walletEnabled()&&!claim.redeemed_entry_id?'<button class="secondary" data-action="exchange-detail">去星光兑换站</button>':''}</div>`;
  html+=`<section class="mastered-words" aria-labelledby="masteredWordsTitle"><h3 id="masteredWordsTitle">当初掌握的3个单词</h3><div class="pocket-words">${claim.word_keys.map(wordTile).join('')}</div></section>`;
 }
 html+=comparison(c);
 if(mode==='preview')html+=`<div class="detail-actions"><button class="primary" data-action="replay" data-id="${c.id}">播放造型变化 ✧</button><button class="secondary" data-action="mine">查看我的收藏</button></div><p class="detail-state-note">款式预览不改变学习记录或奖励。</p>`;
 else if(!claim){const group=f?.pending_groups[0];html+=`<div class="detail-actions"><button class="primary" data-action="claim" data-id="${c.id}" ${group&&canWrite()?'':'disabled'}>${group?'就选这位新伙伴':'还需要攒够3个新词'}</button><button class="secondary" data-action="close">再看看其他伙伴</button></div><p class="detail-state-note">领取后将弹出专属贴纸背纸，揭下飞入 NO.${String(c.id).padStart(2,'0')} 号格并盖上初遇纪念章。</p>`;}
 else if(!claim.upgraded_at){html=`<div class="detail-heading"><p class="eyebrow">一起再练一练，魔法就会发生</p><h2>${esc(c.name)}</h2><p>复习当初带你认识我的这3个词</p></div><div class="upgrade-stage">${art(c)}</div><div class="word-review-list">${claim.word_keys.map(key=>{const w=byWord.get(key),review=claim.reviews.find(r=>r.word_key===key);return `<div class="word-review"><span><b>${esc(w?.word||key)}</b><small>${esc(w?.zh||'')}</small></span><button data-review="${esc(key)}" data-id="${c.id}" class="${review?'reviewed':''}" ${parent&&!review&&canWrite()?'':'disabled'}>${review?'✓ '+esc(review.confirmed_name)+'已确认':parent?'家长确认复习通过':'等待家长确认'}</button></div>`;}).join('')}</div><p class="detail-state-note">已复习 ${claim.reviews.length} / 3 个词 · 复习时间由家长判断。</p>`;}
 else {
  if(walletEnabled()&&!claim.redeemed_entry_id)html+='<div class="detail-actions"><button class="secondary" data-action="exchange-detail">去星光兑换站</button></div>';
  html+=`<p class="detail-state-note">${claim.redeemed_entry_id?'✓ 已兑换 · 炫彩造型完整保留。':walletEnabled()?'已升级，可与另外2张未兑换的升级贴纸一起领取5枚币。':'复习已完成，炫彩伙伴会一直留在你的贴纸册里。'}</p>`;
 }
 const scroll=$('#stickerDialog').scrollTop;$('#stickerDetail').innerHTML=html;if(!$('#stickerDialog').open)$('#stickerDialog').showModal();else $('#stickerDialog').scrollTop=scroll;
}
async function runStarPeel(id,wordKeys=null){
 const c=byId(id);if(!c)return;
 await window.preloadStickerArt(c,false);
 clearReplayTimers();animation++;animating=false;
 if($('#stickerDialog').open)$('#stickerDialog').close();
 mode='mine';peelingId=c.id;
 if(series!=='全部朋友'&&series!==c.series)series='全部朋友';
 render();
 const noLabel='NO.'+String(c.id).padStart(2,'0');
 await playPeelAndStickCeremony({
  artHtml:art(c,false),
  numberLabel:noLabel,
  name:c.name,
  series:c.series,
  color:c.color,
  words:wordsForSticker(c,wordKeys),
  getTargetElement:()=>cards.get(c.id)?.el||null,
  onLanded:()=>{peelingId=null;render();}
 });
 toast(`${c.name}已贴入 ${noLabel} 号格，盖上初遇纪念章！`);
}
async function replay(id,earned=false){
 const c=byId(id);if(!c)return;
 clearReplayTimers();
 const token=++animation;animating=true;
 await Promise.all([window.preloadStickerArt(c),window.preloadStickerArt(c,true)]);
 if(token!==animation)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const threeWords=wordsForSticker(c);
 const orbsHtml=reduced?'':`<div class="word-orbs-layer" aria-hidden="true">${threeWords.map((w,i)=>`<div class="word-orb orb-${i}" style="--appear-delay:${i*160}ms;--fly-delay:${760+i*270}ms"><span class="orb-pill" lang="en">✦ ${esc(w)}</span><span class="orb-core"></span></div>`).join('')}<span class="absorb-ripple" id="absorbRipple"></span></div>${createStardustMarkup(32,c.color)}`;
 $('#stickerDetail').innerHTML=`<div class="detail-heading"><p class="eyebrow">${earned?'这3个词都复习通过啦':'重播不会重复获得奖励'}</p><h2>${esc(c.name)}，变身！</h2></div><div class="upgrade-animation"><div class="upgrade-stage ${reduced?'transformed':'phase-orbs'}" id="upgradeStage" style="--partner-color:${esc(c.color)}"><div class="aurora-vortex" aria-hidden="true"></div><div class="upgrade-flash-ring" aria-hidden="true"></div>${art(c)}${art(c,true)}${orbsHtml}</div><h3 id="upgradeTitle">${reduced?esc(c.upgradeName):'唤醒掌握的 3 个单词…'}</h3><p>${esc(c.magic)}</p></div><p class="motion-description">${esc(c.action)}</p><div class="detail-actions"><button class="primary" data-action="back" data-id="${c.id}">${mode==='mine'?'看看我的3个单词':'看看这份闪耀'}</button><button class="secondary" data-action="replay" data-id="${c.id}">再看一次</button></div>`;
 $('#stickerDialog').scrollTop=0;
 if(reduced)return;
 // Stage 1 (0 - 760ms): Summon the 3 mastered English words clearly around the partner
 sfx.wordSummon();
 replayTimers.push(setTimeout(()=>{
  if(token!==animation)return;
  const title=$('#upgradeTitle');
  if(title)title.textContent='单词化作星光能量，注入伙伴体内…';
 },740));
 // Stage 2 (760 - 1880ms): One-by-one the 3 word orbs arc into the partner's heart
 [1220,1490,1760].forEach((ms,idx)=>{
  replayTimers.push(setTimeout(()=>{
   if(token!==animation)return;
   sfx.orbAbsorb(idx);
   const stage=$('#upgradeStage'),ripple=$('#absorbRipple');
   if(stage)stage.dataset.absorbHit=String(idx+1);
   if(ripple){ripple.classList.remove('is-pulsing');void ripple.offsetWidth;ripple.classList.add('is-pulsing');}
  },ms));
 });
 // Stage 3 (1880 - 2760ms): Spinning aurora vortex & luminous golden-white silhouette build-up
 replayTimers.push(setTimeout(()=>{
  if(token!==animation)return;
  const stage=$('#upgradeStage'),title=$('#upgradeTitle');
  if(stage){stage.classList.remove('phase-orbs');stage.classList.add('phase-charging');}
  if(title)title.textContent='极光魔法点亮中…';
  sfx.auroraCharge();
 },1880));
 // Stage 4 (2760 - 3650ms): Grand flash bloom + upgraded partner bounce + slow stardust shower (~3.5s total)
 replayTimers.push(setTimeout(()=>{
  if(token!==animation)return;
  const stage=$('#upgradeStage'),title=$('#upgradeTitle');
  if(stage){stage.classList.remove('phase-charging');stage.classList.add('transformed','phase-burst');}
  if(title){title.textContent='✧ '+c.upgradeName+' ✧';title.classList.add('title-revealed');}
  sfx.starReveal();
 },2760));
}
function showExchange(){if(!walletEnabled())throw new Error('这个家庭尚未开启钱包联动。');selected=[];const list=eligible();$('#exchangeContent').innerHTML=`<div class="exchange-header"><div class="coin-icon" aria-hidden="true">枝</div><p class="eyebrow">把三份闪耀，存进枝枝钱包</p><h2>选3张，领取5枚枝枝币</h2><p>星光贴纸和宝可梦贴纸可以混选。兑换后，贴纸会留在册中。</p></div><div class="exchange-grid">${list.map(claim=>{const c=byId(claim.sticker_id),reward=c?{art:art(c,true),name:c.name}:pokemonReward(claim);return `<button class="exchange-choice" data-exchange-id="${claim.id}" aria-pressed="false">${reward.art}<b>${esc(reward.name)}</b><small class="exchange-collection-name">${c?'星光贴纸':'宝可梦贴纸'}</small></button>`;}).join('')||'<p class="empty-note">还没有可兑换的升级贴纸，先陪伙伴复习吧。</p>'}</div><p class="exchange-detail" id="selectionCount">已选0 / 3张 · 本次获得5枚枝枝币</p><button class="primary full" id="confirmExchange" data-action="confirm-exchange" disabled>选择3张后确认领取</button><p class="detail-state-note">家长已确认的学习奖励，将直接进入同一家庭的枝枝钱包。</p>`;if(!$('#exchangeDialog').open)$('#exchangeDialog').showModal();}
function receipt(result){$('#exchangeContent').innerHTML=`<div class="exchange-success"><p class="eyebrow">三份努力，五枚小小的奖励</p><div class="big-coins">+5</div><h2>枝枝币已进入钱包</h2><p>3张贴纸已加上“已兑换”标签，炫彩造型仍然陪着你。</p><p class="success-note">本笔入账后余额：${Number(result.balance)/200} 枚枝枝币<br>原因：${esc(result.note)}</p><a class="secondary" href="${cloud.walletUrl}" target="_blank" rel="noopener">打开枝枝钱包查看明细 ↗</a><button class="primary full" data-action="close-exchange">回到我的贴纸册</button></div>`;}
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||b.disabled)return;try{
 if(b.closest('#starEdition')&&b.dataset.mode){if(b.dataset.mode==='mine'&&!snap()){login();return;}mode=b.dataset.mode;render();return;}
 if(b.closest('#starEdition')&&b.dataset.form){form=b.dataset.form;render();return;}
 if(b.closest('#starEdition')&&b.dataset.series){series=b.dataset.series;render();return;}
 if(b.dataset.sticker){clearReplayTimers();animating=false;animation++;showDetail(Number(b.dataset.sticker));return;}
 if(b.dataset.review){const result=await cloud.reviewSticker(owned(b.dataset.id).id,b.dataset.review);if(result.newly_upgraded)replay(Number(b.dataset.id),true);return;}
 if(b.dataset.exchangeId){const id=b.dataset.exchangeId;if(selected.includes(id))selected=selected.filter(x=>x!==id);else if(selected.length<3)selected.push(id);else{toast('每次选择3张贴纸就够啦');return;}document.querySelectorAll('[data-exchange-id]').forEach(btn=>{const yes=selected.includes(btn.dataset.exchangeId);btn.classList.toggle('selected',yes);btn.setAttribute('aria-pressed',yes);});$('#selectionCount').textContent=`已选${selected.length} / 3张 · 本次获得5枚枝枝币`;$('#confirmExchange').disabled=selected.length!==3||!canWrite();$('#confirmExchange').textContent=selected.length===3?'确认领取5枚枝枝币':'选择3张后确认领取';return;}
 switch(b.dataset.action){
  case 'go-collection':if(snap())mode='mine';render();$('#album').scrollIntoView({behavior:'smooth'});break;
  case 'rules':$('#rulesDialog').showModal();break;case 'close-rules':$('#rulesDialog').close();break;
  case 'close':clearReplayTimers();animation++;animating=false;$('#stickerDialog').close();break;
  case 'back':clearReplayTimers();animation++;animating=false;detailSignature='';showDetail(Number(b.dataset.id));break;
  case 'replay':replay(Number(b.dataset.id));break;
  case 'mine':if(!snap()){login();break;}mode='mine';clearReplayTimers();animating=false;render();showDetail(detailId);break;
  case 'refresh':await cloud.refresh();toast('已读取最新家庭记录。');break;
  case 'choose':mode='mine';series='全部朋友';render();$('#albumGrid').scrollIntoView({behavior:'smooth'});toast('选择一位尚未收藏的朋友吧');break;
  case 'claim':{const pending=snap()?.pending_groups[0];if(!pending)throw new Error('请先确认一组3个首次掌握的词。');const targetId=Number(b.dataset.id),groupWords=[...pending.word_keys];peelingId=targetId;try{await cloud.claimSticker(pending.slot,targetId);}catch(err){peelingId=null;render();throw err;}await runStarPeel(targetId,groupWords);break;}
  case 'exchange':$('#pokemonDialog').close();showExchange();break;
  case 'exchange-detail':clearReplayTimers();$('#stickerDialog').close();animating=false;showExchange();break;
  case 'close-exchange':$('#exchangeDialog').close();break;
  case 'confirm-exchange':{b.disabled=true;b.textContent='正在确认入账…';try{receipt(await cloud.redeemStickers(selected));}catch(error){await cloud.refresh().catch(()=>{});showExchange();throw error;}break;}
 }
 }catch(error){toast(error.message);}});
for(const d of document.querySelectorAll('dialog:not(#familyDialog)')){d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});d.addEventListener('close',()=>{if(d.id==='stickerDialog'){clearReplayTimers();animation++;animating=false;detailId=null;detailSignature='';}});}
cloud.onChange(s=>{const family=s.snapshot?.wallet.id;if(family!==previousFamily){mode=family?'mine':'preview';previousFamily=family;peelingId=null;clearReplayTimers();detailId=null;animating=false;$('#stickerDialog').close();$('#exchangeDialog').close();}render();});
render();

window.addEventListener('hashchange',render);
