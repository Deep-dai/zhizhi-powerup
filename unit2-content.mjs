const A='assets/unit2/';
export const PICTURES={
 flower:A+'小红花-角色立绘.webp',
 lily:A+'女孩-红发蓝眼.webp',
 sister:A+'女孩-棕发绿眼.webp',
 sisterBlue:A+'女孩-棕发蓝眼-对照.webp',
 brother:A+'男孩-黑发棕眼.webp',
 mum:A+'母亲-棕发棕眼.webp',
 dad:A+'父亲-黑发棕眼.webp',
 grandma:A+'祖母-银发绿眼.webp',
 grandpa:A+'祖父-银发棕眼.webp',
 body:A+'身体地图-女孩全身.webp',
 bunny:A+'灰兔-侧身尾巴-v2.webp'
};

export const FAMILY=[
 {id:'mum',word:'mum',formal:'mother',zh:'妈妈',pronoun:'she',image:PICTURES.mum,hair:'brown',eyes:'brown'},
 {id:'dad',word:'dad',formal:'father',zh:'爸爸',pronoun:'he',image:PICTURES.dad,hair:'black',eyes:'brown'},
 {id:'sister',word:'sister',formal:'sister',zh:'姐姐／妹妹',pronoun:'she',image:PICTURES.sister,hair:'brown',eyes:'green'},
 {id:'brother',word:'brother',formal:'brother',zh:'哥哥／弟弟',pronoun:'he',image:PICTURES.brother,hair:'black',eyes:'brown'},
 {id:'grandma',word:'grandma',formal:'grandmother',zh:'奶奶／外婆',pronoun:'she',image:PICTURES.grandma,hair:'silver',eyes:'green'},
 {id:'grandpa',word:'grandpa',formal:'grandfather',zh:'爷爷／外公',pronoun:'he',image:PICTURES.grandpa,hair:'silver',eyes:'brown'}
];

// The dots are visual targets for this generated artwork, not anatomical coordinates.
// Each question shows only three dots so adjacent face parts remain tappable on phones.
export const BODY=[
 {id:'hair',word:'hair',zh:'头发',group:'face',target:[51,20],others:[[21,51],[50,67]],say:'Touch the hair.'},
 {id:'head',word:'head',zh:'头',group:'face',target:[51,33],others:[[22,51],[50,67]],say:'Touch the head.'},
 {id:'face',word:'face',zh:'脸',group:'face',target:[42,56],others:[[51,20],[21,51]],say:'Touch the face.'},
 {id:'eye',word:'eye',zh:'眼睛',group:'face',target:[40,47],others:[[21,52],[50,65]],say:'Touch an eye.'},
 {id:'ear',word:'ear',zh:'耳朵',group:'face',target:[21,52],others:[[42,46],[50,66]],say:'Touch an ear.'},
 {id:'nose',word:'nose',zh:'鼻子',group:'face',target:[50,55],others:[[39,46],[50,67]],say:'Touch the nose.'},
 {id:'mouth',word:'mouth',zh:'嘴巴',group:'face',target:[50,67],others:[[39,46],[21,52]],say:'Touch the mouth.'},
 {id:'body',word:'body',zh:'身体',group:'body',target:[50,45],others:[[20,57],[39,78]],say:'Touch the body.'},
 {id:'arm',word:'arm',zh:'手臂',group:'body',target:[23,51],others:[[12,62],[42,78]],say:'Touch an arm.'},
 {id:'hand',word:'hand',zh:'手',group:'body',target:[12,62],others:[[23,51],[42,78]],say:'Touch a hand.'},
 {id:'leg',word:'leg',zh:'腿',group:'body',target:[41,78],others:[[23,51],[35,94]],say:'Touch a leg.'},
 {id:'foot',word:'foot',zh:'脚',group:'body',target:[35,94],others:[[41,78],[12,62]],say:'Touch a foot.'},
 {id:'tail',word:'tail',zh:'尾巴',group:'bunny',target:[92,45],others:[[72,70],[24,69]],say:'Touch the tail.'}
];
export const BODY_ART={...Object.fromEntries(BODY.map(part=>[part.id,A+'word-'+part.id+'.webp'])),feet:A+'word-feet.webp'};
export const GRAMMAR_SCENES={
 girl:{self:A+'scene-self-girl.webp',direct:A+'scene-direct-girl.webp',about:A+'scene-about-girl.webp'},
 boy:{self:A+'scene-self-boy.webp',direct:A+'scene-direct-boy.webp',about:A+'scene-about-boy.webp'},
 flower:{self:A+'scene-self-flower.webp'}
};

const q=(id,cue,image,options,correct,answer,explain='',say='')=>({id,type:'choice',cue,image,options,correct,answer,explain,say});
const pick=(id,say,cue,images,correct,explain='')=>({id,type:'images',cue,images,correct,answer:say,explain,say});

export const LESSONS=[
 {id:'speaker',name:'我、你、她的三个镜头',tag:'01',skill:'I / you / she / he',intro:'同一个女孩，镜头一转，说法就变。',examples:[
   {who:'照镜子',text:'I’ve got green eyes.',image:PICTURES.sister},
   {who:'面对面',text:'You’ve got green eyes.',image:PICTURES.sister},
   {who:'看相框',text:'She has got green eyes.',image:PICTURES.sister}
 ],tasks:[
   q('sp1','女孩照镜子，说自己的眼睛。',PICTURES.sister,['I’ve got green eyes.','You’ve got green eyes.','She has got green eyes.'],0,'I’ve got green eyes.','女孩自己说「我」，所以用 I。'),
   q('sp2','小红花对女孩说话。',PICTURES.sister,['She has got green eyes.','You’ve got green eyes.','I’ve got green eyes.'],1,'You’ve got green eyes.','面对女孩说「你」，所以用 you。'),
   q('sp3','小红花向枝枝介绍女孩。',PICTURES.sister,['I’ve got green eyes.','She has got green eyes.','You’ve got green eyes.'],1,'She has got green eyes.','向别人介绍一个女孩，用 she。'),
   q('sp4','小红花介绍这个男孩。',PICTURES.brother,['He has got black hair.','I’ve got black hair.','You’ve got black hair.'],0,'He has got black hair.','向别人介绍一个男孩，用 he。'),
   q('sp5','小红花说自己的眼睛。',PICTURES.flower,['She has got two eyes.','I’ve got two eyes.','You’ve got two eyes.'],1,'I’ve got two eyes.','小红花自己说「我」，用 I。')
 ]},
 {id:'have-has',name:'have 还是 has？',tag:'02',skill:'I / you → have · he / she → has',intro:'我和你用 have；说一个他或她，用 has。先看谁是句子的主角。',examples:[
   {who:'面对面',text:'You have got green eyes.',image:PICTURES.sister},
   {who:'看相框',text:'She has got green eyes.',image:PICTURES.sister}
 ],tasks:[
   q('hh1','小红花自己说：I ___ got two eyes.',PICTURES.flower,['have','has'],0,'I have got two eyes.','I 后面用 have。'),
   q('hh2','小红花对女孩说：You ___ got green eyes.',PICTURES.sister,['has','have'],1,'You have got green eyes.','You 后面用 have。'),
   q('hh3','小红花向枝枝说：She ___ got green eyes.',PICTURES.sister,['have','has'],1,'She has got green eyes.','说一个她，用 has。'),
   q('hh4','小红花向枝枝说：He ___ got black hair.',PICTURES.brother,['has','have'],0,'He has got black hair.','说一个他，用 has。'),
   q('hh5','女孩自己说：I ___ got brown hair.',PICTURES.sister,['has','have'],1,'I have got brown hair.','女孩自己说话时，用 I have。')
 ]},
 {id:'mirror',name:'魔法镜换说法',tag:'03',skill:'同一幅图，三种视角',intro:'人和眼睛没有变；谁说话、对谁说变了。',examples:[
   {who:'照镜子',text:'I’ve got green eyes.',image:PICTURES.sister},
   {who:'面对面',text:'You’ve got green eyes.',image:PICTURES.sister},
   {who:'看相框',text:'She has got green eyes.',image:PICTURES.sister}
 ],tasks:[
   q('mi1','女孩自己说「我有棕色头发」。',PICTURES.sister,['She has got brown hair.','I’ve got brown hair.','You’ve got brown hair.'],1,'I’ve got brown hair.','同一张图，女孩自己说用 I。'),
   q('mi2','小红花对女孩说「你有棕色头发」。',PICTURES.sister,['You’ve got brown hair.','I’ve got brown hair.','She has got brown hair.'],0,'You’ve got brown hair.','小红花正对她说话，用 you。'),
   q('mi3','小红花向枝枝说「她有棕色头发」。',PICTURES.sister,['You’ve got brown hair.','She has got brown hair.','I’ve got brown hair.'],1,'She has got brown hair.','小红花转向枝枝介绍她，用 she has。'),
   q('mi4','男孩自己说「我有黑色头发」。',PICTURES.brother,['He has got black hair.','I’ve got black hair.','You’ve got black hair.'],1,'I’ve got black hair.','男孩自己说，用 I。'),
   q('mi5','小红花转身向枝枝介绍男孩。',PICTURES.brother,['He has got black hair.','You’ve got black hair.','I’ve got black hair.'],0,'He has got black hair.','同一个男孩，从外面介绍，用 he has。')
 ]},
 {id:'lens',name:'外貌放大镜',tag:'04',skill:'看图听句，分清有和没有',intro:'两张图只有眼睛颜色不同。认真看一个小地方。',examples:[
   {who:'只改眼睛颜色',text:'She has got green eyes.',image:PICTURES.sister}
 ],tasks:[
   pick('le1','She has got green eyes.','哪张画像符合这句话？',[PICTURES.sisterBlue,PICTURES.sister],1,'看虹膜：这张是绿眼。'),
   pick('le2','She has got blue eyes.','同样棕发，哪张是蓝眼？',[PICTURES.sister,PICTURES.sisterBlue],1,'头发相同，仔细看眼睛。'),
   pick('le3','She hasn’t got blue eyes.','找出「没有蓝眼睛」的女孩。',[PICTURES.sisterBlue,PICTURES.sister],1,'绿眼女孩没有蓝眼睛。'),
   pick('le4','She has got red hair and blue eyes.','找出红发蓝眼女孩。',[PICTURES.lily,PICTURES.sister],0,'头发和眼睛要一起对上。'),
   pick('le5','He has got black hair and brown eyes.','找出黑发棕眼男孩。',[PICTURES.brother,PICTURES.grandpa],0,'句子说的是 he；再看黑发和棕眼。')
 ]},
 {id:'questions',name:'问号翻转门',tag:'05',skill:'Have you got...? · Has she got...?',intro:'问你时，Have 走到前面；问他或她，Has 走到前面。',examples:[
   {who:'当面问',text:'Have you got green eyes?',image:PICTURES.sister},
   {who:'指相框问',text:'Has she got green eyes?',image:PICTURES.sister}
 ],tasks:[
   q('qu1','小红花面对女孩：哪句是在问「你有绿眼睛吗？」',PICTURES.sister,['Has she got green eyes?','Have you got green eyes?'],1,'Have you got green eyes?','面对你提问，开头用 Have you。'),
   q('qu2','小红花问枝枝：哪句是在问「她有绿眼睛吗？」',PICTURES.sister,['Have she got green eyes?','Has she got green eyes?'],1,'Has she got green eyes?','问一个她，开头用 Has she。'),
   q('qu3','小红花问枝枝：这个男孩有黑头发吗？',PICTURES.brother,['Have he got black hair?','Has he got black hair?'],1,'Has he got black hair?','问一个他，开头用 Has he。'),
   q('qu4','小红花直接问男孩：你有棕色眼睛吗？',PICTURES.brother,['Have you got brown eyes?','Has you got brown eyes?'],0,'Have you got brown eyes?','无论问男孩还是女孩本人，you 都配 Have。'),
   q('qu5','把「She has got blue eyes.」变成问句。',PICTURES.lily,['Has she got blue eyes?','Have she got blue eyes?'],0,'Has she got blue eyes?','把 Has 放到前面，she 还在后面。')
 ]},
 {id:'answers',name:'真假侦探',tag:'06',skill:'Yes / No 完整回答',intro:'女孩自己回答用 I；枝枝替女孩回答用 she。',examples:[
   {who:'女孩自己答',text:'Yes, I have.',image:PICTURES.sister},
   {who:'灰兔替她答',text:'Yes, she has.',image:PICTURES.sister}
 ],tasks:[
   q('an1','小红花问绿眼女孩：Have you got green eyes?',PICTURES.sister,['Yes, I have.','No, I haven’t.'],0,'Yes, I have.','女孩自己答，主语变成 I。','Have you got green eyes?'),
   q('an2','小红花问绿眼女孩：Have you got blue eyes?',PICTURES.sister,['Yes, I have.','No, I haven’t.'],1,'No, I haven’t.','女孩自己答 I；她的眼睛不是蓝色。','Have you got blue eyes?'),
   q('an3','小红花问枝枝：Has she got green eyes?',PICTURES.sister,['Yes, she has.','No, she hasn’t.'],0,'Yes, she has.','枝枝替她答，用 she has。','Has she got green eyes?'),
   q('an4','小红花问枝枝：Has she got blue eyes?',PICTURES.sister,['Yes, she has.','No, she hasn’t.'],1,'No, she hasn’t.','她不是蓝眼睛；答句保留 has，不再说 got。','Has she got blue eyes?'),
   q('an5','小红花问枝枝：Has he got black hair?',PICTURES.brother,['No, he hasn’t.','Yes, he has.'],1,'Yes, he has.','他的头发是黑色，答 Yes, he has。','Has he got black hair?'),
   q('an6','小红花问枝枝：Has he got green eyes?',PICTURES.brother,['No, he hasn’t.','Yes, he has.'],0,'No, he hasn’t.','他的眼睛是棕色，答 No, he hasn’t。','Has he got green eyes?'),
   q('an7','小红花照镜子：哪句描述是真的？',PICTURES.flower,['I’ve got a nose.','I haven’t got a nose.'],1,'I haven’t got a nose.','小红花没有鼻子；自己说「我没有」，用 I haven’t got。')
 ]},
 {id:'repair',name:'调皮句子修理站',tag:'07',skill:'从错误里看清规律',intro:'小红花故意摆错一张词牌。你帮忙修好，还要说说为什么。',examples:[
   {who:'说一个她',text:'She has got green eyes.',image:PICTURES.sister}
 ],tasks:[
   q('re1','坏句子：She have got green eyes.',PICTURES.sister,['She has got green eyes.','She have got green eyes.'],0,'She has got green eyes.','说一个她，用 has。'),
   q('re2','坏句子：You has got green eyes.',PICTURES.sister,['You has got green eyes.','You have got green eyes.'],1,'You have got green eyes.','对你说，用 have。'),
   q('re3','坏句子：Has you got brown eyes?',PICTURES.brother,['Have you got brown eyes?','Has you got brown eyes?'],0,'Have you got brown eyes?','问你，开头用 Have。'),
   q('re4','坏句子：Have she got blue eyes?',PICTURES.lily,['Have she got blue eyes?','Has she got blue eyes?'],1,'Has she got blue eyes?','问一个她，开头用 Has。'),
   q('re5','坏句子：No, she haven’t.',PICTURES.sister,['No, she hasn’t.','No, she haven’t.'],0,'No, she hasn’t.','she 的简短否定回答用 hasn’t。')
 ]},
 {id:'album',name:'家人相册任务',tag:'08',skill:'介绍身份，还要说外貌',intro:'这本相册属于 Lily。她说 my，是她的家人。小红花问，枝枝帮 Lily 回答。',examples:[
   {who:'Lily 介绍姐姐',text:'She is my sister. She has got green eyes.',image:PICTURES.sister}
 ],tasks:[
   q('al1','Lily 的相册：Who is she?',PICTURES.sister,['She is my sister.','He is my brother.','She is my grandmother.'],0,'She is my sister.','这是 Lily 的姐姐；my 指 Lily。','Who is she?'),
   q('al2','接着介绍姐姐的外貌。',PICTURES.sister,['She has got green eyes.','She has got blue eyes.'],0,'She has got green eyes.','对着照片核对眼睛颜色。'),
   q('al3','Lily 的相册：Who is he?',PICTURES.brother,['He is my grandfather.','He is my brother.','She is my sister.'],1,'He is my brother.','这是 Lily 的哥哥；介绍一个他用 he。','Who is he?'),
   q('al4','小红花追问：Has he got black hair?',PICTURES.brother,['Yes, he has.','No, he hasn’t.'],0,'Yes, he has.','哥哥的头发是黑色。','Has he got black hair?'),
   q('al5','Lily 的相册：Who is she?',PICTURES.grandma,['She is my grandmother.','She is my mother.'],0,'She is my grandmother.','这张是奶奶／外婆，英文也可以说 grandma。','Who is she?'),
   q('al6','小红花追问：Has she got green eyes?',PICTURES.grandma,['Yes, she has.','No, she hasn’t.'],0,'Yes, she has.','祖母的眼睛是绿色。','Has she got green eyes?')
 ]}
];

export const PORTRAIT_CHOICES=[
 {id:'green',name:'绿眼女孩',image:PICTURES.sister,hair:'brown',eyes:'green',pronoun:'she'},
 {id:'blue',name:'蓝眼对照',image:PICTURES.sisterBlue,hair:'brown',eyes:'blue',pronoun:'she'},
 {id:'boy',name:'黑发男孩',image:PICTURES.brother,hair:'black',eyes:'brown',pronoun:'he'},
 {id:'red',name:'红发女孩',image:PICTURES.lily,hair:'red',eyes:'blue',pronoun:'she'}
];

export function audioTexts(){
 const all=[];
 for(const f of FAMILY){all.push(f.word,f.formal,`This is my ${f.word}.`,`${f.pronoun==='she'?'She':'He'} is my ${f.formal}.`);}
 for(const b of BODY)all.push(b.word,b.say);
 all.push('family','foot','feet','Touch your feet.','I’ve got two eyes.','I haven’t got a nose.','This is my family.','Who is he?','Who is she?','Yes, I have.','No, I haven’t.','Yes, he has.','No, he hasn’t.','Yes, she has.','No, she hasn’t.');
 for(const l of LESSONS){for(const e of l.examples)all.push(e.text);for(const t of l.tasks){if(t.say)all.push(t.say);if(t.answer)all.push(t.answer);}}
 for(const p of PORTRAIT_CHOICES){all.push(`I’ve got ${p.hair} hair.`,`I’ve got ${p.eyes} eyes.`,`Have you got ${p.eyes} eyes?`,`${p.pronoun==='she'?'She':'He'} has got ${p.hair} hair.`,`${p.pronoun==='she'?'She':'He'} has got ${p.eyes} eyes.`);}
 for(const color of ['blue','green','brown'])all.push('Have you got '+color+' eyes?');
 return [...new Set(all)];
}
