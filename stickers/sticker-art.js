(function(root){
  'use strict';
  let sequence=0;
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  root.renderStickerArt=function(c,upgraded=false,extra=''){
    const form=upgraded?'upgraded':'base',frame=c.frames[form],lazy=extra.includes('lazy');
    const label=c.name+(upgraded?'升级后的'+c.upgradeName:'初遇造型');
    if(frame.asset)return `<span class="sticker-art ${form} ${esc(extra)}" role="img" aria-label="${esc(label)}" data-art-id="${c.id}" data-art-form="${form}"><img src="${esc(frame.asset)}" width="${frame.width}" height="${frame.height}" alt="" loading="${lazy?'lazy':'eager'}" decoding="async" fetchpriority="${extra.includes('hero')?'high':'auto'}" draggable="false"></span>`;
    const clipId='sticker-form-'+(++sequence);
    const [x,y,width,height]=frame.clip;
    return `<span class="sticker-art ${form} ${esc(extra)}" role="img" aria-label="${esc(label)}" data-art-id="${c.id}" data-art-form="${form}"><svg viewBox="${frame.viewBox.join(' ')}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><defs><clipPath id="${clipId}" clipPathUnits="userSpaceOnUse"><rect x="${x}" y="${y}" width="${width}" height="${height}"/></clipPath></defs><image href="${esc(c.asset)}" x="0" y="0" width="${c.sourceSize[0]}" height="${c.sourceSize[1]}" clip-path="url(#${clipId})" preserveAspectRatio="none"/></svg></span>`;
  };
  // Native image loading can fetch ahead of scrolling without repeatedly
  // disconnecting an observer or reconstructing SVG clipping trees.
  const warmed=new Map();
  root.preloadStickerArt=function(c,upgraded=false){
    const src=c.frames[upgraded?'upgraded':'base'].asset||c.asset;
    if(!warmed.has(src))warmed.set(src,new Promise(resolve=>{
      const img=new Image();img.onload=()=>{(img.decode?img.decode():Promise.resolve()).catch(()=>{}).then(resolve);};img.onerror=()=>{warmed.delete(src);resolve();};img.src=src;
    }));
    return warmed.get(src);
  };
})(window);
