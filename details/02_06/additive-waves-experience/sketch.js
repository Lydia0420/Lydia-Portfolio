let bg; //music
let fft;
let mountains = [];
const layers = 6; 

let palettes = [
  { 
    name: "Ink mountains",
    bg: [240, 238, 233], sun: [200, 60], 
    mFar: [200, 200, 200, 150], mNear: [40, 40, 40, 200] 
  },
  { 
    name: "dark blue",
    bg: [15, 15, 25], sun: [255, 0, 128, 150], 
    mFar: [0, 255, 255, 120], mNear: [138, 43, 226, 180] 
  },
  { 
    name: "warm orange",
    bg: [255, 120, 80], sun: [255, 230, 100, 200], 
    mFar: [255, 50, 100, 180], mNear: [20, 10, 50, 220] 
  },
  { 
    name: "grayish yellow",
    bg: [230, 200, 150], sun: [200, 40, 40, 180], 
    mFar: [200, 120, 60, 160], mNear: [20, 60, 60, 220] 
  },
  { 
    name: "blood red",
    bg: [160, 20, 20], sun: [255, 255, 255, 220], 
    mFar: [200, 200, 200, 120], mNear: [10, 10, 10, 240] 
  },
  { 
    name: "midnight blue",
    bg: [5, 10, 25], sun: [0, 255, 200, 120], 
    mFar: [20, 40, 100, 150], mNear: [50, 255, 120, 180] 
  },
  { 
    name: "light purple",
    bg: [230, 220, 255], sun: [255, 180, 180, 200], 
    mFar: [150, 240, 220, 160], mNear: [100, 120, 240, 200] 
  },
  { 
    name: "obsidian gold",
    bg: [20, 20, 22], sun: [255, 190, 50, 200], 
    mFar: [180, 140, 50, 160], mNear: [10, 10, 10, 240] 
  },
  { 
    name: "traditional green",
    bg: [220, 230, 220], sun: [255, 100, 80, 200], 
    mFar: [100, 200, 180, 160], mNear: [20, 60, 100, 220] 
  },
  { 
    name: "cobalt blue",
    bg: [245, 248, 250], sun: [200, 40, 40, 180],
    mFar: [120, 160, 220, 150], mNear: [10, 30, 100, 220]
  }
];
let currentP = 0;


function preload() {
  bg = loadSound('qingmeng.mp3');
}

function setup() {
  const canvas = createCanvas(700, 700);
  canvas.parent('canvas-frame');
  
  fft = new p5.FFT(0.8, 64);
  fft.setInput(bg);

  for (let i = 0; i < layers; i++) {
    mountains.push(new Mountain(i, layers));
  }
}

function draw() {
  let p = palettes[currentP];
  background(p.bg);
  
  let spectrum = fft.analyze();

  //sun
  noStroke();
  fill(p.sun);
  circle(width * 0.7, height * 0.3, 220);


  
  for (let m of mountains) {
    m.update();
    m.display(spectrum, p);
  }

  //screen prompt
  if (!bg.isPlaying()) {
    fill(100);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("Click the screen to play！", width / 2, 30);
    text("Press ANY KEY to change color^^", width / 2, 50);
  }
}

//user interaction
function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    if (bg.isPlaying()) {
      bg.pause(); 
    } else {
      bg.play(); 
    }
  }
}

//change color
function keyPressed() {
  currentP = (currentP + 1) % palettes.length;
}

class Mountain {
  constructor(layerIndex, totalLayers) {
    this.depth = layerIndex;    //record on which floor
    this.timeX = random(1000);  //each layer of the mountain'shape different
    this.speed = map(layerIndex, 0, totalLayers, 0.002, 0.006);
    
    //reference line for mountain
    this.originY = map(layerIndex, 0, totalLayers, height * 0.40, height * 0.90);
    this.totalLayers = totalLayers;
  }

  update() {
    if (bg.isPlaying()) {
      this.timeX += this.speed;
    }
  }

  display(spectrum, p) {
    push(); 
    translate(0, this.originY); 

    //gradient color
    let c1 = color(...p.mFar); 
    let c2 = color(...p.mNear);
    let t = map(this.depth, 0, this.totalLayers, 0, 1);
    let layerColor = lerpColor(c1, c2, t);
    
    fill(layerColor);
    noStroke();
    
    beginShape();
    vertex(0, height - this.originY); 

    for (let x = 0; x <= width; x += 5) {
      let angle = map(x, 0, width, 0, PI);
      let fade = pow(sin(angle), 3); 
      
      //undulations of each layer mountain different
      let n = noise(x * 0.005 + this.timeX, this.depth);
      let noiseWave = map(n, 0, 1, -150, 150); 
      let sineWave = sin(x * 0.02 + frameCount * 0.02) * 30;
      let totalWave = (noiseWave + sineWave) * fade;
      
      //music
      // let specIndex = floor(map(x, 0, width, 0, spectrum.length / 2));
      // let audioVal = spectrum[specIndex];
      //let bounce = map(audioVal, 0, 255, 0, map(this.depth, 0, layers, 20, 150));
      let specIndex = map(x, 0, width, 0, spectrum.length / 2);
      let index1 = floor(specIndex);                       // now
      let index2 = min(index1 + 1, spectrum.length - 1);    // next
      let fraction = specIndex - index1;                   
      let audioVal = lerp(spectrum[index1], spectrum[index2], fraction);
      
      // 下面的计算保持不变
      let maxBounce = map(this.depth, 0, layers, 20, 200);
      let bounce = map(audioVal, 0, 255, 0, maxBounce);
      bounce *= fade;

      //final point
      let finalY = totalWave - bounce;
      
      vertex(x, finalY);
    }

    vertex(width, height - this.originY);
    endShape(CLOSE);
    
    pop(); 
  }
}