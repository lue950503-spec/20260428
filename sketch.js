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
        // Loop through keypoints and draw circles
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // 取得原始影片尺寸（若影片載入初期為空，則預設為 640x480）
          let vW = video.width || 640;
          let vH = video.height || 480;

          // 核心修改：將手部節點的原始座標，轉換至縮放且置中後的影像位置上
          let mappedX = offsetX + (keypoint.x / vW) * imgW;
          let mappedY = offsetY + (keypoint.y / vH) * imgH;

          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(mappedX, mappedY, 16);
        }
      }
    }
  }
}

function windowResized() {
  // 當視窗縮放時，重新調整畫布大小使其維持全螢幕
  resizeCanvas(windowWidth, windowHeight);
}
