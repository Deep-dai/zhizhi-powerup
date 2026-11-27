const audio = typeof Audio !== 'undefined' ? new Audio() : {};
const manifestUrl = new URL('./audio-manifest.json', import.meta.url);
let catalogue;
let sequence = 0;
let settle;
let rate = 1;

export function normalize(text) {
  return String(text)
    .trim()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[.!?]+$/, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function recordings() {
  if (!catalogue) {
    catalogue = fetch(manifestUrl)
      .then(async response => {
        if (!response.ok) throw Error('录音列表读取失败');
        return new Map((await response.json()).map(clip => [normalize(clip.text), clip.file]));
      })
      .catch(error => {
        catalogue = undefined;
        throw error;
      });
  }
  return catalogue;
}

export function setRate(value) {
  rate = value === 0.85 ? 0.85 : 1;
  audio.playbackRate = rate;
}

export function stop() {
  sequence += 1;
  audio.onended = audio.onerror = null;
  audio.pause();
  if (settle) settle(false);
  settle = undefined;
}

export async function speak(text) {
  stop();
  const current = sequence;
  try {
    const file = (await recordings()).get(normalize(text));
    if (current !== sequence) return false;
    if (!file) throw Error('录音暂时无法读取: ' + text);
    audio.src = new URL('./audio/' + file, import.meta.url).href;
    audio.playbackRate = rate;
    return await new Promise(resolve => {
      settle = resolve;
      audio.onended = () => { settle = undefined; resolve(true); };
      audio.onerror = () => { settle = undefined; resolve(false); };
      audio.play().catch(() => resolve(false));
    });
  } catch {
    return false;
  }
}

if (typeof window !== 'undefined') window.addEventListener('pagehide', stop);
