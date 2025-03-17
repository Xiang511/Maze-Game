// 生成 0 到 max-1 之間的隨機整數
function rand(max) {
  return Math.floor(Math.random() * max);
}

// 洗牌函數，用於隨機打亂數組
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 調整圖片亮度的函數
function changeBrightness(factor, sprite) {
  var virtCanvas = document.createElement("canvas");
  virtCanvas.width = 500;
  virtCanvas.height = 500;
  var context = virtCanvas.getContext("2d");
  context.drawImage(sprite, 0, 0, 500, 500);

  var imgData = context.getImageData(0, 0, 500, 500);

  for (let i = 0; i < imgData.data.length; i += 4) {
    imgData.data[i] = imgData.data[i] * factor; // 調整紅色通道
    imgData.data[i + 1] = imgData.data[i + 1] * factor; // 調整綠色通道
    imgData.data[i + 2] = imgData.data[i + 2] * factor; // 調整藍色通道
  }
  context.putImageData(imgData, 0, 0);

  var spriteOutput = new Image();
  spriteOutput.src = virtCanvas.toDataURL();
  virtCanvas.remove();
  return spriteOutput;
}

// 顯示勝利訊息的函數
function displayVictoryMess(moves) {
  document.getElementById("moves").innerHTML = "You Moved " + moves + " Steps."; // 顯示玩家移動的步數
  toggleVisablity("Message-Container"); // 切換訊息容器的可見性
}

// 切換元素可見性的函數
function toggleVisablity(id) {
  let element = document.getElementById(id);
  element.style.display = "block";  // 讓它顯示
  element.style.visibility = "visible";
}

let fogEnabled = false; // 是否開啟迷霧
let fogImage = new Image(); // 迷霧圖片
fogImage.src = "./fog.jpg";

// this.visionRadius = 1; // 預設玩家視野範圍（對應 3×3，之後可修改, 0為1*1，2為5*5以此類推）

// 迷宮生成函數
function Maze(Width, Height) {
  var mazeMap;
  var width = Width;
  var height = Height;
  var startCoord, endCoord;
  var dirs = ["n", "s", "e", "w"];
  var modDir = {
    n: {
      y: -1,
      x: 0,
      o: "s"
    },
    s: {
      y: 1,
      x: 0,
      o: "n"
    },
    e: {
      y: 0,
      x: 1,
      o: "w"
    },
    w: {
      y: 0,
      x: -1,
      o: "e"
    }
  };

  this.map = function () {
    return mazeMap;
  };
  this.startCoord = function () {
    return startCoord;
  };
  this.endCoord = function () {
    return endCoord;
  };

  // 生成迷宮地圖
  function genMap() {
    mazeMap = new Array(height);
    for (y = 0; y < height; y++) {
      mazeMap[y] = new Array(width);
      for (x = 0; x < width; ++x) {
        mazeMap[y][x] = {
          n: false,
          s: false,
          e: false,
          w: false,
          visited: false,
          priorPos: null
        };
      }
    }
  }

  // 定義迷宮結構
  function defineMaze() {
    var isComp = false;
    var move = false;
    var cellsVisited = 1;
    var numLoops = 0;
    var maxLoops = 0;
    var pos = {
      x: 0,
      y: 0
    };
    var numCells = width * height;
    while (!isComp) {
      move = false;
      mazeMap[pos.x][pos.y].visited = true;

      if (numLoops >= maxLoops) {
        shuffle(dirs);
        maxLoops = Math.round(rand(height / 8));
        numLoops = 0;
      }
      numLoops++;
      for (index = 0; index < dirs.length; index++) {
        var direction = dirs[index];
        var nx = pos.x + modDir[direction].x;
        var ny = pos.y + modDir[direction].y;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          // 檢查該格子是否已被訪問
          if (!mazeMap[nx][ny].visited) {
            // 從當前格子向下一格打通牆壁
            mazeMap[pos.x][pos.y][direction] = true;
            mazeMap[nx][ny][modDir[direction].o] = true;

            // 設置當前格子為下一格的前一格
            mazeMap[nx][ny].priorPos = pos;
            // 更新當前位置為新訪問的位置
            pos = {
              x: nx,
              y: ny
            };
            cellsVisited++;
            // 遞迴調用此方法
            move = true;
            break;
          }
        }
      }

      if (!move) {
        // 如果找不到方向，將當前位置移回前一格並重新調用此方法
        pos = mazeMap[pos.x][pos.y].priorPos;
      }
      if (numCells == cellsVisited) {
        isComp = true;
      }
    }
  }

  // 定義起點和終點
  function defineStartEnd() {
    switch (rand(4)) {
      case 0:
        startCoord = {
          x: 0,
          y: 0
        };
        endCoord = {
          x: height - 1,
          y: width - 1
        };
        break;
      case 1:
        startCoord = {
          x: 0,
          y: width - 1
        };
        endCoord = {
          x: height - 1,
          y: 0
        };
        break;
      case 2:
        startCoord = {
          x: height - 1,
          y: 0
        };
        endCoord = {
          x: 0,
          y: width - 1
        };
        break;
      case 3:
        startCoord = {
          x: height - 1,
          y: width - 1
        };
        endCoord = {
          x: 0,
          y: 0
        };
        break;
    }
  }

  genMap();
  defineStartEnd();
  defineMaze();
}

// 繪製迷宮的函數
function DrawMaze(Maze, ctx, cellsize, endSprite = null) {
  var map = Maze.map();
  var cellSize = cellsize;
  var drawEndMethod;
  ctx.lineWidth = cellSize / 40;

  // 重新繪製迷宮
  this.redrawMaze = function (size) {
    cellSize = size;
    ctx.lineWidth = cellSize / 50;
    drawMap();
    this.drawEndMethod();
  };
  this.drawEndMethod = drawEndSprite;
  this.eventPositions = [];  // 存放事件位置

  // 繪製事件
  this.drawEvents = function (numEvents, eventImage) {

    // 先清除畫布上的舊事件
    clear();

    // 重新畫迷宮，避免清除事件時影響牆壁等元素
    drawMap();
    this.drawEndMethod();

    this.eventPositions = [];
    let availableCells = [];

    // 收集所有可用的格子(排除起點和終點)
    for (let x = 0; x < map.length; x++) {
      for (let y = 0; y < map[x].length; y++) {
        if (!(x === maze.startCoord().x && y === maze.startCoord().y) &&
          !(x === maze.endCoord().x && y === maze.endCoord().y)) {
          availableCells.push({ x, y });
        }
      }
    }

    // 隨機選擇 numEvents 個位置
    shuffle(availableCells);
    this.eventPositions = availableCells.slice(0, numEvents);

    // 在迷宮畫上事件 (骰子)
    this.eventPositions.forEach(pos => {
      ctx.drawImage(eventImage, pos.x * cellSize, pos.y * cellSize, cellSize, cellSize);
    });

    console.log("🎲 事件位置: ", this.eventPositions);

    // 重新畫出玩家起始位置
    if (player) {
      player.redrawPlayer(cellSize);
      this.drawEndMethod();
    }
  };

  // 迷霧模式
  this.applyFog = function () {
    if (!player) return; // 確保 player 存在

    let endCoord = Maze.endCoord(); // 取得終點座標

    // 先清除終點的迷霧
    ctx.clearRect(endCoord.x * cellSize, endCoord.y * cellSize, cellSize, cellSize);

    for (let x = 0; x < map.length; x++) {
      for (let y = 0; y < map[x].length; y++) {
        // 確保終點 & 起點不被迷霧覆蓋
        if (!player.isInPlayerVision(x, y) && !(x === endCoord.x && y === endCoord.y)) {
          ctx.drawImage(fogImage, x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    // 重新畫終點
    this.drawEndMethod();

    // 重新畫玩家
    if (player) {
      player.redrawPlayer(cellSize);
    }
  }

  // 重新繪製迷宮，清除所有迷霧
  this.clearFog = function () {
    console.log("🔍 清除迷霧並重繪迷宮");

    // 清空整個畫布
    ctx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);

    // 重新繪製迷宮
    draw.redrawMaze(cellSize);

    // 重新繪製事件
    if (draw.eventPositions.length > 0) {
      let diceImg = new Image();
      diceImg.src = "./dice.png";
      diceImg.onload = function () {
        // 使用已有的事件位置，而不是隨機生成
        draw.eventPositions.forEach(pos => {
          ctx.drawImage(diceImg, pos.x * cellSize, pos.y * cellSize, cellSize, cellSize);
        });
      };
    }

    // 確保玩家仍然可見
    if (player) {
      player.redrawPlayer(cellSize);
    }
  };

  // 繪製單個格子
  function drawCell(xCord, yCord, cell) {
    var x = xCord * cellSize;
    var y = yCord * cellSize;

    if (cell.n == false) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cellSize, y);
      ctx.stroke();
    }
    if (cell.s === false) {
      ctx.beginPath();
      ctx.moveTo(x, y + cellSize);
      ctx.lineTo(x + cellSize, y + cellSize);
      ctx.stroke();
    }
    if (cell.e === false) {
      ctx.beginPath();
      ctx.moveTo(x + cellSize, y);
      ctx.lineTo(x + cellSize, y + cellSize);
      ctx.stroke();
    }
    if (cell.w === false) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + cellSize);
      ctx.stroke();
    }
  }

  // 繪製迷宮地圖
  function drawMap() {
    for (x = 0; x < map.length; x++) {
      for (y = 0; y < map[x].length; y++) {
        drawCell(x, y, map[x][y]);
      }
    }
  }

  // 繪製終點旗幟
  function drawEndFlag() {
    var coord = Maze.endCoord();
    var gridSize = 4;
    var fraction = cellSize / gridSize - 2;
    var colorSwap = true;
    for (let y = 0; y < gridSize; y++) {
      if (gridSize % 2 == 0) {
        colorSwap = !colorSwap;
      }
      for (let x = 0; x < gridSize; x++) {
        ctx.beginPath();
        ctx.rect(
          coord.x * cellSize + x * fraction + 4.5,
          coord.y * cellSize + y * fraction + 4.5,
          fraction,
          fraction
        );
        if (colorSwap) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        }
        ctx.fill();
        colorSwap = !colorSwap;
      }
    }
  }

  // 繪製終點圖片
  function drawEndSprite() {
    var offsetLeft = cellSize / 50;
    var offsetRight = cellSize / 25;
    var coord = Maze.endCoord();
    ctx.drawImage(
      endSprite,
      2,
      2,
      endSprite.width,
      endSprite.height,
      coord.x * cellSize + offsetLeft,
      coord.y * cellSize + offsetLeft,
      cellSize - offsetRight,
      cellSize - offsetRight
    );
  }

  // 清除畫布
  function clear() {
    var canvasSize = cellSize * map.length;
    ctx.clearRect(0, 0, canvasSize, canvasSize);
  }

  clear();
  drawMap();
  this.drawEndMethod();
}

var mazeCanvas = document.getElementById("mazeCanvas"); // 取得迷宮畫布元素
var ctx = mazeCanvas.getContext("2d"); // 取得畫布的 2D 繪圖上下文
var sprite; // 玩家角色圖片
var finishSprite; // 終點圖片
var maze, draw, player; // 迷宮、繪圖和玩家物件
var cellSize; // 每個格子的大小
var difficulty; // 迷宮難度
// sprite.src = 'media/sprite.png';

window.onload = function () {
  // 設定畫布的寬度和高度
  let viewWidth = $("#view").width();
  let viewHeight = $("#view").height();
  if (viewHeight < viewWidth) {
    ctx.canvas.width = viewHeight - viewHeight / 100;
    ctx.canvas.height = viewHeight - viewHeight / 100;
  } else {
    ctx.canvas.width = viewWidth - viewWidth / 100;
    ctx.canvas.height = viewWidth - viewWidth / 100;
  }

  // 加載並編輯精靈圖片
  var completeOne = false;
  var completeTwo = false;
  var isComplete = () => {
    if (completeOne === true && completeTwo === true) {
      // console.log("Runs");
      setTimeout(function () {
        makeMaze();
      }, 500);
    }
  };
  sprite = new Image();
  sprite.src =
    "./key.png" +
    "?" +
    new Date().getTime();
  sprite.setAttribute("crossOrigin", " ");
  sprite.onload = function () {
    sprite = changeBrightness(1.2, sprite);
    completeOne = true;
    // console.log(completeOne);
    isComplete();
  };

  finishSprite = new Image();
  finishSprite.src = "./home.png" +
    "?" +
    new Date().getTime();
  finishSprite.setAttribute("crossOrigin", " ");
  finishSprite.onload = function () {
    finishSprite = changeBrightness(1.1, finishSprite);
    completeTwo = true;
    // console.log(completeTwo);
    isComplete();
  };

};

// 當視窗大小改變時，重新調整畫布大小和迷宮格子大小
window.onresize = function () {
  let viewWidth = $("#view").width();
  let viewHeight = $("#view").height();
  if (viewHeight < viewWidth) {
    ctx.canvas.width = viewHeight - viewHeight / 100;
    ctx.canvas.height = viewHeight - viewHeight / 100;
  } else {
    ctx.canvas.width = viewWidth - viewWidth / 100;
    ctx.canvas.height = viewWidth - viewWidth / 100;
  }
  cellSize = mazeCanvas.width / difficulty;
  if (player != null) {
    draw.redrawMaze(cellSize); // 重新繪製迷宮
    player.redrawPlayer(cellSize); // 重新繪製玩家
  }
};

// 生成迷宮的函數
function makeMaze() {
  if (player != undefined) {
    player.unbindKeyDown(); // 解除玩家的鍵盤事件綁定
    player = null; // 清空玩家物件
  }
  var e = document.getElementById("diffSelect"); // 取得難度選擇元素
  difficulty = e.options[e.selectedIndex].value; // 取得選擇的難度值
  cellSize = mazeCanvas.width / difficulty; // 計算每個格子的大小
  maze = new Maze(difficulty, difficulty); // 生成新的迷宮
  draw = new DrawMaze(maze, ctx, cellSize, finishSprite); // 繪製迷宮
  player = new Player(maze, mazeCanvas, cellSize, displayVictoryMess, sprite); // 初始化玩家
  if (document.getElementById("mazeContainer").style.opacity < "100") {
    document.getElementById("mazeContainer").style.opacity = "100"; // 設定迷宮容器的透明度
  }
}

var pathHistory = [];  // 記錄路徑

document.getElementById("record-checkbox").addEventListener("change", function () {
  player.toggleRecord(this.checked);
  console.log("🔴 記錄移動路徑:", this.checked);
});

var recordPath = false;  // 全域變數，控制是否記錄移動路徑
var isReplaying = false; // 全域變數，標記是否正在進行回放



function Player(maze, c, _cellsize, onComplete, sprite = null) {
  // 取得畫布的 2D 繪圖上下文
  var ctx = c.getContext("2d");
  // 記錄玩家移動的步數
  var moves = 0;
  // 將當前 Player 物件賦值給 player 變數
  var player = this;
  // 取得迷宮地圖
  var map = maze.map();
  // 設定玩家的初始座標為迷宮的起點座標
  var cellCoords = {
    x: maze.startCoord().x,
    y: maze.startCoord().y
  };

  this.cellCoords = cellCoords; // 🔹 提供方法來取得座標
  console.log("📌 player 初始化時的 cellCoords: ", this.cellCoords);

  // 設定格子大小和半格大小
  var cellSize = _cellsize;
  var halfCellSize = cellSize / 2;
  recordPath = false;  // 是否記錄
  var fixedRecordPoint = null; // **存放開啟記錄時的位置**
  var canPassThroughWalls = false; // 是否啟用穿牆模式


  // 根據是否有提供精靈圖片來決定繪製方法
  var drawSprite = sprite ? drawSpriteImg : drawSpriteCircle;

  this.getCellCoords = function () {  // 🔹 提供方法來取得座標
    return cellCoords;
  };



  // 繪製圓形精靈的函數
  function drawSpriteCircle(coord) {
    ctx.beginPath();
    ctx.fillStyle = "yellow"; // 設定填充顏色為黃色
    ctx.arc(
      (coord.x + 1) * cellSize - halfCellSize,
      (coord.y + 1) * cellSize - halfCellSize,
      halfCellSize - 2,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // 如果玩家到達終點，顯示勝利訊息並解除鍵盤事件綁定
    if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
      onComplete(moves);
      player.unbindKeyDown();
    }
  }

  // 繪製圖片精靈的函數
  function drawSpriteImg(coord) {
    var offsetLeft = cellSize / 50;
    var offsetRight = cellSize / 25;
    ctx.drawImage(
      sprite,
      0,
      0,
      sprite.width,
      sprite.height,
      coord.x * cellSize + offsetLeft,
      coord.y * cellSize + offsetLeft,
      cellSize - offsetRight,
      cellSize - offsetRight
    );
    // 如果玩家到達終點，顯示勝利訊息並解除鍵盤事件綁定
    if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
      onComplete(moves);
      player.unbindKeyDown();
    }
  }

  // 移除精靈圖片的函數
  this.removeSprite = function (coord) {
    var offsetLeft = cellSize / 50;
    var offsetRight = cellSize / 25;
    ctx.clearRect(
      coord.x * cellSize + offsetLeft,
      coord.y * cellSize + offsetLeft,
      cellSize - offsetRight,
      cellSize - offsetRight
    );
  };

  // 檢查指定座標是否在玩家視野範圍內的函數
  this.isInPlayerVision = function (x, y) {
    let px = player.cellCoords.x;
    let py = player.cellCoords.y;
    return (x >= px - 1 && x <= px + 1) && (y >= py - 1 && y <= py + 1);
  }
  console.log("player:", player);
  // console.log("isInPlayerVision:", player.isInPlayerVision(cellCoords.x, cellCoords.y));

  // 更新迷霧的函數
  this.updateFog = function (playerX, playerY) {
    if (!fogEnabled) return;

    let px = cellCoords.x;
    let py = cellCoords.y;
    let visionSize = 1; // 🔹 使用玩家的視野範圍
    let startCoord = maze.startCoord(); // 🔹 取得起點座標
    let endCoord = maze.endCoord();

    // 🔹 **清除 `visionSize × visionSize` 的可視範圍內迷霧**
    for (let dx = -visionSize; dx <= visionSize; dx++) {
      for (let dy = -visionSize; dy <= visionSize; dy++) {
        let nx = px + dx;
        let ny = py + dy;
        if (isValidCoord(nx, ny)) {
          ctx.clearRect(nx * cellSize, ny * cellSize, cellSize, cellSize);
        }
      }
    }

    // 🔹 **確保起點不被迷霧覆蓋**
    ctx.clearRect(startCoord.x * cellSize, startCoord.y * cellSize, cellSize, cellSize);

    // 🔹 **重新繪製視野內的迷宮線條**
    draw.redrawMaze(cellSize); // ✅ 直接使用 redrawMaze()，確保迷宮線條仍然可見

    // 🔹 **對 `visionSize × visionSize` 視野範圍外的格子重新覆蓋迷霧**
    for (let x = 0; x < map.length; x++) {
      for (let y = 0; y < map[x].length; y++) {
        if (
          !((x >= px - visionSize && x <= px + visionSize) &&
            (y >= py - visionSize && y <= py + visionSize)) && // **視野外**
          !(x === startCoord.x && y === startCoord.y) // **不是起點**
        ) {
          ctx.drawImage(fogImage, x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    // 🔹 **先清除終點的迷霧**
    ctx.clearRect(maze.endCoord().x * cellSize, maze.endCoord().y * cellSize, cellSize, cellSize);

    // 🔹 **確保事件只有在 `visionSize × visionSize` 內才會顯示**
    draw.eventPositions.forEach(pos => {
      if ((pos.x >= px - visionSize && pos.x <= px + visionSize) &&
        (pos.y >= py - visionSize && pos.y <= py + visionSize)) {
        let eventImage = new Image();
        eventImage.src = "./dice.png"; // 事件圖片
        eventImage.onload = function () {
          ctx.drawImage(eventImage, pos.x * cellSize, pos.y * cellSize, cellSize, cellSize);
        };
      }
    });

    // 🔹 **重新畫終點**
    draw.drawEndMethod();

    // 🔹 **重新畫玩家**
    if (player) {
      player.redrawPlayer(cellSize);
    }
  }

  // 檢查座標是否有效的函數
  function isValidCoord(x, y) {
    return x >= 0 && x < map.length && y >= 0 && y < map[0].length;
  }

  function movePlayer(dx, dy) {
    var newCoords = { x: cellCoords.x + dx, y: cellCoords.y + dy };

    var cell = map[cellCoords.x][cellCoords.y];
    if (!canPassThroughWalls) {
      // 檢查是否可以移動到新座標，若不能則返回
      if ((dx === -1 && !cell.w) || (dx === 1 && !cell.e) ||
      (dy === -1 && !cell.n) || (dy === 1 && !cell.s)) {
      return;
      }
    } else {
      // 檢查玩家是否已經穿過牆壁
      if (player.hasPassedThroughWall) {
      if ((dx === -1 && !cell.w) || (dx === 1 && !cell.e) ||
        (dy === -1 && !cell.n) || (dy === 1 && !cell.s)) {
        return;
      }
      } else {
      // 標記玩家已經穿過牆壁
      if ((dx === -1 && !cell.w) || (dx === 1 && !cell.e) ||
        (dy === -1 && !cell.n) || (dy === 1 && !cell.s)) {
        player.hasPassedThroughWall = true;
      }
      }
    }

    player.removeSprite(cellCoords); // 移除當前座標的精靈圖片
    cellCoords = newCoords; // 更新座標
    drawSprite(cellCoords); // 繪製新座標的精靈圖片
    moves++; // 增加移動步數

    player.updateFog(cellCoords.x, cellCoords.y); // 🔹 移動後更新迷霧
    // console.log("🚶 玩家移動: dx =", dx, "dy =", dy);
    // console.log("🎯 當前座標:", cellCoords);
    // console.log("📌 `movePlayer()` 內部的 `recordPath` 狀態:", recordPath);

    // 記錄路徑
    if (recordPath && !isReplaying) {
      let direction = "";
      if (dx === -1) direction = "left";
      if (dx === 1) direction = "right";
      if (dy === -1) direction = "up";
      if (dy === 1) direction = "down";

      pathHistory.push(direction);
      // console.log(pathHistory);
      // console.log(pathHistory.length);
      // console.log("目前路徑:", pathHistory.join(" → "));
      // console.log("📌 新增移動記錄:", direction);
      // console.log("📜 當前路徑記錄:", pathHistory);
    } else {
      // console.log("⚠ `recordPath` 為", recordPath, " 或 `isReplaying` 為", isReplaying, "未記錄移動");
    }

    // 🔹 檢查是否踩到事件
    draw.eventPositions.forEach((pos, index) => {
      if (pos.x === cellCoords.x && pos.y === cellCoords.y) {
        console.log("🎲 觸發事件！");

        // 隨機選擇一個事件
        fetch("./events.json")
          .then(response => response.json())
          .then(events => {
            let event = events[Math.floor(Math.random() * events.length)];
            console.log("🔹 事件名稱:", event.name);
            alert(`事件發生: ${event.name}\n${event.description}`);



            function default_action() {
              let px = cellCoords.x;
              let py = cellCoords.y;
              let startCoord = maze.startCoord(); // 🔹 取得起點座標
              let endCoord = maze.endCoord();

              // 🔹 **清除 3x3 內的迷霧**
              for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                  let nx = px + dx;
                  let ny = py + dy;
                  if (isValidCoord(nx, ny)) {
                    ctx.clearRect(nx * cellSize, ny * cellSize, cellSize, cellSize);
                  }
                }
              }

              // 🔹 **確保起點不被迷霧覆蓋**
              ctx.clearRect(startCoord.x * cellSize, startCoord.y * cellSize, cellSize, cellSize);

              // 🔹 **清除終點的迷霧**
              ctx.clearRect(endCoord.x * cellSize, endCoord.y * cellSize, cellSize, cellSize);

              // 🔹 **重新繪製視野內的迷宮線條**
              draw.redrawMaze(cellSize); // ✅ 直接使用 redrawMaze()，確保迷宮線條仍然可見

              // 🔹 **對 3×3 視野範圍外的格子重新覆蓋迷霧**
              for (let x = 0; x < map.length; x++) {
                for (let y = 0; y < map[x].length; y++) {
                  if (
                    !((x >= px - 1 && x <= px + 1) && (y >= py - 1 && y <= py + 1)) && // 視野外
                    !(x === startCoord.x && y === startCoord.y) // 不是起點
                  ) {
                    ctx.drawImage(fogImage, x * cellSize, y * cellSize, cellSize, cellSize);
                  }
                }
              }
              // 🔹 **清除終點的迷霧**
              ctx.clearRect(endCoord.x * cellSize, endCoord.y * cellSize, cellSize, cellSize);

              // 🔹 **繪製視野內的事件**
              draw.eventPositions.forEach(pos => {
                if ((pos.x >= px - 1 && pos.x <= px + 1) && (pos.y >= py - 1 && pos.y <= py + 1)) {
                  let eventImage = new Image();
                  eventImage.src = "./dice.png"; // 假設事件圖片是 `dice.png`
                  eventImage.onload = function () {
                    ctx.drawImage(eventImage, pos.x * cellSize, pos.y * cellSize, cellSize, cellSize);
                  };
                }
              });
              // 🔹 **先清除終點的迷霧**
              ctx.clearRect(maze.endCoord.x * cellSize, maze.endCoord.y * cellSize, cellSize, cellSize);

              // 🔹 **重新畫終點**
              draw.drawEndMethod();

              // 🔹 **重新畫玩家**
              if (player) {
                player.redrawPlayer(cellSize);
              }
            }

            function Enhanced_Vision() {
              // 第一個事件 Your vision expands by 2 tiles for the next 3 steps!

              let px = cellCoords.x;
              let py = cellCoords.y;
              let startCoord = maze.startCoord(); // 🔹 取得起點座標
              let endCoord = maze.endCoord();

              // 🔹 **清除 5x5 內的迷霧**
              for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -2; dy <= 2; dy++) {
                  let nx = px + dx;
                  let ny = py + dy;
                  if (isValidCoord(nx, ny)) {
                    ctx.clearRect(nx * cellSize, ny * cellSize, cellSize, cellSize);
                  }
                }
              }

              // 🔹 **確保起點不被迷霧覆蓋**
              ctx.clearRect(startCoord.x * cellSize, startCoord.y * cellSize, cellSize, cellSize);

              // 🔹 **清除終點的迷霧**
              ctx.clearRect(endCoord.x * cellSize, endCoord.y * cellSize, cellSize, cellSize);

              // 🔹 **重新繪製視野內的迷宮線條**
              draw.redrawMaze(cellSize); // ✅ 直接使用 redrawMaze()，確保迷宮線條仍然可見

              // 🔹 **對 5x5 視野範圍外的格子重新覆蓋迷霧**
              for (let x = 0; x < map.length; x++) {
                for (let y = 0; y < map[x].length; y++) {
                  if (
                    !((x >= px - 2 && x <= px + 2) && (y >= py - 2 && y <= py + 2)) && // 視野外
                    !(x === startCoord.x && y === startCoord.y) // 不是起點
                  ) {
                    ctx.drawImage(fogImage, x * cellSize, y * cellSize, cellSize, cellSize);
                  }
                }
                // 🔹 **清除終點的迷霧**
                ctx.clearRect(endCoord.x * cellSize, endCoord.y * cellSize, cellSize, cellSize);

                // 🔹 **繪製視野內的事件**
                draw.eventPositions.forEach(pos => {
                  if ((pos.x >= px - 2 && pos.x <= px + 2) && (pos.y >= py - 2 && pos.y <= py + 2)) {
                    let eventImage = new Image();
                    eventImage.src = "./dice.png"; // 假設事件圖片是 `dice.png`
                    eventImage.onload = function () {
                      ctx.drawImage(eventImage, pos.x * cellSize, pos.y * cellSize, cellSize, cellSize);
                    };
                  }
                });
              }

              // 🔹 **先清除終點的迷霧**
              ctx.clearRect(maze.endCoord.x * cellSize, maze.endCoord.y * cellSize, cellSize, cellSize);

              // 🔹 **重新畫終點**
              draw.drawEndMethod();

              // 🔹 **重新畫玩家**
              if (player) {
                player.redrawPlayer(cellSize);
              }

            }
            // 將事件圖片替換雲朵
            function ChangePicture() {
              let px = cellCoords.x;
              let py = cellCoords.y;
              draw.eventPositions.forEach(pos => {
                if (!(pos.x === px && pos.y === py)) {
                  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                  ctx.fillRect(pos.x * cellSize, pos.y * cellSize, cellSize, cellSize);

                  let cloudImg = new Image();
                  cloudImg.src = "./fog.jpg";
                  cloudImg.onload = function () {
                    ctx.drawImage(cloudImg, pos.x * cellSize, pos.y * cellSize, cellSize, cellSize);
                  };
                }
              });
            }
            function Restricted_Vision() {
              // 第二個事件 Your vision restricts by 1 tiles for the next 5 steps!

              let px = cellCoords.x;
              let py = cellCoords.y;
              let startCoord = maze.startCoord(); // 🔹 取得起點座標
              let endCoord = maze.endCoord();

              // 清除玩家當前格子的迷霧
              ctx.clearRect(px * cellSize, py * cellSize, cellSize, cellSize);

              // 🔹 **確保起點不被迷霧覆蓋**
              ctx.clearRect(startCoord.x * cellSize, startCoord.y * cellSize, cellSize, cellSize);

              // 🔹 **清除終點的迷霧**
              ctx.clearRect(endCoord.x * cellSize, endCoord.y * cellSize, cellSize, cellSize);

              // 🔹 **重新繪製視野內的迷宮線條**
              draw.redrawMaze(cellSize); // ✅ 直接使用 redrawMaze()，確保迷宮線條仍然可見

              // 覆蓋所有視野外的格子
              for (let x = 0; x < map.length; x++) {
                for (let y = 0; y < map[x].length; y++) {
                  if (!(x === px && y === py) && !(x === startCoord.x && y === startCoord.y)) {
                    ctx.drawImage(fogImage, x * cellSize, y * cellSize, cellSize, cellSize);
                  }
                }
              }
              // 🔹 **先清除終點的迷霧**
              ctx.clearRect(endCoord.x * cellSize, endCoord.y * cellSize, cellSize, cellSize);

              // 🔹 **重新畫終點**
              draw.drawEndMethod();

              // 🔹 **重新畫玩家**
              if (player) {
                player.redrawPlayer(cellSize);
              }

            }

            function Return_to_Start() {
              console.log("🔄 觸發 Return to Start 事件！");
              player.removeSprite(player.cellCoords);
              // 把玩家傳送到起點
              if (player) {
                player.unbindKeyDown(); // Unbind old player controls
                
              }
              // 清除整個畫布
              ctx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);
              // 重新繪製迷宮
              draw.redrawMaze(cellSize);
              // 重新繪製事件
              if (draw.eventPositions.length > 0) {
                let diceImg = new Image();
                diceImg.src = "./dice.png";
                diceImg.onload = function () {
                  draw.eventPositions.forEach(pos => {
                    ctx.drawImage(diceImg, pos.x * cellSize, pos.y * cellSize, cellSize, cellSize);
                    // 在事件圖案上加上迷霧
                    if (fogEnabled) {
                      ctx.drawImage(fogImage, pos.x * cellSize, pos.y * cellSize, cellSize, cellSize);
                      //取得當前位置並加上迷霧
                      player.updateFog(pos.x, pos.y);

                    }
                  });
                };
              }
              // 重新繪製迷霧
              if (fogEnabled) {
                draw.applyFog();
              }
              player = new Player(maze, mazeCanvas, cellSize, displayVictoryMess, sprite); // Re-initialize player
              player.cellCoords = { ...maze.startCoord() }; // **設定玩家為起點座標**
              moves = 0;

              pathHistory = [];
              console.log("🗑 清空路徑記錄:", pathHistory);
              // 關閉record樣式
              document.getElementById("record-checkbox").checked = false;

              if (document.getElementById("record-checkbox").checked == false) {
                recordPath = false;
              }else{
                recordPath = true;
              } 

              isReplaying = false; 
            }



            if (event.name === "Enhanced Vision" && fogEnabled) {

              let keyPressCount = 0;

              function incrementKeyPressCount() {
                keyPressCount++;
                console.log("Key pressed " + keyPressCount + " times");

                if (keyPressCount <= 3) {
                  Enhanced_Vision();
                } else {
                  default_action();
                }
              }
              window.addEventListener("keydown", incrementKeyPressCount);
            } else if (event.name === "Restricted Vision" && fogEnabled) {

              let keyPressCount = 0;

              function incrementKeyPressCount() {
                keyPressCount++;
                console.log("Key pressed " + keyPressCount + " times");

                if (keyPressCount <= 5) {
                  ChangePicture();
                  Restricted_Vision();
                } else {
                  default_action();
                }
              }
              window.addEventListener("keydown", incrementKeyPressCount);
            } else if (event.name === "Return to Start") {
              Return_to_Start();
              // isReplaying = false;
              // recordPath = true;
              // fixedRecordPoint = { ...player.cellCoords };
              // console.log("🔄 強制開啟記錄，起始點:", fixedRecordPoint);
            }
            else if (event.name === "Wall Pass") {
              canPassThroughWalls = true
              if (player.hasPassedThroughWall = true) {
                player.hasPassedThroughWall = false;
              }
            }

          }
          );

        // 清除事件位置 (不再顯示)
        draw.eventPositions.splice(index, 1);
      }

      if (player.cellCoords.x === maze.endCoord.x && player.cellCoords.y === maze.endCoord.y) {
        console.log("🎉 玩家到達終點！");

        // 🔹 **清除終點的迷霧，確保終點可見**
        ctx.clearRect(endCoord.x * cellSize, endCoord.y * cellSize, cellSize, cellSize);

        // 🔹 **顯示勝利訊息**
        displayVictoryMess(moves);

        // 🔹 **停止玩家移動**
        player.unbindKeyDown();
      }
    });




  }

  // 檢查按鍵事件的函數
  function check(e) {
    switch (e.keyCode) {
      case 37: // 左 (A)
      case 65:
        movePlayer(-1, 0);
        break;
      case 38: // 上 (W)
      case 87:
        movePlayer(0, -1);
        break;
      case 39: // 右 (D)
      case 68:
        movePlayer(1, 0);
        break;
      case 40: // 下 (S)
      case 83:
        movePlayer(0, 1);
        break;
    }
  }

  // 綁定鍵盤事件的函數
  this.bindKeyDown = function () {
    window.addEventListener("keydown", check, false);
  };

  // 解除鍵盤事件綁定的函數
  this.unbindKeyDown = function () {
    window.removeEventListener("keydown", check, false);
  };

  // 繪製起點精靈圖片
  drawSprite(maze.startCoord());
  // 綁定鍵盤事件
  this.bindKeyDown();

  /* 加入回放功能 */
  // 確保 `isReplaying` 變數只定義一次
  if (typeof isReplaying === "undefined") {
    var isReplaying = false;
  }

  this.replayPath = function () {
    if (isReplaying) {
      console.warn("⚠️ 已經在回放中，忽略重複回放！");
      return;
    }
    if (pathHistory.length === 0) {
      console.log("⚠ 沒有記錄的路徑！");
      return;
    }
    if (!fixedRecordPoint) {
      console.log("⚠ 記錄點未設定，請先開啟記錄！");
      return;
    }

    console.log("🔄 回到記錄點，開始回播路徑...");

    // 🔹 **設置回放狀態**
    isReplaying = true;

    // **暫存記錄狀態，並關閉記錄**
    let wasRecording = recordPath;
    recordPath = false;

    // **回到固定記錄點**
    player.removeSprite(cellCoords);
    cellCoords = { ...fixedRecordPoint };
    drawSprite(cellCoords);

    let index = 0;

    // ✅ 定義 `delay(ms)`，確保 `setTimeout` 被 Promise 解析
    function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function step() {
      while (index < pathHistory.length) {
        if (!isReplaying) {
          console.log("⏹️ 回放被手動中斷");
          return;
        }

        let direction = pathHistory[index];

        movePlayer(
          direction === "left" ? -1 : direction === "right" ? 1 : 0,
          direction === "up" ? -1 : direction === "down" ? 1 : 0
        );

        // ✅ 確保 `updateFog()` 只在 `fogEnabled` 開啟時執行
        if (fogEnabled) {
          player.updateFog(cellCoords.x, cellCoords.y);
        }

        index++;
        await delay(300); // ✅ 改用 `await` 來讓 `setTimeout` 正確解析
      }

      // 🔹 **回放結束後，恢復記錄狀態**
      isReplaying = false; // 回放結束，恢復正常狀態
      recordPath = wasRecording;
      console.log("📌 回放結束，恢復記錄模式狀態:", recordPath);

    }

    step();
  };
  // 重新繪製玩家的函數
  this.redrawPlayer = function (size) {
    cellSize = size;
    halfCellSize = cellSize / 2;
    player.removeSprite(cellCoords); // 先清除舊的
    drawSprite(cellCoords); // 再重新繪製
  };


  /* 設定記錄模式 */
  this.toggleRecord = function (enable) {
    console.log(`🔄 設定記錄模式: ${enable}`);
    recordPath = enable;
    console.log("📌 `toggleRecord()` 內 `recordPath` 狀態:", recordPath);
    if (enable) {
      if (!fixedRecordPoint) {
        fixedRecordPoint = { ...player.cellCoords };  // **如果沒有記錄點，則設定當前位置**
      }
      console.log("✅ 開啟記錄模式，起始位置:", fixedRecordPoint);
    } else {
      console.log("⏸ 記錄暫停，但記錄點不變。");
    }
  };
}

/* 監聽事件數量變化 */
let eventMenuClicked = false; // 記錄選單是否被點擊

// 1️⃣ 滑鼠點擊 `eventNum` 時，標記為已展開
document.getElementById("eventNum").addEventListener("mousedown", function () {
  eventMenuClicked = true;
});

// 2️⃣ 當 `eventNum` 選項被選擇（不論是否變更），才更新事件
document.getElementById("eventNum").addEventListener("change", function () {
  if (eventMenuClicked) {
    eventMenuClicked = false; // 重置狀態

    let numEvents = parseInt(this.value, 10);

    // 清除舊事件
    draw.eventPositions = [];
    draw.redrawMaze(cellSize);

    // 加載骰子圖並繪製新事件
    let diceImg = new Image();
    diceImg.src = "./dice.png";
    diceImg.onload = function () {
      draw.drawEvents(numEvents, diceImg);

      // 🔹 **如果 `Fog` 開啟，則重新應用迷霧**
      if (fogEnabled && player) {
        console.log("🔍 重新應用迷霧");
        draw.applyFog();
      } else {
        console.log("🔍 關閉迷霧模式，清除迷霧並重新繪製事件");

        // 🔹 清除迷霧
        draw.clearFog();

        // 🔹 **重新繪製事件**
        if (draw.eventPositions.length > 0) {
          let diceImg = new Image();
          diceImg.src = "./dice.png";
          diceImg.onload = function () {
            draw.drawEvents(draw.eventPositions.length, diceImg);
          };
        }
      }
    };
  }
});

// 3️⃣ 禁止鍵盤變更 `eventNum` 值
document.getElementById("eventNum").addEventListener("keydown", function (event) {
  event.preventDefault(); // 阻止鍵盤控制選單
});

document.getElementById("fog-checkbox").addEventListener("change", function () {
  if (!player) {
    console.warn("⚠️ player 尚未初始化，先執行 makeMaze()");
    makeMaze();
  }
  fogEnabled = this.checked;
  if (fogEnabled && player) {
    draw.applyFog(); // 當勾選時，覆蓋整個迷宮
  } else {
    draw.clearFog(); // 取消勾選時，清除所有迷霧
  }
});
