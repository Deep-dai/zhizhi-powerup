const cloud=window.PowerUpCloud;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const canonicalWord=w=>w.word.normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
export function cloudMastered(words){const progress=new Map((cloud.state().snapshot?.progress||[]).map(p=>[p.canonical_key,p]));return Object.fromEntries(words.filter(w=>progress.get(canonicalWord(w))?.mastered).map(w=>[w.key,{at:progress.get(canonicalWord(w)).confirmed_at}]));}
export function masteryControl(w,done,pending=false){const s=cloud.state(),parent=s.snapshot?.member.role==='parent',allowed=parent&&s.status==='connected'&&!s.busy;const record=s.snapshot?.progress.find(p=>p.canonical_key===canonicalWord(w));
 const date=record?new Date(record.confirmed_at).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}):'';
 const title=pending?'正在保存…':done?'✓ 已掌握':parent?'家长确认：本次掌握':s.user?'等待家长确认':'登录家庭后可记录';
 const hint=pending?'正在等待家庭档案确认，请稍候':done?esc(record?.confirmed_name||'家长')+' · '+date:parent?'首次确认累计贴纸进度，可再次取消标记':s.user?'孩子可以练习、点读和查看家庭进度':'游客可自由练习，不保存掌握记录';
 return `<label class="mastery-check"><input type="checkbox" data-master-key="${esc(w.key)}" ${done?'checked':''} ${allowed?'':'disabled'}><span><strong>${title}</strong><small>${hint}</small></span></label>`;
}
export function cloudStatus(){const s=cloud.state();
 if(s.status==='restoring'||s.status==='connecting')return '正在恢复家庭连接；点读和练习可以继续。';
 if(s.status==='error')return esc(s.error)+' <button type="button" data-family-open>查看连接</button>';
 if(s.snapshot)return esc(s.snapshot.wallet.name)+'的家庭档案 · 跨设备共享 · 首次通过 '+s.snapshot.first_count+' 个词 <a class="cloud-album-link" href="stickers/">去贴纸册 ✧</a>';
 return '游客练习中，不写入家庭记录，也不累计贴纸。<button type="button" data-family-open>登录／连接家庭</button>';
}
export async function saveMastery(key,checked){return cloud.setMastery(key,checked);}
export function watchCloud(fn){return cloud.onChange(fn);}
