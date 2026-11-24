// Unit 1 targets: official Pupil's Book pp7,10,13 and Teacher's Book TB7.
const stationery=[['book','books','书'],['pen','pens','笔'],['pencil','pencils','铅笔'],['crayon','crayons','蜡笔'],['rubber','rubbers','橡皮'],['ruler','rulers','尺子'],['bag','bags','书包'],['pencil case','pencil cases','笔袋']];
const ALL_WORDS=stationery.map(([word,plural,zh],sprite)=>({id:word.replaceAll(' ','-'),word,plural,zh,sprite,sheet:'stationery',category:'文具',countable:true,person:false,source:word==='book'?'词汇1 p10':word==='ruler'?'词汇2 p4':'词汇1 p5'}));
const classroom=[['classroom','classrooms','教室',0],['desk','desks','课桌',1],['student','students','学生',2],['teacher','teachers','老师',3],['board','boards','黑板',4],['bookcase','bookcases','书柜',5],['cupboard','cupboards','橱柜',6],['door','doors','门',7],['wall','walls','墙',8],['playground','playgrounds','操场',9],['window','windows','窗户',10],['paper',null,'纸',11],['table','tables','桌子',12]];
for(const [word,plural,zh,sprite] of classroom)ALL_WORDS.push({id:word,word,plural,zh,sprite,sheet:'classroom',category:['student','teacher'].includes(word)?'人物':'教室',countable:plural!==null,person:['student','teacher'].includes(word),source:word==='table'?'词汇1 p13':sprite<4?'词汇1 p4':sprite<8?'词汇2 p3':'词汇2 p4'});
ALL_WORDS.push({id:'chair',word:'chair',plural:'chairs',zh:'椅子',sheet:'chair',sprite:0,category:'教室',countable:true,person:false,source:'词汇1 p4'});
const schoolTargets=new Set(['bag','book','chair','classroom','crayon','desk','pen','pencil','pencil case','rubber','teacher','board','bookcase','cupboard','door','paper','playground','ruler','wall','window']);
export const WORDS=ALL_WORDS.filter(w=>schoolTargets.has(w.word)).map(w=>({...w,source:['board','bookcase','cupboard','door','paper','playground','ruler','wall','window'].includes(w.word)?'官方学生用书 p10':'官方学生用书 p7'}));
export const RETIRED_CORE=ALL_WORDS.filter(w=>!schoolTargets.has(w.word));
export const GRAMMAR_WORDS=WORDS.filter(w=>!w.person&&w.countable);
const ALL_EXTRA=[
 ['school','学校','Our new school.','我们的新学校。','词汇1 p1'],['new','新的','Our new school.','我们的新学校。','词汇1 p1'],
 ['help','帮助','I help my friend.','我帮助朋友。','跨学科 p8–9'],['share','分享','I share my book with my friend.','我和朋友分享书。','跨学科 p16'],['listen','听','I listen to my partner.','我听同伴说。','跨学科 p8–9'],['work together','一起合作','We work together.','我们一起合作。','跨学科 p8–9'],['kind','友善的','Be kind at school.','在学校友善待人。','跨学科 p2–8'],['friend','朋友','Lucy and Max are friends.','Lucy 和 Max 是朋友。','文学 p13'],['partner','同伴','Listen to your partner.','听同伴说。','跨学科 p9（修正课件拼写 parter）'],
 ['pack','收拾；打包','I’m packing my bag.','我正在收拾书包。','文学 p4–11'],['take','带上；拿','Take a pencil to school.','带一支铅笔去学校。','文学 p15'],['put','放','I put my pen in the bag.','我把笔放进书包。','文学 p4'],['rule','规则','That’s the rule.','这是规则。','文学 p5–11'],['floor','地板','The crayons are on the floor.','蜡笔在地板上。','文学 p17'],['today','今天','Today is the first day of school.','今天是上学第一天。','文学 p13、22'],['first day','第一天','The first day.','第一天。','文学 p13、22'],['hurry up','快点','Hurry up!','快点！','文学 p18、24'],['late','迟到的','Don’t be late for school.','上学不要迟到。','文学 p18'],['it’s time to','到……的时候了','It’s time to pack your bag.','该收拾书包了。','文学 p15、24'],['here you are','给你','Here you are.','给你。','跨学科 p13'],['thank you','谢谢','Thank you.','谢谢。','跨学科 p13'],
 ['in','在里面','It’s in the bag.','它在书包里。','story+语法1 p17'],['on','在上面','It’s on the desk.','它在课桌上。','story+语法1 p16'],['under','在下面','It’s under the desk.','它在课桌下面。','story+语法1 p16'],['next to','在旁边','It’s next to the rubber.','它在橡皮旁边。','story+语法1 p17'],['behind','在后面','He is behind the box.','他在盒子后面。','story+语法1 p8–9'],['between','在两者之间','between','在两者之间。','story+语法1 p8'],['opposite','在对面','opposite','在对面。','story+语法1 p9 选项'],['in front of','在前面','in front of','在前面。','story+语法1 p11 选项'],
 ['tractor','拖拉机','Where is the tractor?','拖拉机在哪里？','词汇1 p6'],['basket','篮子','She’s in the basket.','她在篮子里。','story+语法1 p6'],['mouse','老鼠','Where is the mouse?','老鼠在哪里？','story+语法1 p9'],['box','盒子','He is behind the box.','他在盒子后面。','story+语法1 p9'],['mouth','嘴','It’s in Gracie’s mouth.','它在 Gracie 的嘴里。','story+语法1 p14'],['cake','蛋糕','I love cakes.','我喜欢蛋糕。','跨学科 p3'],['flower','花','Do you want flowers?','你想要花吗？','跨学科 p5'],['knife','刀','Don’t take a knife to school.','不要把刀带去学校。','文学 p7'],['phone','手机','Don’t take a phone to school.','不要把手机带去学校。','文学 p10'],['apple','苹果','an apple','一个苹果。','语法2 p4'],['orange','橙子','an orange','一个橙子。','语法2 p4']
].map(([word,zh,example,meaning,source],i)=>({id:'extra-'+i,word,zh,example,meaning,source}));
// Preserve original IDs and audio filenames. A word occurring in a story,
// title, classroom instruction or warm-up is not automatically a target word.
const expressionTargets=new Set(['in','on','under','next to','help','listen','share','work together']);
export const RETIRED_EXTRA=ALL_EXTRA.filter(w=>!expressionTargets.has(w.word));
export const EXTRA=ALL_EXTRA.filter(w=>expressionTargets.has(w.word)).map(w=>({...w,source:['in','on','under','next to'].includes(w.word)?'官方学生用书 pp8–9':'官方学生用书 p13'}));
export const PLACES=[{id:'in',text:'in the bag',zh:'书包里'},{id:'on',text:'on the chair',zh:'椅子上'},{id:'under',text:'under the chair',zh:'椅子下面'},{id:'next-to',text:'next to the chair',zh:'椅子旁边'}];
export const wordById=id=>WORDS.find(w=>w.id===id);
export const noun=(w,n)=>!w.countable?w.word:n===1?`a ${w.word}`:w.plural;
export const subject=(n,form='short')=>n===1?(form==='full'?'It is':'It’s'):(form==='full'?'They are':'They’re');
export const identify=(w,n,form='short')=>`${w.person&&n===1?'This is':subject(n,form)} ${noun(w,n)}.`;
export const whereQuestion=(w,n)=>n===1?`Where’s the ${w.word}?`:`Where are the ${w.plural}?`;
export const locationAnswer=(n,p,form='short')=>`${subject(n,form)} ${PLACES.find(x=>x.id===p).text}.`;
export const identityQuestion=n=>n===1?'What’s this?':'What are these?';
export const shuffle=a=>a.map(v=>({v,r:Math.random()})).sort((a,b)=>a.r-b.r).map(x=>x.v);
export const aid=(type,w,n,p)=>[type,w?.id,n===1?'one':'many',p].filter(Boolean).join('_');
export function makeRound(type,w,n,p='on'){return {type,word:w,n:w.countable?n:1,place:p,errors:0,hint:false,done:false,model:false,chosenStem:null,chosenEnd:null};}
export function makeSession(mode='mixed',offset=0){
 const ws=shuffle(GRAMMAR_WORDS);const counts=shuffle([1,3,1,3,1,3]);
 if(mode.startsWith('word:')){const w=wordById(mode.slice(5));if(!w)throw Error('未知单词');return [makeRound('vocab',w,1),makeRound('vocab',w,w.countable?3:1)];}
 if(mode==='vocab')return Array.from({length:6},(_,i)=>makeRound('vocab',WORDS[(offset+i)%WORDS.length],1));
 if(mode==='identify')return Array.from({length:6},(_,i)=>makeRound('build',ws[i],counts[i]));
 if(mode==='location'){const places=shuffle([...PLACES,...shuffle(PLACES).slice(0,2)]);return places.map((p,i)=>makeRound('locate',WORDS[2+i%2],counts[i],p.id));}
 if(mode==='check')return Array.from({length:6},(_,i)=>({...makeRound('check',ws[i],counts[i]),guess:ws[(i+(i%3===0?1:0))%ws.length]}));
 return [makeRound('vocab',WORDS[offset%WORDS.length],1),makeRound('vocab',WORDS[(offset+1)%WORDS.length],1),makeRound('build',ws[0],1),makeRound('build',ws[1],3),...shuffle(PLACES).map((p,i)=>makeRound('locate',WORDS[2+i%2],i%2?1:3,p.id))];
}
export function assess(r,stem,end){
 const equivalents=r.n===1?['It’s',"It's",'It is']:['They’re',"They're",'They are'];const target=r.type==='locate'?PLACES.find(p=>p.id===r.place).text:noun(r.word,r.n);
 if(!equivalents.includes(stem))return {ok:false,kind:'number',message:r.n===1?'这里只有一个，试试 It is 或 It’s。':'这里有几个，试试 They are 或 They’re。'};
 if(end!==target)return {ok:false,kind:r.type==='locate'?'place':'noun',message:r.type==='locate'?'看看它和书包、椅子的位置关系。':!r.word.countable?'paper 表示纸，不加 a，也不加 s。':'再看看词尾：一个用 a 加单数，几个用复数。'};
 return {ok:true};
}
export const VOICE_PROMPT='You are a gentle grey plush rabbit talking to a young child. Use clear, natural British English, warm and friendly, slightly slower than ordinary conversation. Read only the supplied text, exactly. Make plural endings audible naturally. No music, no sound effects, no extra words, no character labels. Not squeaky, whispery or theatrical.';
export const AUDIO=[];
function clip(id,text,group){AUDIO.push({id,text,group,file:`${id}.wav`});}
[['hello','Hello! Let’s get ready for school.'],['what_one','What’s this?'],['what_many','What are these?'],['try','Let’s try together.'],['thanks','Thank you! You helped me.'],['yes_one','Yes, it is.'],['no_one','No, it isn’t.'],['yes_many','Yes, they are.'],['no_many','No, they aren’t.']].forEach(([id,t])=>clip(id,t,'01 常用句'));
for(const w of WORDS)for(const n of (w.countable?[1,3]:[1])){clip(aid('word',w,n),n===1?w.word:w.plural,'02 全单元词汇');clip(aid('identify',w,n),identify(w,n),'03 口语缩写回答');clip(aid('identify-full',w,n),identify(w,n,'full'),'06 完整句回答');if(!w.person)clip(aid('check',w,n),n===1?`Is it ${noun(w,n)}?`:`Are they ${w.plural}?`,'05 可选挑战');}
for(const w of [WORDS[2],WORDS[3]])for(const n of [1,3])clip(aid('where',w,n),whereQuestion(w,n),'04 位置句');
for(const p of PLACES)for(const n of [1,3]){clip(aid('location',null,n,p.id),locationAnswer(n,p.id),'04 位置句');clip(aid('location-full',null,n,p.id),locationAnswer(n,p.id,'full'),'04 位置句');}
for(const e of EXTRA){clip(`extra-word_${e.id}`,e.word,'07 故事与跨学科词汇');clip(`extra-example_${e.id}`,e.example,'08 故事与跨学科应用');}
