let bubbles = []; 
let candies = [];
let spatters = []; 
let explosionBubbles = [];
let explosion = false; 
let dropped = 0; //Number of candies dropped into the bottle
let bgIntensity = 0; // background color 
let maxCandies = 5; 
let timer = 20; 
let startTime;
let gameOver = false;
let stars = [];
let smileProgress = 0;  // Control of mouth changes
let duration = 20 * 60; // 30s * 60 frames/sec
let victory = false;
let gameStarted = false;


function setup() {
  const canvas = createCanvas(600, 800);
  canvas.parent('stage');
  canvas.elt.setAttribute('aria-label', 'Drag five candies above the bottle cap within twenty seconds.');
  background(255, 150, 120); 
  startTime = millis(); 
  
  drawBottle();

  // initial bubble
  for (let i = 0; i < 5; i++) {
    bubbles.push(new Bubble(random(180, 370), random(480, 680)));
  }

 // initial candy
  candies.push(new Candy(100, 750, '#AAE6FE', '#71C5E8')); 
  candies.push(new Candy(180, 750, '#AEEBDA', '#71E8B4'));
  candies.push(new Candy(260, 750, '#FEC5E6', '#FE71A8'));
  candies.push(new Candy(340, 750, '#FFD700', '#FFA500'));
  candies.push(new Candy(420, 750, '#98FB98', '#00FA9A'));
  document.getElementById('start').disabled = false;
  noLoop();
 }


function draw() {
  if (!gameStarted) return;
  if (gameOver) {
    background(0);
    fill(255, 0, 0);
    textSize(64);
    textAlign(CENTER, CENTER);
    text('Game Over', width / 2, height / 2);
    noLoop();
    return;
  }
  // background(255, 150, 120);
  let startColor = color(255, 150, 120); 
  let endColor = color(120, 0, 0); 
  let bgColor = lerpColor(startColor, endColor, map(bgIntensity, 0, maxCandies, 0, 1));

  background(bgColor);
  drawBottle();
  
  //smile
  let Time = millis();
  smileProgress = map(Time - startTime, 0, duration * (1000 / 60), 0, 1);
  smileProgress = constrain(smileProgress, 0, 1);  
  
  //Bottle Vibrations
  let offsetX = 0;
  let offsetY = 0;
  
  if (explosion) {   //Apply random displacement
    offsetX = random(-5, 5);
    offsetY = random(-3, 3);
  }
  
    push(); 
    translate(offsetX, offsetY); 
    drawBottle();
    drawLabel();   
    pop(); 
  
  //bubbles
    if (frameCount % Math.max(10, 100 - dropped * 5) === 0) { // 随糖果增加多泡泡
    bubbles.push(new Bubble(random(180, 350), random(480, 680)));
  }

  for (let i = 0; i < bubbles.length; i++) {
    bubbles[i].speed = dropped + 1 * 0.5;    
    bubbles[i].move();
    bubbles[i].display();
    
    // If bubbles reache top, reset to the bottom
    if (bubbles[i].y < 225) {
      bubbles[i].reset(); 
    }
  }
  
  //background color
  if (dropped > 0 && !explosion) {
    bgIntensity = dropped;
  } 
  
    // Check if all the candies fall into the bottle
  if (dropped >= 5 && !explosion) {
    explosion = true;     // Trigger explosion effect
  }
  
  if (explosion) {
    if (frameCount % 4 === 0) triggerExplosion();
    bgIntensity = constrain(bgIntensity + 1, 0, maxCandies); 
    smileProgress = 0;
    victory = true;
  }
  
  // Spatter
  for (let i = spatters.length - 1; i >= 0; i--) {
    spatters[i].move();
    spatters[i].display();
    // 移除粒子
    if (spatters[i].isFinished()) {
      spatters.splice(i, 1);
    }
  }

  // Explosion Bubbles
  for (let i = explosionBubbles.length - 1; i >= 0; i--) {
    explosionBubbles[i].move();
    explosionBubbles[i].display();
    // 移除泡泡
    if (explosionBubbles[i].isFinished()) {
      explosionBubbles.splice(i, 1);
    }
  }

    // Draw Label again to make the bubbles are covered
  push();
  translate(offsetX, offsetY); 
  drawLabel(); 
  pop(); 
  
     // Candy is located at the top
    for (let i = 0; i < candies.length; i++) {
    candies[i].move();
    candies[i].display();
    
     // Removed candies falling up the bottle cap
    if (candies[i].isOutOfBottle()) {
        dropped++; 
        document.getElementById('status').textContent = dropped >= maxCandies
          ? 'You did it! All 5 candies! / 成功投入全部糖果！'
          : `${dropped} / 5 candies · 糖果`;
        candies.splice(i, 1);  
        i--;  
    }
  } 
  
function drawCircularTimer(timeLeft) {
  let totalTime = 20;
  let progress = map(timeLeft, 0, totalTime, 0, 1); // Calculate remaining time

  // bg
  noFill();
  stroke(200);
  strokeWeight(20);
  ellipse(width - 100, 100, 150, 150);

  // time bar
  stroke(lerpColor(color(255, 0, 0), color(255, 150, 120), 1 - progress));
  arc(width - 100, 100, 150, 150, -HALF_PI, -HALF_PI + progress * TWO_PI, OPEN);

  // Digital animation effects
  let baseSize = 35; // Fixed size for first 20 seconds
  let maxSize = 120; // last 10s
  let size = timeLeft > 10 ? baseSize : map(timeLeft, 10, 0, baseSize, maxSize); // Last 10 seconds get big
    // revolve
  let rotationAngle = map(sin(frameCount * 0.1), -1, 1, -0.1, 0.1); 
    // flash
  let alpha = 255;
  if (timeLeft < 4) {
    alpha = map(sin(frameCount * 0.2), -1, 1, 100, 255); 
  }

  // setting
  fill(0, alpha);
  noStroke();

  push();
  textAlign(CENTER, CENTER);
  translate(width - 100, 100); 
  rotate(rotationAngle); 
  textSize(size); 
  text(timeLeft, 0, 0);
  pop();
}
  
function handleGameOver() {
  document.getElementById('status').textContent = 'Time’s up! Press Restart to try again. / 时间到！点击重玩再试一次。';
}
  
if (!gameOver && !victory) {
  let cTime = millis();
  timer = 20 - Math.floor((cTime - startTime) / 1000);

  // victory
  if (dropped >= maxCandies) {
    explosion = true; 
    victory = true; 
  }

  // fail
  if (timer <= 0) {
    timer = 0;
    if (!victory) { 
      gameOver = true;
      handleGameOver();
    }
  }

  drawCircularTimer(timer);

//stars
} else {
  if (victory) {
    if (frameCount % 5 === 0) { 
      stars.push(new Star());
    }

    for (let i = stars.length - 1; i >= 0; i--) {
      stars[i].move();
      stars[i].display();
      // Remove stars that are out of the screen
      if (stars[i].isOffScreen()) {
        stars.splice(i, 1);
      }
    }
  } else if (gameOver) {
      background(0);
      fill(255, 0, 0);
      textSize(64);
      textAlign(CENTER, CENTER);
      text("Game Over", width / 2, height / 2);
      noLoop();
    }
  }
}


class Candy {
  constructor(x, y, color1, color2) {
    this.x = x;
    this.y = y;
    this.color1 = color1;    // dark
    this.color2 = color2;    // light
    this.isDragging = false; // Detect if candy is being dragged
    this.falling = false
    this.radius = 40; 
  }
  
  display() {
    noStroke();
    fill(this.color1); 
    beginShape();
    vertex(this.x, this.y);
    bezierVertex(this.x - 20, this.y + 50, this.x + 100, this.y + 30, this.x + 80, this.y);    // dpwn half
    bezierVertex(this.x + 65, this.y - 30, this.x + 10, this.y - 20, this.x, this.y);         // up half
    endShape(CLOSE);

    fill(this.color2); 
    beginShape();
    vertex(this.x - 2, this.y + 5);
    bezierVertex(this.x - 20, this.y + 50, this.x + 100, this.y + 30, this.x + 80, this.y);   // dpwn half
    bezierVertex(this.x + 50, this.y - 20, this.x + 10, this.y - 10, this.x, this.y);        // up half
    endShape(CLOSE);
    
    // highlights
    fill(255);
    ellipse(this.x + 53, this.y - 11, 10, 6);
  }

  // Detect if the mouse is over the candy
  overCandy() {
    let d = dist(mouseX, mouseY, this.x + 40, this.y); 
    return d < this.radius; 
  }
  
  move() {
    if (this.falling) {
      this.y += 5;
   }else if (this.isDragging) {
      this.x = mouseX - 40; 
      this.y = mouseY; 
    }
  }

  startDragging() {
    if (this.overCandy()) {
      this.isDragging = true;
    }
  }
  stopDragging() {
    this.isDragging = false;
    if (this.y < 130 && this.x > 220 && this.x < 330) {
      this.falling = true; // If candy above the bottle cap, start falling
  }
}

isOutOfBottle() {
    let bottleCapY = 75; 
    if (this.y > bottleCapY && this.falling) {
      // spatter effect
      for (let i = 0; i < 15; i++) { 
        spatters.push(new Spatter(this.x + 40, bottleCapY)); 
      }
      return true;
    }
    return false;
  }
}

// Start dragging the candy when the mouse is pressed
function mousePressed() {
  if (!gameStarted || gameOver || victory) return;
  for (let i = candies.length - 1; i >= 0; i--) {
    if (!candies[i].falling && candies[i].overCandy()) {
      candies[i].startDragging();
      break;
    }
  }
}
function mouseReleased() {
  if (!gameStarted || gameOver || victory) return;
  for (let i = 0; i < candies.length; i++) {
    if (candies[i].isDragging) candies[i].stopDragging();
  }
}

function touchStarted(event) {
  if (event.target.tagName !== 'CANVAS') return;
  mousePressed();
  return false;
}
function touchMoved(event) {
  if (event.target.tagName === 'CANVAS') return false;
}
function touchEnded(event) {
  if (event.target.tagName !== 'CANVAS') return;
  mouseReleased();
  return false;
}

class Spatter {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(5, 15); 
    this.speedX = random(-2, 2); 
    this.speedY = random(-5, -2); 
    this.alpha = 255; 
  }

  move() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += 0.1; // simulate gravity
    this.alpha -= 5; 
  }

  display() {
    noStroke();
    fill(255, this.alpha); 
    ellipse(this.x, this.y, this.size);
  }

  isFinished() {
    return this.alpha <= 0; 
  }
}


class Bubble {
  constructor(x, y) {
    this.x = x || random(180, 350);
    this.y = y;
    this.size = random(10, 20);
    this.speed = random(1, 3);   
  }

  move() {
    this.y -= this.speed; // Bubbles move up
    // this.size += 0.06;    // Bubbles get bigger
    this.size = map(this.y, 680, 225, 7, 35); 
  }

  display() {
    noStroke();
    fill(255, 200); // color translucent
    ellipse(this.x, this.y, this.size);
  }

  reset() {
    // Reset bubble position
    this.y = random(480, 680); 
    this.x = random(180, 350); 
    this.size = random(10, 20); 
    this.speed = random(1, 3); 
  }
}

class Star {
  constructor() {
    this.x = random(0, width);
    this.y = random(-100, -10); 
    this.size = random(5, 10); 
    this.speed = random(1, 3); 
  }
  move() {
    this.y += this.speed; 
  }
  display() {
    noStroke();
    fill(255, 255, 0); 
    ellipse(this.x, this.y, this.size);
  }
  isOffScreen() {
    return this.y > height; 
  }
}

class ExplosionBubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(10, 25); 
    this.speedX = random(-2, 2);  // shuffling
    this.speedY = random(-8, -4); // run up
    this.alpha = 255; 
  }

  move() {
    this.x += this.speedX; 
    this.y += this.speedY; 
    // this.speedY += 0.2; // 增加重力效果
    this.alpha -= 4; 
  }

  display() {
    noStroke();
    fill(255, this.alpha); 
    ellipse(this.x, this.y, this.size);
  }
  
  isFinished() {
    return this.alpha <= 0; 
  }
}


function triggerExplosion() {
  // 泡泡从瓶口喷出
  let bottleCapXStart = 210; 
  let bottleCapXEnd = 320; 
  
  for (let i = 0; i < 100; i++) {
    let x = random(bottleCapXStart, bottleCapXEnd); // Affects the lateral distribution range of bubbles
    let y = random(5, 85); 
    explosionBubbles.push(new ExplosionBubble(x, y)); 
  }
}



//bottle
function drawBottle() {
  //bottle shadow
  fill("#A64F3C7F"); 
  noStroke();
  ellipse(275, 690, 290, 60);
  
  stroke(255); 
  strokeWeight(5); 
  noFill(); 
  
  beginShape();
  vertex(220, 130); // Start point at the top
  bezierVertex(130, 200, 110, 280, 170, 330); // Left side of the bottle
  bezierVertex(170, 330, 170, 480, 170, 480); 
  bezierVertex(100, 630, 170, 680, 180, 680); 
  
  bezierVertex(220, 690, 225, 690, 230, 680); // Bottom curve
  bezierVertex(250, 710, 315, 710, 330, 680); 
  bezierVertex(340, 690, 345, 690, 380, 680); 
  
  bezierVertex(380, 680, 450, 630, 380, 480); // Right side of the bottle
  bezierVertex(380, 480, 380, 330, 380, 330); 
  bezierVertex(440, 270, 410, 190, 330, 130); 
  
  endShape(CLOSE); 

  // bottle cap
  strokeWeight(0); 
  fill(255); 
  rect(220, 75, 110, 55, 5, 5, 0, 0); 
  
  fill(180);
  push();                  //Grey 1
  translate(216, 82); 
  rotate(radians(8)); 
  rect(0, 0, 122, 10, 3); 
  pop();
  
  push();                 //Grey 2
  translate(215, 100);
  rotate(radians(8)); 
  rect(0, 0, 121, 10, 3); 
  pop();
  
  
  // Black drink
  fill(0); 
  stroke(0);
  strokeWeight(3);
    
  beginShape();
  vertex(147, 225); // Start point
  bezierVertex(160, 240, 175, 245, 200, 225); // 第一段波浪
  bezierVertex(208, 220, 220, 220, 230, 225); 
  bezierVertex(260, 240, 270, 240, 285, 225); 
  bezierVertex(300, 210, 315, 230, 330, 230); 
  bezierVertex(380, 210, 360, 250, 402, 225); // 第五段波浪
  
  bezierVertex(410, 245, 415, 290, 378, 328); 
  bezierVertex(378, 330, 300, 330, 175, 330);  //直线
  bezierVertex(150, 310, 128, 278, 147, 225); 
  endShape();

  beginShape();
  vertex(174, 480); // Start point
  bezierVertex(102, 630, 174, 680, 184, 678); // Left side of the bottle
  bezierVertex(216, 686, 225, 688, 230, 678); // Bottom curve
  bezierVertex(250, 706, 313, 708, 330, 678); 
  bezierVertex(340, 686, 345, 688, 378, 677); 
  bezierVertex(378, 679, 446, 628, 375, 478); // Right side of the bottle
  endShape(CLOSE); 

  // Grey drink
  fill("#E1E1E1"); 
  stroke("#E1E1E1");
  strokeWeight(3);
  
 beginShape();
  vertex(147, 224); // Start point
  bezierVertex(160, 240, 175, 245, 200, 225); // 第一段波浪
  bezierVertex(208, 220, 220, 220, 230, 225); 
  bezierVertex(260, 240, 270, 240, 285, 225); 
  bezierVertex(300, 210, 315, 230, 330, 230); 
  bezierVertex(380, 210, 360, 250, 402, 225); // 第五段波浪
  
  bezierVertex(399, 210, 375, 175, 381, 184); 
   bezierVertex(380, 180, 360, 167, 330, 190); //上面波浪
   bezierVertex(310, 200, 285, 190, 270, 185); 
   bezierVertex(245, 175, 240, 185, 230, 190);
   bezierVertex(218, 200, 205, 200, 198, 195);
   bezierVertex(170, 170, 168, 195, 166, 189);
  bezierVertex(153, 210, 150, 215, 147, 224); 
  endShape();
  
  noFill(); 
  stroke("#d9a59a"); 
  strokeWeight(3); 
  arc(170, 220, 10, 3, 0, PI);
  arc(220, 205, 8, 3, 0, PI);
  arc(250, 215, 10, 4, 0, PI);
  arc(300, 208, 10, 4, 0, PI);
  arc(355, 190, 11, 4, 0, PI);
  arc(380, 220, 7, 3, 0, PI);
  
  // White drink
  fill(255); 
  noStroke();
  
 beginShape();
  vertex(380, 180); // Start point
   bezierVertex(380, 180, 360, 167, 330, 189); //下面波浪
   bezierVertex(310, 200, 285, 190, 270, 185); 
   bezierVertex(245, 175, 240, 185, 230, 190);
   bezierVertex(218, 200, 205, 200, 198, 195);
   bezierVertex(170, 170, 168, 195, 160, 188);
    bezierVertex(170, 180, 180, 150, 227, 130); //左弧线
    bezierVertex(227, 130, 300, 130, 334, 132); //上
  endShape();
}


// blue label
function drawLabel() {
  fill("#738CD9");
  rect(172.5, 330, 205, 150);
  
  // smiley
  fill("#F2B84B");
  ellipse(275, 405, 90, 90);
    // eyes
  fill(0); 
  ellipse(260, 390, 10, 10); // left eye
  ellipse(290, 390, 10, 10); // right eye
   // mouth
  noFill(); 
  stroke(0); 
  strokeWeight(4); 
  // arc(275, 405, 40, 30, 0, PI);

  let smileOffset = map(smileProgress, 0, 1, 20, -20); // smile level
  let yOffset = map(smileProgress, 0, 1, 0, 10); 

  beginShape();
  vertex(255, 405 + yOffset); // left point
  bezierVertex(258, 405 + smileOffset + yOffset, 292, 405 + smileOffset + yOffset, 295, 405 + yOffset); // Control points & right point
  endShape();

}  
