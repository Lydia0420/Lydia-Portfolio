class Point {
  constructor(x, y, isFixed = false) {
    this.pos = createVector(x, y); // position
    this.vel = createVector(0, 0); // velocity
    this.acc = createVector(0, 0); // acceleration
    this.mass = 2;                 // mass
    this.damping = 0.96;           // friction
    this.isFixed = isFixed;        // fixed points both ends
    this.radius = 12;              // size
  }

  // receive external forces 
  addForce(force) {
    if (!this.isFixed) { 
      let f = p5.Vector.div(force, this.mass);
      this.acc.add(f);
    }
  }

  update() {
    if (!this.isFixed) {
      this.vel.add(this.acc);      
      this.vel.mult(this.damping); 
      this.pos.add(this.vel);     
      this.acc.mult(0);            
    }
  }

  drawEye(scale = 1.0) {
    noStroke();
    fill(255); 
    let r = this.radius * 3 * scale;
    circle(this.pos.x, this.pos.y, r * 2);

    //pupil shifts with the drag velocity
    fill(20, 20, 40); 
    let pupilOffset = p5.Vector.mult(this.vel, 3.0); 
    pupilOffset.limit(r * 0.4); 
    circle(this.pos.x + pupilOffset.x, this.pos.y + pupilOffset.y, r * 1.0);
  }
}


// spring
class Spring {
  constructor(k, restLength, a, b, drawLine = false) {
    this.k = k;                   //how strong the spring is
    this.restLength = restLength; //natural length
    this.a = a;                   //point start
    this.b = b;                   //end
    this.drawLine = drawLine;     //smile line
  }

  update() {
    //the current dis between a&b, compare with the default length
    let force = p5.Vector.sub(this.b.pos, this.a.pos);
    let currentLength = force.mag();
    let stretch = currentLength - this.restLength;
  
    //add force to both a&b
    force.normalize();
    force.mult(this.k * stretch);
    this.a.addForce(force);
    force.mult(-1);
    this.b.addForce(force);
  }
  
  display() {
    if (this.drawLine) {
      stroke(0, 180, 255);        //line color
      strokeWeight(6); 
      line(this.a.pos.x, this.a.pos.y, this.b.pos.x, this.b.pos.y);
    }
  }
}

let points = []; 
let springs = [];
let dragPoint = null; 



// music
let bg;
let filter;
let audioPlay = false;


function preload() {
  bg = loadSound('w6music.mp3'); 
}

function setup() {
  const canvas = createCanvas(700, 700);
  canvas.parent('canvas-frame');

  let numMouthPoints = 7;
  let startMouthX = 180;
  let endMouthX = width - 180;
  let mouthSpacing = (endMouthX - startMouthX) / (numMouthPoints - 1);
  let mouthY = height / 2 + 50;

  //create 7 points
  for (let i = 0; i < numMouthPoints; i++) {
    let isFixed = (i === 0 || i === numMouthPoints - 1);
    
    points.push(new Point(startMouthX + i * mouthSpacing, mouthY, isFixed));
  }
  
  //connect the points end to end with six springs
  for (let i = 0; i < numMouthPoints - 1; i++) {
    springs.push(new Spring(0.2, mouthSpacing, points[i], points[i+1], true));
  }

  //eyes
  let eyeY = height / 2 - 100;
  let eyeOffset = 100;
  points.push(new Point(width / 2 - eyeOffset, eyeY)); // left
  points.push(new Point(width / 2 + eyeOffset, eyeY)); // right
  
  springs.push(new Spring(0.05, 100, points[7], points[8]));
  springs.push(new Spring(0.3, 150, points[3], points[7])); 
  springs.push(new Spring(0.3, 150, points[3], points[8]));

  springs.push(new Spring(0.1, dist(points[0].pos.x, points[0].pos.y, points[7].pos.x, points[7].pos.y), points[0], points[7])); 
  springs.push(new Spring(0.1, dist(points[6].pos.x, points[6].pos.y, points[8].pos.x, points[8].pos.y), points[6], points[8])); 
  
  
//music setting
  filter = new p5.LowPass(); 
  bg.disconnect(); 
  bg.connect(filter);
}

  
function draw() {
  background(20);
  
  points[7].drawEye(); 
  points[8].drawEye();
  
  // Physical cal
  for (let s of springs) 
    s.update();
  for (let b of points) 
    b.update();
  
  
if (bg.isPlaying()) {
    let centerMouth = points[3]; 
    let defaultY = height / 2 + 50; // mouse rest height
  
  //displacement control music speed
    let playbackSpeed = map(centerMouth.pos.y, defaultY + 150, defaultY - 100, 0.4, 1.5, true);
    bg.rate(playbackSpeed);
  
  
    //mouth down sound slower and deeper, push it up sound faster and sharper
    let displacement = abs(centerMouth.pos.y - defaultY); 
    let clarity = map(displacement, 0, 150, 22000, 400, true);
    filter.freq(clarity);
  }
  
  for (let s of springs) 
    s.display(); 
  points[7].drawEye();          // left
  points[8].drawEye();          // right
  
// hint text
  fill(255, 150);
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);
  
  if (!audioPlay) {
    text("Click anywhere to play Audio", width / 2, height - 40);
  } else {
    text("Drag any point to change expression :D", width / 2, height - 40);
  }
  
  //mouse drag
    if (dragPoint) {
    dragPoint.pos.x = mouseX;
    dragPoint.pos.y = mouseY;
  }
}

//interaction
function mousePressed() {
  
  if (!audioPlay) {
      userStartAudio();
      bg.loop();
      audioPlay = true;
  }
  
  let minDist = Infinity;
  for (let b of points) {
    if (!b.isFixed) {     //only points not fixed can be drag
      let d = dist(mouseX, mouseY, b.pos.x, b.pos.y);
      if (d < 45 && d < minDist) {
        minDist = d;
        dragPoint = b;
      }
    }
  }
}

function mouseReleased() {
  dragPoint = null; 
}