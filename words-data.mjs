import {WORDS,EXTRA,RETIRED_CORE,RETIRED_EXTRA,identify,aid} from './content.js?v=11';
import {FAMILY,BODY,BODY_ART,PICTURES} from './unit2-content.mjs?v=5';

import {UNITS} from './units.mjs?v=6';
import {CORE as UNIT4_CORE,EXTRA as UNIT4_EXTRA,ART_RECTS} from './unit4/content.mjs?v=1';
import {CORE as UNIT5_CORE,SHAPES as UNIT5_SHAPES} from './unit5/content.mjs?v=1';
import {words as unit6Words} from './unit6/words.mjs';
import {words as unit7Words} from './unit7/words.mjs';
export {UNITS};

const schoolEntry=w=>({unit:1,id:w.id,word:w.word,zh:w.zh,category:w.category,art:{kind:'unit1',item:w},example:identify(w,1,'full'),exampleMany:identify(w,3,'full'),wordClip:aid('word',w,1),wordClipMany:w.countable?aid('word',w,3):null,exampleClip:aid('identify-full',w,1),exampleClipMany:w.countable?aid('identify-full',w,3):null,plural:w.plural,countable:w.countable,note:!w.countable?'paper 表示纸，不加 a，也不直接加 s。':''});
const one=WORDS.map(schoolEntry);
const positionWords=new Set(['in','on','under','next to']);
const cooperationWords=new Set(['help','listen','share','work together']);
const extraEntry=w=>({unit:1,id:w.id,word:w.word,zh:w.zh,category:positionWords.has(w.word)?'位置表达':cooperationWords.has(w.word)?'校园合作':'历史补充',example:w.example,meaning:w.meaning,wordClip:'extra-word_'+w.id,exampleClip:'extra-example_'+w.id,art:{kind:'text',label:w.word},note:positionWords.has(w.word)?'本单元重点位置表达，配合 Where…? 句型练习。':cooperationWords.has(w.word)?'官方学生用书第13页：校园合作词框中的学习表达。':'已从常规词表移出，保留旧贴纸绑定记录。'});
const extras=EXTRA.map(extraEntry);
// Retained only for old sticker word groups; excluded from learning lists.
export const RETIRED_VOCABULARY=[...RETIRED_CORE.map(schoolEntry),...RETIRED_EXTRA.map(extraEntry)].map(w=>({...w,key:'unit1:'+w.id}));
const family=FAMILY.map(w=>({unit:2,id:w.id,word:w.word,alias:w.formal!==w.word?w.formal:'',zh:w.zh,category:'家人',art:{kind:'image',file:w.image},example:'This is my '+w.word+'.'}));
const body=BODY.map(w=>({unit:2,id:w.id,word:w.word,zh:w.zh,category:'身体',art:{kind:'image',file:BODY_ART[w.id]},example:w.say}));
const looks=[
 ['green eyes','绿色的眼睛',PICTURES.sister,'She has got green eyes.'],
 ['blue eyes','蓝色的眼睛',PICTURES.sisterBlue,'She has got blue eyes.'],
 ['brown hair','棕色的头发',PICTURES.sister,'She has got brown hair.'],
 ['black hair','黑色的头发',PICTURES.brother,'He has got black hair.'],
 ['red hair','红色的头发',PICTURES.lily,'She has got red hair.']
].map(([word,zh,file,example])=>({unit:2,id:word.replaceAll(' ','-'),word,zh,category:'外貌词组',art:{kind:'image',file},example,wordAudio:false}));
const two=[...family,...body,{unit:2,id:'family',word:'family',zh:'家人／家庭',category:'家人',art:{kind:'image',file:PICTURES.lily},example:'This is my family.'},{unit:2,id:'feet',word:'feet',zh:'双脚（foot 的复数）',category:'身体',art:{kind:'image',file:BODY_ART.feet},example:'Touch your feet.'},...looks];
const atlas=(sheet,rect,extra={})=>({kind:'atlas',sheet,rect,...extra});
export const SHEETS={animals:{file:'animals.png',width:1448,height:1086},comparisons:{file:'comparisons.png',width:1024,height:1536},feelings:{file:'feelings.png',width:1536,height:1024},products:{file:'products.png',width:1774,height:887},story:{file:'story.png',width:1536,height:1024}};
const animalData=[
 ['cow','牛',[13,45,400,358],'cows'],['donkey','驴',[417,5,298,402],'donkeys'],['horse','马',[742,1,367,408],'horses'],['goat','山羊',[1159,26,281,382],'goats'],['cat','猫',[43,408,238,333],'cats'],['dog','狗',[402,418,292,334],'dogs'],['sheep','绵羊',[765,420,310,332],'sheep'],['chicken','鸡',[1133,412,255,343],'chickens'],['duck','鸭',[35,747,255,312],'ducks'],['spider','蜘蛛',[369,816,317,206],'spiders']
];
const animals=animalData.map(([word,zh,rect,plural])=>({unit:3,id:word,word,zh,plural,category:'农场动物',art:atlas('animals',rect),example:'It is a '+word+'.',note:word==='sheep'?'sheep 的单数和复数相同。':word==='spider'?'蜘蛛有八条腿，不是六条腿的昆虫。':''}));
const adjectives=[
 {word:'big',zh:'大的',art:atlas('comparisons',[0,0,534,372],{repeat:2}),example:'They are big cows.',note:'big 说的是大小。'},
 {word:'small',zh:'小的',art:atlas('comparisons',[534,0,490,372]),example:'It is small.',note:'small 说的是体型小，不等于年幼。'},
 {word:'new',zh:'新的',art:atlas('comparisons',[0,749,512,281]),note:'这个箱子刚做好；new 在这里表示新的。'},
 {word:'old',zh:'年老的／旧的',art:atlas('comparisons',[0,1036,512,500]),example:'It is an old sheep.',note:'形容这只绵羊时表示年老；形容用过很久的物品时也表示旧的。'},
 {word:'young',zh:'年幼的',art:atlas('comparisons',[512,1036,512,500]),note:'故事先介绍了这是一只年幼的羊。年龄不只靠体型来判断。'},
 {word:'nice',zh:'友好的／令人喜欢的',art:{kind:'image',file:'unit3/assets/nice.png'},example:'It is a nice cat.',note:'小猫主动帮小羊送回球。nice 在这里表示友好的。'},
 {word:'long',zh:'长的',art:atlas('comparisons',[0,373,512,375]),example:'It has got a long tail.',note:'这次只观察猫的尾巴。'},
 {word:'short',zh:'短的',art:atlas('comparisons',[512,373,512,375]),example:'It has got a short tail.',note:'这次只观察猫的尾巴。'}
].map(w=>({unit:3,id:w.word,category:'特征与形容词',...w}));
const feelings=[['happy','开心的','这只狗笑起来了，看起来很开心。'],['sad','难过的','这只狗低着头，眼里有泪。'],['angry','生气的','这只狗皱起眉头，身体绷得紧紧的。'],['funny','有趣的／滑稽的','它把叶子当帽子。funny 不等于 happy。'],['beautiful','漂亮的','这是故事里角色对花的画的评价；你也可以有不同看法。'],['ugly','丑的','这是故事里角色对怪兽画的评价；你也可以有不同看法。']].map(([word,zh,note],i)=>({unit:3,id:word,word,zh,note,category:'心情与感受',art:atlas('feelings',i<3?[i*512,0,512,451]:[(i-3)*512,450,512,574]),...(word==='happy'?{example:'It is happy.'}:{})}));
const products=[['milk','牛奶',[904,24,396,379],'Milk comes from cows.'],['eggs','鸡蛋',[1332,64,440,337],'Eggs come from chickens.'],['honey','蜂蜜',[449,20,430,389],'Honey comes from bees.'],['wool','羊毛',[0,455,443,422],'Wool comes from sheep.']].map(([word,zh,rect,example])=>({unit:3,id:word,word,zh,category:'动物产品',art:atlas('products',rect),example}));
const reading=[
 {word:'bee',zh:'蜜蜂',art:atlas('products',[0,0,443,414]),example:'Honey comes from bees.'},
 {word:'alpaca',zh:'羊驼',art:atlas('products',[453,416,430,460]),example:'This is an alpaca.'},
 {word:'flies',zh:'苍蝇（fly 的复数）',art:atlas('story',[0,0,503,503]),example:'The flies bother her.',note:'图中围着凯西的这些小虫是苍蝇。故事与阅读补充词。'}
].map(w=>({unit:3,id:w.word,category:'故事与阅读',...w}));
const unit4Sheets={foodA:{file:'foodA.png',width:1983,height:793,cols:5,rows:2},foodB:{file:'foodB.png',width:1254,height:1254,cols:3,rows:3},ingredients:{file:'ingredients.png',width:1254,height:1254,cols:3,rows:3}};
for(const [id,s] of Object.entries(unit4Sheets))SHEETS['unit4-'+id]={...s,base:'unit4/assets/'};
const four=[...UNIT4_CORE,...UNIT4_EXTRA].map(w=>{const s=unit4Sheets[w.sheet],width=s.width/s.cols,height=s.height/s.rows;return {unit:4,id:w.id,word:w.word,alias:w.alias,zh:w.zh,category:w.category,art:atlas('unit4-'+w.sheet,ART_RECTS[w.sheet]?.[w.index]||[w.index%s.cols*width,Math.floor(w.index/s.cols)*height,width,height]),example:w.example,note:w.note};});
const five=[...UNIT5_CORE,...UNIT5_SHAPES].map(w=>({unit:5,id:w.id,word:w.word,audioWord:w.audioWord,alias:w.alias,zh:w.zh,category:w.category,art:{kind:'image',file:'unit5/assets/'+w.id+(w.shape?'.svg':'.webp')},example:w.example,note:w.note}));
const six = unit6Words.map(w => ({...w, unit: 6, art: {kind: 'image', file: 'unit6/art/' + w.id + '.webp'}}));
const seven = unit7Words.map(w => ({...w, unit: 7, art: {kind: 'image', file: 'unit7/art/' + (w.artId || w.id) + '.webp'}}));
export const VOCABULARY=[...one,...extras,...two,...animals,...adjectives,...feelings,...products,...reading,...four,...five,...six,...seven].map(w=>({...w,key:'unit'+w.unit+':'+w.id}));
export const CATEGORIES=Object.fromEntries(UNITS.map(u=>[u.id,[...new Set(VOCABULARY.filter(w=>w.unit===u.id).map(w=>w.category))]]));
