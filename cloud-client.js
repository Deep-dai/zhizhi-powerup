(function(){
 'use strict';
 const config=window.POWERUP_CONFIG;
 const passwordModule=new URL('family-auth.mjs?v=1',document.currentScript.src).href;
 if(!config||!window.supabase){window.PowerUpCloud={ready:Promise.resolve(),state:()=>({status:'error',error:'家庭连接配置暂时不可用',snapshot:null,user:null}),onChange:()=>()=>{}};return;}
 const client=window.supabase.createClient(config.url,config.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 let session=null,snapshot=null,status='restoring',error='',lastSynced=null,reading=null,generation=0,channel=null,queued=null,busy=false;
 const listeners=new Set();
 const messages={INVALID_POKEMON_POSITION:'请把伙伴放在地图范围内。',EEVEE_IN_PROGRESS:'请先完成这一只伊布的进化。',EEVEE_COMPLETE:'伊布家族已经收齐啦。',EEVEE_FORM_COLLECTED:'这个进化方向已经收藏，请换一个。',INVALID_FINAL_REVIEW_WORD:'请选择本轮终极培养绑定的词。',INVALID_POKEMON_ACTION:'当前阶段暂时不能进行这项操作，请刷新进度。',PASSWORD_TOO_SHORT:'密码至少4位，可以使用数字。',WALLET_NOT_ENABLED:'这个家庭尚未开启枝枝钱包，学习和贴纸功能可以照常使用。',PARENT_ONLY:'这项记录需要由家长登录后确认。',MEMBER_REQUIRED:'请先连接家庭；原设备可能已被移除。',INVALID_WORD:'这个词暂时无法记录，请刷新词库后重试。',THREE_NEW_WORDS_REQUIRED:'还没有攒够这一组3个新词。',STICKER_ALREADY_CLAIMED:'这张贴纸或这一组词已被领取，请刷新后查看。',STICKERS_NOT_ELIGIBLE:'所选贴纸已兑换或尚未升级，请刷新后重新选择。',THREE_UPGRADED_STICKERS_REQUIRED:'每次需要选择3张不同的升级贴纸。',INVALID_REVIEW_WORD:'请复习这张贴纸原来绑定的3个词。',REQUEST_CONFLICT:'这次操作的记录不一致，请刷新并核对结果。',BALANCE_LIMIT:'钱包余额已达上限，奖励资格仍会保留。',ALREADY_JOINED:'这个账号已经属于一个家庭，请刷新查看。',INVALID_INVITE:'邀请已过期、已使用或不属于有效家庭。',INVALID_DEVICE_CODE:'连接码无效或已过期，请在孩子设备重新申请。',DEVICE_PAIRING_LOCKED:'连接尝试过多，请稍后再试。'};
 const explain=e=>{const text=String(e?.message||e||'');for(const [key,value]of Object.entries(messages))if(text.includes(key))return value;if(/Invalid login credentials/i.test(text))return '邮箱或密码不正确。';if(/already registered/i.test(text))return '这个邮箱已经注册过，请使用原密码登录。';if(/rate limit|too many requests/i.test(text))return '操作较频繁，请稍后重试。';if(/email.*confirm/i.test(text))return '请先完成邮箱验证，再登录家庭。';if(/fetch|network|timeout|abort/i.test(text))return '网络连接暂时中断，请重试；尚未确认成功的操作不会显示为已保存。';return text||'暂时无法完成，请稍后重试。';};
 const view=()=>({status,error,busy,lastSynced,registrationWalletOptIn:!!session?.user?.user_metadata?.powerup_wallet_opt_in,user:session?{id:session.user.id,isAnonymous:!!session.user.is_anonymous,email:session.user.email||''}:null,snapshot});
 function emit(){const data=view();listeners.forEach(fn=>fn(data));window.dispatchEvent(new CustomEvent('powerup:cloud-state',{detail:data}));}
 async function rpc(name,args={}){const result=await client.rpc(name,args);if(result.error)throw result.error;if(result.data?.error)throw new Error(result.data.error);return result.data;}
 function unsubscribe(){if(channel){client.removeChannel(channel);channel=null;}}
 function subscribe(){unsubscribe();if(!snapshot)return;const family=snapshot.wallet.id;channel=client.channel('powerup-family-'+family).on('postgres_changes',{event:'*',schema:'public',table:'learning_family_state',filter:'wallet_id=eq.'+family},scheduleRefresh).on('postgres_changes',{event:'UPDATE',schema:'public',table:'wallets',filter:'id=eq.'+family},scheduleRefresh).subscribe();}
 function scheduleRefresh(){clearTimeout(queued);queued=setTimeout(()=>refresh().catch(()=>{}),300);}
 async function refresh(){
  if(!session){snapshot=null;status='guest';error='';emit();return null;}
  const uid=session.user.id,epoch=generation;
  if(reading?.uid===uid)return reading.promise;
  const promise=(async()=>{try{const fresh=await rpc('learning_snapshot');if(epoch!==generation||session?.user.id!==uid)return null;
   if(snapshot&&fresh&&snapshot.wallet.id===fresh.wallet.id&&(Number(fresh.version)<Number(snapshot.version)||(Number(fresh.version)===Number(snapshot.version)&&Number(fresh.wallet.version)<Number(snapshot.wallet.version))))return snapshot;
   const changedFamily=snapshot?.wallet.id!==fresh?.wallet.id;snapshot=fresh;status=fresh?'connected':'unpaired';error='';lastSynced=new Date().toISOString();if(changedFamily)subscribe();emit();return fresh;
  }catch(e){if(epoch===generation){status='error';error=explain(e);emit();}throw e;}finally{if(reading?.promise===promise)reading=null;}})();
  reading={uid,promise};return promise;
 }
 function applySession(next){const changed=session?.user.id!==next?.user.id;session=next;if(changed){generation++;snapshot=null;reading=null;lastSynced=null;unsubscribe();}if(!next){status='guest';error='';emit();}else{status='connecting';emit();refresh().catch(()=>{});}}
 client.auth.onAuthStateChange((event,next)=>{if(event==='INITIAL_SESSION')return;queueMicrotask(()=>applySession(next));});
 const ready=client.auth.getSession().then(({data,error:e})=>{if(e)throw e;applySession(data.session);return data.session?refresh().catch(()=>null):null;}).catch(e=>{status='error';error=explain(e);emit();});
 async function authenticate(email,password,signup=false,enableWallet=false){if(busy)throw new Error('请等待上一次操作完成。');busy=true;emit();try{const {prepareFamilyPassword}=await import(passwordModule);const credential=await prepareFamilyPassword(email,password);const r=signup?await client.auth.signUp({email:email.trim(),password:credential,options:{data:{powerup_wallet_opt_in:!!enableWallet}}}):await client.auth.signInWithPassword({email:email.trim(),password:credential});if(r.error)throw r.error;if(!r.data.session)return {needsEmailConfirmation:true};applySession(r.data.session);await refresh();return r.data;}catch(e){throw new Error(explain(e));}finally{busy=false;emit();}}
 function pendingKey(action,args){return 'powerup-cloud-request-v1:'+session.user.id+':'+action+':'+JSON.stringify(args);}
 async function write(action,args={}){
  if(!session||!snapshot||status!=='connected')throw new Error('请先连接家庭并刷新最新记录。');
  if(busy)throw new Error('上一项操作正在保存，请稍候。');
  const uid=session.user.id,key=pendingKey(action,args);let id;
  try{id=localStorage.getItem(key);if(!id){id=crypto.randomUUID();localStorage.setItem(key,id);}}catch{throw new Error('浏览器暂时无法保存操作编号，请允许网站存储后再试。');}
  busy=true;error='';emit();
  try{const result=await rpc(action,{p_request:id,...args});localStorage.removeItem(key);if(session?.user.id===uid)await refresh().catch(()=>{});return result;}
  catch(e){error=explain(e)+' 如结果尚未确认，请用原操作重试。';emit();throw new Error(error);}
  finally{busy=false;emit();}
 }
 async function accountAction(name,args){if(busy)throw new Error('请等待上一次操作完成。');busy=true;emit();try{const r=await rpc(name,args);await refresh();return r;}catch(e){throw new Error(explain(e));}finally{busy=false;emit();}}
 async function requestDevice(name){if(busy)throw new Error('请等待上一次操作完成。');busy=true;emit();try{
  if(session&&!session.user.is_anonymous)throw new Error('当前是家长账号。孩子设备请先退出账号，再申请连接码。');
  if(!session){const r=await client.auth.signInAnonymously();if(r.error)throw r.error;applySession(r.data.session);}
  return await rpc('request_child_device',{p_name:name});
 }catch(e){throw new Error(explain(e));}finally{busy=false;emit();}}
 async function logout(){const {error:e}=await client.auth.signOut({scope:'local'});if(e)throw new Error(explain(e));applySession(null);}
 setInterval(()=>{if(document.visibilityState==='visible'&&session)refresh().catch(()=>{});},15000);
 window.addEventListener('online',scheduleRefresh);window.addEventListener('focus',scheduleRefresh);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&session)scheduleRefresh();});
 window.PowerUpCloud={ready,state:view,onChange(fn){listeners.add(fn);return()=>listeners.delete(fn);},refresh,authenticate,logout,requestDevice,
  createFamily:(name,parent,enableWallet=false)=>accountAction('learning_create_family',{p_name:name,p_parent_name:parent,p_enable_wallet:!!enableWallet}),
  setWalletEnabled:enabled=>accountAction('learning_set_wallet_enabled',{p_enabled:!!enabled}),
  joinFamily:(token,name)=>accountAction('join_family',{p_token:token,p_name:name}),
  createInvite:()=>accountAction('create_invite',{p_role:'parent'}),
  connectDevice:code=>accountAction('connect_child_device',{p_code:code}),
  removeMember:id=>accountAction('remove_member',{p_user:id}),
  setMastery:(word,mastered)=>write('learning_set_mastery',{p_word_key:word,p_mastered:mastered}),
  claimSticker:(slot,id)=>write('learning_claim_sticker',{p_slot:slot,p_sticker_id:id}),
  reviewSticker:(claim,word)=>write('learning_review_sticker',{p_claim_id:claim,p_word_key:word}),
  movePokemon:(claim,x,y)=>write('learning_move_pokemon',{p_claim_id:claim,p_x:x,p_y:y}),
  pokemonAction:(claim,action,slot=null,value=null)=>write('learning_pokemon_action',{p_claim_id:claim,p_action:action,p_slot:slot,p_value:value}),
  redeemStickers:ids=>write('learning_redeem_stickers',{p_claim_ids:[...ids].sort()}),
  walletUrl:config.walletUrl,explain};
})();
