/* handles all DOM based user interface elements
ONLY the HTML/CSS UI logic, separate from canvas drawing and game logic.

contents:
setupUI() to creates the Home page UI
showModeSelectUI() for select the game mode
hideModeButtons() to hides buttons when switch into game
startGame() to handles start button then enter mode select page
setupEndUI() to return mode page or restart
*/
function setupUI() {
  // title
  titleElem = createElement("h1", "Pixel Chef Kitty");
  titleElem.parent(canvasDiv);
    titleElem.style(`
    color: #d856a6;
    font-family: 'Arial';
    font-size: 30px;
    text-align: center;
    margin-top: 20px;
    margin-bottom: 5px;
  `);
  
  // start Btn
  startBtn = createButton("Start Cooking!");
  startBtn.parent(canvasDiv);
  startBtn.style(`
    padding: 12px 26px;
    margin-top: 20px;
    font-size: 18px;
    color: white;
    background: #B84978;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: 0.25s;
    display: block;
    margin-left: auto;
    margin-right: auto;
  `);

  // hover
  startBtn.mouseOver(() => {
    startBtn.style("background", "#f06fbf");
  });
  startBtn.mouseOut(() => {
    startBtn.style("background", "#B84978");
  });

  startBtn.mousePressed(startGame);
}

//choose mode page
function showModeSelectUI() {
// --- Back to Start Page Button ---
backToStartBtn = createButton("Back to Start");
backToStartBtn.parent(canvasDiv);
backToStartBtn.style(`
  padding: 10px 20px;
  font-size: 16px;
  color: white;
  background: #FDB1D6;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(255, 150, 200, 0.3);
  transition: 0.2s;
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-top: 20px;
`);

backToStartBtn.mouseOver(() => backToStartBtn.style("transform","scale(1.05)"));
backToStartBtn.mouseOut(() => backToStartBtn.style("transform","scale(1)"));
backToStartBtn.mousePressed(handleBackToStartPage);
  
// intro text
introText = createP(`
  Hi, I'm Kitty! <br>
  Pick a cooking style for me～ <br>
  Classic Mode tests your reflexes,<br>
  Timer Mode is all about speed!<br>
  I’ll react to everything you do^^<br>
  Oh, and watch out…  <br>
  Sometimes a sneaky mouse might try to steal the food!
`);
introText.parent(canvasDiv);
introText.style(`
  color: #d05e8a;
  font-family: 'Comic Sans MS';
  font-size: 18px;
  text-align: center;
  margin-top: 40px;
  background: rgba(255, 250, 250, 0.9);
  padding: 12px 20px;
  border-radius: 14px;
  line-height: 2;
`);

  
  classicBtn = createButton("Classic Mode");
  classicBtn.parent(canvasDiv);
  classicBtn.style(`
    padding: 14px 28px;
    margin-top: 40px;
    font-size: 20px;
    color: white;
    background: linear-gradient(135deg, #ff9ecb, #f48fb1);
    border: none;
    border-radius: 16px;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(244, 143, 177, 0.4);
    transition: 0.2s;
  `);

  classicBtn.mouseOver(() => classicBtn.style("transform", "scale(1.05)"));
classicBtn.mouseOut(() => classicBtn.style("transform", "scale(1)"));
  
classicBtn.mousePressed(() => enterKittyMode('classic'));


  timerBtn = createButton("Timer Challenge");
  timerBtn.parent(canvasDiv);
  timerBtn.style(`
    padding: 14px 28px;
    margin-top: 30px;
    font-size: 20px;
    color: white;
    background: linear-gradient(135deg, #d6a7ff, #b48de7);
    border: none;
    border-radius: 16px;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(182, 139, 231, 0.4);
    transition: 0.2s;
  `);
  timerBtn.mouseOver(() => timerBtn.style("transform", "scale(1.05)"));
  timerBtn.mouseOut(() => timerBtn.style("transform", "scale(1)"));

  timerBtn.mousePressed(() => enterKittyMode('timer'));
  
// --- Volume Control Container ---
let volumeContainer = createDiv();
volumeContainer.parent(canvasDiv);
volumeContainer.style(`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 15px;
`);
  
// --- 载入音量设置 ---
let savedVol = localStorage.getItem("pixelChef_volume");
if (savedVol !== null && bgMusic) {
  bgMusic.setVolume(float(savedVol));
}
  
// --- 音量控制 UI ---
// musicIcon = createImg(iconURL, "music icon");
musicIcon = createImg("image/music.png", "music icon");
musicIcon.parent(volumeContainer);
musicIcon.style(`
  width: 40px;
  margin-top: 20px;
  margin-right: 10px;
  cursor: pointer;
  display: inline-block;
`);

volumeSlider = createSlider(0, 1, savedVol === null ? 0.6 : Number(savedVol), 0.01);
volumeSlider.attribute('aria-label', 'Music volume');
volumeSlider.parent(volumeContainer);
volumeSlider.style(`
  width: 180px;
  height: 20px;
  margin-left: 10px;
  margin-top: 40px;
  display: inline-block;
`);

// 玩家调整滑块 → 实时改变音量
volumeSlider.input(() => {
  let v = volumeSlider.value();
  if (bgMusic) bgMusic.setVolume(v);
  localStorage.setItem("pixelChef_volume", v);
});
}

function hideModeButtons() {
  if (classicBtn) classicBtn.hide();
  if (timerBtn) timerBtn.hide();
  if (backToStartBtn) backToStartBtn.hide();    
  if (volumeSlider) volumeSlider.hide();         
  if (musicIcon) musicIcon.hide(); 
}

function hideIntroText() {
  if (introText) introText.hide();
}

function startGame() {
  userStartAudio();
  // play sound
  if (meow && meow.isLoaded()) {
    meow.play();
  }

  // change face between wink and normal
  changeFace();

  if (titleElem) titleElem.hide();
  if (startBtn) startBtn.hide();
  if (canvas) canvas.hide();  

  // switch game states
  gameState = "modeSelect";
  showModeSelectUI();
}

// --- End screen buttons: create once, hide at start ---
function setupEndUI() {
  // ⭐ 按钮容器：放在 canvasDiv 里，并排 + 靠上
  endBtnContainer = createDiv();
  endBtnContainer.addClass('game-end-controls');
  endBtnContainer.parent(canvasDiv);
  endBtnContainer.style(`
    position: absolute;
    bottom: 20px;   
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    z-index: 10;
  `);

  // --- Play Again 按钮 ---
  restartBtn = createButton("Play Again");
  restartBtn.parent(endBtnContainer);
  restartBtn.style(`
    padding: 10px 20px;
    font-size: 16px;
    color: white;
    background: linear-gradient(135deg, #ffb6c1, #ff88aa);
    border: none;
    border-radius: 999px;
    cursor: pointer;  
    box-shadow: 0 4px 10px rgba(255, 150, 180, 0.4);
    transition: 0.2s;
    margin-left: 40px; 
  `);
  restartBtn.mouseOver(() => restartBtn.style("transform", "scale(1.05)"));
  restartBtn.mouseOut(()  => restartBtn.style("transform", "scale(1)"));
  restartBtn.mousePressed(handleRestart);

  // --- Back to Menu 按钮 ---
  menuBtn = createButton("Back to Menu");
  menuBtn.parent(endBtnContainer);
  menuBtn.style(`
    padding: 10px 20px;
    font-size: 16px;
    color: white;
    background: linear-gradient(135deg, #d6a7ff, #b48de7);
    border: none;
    border-radius: 999px;   
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(180, 139, 231, 0.4);
    transition: 0.2s;
    margin-left: 40px; 
  `);
  menuBtn.mouseOver(() => menuBtn.style("transform", "scale(1.05)"));
  menuBtn.mouseOut(()  => menuBtn.style("transform", "scale(1)"));
  menuBtn.mousePressed(handleBackToMenu);

  // ⭐ 一开始先隐藏整个容器
  endBtnContainer.hide();
}

/////////////////

function handleBackToStartPage() {
  document.getElementById('mode-loading').hidden = true;
  // 停止音乐
  if (bgMusic && bgMusic.isPlaying()) {
    bgMusic.stop();
  }

  // 隐藏 mode select 的 UI
  hideIntroText();
  hideModeButtons();

  // 隐藏游戏 canvas（如果存在）
  if (canvas && selectedMode !== null) resizeCanvas(W * blockSize, H * blockSize);

  // 恢复 Start Page 的 kitty 画布
  if (canvas) {
    canvas.show();  // ← 关键！恢复 kitty pixel 画布
  }

  // 显示 Start Page 的 UI
  if (titleElem) titleElem.show();
  if (startBtn) startBtn.show();

  selectedMode = null;
  gameState = "start";
}


function handleRestart() {
  if (bgMusic) {
      bgMusic.stop();  // 先停掉旧轨道（保险）
      bgMusic.loop();  // ⭐ 从头播放
  }
  
  if (endBtnContainer) endBtnContainer.hide();

  gameOver = false;
  currentEnding = null;
  countdownPlayed = false;
  newRecord = false;
  recordPlayed = false; 
  starParticles = [];

  if (selectedMode === "classic") {
    resetClassicGame();
    gameState = "playClassic";
  } else if (selectedMode === "timer") {
    resetTimerGame();
    gameState = "playTimer";
  }
}

function handleBackToMenu() {
  if (bgMusic && bgMusic.isPlaying()) {
      bgMusic.stop();
  }
  
  if (endBtnContainer) endBtnContainer.hide();

  gameOver = false;
  currentEnding = null;
  countdownPlayed = false;
  ingredients = [];
  floatingTexts = [];
  newRecord = false;
  recordPlayed = false; 
  starParticles = [];

  if (canvas) {
    canvas.hide();
  }
  
  gameState = "modeSelect";
  showModeSelectUI();
}
