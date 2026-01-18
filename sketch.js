// 游戏状态变量
let targetItem; // 当前需要选择的目标："radish" 或 "tissue"
let gameState;  // 游戏状态："playing" / "result" / "reward"
let resultText; // 结果提示文字

// 音频变量
let correctSound;   // 正确提示音：真棒.MP3
let wrongSound;     // 错误提示音：哼唧.MP3
let radishSound;    // 萝卜提示音：萝卜.MP3
let tissueSound;    // 纸巾提示音：纸巾.MP3
let rewardSound;    // 奖励音效：喂食成功.MP3

// 图片变量
let radishImg;      // 萝卜图片：萝卜.png
let tissueImg;      // 纸巾图片：纸巾.png
let catImg;         // 默认猫咪图片：猫.png
let leftCatImg;     // 左指向猫咪图片：左.png
let rightCatImg;    // 右指向猫咪图片：右.png
let freezeDriedImg; // 冻干图片：冻干.png
let feedSuccessImg; // 喂食成功的猫咪图片：喂食成功.png

// 物品位置和尺寸（作为固定宽度，高度按比例计算）
let radishPos, tissuePos;
let itemSize = 90;  // 萝卜/纸巾尺寸
let catSize = 200;  // 猫咪图片固定宽度
let catCenter;      // 猫咪中心坐标（用于碰撞检测）
let currentCatImg;  // 当前显示的猫咪图片（动态切换用）

// 冻干相关变量
let freezeDriedPos; // 冻干实时位置（拖动时变化）
let freezeDriedInitPos; // 冻干初始位置（固定不变）
let freezeDriedSize = 80; // 冻干固定宽度
let isDragging = false; // 是否正在拖动冻干
let showFreezeDried = false; // 是否显示冻干

function preload() {
  // 加载音频
  correctSound = loadSound('真棒.MP3');
  wrongSound = loadSound('哼唧.MP3'); 
  radishSound = loadSound('萝卜.MP3');
  tissueSound = loadSound('纸巾.MP3');
  rewardSound = loadSound('喂食成功.MP3');
  
  // 加载图片
  radishImg = loadImage('萝卜.png');
  tissueImg = loadImage('纸巾.png');
  catImg = loadImage('猫.png');
  leftCatImg = loadImage('左.png');
  rightCatImg = loadImage('右.png');
  freezeDriedImg = loadImage('冻干.png');
  feedSuccessImg = loadImage('喂食成功.png');
}

function setup() {
  createCanvas(600, 700); 
  
  // 猫咪中心位置
  catCenter = createVector(width/2, height/2 - 20);
  
  // 初始化物品位置
  randomizeItemPositions();
  
  // 初始化冻干初始位置
  freezeDriedInitPos = createVector(width/2, height/2 + 120 + 45 + 30);
  freezeDriedPos = freezeDriedInitPos.copy(); // 实时位置初始化为初始位置
  
  // 初始显示默认猫咪图
  currentCatImg = catImg;
  
  // 初始化游戏状态
  resetGame();
}

function draw() {
  // 背景设置
  background(255, 245, 240);
  
  // 绘制标题和指令UI
  drawGameUI();
  
  // 动态更新当前猫咪图片
  updateCatImage();
  
  // 绘制猫咪图片
  drawCat();
  
  // 绘制萝卜和纸巾
  drawRadish();
  drawTissue();
  
  // 显示结果反馈
  if (gameState === "result") {
    drawResult();
  }
  
  // 显示冻干奖励
  if (gameState === "reward" && showFreezeDried) {
    drawFreezeDried();
  }
}

// 绘制游戏标题和指令UI
function drawGameUI() {
  // 1. 绘制标题
  fill(60);
  textSize(32);
  textAlign(CENTER, TOP);
  text("萝卜纸巾猫小游戏", width/2, 30);
  
  // 2. 指令文字相关配置
  let instruction = targetItem === "radish" ? "选萝卜" : "选纸巾"; 
  const textY = 120; 
  const textSizeVal = 28;
  
  // 3. 绘制指令文字框
  // 计算文字框尺寸和位置
  const boxWidth = 200;
  const boxHeight = 60;
  const boxX = width/2 - boxWidth/2;
  const boxY = textY - 10;
  
  // 设置文字框
  if (targetItem === "radish") {
    fill(255, 140, 0, 100); 
    stroke(200, 100, 0);
  } else {
    fill(173, 216, 230, 200);
    stroke(100, 149, 237);
  }
  strokeWeight(2);
  rect(boxX, boxY, boxWidth, boxHeight, 20);
  noStroke();
  
  // 4. 绘制指令文字
  fill(60); 
  textSize(textSizeVal);
  textAlign(CENTER, CENTER);
  text(instruction, width/2, boxY + boxHeight/2);
}

// 动态更新猫咪图片
function updateCatImage() {
  if (gameState !== "playing") {
    return;
  }
  
  // 检测鼠标悬停的物品
  const leftItemX = Math.min(radishPos.x, tissuePos.x);
  const isHoverLeftItem = dist(mouseX, mouseY, leftItemX, radishPos.y) < itemSize/2;
  const rightItemX = Math.max(radishPos.x, tissuePos.x);
  const isHoverRightItem = dist(mouseX, mouseY, rightItemX, radishPos.y) < itemSize/2;
  
  // 切换图片
  if (isHoverLeftItem) {
    currentCatImg = leftCatImg;
  } else if (isHoverRightItem) {
    currentCatImg = rightCatImg;
  } else {
    currentCatImg = catImg;
  }
}

// 绘制猫咪图片
function drawCat() {
  // 按比例计算猫咪高度
  let catImgHeight = currentCatImg.height * (catSize / currentCatImg.width);
  let catX = catCenter.x - catSize/2;
  let catY = catCenter.y - catImgHeight/2;
  image(currentCatImg, catX, catY, catSize, catImgHeight);
}

// 绘制萝卜
function drawRadish() {
  let radishImgHeight = radishImg.height * (itemSize / radishImg.width);
  let radishX = radishPos.x - itemSize/2;
  let radishY = radishPos.y - radishImgHeight/2;
  image(radishImg, radishX, radishY, itemSize, radishImgHeight);
  
  // 悬停效果
  if (gameState === "playing" && dist(mouseX, mouseY, radishPos.x, radishPos.y) < itemSize/2) {
    strokeWeight(4);
    stroke(255, 215, 0);
    noFill();
    ellipse(radishPos.x, radishPos.y, itemSize + 10, radishImgHeight + 10);
    noStroke();
  }
}

// 绘制纸巾
function drawTissue() {
  let tissueImgHeight = tissueImg.height * (itemSize / tissueImg.width);
  let tissueX = tissuePos.x - itemSize/2;
  let tissueY = tissuePos.y - tissueImgHeight/2;
  image(tissueImg, tissueX, tissueY, itemSize, tissueImgHeight);
  
  // 悬停效果
  if (gameState === "playing" && dist(mouseX, mouseY, tissuePos.x, tissuePos.y) < itemSize/2) {
    strokeWeight(4);
    stroke(255, 215, 0);
    noFill();
    rect(tissuePos.x - itemSize/2 - 5, tissuePos.y - tissueImgHeight/2 - 5, itemSize + 10, tissueImgHeight + 10, 15);
    noStroke();
  }
}

// 显示结果反馈
function drawResult() {
  let boxWidth = 320;
  let boxHeight = 120;
  let boxX = width/2 - boxWidth/2;
  let boxY = height/2 - boxHeight/2;
  
  // 背景色
  if (resultText === "蒸蚌！") {
    fill(76, 175, 80, 200);
  } else {
    fill(244, 67, 54, 200);
  }
  stroke(255);
  strokeWeight(2);
  rect(boxX, boxY, boxWidth, boxHeight, 30);
  noStroke();
  
  // 文字
  fill(255);
  textSize(48);
  textAlign(CENTER, CENTER);
  text(resultText, width/2, height/2);
}

// 绘制冻干奖励 + 文字
function drawFreezeDried() {
  // 计算冻干高度，保持比例
  let freezeDriedImgHeight = freezeDriedImg.height * (freezeDriedSize / freezeDriedImg.width);
  let freezeDriedX = freezeDriedPos.x - freezeDriedSize/2;
  let freezeDriedY = freezeDriedPos.y - freezeDriedImgHeight/2;
  image(freezeDriedImg, freezeDriedX, freezeDriedY, freezeDriedSize, freezeDriedImgHeight);
  
  // 绘制文字
  fill(139, 69, 19); 
  textSize(24);      
  textAlign(CENTER, TOP); 
  text("奖励给聪明小猫", width/2, freezeDriedInitPos.y + freezeDriedImgHeight/2 + 20);
  
  // 冻干悬停效果
  if (!isDragging && dist(mouseX, mouseY, freezeDriedPos.x, freezeDriedPos.y) < freezeDriedSize/2) {
    strokeWeight(3);
    stroke(255, 165, 0);
    noFill();
    rect(freezeDriedPos.x - freezeDriedSize/2 - 3, freezeDriedPos.y - freezeDriedImgHeight/2 - 3, freezeDriedSize + 6, freezeDriedImgHeight + 6, 10);
    noStroke();
    cursor(HAND);
  } else if (!isDragging) {
    cursor(ARROW);
  }
}

// 鼠标点击检测
function mousePressed() {
  if (gameState === "playing") {
    if (dist(mouseX, mouseY, radishPos.x, radishPos.y) < itemSize/2) {
      checkAnswer("radish");
    } else if (dist(mouseX, mouseY, tissuePos.x, tissuePos.y) < itemSize/2) {
      checkAnswer("tissue");
    }
  }
  
  if (gameState === "reward" && showFreezeDried) {
    if (dist(mouseX, mouseY, freezeDriedPos.x, freezeDriedPos.y) < freezeDriedSize/2) {
      isDragging = true;
      cursor(MOVE);
    }
  }
}

// 鼠标拖动逻辑
function mouseDragged() {
  if (isDragging) {
    freezeDriedPos.x = mouseX;
    freezeDriedPos.y = mouseY;
  }
}

// 鼠标释放逻辑
function mouseReleased() {
  if (isDragging) {
    isDragging = false;
    cursor(ARROW);
    
    let d = dist(freezeDriedPos.x, freezeDriedPos.y, catCenter.x, catCenter.y);
    if (d < catSize/2) {
      rewardSound.stop();
      setTimeout(() => {
        rewardSound.play();
      }, 50);
      
      currentCatImg = feedSuccessImg;
      showFreezeDried = false;
      setTimeout(() => {
        resetGame();
      }, 800);
    }
  }
}

// 检查答案是否正确
function checkAnswer(selected) {
  gameState = "result";
  if (selected === targetItem) {
    resultText = "蒸蚌！"; 
    stopAllSounds();
    correctSound.stop();
    correctSound.onended(handleCorrectSoundEnd);
    setTimeout(() => {
      correctSound.play();
    }, 50);
  } else {
    resultText = "再试试～";
    stopAllSounds();
    wrongSound.stop();
    wrongSound.onended(handleWrongSoundEnd);
    setTimeout(() => {
      wrongSound.play();
    }, 50);
  }
}

// 正确音频结束逻辑
function handleCorrectSoundEnd() {
  gameState = "reward";
  showFreezeDried = true;
  // 重置冻干实时位置和初始位置
  freezeDriedInitPos = createVector(width/2, height/2 + 120 + 45 + 30);
  freezeDriedPos = freezeDriedInitPos.copy();
}

// 错误音频结束逻辑
function handleWrongSoundEnd() {
  gameState = "playing";
  resultText = "";
}

// 随机调换萝卜纸巾位置
function randomizeItemPositions() {
  const yPos = height/2 + 120; 
  if (random() > 0.5) {
    radishPos = createVector(width/2 + 100, yPos);
    tissuePos = createVector(width/2 - 100, yPos);
  } else {
    radishPos = createVector(width/2 - 100, yPos);
    tissuePos = createVector(width/2 + 100, yPos);
  }
}

// 重置游戏
function resetGame() {
  randomizeItemPositions();
  const randomSound = random() > 0.5 ? radishSound : tissueSound;
  targetItem = randomSound === radishSound ? "radish" : "tissue";
  stopAllSounds();
  setTimeout(() => {
    randomSound.play();
  }, 100);
  gameState = "playing";
  resultText = "";
  showFreezeDried = false;
  isDragging = false;
  currentCatImg = catImg;
}

// 停止所有音频
function stopAllSounds() {
  correctSound.stop();
  wrongSound.stop();
  radishSound.stop();
  tissueSound.stop();
  rewardSound.stop();
}