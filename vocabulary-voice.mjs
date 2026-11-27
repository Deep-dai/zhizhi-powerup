const normalize=t=>String(t).replace(/[‘’]/g,"'").replace(/\s+/g,' ').trim().replace(/[.!?。！？]+$/,'').toLowerCase();
async function jsonFile(file,fallback){try{const r=await fetch(new URL(file,import.meta.url));return r.ok?await r.json():fallback;}catch{return fallback;}}
async function importedClips(name){return new Promise(resolve=>{try{const request=indexedDB.open(name,1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('clips'))request.result.createObjectStore('clips');};request.onerror=()=>resolve(new Map());request.onblocked=()=>resolve(new Map());request.onsuccess=()=>{const db=request.result,result=new Map();try{const tx=db.transaction('clips','readonly'),cursor=tx.objectStore('clips').openCursor();cursor.onsuccess=()=>{const c=cursor.result;if(c){if(c.value instanceof Blob)result.set(c.key,c.value);c.continue();}};tx.oncomplete=()=>{db.close();resolve(result);};tx.onerror=()=>{db.close();resolve(result);};}catch{db.close();resolve(result);}};}catch{resolve(new Map());}});}
export async function loadVocabularyVoice(){
 const [unit1Audio,unit2List,unit2Audio,unit3,unit4,unit5,unit6,unit7,imported1,imported2]=await Promise.all([
  jsonFile('audio/published.json',{}),jsonFile('unit2-audio.json',[]),jsonFile('audio/unit2/published.json',{}),
  jsonFile('unit3/audio-manifest.json',[]),jsonFile('unit4/audio-manifest.json?v=g25-boundaries-3',[]),
  jsonFile('unit5/audio-manifest.json?v=1',[]),jsonFile('unit6/audio-manifest.json',[]),jsonFile('unit7/audio-manifest.json',[]),
  importedClips('bunny-school-audio-v1'),importedClips('flower-unit2-audio-v1')
 ]);
 const unit2Clips=new Map(unit2List.map(clip=>[normalize(clip.text),clip]));
 const catalog=(clips,unit)=>new Map(clips.filter(clip=>clip.lang==='en').map(clip=>[normalize(clip.text),'unit'+unit+'/audio/'+clip.file]));
 const unitAudio=new Map([[3,catalog(unit3,3)],[4,catalog(unit4,4)],[5,catalog(unit5,5)],[6,catalog(unit6,6)],[7,catalog(unit7,7)]]);
 const url=file=>file?new URL(file,import.meta.url).href:null;
 return (w,kind,many=false)=>{
  if(w.unit===1){
   const id=kind==='example'?(many?w.exampleClipMany:w.exampleClip):(many?w.wordClipMany:w.wordClip);
   return imported1.get(id)||(unit1Audio[id]?url('audio/'+unit1Audio[id]):null);
  }
  const text=kind==='alias'?w.alias:kind==='example'?w.example:(w.audioWord||w.word);
  if(w.unit===2){
   const clip=unit2Clips.get(normalize(text));
   return clip?(imported2.get(clip.id)||url(unit2Audio[clip.id])):null;
  }
  return url(unitAudio.get(w.unit)?.get(normalize(text)));
 };
}
