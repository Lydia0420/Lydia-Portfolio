let params = {
  depth: 1,
  size: 100,
  scale: 0.5,   //how the sub-pattern distribute
  offset: 0.38,
  rotation: 0.2,
  lineWeight: 2,
  space: 170,
  animate: true
};

let gui;  //pane

function setup() {
  const canvas = createCanvas(700, 700);
  canvas.parent('canvas-frame');
  angleMode(RADIANS);
  rectMode(CENTER);
  setupGui();
}

function draw() {
  background(255, 235, 204);

  let cols = 5;
  let rows = 5;
  // let space = 170;

  let startX = width / 2 - ((cols - 1) *  params.space) / 2;
  let startY = height / 2 - ((rows - 1) *  params.space) / 2;

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let x = startX + i *  params.space;
      let y = startY + j *  params.space;

      push();
      translate(x, y);
      //translate(width / 2, height / 2);
      
      
      if ((i + j) % 2 == 0) {
        rotate(PI / 4);
      }
        drawFractalP(0, 0, params.size, params.depth);
      pop();
    }
  }
}

function drawFractalP(x, y, s, depth) {
  push();
  translate(x, y);
  
  let rot = 0;
  if (params.animate) {
    rot = sin(frameCount * 0.02 + s * 0.01) * params.rotation;
  }
  rotate(rot);
  
  drawMainP(s, depth);
  pop();

  if (depth > 0 && s > 12) {
    let newSize = s * params.scale;
    let offset = s * params.offset;

    drawFractalP(x - offset, y - offset, newSize, depth - 1);
    drawFractalP(x + offset, y - offset, newSize, depth - 1);
    drawFractalP(x - offset, y + offset, newSize, depth - 1);
    drawFractalP(x + offset, y + offset, newSize, depth - 1);
  }
}


function drawMainP(s, depth) {   //main pattern
  stroke(70, 45, 30);
  strokeWeight(params.lineWeight);
  noFill();

  // rhombus
  beginShape();
  vertex(0, -s * 0.28);
  vertex(s * 0.28, 0);
  vertex(0, s * 0.28);
  vertex(-s * 0.28, 0);
  endShape(CLOSE);

  // circle
  fill(70, 45, 30);
  noStroke();
  circle(0, 0, s * 0.06);

  // petal
  noFill();
  stroke(70, 45, 30);
  strokeWeight(params.lineWeight);

  ellipse(0, -s * 0.16, s * 0.16, s * 0.24);
  ellipse(s * 0.16, 0, s * 0.24, s * 0.16);
  ellipse(0, s * 0.16, s * 0.16, s * 0.24);
  ellipse(-s * 0.16, 0, s * 0.24, s * 0.16);

  if (depth % 2 == 0) {
    line(-s * 0.10, 0, s * 0.10, 0);
    line(0, -s * 0.10, 0, s * 0.10);
  } else {
    noStroke();
    fill(70, 45, 30);
    circle(0, -s * 0.30, s * 0.035);
    circle(s * 0.30, 0, s * 0.035);
    circle(0, s * 0.30, s * 0.035);
    circle(-s * 0.30, 0, s * 0.035);
  }
}

function setupGui() {
  if (!window.Tweakpane || !window.Tweakpane.Pane) {
    console.log("Tweakpane failed to load");
    return;
  }
  
  gui = new window.Tweakpane.Pane();

  gui.addInput(params, "depth", {
    min: 1, max: 5, step: 1
  });

  gui.addInput(params, "size", {
    min: 60, max: 160, step: 1
  });

  gui.addInput(params, "scale", {
    min: 0.35, max: 0.65, step: 0.01
  });

  gui.addInput(params, "offset", {
    min: 0.20, max: 0.55, step: 0.01
  });

  gui.addInput(params, "rotation", {
    min: 0, max: 0.6, step: 0.01
  });

  gui.addInput(params, "lineWeight", {
    min: 1, max: 5, step: 0.5
  });

  gui.addInput(params, "space", {
    min: 120, max: 220, step: 1
  });

  gui.addInput(params, "animate");
}
