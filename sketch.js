// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let bubbles = []; // 新增用來儲存水泡的陣列

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  // 第一步驟：產生全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  // 設定背景顏色為 e7c6ff
  background('#e7c6ff');

  // 在畫布左上方加上文字
  fill(0); // 黑色文字
  noStroke();
  textSize(32);
  textAlign(LEFT, TOP);
  text("414730936 陸柏安", 20, 20);

  // 取得畫布 50% 的寬高，並計算使其置中的 X, Y 偏移量
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  let offsetX = width / 2 - imgW / 2;
  let offsetY = height / 2 - imgH / 2;

  // 將攝影機影像顯示在視窗中間
  image(video, offsetX, offsetY, imgW, imgH);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 取得原始影片尺寸（若影片載入初期為空，則預設為 640x480）
        let vW = video.width || 640;
        let vH = video.height || 480;

        // 預先計算所有轉換後的節點座標
        let mappedPoints = [];
        for (let i = 0; i < hand.keypoints.length; i++) {
          let kp = hand.keypoints[i];
          mappedPoints.push({
            x: offsetX + (kp.x / vW) * imgW,
            y: offsetY + (kp.y / vH) * imgH
          });
        }

        // 畫出手指骨架連線
        stroke(0, 255, 0); // 設定連線為綠色
        strokeWeight(3);
        let connections = [
          [0, 1, 2, 3, 4],    // 拇指
          [5, 6, 7, 8],       // 食指
          [9, 10, 11, 12],    // 中指
          [13, 14, 15, 16],   // 無名指
          [17, 18, 19, 20]    // 小指
        ];
        
        for (let conn of connections) {
          for (let j = 0; j < conn.length - 1; j++) {
            let pA = mappedPoints[conn[j]];
            let pB = mappedPoints[conn[j + 1]];
            line(pA.x, pA.y, pB.x, pB.y);
          }
        }

        // Loop through keypoints and draw circles
        for (let i = 0; i < hand.keypoints.length; i++) {
          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(mappedPoints[i].x, mappedPoints[i].y, 16);
        }

        // 產生水泡 (指尖節點：4, 8, 12, 16, 20)
        let fingertips = [4, 8, 12, 16, 20];
        for (let idx of fingertips) {
          // 控制水泡產生的頻率，例如每幀每根手指有 10% 機率產生水泡
          if (random(1) < 0.1) {
            bubbles.push(new Bubble(mappedPoints[idx].x, mappedPoints[idx].y));
          }
        }
      }
    }
  }

  // 更新與繪製所有水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    // 當水泡達到條件（壽命結束或飛出畫面）時，將其從陣列中移除（破掉）
    if (bubbles[i].isPopped()) {
      bubbles.splice(i, 1);
    }
  }
}

function windowResized() {
  // 當視窗縮放時，重新調整畫布大小使其維持全螢幕
  resizeCanvas(windowWidth, windowHeight);
}

// 建立水泡（Bubble）類別
class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(10, 25); // 隨機水泡大小
    this.speed = random(2, 5);  // 隨機上升速度
    this.lifespan = 255;        // 壽命（用於透明度，慢慢消失代表破掉）
  }

  update() {
    this.y -= this.speed;          // 往上串升
    this.x += random(-1.5, 1.5);   // 增加一點左右飄動的自然感
    this.lifespan -= random(2, 5); // 逐漸減少壽命
  }

  display() {
    stroke(255, this.lifespan); // 白色外框，隨壽命變透明
    strokeWeight(2);
    fill(173, 216, 230, this.lifespan * 0.5); // 淺藍色半透明填充
    circle(this.x, this.y, this.size);
  }

  isPopped() {
    return this.lifespan <= 0 || this.y < 0; // 壽命結束或超出畫面頂端時破掉
  }
}
