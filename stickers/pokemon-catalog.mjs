const form=(id,name,tone,dex,charm)=>({id,name,tone,dex,charm});
export const starters=[
 {id:21,forms:[form('bulbasaur','妙蛙种子','leaf',1,'seed'),form('ivysaur','妙蛙草','leaf',2,'bud'),form('venusaur','妙蛙花','leaf',3,'bloom')]},
 {id:22,forms:[form('charmander','小火龙','fire',4,'ember'),form('charmeleon','火恐龙','fire',5,'embers'),form('charizard','喷火龙','fire',6,'flame')]},
 {id:23,forms:[form('squirtle','杰尼龟','water',7,'drop'),form('wartortle','卡咪龟','water',8,'ripple'),form('blastoise','水箭龟','water',9,'fountain')]}
];
export const eevee=form('eevee','伊布','trail',133,'paw');
export const evolutions=[
 form('vaporeon','水伊布','water',134,'wave'),form('jolteon','雷伊布','sun',135,'bolt'),
 form('flareon','火伊布','fire',136,'flare'),form('espeon','太阳伊布','dawn',196,'sunrise'),
 form('umbreon','月亮伊布','moon',197,'moon'),form('leafeon','叶伊布','leaf',470,'leaves'),
 form('glaceon','冰伊布','ice',471,'snow'),form('sylveon','仙子伊布','ribbon',700,'bow')
];
export const stageOf=c=>c?.final_at?2:c?.upgraded_at?1:0;
export const starterFor=id=>starters.find(s=>s.id===id);
export const pokemonForm=(claim,cover=false)=>{
 const starter=starterFor(claim.sticker_id);
 if(starter)return starter.forms[cover?(claim.cover_stage??stageOf(claim)):stageOf(claim)];
 return evolutions.find(f=>f.id===claim.eevee_form)||eevee;
};
export function pokemonArt(f,extra=''){
 return `<span class="pokemon-art tone-${f.tone} ${extra}"><img src="assets/pokemon/characters/${f.id}.webp" width="400" height="400" alt="${f.name}" loading="lazy" decoding="async"></span>`;
}
export function pokemonReward(claim){
 const f=pokemonForm(claim);
 return {name:f.name,art:pokemonArt(f)};
}
