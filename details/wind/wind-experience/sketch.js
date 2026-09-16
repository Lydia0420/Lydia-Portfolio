// GUI
const Parameters = {
  growthSpeed: 0.0017,    
  windIntensity: 1.0,   
  frame: 0,      
  mouseRadius: 90,     
  mouseForce: 0.5,     
  lightRadius: 100,
  bgmVolume: 0.5,
  growVolume: 1.0,
  wireframe: false
};
let pane;

function setupGUI() {
  pane = new Pane({ title: 'GUI' });
  
  pane.addBinding(Parameters, 'frame', {
    readonly: true,
    label: 'Frame'
  });
  
  // change seepd of wheat grow
  pane.addBinding(Parameters, 'growthSpeed', {
    min: 0, max: 0.008, step: 0.0005, label: 'Growth Speed'
  });
  
  // change force of wind
  pane.addBinding(Parameters, 'windIntensity', {
    min: 0, max: 5.0, label: 'Wind Intensity'
  });
  
  
  pane.addBlade({ view: 'separator' });

  pane.addBinding(Parameters, 'mouseRadius', {
    min: 0, max: 200, label: 'Mouse Push Radius'
  });
  
  pane.addBinding(Parameters, 'mouseForce', {
    min: 0, max: 2.0, label: 'Push Force'
  });

  pane.addBinding(Parameters, 'lightRadius', {
    min: 0, max: 250, label: 'Light Radius'
  });
  
  
  pane.addBlade({ view: 'separator' }); 

  pane.addBinding(Parameters, 'bgmVolume', {
    min: 0, max: 1, step: 0.05, label: 'BGM Volume'
  }).on('change', (ev) => {
    if (bgm) bgm.setVolume(ev.value);
  });

  pane.addBinding(Parameters, 'growVolume', {
    min: 0, max: 1, step: 0.05, label: 'Grow Volume'
  }).on('change', (ev) => {
    if (greenSound) greenSound.setVolume(ev.value);
    if (yellowSound) yellowSound.setVolume(ev.value);
  });
  
  pane.addBlade({ view: 'separator' }); 
  pane.addBinding(Parameters, 'wireframe', {
    label: 'Wireframe Mode'
  });
  
pane.addButton({ title: 'Reset' }).on('click', () => {
    growth = 0; 
    isPlaying = false;   
    gPlaying = false;  //grow sound
    yPlaying = false;
    bgm.stop();        
    greenSound.stop(); // stop grow
    yellowSound.stop();
    for (let b of wheats) {
      b.growthProgress = 0; 
    }
  });
}

let wheats = []; 
let numWheats = 4500; 
let growth = 0;   //grow from 0 to 1

//sound part
let bgm;
let greenSound;
let gPlaying = false; 
//try to make the visuals match the music, synchronize the sound and canva
let startTime = 0;      // record the time of click
let isPlaying = false;  
let delayTime = 3000;   // canva start late for 3s
let yellowSound;     
let yPlaying = false; // play only once



function preload() {
  bgm = loadSound('bgm.mp3'); 
  greenSound = loadSound('g.mp3');
  yellowSound = loadSound('gTy.mp3'); 
}

function mousePressed() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }

  if (!isPlaying) {
    bgm.loop();    // loop bgm
    // bgm.setVolume(0.5);
    bgm.setVolume(Parameters.bgmVolume);
    greenSound.setVolume(Parameters.growVolume);
    yellowSound.setVolume(Parameters.growVolume);
    
    startTime = millis(); 
    isPlaying = true;
  } else {
    // bgm.pause(); 
    // isPlaying = false;
  }
}

function setup() {
  createCanvas(700, 700); 
  
  let Size = 460;
  
  for (let i = 0; i < numWheats; i++) {
    let x = random(width/2 - Size/2, width/2 + Size/2);
    let y = random((height/2 + 30) - Size/2, (height/2 + 30) + Size/2);

    wheats.push(new Wheat(x, y));
  }
    wheats.sort((a, b) => a.base.y - b.base.y);
  
    setupGUI();
}


let websiteBackground = '';
function draw() {
  //background(130, 128, 125); 
  //background(125, 115, 110);

  // gradient ramp background
  let bgColor1 = color(125, 115, 110); 
  let bgColor2 = color(110, 91, 81);  
  let bgColor3 = color(60, 50, 45);    
  let nowBgColor;

  if (growth <= 1.0) {
    let c1Progress = map(growth, 0.0, 1.0, 0, 1, true);
    nowBgColor = lerpColor(bgColor1, bgColor2, c1Progress);

  } else if (growth > 1.0 && growth <= 1.9) {
    let c2Progress = map(growth, 1.0, 1.9, 0, 1, true);
    nowBgColor = lerpColor(bgColor2, bgColor3, c2Progress);

  } else {
    nowBgColor = bgColor3;
  }
  
  if (Parameters.wireframe) {
    background(15); 
  } else {
    background(nowBgColor);
  }

  // Keep the surrounding webpage in step with the artwork, including wireframe mode.
  const pageColor = Parameters.wireframe ? 'rgb(15, 15, 15)' :
    `rgb(${nowBgColor.levels.slice(0, 3).map(Math.round).join(', ')})`;
  if (pageColor !== websiteBackground) {
    document.documentElement.style.setProperty('--field-background', pageColor);
    websiteBackground = pageColor;
  }

  
  Parameters.frame = frameRate();
  
  //growth += 0.0008;
  let elapsedTime = isPlaying ? millis() - startTime : 0;

  // after bgm play 3s, start growing
  if (isPlaying && elapsedTime > delayTime) {
    growth += Parameters.growthSpeed;

    if (growth > 0.01 && growth < 0.9) {
                                           // green wheat
      if (!gPlaying) {
        greenSound.loop();
        gPlaying = true;
      }
      // sound fade out
      let fadeVol = map(growth, 0.89, 0.9, 1.0, 0, true); 
      greenSound.setVolume(Parameters.growVolume * fadeVol);

    } else if (growth >= 0.9) {
                                          // yellow wheat

      if (gPlaying) {
        greenSound.stop();
        gPlaying = false;
      }
      
      if (!yPlaying) {
        yellowSound.play(); 
        yPlaying = true; 
      }
    }
  }

  //prevent wheat from growing at the same time
  for (let b of wheats) {
    let baseTrigger = map(b.base.y, height/2 + 270, height/2 - 170, 0, 0.7);
    if (!b.time) b.time = random(-0.05, 0.1); 
    let actualTrigger = baseTrigger + b.time;
    
    if (isPlaying && elapsedTime > delayTime) {
        if (growth > actualTrigger) {
            b.growthProgress = min(1, b.growthProgress + 0.015); 
        }
    }
    //b.growthProgress = min(1, growth);
    b.update();
    b.display();
  }
} 


class Wheat {
  constructor(x, y) {
    this.base = createVector(x, y); 
    
    this.inLen = random(5, 15);   // start length
    this.maxLen = random(30, 80); // final length
  
    this.direction = random() > 0.5 ? 1 : -1;
  
    //this.curveAngle = random(0.2, 0.8) * this.direction;
    this.maxCurve = HALF_PI; 
    this.naturalCurve = random(-0.1, 0.1); 
    this.angle = random(TWO_PI); 
    this.growthProgress = 0; 
    
    //wheat color
          // let r = random(40, 70);
          // let g = random(100, 150);
          // let b= random(40, 80); 
          // this.color = color(r, g, b);

//green wheat
    let rG, gG, bG;
    if (random() > 0.4) {            //light green
      rG = random(50, 80); 
      gG = random(110, 160); 
      bG = random(40, 60);  
    } else {                         //dark green
      rG = random(20, 50); 
      gG = random(90, 140); 
      bG = random(60, 90);  
    }
    this.greenColor = color(rG, gG, bG, random(180, 230));

    
//yellow wheat
let rY, gY, bY;
    if (random() < 0.25) {           //light yellow
      rY = random(200, 255); gY = random(205, 240); bY = random(100, 200);
    } else if (random() < 0.6) {     //middle yellow
      rY = random(210, 255); gY = random(160, 200); bY = random(0, 60);
    } else {                         //dark yellow
      rY = random(180, 240); gY = random(110, 180); bY = random(40, 60);
    }
    this.yellowColor = color(rY, gY, bY, random(190, 240));
    
    //wheat pattern
    this.spikeType = floor(random(15));
    this.spikeSize = random(8, 10);
    this.hasSpike = random() > 0.4;
  }

  update() {
    let t = this.growthProgress;
    let tEase = 1 - pow(1 - t, 3); 
  
    this.nowLen = lerp(this.inLen, this.maxLen, tEase);
    let baseCurve = lerp(this.maxCurve, this.naturalCurve, tEase);
    
    
    //wind force
    let wind = map(noise(this.base.x * 0.005, this.base.y * 0.005, frameCount * 0.015), 0, 1, -0.5, 0.5) * Parameters.windIntensity;   
    
    //sway force
    let sway = sin(frameCount * 0.05 + this.angle) * 0.12;
    
    //mouse force
    let d = dist(this.base.x, this.base.y, mouseX, mouseY);
    let mouseRadius = Parameters.mouseRadius;
    let mouseForce = 0;

    if (d < mouseRadius) {
      let influence = map(d, 0, mouseRadius, 1, 0);
      let dir = mouseX > this.base.x ? -1 : 1;
      mouseForce = influence * Parameters.mouseForce * dir;
    }
    
    //force accumulation 
    this.finalCurve = (baseCurve * this.direction) + (wind + sway + mouseForce) * tEase;

    //wheat control point
    this.tipX = this.base.x + sin(this.finalCurve) * this.nowLen;
    this.tipY = this.base.y - cos(this.finalCurve) * this.nowLen;

    let cpCurve = this.finalCurve * 0.6; 
    let cpDist = this.nowLen * 0.6; 

    this.cpX = this.base.x + sin(cpCurve) * cpDist;
    this.cpY = this.base.y - cos(cpCurve) * cpDist;
  }

  display() {
    //fill(this.color);
    let colorT = map(growth, 0.9, 1.0, 0, 1, true); //yellow wheat time
    let nowColor = lerpColor(this.greenColor, this.yellowColor, colorT);
    
    //mouse highlight
    let dx = this.base.x - mouseX;  
    let dy = (this.base.y - mouseY) / 2.0;
    let d = sqrt(dx * dx + dy * dy);

    let lightRadius = Parameters.lightRadius;
    let highlight = 0;

    if (d < lightRadius) {
      highlight = map(d, 0, lightRadius, 0.6, 0, true);
    }
    
    let strength = lerp(0.35, 1, colorT);
highlight *= strength;

    let glowColor = color(250, 238, 185, 200);
    let finalColor = lerpColor(nowColor, glowColor, highlight);

    fill(finalColor); 
    noStroke();
    
    let baseWidth = 3.5;
    let x1 = this.base.x - baseWidth / 2; //left bottom
    let x2 = this.base.x + baseWidth / 2; //right bottom
  
    
// different mode
    if (Parameters.wireframe) {
      stroke(0, 255, 100, 150); // wireframe color
      strokeWeight(0.5);
      noFill();
      beginShape();
      vertex(x1, this.base.y); 
      quadraticVertex(this.cpX - baseWidth/4, this.cpY, this.tipX, this.tipY);
      quadraticVertex(this.cpX + baseWidth/4, this.cpY, x2, this.base.y);
      endShape(CLOSE); 

      // line connect control points
      stroke(255, 50, 50, 150); 
      line(this.base.x, this.base.y, this.cpX, this.cpY);
      line(this.cpX, this.cpY, this.tipX, this.tipY);

      stroke(255); // control points color
      strokeWeight(2);
      point(this.cpX, this.cpY); 
      point(this.tipX, this.tipY);

    } else {
      fill(finalColor); 
      noStroke();
      beginShape();    //change to gentle curve
      vertex(x1, this.base.y); 
      quadraticVertex(this.cpX - baseWidth/4, this.cpY, this.tipX, this.tipY);
      quadraticVertex(this.cpX + baseWidth/4, this.cpY, x2, this.base.y);
      endShape(CLOSE); 
    }



 //draw wheat pattern   
  if (growth > 1.6 && this.hasSpike) {
    //fade in
    let spikeAlpha = map(growth, 1.6, 1.9, 0, 255, true);
      
    push(); 
    translate(this.tipX, this.tipY);           
    rotate(this.finalCurve);
      
    //color same with curve
    let r = nowColor.levels[0];
    let g = nowColor.levels[1];
    let b = nowColor.levels[2];
    stroke(r, g, b, spikeAlpha);
    strokeWeight(2);
    noFill();
      
    let s = this.spikeSize * 0.4;
    let patternType = this.spikeType;
      
    if (patternType === 0) {
      // v
      line(-s, -s*2, 0, 0);
      line(s, -s*2, 0, 0);
    } else if (patternType === 1) {
      // x
      line(-s, -s*2, s, 0);
      line(s, -s*2, -s, 0);
    } else if (patternType === 2) {
      // +
      line(0, -s*2, 0, s);
      line(-s, -s/2, s, -s/2);
    } else if (patternType === 3) {
      // rhombus
      line(0, 0, -s, -s);
      line(-s, -s, 0, -s*2);
      line(0, -s*2, s, -s);
      line(s, -s, 0, 0);
    } else if (patternType === 4) {
      // like real wheat
      line(0, 0, 0, -s*2.5); // main
      line(0, -s*1.5, -s, -s*0.5); // left
      line(0, -s*1.5, s, -s*0.5);  // right
    } else if (patternType === 5) {
      // double V
      line(-s, -s, 0, 0);
      line(s, -s, 0, 0);
      line(-s, -s*2.5, 0, -s*1.5);
      line(s, -s*2.5, 0, -s*1.5);
    } else if (patternType === 6) {
      // Z
      line(-s, 0, s, -s);
      line(s, -s, -s, -s*2);
      line(-s, -s*2, s, -s*3);
    } else if (patternType === 7) {
      // trident
      line(0, 0, 0, -s*2);
      line(0, -s, -s, -s*2.5);
      line(0, -s, s, -s*2.5);
    } else if (patternType === 8) {
      // chevron
      line(-s, -s, 0, -s*2.5);
      line(s, -s, 0, -s*2.5);
      line(0, 0, 0, -s*2.5); // middle
    } else if (patternType === 9) {
      // antenna
      line(0, 0, 0, -s*3);
      line(-s, -s, s, -s);
      line(-s*0.8, -s*2, s*0.8, -s*2);
    } else if (patternType === 10) {
      // funnel
      line(-s, -s*2, s, -s*2);
      line(-s, -s*2, 0, 0);
      line(s, -s*2, 0, 0);
    } else if (patternType === 11) {
      // asymmetric
      line(0, 0, 0, -s*2.5);
      line(0, -s, s, -s*1.5);
      line(0, -s*1.5, s*0.8, -s*2.2);
    } else if (patternType === 12) {
      // parallel
      line(-s*0.5, 0, -s*0.5, -s*2.5);
      line(s*0.5, -s*0.5, s*0.5, -s*3);
    } else if (patternType === 13) {
      // dot
      line(0, 0, 0, -s*1.5);
      circle(0, -s*2, s*0.8); 
    } else {
      // Y
      line(0, 0, 0, -s);
      line(0, -s, -s, -s*2);
      line(0, -s, s, -s*2);
    }
      
      pop();
    }
  }
}
