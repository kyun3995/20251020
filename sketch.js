// --- 圓的設定 ---
let circles = [];
const COLORS = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
const NUM_CIRCLES = 20;
// 移除自動爆破機制（永遠不自動爆破）
const AUTO_POP_CHANCE = 0; // 每個氣球每一幀自動爆破的機率（已關閉）

// 爆破粒子陣列
let explosions = [];
let popSound; // 新增：爆破音效變數
let score = 0; // 新增：分數初始值

function preload() {
  // 請將 pop.mp3 放在同一資料夾，或修改路徑為你的音檔位置
  // 需在 index.html 引入 p5.sound.js（例如：<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/addons/p5.sound.min.js"></script>）
  popSound = loadSound('pop.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 初始化圓
  initCircles();
}

function initCircles() {
  circles = [];
  for (let i = 0; i < NUM_CIRCLES; i++) {
    let base = random(COLORS);
    circles.push({
      x: random(width),
      y: random(height),
      r: random(50, 200),
      // 存原始顏色字串以便判斷與重置
      baseColor: base,
      color: color(base), 
      alpha: random(80, 255),
      speed: random(1, 5),
      isPopped: false // 新增屬性：是否已爆破
    });
  }
}

function draw() {
  // 1. 清除背景：這是必須的，才能看到動畫效果
  background('#fcf6bd');
  noStroke();
  rectMode(CENTER); // 確保 rect 模式一直設定為 CENTER

  // 左上角固定文字
  fill('#c5cbd3');
  textSize(32);
  textAlign(LEFT, TOP);
  text('414730746', 20, 10);

  // 右上角分數顯示
  fill('#c5cbd3');
  textSize(32);
  textAlign(RIGHT, TOP);
  text(score, width - 20, 10);

  // --- A. 處理氣球 (Circles) 的移動與繪製 ---
  for (let i = circles.length - 1; i >= 0; i--) {
    let c = circles[i];

    // 氣球上升
    c.y -= c.speed;

    // 自動爆破機制已關閉（不再隨機爆破）
    // if (!c.isPopped && random() < AUTO_POP_CHANCE) { ... } 已移除

    // 氣球循環邏輯 (若移出畫面或已爆破)
    if (c.y + c.r / 2 < 0 || c.isPopped) {
      // 氣球重設：從底部重新出現
      c.y = height + c.r / 2;
      c.x = random(width);
      c.r = random(50, 200);
      c.baseColor = random(COLORS);
      c.color = color(c.baseColor);
      c.alpha = random(80, 255);
      c.speed = random(1, 5);
      c.isPopped = false; // 重置爆破狀態
      // 確保已爆破的氣球不會再執行後續的繪製
      if (c.y + c.r / 2 < 0) continue; 
    }
    
    // 氣球繪製
    c.color.setAlpha(c.alpha); // 設定透明度
    fill(c.color); 
    circle(c.x, c.y, c.r); 

    // 方形點綴繪製
    let squareSize = c.r / 6;
    let angle = -PI / 4; 
    let distance = c.r / 2 * 0.65;
    let squareCenterX = c.x + cos(angle) * distance;
    let squareCenterY = c.y + sin(angle) * distance;
    fill(255, 255, 255, 120); 
    rect(squareCenterX, squareCenterY, squareSize, squareSize);
  }
  
  // --- B. 處理爆破粒子 (Explosions) 的移動與繪製 ---
  for (let i = explosions.length - 1; i >= 0; i--) {
    let exp = explosions[i];
    
    // 粒子移動
    exp.x += exp.vx;
    exp.y += exp.vy;
    
    // 粒子消逝
    exp.alpha -= 5; // 逐漸透明
    exp.r *= 0.95;  // 逐漸縮小

    // 繪製粒子
    fill(exp.color, exp.alpha);
    circle(exp.x, exp.y, exp.r);


    // 移除已消失的粒子
    if (exp.alpha <= 0 || exp.r < 1) {
      explosions.splice(i, 1);
    }
  }
}

// 偵測滑鼠點擊的事件函式 (確保您沒有拼錯函式名稱)
function mousePressed() {
  // 遍歷所有氣球，找到被點擊的那個
  for (let c of circles) {
    // 1. 計算滑鼠點擊點與氣球圓心的距離
    let d = dist(mouseX, mouseY, c.x, c.y);
    
    // 2. 判斷是否在範圍內 且 未爆破
    if (d < c.r / 2 && !c.isPopped) { 
      c.isPopped = true; // 標記為已爆破

      // 判斷顏色：若是 ffca3a 加一分，否則扣一分
      if (c.baseColor.toLowerCase() === '#ffca3a') {
        score += 1;
      } else {
        score -= 1;
      }

      createExplosion(c.x, c.y, c.baseColor); // 產生爆破粒子（傳入原始顏色字串）
      
      // 重要的優化：讓被點擊的氣球立即重置位置，避免視覺延遲
      // 氣球在下一幀 draw() 時會被重設
      c.y = height + c.r / 2; 
      
      break; // 一次只爆破一個氣球，避免重疊問題
    }
  }
}

// 產生爆破粒子效果
function createExplosion(x, y, baseColor) {
  // 播放音效（若已載入）
  if (popSound && popSound.isLoaded()) {
    popSound.setVolume(0.6);
    popSound.play();
  }

  let numParticles = random(10, 20);
  for (let i = 0; i < numParticles; i++) {
    let particleColor = color(baseColor);
    // 確保粒子有顏色
    
    explosions.push({
      x: x,
      y: y,
      r: random(5, 15),
      color: particleColor,
      alpha: 255, // 初始不透明
      vx: random(-5, 5), // 隨機水平速度 (稍微加快擴散速度)
      vy: random(-5, 5) // 隨機垂直速度
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 重新分布圓的位置
  for (let c of circles) {
    c.x = random(width);
    c.y = random(height);
  }
}