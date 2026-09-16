let yOff = 0;  //time offset
let stars = [];
let starNum = 300;

function setup() {
  const canvas = createCanvas(600, 600);
canvas.parent('canvas-frame');
  colorMode(HSB, 360, 100, 100, 100);
  
  //star
  for (let i = 0; i < starNum; i++) {
    let x = round(random(width));
    let y = round(random(height));

    let level = floor(random(4));        
    let r = ceil(lerp(1, 3, level / 3));     // radius

    let b = lerp(40, 95, level / 3);         // brightness
    let a = lerp(20, 60, level / 3);         // alpha
    a = constrain(a, 15, 70);

    stars.push({ x, y, r, b, a });
  }
}

function draw() {
  background(0, 0, 0);
  
  // star
  noStroke();
  for (let p of stars) {
    let blink = map(
      sin(frameCount * 0.03 + p.x * 0.02 + p.y * 0.02),
      -1, 1,
      0.6, 1.2
    );

    let hue = 210;
    let sat = 8;   // saturation
    let bri = constrain(p.b * blink, 0, 100);
    let alp = constrain(p.a * blink, 0, 60);

    fill(hue, sat, bri, alp);
    ellipse(p.x, p.y, p.r, p.r);

    // tiny cross 
    if (p.r >= 3) {
      stroke(hue, 6, bri, 25);
      strokeWeight(1);
      line(p.x - 4, p.y, p.x + 4, p.y);
      line(p.x, p.y - 4, p.x, p.y + 4);
      noStroke();
    }
  }
  
  //butterfly
  translate(width / 2, height / 2);

  let angle = PI / 200;
  let noiseX = 0.05;
  let layers = 12;
  
  for (let i = 0; i < layers; i++) {
  let t = i / (layers - 1);
  let s = map(t, 0, 1, 0.4, 1.6);
      //stroke((t * 260 + frameCount * 0.2) % 360, 35, 100, 80);
      //fill((t * 260 + 40) % 360, 40, 100, 20);
      fill(330 + t * 8, 25, 100, 18);
    let Hue = (15 + t * 60 + frameCount * 0.2) % 360;
      stroke(Hue, 35, 100, 80);
      strokeWeight(1);
    
    push();      
    scale(s);  
    
    rotate(t * 0.6 + frameCount * 0.003);
    
  let xOff = 0;  // noise offset

  beginShape();
  for (let a = 0; a <= TWO_PI; a += angle) {
    let n = noise(xOff, yOff + t * 0.2);
    let r = sin(2 * a) * map(n, 0, 1, 50, 300);
      r = constrain(r, -320, 320);
    
    let x = r * cos(a);
    let y = r * sin(a);

    if (a < PI) {
      xOff += noiseX;
    }else {
      xOff -= noiseX;
    }
    vertex(x, y);
  }
  endShape(CLOSE);
  
    pop();    
}
  
  yOff += 0.01;
}

