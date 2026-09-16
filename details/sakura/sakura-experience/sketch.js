// noprotect

let petals = [];
let bloomSpots = [];
let wind;
let treeCanvas;  //used to draw static tree

let useGUI = true;
let pane;
let motionX = 600;
let prevMotionX = 600;
let moveSpeed = 0;

let stillTime = 0;
let handWave = 0;
let motionTrail = [];
let trailLength = 18;
let fireflies = [];

let interactionMode = "none";
let showDebug = true;

let bgm;
let rainSound;
let sunSound;
let winSound;
let birdSound;
let soundStarted = false;

function preload() {
  bgm = loadSound("bgm.mp3");
  rainSound = loadSound("rain3.mp3");
  sunSound = loadSound("end1.mp3");
  winSound = loadSound("win.mp3");
  birdSound = loadSound("bird2.mp3");
}

const petalParams = {
  fallRate: 0.5,
  maxPetals: 240,
  gravity: 0.03,
  drag: 0.018,
  driftStrength: 0.018,
  fadeSpeed: 0.2,
  maxSpeed: 2.5,
  windDecay: 0.96,
  windMaxForce: 0.8,
};

const treeParams = {
  thinning: 0.65,
  density: 0.7,
  angle: 45.0,
  trunk: 56,
  gnarled: 0.8,
  seed: 8,
  trunkHeight: 130,
  bloomChance: 0.85,
  bloomSize: 1.0,
  bloomCluster: 3,
  trunkBloomChance: 0.08,
};

let video;
let prevPixels = [];
let motionEnergy = 0;
let seasonLevel = 0;

let state = "Normal";
let stateTimer = 0;

let pgSpring, pgSnow, pgNight, pgSunset;
let raindrops = [];

function setup() {
  pixelDensity(1);
  createCanvas(windowWidth, windowHeight);
  // createCanvas(1920, 1080);
  resetWorld();

  video = createCapture(VIDEO);
  video.size(64, 48);
  video.hide();

  if (useGUI && window.Pane) {
    initGUI();
  }

  // bgm.setVolume(0.5);
  // bgm.loop();
  // rainSound.loop();
  // rainSound.setVolume(0);
  bgm.setVolume(0.5);
  rainSound.setVolume(0);
  sunSound.setVolume(0);
  birdSound.setVolume(0);
}

function windowResized() {
  // resizeCanvas(windowWidth, windowHeight);
  resetWorld();
}

function resetWorld() {
  wind = createVector(0, 0);

  treeCanvas = createGraphics(width, height);
  treeCanvas.pixelDensity(1);
  
  //weather system
  pgSpring = createGraphics(width, height);
  pgSnow = createGraphics(width, height);
  pgNight = createGraphics(width, height);
  pgSunset = createGraphics(width, height);

  drawSpring(pgSpring);
  drawSnow(pgSnow);
  drawNight(pgNight);
  drawSunsetStatic(pgSunset);

  drawStaticTree();

  petals = [];
  raindrops = [];
}

function initGUI() {
  pane = new window.Pane({ title: "Petal Motion" });
  pane.addBinding(petalParams, "fallRate", { min: 0, max: 1 });
  pane.addBinding(petalParams, "maxPetals", { min: 20, max: 500, step: 1 });
  pane.addBinding(petalParams, "gravity", { min: 0.005, max: 0.1 });
  pane.addBinding(petalParams, "drag", { min: 0.001, max: 0.07 });
  pane.addBinding(petalParams, "driftStrength", { min: 0, max: 0.06 });
  pane.addBinding(petalParams, "fadeSpeed", { min: 0.02, max: 0.8 });
  pane.addBinding(petalParams, "maxSpeed", { min: 0.5, max: 6 });
  pane.addBinding(petalParams, "windDecay", { min: 0.85, max: 0.995 });
}

function draw() {
  background(0);
  calculateMotion();
  updateSeason();
  drawBackground();

  image(treeCanvas, 0, 0);

  releasePetals();
  updatePetals();
  updateFireflyTrigger();
  updateFireflies();
  drawDebugUI();
}

function calculateMotion() {
  video.loadPixels();
  if (video.pixels.length > 0 && prevPixels.length > 0) {
    let diffCount = 0;
    let sumX = 0;
    for (let y = 0; y < video.height; y++) {
      for (let x = 0; x < video.width; x++) {
        let i = (y * video.width + x) * 4;  //rgba
        let diff = abs(video.pixels[i] - prevPixels[i]);
        if (diff > 20) {  //here has motion
          diffCount++;
          sumX += x;
        }
      }
    }
    let totalPixels = video.width * video.height;
    motionEnergy = constrain(map(diffCount, 0, totalPixels * 0.1, 0, 1), 0, 1);
    if (diffCount > 0) {
      let avgX = sumX / diffCount;
      motionX = map(avgX, 0, video.width, width, 0);
    }
  }

  moveSpeed = abs(motionX - prevMotionX);
  prevMotionX = motionX;

  motionTrail.push(motionX);
  if (motionTrail.length > trailLength) {
    motionTrail.shift();
  }

  let hasMovement = motionEnergy > 0.008;

  //determine action
  let totalShift = 0;
  let directionChanges = 0;
  let lastDir = 0;

  for (let i = 1; i < motionTrail.length; i++) {
    let diff = motionTrail[i] - motionTrail[i - 1];

    if (abs(diff) > width * 0.004) {
      totalShift += abs(diff);

      let dir = diff > 0 ? 1 : -1;

      if (lastDir !== 0 && dir !== lastDir) {
        directionChanges++;
      }

      lastDir = dir;
    }
  }

  let overallMove = abs(motionTrail[motionTrail.length - 1] - motionTrail[0]);

  let isWalk = hasMovement && overallMove > width * 0.08 && directionChanges <= 2;
  let isWave = hasMovement && directionChanges >= 3 && totalShift > width * 0.08;
  let isStill = !hasMovement;

  if (isWalk) {
    interactionMode = "walk";
    stillTime = 0;
    handWave = lerp(handWave, 0, 0.08);
  } else if (isWave) {
    interactionMode = "wave";
    stillTime++;
    handWave = lerp(handWave, motionEnergy, 0.18);
  } else if (isStill) {
    interactionMode = "still";
    stillTime++;
    handWave = lerp(handWave, 0, 0.06);
  } else {
    interactionMode = "small motion";
    handWave = lerp(handWave, motionEnergy * 0.8, 0.12);
  }

  prevPixels = new Uint8ClampedArray(video.pixels);
}

function updateSeason() {
  if (state === "Normal") {
    if (interactionMode === "walk") {
      seasonLevel += motionEnergy * 0.4;
    } else if (interactionMode === "wave") {
      seasonLevel += handWave * 0.2;
    } else if (interactionMode === "small motion") {
      seasonLevel += motionEnergy * 0.03;
    } else if (interactionMode === "still") {
      seasonLevel -= 0.025;
    } else {
      seasonLevel -= 0.01;
    }
    seasonLevel = constrain(seasonLevel, 0, 100);

    if (seasonLevel >= 100) {
      state = "Climax";
      stateTimer = 10;
      bgm.setVolume(0, 1);
      if (birdSound.isPlaying()) birdSound.setVolume(0, 0.5);

      if (winSound.isLoaded()) {
        winSound.setVolume(0.6); 
        winSound.play();
      }
    }
  } else if (state === "Climax") {
    stateTimer--;
    if (stateTimer <= 0) {
      state = "Cooldown";
      stateTimer = 1020;
      seasonLevel = 0;

      bgm.pause();
      sunSound.setVolume(0); 
      sunSound.loop();
      sunSound.setVolume(0.2, 1.0);
    }
  } else if (state === "Cooldown") {
    stateTimer--;

    if (stateTimer === 180) {
      sunSound.setVolume(0, 3.0); // fade out 3s
    }
    if (stateTimer <= 0) {
      state = "Normal";
      sunSound.stop();
      bgm.stop();
      bgm.setVolume(0);
      bgm.loop();
      bgm.setVolume(0.6, 2);
      if (birdSound.isPlaying()) birdSound.stop();
    }
  }
}

function drawBackground() {
  if (state === "Normal") {
    if (birdSound && birdSound.isLoaded()) {
      if (!birdSound.isPlaying()) {
        birdSound.loop();
        birdSound.setVolume(0);
      }

      let birdVol = 0;
      if (seasonLevel < 25) {
        birdVol = map(seasonLevel, 0, 25, 0, 0.6, true);
      } else if (seasonLevel >= 25 && seasonLevel < 50) {
        birdVol = 0.6;
      } else if (seasonLevel >= 50 && seasonLevel < 100) {
        birdVol = map(seasonLevel, 50, 100, 0.6, 0, true);
      } else {
        birdVol = 0;
      }
      birdSound.setVolume(birdVol, 0.1);
    }

    let alphaSnow = map(seasonLevel, 0, 25, 255, 0, true);   //0-25
    let alphaSpring = map(seasonLevel, 0, 25, 0, 255, true);
    if (seasonLevel > 25) alphaSpring = map(seasonLevel, 25, 50, 255, 0, true);  //25-50
    let alphaSunset = map(seasonLevel, 25, 50, 0, 255, true);
    if (seasonLevel > 50) alphaSunset = map(seasonLevel, 50, 75, 255, 0, true);  //50-75
    let alphaNight = map(seasonLevel, 50, 75, 0, 255, true);

    tint(255, alphaSnow);
    image(pgSnow, 0, 0);
    tint(255, alphaSpring);
    image(pgSpring, 0, 0);
    if (alphaSunset > 0) {
      tint(255, alphaSunset);
      image(pgSunset, 0, 0);
      drawMovingMountains(alphaSunset);
      drawBreathingFog(alphaSunset);
    }
    tint(255, alphaNight);
    image(pgNight, 0, 0);
    noTint();

    
    //rain sound
    let targetRainVol = map(seasonLevel, 75, 100, 0, 0.8, true);
    if (rainSound && rainSound.isLoaded()) {
      rainSound.setVolume(targetRainVol, 0.1);
    }

    //rain drops
    if (seasonLevel > 75) {
      let rainIntensity = map(seasonLevel, 75, 100, 1, 15);
      for (let i = 0; i < rainIntensity; i++) {
        raindrops.push(new Raindrop(map(motionX, 0, width, 2, -2)));
      }
    }
    for (let i = raindrops.length - 1; i >= 0; i--) {
      raindrops[i].update();
      raindrops[i].show();
      if (raindrops[i].offScreen()) raindrops.splice(i, 1);
    }
    
  } else if (state === "Climax") {
    if (rainSound && rainSound.isLoaded()) rainSound.setVolume(0, 0.2);
    if (birdSound && birdSound.isPlaying()) birdSound.setVolume(0, 0.2);
    background(255);
    raindrops = [];
    
  } else if (state === "Cooldown") {
    if (rainSound && rainSound.isLoaded()) rainSound.setVolume(0, 0.1);
    if (birdSound && birdSound.isPlaying()) birdSound.stop();
    let progress = map(stateTimer, 1020, 0, 0, 1);
    image(pgSnow, 0, 0);  //back to snow scene
    let zenBgAlpha = map(progress, 0.5, 1, 255, 0, true);
    noStroke();
    fill(240, zenBgAlpha);
    rect(0, 0, width, height);
    
    
    let sunY = height * 0.25 + progress * 150;
    let sunAlpha = map(progress, 0.6, 1, 255, 0, true);
    if (sunAlpha > 0) {
      let sunSize = 280;
      let pulse = sin(frameCount * 0.05) * 5;
      for (let r = sunSize + 50; r > sunSize; r -= 5) {
        let a = map(r, sunSize + 50, sunSize, 0, 20);
        fill(220, 80, 80, min(a, sunAlpha));
        ellipse(width * 0.8, sunY, r, r);
      }
      fill(220, 80, 80, sunAlpha);
      ellipse(width * 0.8, sunY, sunSize + pulse, sunSize + pulse); 
    }
    let shadowAlpha = map(progress, 0.6, 1, 40, 0, true);
    fill(200, shadowAlpha);
    rect(0, height - 40, width, 40);
  }
}

function drawStaticTree() {
  randomSeed(treeParams.seed);
  bloomSpots = [];
  treeCanvas.clear();
  treeCanvas.push();
  treeCanvas.translate(width / 2, height - 5);
  treeCanvas.scale(1.0);
  drawTree(treeCanvas);
  treeCanvas.pop();
}

function drawTree(pg) {
  let len = treeParams.trunkHeight;
  let thick = treeParams.trunk;
  let trunkTop = drawMainTrunk(pg, len, thick);
  pg.push();
  pg.translate(trunkTop.x, trunkTop.y);
  let mainBranches = [
    { angle: -42, len: len * 1.1, thick: thick * 0.36, age: 0 },
    { angle: -38, len: len * 1.2, thick: thick * 0.21, age: 0 },
    { angle: -12, len: len * 1.05, thick: thick * 0.38, age: 0 },
    { angle: -3, len: len * 0.85, thick: thick * 0.3, age: -16 },
    { angle: 40, len: len * 1.0, thick: thick * 0.25, age: 8 },
    { angle: 18, len: len * 1.1, thick: thick * 0.2, age: 0 },
    { angle: 48, len: len * 1.15, thick: thick * 0.39, age: 0 },
    { angle: 34, len: len * 1.04, thick: thick * 0.23, age: 0 },
    { angle: 44, len: len * 0.8, thick: thick * 0.16, age: 0 },
  ];
  for (let b of mainBranches) {
    pg.push();
    pg.rotate(radians(b.angle + random(-4, 4)));
    drawBranch(pg, b.len, b.thick, b.age);
    pg.pop();
  }
  pg.pop();
}

function drawMainTrunk(pg, len, thickness) {
  let steps = 11;
  let x = 0,
    y = 0;
  let segLen = len / steps;
  pg.stroke(45, 45, 48);
  for (let i = 0; i < steps; i++) {
    let dx = random(-3, 3);
    let dy = -segLen + random(-2, 2);
    pg.strokeWeight(thickness * map(i, 0, steps - 1, 1.0, 0.82));
    pg.line(x, y, x + dx, y + dy);
    if (thickness > 10) {
      pg.strokeWeight(thickness * 0.35);
      pg.line(x - 3, y, x + dx - 2, y + dy);
    }
    x += dx;
    y += dy;
  }
  return createVector(x, y);
}

function drawBranch(pg, len, thickness, age) {
  //if branch is thickness enough begin to draw flower
  if (age > 9 || thickness < 0.4 || len < 4) {
    drawBloomCluster(pg);
    return;
  }
  let steps = 6;
  let currX = 0,
    currY = 0;
  let baseStepY = len / steps;
  for (let i = 0; i < steps; i++) {
    let nextX = random(-len * treeParams.gnarled * 0.1, len * treeParams.gnarled * 0.1);
    let nextY =
      -baseStepY +
      random(-len * treeParams.gnarled * 0.08, len * treeParams.gnarled * 0.08);
    pg.stroke(45, 45, 48);
    pg.strokeWeight(thickness);
    pg.noFill();
    pg.line(currX, currY, currX + nextX, currY + nextY);
    if (thickness < 18.0 && random() < treeParams.trunkBloomChance) {
      pg.push();
      pg.translate(currX + random(-4, 4), currY + random(-4, 4));
      recordBlossomSource(pg);
      drawCherryBlossom(pg, random(8, 12) * treeParams.bloomSize);
      pg.pop();
    }
    currX += nextX;
    currY += nextY;
  }
  pg.translate(currX, currY);
  let branches = random(1) < treeParams.density ? floor(random(2, 5)) : 1;
  for (let i = 0; i < branches; i++) {
    pg.push();
    let angle = radians(random(-treeParams.angle, treeParams.angle));
    pg.rotate(angle);
    drawBranch(
      pg,
      len * random(0.68, 0.85),
      thickness * treeParams.thinning,
      age + 1
    );
    pg.pop();
  }
}

function drawBloomCluster(pg) {
  if (random() > treeParams.bloomChance) return;
  let count = treeParams.bloomCluster;
  for (let i = 0; i < count; i++) {
    pg.push();
    pg.translate(random(-12, 12), random(-12, 12));
    pg.rotate(random(TWO_PI));
    recordBlossomSource(pg);
    if (random() < 0.75) {
      drawCherryBlossom(pg, random(8, 14) * treeParams.bloomSize);
    } else {
      drawBud(pg, random(4, 7) * treeParams.bloomSize);
    }
    pg.pop();
  }
}

//falling petals generated from tree
function recordBlossomSource(pg) {
  let m = pg.drawingContext.getTransform();
  bloomSpots.push({ x: m.e, y: m.f });
}

function drawCherryBlossom(pg, s) {
  pg.noStroke();
  let petalA = color(255, random(205, 225), random(220, 235), 220);
  let petalB = color(255, random(185, 210), random(210, 228), 210);
  for (let i = 0; i < 5; i++) {
    pg.push();
    pg.rotate((TWO_PI / 5) * i + random(-0.05, 0.05));
    pg.fill(lerpColor(petalA, petalB, random()));
    pg.ellipse(0, -s * 0.28, s * 0.52, s * 0.78);
    pg.pop();
  }
  pg.fill(245, 220, 90, 230);
  pg.ellipse(0, 0, s * 0.22, s * 0.22);
  pg.stroke(220, 170, 60, 130);
  pg.strokeWeight(0.6);
  for (let i = 0; i < 6; i++) {
    let a = random(TWO_PI);
    let r = random(s * 0.08, s * 0.22);
    pg.line(0, 0, cos(a) * r, sin(a) * r);
  }
}

function drawBud(pg, s) {
  pg.noStroke();
  pg.fill(255, 185, 205, 220);
  pg.ellipse(0, 0, s * 0.7, s);
  pg.fill(255, 215, 225, 180);
  pg.ellipse(-s * 0.08, -s * 0.12, s * 0.22, s * 0.35);
}

function releasePetals() {
  if (state === "Climax") return;
  if (petals.length > petalParams.maxPetals) return;
  if (bloomSpots.length === 0) return;
  let dynamicFallRate = petalParams.fallRate * motionEnergy * 1.4;  //easy to let petals fall

  if (interactionMode === "wave") {
    dynamicFallRate += handWave * 0.18;
  }

  if (interactionMode === "still") {
    dynamicFallRate *= 0.35;
  }

  if (random() < dynamicFallRate) {
    let source = random(bloomSpots);
    petals.push(new Petal(source.x + random(-4, 4), source.y + random(-4, 4)));
  }
}

//let motion to wind
function updatePetals() {
  let windDir = map(motionX, 0, width, 1, -1);
  let windInput = motionEnergy;

  if (interactionMode === "wave") {
    windInput += handWave * 0.7;
  }

  if (interactionMode === "still") {
    windInput *= 0.35;
  }

  let targetWindX = windDir * windInput * petalParams.windMaxForce;
  wind.x = lerp(wind.x, targetWindX, 0.05);
  wind.y = sin(frameCount * 0.03) * 0.01;
  wind.mult(petalParams.windDecay);

  for (let i = petals.length - 1; i >= 0; i--) {
    let p = petals[i];
    p.applyForce(createVector(0, petalParams.gravity));
    let heightFactor = map(p.pos.y, 80, height, 1.0, 0.35, true);
    let windForce = wind.copy();
    windForce.mult(p.windSensitivity * heightFactor);
    p.applyForce(windForce);
    p.applyDrag(petalParams.drag);
    p.update();
    p.display();
    if (p.isDone()) petals.splice(i, 1);
  }
}


//handwave more fireflies
function updateFireflyTrigger() {
  if (state !== "Normal") return;

  if (interactionMode === "wave" && handWave > 0.04) {
    if (frameCount % 4 === 0) {
      for (let i = 0; i < 5; i++) {
        let spawnX = motionX + random(-180, 180);
        let spawnY = height * 0.4 + random(-140, 140);
        fireflies.push(new Firefly(spawnX, spawnY));
      }
    }
  } else if (interactionMode === "walk" && motionEnergy > 0.05) {
    if (frameCount % 18 === 0) {
      let spawnX = motionX + random(-120, 120);
      let spawnY = height * 0.42 + random(-90, 90);
      fireflies.push(new Firefly(spawnX, spawnY));
    }
  }
}

function updateFireflies() {
  for (let i = fireflies.length - 1; i >= 0; i--) {
    let f = fireflies[i];

    f.update();
    f.display();

    if (f.isDone()) {
      fireflies.splice(i, 1);
    }
  }
}

class Firefly {
  constructor(x, y) {
    this.pos = createVector(x + random(-70, 70), y + random(-70, 70));
    this.vel = p5.Vector.random2D();
    this.vel.mult(random(0.2, 0.8));
    this.acc = createVector(0, 0);

    this.size = random(3, 7);
    this.life = random(90, 150);
    this.maxLife = this.life;
    this.noiseOffset = random(1000);
  }

  update() {
    let driftX = map(
      noise(this.noiseOffset, frameCount * 0.01),
      0,
      1,
      -0.035,
      0.035
    );

    let driftY = map(
      noise(this.noiseOffset + 100, frameCount * 0.01),
      0,
      1,
      -0.04,
      0.02
    );

    this.acc.add(createVector(driftX, driftY));

    this.vel.add(this.acc);
    this.vel.limit(1.2);
    this.pos.add(this.vel);

    this.acc.mult(0);
    this.life--;
  }

  display() {
    let alpha = map(this.life, 0, this.maxLife, 0, 180, true);
    let pulse = sin(frameCount * 0.08 + this.noiseOffset) * 0.4 + 1;

    push();
    noStroke();

    fill(255, 245, 180, alpha * 0.22);
    ellipse(this.pos.x, this.pos.y, this.size * 7 * pulse);

    fill(255, 245, 180, alpha);
    ellipse(this.pos.x, this.pos.y, this.size * pulse);

    pop();
  }

  isDone() {
    return this.life <= 0;
  }
}

class Petal {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-0.3, 0.3), random(0.2, 0.8));
    this.acc = createVector(0, 0);
    this.size = random(5, 9);
    this.angle = random(TWO_PI);
    this.angleVel = random(-0.04, 0.04);
    this.alpha = random(190, 240);
    this.noiseOffset = random(1000);
    this.windSensitivity = random(0.6, 1.3);
  }
  applyForce(force) {
    this.acc.add(force);
  }
  applyDrag(k) {
    if (this.vel.mag() > 0) {
      let drag = this.vel.copy();
      drag.mult(-1).normalize();
      drag.mult(this.vel.magSq() * k);
      this.applyForce(drag);
    }
  }
  update() {
    let drift = map(
      noise(this.noiseOffset, frameCount * 0.01),
      0,
      1,
      -petalParams.driftStrength,
      petalParams.driftStrength
    );
    this.applyForce(createVector(drift, 0));
    this.vel.add(this.acc);
    this.vel.limit(petalParams.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.angle += this.angleVel;
    this.alpha -= petalParams.fadeSpeed;
  }
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    noStroke();
    fill(255, 220, 232, this.alpha);
    ellipse(0, 0, this.size * 0.7, this.size * 1.3);
    pop();
  }
  isDone() {
    return this.pos.y > height + 40 || this.alpha <= 0;
  }
}

class Raindrop {
  constructor(wind) {
    this.x = random(-200, width + 200);
    this.y = random(-100, -10);
    this.z = random(0, 20);
    this.len = map(this.z, 0, 20, 10, 30);
    this.yspeed = map(this.z, 0, 20, 15, 30);
    this.wind = wind;
  }
  update() {
    this.y += this.yspeed;
    this.x += this.wind * map(this.z, 0, 20, 1, 3);
  }
  show() {
    let thick = map(this.z, 0, 20, 1, 3);
    stroke(200, 220, 255, map(this.z, 0, 20, 50, 150));
    strokeWeight(thick);
    line(this.x, this.y, this.x + this.wind * 5, this.y + this.len);
  }
  offScreen() {
    return this.y > height;
  }
}

function drawSpring(pg) {
  pg.noStroke();
  for (let y = 0; y < pg.height; y++) {
    let t = map(y, 0, pg.height, 0, 1);
    pg.stroke(lerpColor(color(220, 235, 226), color(238, 232, 210), t));
    pg.line(0, y, pg.width, y);
  }
  pg.noStroke();
  pg.fill(175, 190, 145);
  pg.rect(0, pg.height * 0.78, pg.width, pg.height * 0.22);
  pg.fill(205, 215, 180, 110);
  pg.ellipse(pg.width * 0.5, pg.height * 0.79, pg.width * 0.9, 110);
}

function drawSnow(pg) {
  pg.background(242, 244, 245);
  for (let y = 0; y < pg.height * 0.6; y++) {
    let t = map(y, 0, pg.height * 0.6, 0, 1);
    pg.stroke(lerpColor(color(184, 208, 224), color(245, 245, 245), t));
    pg.line(0, y, pg.width, y);
  }
  pg.noStroke();
  pg.fill(235, 235, 230);
  pg.rect(0, pg.height * 0.75, pg.width, pg.height * 0.25);
  pg.fill(245, 245, 240, 120);
  pg.ellipse(pg.width * 0.5, pg.height * 0.76, pg.width * 0.9, 80);
}

function drawSunsetStatic(pg) {
  pg.noStroke();
  for (let y = 0; y < pg.height; y++) {
    let t = map(y, 0, pg.height, 0, 1);
    pg.stroke(lerpColor(color(45, 60, 90), color(240, 180, 160), t));
    pg.line(0, y, pg.width, y);
  }
}

function drawBreathingFog(amt) {
  push();
  noStroke();
  for (let i = 0; i < 15; i++) {
    let xOffset = noise(frameCount * 0.002, i * 100) * 100 - 50;
    let baseRectY = map(noise(i * 123), 0, 1, height * 0.5, height);
    let h = map(noise(i * 456), 0, 1, 20, 60);
    let breathingY = noise(frameCount * 0.005, i * 50) * 40 - 20;
    let maxAlpha = map(noise(i * 789), 0, 1, 3, 10);
    fill(255, 255, 255, map(amt, 0, 255, 0, maxAlpha));
    rect(-50 + xOffset, baseRectY + breathingY, width + 100, h);
  }
  pop();
}

function drawMovingMountains(amt) {
  push();
  noStroke();
  for (let layer = 0; layer < 3; layer++) {
    fill(60, 70, 100, (80 - layer * 20) * (amt / 255));
    beginShape();
    vertex(0, height);
    for (let x = 0; x <= width; x += 20) {
      let y =
        height * 0.6 +
        layer * 50 +
        noise(x * 0.003, layer, frameCount * 0.01) * 100;
      vertex(x, y);
    }
    vertex(width, height);
    endShape(CLOSE);
  }
  pop();
}

function drawNight(pg) {
  pg.noStroke();
  for (let y = 0; y < pg.height; y++) {
    let t = map(y, 0, pg.height, 0, 1);
    pg.fill(lerpColor(color(31, 45, 70), color(92, 88, 108), t));
    pg.rect(0, y, pg.width, 1);
  }
}

function drawDebugUI() {
  if (!showDebug) return;
  let fps = frameRate();
  push();
  textAlign(LEFT, BOTTOM);
  textSize(18);
  fill(fps < 45 ? [255, 80, 80] : [100, 255, 100]);
  text("FPS: " + fps.toFixed(1), 20, height - 20);
  pop();

  textAlign(LEFT, BASELINE);
  fill(255);
  noStroke();
  textSize(16);
  text("System State: " + state, 20, 30);

  if (state === "Cooldown") {
    text("Cooldown Timer: " + stateTimer, 20, 50);
  } else {
    text("Aura Level: " + floor(seasonLevel) + " / 100", 20, 50);
  }

  noFill();
  stroke(255);
  strokeWeight(1);
  rect(20, 60, 200, 10);
  noStroke();
  if (state === "Normal") {
    fill(255, 150, 150);
    rect(20, 60, map(seasonLevel, 0, 100, 0, 200), 10);
  } else if (state === "Cooldown") {
    fill(150, 255, 150);
    rect(20, 60, map(stateTimer, 0, 600, 0, 200), 10);
  }

  let debugX = 20,
    debugY = 100,
    debugW = 160,
    debugH = 120;
  fill(0, 150);
  rect(debugX - 10, debugY - 20, debugW + 20, debugH + 80, 8);
  fill(255);
  textSize(14);
  text("Camera Vision:", debugX, debugY - 5);

  push();
  translate(debugX + debugW, debugY);
  scale(-1, 1);
  image(video, 0, 0, debugW, debugH);
  pop();

  let indicatorX = map(motionX, 0, width, debugX, debugX + debugW);
  stroke(255, 50, 50);
  strokeWeight(2);
  line(indicatorX, debugY, indicatorX, debugY + debugH);
  noStroke();
  fill(255, 50, 50);
  ellipse(indicatorX, debugY + debugH / 2, 8, 8);

  fill(255);
  textSize(12);
  text("Motion X Pos: " + floor(motionX), debugX, debugY + debugH + 20);
  text("Wind Vector: " + wind.x.toFixed(3), debugX, debugY + debugH + 40);
  text(
    "Motion Energy: " + motionEnergy.toFixed(2),
    debugX,
    debugY + debugH + 55
  );
  text("Wave Energy: " + handWave.toFixed(2), debugX, debugY + debugH + 100);
  text("Interaction: " + interactionMode, debugX, debugY + debugH + 115);
  text("Fireflies: " + fireflies.length, debugX, debugY + debugH + 130);
}

function mousePressed() {
  if (!soundStarted) {
    userStartAudio();

    bgm.setVolume(0.5);
    bgm.loop();

    rainSound.loop();
    rainSound.setVolume(0);

    soundStarted = true;
  }
}

function keyPressed() {
  if (key == "f" || key == "F") {
    let fs = fullscreen();
    fullscreen(!fs);

    if (!soundStarted) {
      userStartAudio();

      bgm.setVolume(0.5);
      bgm.loop();

      rainSound.loop();
      rainSound.setVolume(0);

      soundStarted = true;
    }
  }

  if (key == "h" || key == "H") {
    if (pane) {
      let currentDisplay = pane.element.style.display;

      if (currentDisplay === "none") {
        pane.element.style.display = "block";
      } else {
        pane.element.style.display = "none";
      }
    }
  }
}
