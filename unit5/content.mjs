export const CORE=[
 ['ball','球',1],['bike','自行车',1],['car','玩具汽车',1],['doll','洋娃娃',1],['house','玩具屋',1],['kite','风筝',1],['robot','机器人',1],['plane','飞机',1],
 ['balloon','气球',2],['board game','棋盘游戏',2],['box','盒子／玩具箱',2],['computer','电脑',2],['helicopter','直升机',2],['keyboard','电脑键盘',2],['mouse','电脑鼠标',2],['radio','收音机',2],['ship','轮船',2],['teddy','玩具熊',2]
].map(([word,zh,group])=>({id:word.replaceAll(' ','-'),word,zh,group,category:group===1?'核心 · 我的玩具':'核心 · 生日礼物架',example:`This is a ${word}.`,audioWord:word==='doll'?'a doll':'',alias:word==='box'?'toy box':word==='teddy'?'teddy bear':'',note:({house:'本单元用玩具屋学习 house。',keyboard:'这里指电脑键盘，不是电子琴。',mouse:'这里指电脑鼠标，不是老鼠。',box:'box 与 toy box 共用一个词条。',teddy:'teddy 与 teddy bear 共用一个词条。'})[word]||''}));
export const SHAPES=[['circle','圆形'],['square','正方形'],['triangle','三角形'],['rectangle','长方形']].map(([word,zh])=>({id:word,word,zh,category:'补充 · 形状工坊',example:`This is a ${word}.`,shape:true}));
export const BY_ID=Object.fromEntries([...CORE,...SHAPES].map(w=>[w.id,w]));
export const STAGES=[
 ['toys','打开玩具屋','认识18个玩具词','认一认 · 听一听','01'],['owners','礼物是谁的？','Whose…? 和名字＋’s','找一找 · 还给主人','02'],['voices','换个角度说一说','my / your / his / her / our / their','看清说话者与主人','03'],['wishes','生日心愿侦探','want / wants 和愿望问答','听心愿 · 选礼物','04'],['shapes','形状贺卡工坊','圆、正方形、三角形、长方形','动动手 · 拼一拼','05'],['sounds','小黄鸭的声音角','完整单词中的 h','听一听 · 跟着说','06'],['story','送错礼物怎么办？','归还礼物，学会道歉','读故事 · 说对不起','07'],['party','生日礼物派对','把今天学的都用起来','选礼物 · 做贺卡','08']
].map(([id,title,subtitle,action,number])=>({id,title,subtitle,action,number}));
export const GUIDES=[
 '欢迎来到小黄鸭的生日礼物派对！先认识玩具，再帮朋友选礼物。','听一听，找到对应的玩具。可以再听一次。','这是谁的？先找到主人，再把礼物送回去。','看清谁在说话。同一件礼物，换个人介绍，说法也会变化。','先听朋友的心愿，再选他或者她想要的礼物。','用四种形状，制作一张生日贺卡。','听完整单词，注意开头轻轻呼气的声音。','送错礼物没关系。核对主人，归还礼物，再说声对不起。','练习完成只记录学习进度，听写掌握需要家长在小抽屉确认。'
];
export const OWNERS=[['bike','Ben'],['robot','Ben'],['doll','Mia'],['kite','Mia'],['ball','Ben'],['plane','Mia']].map(([id,owner])=>({id,owner,question:`Whose ${BY_ID[id].word} is this?`,answer:`It's ${owner}'s ${BY_ID[id].word}.`}));
export const VOICES=[
 {speaker:'Mia',listener:'Ben',owner:'Mia',toy:'kite',term:'my',text:"It's my kite.",zh:'Mia 对 Ben 说：这是我的风筝。',why:'Mia 是主人，也是说话者，所以说 my。'},
 {speaker:'Ben',listener:'Mia',owner:'Mia',toy:'kite',term:'your',text:"It's your kite.",zh:'Ben 对 Mia 说：这是你的风筝。',why:'Mia 是主人，也是正在听话的人，所以 Ben 说 your。'},
 {speaker:'小黄鸭',listener:'我们',owner:'Ben',toy:'robot',term:'his',text:"It's his robot.",zh:'小黄鸭介绍 Ben 的机器人：这是他的机器人。',why:'主人 Ben 是男孩，小黄鸭介绍他的玩具，用 his。'},
 {speaker:'小黄鸭',listener:'我们',owner:'Mia',toy:'doll',term:'her',text:"It's her doll.",zh:'小黄鸭介绍 Mia 的娃娃：这是她的娃娃。',why:'主人 Mia 是女孩，小黄鸭介绍她的玩具，用 her。'},
 {speaker:'Ben 和 Mia',listener:'小黄鸭',owner:'Ben 和 Mia',toy:'board-game',term:'our',text:"It's our board game.",zh:'Ben 和 Mia 一起说：这是我们的棋盘游戏。',why:'两位主人一起介绍自己的东西，所以说 our。'},
 {speaker:'小黄鸭',listener:'我们',owner:'Ben 和 Mia',toy:'board-game',term:'their',text:"It's their board game.",zh:'小黄鸭介绍：这是他们的棋盘游戏。',why:'小黄鸭没有参与拥有这个游戏，是在介绍两位朋友的东西，所以说 their。'}
];
export const WISH_Q=[
 {prompt:'我自己说：I ___ a robot.',options:['want','wants'],answer:'want',text:'I want a robot.',why:'I 后面用 want。',toy:'robot'},
 {prompt:'介绍 Ben：Ben ___ a robot.',options:['want','wants'],answer:'wants',text:'Ben wants a robot.',why:'介绍一个人时，肯定句用 wants。',toy:'robot'},
 {prompt:'Does Ben want a robot?',options:['Yes, he does.',"No, he doesn't."],answer:'Yes, he does.',text:'Does Ben want a robot?',clue:'I want a robot.',why:'Ben 想要机器人；回答用 he。',toy:'robot'},
 {prompt:'Does Mia want a plane?',options:['Yes, she does.',"No, she doesn't."],answer:"No, she doesn't.",text:'Does Mia want a plane?',clue:"I don't want a plane.",why:'Mia 不想要飞机，用 No, she doesn’t。',toy:'plane'},
 {prompt:'What does Mia want?',options:['Mia wants a doll.','Mia wants a robot.'],answer:'Mia wants a doll.',text:'What does Mia want?',clue:'I want a doll.',why:'Mia 的心愿是洋娃娃。'},
 {prompt:"Ben doesn't ___ a teddy.",options:['want','wants'],answer:'want',text:"Ben doesn't want a teddy.",why:'doesn’t 后面用 want；不要再加 s。',toy:'teddy'},
 {prompt:'Does he ___ a robot?',options:['want','wants'],answer:'want',text:'Does he want a robot?',why:'Does 已经变化，后面的 want 保持原形。',toy:'robot'},
 {prompt:'She ___ a doll.',options:['want','wants'],answer:'wants',text:'She wants a doll.',why:'she 后面的肯定句用 wants。',toy:'doll'}
];
export const STORY=[
 {title:'准备好礼物',text:'The robot is for Ben. The doll is for Mia.',zh:'机器人送给 Ben，洋娃娃送给 Mia。',art:'story-1'},
 {title:'哎呀，拿错啦',text:'Ben has got the doll. Mia has got the robot. These are the wrong presents.',zh:'Ben 拿到了娃娃，Mia 拿到了机器人。两份礼物送反了。',art:'story-2'},
 {title:'看看礼物是谁的',text:"The robot is Ben's. The doll is Mia's. They give the toys back.",zh:'机器人是 Ben 的，洋娃娃是 Mia 的。他们把玩具还给对方。',art:'story-3'},
 {title:'说声对不起',text:'They say sorry. Now Ben and Mia are happy.',zh:'他们互相道歉，现在 Ben 和 Mia 又开心起来了。',art:'story-4'}
];
export const STORY_Q=[
 {prompt:"Whose robot is it?", options:["It's Ben's robot.","It's Mia's robot."],answer:"It's Ben's robot.",why:"The robot is for Ben."},
 {prompt:"Mia has Ben's robot. Who gets the robot back?",options:['Ben','Mia'],answer:'Ben',why:"It's Ben's robot."},
 {prompt:"Mia says, “I'm sorry, Ben.” What can Ben say?",options:["That's OK.","Happy birthday!"],answer:"That's OK.",why:"That's OK. 回应朋友的道歉。"}
];
export const GIFTS=['robot','doll','kite','teddy','plane','ball'];
export const SLOTS=[
 {id:'hat',shape:'triangle',label:'帽子',x:100,y:5,w:100,h:70},
 {id:'head',shape:'rectangle',label:'头部',x:85,y:80,w:130,h:100},
 {id:'left-eye',shape:'circle',label:'左眼',x:105,y:100,w:25,h:25},
 {id:'right-eye',shape:'circle',label:'右眼',x:170,y:100,w:25,h:25},
 {id:'mouth',shape:'rectangle',label:'嘴巴',x:125,y:145,w:50,h:15},
 {id:'body',shape:'square',label:'身体',x:80,y:195,w:140,h:140}
];
