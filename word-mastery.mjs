export const MASTERY_KEY='powerup-word-dictation-v1';
export function parseMastery(raw,validKeys){
  const parsed=JSON.parse(raw||'{"version":1,"mastered":{}}');
  if(!parsed||parsed.version!==1||!parsed.mastered||typeof parsed.mastered!=='object'||Array.isArray(parsed.mastered))throw new Error('Invalid saved mastery');
  const result={};
  for(const [key,value] of Object.entries(parsed.mastered))if(validKeys.has(key)&&value&&typeof value==='object'&&typeof value.at==='string')result[key]={at:value.at};
  return result;
}
export function filterWords(words,{unit='all',category='全部',mastery='all',query=''},mastered){
  const text=String(query).trim().toLowerCase();
  return words.filter(w=>(unit==='all'||w.unit===Number(unit))&&(category==='全部'||w.category===category)&&(mastery==='all'||(mastery==='mastered'?Boolean(mastered[w.key]):!mastered[w.key]))&&(!text||[w.word,w.alias,w.zh,w.plural].filter(Boolean).join(' ').toLowerCase().includes(text)));
}
