// Cache decoded assets across modes and retries. Each batch tracks actual completions.
const kittyAssetCache = new Map();
let kittyBatch = [];
const readyModes = new Set();
let isLoadingMode = false;
function queuedAsset(kind, url) {
  const key = kind + ':' + url;
  if (!kittyAssetCache.has(key)) {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    const value = (kind === 'image' ? loadImage : loadSound)(url, resolve, () => {
      kittyAssetCache.delete(key);
      reject(new Error('Unable to load ' + url));
    });
    kittyAssetCache.set(key, { value, promise });
  }
  const item = kittyAssetCache.get(key);
  kittyBatch.push(item.promise);
  return item.value;
}
function queuedImage(url) { return queuedAsset('image', url); }
function queuedSound(url) { return queuedAsset('sound', url); }

async function enterKittyMode(mode) {
  if (isLoadingMode) return;
  isLoadingMode = true;
  const panel = document.getElementById('mode-loading');
  const status = document.getElementById('load-status');
  const progress = document.getElementById('load-progress');
  panel.hidden = false;
  panel.classList.remove('is-error');
  panel.style.setProperty('--loading-bg', mode === 'timer' ? '#fff3d6' : '#fff0fa');
  status.textContent = 'Getting ready…';
  progress.value = 0;
  [classicBtn, timerBtn, backToStartBtn].forEach(button => button.attribute('disabled', ''));
  try {
    await userStartAudio();
    kittyBatch = [];
    if (!readyModes.has(mode)) {
      bgMusic = queuedSound('audio/cookingbg.mp3');
      countdown = queuedSound('audio/countdown.mp3');
      gameOverSound = queuedSound('audio/gameOver.mp3');
      recordSound = queuedSound('audio/record.mp3');
      (mode === 'classic' ? preloadClassicModeAssets : preloadTimerModeAssets)();
      const total = kittyBatch.length;
      let complete = 0;
      const results = await Promise.allSettled(kittyBatch.map(promise => promise.then(() => {
        progress.value = ++complete / total;
      })));
      if (results.some(result => result.status === 'rejected')) throw new Error('Some ingredients could not be loaded.');
      readyModes.add(mode);
    }
    selectedMode = mode;
    selectedAssets = mode === 'classic' ? classicAssets : timerAssets;
    hideIntroText(); hideModeButtons();
    resizeCanvas(GAME_SIZE, GAME_SIZE);
    canvas.show();
    if (egg && egg.isPlaying()) egg.stop();
    eggSizzle = false;
    bgMusic.setVolume(volumeSlider ? volumeSlider.value() : 0.6);
    if (!bgMusic.isPlaying()) bgMusic.loop();
    (mode === 'classic' ? resetClassicGame : resetTimerGame)();
    gameState = mode === 'classic' ? 'playClassic' : 'playTimer';
    panel.hidden = true;
  } catch (error) {
    panel.classList.add('is-error');
    status.textContent = 'Couldn’t load the kitchen. Please select a mode to try again.';
  } finally {
    isLoadingMode = false;
    [classicBtn, timerBtn, backToStartBtn].forEach(button => button.removeAttribute('disabled'));
  }
}
