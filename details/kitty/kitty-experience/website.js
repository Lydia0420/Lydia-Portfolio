const micToggle = document.getElementById('mic-toggle');
function fitGameBelowNavigation() {
  const bottom = document.querySelector('.help').getBoundingClientRect().bottom;
  document.body.style.setProperty('--game-top', Math.ceil(bottom + 12) + 'px');
}
const gameLayoutObserver = new ResizeObserver(fitGameBelowNavigation);
gameLayoutObserver.observe(document.querySelector('nav'));
gameLayoutObserver.observe(document.querySelector('.help'));
window.addEventListener('resize', fitGameBelowNavigation);
fitGameBelowNavigation();
let voiceEnabled = false;
micToggle.addEventListener('click', async () => {
  if (!mic) return;
  if (voiceEnabled) {
    mic.stop();
    voiceEnabled = false;
    micToggle.textContent = 'Enable voice blush';
    return;
  }
  await userStartAudio();
  micToggle.disabled = true;
  mic.start(() => {
    voiceEnabled = true;
    micToggle.disabled = false;
    micToggle.textContent = 'Disable microphone';
  }, () => {
    micToggle.disabled = false;
    micToggle.textContent = 'Microphone unavailable · retry';
  });
});
function moveKitty(event) {
  if (event.pointerType === 'mouse' || event.target.tagName !== 'CANVAS' || !pot || gameOver || !gameState.startsWith('play')) return;
  const bounds = event.target.getBoundingClientRect();
  pot.x = constrain((event.clientX - bounds.left) * GAME_SIZE / bounds.width - pot.w / 2, 0, GAME_SIZE - pot.w);
}
document.addEventListener('pointerdown', moveKitty);
document.addEventListener('pointermove', moveKitty);
document.addEventListener('keydown', event => {
  if (gameState.startsWith('play') && ['ArrowLeft', 'ArrowRight'].includes(event.key) && !['INPUT', 'BUTTON'].includes(event.target.tagName)) event.preventDefault();
});
