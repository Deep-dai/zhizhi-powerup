const vocab1 = [
  'music', 'play basketball', 'play football', 'play tennis', 'play the guitar',
  'play the piano', 'ride a bike', 'sport', 'swim', 'television'
];
const vocab2 = [
  'badminton', 'baseball', 'catch', 'hit', 'hockey', 'kick', 'run', 'skateboard', 'throw'
];
const indoorWords = new Set(['music', 'play the guitar', 'play the piano', 'television']);
const artAlias = { music: 'listen-to-music', television: 'watch-television' };
const ingMap = {
  catch: 'catching', hit: 'hitting', kick: 'kicking',
  run: 'running', skateboard: 'skateboarding', throw: 'throwing', swim: 'swimming'
};
const id = name => artAlias[name] || name.replaceAll(' ', '-');
const normalize = t => String(t).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').trim();
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const findLine = name => name;
const campLine = name => ingMap[name] || name;

const confusionPeers = {
  'music': ['television', 'play the guitar', 'play the piano'],
  'play basketball': ['play football', 'play tennis', 'sport'],
  'play football': ['play basketball', 'play tennis', 'ride a bike'],
  'play tennis': ['play basketball', 'play football', 'swim'],
  'play the guitar': ['play the piano', 'music', 'television'],
  'play the piano': ['play the guitar', 'music', 'television'],
  'ride a bike': ['play football', 'swim', 'play basketball'],
  'sport': ['play basketball', 'play football', 'play tennis'],
  'swim': ['ride a bike', 'play tennis', 'sport'],
  'television': ['music', 'play the piano', 'play the guitar'],
  'badminton': ['baseball', 'hockey', 'hit'],
  'baseball': ['badminton', 'hockey', 'throw'],
  'catch': ['throw', 'hit', 'kick'],
  'hit': ['kick', 'throw', 'catch'],
  'hockey': ['baseball', 'badminton', 'kick'],
  'kick': ['hit', 'run', 'throw'],
  'run': ['kick', 'skateboard', 'throw'],
  'skateboard': ['run', 'kick', 'hockey'],
  'throw': ['catch', 'hit', 'kick']
};

const ingTracks = [
  {
    key: 'direct',
    badge: '轨道 1 · 直接挂钩 +ing',
    tip: '大多数动词直接在词尾加上 -ing。',
    items: [
      ['play', 'playing', 'play-tennis', "She's playing tennis."],
      ['catch', 'catching', 'catch', "She's catching the ball."],
      ['throw', 'throwing', 'throw', "He's throwing the ball."],
      ['kick', 'kicking', 'kick', "He's kicking the ball."]
    ]
  },
  {
    key: 'drop-e',
    badge: '轨道 2 · 哑巴 e 让位 +ing',
    tip: '词尾有不发音的 e 时，先去掉 e，再加 -ing。',
    items: [
      ['ride', 'riding', 'ride-a-bike', "He's riding a bike."]
    ]
  },
  {
    key: 'double',
    badge: '轨道 3 · 双胞胎守门双写 +ing',
    tip: '短元音闭音节结尾，双写最后一个辅音字母再加 -ing。',
    items: [
      ['swim', 'swimming', 'swim', "She's swimming."],
      ['run', 'running', 'run', "He's running on the track."],
      ['hit', 'hitting', 'hit', "He's hitting the ball."]
    ]
  },
  {
    key: 'the-hat',
    badge: '礼帽规则 · 球类无 the，乐器戴 the',
    tip: '打球不加 the；弹奏西洋乐器前一定要戴上小礼帽 the！',
    items: [
      ['play basketball', '球类直通（无 the）', 'play-basketball', "He's playing basketball."],
      ['play the guitar', '乐器加 the', 'play-the-guitar', "He's playing the guitar."],
      ['play the piano', '乐器加 the', 'play-the-piano', "She's playing the piano."]
    ]
  }
];

const ingQuestions = [
  { art: 'swim', base: 'swim', frame: ["She's ", ' in the pool.'], answer: 'swimming', distractors: ['swiming', 'swims'], full: "She's swimming.", hint: 'swim 是闭音节词，要双写 m 再加 ing。' },
  { art: 'ride-a-bike', base: 'ride', frame: ["He's ", ' a bike.'], answer: 'riding', distractors: ['rideing', 'rides'], full: "He's riding a bike.", hint: 'ride 末尾的 e 不发音，先去掉 e 再加 ing。' },
  { art: 'run', base: 'run', frame: ["He's ", ' on the track.'], answer: 'running', distractors: ['runing', 'runs'], full: "He's running on the track.", hint: 'run 要双写 n 再加 ing：running。' },
  { art: 'hit', base: 'hit', frame: ["He's ", ' the ball.'], answer: 'hitting', distractors: ['hiting', 'hits'], full: "He's hitting the ball.", hint: 'hit 要双写 t 再加 ing：hitting。' },
  { art: 'play-the-piano', base: 'piano（乐器）', frame: ["She's ", ' piano.'], answer: 'playing the', distractors: ['playing', 'play the'], full: "She's playing the piano.", hint: '正在弹钢琴：She is + playing + 乐器小礼帽 the。' },
  { art: 'play-basketball', base: 'basketball（球类）', frame: ["He's ", ' basketball.'], answer: 'playing', distractors: ['playing the', 'play'], full: "He's playing basketball.", hint: '球类运动不加 the，同时保留 He is 后面的 -ing。' }
];

const liveDemos = [
  { key: 'he', label: "男孩 Leo · He's", art: 'kick', q: "What's he doing?", a: "He's kicking the ball." },
  { key: 'she', label: "女孩 Mia · She's", art: 'play-tennis', q: "What's she doing?", a: "She's playing tennis." },
  { key: 'they', label: "双人配合 · They're", art: 'badminton', q: "What are they doing?", a: "They're playing badminton." },
  { key: 'you', label: "我自己扮演 · I'm", art: 'play-the-guitar', q: 'What are you doing?', a: "I'm playing the guitar." }
];

const liveRounds = [
  { kind: 'spot', line: "Look! She's catching the ball.", target: 'catch', zones: ['throw', 'catch', 'badminton'] },
  { kind: 'spot', line: "Look! They're playing hockey.", target: 'hockey', zones: ['play-basketball', 'hockey', 'swim'] },
  { kind: 'spot', line: "Look! He's throwing the ball.", target: 'throw', zones: ['catch', 'skateboard', 'throw'] },
  { kind: 'qa', role: '聚光灯 · 女孩 Mia', art: 'swim', q: "What's she doing?", answer: "She's swimming.", distractors: ["He's swimming.", "She's skateboarding."] },
  { kind: 'qa', role: '聚光灯 · 双人赛区', art: 'baseball', q: 'What are they doing?', answer: "They're playing baseball.", distractors: ["They're playing badminton.", "He's playing baseball."] },
  { kind: 'qa', role: '⭐ 你正在扮演角色（回答问你的话）', art: 'play-the-guitar', q: 'What are you doing?', answer: "I'm playing the guitar.", distractors: ["He's playing the guitar.", "I'm playing the piano."] }
];

const refereeRounds = [
  { art: 'badminton', q: 'Are they playing badminton?', answer: 'Yes, they are.', distractors: ["No, they're not.", 'Yes, he is.'] },
  { art: 'play-tennis', q: 'Is she playing football?', answer: "No, she isn't.", distractors: ['Yes, she is.', "No, they're not."] },
  { art: 'hockey', q: 'Are they playing baseball?', answer: "No, they're not.", distractors: ['Yes, they are.', "No, he isn't."] },
  { art: 'ride-a-bike', q: 'Is he riding a bike?', answer: 'Yes, he is.', distractors: ["No, he isn't.", 'Yes, they are.'] },
  { art: 'skateboard', q: 'Is she running?', answer: "No, she isn't.", distractors: ['Yes, she is.', "No, he isn't."] }
];

const permissionDemos = [
  { scene: 'scene-livingroom', badge: '🏠 客厅花瓶旁（窗外有草地）', art: 'play-basketball', q: 'Can we play basketball?', a: "Yes, you can, but you can't play here.", zh: '可以打篮球，但不能在客厅里打（去窗外球场玩吧）。' },
  { scene: 'scene-park', badge: '🌳 阳光运动草坪（场地合适）', art: 'play-football', q: 'Can we play football in the park?', a: 'Yes, you can.', zh: '当然可以！公园草坪很适合踢足球。' },
  { scene: 'scene-court', badge: '⊘ 泳池湿滑边（禁止滑板）', art: 'skateboard', q: 'Can I skateboard by the pool?', a: "No, you can't.", zh: '不可以哦，泳池边湿滑不能玩滑板。' }
];

const permissionRounds = [
  {
    kind: 'reply',
    scene: 'scene-livingroom',
    badge: '🏠 室内客厅易碎花瓶旁 · 窗外是草地',
    art: 'play-football',
    q: 'Can we play football?',
    answer: "Yes, you can, but you can't play here.",
    distractors: ['Yes, you can. Play in the room.', "No, they're not."]
  },
  {
    kind: 'reply',
    scene: 'scene-court',
    badge: '✓ 户外标准球场',
    art: 'play-tennis',
    q: 'Can we play tennis here?',
    answer: 'Yes, you can.',
    distractors: ["No, you can't.", "Yes, you can, but you can't play here."]
  },
  {
    kind: 'reply',
    scene: 'scene-court',
    badge: '⊘ 泳池水边（禁止骑车）',
    art: 'ride-a-bike',
    q: 'Can I ride a bike by the pool?',
    answer: "No, you can't.",
    distractors: ['Yes, you can.', 'Yes, he is.']
  },
  {
    kind: 'build',
    scene: 'scene-park',
    badge: '🌳 想去公园踢足球',
    art: 'play-football',
    frame: ['Can we ', ' football in the park?'],
    answer: 'play',
    distractors: ['playing', 'plays'],
    full: 'Can we play football in the park?'
  },
  {
    kind: 'build',
    scene: 'scene-livingroom',
    badge: '🎹 想在屋里弹钢琴',
    art: 'play-the-piano',
    frame: ['Can I ', ' piano?'],
    answer: 'play the',
    distractors: ['playing the', 'play'],
    full: 'Can I play the piano?'
  },
  {
    kind: 'build',
    scene: 'scene-park',
    badge: '☀️ 周末请求去公园玩',
    art: 'sport',
    frame: ['', ' go to the park?'],
    answer: 'Can we',
    distractors: ['Are we', 'Is she'],
    full: 'Can we go to the park?'
  }
];

const bodyHabits = [
  { id: 'habit-exercise', line: 'Do sport every day.', zh: '每天运动伸展，让身体更强壮。' },
  { id: 'habit-water', line: 'Drink water after sport.', zh: '运动出汗后要及时喝水。' },
  { id: 'habit-sleep', line: 'Sleep well every night.', zh: '晚上睡好觉，恢复满满活力。' }
];

const whistleWords = [
  { word: 'sport', html: '<mark>s</mark>port', group: 's' },
  { word: 'swim', html: '<mark>s</mark>wim', group: 's' },
  { word: 'skateboard', html: '<mark>s</mark>kateboard', group: 's' },
  { word: 'six', html: '<mark>s</mark>ix', group: 's' },
  { word: 'shop', html: '<mark>sh</mark>op', group: 'other' },
  { word: 'hockey', html: '<mark>h</mark>ockey', group: 'other' }
];

const bodyRounds = [
  { kind: 'habit', target: 'habit-exercise', line: 'Do sport every day.' },
  { kind: 'habit', target: 'habit-water', line: 'Drink water after sport.' },
  { kind: 'habit', target: 'habit-sleep', line: 'Sleep well every night.' },
  { kind: 'sound', word: 'swim', html: '<mark>s</mark>wim', group: 's' },
  { kind: 'sound', word: 'shop', html: '<mark>sh</mark>op', group: 'other' },
  { kind: 'sound', word: 'skateboard', html: '<mark>s</mark>kateboard', group: 's' },
  { kind: 'sound', word: 'hockey', html: '<mark>h</mark>ockey', group: 'other' }
];

const sportsDayPool = [
  { id: 'badminton', label: 'badminton', line: "They're playing badminton.", wrong: ["He's playing badminton.", "She's playing badminton."], scene: 'scene-court' },
  { id: 'play-tennis', label: 'play tennis', line: "She's playing tennis.", wrong: ["He's playing tennis.", "They're playing tennis."], scene: 'scene-court' },
  { id: 'hockey', label: 'hockey', line: "They're playing hockey.", wrong: ["He's playing hockey.", "She's playing hockey."], scene: 'scene-park' },
  { id: 'baseball', label: 'baseball', line: "They're playing baseball.", wrong: ["He's playing baseball.", "She's playing baseball."], scene: 'scene-park' },
  { id: 'play-basketball', label: 'play basketball', line: "He's playing basketball.", wrong: ["She's playing basketball.", "They're playing basketball."], scene: 'scene-court' },
  { id: 'play-football', label: 'play football', line: "She's playing football.", wrong: ["He's playing football.", "They're playing football."], scene: 'scene-park' },
  { id: 'swim', label: 'swim', line: "She's swimming.", wrong: ["He's swimming.", "They're swimming."], scene: 'scene-court' },
  { id: 'run', label: 'run', line: "He's running on the track.", wrong: ["She's running on the track.", "They're running on the track."], scene: 'scene-park' },
  { id: 'skateboard', label: 'skateboard', line: "She's skateboarding.", wrong: ["He's skateboarding.", "They're skateboarding."], scene: 'scene-park' }
];

const commissions = [
  { id: 'badminton', request: "Station one: They're playing badminton." },
  { id: 'play-tennis', request: "Station one: She's playing tennis." },
  { id: 'hockey', request: "Station one: They're playing hockey." }
];

const sportsDayIntro = "Let's plan a sports day!";

export const activityLines = [...new Set([
  ...vocab1,
  ...vocab2,
  ...Object.values(ingMap),
  ...vocab1.map(findLine),
  ...vocab2.map(campLine),
  ...ingTracks.flatMap(t => t.items.flatMap(([base, , , sentence]) => [base, sentence])),
  ...ingQuestions.map(q => q.full),
  ...liveDemos.flatMap(d => [d.q, d.a]),
  ...liveRounds.flatMap(r => r.kind === 'spot' ? [r.line] : [r.q, r.answer, ...r.distractors]),
  ...refereeRounds.flatMap(r => [r.q, r.answer, ...r.distractors]),
  ...permissionDemos.flatMap(d => [d.q, d.a]),
  ...permissionRounds.flatMap(r => r.kind === 'reply' ? [r.q, r.answer, ...r.distractors] : [r.full]),
  ...bodyHabits.map(h => h.line),
  ...whistleWords.map(w => w.word),
  sportsDayIntro,
  ...commissions.map(c => c.request),
  ...sportsDayPool.flatMap(p => [p.line, ...p.wrong])
].map(normalize))];

const shuffle = entries => {
  const arr = [...entries];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const safeRead = key => {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
};
const store = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* Guest mode without storage */ }
};

const stageMeta = [
  ['01', 'Clubhouse spotter', '先点卡片听读音，留意乐器前面的小礼帽 the。', '点“听英语”，在无文字图卡中找到对应运动或爱好。'],
  ['02', 'Action training camp', '认识拓展球类与赛场动作，点对比卡看清抛与接、打与踢。', '仔细听动作或球类英文，在特训场里选出正确画面。'],
  ['03', '-ing & “the” workshop', '切换四条轨道，观察动词加 -ing 的三种变化和乐器 the 规则。', '选出正确的词块拼上小火车，答对后再听完整句。'],
  ['04', 'Live sports reporter', '切换聚光灯人物，听听 I’m / He’s / She’s / They’re 怎样播报。', '听实况解说找人物，再根据聚光灯提问选出准确回答。'],
  ['05', 'Camera referee', '看赛场回放照片，对照肯定与否定短回答。', '看清照片里的人数和动作，听问题后选出正确的英语短回答。'],
  ['06', 'Park venue manager', '观察客厅、草坪和泳池边的场地差别，学习礼貌请求与回应。', '结合当前场地规则回应许可请求，或用动词原形拼出请求句。'],
  ['07', 'Strong body & /s/ whistle', '学习运动护体三件宝，再听听清脆的词首 /s/ 哨声。', '听健康习惯选图，再把词首带 /s/ 哨声的单词归队。'],
  ['08', 'My sports day plan', '先听示范赛区介绍，准备策划三站阳光运动会！', '按英文委托布置第 1 赛区，再自选两站并配好英语实况解说。']
];

const savedKey = index => 'powerup-u7-activity-v1-' + index;

export function startActivity(index, host, { speak, finish, art, words }) {
  if (index < 0 || index > 7) throw Error('Unknown Unit 7 activity');
  const speaker = text => {
    try { return Promise.resolve(speak(normalize(text))).catch(() => false); }
    catch { return Promise.resolve(false); }
  };
  const pic = (name, description = name, cls = 'u7-object') =>
    `<img class="${cls}" draggable="false" src="${esc(art(id(name)))}" alt="${esc(description)}">`;
  const btn = (action, html, extra = '') =>
    `<button type="button" class="u7-btn ${extra}" data-u7="${esc(action)}">${html}</button>`;
  const say = (line, label = '▶ 听英语') => btn('say:' + line, esc(label), 'u7-voice');
  const lang = text => `<span lang="en">${esc(text)}</span>`;
  const imageButton = (action, name, label = '', badge = '') =>
    btn(action, (badge ? `<small class="u7-mini-badge">${esc(badge)}</small>` : '') + pic(name, label || name) + (label ? `<span lang="en">${esc(label)}</span>` : ''), 'u7-img-choice');

  const deckLength =
    index === 0 ? vocab1.length :
    index === 1 ? vocab2.length :
    index === 2 ? ingQuestions.length :
    index === 3 ? liveRounds.length :
    index === 4 ? refereeRounds.length :
    index === 5 ? permissionRounds.length :
    index === 6 ? bodyRounds.length : 1;

  const available = Array.from({ length: deckLength }, (_, i) => i);
  const shouldShuffle = index === 0 || index === 1 || index === 4;

  function fresh() {
    return {
      mode: 'learn',
      deck: shouldShuffle ? shuffle(available) : [...available],
      pos: 0,
      step: 'open',
      assisted: false,
      anyHint: false,
      caption: false,
      choice: index === 0 ? 'play tennis' : index === 1 ? 'badminton' : '',
      tab: 0,
      selected: 'badminton',
      stops: [],
      brief: Math.floor(Math.random() * commissions.length),
      options: [],
      feedback: '',
      roundHelp: 0
    };
  }

  let s = fresh();
  const restored = safeRead(savedKey(index));
  if (
    restored &&
    Array.isArray(restored.deck) &&
    restored.deck.length === available.length &&
    new Set(restored.deck).size === available.length &&
    restored.deck.every(n => available.includes(n)) &&
    restored.pos >= 0 &&
    restored.pos <= available.length &&
    ['learn', 'play', 'done'].includes(restored.mode)
  ) {
    s = { ...s, ...restored };
  }

  const persist = () => store(savedKey(index), s);
  const deckId = () => s.deck[s.pos] ?? 0;
  const brief = () => commissions[s.brief] ?? commissions[0];

  function tiles(target, peers, fallbackBank = [], size = 4) {
    if (!s.options.length) {
      const candidates = [...new Set([...peers, ...shuffle(fallbackBank)])].filter(x => x !== target);
      s.options = shuffle([target, ...candidates.slice(0, size - 1)]);
    }
    return s.options;
  }

  function scene(bgName, inner, extra = '') {
    return `<div class="u7-scene ${extra}" style="--u7-bg:url('${esc(art(bgName))}')">${inner}</div>`;
  }

  function listenBar(line) {
    return `<div class="u7-listen">${say(line, '▶ 听英语')}${btn('caption', s.caption ? '收起英文' : '查看英文', 'u7-caption')}${s.caption ? `<b class="u7-transcript" lang="en">${esc(line)}</b>` : ''}</div>`;
  }

  function wordCardDetail(name) {
    const meta = words.find(w => w.word === name || w.id === id(name));
    if (!meta) return '';
    const hasThe = meta.word.includes(' the ');
    const highlighted = hasThe
      ? esc(meta.word).replace(' the ', ' <mark class="u7-the">the</mark> ')
      : esc(meta.word);
    return `<div class="u7-word-detail">
      <div class="u7-detail-top">
        ${pic(meta.word, meta.zh, 'u7-detail-pic')}
        <div>
          <h3 lang="en">${highlighted}${meta.alias ? ` <small>/ ${esc(meta.alias)}</small>` : ''}</h3>
          <div class="u7-tools">
            ${say(meta.word, '▶ 听词')}
            ${meta.alias ? say(meta.alias, meta.aliasLabel || ('▶ 听 ' + meta.alias)) : ''}
            ${say(meta.example, '▶ 听例句')}
          </div>
          <p class="u7-example" lang="en">${esc(meta.example)}</p>
          <details><summary>看中文与小贴士</summary><p><strong>${esc(meta.zh)}</strong>${meta.note ? ' · ' + esc(meta.note) : ''}</p></details>
        </div>
      </div>
    </div>`;
  }

  function renderDemo() {
    if (index === 0) {
      return `<div class="u7-vocab">${vocab1.map(w =>
        imageButton('word:' + w, w, w, w.includes(' the ') ? '🎹 +the' : '')
      ).join('')}</div>${wordCardDetail(s.choice || vocab1[0])}`;
    }
    if (index === 1) {
      const pairs = [
        ['throw', 'catch', '向外扔 ↔ 双手接'],
        ['hit', 'kick', '球拍打 ↔ 用脚踢'],
        ['badminton', 'hockey', '羽球托 ↔ 弯球杆']
      ];
      return `<div class="u7-vocab">${vocab2.map(w =>
        imageButton('word:' + w, w, ingMap[w] ? `${w} · ${ingMap[w]}` : w)
      ).join('')}</div>
      <div class="u7-contrast-bar">
        ${pairs.map(([a, b, label]) => `<div class="u7-pair"><span>${esc(label)}</span><div>${say(ingMap[a] || a, '▶ ' + (ingMap[a] || a))}${say(ingMap[b] || b, '▶ ' + (ingMap[b] || b))}</div></div>`).join('')}
      </div>
      ${wordCardDetail(s.choice || vocab2[0])}`;
    }
    if (index === 2) {
      const t = ingTracks[s.tab] || ingTracks[0];
      return `<div class="u7-tabs">${ingTracks.map((tr, i) =>
        `<button type="button" class="u7-btn u7-tab" data-u7="tab:${i}" aria-pressed="${i === s.tab}">${esc(tr.badge)}</button>`
      ).join('')}</div>
      <div class="u7-track-box">
        <p class="u7-track-tip">${esc(t.tip)}</p>
        <div class="u7-track-grid">
          ${t.items.map(([base, form, img, sentence]) => `<article class="u7-train-card">
            ${pic(img, base)}
            <div class="u7-train-formula"><span lang="en">${esc(base)}</span> ➜ <strong lang="en">${esc(form)}</strong></div>
            <p lang="en">${esc(sentence)}</p>
            ${say(sentence, '▶ 听例句')}
          </article>`).join('')}
        </div>
      </div>`;
    }
    if (index === 3) {
      const d = liveDemos[s.tab] || liveDemos[0];
      return `<div class="u7-tabs">${liveDemos.map((item, i) =>
        `<button type="button" class="u7-btn u7-tab" data-u7="tab:${i}" aria-pressed="${i === s.tab}">${esc(item.label)}</button>`
      ).join('')}</div>
      ${scene('scene-park', `<div class="u7-live-stage"><span class="u7-live-pill">● LIVE 实况镜头</span>${pic(d.art, d.label, 'u7-stage-hero')}</div>`, 'u7-photo')}
      <div class="u7-qa-demo">
        <div><small>记者提问</small>${say(d.q, '▶ ' + d.q)}</div>
        <div><small>实况回答</small>${say(d.a, '▶ ' + d.a)}</div>
      </div>`;
    }
    if (index === 4) {
      const samples = [
        ['badminton', 'Are they playing badminton?', 'Yes, they are.', "No, they're not."],
        ['skateboard', 'Is she running?', "No, she isn't.", 'Yes, she is.']
      ];
      const cur = samples[s.tab % 2];
      return `<div class="u7-tabs">
        <button type="button" class="u7-btn u7-tab" data-u7="tab:0" aria-pressed="${s.tab % 2 === 0}">双人回放 · Are they…?</button>
        <button type="button" class="u7-btn u7-tab" data-u7="tab:1" aria-pressed="${s.tab % 2 === 1}">单人回放 · Is she…?</button>
      </div>
      ${scene('scene-court', pic(cur[0], cur[1], 'u7-stage-hero'), 'u7-photo')}
      <div class="u7-tools">
        ${say(cur[1], '▶ 提问：' + cur[1])}
        ${say(cur[2], '✓ ' + cur[2])}
      </div>`;
    }
    if (index === 5) {
      const d = permissionDemos[s.tab % 3];
      return `<div class="u7-tabs">${permissionDemos.map((item, i) =>
        `<button type="button" class="u7-btn u7-tab" data-u7="tab:${i}" aria-pressed="${i === (s.tab % 3)}">${esc(item.badge.split('（')[0])}</button>`
      ).join('')}</div>
      ${scene(d.scene, `<div class="u7-venue-card"><span class="u7-venue-tag">${esc(d.badge)}</span>${pic(d.art, d.q, 'u7-stage-hero')}</div>`, 'u7-photo')}
      <div class="u7-qa-demo">
        <div><small>礼貌请求</small>${say(d.q, '▶ ' + d.q)}</div>
        <div><small>场地回应</small>${say(d.a, '▶ ' + d.a)}</div>
      </div>
      <p class="u7-hint-note">${esc(d.zh)}</p>`;
    }
    if (index === 6) {
      return `<div class="u7-habit-grid">
        ${bodyHabits.map(h => `<article class="u7-habit-card">${pic(h.id, h.zh)}<p lang="en">${esc(h.line)}</p><small>${esc(h.zh)}</small>${say(h.line, '▶ 听一听')}</article>`).join('')}
      </div>
      <div class="u7-whistle-box">
        <h4>🎵 词首哨声对比：听听清脆的 /s/ 开头音</h4>
        <div class="u7-tools">
          ${whistleWords.map(w => btn('say:' + w.word, `<span class="u7-sound" lang="en">▶ ${w.html}</span><small>${w.group === 's' ? '/s/ 哨声' : '对照音'}</small>`, 'u7-sound-chip')).join('')}
        </div>
      </div>`;
    }
    return `${scene('scene-park', `<div class="u7-demo-plan">${['badminton', 'swim', 'run'].map((item, idx) => `<div class="u7-mini-zone"><small>Station ${idx + 1}</small>${pic(item, item)}</div>`).join('')}</div>`, 'u7-photo')}
      <div class="u7-tools">
        ${say(sportsDayIntro, '▶ ' + sportsDayIntro)}
        ${say("They're playing badminton.", "▶ They're playing badminton.")}
        ${say("She's swimming.", "▶ She's swimming.")}
      </div>`;
  }

  function renderPlanStops() {
    if (!s.stops.length) return '';
    return `<div class="u7-stops">${s.stops.map((stopId, i) => {
      const meta = sportsDayPool.find(p => p.id === stopId) || sportsDayPool[0];
      return `<article class="u7-stop-card">
        <div class="u7-stop-head"><strong>Station ${i + 1}</strong><span lang="en">${esc(meta.label)}</span></div>
        ${scene(meta.scene, pic(meta.id, meta.label, 'u7-stage-hero'), 'u7-photo u7-mini-scene')}
        <p class="u7-stop-line" lang="en">${esc(meta.line)}</p>
        ${say(meta.line, '▶ 听赛区解说')}
      </article>`;
    }).join('')}</div>`;
  }

  function renderTask() {
    const k = deckId();
    if (index === 0) {
      const target = vocab1[k];
      const choices = tiles(target, confusionPeers[target] || [], vocab1, 4);
      const bg = indoorWords.has(target) ? 'scene-livingroom' : 'scene-park';
      return listenBar(findLine(target)) +
        scene(bg, choices.map(n => imageButton('answer:' + n, n)).join(''), 'u7-find');
    }
    if (index === 1) {
      const target = vocab2[k];
      const choices = tiles(target, confusionPeers[target] || [], vocab2, 4);
      return listenBar(campLine(target)) +
        scene('scene-court', choices.map(n => imageButton('answer:' + n, n)).join(''), 'u7-find') +
        (s.pos > 0 ? `<div class="u7-collection" aria-label="已收集特训徽章">${s.deck.slice(0, s.pos).map(n => pic(vocab2[n], vocab2[n])).join('')}</div>` : '');
    }
    if (index === 2) {
      const q = ingQuestions[k];
      const choices = tiles(q.answer, q.distractors, [], 3);
      return `<div class="u7-coupling-stage">
        ${pic(q.art, q.base, 'u7-stage-hero')}
        <div class="u7-base-tag">提示词：<strong lang="en">${esc(q.base)}</strong></div>
        <div class="u7-train-frame" lang="en"><span>🚂 ${esc(q.frame[0])}</span><b class="u7-slot">___</b><span>${esc(q.frame[1])}</span></div>
        <div class="u7-choices">${choices.map(x => btn('answer:' + x, lang(x), 'u7-word-tile')).join('')}</div>
      </div>`;
    }
    if (index === 3) {
      const r = liveRounds[k];
      if (r.kind === 'spot') {
        const zones = tiles(r.target, r.zones, r.zones, 3);
        return listenBar(r.line) +
          scene('scene-park', `<div class="u7-spot-grid">${zones.map((z, idx) =>
            btn('answer:' + z, `<small class="u7-zone-num">镜头 ${idx + 1}</small>${pic(z, z)}`, 'u7-img-choice u7-zone-choice')
          ).join('')}</div>`, 'u7-find-three');
      }
      const choices = tiles(r.answer, r.distractors, [], 3);
      return listenBar(r.q) +
        scene('scene-park', `<div class="u7-venue-card"><span class="u7-venue-tag">${esc(r.role)}</span>${pic(r.art, r.role, 'u7-stage-hero')}</div>`, 'u7-photo') +
        `<div class="u7-choices u7-sentence-choices">${choices.map(x => `<div class="u7-answer-audio">${say(x, '♫')}${btn('answer:' + x, lang(x))}</div>`).join('')}</div>`;
    }
    if (index === 4) {
      const r = refereeRounds[k];
      const choices = tiles(r.answer, r.distractors, [], 3);
      return listenBar(r.q) +
        scene('scene-court', `<div class="u7-venue-card"><span class="u7-venue-tag">📸 裁判回放镜头</span>${pic(r.art, r.art, 'u7-stage-hero')}</div>`, 'u7-photo') +
        `<div class="u7-choices u7-sentence-choices">${choices.map(x => `<div class="u7-answer-audio">${say(x, '♫')}${btn('answer:' + x, lang(x))}</div>`).join('')}</div>`;
    }
    if (index === 5) {
      const r = permissionRounds[k];
      if (r.kind === 'reply') {
        const choices = tiles(r.answer, r.distractors, [], 3);
        return listenBar(r.q) +
          scene(r.scene, `<div class="u7-venue-card"><span class="u7-venue-tag">${esc(r.badge)}</span>${pic(r.art, r.art, 'u7-stage-hero')}</div>`, 'u7-photo') +
          `<div class="u7-choices u7-sentence-choices">${choices.map(x => `<div class="u7-answer-audio">${say(x, '♫')}${btn('answer:' + x, lang(x))}</div>`).join('')}</div>`;
      }
      const choices = tiles(r.answer, r.distractors, [], 3);
      return scene(r.scene, `<div class="u7-venue-card"><span class="u7-venue-tag">${esc(r.badge)}</span>${pic(r.art, r.art, 'u7-stage-hero')}</div>`, 'u7-photo') +
        `<div class="u7-train-frame" lang="en"><span>${esc(r.frame[0])}</span><b class="u7-slot">___</b><span>${esc(r.frame[1])}</span></div>
        <div class="u7-choices">${choices.map(x => btn('answer:' + x, lang(x), 'u7-word-tile')).join('')}</div>`;
    }
    if (index === 6) {
      const r = bodyRounds[k];
      if (r.kind === 'habit') {
        const choices = tiles(r.target, bodyHabits.map(h => h.id), [], 3);
        return listenBar(r.line) +
          `<div class="u7-habit-choices">${choices.map(hid => imageButton('answer:' + hid, hid)).join('')}</div>`;
      }
      return `<div class="u7-tickets">
        <p>先听神秘单词，再和两个车队的领头音比一比，它属于清脆的 <strong>/s/ 哨声小队</strong> 吗？</p>
        <div class="u7-listen">${say(r.word, '▶ 听神秘单词')}</div>
        <div class="u7-carriage-row">
          <div class="u7-carriage">
            ${say('sport', '▶ 听参照词 sport (/s/)')}
            ${btn('answer:s', '✓ 加入 /s/ 哨声小队', 'u7-primary')}
          </div>
          <div class="u7-carriage u7-carriage-alt">
            ${say('hockey', '▶ 听对照词 hockey')}
            ${btn('answer:other', '➜ 其他开头音')}
          </div>
        </div>
      </div>`;
    }
    // Index 7: My Sports Day Plan
    if (s.step === 'open') {
      const c = brief();
      return `<div class="u7-commission-box"><strong>📋 第 1 赛区报名委托卡</strong><p>先听拉布布念出的英文报名卡，帮第 1 赛区选对运动项目！</p>${listenBar(c.request)}</div>
        <div class="u7-vocab">${sportsDayPool.map(p =>
          `<button type="button" class="u7-btn u7-img-choice" data-u7="pickSport:${p.id}" aria-pressed="${s.selected === p.id}">${pic(p.id, p.label)}</button>`
        ).join('')}</div>
        <div class="u7-tools">${btn('confirmSport', '确认放入第 1 赛区 →', 'u7-primary')}</div>`;
    }
    if (s.step === 'add') {
      const used = new Set(s.stops);
      const remaining = sportsDayPool.filter(p => !used.has(p.id));
      if (used.has(s.selected) && remaining[0]) s.selected = remaining[0].id;
      return renderPlanStops() +
        `<p><strong>自主策划第 ${s.stops.length + 1} 赛区：</strong>从下面挑一个你想安排进运动会的项目！</p>
        <div class="u7-vocab">${remaining.map(p =>
          `<button type="button" class="u7-btn u7-img-choice" data-u7="pickSport:${p.id}" aria-pressed="${s.selected === p.id}">${pic(p.id, p.label)}<span lang="en">${esc(p.label)}</span></button>`
        ).join('')}</div>
        <div class="u7-tools">${btn('confirmSport', `放入第 ${s.stops.length + 1} 赛区 →`, 'u7-primary')}</div>`;
    }
    if (s.step === 'describe') {
      const currentId = s.stops[s.stops.length - 1];
      const meta = sportsDayPool.find(p => p.id === currentId) || sportsDayPool[0];
      const choices = tiles(meta.line, meta.wrong, [], 3);
      return scene(meta.scene, `<div class="u7-venue-card"><span class="u7-venue-tag">🎤 给第 ${s.stops.length} 赛区配一句实况解说</span>${pic(meta.id, meta.label, 'u7-stage-hero')}</div>`, 'u7-photo') +
        `<div class="u7-choices u7-sentence-choices">${choices.map(x => btn('describe:' + x, lang(x))).join('')}</div>`;
    }
    return renderPlanStops();
  }

  function renderSouvenir() {
    const k = deckId();
    if (index === 0) return pic(vocab1[k], vocab1[k], 'u7-souvenir-pic');
    if (index === 1) return pic(vocab2[k], vocab2[k], 'u7-souvenir-pic');
    if (index === 2) return pic(ingQuestions[k].art, ingQuestions[k].full, 'u7-souvenir-pic');
    if (index === 3) {
      const r = liveRounds[k];
      return pic(r.kind === 'spot' ? r.target : r.art, '', 'u7-souvenir-pic');
    }
    if (index === 4) return pic(refereeRounds[k].art, '', 'u7-souvenir-pic');
    if (index === 5) return pic(permissionRounds[k].art, '', 'u7-souvenir-pic');
    if (index === 6) {
      const r = bodyRounds[k];
      return r.kind === 'habit'
        ? pic(r.target, '', 'u7-souvenir-pic')
        : `<div class="u7-sound-reveal" lang="en">${r.html}</div>`;
    }
    return renderPlanStops();
  }

  function correct(message, spokenLine) {
    s.step = 'right';
    s.feedback = message;
    s.anyHint ||= s.assisted;
    if (spokenLine) speaker(spokenLine);
    render();
  }

  function retry(customMsg = '') {
    s.feedback = customMsg || (
      index === 2 ? ingQuestions[deckId()].hint :
      index === 5 ? '再看一看场地提示（室内花瓶、球场还是泳池边），听听哪句最合适。' :
      index === 6 && bodyRounds[deckId()].kind === 'sound' ? '再点“听神秘单词”，仔细听开头是不是清脆的 /s/ 哨声。' :
      '没关系，再点“听英语”仔细听一次，看清人物和动作再选。'
    );
    s.assisted = true;
    render();
  }

  function nextRound() {
    s.pos += 1;
    if (s.pos >= s.deck.length) {
      s.mode = 'done';
      persist();
      render();
      finish();
      return;
    }
    s.step = 'open';
    s.feedback = '';
    s.caption = false;
    s.assisted = false;
    s.options = [];
    render();
  }

  function render() {
    const [num, stageTitle, learnIntro, playIntro] = stageMeta[index];
    let content = '';
    if (s.mode === 'learn') {
      content = `<p class="u7-lead">${esc(learnIntro)}</p>${renderDemo()}<div class="u7-tools u7-action-bar">${btn('begin', '开始本关挑战 →', 'u7-primary')}</div>`;
    } else if (s.mode === 'done') {
      const poster = index === 7
        ? `<div class="u7-poster-sheet">
            <header class="u7-poster-head">
              ${pic('guide-happy', '拉布布教练')}
              <div>
                <small>POWER UP · UNIT 7 SPORTS DAY</small>
                <h3>枝枝与拉布布的阳光运动会秩序册</h3>
                <p>试着指着下面三个赛区，用英语给爸爸妈妈做一次实况解说吧！</p>
              </div>
            </header>
            ${renderPlanStops()}
          </div>
          <div class="u7-tools no-print">${btn('print', '🖨️ 打印运动会秩序册', 'u7-primary')}</div>`
        : index <= 1
          ? `<div class="u7-collection">${(index === 0 ? vocab1 : vocab2).map(n => pic(n, n)).join('')}</div>`
          : '';
      content = `<div class="u7-done-box">
        <div class="u7-done-head">${index === 7 ? '' : pic('guide-happy', '庆祝', 'u7-done-guide')}<div><h3>本关挑战完成！</h3><p>${s.anyHint ? '本轮使用过提示或重试，还可以再来一轮挑战独立通关。' : '全程独立听懂并完成挑战，太棒啦！'}</p></div></div>
        ${poster}
        <div class="u7-tools no-print">${btn('restart', '再玩一轮')}${btn('review', '回到学习示范')}</div>
      </div>`;
    } else {
      const halfway = (index === 0 || index === 1) && s.pos === 5 && s.step === 'open' && s.roundHelp !== s.pos;
      if (halfway) {
        content = `<div class="u7-checkpoint">${pic('guide-happy', '', 'u7-souvenir-pic')}<h3>上半场顺利完成！</h3><p>已经认出 ${s.pos} 个啦，喝口水或者直接进入下半场吧。</p>${btn('continue', '继续下半场 →', 'u7-primary')}</div>`;
      } else if (s.step === 'right') {
        content = `<div class="u7-success"><b>✓</b><p lang="en">${esc(s.feedback)}</p>${renderSouvenir()}${btn('next', s.pos + 1 === s.deck.length ? '领取本关印章 →' : '下一题 →', 'u7-primary')}</div>`;
      } else {
        content = `<p class="u7-lead">${esc(playIntro)}</p>${renderTask()}${s.feedback ? `<p class="u7-feedback" role="status">${esc(s.feedback)}</p>` : ''}`;
      }
    }

    const pose =
      s.mode === 'done' || s.step === 'right' ? 'guide-happy' :
      s.feedback ? 'guide-encourage' :
      s.mode === 'learn' ? 'guide-point' :
      (index === 3 || index === 4) ? 'guide-think' : 'guide-listen';

    const progressLabel =
      s.mode === 'learn' ? '学习示范' :
      s.mode === 'done' ? '已完成' :
      index === 7 ? `赛区 ${Math.min(3, s.stops.length + (s.step === 'describe' ? 0 : 1))} / 3` :
      `${s.pos + 1} / ${s.deck.length}`;

    host.innerHTML = `<section class="u7-work">
      <div class="u7-work-head no-print">
        <span>${pic(pose, '拉布布向导')} <b>${num} · <span lang="en">${esc(stageTitle)}</span></b></span>
        <div class="u7-head-right">
          ${s.mode === 'play' ? btn('review', '看示范', 'u7-mini-btn') : ''}
          <small>${esc(progressLabel)}</small>
        </div>
      </div>
      ${content}
    </section>`;
    persist();
  }

  host.onclick = event => {
    const button = event.target.closest('[data-u7]');
    if (!button || !host.contains(button)) return;
    const [action, ...rest] = button.dataset.u7.split(':');
    const val = rest.join(':');
    const k = deckId();

    if (action === 'say') { speaker(val); return; }
    if (action === 'word') { s.choice = val; speaker(val); render(); return; }
    if (action === 'tab') { s.tab = Number(val) || 0; render(); return; }
    if (action === 'begin') { s.mode = 'play'; s.feedback = ''; render(); return; }
    if (action === 'restart' || action === 'review') {
      const nextMode = action === 'review' ? 'learn' : 'play';
      s = fresh();
      s.mode = nextMode;
      render();
      return;
    }
    if (action === 'next') { nextRound(); return; }
    if (action === 'continue') { s.roundHelp = s.pos; render(); return; }
    if (action === 'caption') { s.caption = !s.caption; s.assisted = true; render(); return; }
    if (action === 'print') { window.print(); return; }

    if (action === 'pickSport') {
      s.selected = val;
      s.feedback = '';
      render();
      return;
    }
    if (action === 'confirmSport') {
      if (s.step === 'open' && s.selected !== brief().id) {
        retry('再听一次委托卡，看看第 1 赛区报的是哪一项运动。');
        return;
      }
      if (s.stops.includes(s.selected)) {
        s.feedback = '这个项目已经安排过啦，换一个新项目吧！';
        render();
        return;
      }
      s.stops.push(s.selected);
      s.step = 'describe';
      s.options = [];
      s.feedback = '';
      render();
      return;
    }
    if (action === 'describe') {
      const currentId = s.stops[s.stops.length - 1];
      const meta = sportsDayPool.find(p => p.id === currentId) || sportsDayPool[0];
      if (val !== meta.line) {
        retry('看看赛区里是一个男孩 (He’s)、一个女孩 (She’s)，还是两个人一起 (They’re)？');
        return;
      }
      if (s.stops.length >= 3) {
        correct(meta.line, meta.line);
        return;
      }
      speaker(meta.line);
      const nextCandidate = sportsDayPool.find(p => !s.stops.includes(p.id));
      s.selected = nextCandidate ? nextCandidate.id : sportsDayPool[0].id;
      s.step = 'add';
      s.options = [];
      s.feedback = '';
      render();
      return;
    }

    if (action === 'answer') {
      if (index === 0) {
        const target = vocab1[k];
        if (val !== target) { retry(); return; }
        const meta = words.find(w => w.word === target);
        correct(`${target} — ${meta ? meta.example : ''}`, target);
        return;
      }
      if (index === 1) {
        const target = vocab2[k];
        if (val !== target) { retry(); return; }
        const spoken = ingMap[target] || target;
        correct(ingMap[target] ? `${target} → ${ingMap[target]}` : target, spoken);
        return;
      }
      if (index === 2) {
        const q = ingQuestions[k];
        if (val !== q.answer) { retry(); return; }
        correct(q.full, q.full);
        return;
      }
      if (index === 3) {
        const r = liveRounds[k];
        const expected = r.kind === 'spot' ? r.target : r.answer;
        const spoken = r.kind === 'spot' ? r.line : r.answer;
        if (val !== expected) { retry('看清人物（He / She / They / I）和正在做的动作，再试一次！'); return; }
        correct(spoken, spoken);
        return;
      }
      if (index === 4) {
        const r = refereeRounds[k];
        if (val !== r.answer) { retry('看清照片里的动作对不对，同时留意问句开头是 Is 还是 Are。'); return; }
        correct(`${r.q} ${r.answer}`, r.answer);
        return;
      }
      if (index === 5) {
        const r = permissionRounds[k];
        const spoken = r.kind === 'reply' ? r.answer : r.full;
        if (val !== r.answer) {
          retry(r.kind === 'build' ? 'Can I / Can we 后面要用动词原形，还要留意乐器前面的 the 哦！' : '');
          return;
        }
        correct(spoken, spoken);
        return;
      }
      if (index === 6) {
        const r = bodyRounds[k];
        if (r.kind === 'habit') {
          if (val !== r.target) { retry(); return; }
          correct(r.line, r.line);
        } else {
          if (val !== r.group) { retry(); return; }
          correct(`${r.word} (${r.group === 's' ? '/s/ 哨声开头' : '非 /s/ 开头'})`, r.word);
        }
      }
    }
  };

  render();
  return () => { host.onclick = null; };
}
