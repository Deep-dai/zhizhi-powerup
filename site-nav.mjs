import './cloud-ui.mjs?v=2';
import {UNITS,unitArt} from './units.mjs?v=6';

const base=new URL('.',import.meta.url),url=path=>new URL(path,base).href;
// Sites serves these documents without an .html suffix. Keep the filenames
// for standalone copies that use a plain local static server.
const pageUrl=path=>url(location.hostname.endsWith('.chatgpt.site')
  ?path.replace(/^index\.html(?=$|\?)/,'').replace(/\.html(?=$|\?)/,'')
  :path);
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isWords=document.body.dataset.sitePage==='words';
const isStickers=document.body.dataset.sitePage==='stickers';
const isFamily=document.body.dataset.sitePage==='family';
let current=isWords?(document.body.dataset.unit||new URLSearchParams(location.search).get('unit')||'all'):(document.body.dataset.learningUnit||'1');
let stats={},opened=false,focusBefore=null;const inertBefore=new Map(),mobile=matchMedia('(max-width:1099px)');
const icons={book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 5c3-1.5 6-1.5 9 0 3-1.5 6-1.5 9 0v15c-3-1.5-6-1.5-9 0-3-1.5-6-1.5-9 0z"/><path d="M12 5v15"/></svg>',drawer:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 12h18M9 8h6m-6 8h6"/></svg>',menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>'};
const rail=document.createElement('aside');rail.id='siteUnitNav';rail.className='site-sidebar';rail.setAttribute('aria-label','单元导航');
rail.innerHTML=`<div class="site-nav-brand"><a class="site-brand" href="${pageUrl('index.html')}"><img class="site-brand-logo" src="${url('assets/brand/powerup.webp')}" alt="枝枝 Power Up"></a><button class="site-close" type="button" aria-label="关闭单元导航">${icons.close}</button></div>
<nav class="site-primary" aria-label="学习方式"><a data-site-mode="course">${icons.book}<span>课程学习<small>和伙伴一起发现</small></span></a><a data-site-mode="words">${icons.drawer}<span>单词小抽屉<small>点读、听写与复习</small></span></a><a data-site-mode="stickers" href="${url('stickers/')}"><span aria-hidden="true" style="font-size:22px;width:24px;text-align:center">✧</span><span>星光贴纸册<small>收藏伙伴，复习升级</small></span></a></nav>
<div class="site-unit-heading"><h2>学习单元</h2><span>${UNITS.length} 个单元</span></div><label class="site-unit-search">${icons.search}<input id="siteUnitSearch" type="search" placeholder="找单元或伙伴" aria-label="搜索单元或伙伴" autocomplete="off"></label>
<nav class="site-unit-list" aria-label="单元列表">${isWords?`<a class="site-unit-link site-all-units" data-site-unit="all" href="${pageUrl('words.html?unit=all')}"><span class="site-unit-avatar site-all-symbol">${icons.drawer}</span><span class="site-unit-copy"><strong>全部单元</strong><small>一起查看与筛选</small></span><span class="site-unit-progress"></span></a>`:''}${UNITS.map(u=>`<a class="site-unit-link" data-site-unit="${u.id}" href="${pageUrl(isWords?'words.html?unit='+u.id:u.course)}" data-search="${safe(u.name+' '+u.topic+' '+u.companion+' 第'+u.id+'单元')}"><span class="site-unit-avatar">${unitArt(u,url)}</span><span class="site-unit-copy"><strong>${safe(u.name)}<span> · ${safe(u.companion)}</span></strong><small>${safe(u.topic)}</small></span><span class="site-unit-progress"></span></a>`).join('')}<p class="site-unit-empty" role="status" hidden>没有找到这个单元。试试单元编号或伙伴名字。</p></nav><div class="site-nav-bottom"><span class="site-nav-dot"></span><p>一单元一伙伴，一起慢慢学。<small>POWER UP · LEVEL 1</small></p></div>`;
const bar=document.createElement('div');bar.className='site-mobilebar';bar.innerHTML=`<button class="site-open" type="button" aria-controls="siteUnitNav" aria-expanded="false" aria-label="打开单元导航">${icons.menu}<span>单元导航</span></button><div class="site-mobile-context"><img class="site-brand-logo" src="${url('assets/brand/powerup.webp')}" alt="枝枝 Power Up"><strong></strong></div>`;
const backdrop=document.createElement('div');backdrop.className='site-nav-backdrop';backdrop.hidden=true;backdrop.setAttribute('aria-hidden','true');
document.body.classList.add('has-site-nav');document.body.prepend(bar);document.body.append(backdrop,rail);
const opener=bar.querySelector('.site-open'),closeButton=rail.querySelector('.site-close'),search=rail.querySelector('#siteUnitSearch');

function refresh(){
  const unit=UNITS.find(u=>String(u.id)===current)||UNITS[0];
  rail.querySelector('[data-site-mode="course"]').href=pageUrl(unit.course);
  rail.querySelector('[data-site-mode="words"]').href=pageUrl('words.html?unit=all');
  rail.querySelectorAll('[data-site-mode]').forEach(a=>{const active=a.dataset.siteMode===(isWords?'words':isStickers?'stickers':'course');a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  rail.querySelectorAll('[data-site-unit]').forEach(a=>{const id=a.dataset.siteUnit,active=id===current&&!isStickers&&!isFamily;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');const progress=a.querySelector('.site-unit-progress');const data=stats[id];progress.textContent=isWords&&data?`${data.done}/${data.total}`:'';progress.setAttribute('aria-label',data?`已掌握 ${data.done}，共 ${data.total} 个词条`:'');});
  bar.querySelector('.site-mobile-context strong').textContent=isStickers?'星光贴纸册':isFamily?'家庭账号':isWords?(current==='all'?'全部单元 · 单词':unit.name+' · 单词'):unit.name+' · '+unit.companion;
  if(!mobile.matches)setTimeout(()=>rail.querySelector('.site-unit-link.active')?.scrollIntoView({block:'nearest'}),60);
}
function filterUnits(){const norm=s=>s.toLowerCase().replace(/\s+/g,'');const q=norm(search.value);let visible=0;rail.querySelectorAll('[data-site-unit]').forEach(a=>{const match=!q||norm(a.dataset.search||'全部单元 all').includes(q);a.hidden=!match;if(match)visible++;});rail.querySelector('.site-unit-empty').hidden=visible>0;}
function setClosedAccessibility(){rail.inert=mobile.matches&&!opened;if(mobile.matches&&!opened)rail.setAttribute('aria-hidden','true');else rail.removeAttribute('aria-hidden');}
function openNav(){if(!mobile.matches)return;focusBefore=document.activeElement;opened=true;document.body.classList.add('site-nav-open');backdrop.hidden=false;opener.setAttribute('aria-expanded','true');rail.setAttribute('role','dialog');rail.setAttribute('aria-modal','true');rail.setAttribute('aria-labelledby','siteNavHeading');rail.querySelector('.site-unit-heading h2').id='siteNavHeading';setClosedAccessibility();for(const el of document.body.children){if(el===rail||el===backdrop)continue;inertBefore.set(el,el.inert);el.inert=true;}search.value='';filterUnits();const active=rail.querySelector('.site-unit-link.active')||search;active.focus({preventScroll:true});active.scrollIntoView({block:'nearest'});}
function closeNav(restoreFocus=true){if(!opened){setClosedAccessibility();return;}opened=false;document.body.classList.remove('site-nav-open');backdrop.hidden=true;opener.setAttribute('aria-expanded','false');rail.removeAttribute('role');rail.removeAttribute('aria-modal');rail.removeAttribute('aria-labelledby');for(const [el,inert] of inertBefore)el.inert=inert;inertBefore.clear();setClosedAccessibility();if(restoreFocus&&focusBefore?.isConnected)focusBefore.focus({preventScroll:true});}
const prefetched=new Set();
function prefetchPrimary(event){
  const link=event.target.closest('.site-primary a[href]');
  const connection=navigator.connection;
  if(!link||link.matches('[aria-current="page"]')||prefetched.has(link.href)
    ||connection?.saveData||['slow-2g','2g'].includes(connection?.effectiveType))return;
  prefetched.add(link.href);
  const hint=document.createElement('link');
  hint.rel='prefetch';
  hint.href=link.href;
  document.head.append(hint);
}
rail.addEventListener('pointerover',prefetchPrimary);
rail.addEventListener('focusin',prefetchPrimary);
rail.addEventListener('pointerdown',prefetchPrimary,{passive:true});
opener.addEventListener('click',openNav);closeButton.addEventListener('click',()=>closeNav());backdrop.addEventListener('click',()=>closeNav());search.addEventListener('input',filterUnits);
rail.addEventListener('click',e=>{const link=e.target.closest('[data-site-unit]');if(!link){if(e.target.closest('.site-primary a[href]'))closeNav(false);return;}if(isWords&&document.body.dataset.wordDrawerReady==='true'){e.preventDefault();window.dispatchEvent(new CustomEvent('powerup:select-unit',{detail:{unit:link.dataset.siteUnit}}));}closeNav();});
document.addEventListener('keydown',e=>{if(!opened)return;if(e.key==='Escape'){e.preventDefault();closeNav();return;}if(e.key!=='Tab')return;const items=[...rail.querySelectorAll('a[href],button,input')].filter(el=>!el.disabled&&el.getClientRects().length);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
mobile.addEventListener('change',()=>{closeNav(false);setClosedAccessibility();});
window.addEventListener('powerup:close-navigation',()=>closeNav(false));
window.addEventListener('powerup:unit-change',e=>{if(!isWords)return;current=String(e.detail.unit);stats=e.detail.stats||stats;refresh();});
// The word drawer can finish its first render before this module is ready.
refresh();setClosedAccessibility();
if(isWords)window.dispatchEvent(new CustomEvent('powerup:request-unit-state'));

window.dispatchEvent(new Event('powerup:nav-ready'));
