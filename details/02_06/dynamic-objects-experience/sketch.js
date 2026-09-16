let inc = 0.1;
let scl = 10;
let cols, rows;
let zoff = 0;
let particles = [];
let flowfield;


function setup() {
  const canvas = createCanvas(600, 600);
  canvas.parent('canvas-frame');
  cols = floor(width / scl);
  rows = floor(height / scl);
  flowfield = new Array(cols * rows);
  for (let i = 0; i < 3000; i++) particles[i] = new Particle();
  background(0);
}

function draw() {
  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let angle = noise(xoff, yoff, zoff) * TWO_PI * 4;
      let v = p5.Vector.fromAngle(angle);
      flowfield[x + y * cols] = v;
      xoff += inc;
    }
    yoff += inc;
  }
  zoff += 0.002;    // time shift

  for (let p of particles) {
    p.follow(flowfield, cols, scl);   // apply force 
    p.update();
    p.show();
  }
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));  // position
    this.vel = createVector(0, 0);                      // velocity
    this.acc = createVector(0, 0);                      // acceleration
    this.h = random(255);
    this.h += random(-0.3, 0.3);
    this.maxSpeed = random(1.5, 2);
  }
  follow(f, cols, scl) {
    let x = floor(this.pos.x / scl);
    let y = floor(this.pos.y / scl);
    let force = f[x + y * cols];
      this.acc.add(force);   //
  }
  update() {
    this.vel.add(this.acc).limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);  
    this.vel.mult(0.97);
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y > height) this.pos.y = 0;
  }
  show() {
    stroke(this.h, random(60, 120), random(140, 220), 35);
    strokeWeight(1);
    point(this.pos.x, this.pos.y);
  }
}