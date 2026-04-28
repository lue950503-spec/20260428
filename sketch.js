// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];

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
      }
    }
  }
}

function windowResized() {
  // 當視窗縮放時，重新調整畫布大小使其維持全螢幕
  resizeCanvas(windowWidth, windowHeight);
}
