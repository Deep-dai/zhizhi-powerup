// Shared procedural sound effects, SVG die-cut sticker filter,
// interactive peel-and-stick slot ceremony, and stardust particle helpers.

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let audioCtx = null;
let noiseBuffer = null;
let lastPeelTick = 0;

function ctx() {
  if (reducedMotion.matches) return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) audioCtx = new AudioContextClass();
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

function whiteNoise(c) {
  if (noiseBuffer && noiseBuffer.sampleRate === c.sampleRate) return noiseBuffer;
  const length = Math.floor(c.sampleRate * 0.5);
  const buf = c.createBuffer(1, length, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buf;
  return buf;
}

function tone(c, freq, start, duration, { type = 'sine', gain = 0.08, endFreq = null, attack = 0.012 } = {}) {
  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), start + duration);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.linearRampToValueAtTime(gain, start + Math.min(attack, duration * 0.4));
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(amp).connect(c.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export const sfx = {
  peelTick(progress = 0.5) {
    const nowMs = performance.now();
    if (nowMs - lastPeelTick < 58) return;
    lastPeelTick = nowMs;
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = whiteNoise(c);
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600 + progress * 1500, t);
    filter.Q.setValueAtTime(3.2, t);
    const amp = c.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.linearRampToValueAtTime(0.045, t + 0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    src.connect(filter).connect(amp).connect(c.destination);
    src.start(t, Math.random() * 0.3, 0.05);
  },

  peelPop() {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    // Crisp adhesive release sweep + bubbly pop
    const src = c.createBufferSource();
    src.buffer = whiteNoise(c);
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(4200, t + 0.14);
    filter.Q.setValueAtTime(2.4, t);
    const amp = c.createGain();
    amp.gain.setValueAtTime(0.001, t);
    amp.gain.linearRampToValueAtTime(0.07, t + 0.03);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    src.connect(filter).connect(amp).connect(c.destination);
    src.start(t, 0, 0.16);
    tone(c, 390, t + 0.09, 0.13, { type: 'sine', gain: 0.11, endFreq: 780, attack: 0.008 });
    tone(c, 1046.5, t + 0.14, 0.22, { type: 'triangle', gain: 0.06, attack: 0.01 });
  },

  flyWhoosh() {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    tone(c, 523.25, t, 0.34, { type: 'sine', gain: 0.045, endFreq: 880, attack: 0.04 });
  },

  stampThud() {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    // Soft rubber-stamp thud + warm celebratory chime triad
    tone(c, 155, t, 0.12, { type: 'triangle', gain: 0.16, endFreq: 54, attack: 0.005 });
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      tone(c, f, t + 0.06 + i * 0.055, 0.38, { type: 'triangle', gain: 0.065, attack: 0.01 });
    });
  },

  wordSummon() {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    [587.33, 739.99, 880].forEach((f, i) => {
      tone(c, f, t + i * 0.16, 0.28, { type: 'sine', gain: 0.045, attack: 0.02 });
    });
  },

  orbAbsorb(index = 0) {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    const base = [587.33, 739.99, 880][index % 3]; // D5, F#5, A5
    tone(c, base * 0.75, t, 0.22, { type: 'sine', gain: 0.055, endFreq: base, attack: 0.015 });
    tone(c, base, t + 0.12, 0.42, { type: 'triangle', gain: 0.095, attack: 0.008 });
    tone(c, base * 2, t + 0.14, 0.32, { type: 'sine', gain: 0.04, attack: 0.008 });
  },

  auroraCharge() {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    const scale = [587.33, 659.25, 739.99, 880, 987.77, 1174.66, 1318.51, 1479.98];
    scale.forEach((f, i) => {
      tone(c, f, t + i * 0.102, 0.34, { type: 'sine', gain: 0.05, attack: 0.018 });
    });
  },

  starReveal() {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    // Grand D-major 9th magical chord bloom + lingering twinkling bells
    [587.33, 739.99, 880, 1174.66].forEach((f, i) => {
      tone(c, f, t + i * 0.04, 1.05, { type: 'triangle', gain: 0.075, attack: 0.018 });
    });
    [1479.98, 1760, 2217.46, 2349.32].forEach((f, i) => {
      tone(c, f, t + 0.16 + i * 0.11, 0.62, { type: 'sine', gain: 0.045, attack: 0.01 });
    });
  },

  pokemonEvolveSequence() {
    const c = ctx();
    if (!c) return () => {};
    let cancelled = false;
    const timers = [];
    const schedule = (ms, fn) => {
      const id = setTimeout(() => { if (!cancelled) fn(); }, ms);
      timers.push(id);
    };
    // Classic accelerating silhouette pulse beats synced to 2.8s CSS keyframes
    const beats = [
      [80, 392, 180],
      [410, 523.25, 220],
      [740, 392, 200],
      [1040, 554.37, 180],
      [1290, 415.3, 160],
      [1510, 587.33, 140],
      [1680, 440, 120],
      [1815, 622.25, 105],
      [1930, 466.16, 95],
      [2030, 659.25, 90],
      [2115, 493.88, 85]
    ];
    for (const [ms, freq, dur] of beats) {
      schedule(ms, () => {
        const now = c.currentTime;
        tone(c, freq, now, dur / 1000, { type: 'triangle', gain: 0.075, attack: 0.008 });
      });
    }
    // 2200ms: Radiant white-flash burst & triumphant evolution fanfare!
    schedule(2190, () => {
      const now = c.currentTime;
      const fanfare = [
        [587.33, 0, 0.14],
        [783.99, 0.11, 0.14],
        [987.77, 0.22, 0.16],
        [1174.66, 0.34, 0.68]
      ];
      for (const [f, offset, dur] of fanfare) {
        tone(c, f, now + offset, dur, { type: 'triangle', gain: 0.085, attack: 0.01 });
      }
      tone(c, 587.33, now + 0.34, 0.68, { type: 'sine', gain: 0.06, attack: 0.02 });
      tone(c, 1567.98, now + 0.42, 0.5, { type: 'sine', gain: 0.04, attack: 0.01 });
    });
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  },

  mapHop(toneName = 'leaf') {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime;
    const roots = {
      leaf: 523.25, fire: 587.33, water: 493.88, trail: 554.37,
      sun: 659.25, dawn: 622.25, moon: 440, ice: 698.46, ribbon: 659.25
    };
    const root = roots[toneName] || 523.25;
    tone(c, root, t, 0.11, { type: 'sine', gain: 0.075, endFreq: root * 1.32, attack: 0.006 });
    tone(c, root * 1.25, t + 0.14, 0.15, { type: 'triangle', gain: 0.07, endFreq: root * 1.5, attack: 0.006 });
  }
};

let filterMounted = false;
export function ensureDieCutFilter() {
  if (filterMounted || document.getElementById('powerupStickerSvgDefs')) {
    filterMounted = true;
    return;
  }
  filterMounted = true;
  const holder = document.createElement('div');
  holder.innerHTML = `<svg id="powerupStickerSvgDefs" width="0" height="0" style="position:fixed;left:-9999px;top:-9999px;pointer-events:none" aria-hidden="true" focusable="false">
    <defs>
      <filter id="stickerDieCutFilter" x="-18%" y="-18%" width="136%" height="136%" color-interpolation-filters="sRGB">
        <feMorphology in="SourceAlpha" operator="dilate" radius="6" result="dilated"/>
        <feGaussianBlur in="dilated" stdDeviation="0.9" result="smoothed"/>
        <feComponentTransfer in="smoothed" result="ring">
          <feFuncA type="table" tableValues="0 1 1 1 1"/>
        </feComponentTransfer>
        <feFlood flood-color="#fffdf8" result="ivory"/>
        <feComposite in="ivory" in2="ring" operator="in" result="outline"/>
        <feDropShadow in="outline" dx="0" dy="5" stdDeviation="4.5" flood-color="#3f2d49" flood-opacity="0.24" result="shadowed"/>
        <feMerge>
          <feMergeNode in="shadowed"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  </svg>`;
  document.body.append(holder.firstElementChild);
}

export function createStardustMarkup(count = 26, accent = '#c7a367') {
  const palette = [accent, '#f5d47a', '#e8b4dc', '#9ee0e8', '#cbb4ef', '#fff6cc'];
  const glyphs = ['✧', '✦', '•', '✧', '⋆', '•'];
  const items = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + ((i % 3) - 1) * 0.14;
    const dist = 96 + (i % 4) * 28 + ((i * 17) % 24);
    const dx = Math.round(Math.cos(angle) * dist);
    const dy = Math.round(Math.sin(angle) * dist + 14);
    const size = 10 + (i % 4) * 4;
    const delay = (i % 6) * 32;
    const color = palette[i % palette.length];
    const glyph = glyphs[i % glyphs.length];
    items.push(
      `<span class="stardust-mote" style="--dx:${dx}px;--dy:${dy}px;--size:${size}px;--delay:${delay}ms;--mote-color:${esc(color)}" aria-hidden="true">${glyph}</span>`
    );
  }
  return `<div class="stardust-field" aria-hidden="true">${items.join('')}</div>`;
}

function burstSlotConfetti(targetEl, accent = '#c7a367') {
  if (!targetEl || reducedMotion.matches) return;
  const rect = targetEl.getBoundingClientRect();
  const layer = document.createElement('div');
  layer.className = 'slot-confetti-burst';
  layer.style.left = `${rect.left + rect.width / 2}px`;
  layer.style.top = `${rect.top + rect.height / 2}px`;
  const colors = [accent, '#f2c96b', '#e59bbd', '#8ecbd6', '#b39ddb'];
  const symbols = ['✦', '✧', '★', '•'];
  layer.innerHTML = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    const r = 56 + (i % 3) * 26;
    const x = Math.round(Math.cos(a) * r);
    const y = Math.round(Math.sin(a) * r - 10);
    return `<i style="--cx:${x}px;--cy:${y}px;--cc:${colors[i % colors.length]}">${symbols[i % symbols.length]}</i>`;
  }).join('');
  document.body.append(layer);
  setTimeout(() => layer.remove(), 950);
}

/**
 * Interactive Peel-and-Stick Ceremony:
 * 1. Displays tactile sticker backing sheet with curled glossy highlight corner.
 * 2. Child swipes across OR taps once to peel the sticker off the liner.
 * 3. Sticker flies along a curved arc into its numbered grid slot.
 * 4. Lands with confetti and slams down the "初遇纪念章" seal.
 */
export function playPeelAndStickCeremony({
  artHtml,
  numberLabel = 'NO.01',
  name = '新伙伴',
  series = '星光伙伴',
  color = '#b896c8',
  words = [],
  getTargetElement,
  onLanded
}) {
  ensureDieCutFilter();

  return new Promise(resolve => {
    let stage = 'waiting'; // 'waiting' | 'peeling' | 'flying' | 'done'
    let peelProgress = 0.16;
    let dragState = null;

    const overlay = document.createElement('div');
    overlay.className = 'peel-ceremony-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', `揭下${name}贴纸，贴入贴纸册`);
    overlay.style.setProperty('--peel-accent', color);
    overlay.style.setProperty('--peel', String(peelProgress));

    const wordsHtml = words.length
      ? `<div class="peel-sheet-words" aria-label="本组掌握的单词">${words.map(w => `<span lang="en">✦ ${esc(w)}</span>`).join('')}</div>`
      : '';

    overlay.innerHTML = `
      <div class="peel-ceremony-backdrop"></div>
      <div class="peel-stage-card">
        <p class="peel-stage-prompt" id="peelPrompt">
          <span class="peel-hand-icon" aria-hidden="true">👆</span>
          <span>手指滑过卷角，或轻点揭下新伙伴贴纸</span>
        </p>
        <div class="peel-backing-sheet" tabindex="0" role="button" aria-describedby="peelPrompt" aria-label="揭下 ${esc(name)} 贴纸">
          <div class="peel-sheet-top">
            <span class="peel-hang-hole" aria-hidden="true"></span>
            <span class="peel-sheet-code">${esc(series)} · ${esc(numberLabel)}</span>
          </div>
          <div class="peel-liner-bed">
            <div class="peel-liner-ghost" aria-hidden="true">${artHtml}</div>
            <div class="peel-sticker-peelable">
              <div class="peel-diecut-art">${artHtml}</div>
              <div class="peel-gloss-sheen" aria-hidden="true"></div>
            </div>
            <div class="peel-corner-curl" aria-hidden="true">
              <span class="peel-curl-highlight"></span>
            </div>
          </div>
          <div class="peel-sheet-bottom">
            <strong>${esc(name)}</strong>
            ${wordsHtml}
          </div>
        </div>
        <button type="button" class="peel-quick-btn">✨ 揭下贴纸，贴进 ${esc(numberLabel)} 号格</button>
      </div>
    `;

    document.body.append(overlay);
    const sheet = overlay.querySelector('.peel-backing-sheet');
    const quickBtn = overlay.querySelector('.peel-quick-btn');
    const peelable = overlay.querySelector('.peel-sticker-peelable');
    const diecutArt = overlay.querySelector('.peel-diecut-art');
    const promptText = overlay.querySelector('#peelPrompt span:last-child');

    requestAnimationFrame(() => {
      overlay.classList.add('is-ready');
      sheet.focus({ preventScroll: true });
    });

    function setPeel(value) {
      peelProgress = Math.max(0.16, Math.min(1, value));
      overlay.style.setProperty('--peel', peelProgress.toFixed(3));
    }

    function cleanup(targetCard) {
      if (stage === 'done') return;
      stage = 'done';
      document.removeEventListener('keydown', onKeyDown);
      if (targetCard) targetCard.classList.remove('is-slot-target');
      overlay.remove();
      resolve();
    }

    async function completePeelAndFly() {
      if (stage !== 'waiting') return;
      stage = 'peeling';
      sfx.peelPop();
      promptText.textContent = `揭下来啦！正在飞往 ${numberLabel} 号格…`;
      quickBtn.disabled = true;
      overlay.classList.add('is-peeling-off');
      setPeel(1);

      // Prepare and scroll target card into clear view behind overlay
      const targetCard = typeof getTargetElement === 'function' ? getTargetElement() : null;
      if (targetCard) {
        targetCard.scrollIntoView({ block: 'center', behavior: 'instant' });
        targetCard.classList.add('is-slot-target');
      }

      if (reducedMotion.matches) {
        await new Promise(r => setTimeout(r, 260));
        if (typeof onLanded === 'function') onLanded(targetCard);
        sfx.stampThud();
        cleanup(targetCard);
        return;
      }

      await new Promise(r => setTimeout(r, 340));
      stage = 'flying';

      const startRect = diecutArt.getBoundingClientRect();
      const targetArt = targetCard?.querySelector('.card-art, .pokemon-art') || targetCard;
      const endRect = targetArt ? targetArt.getBoundingClientRect() : null;

      // Create floating flyer clone at exact viewport coordinates
      const flyer = document.createElement('div');
      flyer.className = 'peel-flying-sticker';
      flyer.style.left = `${startRect.left}px`;
      flyer.style.top = `${startRect.top}px`;
      flyer.style.width = `${startRect.width}px`;
      flyer.style.height = `${startRect.height}px`;
      flyer.innerHTML = `<div class="peel-diecut-art">${artHtml}</div>`;
      document.body.append(flyer);

      // Fade out backing sheet & dark backdrop so child watches sticker fly into the grid
      peelable.style.opacity = '0';
      overlay.classList.add('is-flying-to-slot');
      sfx.flyWhoosh();

      if (endRect && endRect.width > 0) {
        const dx = (endRect.left + endRect.width / 2) - (startRect.left + startRect.width / 2);
        const dy = (endRect.top + endRect.height / 2) - (startRect.top + startRect.height / 2);
        const scale = Math.max(0.28, Math.min(1.5, endRect.width / Math.max(1, startRect.width)));
        const arcLift = Math.min(-46, -Math.abs(dy) * 0.18 - 34);

        const anim = flyer.animate([
          { transform: 'translate(0px, 0px) scale(1.08) rotate(-6deg)', offset: 0 },
          { transform: `translate(${dx * 0.46}px, ${dy * 0.46 + arcLift}px) scale(${(1.08 + scale) * 0.54}) rotate(5deg)`, offset: 0.52 },
          { transform: `translate(${dx}px, ${dy}px) scale(${scale * 1.05}) rotate(-2deg)`, offset: 0.88 },
          { transform: `translate(${dx}px, ${dy}px) scale(${scale}) rotate(0deg)`, offset: 1 }
        ], {
          duration: 680,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'forwards'
        });
        await anim.finished.catch(() => {});
      } else {
        await new Promise(r => setTimeout(r, 420));
      }

      flyer.remove();
      if (typeof onLanded === 'function') onLanded(targetCard);

      // Stamp "初遇纪念章" with tactile slam + confetti
      sfx.stampThud();
      if (targetCard) {
        targetCard.classList.remove('is-slot-target');
        targetCard.classList.remove('is-just-stamped');
        void targetCard.offsetWidth;
        targetCard.classList.add('is-just-stamped');
        burstSlotConfetti(targetCard, color);
        setTimeout(() => targetCard.classList.remove('is-just-stamped'), 1800);
      }

      await new Promise(r => setTimeout(r, 420));
      cleanup(targetCard);
    }

    sheet.addEventListener('pointerdown', e => {
      if (stage !== 'waiting') return;
      if (e.button && e.button !== 0) return;
      dragState = { id: e.pointerId, startX: e.clientX, startY: e.clientY, moved: false };
      sheet.setPointerCapture(e.pointerId);
      overlay.classList.add('is-touching');
    });

    sheet.addEventListener('pointermove', e => {
      if (!dragState || dragState.id !== e.pointerId || stage !== 'waiting') return;
      const dist = Math.hypot(e.clientX - dragState.startX, e.clientY - dragState.startY);
      if (dist > 6) dragState.moved = true;
      const next = 0.16 + Math.min(0.84, dist / 135);
      setPeel(next);
      if (dist > 10) sfx.peelTick(next);
      if (next >= 0.78) {
        dragState = null;
        overlay.classList.remove('is-touching');
        completePeelAndFly();
      }
    });

    function finishGesture(e) {
      if (!dragState || dragState.id !== e.pointerId || stage !== 'waiting') return;
      const dist = Math.hypot(e.clientX - dragState.startX, e.clientY - dragState.startY);
      const wasTap = !dragState.moved || dist < 16;
      dragState = null;
      overlay.classList.remove('is-touching');
      // Either a gentle tap OR dragging past 24% triggers the peel!
      if (wasTap || peelProgress >= 0.34) {
        completePeelAndFly();
      } else {
        setPeel(0.16);
      }
    }

    sheet.addEventListener('pointerup', finishGesture);
    sheet.addEventListener('pointercancel', () => {
      dragState = null;
      overlay.classList.remove('is-touching');
      if (stage === 'waiting') setPeel(0.16);
    });

    quickBtn.addEventListener('click', () => completePeelAndFly());

    function onKeyDown(e) {
      if (stage !== 'waiting') return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        completePeelAndFly();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        completePeelAndFly();
      }
    }
    document.addEventListener('keydown', onKeyDown);
  });
}
