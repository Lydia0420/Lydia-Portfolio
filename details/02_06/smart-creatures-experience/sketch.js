// let j; //jellyfish
let jellyfishes = [];
let maxJ = 16;   // jellyfish count

function setup() {
  const canvas = createCanvas(700, 700);
  canvas.parent('canvas-frame');

  for (let i = 0; i < 9; i++) {
    JF(random(width), random(height));
  }
}

function draw() {
  drawBackground();
  
  let target = createVector(mouseX, mouseY);
  
  for (let i = jellyfishes.length - 1; i >= 0; i--) {
    let j = jellyfishes[i];

    j.seek(target);
    j.wander();
    
    for (let k = 0; k < jellyfishes.length; k++) {
      if (i !== k) {
        j.avoid(jellyfishes[k]);
      }
    }

    j.evnForce();
    j.update();
    j.display();
    
    if (j.isDone) {
      jellyfishes.splice(i, 1);
    }
  }

  if (frameCount % 45 === 0 && jellyfishes.length < maxJ) {
    JF(random(width), height + random(20, 80));
  }
    Mouse();
}

function JF(x, y) {
  let r = random();
  if (r < 0.7) {
    jellyfishes.push(new BigJellyfish(x, y, random(34, 52)));
  } else {
    jellyfishes.push(new BabyJellyfish(x, y, random(18, 28)));
  }
}

function drawBackground() {
  background(10, 18, 38);

  noStroke();
  for (let y = 0; y < height; y += 6) {
    let r = map(y, 0, height, 10, 5);
    let g = map(y, 0, height, 30, 10);
    let b = map(y, 0, height, 80, 40);3
    fill(r, g, b);
    
    // let alpha = map(y, 0, height, 28, 8);
    // fill(18, 45, 80, alpha);
    rect(0, y, width, 6);
  }

  for (let i = 0; i < 55; i++) {
    let x = (i * 97 + frameCount * 0.15) % width;
    let y = (i * 61 + sin(frameCount * 0.01 + i) * 25) % height;
    fill(255, 255, 255, 40);
    circle(x, y, 2);
  }
}

function Mouse() {
  noStroke();
  fill(170, 220, 255, 18);
  circle(mouseX, mouseY, 120);
  fill(170, 220, 255, 8);
  circle(mouseX, mouseY, 200);
}

class Jellyfish {
  constructor(x, y, size) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.vel.mult(random(0.3, 0.8));
    this.acc = createVector(0, 0);
    
    this.size = size;
    this.maxSpeed = 1.8;
    this.steerForce = 0.05;
    this.mass = map(size, 18, 55, 0.8, 1.8);
    
    this.sense = 120;
    this.brake = 70;
    
    //this.angle = 0;
    this.angle = random(TWO_PI);
  
    this.lifespan = 255;
    this.isDone = false;
    
    
      this.pulseOffset = random(TWO_PI);
      this.lastPush = false;
  }

  applyForce(f) {
    let force = p5.Vector.div(f, this.mass);
    this.acc.add(force);
  }

  wander() {
    let targetWay = this.vel.copy();

    if (targetWay.mag() < 0.01) {
      targetWay = createVector(1, 0);
    }

    targetWay.normalize();
    targetWay.rotate(random(-1, 1) * 0.22);
    targetWay.mult(this.maxSpeed * 0.45);

    let steer = p5.Vector.sub(targetWay, this.vel);
    steer.limit(this.steerForce * 0.55);
    this.applyForce(steer);
  }

  seek(target) {
    let targetWay = p5.Vector.sub(target, this.pos);
    let distance = targetWay.mag();

    if (distance < this.sense) {
      targetWay.normalize();
      
      if (distance > this.brake) {
        targetWay.mult(this.maxSpeed * 0.75);
      } else {
        let speed = map(distance, 0, this.brake, 0, this.maxSpeed* 0.75);
        targetWay.mult(speed);
      }
   
      let steer = p5.Vector.sub(targetWay, this.vel);
      steer.limit(this.steerForce* 0.7);
      this.applyForce(steer);
    }
  }

  avoid(other) {
    let targetWay = p5.Vector.sub(other.pos, this.pos);
    let distance = targetWay.mag();
    let safeD = (this.size + other.size) * 0.8;

    if (distance > 0 && distance < safeD) {
      targetWay.normalize();
      targetWay.mult(this.maxSpeed);
      targetWay.mult(-1);

      let steer = p5.Vector.sub(targetWay, this.vel);
      steer.limit(this.steerForce * 1.25);
      this.applyForce(steer);
    }
  }
  
  evnForce() {
    let buoyancy = createVector(0, -0.012 * this.mass);
    this.applyForce(buoyancy);

    let flowX = map(
      noise(this.pos.y * 0.01, frameCount * 0.008, this.pos.x * 0.001),
      0, 1,
      -0.03, 0.03
    );

    let current = createVector(flowX, 0);
    this.applyForce(current);
  }

  
  pulseMotion() {
    let pulsePhase = sin(frameCount * 0.09 + this.pulseOffset);

    if (pulsePhase > 0.92 && !this.lastPush) {
      let pushDir;

      if (this.vel.mag() > 0.05) {
        pushDir = this.vel.copy().normalize();
      } else {
        pushDir = p5.Vector.fromAngle(this.angle - HALF_PI);
      }

      let push = pushDir.mult(0.18);
      this.applyForce(push);

      this.lastPush = true;
    }

    if (pulsePhase < 0.2) {
      this.lastPush = false;
    }
  }
  
  update() {
    this.pulseMotion();
    
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);

    let angle = this.vel.heading();
    this.angle = lerp(this.angle, angle, 0.08);

    this.lifespan -= 0.28;
    if (this.lifespan <= 0) {
      this.isDone = true;
    }
    this.loopPos();
  }

  loopPos() {
    if (this.pos.x < -60) this.pos.x = width + 60;
    if (this.pos.x > width + 60) this.pos.x = -60;
    if (this.pos.y < -100) this.pos.y = height + 60;
    if (this.pos.y > height + 100) this.pos.y = -60;
  }
  
    display() {}
}
  

class BigJellyfish extends Jellyfish {
  constructor(x, y, size) {
    super(x, y, size);
    this.maxSpeed = 1.45;
    this.steerForce = 0.042;
    this.sense = 130;
    this.brake = 85;
    this.tentacleCount = int(random(6, 9));
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle + HALF_PI);

    let alpha = this.lifespan;
    let pulsePhase = sin(frameCount * 0.09 + this.pulseOffset);
    let pulse = map(pulsePhase, -1, 1, 0, 1);

    //shape change
    let bellW = this.size * lerp(1.55, 1.28, pulse);
    let bellH = this.size * lerp(0.9, 1.18, pulse);

    //bell shine
    noStroke();
    fill(160, 215, 255, alpha * 0.08);
    ellipse(0, 2, bellW * 1.25, bellH * 1.15);

    // bell
    fill(185, 230, 255, alpha * 0.42);
    arc(0, 0, bellW, bellH, PI, TWO_PI);

    // bell highlight
    fill(220, 245, 255, alpha * 0.16);
    arc(0, -bellH * 0.08, bellW * 0.55, bellH * 0.35, PI, TWO_PI);

    // bottom
    fill(185, 230, 255, alpha * 0.12);
    ellipse(0, 2, bellW * 0.92, bellH * 0.18);

    // oral arms
    noStroke();
    fill(200, 235, 255, alpha * 0.18);
    for (let i = -1; i <= 1; i++) {
      ellipse(i * this.size * 0.11, this.size * 0.18, this.size * 0.12, this.size * 0.38);
    }
    
    //tentacles
    stroke(190, 230, 255, alpha * 0.55);
    strokeWeight(2);
    noFill();

    for (let i = -3; i <= 3; i++) {
      let x = i * this.size * 0.13;

      let sway = sin(
        frameCount * 0.09 +
        i * 0.6 +
        this.pos.y * 0.01 +
        this.pulseOffset
      ) * this.size * 0.15;

      beginShape();
      vertex(x, 0);
      bezierVertex(
        x + sway * 0.2, this.size * 0.28,
        x - sway, this.size * 0.75,
        x + sway * 0.6, this.size * 1.35
      );
      endShape();
    }

    pop();
  }
}


class BabyJellyfish extends BigJellyfish {
  constructor(x, y, size) {
    super(x, y, size);
    this.maxSpeed = 2.0;
    this.steerForce = 0.075;
    this.sense = 95;
    this.brake = 55;
    this.tentacleCount = int(random(4, 6));
  }

  pulseMotion() {
    let pulsePhase = sin(frameCount * 0.13 + this.pulseOffset);

    if (pulsePhase > 0.88 && !this.lastPush) {
      let pushDir;

      if (this.vel.mag() > 0.05) {
        pushDir = this.vel.copy().normalize();
      } else {
        pushDir = p5.Vector.fromAngle(this.angle - HALF_PI);
      }

      let push = pushDir.mult(0.22);
      this.applyForce(push);

      this.lastPush = true;
    }

    if (pulsePhase < 0.15) {
      this.lastPush = false;
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle + HALF_PI);

    let alpha = this.lifespan;
    let pulsePhase = sin(frameCount * 0.13 + this.pulseOffset);
    let pulse = map(pulsePhase, -1, 1, 0, 1);

    let bellW = this.size * lerp(1.45, 1.18, pulse);
    let bellH = this.size * lerp(0.82, 1.05, pulse);

    noStroke();
    fill(255, 195, 225, alpha * 0.1);
    ellipse(0, 2, bellW * 1.2, bellH * 1.1);

    fill(255, 210, 235, alpha * 0.48);
    arc(0, 0, bellW, bellH, PI, TWO_PI);

    fill(255, 235, 245, alpha * 0.18);
    arc(0, -bellH * 0.08, bellW * 0.5, bellH * 0.3, PI, TWO_PI);

    noStroke();
    fill(255, 220, 240, alpha * 0.16);
    ellipse(0, 2, bellW * 0.88, bellH * 0.15);
    
stroke(255, 220, 240, alpha * 0.55);
strokeWeight(1.6);
noFill();

for (let i = -2; i <= 2; i++) {
  let x = i * this.size * 0.16;

  let sway = sin(
    frameCount * 0.12 +
    i +
    this.pos.y * 0.015 +
    this.pulseOffset
  ) * this.size * 0.18;

  beginShape();
  vertex(x, 0);
  bezierVertex(
    x + sway * 0.2, this.size * 0.25,
    x - sway * 0.8, this.size * 0.55,
    x + sway * 0.5, this.size * 1.0
  );
  endShape();
}

    pop();
  }
}