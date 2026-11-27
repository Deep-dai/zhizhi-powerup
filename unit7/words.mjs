const entries = [
  ['music', '音乐', "She's listening to music.", 'listen to music', '▶ 听搭配 listen to music', '常用搭配：listen to music（听音乐，注意加 to）。', 'listen-to-music'],
  ['play basketball', '打篮球', "He's playing basketball.", '', '', '球类运动 play 后不加 the。', ''],
  ['play football', '踢足球', "She's playing football.", 'play soccer', '', '英式常用 play football，美式也说 play soccer；球类前不加 the。', ''],
  ['play tennis', '打网球', "She's playing tennis.", '', '', '球类运动前不加 the；注意圆网球与羽毛球托的区别。', ''],
  ['play the guitar', '弹吉他', "He's playing the guitar.", '', '', '演奏西洋乐器前要加 the：play the guitar。', ''],
  ['play the piano', '弹钢琴', "She's playing the piano.", '', '', '演奏西洋乐器前要加 the：play the piano。', ''],
  ['ride a bike', '骑自行车', "He's riding a bike.", 'riding a bike', '▶ 听进行时 riding a bike', 'ride 去掉不发音的 e 再加 ing：riding a bike。', ''],
  ['sport', '体育运动', "Let's do sport every day.", 'sports', '', '表示“体育运动”总称；运动会常说 sports day。', ''],
  ['swim', '游泳', "She's swimming.", 'swimming', '▶ 听进行时 swimming', '闭音节双写 m 再加 ing：swimming。', ''],
  ['television', '电视', "He's watching television.", 'TV', '', '缩写为 TV；看电视常说 watch television / watch TV。', 'watch-television'],
  ['badminton', '羽毛球', "They're playing badminton.", '', '', '句中常搭配 play badminton（不加 the）。', ''],
  ['baseball', '棒球', "They're playing baseball.", '', '', '句中常搭配 play baseball（不加 the）。', ''],
  ['catch', '接球／接住', "She's catching the ball.", 'catching', '▶ 听进行时 catching', '双手迎球接住，与 throw（扔出）相对；直接加 ing。', ''],
  ['hit', '击打／击球', "He's hitting the ball.", 'hitting', '▶ 听进行时 hitting', '闭音节双写 t 再加 ing：hitting。', ''],
  ['hockey', '曲棍球', "They're playing hockey.", '', '', '用前端弯曲的球杆推球：play hockey。', ''],
  ['kick', '踢（球）', "He's kicking the ball.", 'kicking', '▶ 听进行时 kicking', '用脚触球踢出；直接加 ing：kicking。', ''],
  ['run', '跑步', "He's running on the track.", 'running', '▶ 听进行时 running', '闭音节双写 n 再加 ing：running。', ''],
  ['skateboard', '滑滑板', "She's skateboarding.", 'skateboarding', '▶ 听进行时 skateboarding', '站在四轮滑板上滑行；也可说 ride a skateboard。', ''],
  ['throw', '扔／投掷', "He's throwing the ball.", 'throwing', '▶ 听进行时 throwing', '把球向外抛离手掌；直接加 ing：throwing。', '']
];

export const words = entries.map(([word, zh, example, alias = '', aliasLabel = '', note = '', artId = ''], index) => ({
  word,
  zh,
  example,
  alias,
  aliasLabel,
  note,
  id: word.replaceAll(' ', '-'),
  artId: artId || word.replaceAll(' ', '-'),
  category: index < 10 ? '运动与日常爱好' : '球类拓展与动作'
}));
