import { words } from './words.mjs';
import { speak as play, stop, setRate } from './voice.mjs';
import { startActivity } from './activities.mjs';

export const stops = [
  ['club', '运动与爱好俱乐部', '认读10个运动与爱好词', 'play-tennis', '#e8efe0'],
  ['camp', '赛场动作特训营', '拓展球类与抛接踢打动作', 'badminton', '#e2edf1'],
  ['ing', '小尾巴变形工坊', '-ing 三规则与乐器 the', 'swim', '#f3ead7'],
  ['live', '赛场实况小记者', '播报正在做的事', 'baseball', '#e6ecdd'],
  ['referee', '火眼金睛裁判台', 'Is / Are 提问与短回答', 'hockey', '#e3e8f0'],
  ['permission', '公园场地小管家', 'Can we…? 请求与场地回应', 'play-football', '#efe5d6'],
  ['body', '活力护体与哨声角', '强壮身体习惯与 /s/ 辨音', 'habit-exercise', '#dfece6'],
  ['sportsday', '我来策划运动会', '安排三站赛区，输出秩序册', 'sport', '#f4e6d8']
];

export const book = [
  ['Leo and Mia are playing football in the park. Sam is watching.', 'Leo 和 Mia 正在公园里踢足球，新朋友 Sam 站在旁边看着。'],
  ["Oh no! Look at the ball! Sam is running. He's catching the ball by the water!", '哎呀，看那个球！Sam 快步跑过去，在水边稳稳把球接住了！'],
  ["Thank you, Sam! Can you play football with us? Yes! Let's play together!", '“谢谢你，Sam！你能和我们一起踢足球吗？”“好呀！我们一起玩吧！”'],
  ["Now they're playing football together. Sam helps his friends. He's a good friend!", '现在他们正在一起开心踢球。Sam 主动帮助同伴，他真是一位好朋友！']
];

export const bookQuiz = [
  {
    q: "What's Sam doing by the water?",
    answer: "He's catching the ball.",
    wrong: "He's watching television."
  },
  {
    q: 'Can Sam play football with Leo and Mia?',
    answer: 'Yes, he can.',
    wrong: "No, they're not."
  }
];

export const friendshipLines = [
  'I help my friends.',
  "Let's play together!",
  'Can you play with us?'
];

export const bookLines = [
  ...book.map(([line]) => line),
  ...bookQuiz.flatMap(q => [q.q, q.answer, q.wrong]),
  ...friendshipLines
];

if (typeof document !== 'undefined') {
  const root = document.querySelector('#lesson');
  const art = id => new URL('./art/' + id + '.webp', import.meta.url).href;
  const progressKey = 'powerup-unit7-visits-v1';
  let visited = new Set();
  try {
    const items = JSON.parse(localStorage.getItem(progressKey) || '[]');
    if (Array.isArray(items)) visited = new Set(items.filter(id => stops.some(([key]) => key === id)));
  } catch {}

  let exitActivity;
  let playback = 0;
  let quizAnswers = {};
  const stopButton = document.querySelector('#stop-audio');
  const message = document.querySelector('#audio-message');

  function silence() {
    playback += 1;
    stop();
    stopButton.hidden = true;
    message.textContent = '';
  }

  async function speak(line) {
    const token = ++playback;
    stopButton.hidden = false;
    message.textContent = '正在播放';
    const ok = await play(line);
    if (token === playback) {
      stopButton.hidden = true;
      message.textContent = ok ? '' : '播放未完成，可再点一次。';
    }
    return ok;
  }

  stopButton.onclick = silence;
  window.addEventListener('pagehide', silence);

  function home() {
    const next = stops.find(([id]) => !visited.has(id)) || stops[0];
    root.innerHTML = `<section class="cover">
      <div class="cover-copy">
        <span class="eyeline" lang="en">Unit 7 · Power Up Level 1</span>
        <h1 lang="en">Let's play!</h1>
        <h2>拉布布的阳光运动会</h2>
        <p>系好运动护腕，和拉布布一起认识运动与爱好，播报赛场实况，筹备一场快乐运动会吧！</p>
        <div class="cover-actions">
          <a class="start" href="#${next[0]}">${visited.size ? '继续闯关' : '一起上场'} →</a>
          <a class="book-pill" href="#book">📖 友谊绘本 · A good friend</a>
        </div>
      </div>
      <img class="cover-guide" src="${art('guide')}" alt="灰色拉布布运动会小教练">
    </section>
    <div class="section-bar"><h2>今天挑战哪一站？</h2><span>${visited.size} / 8 站已完成</span></div>
    <nav class="stations" aria-label="运动会闯关站点">${stops.map(([id, name, desc, img, color], i) =>
      `<a class="station" href="#${id}" style="--wash:${color}">
        <span class="station-index">0${i + 1}</span>
        <img src="${art(img)}" alt="">
        <strong>${name}</strong>
        <small>${desc}</small>
        ${visited.has(id) ? '<span class="stamp" aria-label="已完成">✓</span>' : ''}
      </a>`
    ).join('')}</nav>
    <a class="story-link" href="#book">一起读公园互助绘本 · A good friend ↗</a>`;
  }

  function navigation(id) {
    return `<nav class="subnav no-print">
      <a href="#home">← 运动会主页</a>
      <select id="stop-select" aria-label="选择站点">${[...stops, ['book', '友谊绘本 · A good friend']].map(([key, label]) =>
        `<option value="${key}" ${key === id ? 'selected' : ''}>${label}</option>`
      ).join('')}</select>
    </nav>`;
  }

  function selectListener() {
    const sel = document.querySelector('#stop-select');
    if (sel) sel.onchange = e => { location.hash = e.target.value; };
  }

  function showBook(i = 0) {
    const [line, cn] = book[i];
    const displayLine = i === 2
      ? '“Thank you, Sam! Can you play football with us?” “Yes! Let’s play together!”'
      : line;
    root.innerHTML = navigation('book') +
      `<h1 class="activity-title" lang="en">A good friend · 好朋友在公园</h1>
      <article class="book">
        <div class="book-frame"><img src="${art('story-' + (i + 1))}" alt="好朋友绘本第 ${i + 1} 页插画"></div>
        <h2 lang="en">${displayLine}</h2>
        <details><summary>看中文</summary><p>${cn}</p></details>
        <div class="book-controls">
          <button type="button" id="read" class="book-primary">▶ 听这一页</button>
          <button type="button" id="prev" ${i ? '' : 'disabled'}>← 上一页</button>
          <span class="book-page">${i + 1} / 4</span>
          <button type="button" id="next" ${i === 3 ? 'disabled' : ''}>下一页 →</button>
        </div>
        ${i === 3 ? `<section class="book-extra">
          <h3>故事小问答 · Story Check</h3>
          ${bookQuiz.map((q, qi) => {
            const picked = quizAnswers[qi];
            return `<div class="book-quiz-item">
              <p lang="en"><strong>Q${qi + 1}.</strong> ${q.q} <button type="button" class="mini-say" data-say="${q.q}">♫ 听问句</button></p>
              <div class="book-controls">
                ${[q.answer, q.wrong].map(opt =>
                  `<button type="button" data-q="${qi}" data-opt="${opt}" class="${picked === opt ? (opt === q.answer ? 'right' : 'wrong') : ''}" lang="en">${opt}</button>`
                ).join('')}
              </div>
              ${picked ? `<small class="quiz-msg">${picked === q.answer ? '✓ 答对啦！' : '再看一看故事插图试一试～'}</small>` : ''}
            </div>`;
          }).join('')}
          <h3>好朋友能量卡 · Being a Good Friend</h3>
          <div class="book-controls">
            ${friendshipLines.map(m => `<button type="button" data-say="${m}" lang="en">▶ ${m}</button>`).join('')}
          </div>
        </section>` : ''}
      </article>`;

    selectListener();
    document.querySelector('#read').onclick = () => speak(line);
    for (const [key, step] of [['prev', -1], ['next', 1]]) {
      document.querySelector('#' + key).onclick = () => { silence(); showBook(i + step); };
    }
    for (const b of root.querySelectorAll('[data-say]')) {
      b.onclick = () => speak(b.dataset.say);
    }
    for (const b of root.querySelectorAll('[data-q]')) {
      b.onclick = () => {
        const qi = Number(b.dataset.q);
        const opt = b.dataset.opt;
        quizAnswers[qi] = opt;
        speak(opt);
        showBook(3);
      };
    }
  }

  function route() {
    if (typeof exitActivity === 'function') exitActivity();
    exitActivity = null;
    silence();
    const id = location.hash.slice(1);
    const index = stops.findIndex(([key]) => key === id);
    if (id === 'book') {
      showBook(0);
    } else if (index < 0) {
      home();
    } else {
      root.innerHTML = navigation(id) + `<h1 class="activity-title">${stops[index][1]}</h1><section id="activity-host"></section>`;
      selectListener();
      const finish = () => {
        visited.add(id);
        try { localStorage.setItem(progressKey, JSON.stringify([...visited])); } catch {}
      };
      exitActivity = startActivity(index, document.querySelector('#activity-host'), { speak, finish, art, words });
    }
    window.scrollTo(0, 0);
  }

  if (location.hostname.endsWith('.chatgpt.site')) {
    document.querySelector('#drawer').href = '../words?unit=7';
  }
  const speed = document.createElement('select');
  speed.setAttribute('aria-label', '朗读语速');
  speed.innerHTML = '<option value="1">自然语速</option><option value="0.85">慢一点</option>';
  speed.onchange = () => setRate(Number(speed.value));
  stopButton.before(speed);

  window.addEventListener('hashchange', route);
  route();
}
