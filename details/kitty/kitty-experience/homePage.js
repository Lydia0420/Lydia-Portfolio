/* defines everything related to the Home Page only.
kitty drawing (use grid data & block class)
mic blush interaction
face expression switch when click pot space
home page canvas creation
initial UI setup entry point (setupUI is in ui.js)
*/

function setupStartPage() {
  loadHighScores();   // ⭐ 启动时读取历史最高分
  mic = new p5.AudioIn();
  // Voice interaction is enabled explicitly from the website toolbar.
  
  // before enter
  canvasDiv = createDiv().addClass("main");
  canvas = createCanvas(W * blockSize, H * blockSize);
  canvas.parent(canvasDiv);
  canvasDiv.style("position", "relative"); 
  

  colorMap = [ color(255, 240, 250) ];    // 0 bg
    colorMap.push(color(205, 170, 125));  // 1 brown
    colorMap.push(color(159, 130, 101));  // 2 dark brown
    colorMap.push(color(110, 61, 50));  // 3 eye
    colorMap.push(color(249, 215, 73));  // 4 noise
    colorMap.push(color(255, 224, 225));  // 5 blusher
    colorMap.push(color(242, 133, 184));  // 6bowknot
    colorMap.push(color(217, 89, 159));  // 7dark pink 
    colorMap.push(color(143, 141, 141));  // 8grey1
    colorMap.push(color(113, 121, 119));  // 9grey2  
    colorMap.push(color(204, 204, 204));  // 10grey3 
    colorMap.push(color(151, 157, 162));  // 11grey4
    colorMap.push(color(156, 161, 156));  // 12grey5
    colorMap.push(color(209, 215, 209));  // 13grey6
    colorMap.push(color(231, 188, 139));  // 14pot
    colorMap.push(color(242, 141, 53));  // 15orange
    colorMap.push(color(247, 208, 82));  // 16yellow1
    colorMap.push(color(252, 195, 33));  // 17yellow2
    colorMap.push(color(245, 171, 192));  // 18caot
    colorMap.push(color(247, 215, 225));  // 19underwear
    colorMap.push(color(205, 210, 211));  // 20cooking hat
    colorMap.push(color(255, 255, 255));  // 21egg
  
  // initial grid 
  gridData = [];
  for (let i = 0; i < H; i++) {
    let newRow = [];
    for (let j = 0; j < W; j++) {
      newRow.push(0);
    }
    gridData.push(newRow);
  }
  
  loadKittyPixelData();

  // Create all the squares based on the grid data
  allBlocks = [];
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      let idx = gridData[r][c];
      let col = colorMap[idx];
      allBlocks.push(new Block(c * blockSize, r * blockSize, blockSize, col));
    }
  }
  changeFace();
    setupUI();
  setupEndUI();  
}

function loadKittyPixelData() {
  // brown
    gridData[10][18] = 1;  
    gridData[10][19] = 1;  
    gridData[10][20] = 1; 
    gridData[11][29] = 1; 
    gridData[11][30] = 1; 
    gridData[12][31] = 1; 
    gridData[13][31] = 1;  
    gridData[10][19] = 1;  
    gridData[11][17] = 1; 
    gridData[12][17] = 1; 
    gridData[13][17] = 1; 
    gridData[14][17] = 1; 
    gridData[11][21] = 1; 
    gridData[15][16] = 1; 
    gridData[16][16] = 1; 
    gridData[18][16] = 1; 
    gridData[20][16] = 1; 
    gridData[21][17] = 1; 
    gridData[22][18] = 1; 
    gridData[22][19] = 1; 
    gridData[23][20] = 1; 
    gridData[23][21] = 1; 
    gridData[23][22] = 1; 
    gridData[23][23] = 1; 
    gridData[23][24] = 1; 
    gridData[23][25] = 1;
    gridData[23][26] = 1; 
    gridData[23][27] = 1; 
    gridData[23][28] = 1; 
    gridData[23][29] = 1;
    gridData[22][30] = 1; 
    gridData[22][31] = 1; 
    gridData[20][32] = 1; 
    gridData[18][32] = 1; 
    gridData[17][32] = 1; 
    gridData[24][16] = 1; 
    gridData[24][17] = 1; 
    gridData[25][18] = 1; 
    gridData[26][18] = 1; 
    gridData[27][16] = 1; 
    gridData[27][17] = 1; 
    gridData[32][19] = 1; 
    gridData[33][19] = 1; 
    gridData[34][20] = 1; 
    gridData[34][21] = 1; 
    gridData[34][22] = 1; 
    gridData[34][24] = 1; 
    gridData[34][25] = 1; 
    gridData[34][26] = 1; 
    gridData[34][27] = 1; 
    gridData[33][23] = 1; 
    gridData[33][28] = 1; 
    gridData[30][26] = 1; 
    gridData[30][27] = 1; 
    gridData[28][25] = 1;
    gridData[29][25] = 1;
    gridData[27][26] = 1;
    gridData[29][28] = 1;
  
  // dark brown
    gridData[17][15] = 2;
    gridData[17][16] = 2;
    gridData[17][17] = 2;
    gridData[19][15] = 2;
    gridData[19][16] = 2;
    gridData[19][17] = 2;
    gridData[19][30] = 2;
    gridData[19][31] = 2;
    gridData[19][32] = 2;
    gridData[19][33] = 2;
    gridData[21][16] = 2;
    gridData[22][15] = 2;
    gridData[21][30] = 2;
    gridData[21][31] = 2;
    gridData[21][32] = 2;
    gridData[23][30] = 2;
    gridData[23][31] = 2;
    gridData[22][29] = 2;
  
  // eyes
    gridData[18][19] = 3;
    gridData[19][19] = 3;
    gridData[20][25] = 3;
    gridData[20][26] = 3;

  //noise
    gridData[20][22] = 4;
  
  //blusher
    gridData[19][18] = 5;
    gridData[20][18] = 5;
    gridData[20][19] = 5;
    gridData[20][27] = 5;
    gridData[21][27] = 5;
    gridData[21][26] = 5;
  
  //bowknot  
    gridData[13][24] = 6;
    gridData[14][24] = 6;
    gridData[14][27] = 6;
    gridData[15][27] = 6;
    gridData[13][28] = 6;
    gridData[12][28] = 6;
    gridData[14][29] = 6;
    gridData[15][29] = 6;
    gridData[16][32] = 6;
    gridData[15][32] = 6;
    gridData[16][28] = 6;
    gridData[17][28] = 6;
    gridData[11][26] = 6;
    gridData[11][27] = 6;
    gridData[15][25] = 6;
    gridData[15][26] = 6;
    gridData[15][27] = 6;
    gridData[14][29] = 6;
    gridData[14][30] = 6;
    gridData[14][31] = 6;
    gridData[12][25] = 6;
    gridData[18][29] = 6;
    gridData[18][30] = 6;
    gridData[17][31] = 6;
  
    gridData[24][22] = 6;
    gridData[25][22] = 6;
    gridData[24][24] = 6;
    gridData[26][21] = 6;
    gridData[25][14] = 6;
    gridData[25][15] = 6;
    gridData[25][24] = 6;
  
  //dark pink
    gridData[24][21] = 7;
    gridData[25][21] = 7;
    gridData[24][23] = 7;
    gridData[25][23] = 7;
    gridData[26][24] = 7;
    gridData[24][25] = 7;
  
    gridData[26][4] = 7;
    gridData[27][5] = 7;
    gridData[28][6] = 7;
    gridData[28][7] = 7;
    gridData[28][8] = 7;
    gridData[28][9] = 7;
    gridData[28][10] = 7;
    gridData[28][11] = 7;
    gridData[27][12] = 7;
    gridData[26][14] = 7;
    gridData[26][15] = 7;
    gridData[26][16] = 7;
    gridData[26][17] = 7;
  
  //grey1
    gridData[21][6] = 8;
    gridData[21][7] = 8;
    gridData[21][8] = 8;
    gridData[21][9] = 8;
    gridData[21][10] = 8;
    gridData[21][11] = 8;
    gridData[23][4] = 8;
    gridData[24][4] = 8;
    gridData[23][13] = 8;
    gridData[24][13] = 8;
    gridData[22][5] = 8;
    gridData[22][12] = 8;
 
  //grey2
    gridData[22][6] = 9;
    gridData[22][7] = 9;
    gridData[22][8] = 9;
    gridData[22][9] = 9;
    gridData[22][10] = 9;
    gridData[22][11] = 9;
    gridData[23][5] = 9;
    gridData[23][12] = 9;
  
 //grey3
    gridData[23][6] = 10;
    gridData[23][7] = 10;
    gridData[24][5] = 10;
    gridData[24][12] = 10;
    gridData[23][11] = 10;
    gridData[25][12] = 10;
    gridData[26][11] = 10;
    gridData[26][5] = 10;
    gridData[27][8] = 10;
    gridData[27][9] = 10;

 //grey4
    gridData[25][4] = 11;
    gridData[27][6] = 11;
    gridData[27][7] = 11;
    gridData[27][11] = 11;
    gridData[27][10] = 11;
    gridData[26][12] = 11;
  
 //grey5 & 6
    gridData[26][13] = 12;
    gridData[25][13] = 13;
  
 //pot
    gridData[25][5] = 14;
    gridData[26][6] = 14;
    gridData[25][11] = 14;
    gridData[26][10] = 14;
  
 //orange
    gridData[24][7] = 15;
    gridData[25][8] = 15;
    gridData[25][9] = 15;
  
 //yellow1
    gridData[24][8] = 16;
  
 //yellow2
    gridData[24][9] = 17;
  
 //egg
    gridData[24][6] = 21;
    gridData[25][6] = 21;
    gridData[25][7] = 21;
    gridData[23][8] = 21;
    gridData[23][9] = 21;
    gridData[23][10] = 21;
    gridData[24][10] = 21;
    gridData[24][11] = 21;
    gridData[25][10] = 21;
    gridData[26][7] = 21;
    gridData[26][8] = 21;
    gridData[26][9] = 21;
  
 //coat
    gridData[24][18] = 18;
    gridData[24][19] = 18;
    gridData[24][20] = 18;
    gridData[27][18] = 18;
    gridData[27][19] = 18;
    gridData[31][19] = 18;
    gridData[31][20] = 18;
    gridData[32][21] = 18;
    gridData[32][22] = 18;
    gridData[32][23] = 18;
    gridData[32][24] = 18;
    gridData[32][25] = 18;
    gridData[32][26] = 18;
    gridData[32][27] = 18;
    gridData[32][28] = 18;
    gridData[25][20] = 18;
    gridData[26][20] = 18;
    gridData[28][19] = 18;
    gridData[29][19] = 18;
    gridData[30][19] = 18;
    gridData[27][22] = 18;
    gridData[29][22] = 18;
    gridData[31][22] = 18;
    gridData[27][24] = 18;
    gridData[29][24] = 18;
    gridData[31][24] = 18;
    gridData[26][27] = 18;
    gridData[27][27] = 18;
    gridData[26][29] = 18;
    gridData[25][29] = 18;
    gridData[27][30] = 18;
    gridData[28][30] = 18;
    gridData[24][28] = 18;
    gridData[28][28] = 18;
    gridData[29][29] = 18;
    gridData[30][29] = 18;
    gridData[31][29] = 18;
  
    gridData[13][25] = 18;
    gridData[14][25] = 18;
    gridData[12][26] = 18;
    gridData[13][26] = 18;
    gridData[14][26] = 18;
    gridData[12][27] = 18;
    gridData[13][27] = 18;
    gridData[17][29] = 18;
    gridData[16][29] = 18;
    gridData[15][30] = 18;
    gridData[16][30] = 18;
    gridData[17][30] = 18;
    gridData[15][31] = 18;
    gridData[16][31] = 18;
    gridData[15][28] = 18;
    gridData[14][28] = 18;
  
 //underwear
    gridData[25][19] = 19;
    gridData[26][19] = 19;
    gridData[25][25] = 19;
    gridData[26][25] = 19;
    gridData[27][25] = 19;
    gridData[24][26] = 19;
    gridData[25][26] = 19;
    gridData[26][26] = 19;
    gridData[24][27] = 19;
    gridData[25][27] = 19;
    gridData[25][28] = 19;
    gridData[26][28] = 19;
    gridData[27][28] = 19;
    gridData[27][29] = 19;
    gridData[28][29] = 19;
    gridData[26][22] = 19;
    gridData[26][23] = 19;
    gridData[27][20] = 19;
    gridData[28][20] = 19;
    gridData[29][20] = 19;
    gridData[30][20] = 19;
    gridData[27][21] = 19;
    gridData[28][21] = 19;
    gridData[29][21] = 19;
    gridData[30][21] = 19;
    gridData[31][21] = 19;
    gridData[30][22] = 19;
    gridData[28][22] = 19;
    gridData[27][23] = 19;
    gridData[28][23] = 19;
    gridData[29][23] = 19;
    gridData[30][23] = 19;
    gridData[31][23] = 19;
    gridData[30][24] = 19;
    gridData[28][24] = 19;
    gridData[30][25] = 19;
    gridData[31][25] = 19;
    gridData[31][26] = 19;
    gridData[31][27] = 19;
    gridData[31][28] = 19;
    gridData[30][28] = 19;
  
 //cooking cap
    gridData[4][23] = 20;
    gridData[4][24] = 20;
    gridData[4][25] = 20;
    gridData[4][26] = 20;
    gridData[4][27] = 20;
    gridData[4][28] = 20;
    gridData[4][29] = 20;
    gridData[6][21] = 20;
    gridData[7][21] = 20;
    gridData[5][22] = 20;
    gridData[8][22] = 20;
    gridData[10][22] = 20;
    gridData[11][22] = 20;
    gridData[9][23] = 20;
    gridData[11][23] = 20;
    gridData[7][24] = 20;
    gridData[9][24] = 20;
    gridData[12][24] = 20;
    gridData[5][25] = 20;
    gridData[8][25] = 20;
    gridData[9][25] = 20;
    gridData[10][26] = 20;
    gridData[10][27] = 20;
    gridData[10][28] = 20;
    gridData[10][29] = 20;
    gridData[5][30] = 20;
    gridData[8][30] = 20;
    gridData[6][31] = 20;
    gridData[7][32] = 20;
    gridData[8][33] = 20;
    gridData[9][34] = 20;
    gridData[10][34] = 20;
    gridData[11][34] = 20;
    gridData[11][32] = 20;
    gridData[11][33] = 20;
}

class Block {
  constructor(x, y, size, col) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.col = col;
  }

    drawBlock() {
    noStroke();
    fill(this.col);
    rect(this.x, this.y, this.size, this.size);
  }
}

// change expression
function changeFace() {
  clearEyes();

  if (eggSizzle) {
        // wink
    gridData[18][19] = 3;
    gridData[19][19] = 3;
    gridData[20][25] = 3;
    gridData[20][26] = 3;


  } else {
        // normal eyes
    gridData[18][19] = 3;
    gridData[19][19] = 3;
    gridData[19][26] = 3;
    gridData[20][26] = 3;
  }
}

function clearEyes() {
  let eyeSpots = [[18,19], [19,19], [20,25], [20,26], [19,26]];
  for (let spot of eyeSpots) {
    if (gridData[spot[0]] && gridData[spot[0]][spot[1]] !== undefined) {
      gridData[spot[0]][spot[1]] = 0;
    }
  }
}

function drawStartPage() {
  if (!allBlocks.length) return;

  // background(255, 240, 250);
  
    //mic
    let vol = mic.getLevel(); 
    textSize(12);
    fill(0);
    textAlign(CENTER, TOP); 
  text("Mic Level: " + nf(vol, 1, 3), width/2, height - 20);

  
    //blush
    let blushColor = lerpColor(
      color(255, 224, 225),   // low voice 
      color(242, 133, 184),   // high
      constrain(vol * 5, 0, 1) 
    );
    colorMap[5] = blushColor;
  
  for (let i = 0; i < allBlocks.length; i++) {
    let r = Math.floor(i / W);
    let c = i % W;
    let idx = gridData[r][c];

    allBlocks[i].col = colorMap[idx];
    allBlocks[i].x = c * blockSize;
    allBlocks[i].y = r * blockSize;
    allBlocks[i].drawBlock(); 
  }
}
