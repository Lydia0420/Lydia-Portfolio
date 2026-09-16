/* Game's global variables and setup 
project contains 2 parallel game systems with shared behaviors but also different assets and rules, 
variables are grouped by purpose */
let gameState = "start"; 
let selectedMode = null;

let titleElem, startBtn, classicBtn, timerBtn;
let canvas;
let canvasDiv;

let restartBtn, menuBtn;   
let endBtnContainer;  
let currentEnding = null; 

let winkState = false;

let allBlocks = [];
let colorMap = [];
let gridData = [];
const W = 37;
const H = 37;
let blockSize = 12;

let bgMusic;
let meow;
let mic;        
let egg;
let eggSizzle = false
const GAME_SIZE = 700;

let countdown;
let gameOverSound;
let recordSound;
let countdownPlayed = false;
let starParticles = [];
let newRecord = false;
let recordPlayed = false;
let tNewRecord = 0;

let classicAssets = {};
let timerAssets = {};
let selectedAssets = null;   

let bestClassicScore = 0;
let bestTimerScore = 0;

let musicIconImg;

//classic mode 
let pot, ingredients = [];
let hearts = 10, score = 0, missed = 0;
let isWinking = false, winkTimer = 0;
let isCrying = false, cryTimer = 0;
let scoreFlashTimer = 0;
let scoreFlashDur = 300; // animation
let gameOver = false;


let foodNames = [
  "1.png","2.png","3.png","4.png","5.png","6.png","7.png","8.png","9.png","10.png","11.png","12.png","13.png","14.png","15.png","16.png","17.png","18.png","19.png","20.png","21.png","22.png","23.png","24.png","25.png","26.png","27.png","28.png","29.png","30.png","31.png","32.png"
];
let targetH = 60;    
let wordList = ["Sweet!", "Yummy!", "Tasty!", "Delicious!", "Nice!"];
let badWordList = ["Nooo!", "Hey!", "Stop!", "My food!", "Aaaah!"];

//timer mode
let timeLeft = 30;      
let lastSecond = 0;    
let foodNames2 = [
  "a.png","b.png","c.png","d.png","e.png","f.png","g.png","h.png",
  "i.png","j.png","k.png","l.png","m.png","n.png","o.png",
  "p.png","q.png","r.png","s.png","t.png","u.png","v.png", "w.png","x.png","y.png","z.png","a1.png","b1.png","c1.png","d1.png","e1.png","f1.png","g1.png","h1.png"
];


function preload() {
  soundFormats('mp3', 'wav');
  // bgMusic = loadSound('bg.mp3'); 
  meow = loadSound('audio/meow.mp3'); 
  egg = loadSound("audio/egg.mp3");    

  
  
}

// Classic mode
function preloadClassicModeAssets() {
    let c = {};  // new object
    c.foodImgs = [];

  c.potImg = queuedImage("image/kitty.png");
  c.potWinkImg = queuedImage("image/kitty_wink.png");
  c.potCryImg = queuedImage("image/kitty_cry.png");

  c.scoreImg = queuedImage("image/wan.png");
  c.mouseImg = queuedImage("image/鼠.png");
  c.heartImg = queuedImage("image/heart.png");
  
  //all food images
  for (let i = 0; i < foodNames.length; i++) {
    c.foodImgs.push(queuedImage("image/" + foodNames[i]));
  }

  //ending images
    c.endingImages = {
    low:     queuedImage("image/ending1.png"),
    mid:     queuedImage("image/ending2.png"),
    good:    queuedImage("image/ending3.png"),
    high:    queuedImage("image/ending4.png"),
    perfect: queuedImage("image/ending5.png")
  };
  
    c.endings = [
      { key: "low", min: 0, max: 20,  title: "You just got barely a Snack...",  text: "Kitty only managed to whip up a tiny bit of food… \nmaybe it’s an ordering takeout kind of night." },
      { key: "mid", min: 21, max: 45, title: "You got simple but supper",      text: "Just a humble bowl of noodles, \nbut at least you're not going to bed hungry." },
      { key: "good", min: 46, max: 69, title: "You got some comfort Meal",     text: "A warm omurice. \nSometimes this kinds of dishes bring the most comfort." },
      { key: "high", min: 70, max: 89, title: "You got a special platter", text: "A beautiful sushi spread! \nKitty’s knife skills are really leveling up!"},
      { key: "perfect", min: 90, max: 999, title: "You got feast for Friends", text: "A full hotpot feast! \nTime to invite everyone over for dinner!"}
    ];

  //music
  c.winkSound = queuedSound("audio/pop.mp3");//get food
  c.stealSound = queuedSound("audio/mouse.mp3");//be stolen
  
  classicAssets = c; 
}

function resetClassicGame() {
  resetPot();        
  ingredients = [];
  floatingTexts = [];
  score = 0;
  hearts = 10;
  gameOver = false;
  isWinking = false;
  isCrying = false;
  winkTimer = 0;
  cryTimer = 0;
  scoreFlashTimer = 0;
  selectedAssets.endings
starParticles = [];
newRecord = false;
recordPlayed = false;
}

function resetPot() {
  let desiredH = 140;  // the score image height 

  let aspect = selectedAssets.potImg.width / selectedAssets.potImg.height;
  let desiredW = desiredH * aspect; // image width

  pot = {
    x: GAME_SIZE / 2 - desiredW / 2,
    y: GAME_SIZE - desiredH - 40,
    w: desiredW,
    h: desiredH
  };
}


//Timer mode
function preloadTimerModeAssets() {
    let t = {}; // new object
    t.foodImgs = [];
  
  t.potImg = queuedImage("image/breadkitty2.png");
  t.potWinkImg = queuedImage("image/breadkitty_wink.png");
  t.potCryImg = queuedImage("image/breadkitty_cry.png");

  t.scoreImg = queuedImage("image/bread.png");
  t.mouseImg = queuedImage("image/鼠.png");
  t.heartImg = null;
  
  //food images
  for (let i = 0; i < foodNames2.length; i++) {
    t.foodImgs.push(queuedImage("image/" + foodNames2[i]));
  }

  //ending images
    t.endingImages = {
    low:     queuedImage("image/endingA.png"),
    mid:     queuedImage("image/endingB.png"),
    good:    queuedImage("image/endingC.png"),
    high:    queuedImage("image/endingD.png"),
    perfect: queuedImage("image/endingE.png")
  };
  
  t.endings = [
    { key: "low", min: 0, max: 5,
      title: "You got a cup of coffee...",
      text: "The bread is still half asleep… \nmaybe give it another try?" },

    { key: "mid", min: 6, max: 12,
      title: "You got some small Treat",
      text: "At least there’s a tiny cookie \nto cheer Kitty up~" },

    { key: "good", min: 13, max: 19,
      title: "You successfully got the cake!",
      text: "Kitty’s oven is finally behaving!!! \nTime for a sweet little tea break." },

    { key: "high", min: 20, max: 25,
      title: "You could open a small bakery～",
      text: "The whole kitchen smells amazing. \nKitty is basically a pastry pro now!" },

    { key: "perfect", min: 26, max: 99,
      title: "You got a masterpiece dessert feast!",
      text: "Kitty’s sweets could win a Paris pastry contest!!!!! \nTruly a perfect finish!" }
  ];

  
  //music
  t.winkSound = queuedSound("audio/pop.mp3");//get food
  t.stealSound = queuedSound("audio/mouse.mp3");//be stolen

  timerAssets = t; 
}

function resetTimerGame() {
  resetPot();        
  ingredients = [];
  floatingTexts = [];
  score = 0;
  hearts = 10;
  gameOver = false;
  isWinking = false;
  isCrying = false;
  countdownPlayed = false;
  winkTimer = 0;
  cryTimer = 0;
  scoreFlashTimer = 0;
  timeLeft = 30;       
  lastSecond = millis(); 
starParticles = [];
newRecord = false;
recordPlayed = false;
}

//get player data
function loadHighScores() {
  // Classic
  let c = localStorage.getItem("pixelChef_bestClassic");
  if (c !== null) {
    bestClassicScore = int(c);
  }

  // Timer
  let t = localStorage.getItem("pixelChef_bestTimer");
  if (t !== null) {
    bestTimerScore = int(t);
  }
}

function pickEndingByScore(score) {
  let usedEndings = selectedAssets.endings;       // ending text
  let usedImages  = selectedAssets.endingImages;  // ending image

  for (let e of usedEndings) {
    if (score >= e.min && score <= e.max) {
      return {
        key: e.key,
        title: e.title,
        text: e.text,
        img: usedImages[e.key]  
      };
    }
  }

  // 兜底：用最后一项
  let last = usedEndings[usedEndings.length - 1];
  return {
    key: last.key,
    title: last.title,
    text: last.text,
    img: usedImages[last.key]
  };
}

function updateHighScore() {
  if (selectedMode === "classic") {
    if (score > bestClassicScore) {
      bestClassicScore = score;
      localStorage.setItem("pixelChef_bestClassic", bestClassicScore);
      newRecord = true;  // mark broke the record
      recordPlayed = false; 
    }
  } else if (selectedMode === "timer") {
    if (score > bestTimerScore) {
      bestTimerScore = score;
      localStorage.setItem("pixelChef_bestTimer", bestTimerScore);
      newRecord = true;  // mark broke the record
      recordPlayed = false; 
    }
  }
}

function setup() {
  // noCanvas(); 
  setupStartPage();   // home Page

  gameState = "start";  
}
  
//egg sound
function mousePressed(e) {
  if (!canvasDiv || !canvasDiv.elt) return;
  if (!e || !canvasDiv.elt.contains(e.target)) return;
  // function mousePressed() {
  //     if (!canvasDiv || !canvasDiv.elt) return;
  //      if (!canvasDiv.elt.contains(event.target)) return; 

  let mouseXCanvas = mouseX;
  let mouseYCanvas = mouseY;

  let panLeft = 5 * blockSize;
  let panRight = 12 * blockSize;
  let panTop = 22 * blockSize;
  let panBottom = 27 * blockSize;

  if (
    mouseXCanvas >= panLeft &&
    mouseXCanvas <= panRight &&
    mouseYCanvas >= panTop &&
    mouseYCanvas <= panBottom
  ) {
    if (egg.isLoaded()) {
      if (!eggSizzle) {
        egg.loop();         // start
        eggSizzle = true;
      } else {
        egg.stop();         // stop
        eggSizzle = false;
      }
    changeFace();
    }
  }
}

//Timer mode
function runTimerGame() {
  let offsetX = (width - GAME_SIZE) / 2;
  let offsetY = (height - GAME_SIZE) / 2;

  push();
  translate(offsetX, offsetY);
  
  if (gameOver) {
    drawGameOver();
    pop()
    return;
  }
  
  // Timer logic
  if (millis() - lastSecond > 1000) {
    timeLeft--;
    lastSecond = millis();

    // play timer left 5 sound
    if (timeLeft <= 5 && !countdownPlayed) {
        if (countdown && countdown.isLoaded()) {
            countdown.play();
        }
        countdownPlayed = true;
    }
    
    if (timeLeft <= 0) {
      timeLeft = 0;
      currentEnding = pickEndingByScore(score);
      gameOver = true;
      updateHighScore();  

      if (newRecord) {
          if (recordSound && !recordSound.isPlaying()) recordSound.play();
      } else {
          if (gameOverSound && !gameOverSound.isPlaying()) gameOverSound.play();
      }
    }
  }
  
noStroke();
fill(255, 243, 214); // timer mode background
rect(0, 0, GAME_SIZE, GAME_SIZE);

  drawPot();
  handleIngredients2();
  drawFloatingTexts();
  drawScore2();
  pop();
}

function handleIngredients2() {
  let isMouse = random() < 0.15;

  if (frameCount % 50 === 0) {
    ingredients.push({
      x: random(20, width - 20),
      y: -20,
      img: isMouse ? selectedAssets.mouseImg : random(selectedAssets.foodImgs),
      type: isMouse ? "mouse" : "food",
      h: isMouse ? targetH * 1.2 : targetH,
      speed: isMouse ? random(7, 10) : random(6, 9)
    });
  }

  for (let i = ingredients.length - 1; i >= 0; i--) {
    let ing = ingredients[i];

    ing.y += ing.speed;

    let aspect = ing.img.width / ing.img.height;
    let w = ing.h * aspect;

    imageMode(CENTER);
    image(ing.img, ing.x, ing.y, w, ing.h);

    // successful get food
    if (ing.y + ing.h / 2 >= pot.y &&
        ing.x > pot.x &&
        ing.x < pot.x + pot.w) {

      // get mouse
      if (ing.type === "mouse") {
        score = max(0, score - 1);
        scoreFlashTimer = millis();

        if (selectedAssets.stealSound && selectedAssets.stealSound.isLoaded()) {
          selectedAssets.stealSound.play();
        }

        floatingTexts.push({
          x: ing.x, y: ing.y - 20,
          text: random(badWordList),
          alpha: 255, vy: -1.2, isBad: true
        });

        isCrying = true;
        cryTimer = millis();

      } else {
        score++;
        isWinking = true;
        winkTimer = millis();

        if (selectedAssets.winkSound && selectedAssets.winkSound.isLoaded()) {
          selectedAssets.winkSound.play();
      }


        floatingTexts.push({
          x: ing.x, y: ing.y - 20,
          text: random(wordList),
          alpha: 255, vy: -1.5, isBad: false
        });
      }

      ingredients.splice(i, 1);
      continue;
    }

    // fall to the ground,don't loss of life（timer mode）
    if (ing.y > height + 50) {
      ingredients.splice(i, 1);
    }
  }
}

function drawScore2() {
  let timeColor = [255, 120, 180];   // normal background
  let scaleVal = 1;                 

  if (timeLeft <= 5) {               
    timeColor = [255, 80, 80];       // text color
    scaleVal = map(timeLeft, 5, 0, 1.2, 1.8);  // be bigger
  }

  if (timeLeft <= 2) {
    timeColor = [255, 50, 50];      
    scaleVal = map(timeLeft, 2, 0, 1.6, 2.2);  
  }

  push();
  translate(width - 80, 50);
  scale(scaleVal);

  fill(timeColor[0], timeColor[1], timeColor[2]);
  noStroke();
  
  // Timer Clock
  textAlign(CENTER, CENTER);
  textSize(42);
  // fill(255, 120, 180);
  text("⏱ " + timeLeft, 0, 0);

  pop();
  
  // score
  let heartSize = 0
  let scoreIconSize = 40;
  let scoreBaseY = 20 + heartSize + 15;
  imageMode(CORNER);
  image(selectedAssets.scoreImg, 20, scoreBaseY, scoreIconSize, scoreIconSize);

  // score animation
  let t = (millis() - scoreFlashTimer) / 300;
  t = constrain(t, 0, 1);

  let s = lerp(1.8, 1.0, t);
  let r = lerp(255, 50, t);
  let g = lerp(80, 50, t);
  let b = lerp(80, 50, t);
  fill(r, g, b);

  push();
  translate(20 + scoreIconSize + 10, scoreBaseY + scoreIconSize/2);
  scale(s);
  textAlign(LEFT, CENTER);
  textSize(28);
  text(score, 0, 0);
  pop();
  
  // show the highest score on Timer mode
  fill(120);
  textAlign(LEFT, TOP);
  textSize(16);
  let bestY = 80 + scoreIconSize + 10;
  text("🏆 Best: " + bestTimerScore, 20, scoreBaseY + scoreIconSize + 10);
}

//classic mode
function runClassicGame() {
  let offsetX = (width - GAME_SIZE) / 2;
  let offsetY = (height - GAME_SIZE) / 2;

  push();
  translate(offsetX, offsetY); // ⭐ 所有游戏元素都往中间移动
  
  if (gameOver) {
    drawGameOver();
    pop()
    return;
  }

noStroke();
fill(255, 240, 250);
rect(0, 0, GAME_SIZE, GAME_SIZE);

  drawPot();
  handleIngredients();
  drawFloatingTexts();
  drawScore();
  pop();
}


function drawPot() {
  if (millis() - winkTimer > 150) {
    isWinking = false;
  }

  if (millis() - cryTimer > 400) {
    isCrying = false;
  }
  

  //decide which image to use
  let imgToUse = selectedAssets.potImg;


  if (isCrying) {
    imgToUse = selectedAssets.potCryImg;      // Cry first
  } else if (isWinking) {
    imgToUse = selectedAssets.potWinkImg;    // then wink
  }

  // key control
  if (keyIsDown(LEFT_ARROW)) pot.x -= 10;
  if (keyIsDown(RIGHT_ARROW)) pot.x += 10;

  pot.x = constrain(pot.x, 0, GAME_SIZE - pot.w);

  imageMode(CORNER);
  image(imgToUse, pot.x, pot.y, pot.w, pot.h);
}

// create + move + pick the ingredients
function handleIngredients() {
    let isMouse = random() < 0.15;  // 10% chance that the mouse will drop
  
  // a new ingredient is generated every 50 frames
  if (frameCount % 50 === 0) {
    ingredients.push({
      x: random(20, GAME_SIZE - 20),
      y: -20,
      img: isMouse ? selectedAssets.mouseImg : random(selectedAssets.foodImgs),
      type: isMouse ? "mouse" : "food",   
      h: isMouse ? targetH * 1.2 : targetH, 
      speed: isMouse ? random(7, 10) : random(6, 9) // mouse fall faster than ingredients
    });
  }

  for (let i = ingredients.length - 1; i >= 0; i--) {
    let ing = ingredients[i];

    ing.y += ing.speed;

    // img as food
        // width
    let aspect = ing.img.width / ing.img.height;
    let w = ing.h * aspect;
    
    imageMode(CENTER);
    image(ing.img, ing.x, ing.y, w, ing.h);

    // 检测是否接住
    //if it's food —— score +1, Blink
    //if it's  mouse —— score -1, Wink
    if (
      ing.y + ing.h / 2 >= pot.y &&
      ing.x > pot.x &&
      ing.x < pot.x + pot.w
    ) {
      if (ing.type === "mouse") {
        score = max(0, score - 1);  
          scoreFlashTimer = millis(); 
        
      // play the sound effect of being stolen
      if (selectedAssets.stealSound && selectedAssets.stealSound.isLoaded()) {
        selectedAssets.stealSound.play();
      }

  // negative floating text when stolen.
  floatingTexts.push({
    x: ing.x,
    y: ing.y - 20,
    text: random(badWordList),
    alpha: 255,
    vy: -1.2,       // more slow
    isBad: true    
  });
        // switch to crying state
        isCrying = true;
        cryTimer = millis();
        
      } else {
        // triggers blinking
        score++;
        isWinking = true;
        winkTimer = millis();
        
        // play the blinking sound effect
        if (selectedAssets.winkSound && selectedAssets.winkSound.isLoaded()) {
          selectedAssets.winkSound.play();
      }
        
        // positive floating text when get food.
        floatingTexts.push({
          x: ing.x,                         
          y: ing.y - 20,
          text: random(wordList),           
          alpha: 255,                       
          vy: -1.5                          
        });
      }

      ingredients.splice(i, 1);
      continue;
    }

//determine whether it has fallen to the ground
    if (ing.y > GAME_SIZE + 50) {
      if (ing.type === "food") {
        hearts--;

      if (hearts <= 0) {
        currentEnding = pickEndingByScore(score);
        gameOver = true;
        updateHighScore();  
        
      if (newRecord) {
          if (recordSound && !recordSound.isPlaying()) recordSound.play();
      } else {
          if (gameOverSound && !gameOverSound.isPlaying()) gameOverSound.play();
      }
    }
  }
            ingredients.splice(i, 1);
    }
  }
}



// The floating text effect
function drawFloatingTexts() {
  textAlign(CENTER, CENTER);
  textSize(24);

  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    let ft = floatingTexts[i];

    // position
    ft.y += ft.vy * 1.8;
    ft.alpha -= 6;  

    if (ft.isBad) {
// mouse
      fill(120, 160, 255, ft.alpha);
      stroke(50, 80, 160, ft.alpha);
    } else {
// food
      fill(255, 130, 180, ft.alpha);
      stroke(255, 80, 150, ft.alpha);
    }
  
    strokeWeight(1);
    text(ft.text, ft.x, ft.y);

    if (ft.alpha <= 0) {
      floatingTexts.splice(i, 1);
    }
  }
  noStroke();
}


// Score
function drawScore() {
  if (!selectedAssets) return; 
  imageMode(CORNER);
  
  let heartSize = 0; 
    if (selectedAssets.heartImg) { 
          heartSize = 30; 
      for (let i = 0; i < hearts; i++) {
        image(selectedAssets.heartImg, 20 + i * (heartSize + 5), 20, heartSize, heartSize);
      }
    }
    // Score img
  let scoreIconSize = 40;  
  image(selectedAssets.scoreImg, 20, 20 + heartSize + 15, scoreIconSize, scoreIconSize);

// score animation
  let t = (millis() - scoreFlashTimer) / 300;  // 300ms 
  t = constrain(t, 0, 1);

  // size
  let scaleVal = lerp(1.8, 1.0, t);

  // color
  let r = lerp(255, 50, t);
  let g = lerp(80, 50, t);
  let b = lerp(80, 50, t);
  fill(r, g, b);

  push();
  translate(20 + scoreIconSize + 10, 20 + heartSize + 15 + scoreIconSize / 2);
  scale(scaleVal);

  textAlign(LEFT, CENTER);
  textSize(28);
  text(score, 0, 0); 
  pop();
  
  // show the highest score（Classic）
  fill(120);
  textAlign(LEFT, TOP);
  textSize(16);
  text("🏆 Best: " + bestClassicScore, 20, 20 + heartSize + 15 + scoreIconSize + 10);
}


// record breaking effect
function triggerStarBurst(cx, cy) {
  for (let i = 0; i < 35; i++) {
        let col = color(255, 219, 18);
    starParticles.push({
      x: cx,
      y: cy,
      vx: random(-5, 5),
      vy: random(-8, -3),
      alpha: 255,
      size: random(6, 14),
      rot: random(TWO_PI),
      rotSpeed: random(-0.1, 0.1),
      col: col
    });
  }
}

//draw start when record breaking
function starShape(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;

  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius1;
    let sy = y + sin(a) * radius1;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius2;
    sy = y + sin(a + halfAngle) * radius2;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// Game over page
function drawGameOver() {
  if (bgMusic && bgMusic.isPlaying()) {
      bgMusic.stop();
  }
  
  background(99, 67, 99);


  let title = "Game Over";
  let textLine = "Press R to try again.";
  let img = null;

  if (currentEnding) {
    title = currentEnding.title;
    textLine = currentEnding.text;
    img = currentEnding.img;
  }

  // title
  if (newRecord) {
    drawNewRecordText();
}
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(42);
  text(title, GAME_SIZE / 2, GAME_SIZE * 0.2);

  // img for ending
  if (img) {
    let dishH = GAME_SIZE * 0.3;    
    let aspect = img.width / img.height;
    let dishW = dishH * aspect;

    imageMode(CENTER);
    image(img, GAME_SIZE / 2, GAME_SIZE * 0.48, dishW, dishH);
  }

  // description
  textSize(22);
  textFont("Comic Sans MS");
  let wrapped = textLine.split("\n");  // 分行
  for (let i = 0; i < wrapped.length; i++) {
    text(wrapped[i], GAME_SIZE / 2, GAME_SIZE * (0.72 + i * 0.05));
  }

  textSize(20);
  text("Final Score: " + score, GAME_SIZE / 2, GAME_SIZE * 0.82);

  
  // determine whether to play the record breaking explosion animation
  if (newRecord && !recordPlayed) {
      let cx = GAME_SIZE / 2;
      let cy = GAME_SIZE * 0.48;

      triggerStarBurst(cx, cy);
      recordPlayed = true; 
  }

  // animation
  for (let i = starParticles.length - 1; i >= 0; i--) {
    let p = starParticles[i];
    
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.12; // gravity
    p.alpha -= 4;
    p.rot += p.rotSpeed;

    push();
    translate(p.x, p.y);
    rotate(p.rot);
    noStroke();
    fill(255, 219, 18, p.alpha);
    starShape(0, 0, p.size, p.size * 0.4, 5);
    pop();

    if (p.alpha <= 0) {
      starParticles.splice(i, 1);
    }
  }
  
    if (endBtnContainer) endBtnContainer.show(); 
}

//yellow text
function drawNewRecordText() {
  let scaleVal = 1 + sin(tNewRecord) * 0.05;
  tNewRecord += 0.04;

  push();
  translate(GAME_SIZE / 2, 60); 
  scale(scaleVal);

  stroke(255, 219, 18);
  strokeWeight(4);
  fill(255, 219, 18);   

  textAlign(CENTER, CENTER);
  textSize(56);
  text("NEW RECORD!!!", 0, 0);
  pop();
}

// Main Draw
function draw() {
  document.body.classList.toggle('is-playing', gameState === 'playClassic' || gameState === 'playTimer');
  document.body.style.background = gameState === 'playTimer'
    ? 'rgb(255, 243, 214)'
    : 'rgb(255, 240, 250)';
   if (selectedMode === "timer" && gameState === "playTimer") {
      background(255, 243, 214);  
  } else {
      background(255, 240, 250);  
  }
  
  if (gameState === "start") {
    drawStartPage();
  }

  else if (gameState === "modeSelect") {
    if (!isLoadingMode && bgMusic && bgMusic.isLoaded() && !bgMusic.isPlaying()) {
        bgMusic.setVolume(volumeSlider ? volumeSlider.value() : 0.6);
        bgMusic.loop();
    }
    
    fill(180, 60, 120);
    textSize(26);
    textAlign(CENTER, CENTER);
    text("Choose Your Mode", width/2, 60);
  }

  else if (gameState === "playClassic") {
      runClassicGame();
  }

  else if (gameState === "playTimer") {
      runTimerGame();  
  }
}
