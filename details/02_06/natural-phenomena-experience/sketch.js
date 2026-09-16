let groundY;
let flowers = [];
let petals = [];
let gravity;
let wind = 0.08;
let airDrag = 0.01;

function setup() {
  const canvas = createCanvas(700, 600);
  canvas.parent('canvas-frame');
  colorMode(HSB, 360, 100, 100, 100);
  angleMode(RADIANS);

  groundY = height - 40;
  gravity = createVector(0, 0.06);
  buildFlowers();
  
  //noLoop();
}

function draw() {
  // bg
  background(40, 10, 98);

  // ground
  noStroke();
  fill(40, 20, 90);
  rect(0, groundY, width, height - groundY);

  //branches
  drawBranches();
  //flower
  drawFlowers();
  
  // petals
    // if (frameCount % 8 === 0 && petals.length < 120) {
    //   petals.push(new Petal(random(width), random(-50, 0)));
    // }
  if (frameCount % 8 === 0 && petals.length < 120 && flowers.length > 0) {
    let f = random(flowers); //randomly pick a flower as the drop point

    let sx = f.x + random(-4, 4);
    let sy = f.y + random(-4, 4);

    //petals.push(new Petal(sx, sy));
    petals.push(new Petal(sx, sy, f.hue, f.sat, f.bri));
  }

  for (let i = petals.length - 1; i >= 0; i--) {
    let p = petals[i];

    //gravity
    p.applyForce(gravity);

    //wind
    let n = noise(p.noiseOffset, frameCount * 0.003);
    let wx = map(n, 0, 1, -wind, wind);
    let Wind = createVector(wx, 0);
    p.applyForce(Wind);
    p.noiseOffset += 0.004;
    
    //drag
    let speedM = p.vel.mag();
    if (speedM > 0) {
      let drag = p.vel.copy();
      drag.normalize();
      drag.mult(-1);
      drag.mult(speedM * speedM * airDrag);
      p.applyForce(drag);
    }

    p.update();
    p.checkGround(groundY);
    p.display();

    if (p.isDead()) petals.splice(i, 1);
  }
}

function drawBranches() {
  stroke(25, 35, 35, 85);
  strokeWeight(7);
  noFill();

  //main branch (longest)
  branchCurve(0, 100, 40, 90, 60, 95, 140, 125);
  branchCurve(140, 125, 160, 150, 190, 175, 220, 200);
  branchCurve(220, 200, 300, 220, 310, 222, 400, 230);
  branchCurve(400, 230, 450, 240, 455, 240, 550, 220);
  
  //side branch 1
  strokeWeight(6);
  branchCurve(0, 95, 40, 88, 60, 88, 160, 65);

  //side branch 2
  strokeWeight(5);
  branchCurve(230, 200, 280, 180, 310, 180, 380, 160);

  //small branch
  strokeWeight(3);
  line(90, 80, 140, 30);
  line(175, 160, 240, 130);
  line(195, 153, 230, 160);
  line(270, 180, 330, 130);
  line(460, 240, 520, 270);
}

function branchCurve(x1, y1, x2, y2, x3, y3, x4, y4) {
  beginShape();
  curveVertex(x1, y1);
  curveVertex(x1, y1);
  curveVertex(x2, y2);
  curveVertex(x3, y3);
  curveVertex(x4, y4);
  curveVertex(x4, y4);
  endShape();
}


function buildFlowers() {
  let baseHues = [340, 350, 0, 10];

  let pts = [
    { x: 100, y: 60 },
    { x: 120, y: 65 },
    { x: 160, y: 60 },
    { x: 135, y: 30 },
    
    { x: 200, y: 140 },
    { x: 220, y: 165 },
    { x: 240, y: 150 },
    { x: 250, y: 130 },
    
    { x: 370, y: 160 },
    { x: 360, y: 170 },
    { x: 350, y: 160 },
    { x: 340, y: 160 },
    { x: 300, y: 170 },
    { x: 300, y: 160 },
    { x: 320, y: 135 },
    { x: 340, y: 125 },
    
    { x: 260, y: 215 },
    { x: 430, y: 235 },
    { x: 400, y: 225 },
    { x: 380, y: 220 },
    
    { x: 520, y: 210 },
    { x: 510, y: 220 },
    { x: 490, y: 230 },
    { x: 520, y: 230 },
    { x: 550, y: 220 },
    { x: 580, y: 225 },

    { x: 420, y: 250 },
    { x: 500, y: 270 },
    { x: 520, y: 270 },
  ];

  for (let p of pts) {
    let clusterCount = floor(random(1, 4));

    for (let i = 0; i < clusterCount; i++) {
      let h = random(baseHues) + random(-10, 10);

      let petalOff = [];
      for (let k = 0; k < 5; k++) {
        petalOff.push({
          h: random(-4, 4),
          s: random(-2, 2),
          b: random(-2, 2)
        });
      }

      flowers.push({
        x: p.x + random(-10, 10),
        y: p.y + random(-10, 10),
        size: random(10, 20),
        hue: (h + 360) % 360,
        sat: random(16, 28),
        bri: random(94, 100),
        petalOff: petalOff
      });
    }
  }
}

function drawFlowers() {
  for (let f of flowers) {
    drawPetal(f.x, f.y, f.size, f.hue, f.sat, f.bri,
  f.petalOff );
  }
}

function drawPetal(x, y, size, hue, sat, bri, offsets) {
  push();
  translate(x, y);

  //5 petals
  for (let i = 0; i < 5; i++) {
    push();
    rotate((TWO_PI / 5) * i + 0.1);



    let off = offsets[i];

    let ph = (hue + off.h + 360) % 360;
    let ps = sat + off.s;
    let pb = bri + off.b;

    noStroke();
    fill(ph, ps, pb, 90);

    ellipse(size * 0.42, 0, size * 1.05, size * 0.75);
    ellipse(size * 0.50, 0, size * 0.75, size * 0.55);

    pop();
  }

  // pistil
  noStroke();
  let pistilH = (hue + 35 + 360) % 360;
  pistilH = map(pistilH, 0, 360, 50, 60);
  fill(pistilH, 40, 98, 90);
  ellipse(0, 0, size * 0.45, size * 0.45);

  pop();
}



class Petal {
  constructor(x, y, hue, sat, bri) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-0.4, 0.4), random(0.2, 1.0));
    this.acc = createVector(0, 0);

    this.mass = random(0.6, 1.4);
    this.size = random(10, 16);

    this.angle = random(TWO_PI);
    this.spin = random(-0.08, 0.08);

    this.life = 0;
    this.maxLife = 900;
    this.noiseOffset = random(1000);
    
    this.hue = hue;
    this.sat = sat;
    this.bri = bri;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.life++;
  }

  applyForce(f) {
    if (this.mass > 0) {
      let force = p5.Vector.div(f, this.mass);
      this.acc.add(force);
    }
  }

  checkGround(gy) {
    if (this.pos.y > gy - this.size * 0.2) {
      this.pos.y = gy - this.size * 0.2;
      this.vel.y *= -0.18;  // bounce
      this.vel.x *= 0.88;   
      if (abs(this.vel.y) < 0.10) this.vel.y = 0;
      if (abs(this.vel.x) < 0.03) this.vel.x = 0;
    }
    this.angle += this.spin + this.vel.x * 0.02;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    noStroke();
    //fill(350, 20, 100, 70); 
    fill(this.hue, this.sat, this.bri, 70);
    ellipse(0, 0, this.size * 1.2, this.size * 0.8);
    pop();
  }

  isDead() {
    return this.life > this.maxLife || this.pos.y > height + 100;
  }
}