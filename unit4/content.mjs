// Teaching adaptation, based on Power Up Level 1 first-edition Unit 4.
// Individually inspected viewports: the generated atlas is not a perfectly even grid.
export const ART_RECTS={
 foodA:[[0,0,370,380],[370,0,425,380],[795,0,395,380],[1190,0,363,380],[1553,0,430,380],[0,385,390,408],[420,385,330,408],[750,385,405,408],[1155,385,443,408],[1630,385,353,408]],
 foodB:[[0,0,414,418],[420,0,410,418],[837,0,417,418],[0,418,420,418],[446,418,335,418],[785,418,469,418],[0,836,433,418],[433,836,425,418],[860,836,394,418]],
 eevee:[[0,0,512,480],[512,0,512,480],[1024,0,512,480],[0,480,512,544],[512,480,512,544],[1024,480,512,544]]
};
const coreRows=[
 ['banana','香蕉','bananas','a banana','foodA',0,'先看弯弯的形状；说喜欢香蕉时用 bananas。'],
 ['bread','面包','bread','some bread','foodA',1,'bread 在这里不直接加 s，也不说 a bread。'],
 ['burger','汉堡','burgers','a burger','foodA',2,'burger 也可以叫 hamburger。'],
 ['cake','蛋糕','cake','a cake','foodA',3,'图上是一整个蛋糕，用 a cake；取一些蛋糕可以说 some cake。'],
 ['chicken','鸡肉','chicken','some chicken','foodA',4,'这里是食物“鸡肉”；Unit 3 的 chicken 是活的鸡。'],
 ['chocolate','巧克力','chocolate','some chocolate','foodA',5,'一些巧克力：some chocolate。'],
 ['lemonade','柠檬饮料','lemonade','some lemonade','foodA',6,'看看杯里的柠檬片，与 juice 和 water 区分。'],
 ['mango','芒果','mangoes','a mango','foodA',7,'本单元复数用 mangoes。'],
 ['salad','沙拉','salad','some salad','foodA',8,'这里是一碗蔬菜沙拉：some salad。'],
 ['water','水','water','some water','foodA',9,'清澈的水，没有柠檬片。'],
 ['apple','苹果','apples','an apple','foodB',0,'一个苹果：an apple。'],
 ['beans','豆子','beans','some beans','foodB',1,'词卡上有许多豆子，用复数 beans。'],
 ['fruit','水果','fruit','some fruit','foodB',2,'fruit 在这里指水果这一类；图里有几种水果。'],
 ['grapes','葡萄','grapes','some grapes','foodB',3,'一串里有多颗葡萄，词卡用 grapes。'],
 ['juice','果汁','juice','some juice','foodB',4,'图上是橙色的果汁，与带柠檬片的 lemonade 区分。'],
 ['meat','肉','meat','some meat','foodB',5,'meat 泛指肉；meatballs 是肉丸，不是 meat 的复数。'],
 ['meatballs','肉丸','meatballs','some meatballs','foodB',6,'圆圆的肉丸：meatballs。'],
 ['orange','橙子','oranges','an orange','foodB',7,'这里是水果“橙子”；不是颜色。'],
 ['sausage','香肠','sausages','a sausage','foodB',8,'说喜欢香肠时常用 sausages。']
];
export const CORE=coreRows.map(([id,zh,like,amount,sheet,index,note],i)=>({id,word:id,zh,like,amount,sheet,index,note,group:i<10?1:2,category:i<10?'核心·野餐食物':'核心·水果与餐食',alias:id==='burger'?'hamburger':'',example:`I like ${like}.`}));
export const EXTRA=[['pasta','意面'],['onions','洋葱'],['potatoes','土豆'],['carrots','胡萝卜'],['tomatoes','西红柿'],['cheese','奶酪'],['rice','米饭']].map(([id,zh],index)=>({id,word:id,zh,sheet:'ingredients',index,category:'食谱补充',note:'食谱中的补充词，单独分类，不计入19个核心词。',example:`We have got some ${id}.`}));
export const EGG={id:'eggs',word:'eggs',zh:'鸡蛋',sheet:'ingredients',index:7,note:'复现 Unit 3 学过的 eggs。'};
export const BY_ID=Object.fromEntries([...CORE,...EXTRA,EGG].map(w=>[w.id,w]));
export const STAGES=[
 ['pantry','野餐食物铺','认识第一组10个食物词','WORDS','认一认'],
 ['fruit','水果与餐食','认识第二组9个核心词','WORDS','认一认'],
 ['listen','伊布听音寻宝','听词找图，覆盖19个核心词','LISTEN','听一听'],
 ['amount','装进小篮子','a、an 与 some 怎样搭配','PACK','说一说'],
 ['likes','我的喜好卡','I like / I don’t like','SAY','说一说'],
 ['friends','朋友喜欢什么','likes / doesn’t like','TELL','说一说'],
 ['ask','问问好朋友','Do you like…?','ASK','说一说'],
 ['repair','句子修理站','主语变了，动词怎样变','BUILD','练一练'],
 ['request','我想要一些','Can I have…?','PLEASE','聊一聊'],
 ['offer','你想来一点吗','Would you like…?','SHARE','聊一聊'],
 ['ingredients','厨房食材架','7个补充词，复现鸡蛋','COOK','做一做'],
 ['recipe','煎蛋卷小厨师','看懂步骤，按顺序排列','RECIPE','做一做'],
 ['story','一起分享野餐','六幅原创故事，理解分享','STORY','读一读'],
 ['picnic','我的野餐计划','选食物，完成自己的分享卡','MISSION','做一做'],
 ['review','出发前小挑战','词汇、语法与交流综合练习','CHECK','练一练'],
 ['sounds','字母 a 观察角','补充观察，不作教材拼读考核','EXTRA','补充',true]
].map(([id,name,desc,tag,group,optional],i)=>({id,name,desc,tag,group,optional:!!optional,n:i+1}));
export const GUIDES={
 home:'和伊布一起准备野餐。先认食物，再问问朋友喜欢什么，最后做出自己的野餐计划。',
 pantry:'点一张食物卡，听听它的英文。这里的 chicken 是鸡肉，不是农场里的活鸡。',
 fruit:'认识九个新词。fruit 是水果这一类，meat 和 meatballs 是不同的词。',
 listen:'先听词，再选图片。做完十九个词，就完成这次听音寻宝。',
 amount:'一个香蕉用 a banana，一个苹果用 an apple。一些面包和一些葡萄，都可以用 some。',
 likes:'这是你自己的喜好，没有标准答案。选一种食物，再选择喜欢或不喜欢，听完整的句子。',
 friends:'伊布自己说 I like。我们介绍伊布时说 Eevee likes。否定句用 doesn’t like，后面不再加 s。',
 ask:'Do you like 问的是平时喜不喜欢。先看这次任务给出的喜好卡，再替伊布回答。',
 repair:'先看主语是谁，再选择动词。遇到 doesn’t，后面的 like 用原形。',
 request:'伊布想向皮卡丘要果汁。看清谁在请求、谁在递给对方，再练习一整段对话。',
 offer:'皮卡丘主动请伊布吃苹果。Would you like 是问现在要不要，回答可以说 Yes, please 或 No, thank you。',
 ingredients:'这些是食谱里的补充词。鸡蛋是第三单元学过的词，现在再来用一次。',
 recipe:'在屏幕上安排做菜步骤。实际切菜和使用炉灶要由大人操作。',
 story:'伊布和皮卡丘带来了不同的食物。他们怎样让野餐变得更开心？看图听故事。',
 picnic:'选至少三种食物或饮料，记得给朋友准备喝的，再练一句请求和一句邀请。',
 review:'带着词汇和句子出发吧。做对练习不会自动变成听写已掌握，听写仍由家长确认。',
 sounds:'看看 apple、banana 和 cake 中的字母 a。听完整单词，发现同一个字母在不同词里可以读得不同。'
};
export const PREFS=[
 {who:'Eevee',cn:'伊布',food:'apple',yes:true,scene:0,sentence:'Eevee likes apples.',self:'I like apples.'},
 {who:'Eevee',cn:'伊布',food:'meat',yes:false,scene:1,sentence:"Eevee doesn’t like meat.",self:"I don’t like meat."},
 {who:'Pikachu',cn:'皮卡丘',food:'banana',yes:true,scene:2,sentence:'Pikachu likes bananas.',self:'I like bananas.'},
 {who:'Pikachu',cn:'皮卡丘',food:'bread',yes:false,scene:3,sentence:"Pikachu doesn’t like bread.",self:"I don’t like bread."}
];
export const REQUEST=[
 {who:'伊布 · 请求者',text:'Can I have some juice, please?',zh:'请给我一些果汁，好吗？',scene:0},
 {who:'皮卡丘 · 递给对方',text:'Here you are.',zh:'给你。',scene:1},
 {who:'伊布 · 收到后感谢',text:'Thank you.',zh:'谢谢你。',scene:1}
];
export const OFFER=[
 {who:'皮卡丘 · 提供者',text:'Would you like an apple?',zh:'你想吃一个苹果吗？',scene:2},
 {who:'伊布 · 接受',text:'Yes, please.',zh:'好的，谢谢。',scene:3},
 {who:'皮卡丘 · 递给对方',text:'Here you are.',zh:'给你。',scene:3},
 {who:'伊布 · 感谢',text:'Thank you.',zh:'谢谢你。',scene:3}
];
export const RECIPE=[
 {text:'We have got eggs, cheese, an onion and tomatoes.',zh:'准备鸡蛋、奶酪、一个洋葱和西红柿。',verb:'ingredients'},
 {text:'Cut the onion and tomatoes.',zh:'切洋葱和西红柿。',verb:'cut'},
 {text:'Mix the eggs.',zh:'搅拌鸡蛋。',verb:'mix'},
 {text:'Cook the eggs.',zh:'烹饪鸡蛋。',verb:'cook'},
 {text:'Put the vegetables and cheese on the omelette.',zh:'把蔬菜和奶酪放在煎蛋卷上。',verb:'put'},
 {text:'Fold the omelette.',zh:'把煎蛋卷折起来。',verb:'fold'}
];
export const STORY=[
 {who:'旁白',text:'Eevee has got bread, bananas and apples.',zh:'伊布带来了面包、香蕉和苹果。'},
 {who:'旁白',text:'Pikachu has got grapes and juice.',zh:'皮卡丘带来了葡萄和果汁。'},
 {who:'伊布',text:'I like apples. Do you like apples?',zh:'我喜欢苹果。你喜欢苹果吗？'},
 {who:'伊布 → 皮卡丘',text:'Would you like an apple?',zh:'你想吃一个苹果吗？'},
 {who:'皮卡丘 → 伊布',text:'Would you like some juice?',zh:'你想喝一些果汁吗？'},
 {who:'旁白',text:'They share their food. It is a happy picnic.',zh:'他们分享食物。这是一次开心的野餐。'}
];
const q=(prompt,options,answer,explain,extra={})=>({prompt,options,answer,explain,...extra});
export const AMOUNT_Q=[
 q('___ banana',['a','an','some'],'a','banana 以辅音音素开头；这里是一个香蕉。',{food:'banana'}),
 q('___ apple',['a','an','some'],'an','apple 以元音音素开头；这里是一个苹果。',{food:'apple'}),
 q('___ orange',['a','an','some'],'an','orange 以元音音素开头；这里是一个橙子。',{food:'orange'}),
 q('___ bread',['a','an','some'],'some','一些面包：some bread。',{food:'bread'}),
 q('___ grapes',['a','an','some'],'some','这些是多颗葡萄，用 some grapes。',{food:'grapes'}),
 q('___ water',['a','an','some'],'some','一些水：some water。',{food:'water'})
];
export const REPAIR_Q=[
 q('I ___ apples.',['like','likes'],'like','I 后面用 like。'),
 q('Eevee ___ apples.',['like','likes'],'likes','一个角色名字作主语，肯定句用 likes。'),
 q('Pikachu ___ bananas.',['like','likes'],'likes','介绍皮卡丘，用 Pikachu likes。'),
 q('Eevee doesn’t ___ meat.',['like','likes'],'like','doesn’t 已经帮助表示否定，后面的 like 用原形。'),
 q('I ___ like meat.',['don’t','doesn’t'],'don’t','I 不喜欢：I don’t like。'),
 q('Pikachu ___ like bread.',['don’t','doesn’t'],'doesn’t','介绍一个角色，用 doesn’t like。'),
 q('Do you ___ apples?',['like','likes'],'like','Do you like…? 中用 like。'),
 q('Would you like an apple?',['Yes, I do.','Yes, please.'],'Yes, please.','对方正在提供苹果，可以回答 Yes, please。')
];
export const OFFER_Q=[
 q('想知道朋友平时喜不喜欢苹果，你会问：',['Do you like apples?','Would you like an apple?'],'Do you like apples?','Do you like…? 询问平时的喜好。'),
 q('手里拿着苹果，想请朋友现在吃一个，你会问：',['Do you like apples?','Would you like an apple?'],'Would you like an apple?','Would you like…? 是当下主动提供。'),
 q('Would you like some juice?',['No, I don’t.','No, thank you.'],'No, thank you.','不想喝时也可以礼貌拒绝。'),
 q('Do you like juice?',['Yes, I do.','Yes, please.'],'Yes, I do.','问喜好，短回答用 do。'),
 q('想请对方给自己一些水，你会说：',['Can I have some water, please?','Would you like some water?'],'Can I have some water, please?','Can I have…? 是我向对方提出请求。'),
 q('朋友递给你果汁后，你会说：',['Thank you.','Do you like juice?'],'Thank you.','收到对方提供的食物后，表达感谢。')
];
export const STORY_Q=[
 q('谁带来了果汁？',['伊布','皮卡丘'],'皮卡丘','第二幅：Pikachu has got grapes and juice.'),
 q('伊布请皮卡丘吃什么？',['一个苹果','一些肉'],'一个苹果','第四幅：Would you like an apple?'),
 q('他们怎样让野餐更开心？',['把自己的食物藏起来','一起分享食物'],'一起分享食物','最后他们分享不同的食物，一起享用。')
];
export const REVIEW_Q=[
 q('听一听，选出食物。',['lemonade','juice','water'],'lemonade','柠檬饮料是 lemonade。',{audio:'lemonade',pictures:true}),
 q('听一听，选出食物。',['meat','meatballs','chicken'],'meatballs','肉丸是 meatballs，不是 meat 的复数。',{audio:'meatballs',pictures:true}),
 ...AMOUNT_Q.filter(x=>['apple','bread'].includes(x.food)),
 ...REPAIR_Q.filter((x,i)=>[1,3,4,6].includes(i)),
 ...OFFER_Q.filter((x,i)=>[0,1,2,4].includes(i))
];
export const DIALOGUE_SENTENCES=[...REQUEST,...OFFER,{text:'No, thank you.'}].map(x=>x.text);
export function audioTexts(){
 const en=new Set(['Eevee','Pikachu','Food with friends.','Let’s organise a picnic!','Yes, I do.',"No, I don’t.",'Yes, please.','No, thank you.','Here you are.','Thank you.','a banana','an apple','an orange','some grapes','some bread','some water']);
 for(const w of [...CORE,...EXTRA,EGG]){en.add(w.word);if(w.alias)en.add(w.alias);if(w.like)en.add(w.like);if(w.example)en.add(w.example);if(w.amount)en.add(w.amount);}
 for(const w of CORE){en.add(`I like ${w.like}.`);en.add(`I don’t like ${w.like}.`);en.add(`Do you like ${w.like}?`);en.add(`Can I have ${w.amount}, please?`);en.add(`Would you like ${w.amount}?`);}
 for(const a of [...PREFS.flatMap(p=>[p.sentence,p.self]),...DIALOGUE_SENTENCES,...RECIPE.map(x=>x.text),...STORY.map(x=>x.text),...REPAIR_Q.flatMap(x=>x.options.filter(s=>/[.!?]$/.test(s))),...OFFER_Q.flatMap(x=>x.options)])en.add(a);
 for(const v of ['cut','mix','cook','put','fold','recipe','omelette','sandwich','picnic'])en.add(v);
 return [...[...en].map(text=>({lang:'en',text})),...Object.values(GUIDES).map(text=>({lang:'zh',text}))];
}
