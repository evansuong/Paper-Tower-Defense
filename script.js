import { constants } from "./constants.js";
import { Controller } from "./controller.js";
import { Display } from "./display.js";
import { Game } from "./game.js";
import { PausePanel } from "./pausePanel.js";



// global vars
const { 
  FPS, 
  NODE_IMAGES,
  TOWER_STATS,
  TOWER_IMAGES,
  SELECTED_COLOR, 
  ENEMY_SIZE, 
  ENEMY_IMAGES,
  MAP_SIZE,
  NODE_SIZE,
  HEALTHBAR
} = constants

let lastRenderTime = 0;




///////////////////////////////
////     HTML ELEMENTS     ////
///////////////////////////////


// PANEL ELEMNTS
let startMsg = document.createElement('d');
startMsg.innerHTML = 'SELECT DIFFICULTY';
startMsg.className = 'start-msg msg';

let winMsg = document.createElement('div');
winMsg.innerHTML = 'YOU WIN!';
winMsg.className = 'win-msg msg';

let lostMsg = document.createElement('div');
lostMsg.innerHTML = 'YOU LOSE :(';
lostMsg.className = 'lose-msg msg';

let pauseMsg = document.createElement('div');
pauseMsg.innerHTML = 'PAUSED';
pauseMsg.className = 'pause-msg msg';

let unpauseBtn = document.createElement('div');
unpauseBtn.innerHTML = 'resume';
unpauseBtn.className = 'pause-btn panel-btn btn';

let restartBtn = document.createElement('div');
restartBtn.innerHTML = 'restart game';
restartBtn.className = 'pause-btn panel-btn btn';

let exitBtn = document.createElement('div');
exitBtn.innerHTML = 'exit game';
exitBtn.className = 'pause-btn panel-btn btn';

let easyBtn = document.createElement('div');
easyBtn.innerHTML = 'easy';
easyBtn.className = 'start-btn panel-btn btn';

let mediumBtn = document.createElement('div');
mediumBtn.innerHTML = 'medium';
mediumBtn.className = 'start-btn panel-btn btn';

let hardBtn = document.createElement('div');
hardBtn.innerHTML = 'hard';
hardBtn.className = 'start-btn panel-btn btn';


let upgradeBtn = document.getElementById('upgrade-btn');
let sellBtn = document.getElementById('sell-btn');


// GAME BUTTONS
let pauseBtn = document.getElementById('pause-btn');
let nextLevelBtn = document.getElementById('next-lvl-btn-wrapper');


// unpause game
unpauseBtn.addEventListener('click', () => {
  game.unpause();
  gameboard.style.display = 'flex';
  pausePanel.hide();
});

// restart current game
restartBtn.addEventListener('click', () => {
  game.reset();
  init(game.getDifficulty());
  pausePanel.hide();
});

// go back to start panel
exitBtn.addEventListener('click', () => {
  console.log('resseting fame button')
  game.reset();
  pausePanel.setPanel('start');
});

// select easy mode
easyBtn.addEventListener('click', () => {
  init('easy');
  pausePanel.hide();
});

// select medium mode
mediumBtn.addEventListener('click', () => {
  init('medium');
  pausePanel.hide();
});

// select hard mode
hardBtn.addEventListener('click', () => {
  init('hard');
  pausePanel.hide();
})

// pause game
pauseBtn.addEventListener('click', () => {
  game.pause();
  gameboard.style.display = 'none';
  pausePanel.setPanel('pause');
  pausePanel.show();
});

// start next level
nextLevelBtn.addEventListener('click', () => {
  game.startNextLevel();
})

// allow tower to be upgraded and sold
upgradeBtn.addEventListener('click', onUpgradeBtnClick);
sellBtn.addEventListener('click', onSellBtnClick);


// GAME STAT LABELS
let livesLabel = document.getElementById('lives');
let moneyLabel = document.getElementById('money');
let levelLabel = document.getElementById('level');
let difficultyLabel = document.getElementById('difficulty');
let nextLevelLabel = document.getElementById('next-level');








/////////////////////////////
////     TOWER STORE     ////
/////////////////////////////


const towerStore = [...document.getElementsByClassName('store-item')];


// check if a tower is purchaseable by the player 
function updateTowerStore() {

  towerStore.forEach(towerItem => {

    // if player doesn't have enough money then remove event listener
    if(TOWER_STATS[towerItem.id.toString()][game.getDifficulty()].purchaseCost <= game.stats.money) {
      towerItem.addEventListener('click', onStoreMouseClick);
      towerItem.style.opacity = 1;
    } else {
      towerItem.removeEventListener('click', onStoreMouseClick);
      towerItem.style.opacity = .5;
    }
  });
}


// tower selection logic
function onStoreMouseClick(e) {

  // create tower drag image when user wants to place a tower
  let dragObject = document.createElement('div');
  dragObject.id = `${e.target.id}`;
  dragObject.appendChild(TOWER_IMAGES[dragObject.id].base.regular);
  controller.onMouseClick(e, dragObject);

  // event listener to have tower follow mouse points
  document.addEventListener('mousemove', e => onMouseMove(e));

  // event listener for tower placement
  document.addEventListener('mouseup', e => onMouseUp(e, dragObject), false);

  // draw tower to screen
  document.querySelector('body').appendChild(dragObject);
}

// set tower x, y position to the mouse
function onMouseMove(e) {
  controller.onMouseMove(e);
}

// TOWER PLACEMENT LOGIC
function onMouseUp(e) {
 
  // remove draggable tower from screen
  document.querySelector('body').removeChild(controller.getDragObject());

  // remove the mouse event listeners
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', this);

  // if mouse is inside canvas, then place the tower
  if (controller.isMouseInCanvas()) {

    let { x, y } = controller.getMousePos();
  
    // build tower 
    let type = controller.dragObject.id.toString();
    game.buildTower(type, x, y, game.getDifficulty());

  } else { console.log('tower placed outside') }

  // call controller onmouseup
  controller.onMouseUp(e);
  
};








/////////////////////////////////
////     TOWER SELECTION     ////
/////////////////////////////////

document.querySelector('canvas').addEventListener('mousedown', onCanvasMouseDown);

function onCanvasMouseDown(e) {

  // deselect any tower already selected
  game.deselectTower();

  // call controller mouse down function
  controller.onMouseDown(e);

  // get mouse position
  let { x, y } = controller.getMousePos();

  // get node at mouse position
  const towerStats = game.selectTower(x, y);

  // if node is a tower, then set that node to be selected
  if(towerStats) {

    // set stat fields to selected tower
    setTowerStatFields(towerStats);    
    
  } else {

    // if node is not a tower, deselect any selected nodes 
    game.deselectTower();

    // reset stat panel
    setTowerStatFields();
  }
}

// TODO: make upgrade unclickable if the player doesn't have enough money
function onUpgradeBtnClick() {
  let upgradeStats = game.upgradeTower(); 
  
  // figure out how to add towerstats into here TODO: fix that
  setTowerStatFields(upgradeStats);
}

function onSellBtnClick() {
  game.sellTower();
  game.deselectTower();
  setTowerStatFields();
}










/////////////////////////////
////     TOWER STATS     ////
/////////////////////////////

const towerStatFields = [...document.getElementsByClassName('tower-stat')];

// set tower stat fields when a tower is selected
function setTowerStatFields(towerStats) {

  if (towerStats) {
    // set each stat field with selected tower
    towerStatFields.forEach((statField, index) => {
      let stat = statField.id.toString();
      statField.innerHTML = towerStats[stat].toString();
    });
    document.getElementById('tower-stat-wrapper').style.display = 'flex';

    if (towerStats.level < 4) {
      // console.log('upgrading')4
      upgradeBtn.innerHTML = 'upgrade $' + towerStats.cost;
      upgradeBtn.addEventListener('click', onUpgradeBtnClick);
    } else {
      upgradeBtn.innerHTML = '';
      upgradeBtn.removeEventListener('click', onUpgradeBtnClick);
    }

    sellBtn.innerHTML = 'sell $' + towerStats.sell;
 
  } else {
    // set each stat field with selected tower
    towerStatFields.forEach((statField, index) => {
      statField.innerHTML = '';
    });
    document.getElementById('tower-stat-wrapper').style.display = 'none';   
  }

  // console.log(towerStats)
  // upgradeBtn.innerHTML = 'Upgrade +' + 

}










/////////////////////////////////
////     MAIN GAME LOGIC     ////
/////////////////////////////////



// game difficulty, move somewhere so it can be set manually

// flashing color for selected towers
let flashingTransparency = 0;



// PANEL ELEMENTS OBJECT
const panelElements = {
  win: [
    winMsg,
    restartBtn,
    exitBtn,
  ],
  lose: [
    lostMsg,
    restartBtn,
    exitBtn,
  ],
  pause: [
    pauseMsg,
    unpauseBtn,
    restartBtn,
    exitBtn,
  ],
  start: [
    startMsg, 
    easyBtn,
    mediumBtn,
    hardBtn,
  ],
}


// GAME BOARD
let gameboard = document.getElementById('game-board');
gameboard.style.display = 'none';


// Start/Pause Panel
const pausePanel = new PausePanel(document.getElementById('pause-panel'), panelElements);
pausePanel.setPanel('start');
pausePanel.show();


// Model
let game = {};
// View
const display = new Display(document.querySelector('canvas'));
// Controller
const controller = new Controller(display.buffer.canvas);

  
// set the internal canvas width and height 
display.buffer.canvas.height = MAP_SIZE;
display.buffer.canvas.width = MAP_SIZE;
display.buffer.imageSmoothingEnabled = false;


// initialize game once difficulty is set
function init(difficulty) {

  // set stat fields
  setTowerStatFields();

  // Model
  game = new Game(difficulty);
  
  // update all game pieces
  update();
  // draw all updated piecesw
  draw();

  pausePanel.setPanel('pause');

  gameboard.style.display = 'flex';

}


// GAME LOOP
function main(currentTime) {
 
  // step render to control animation fps
  window.requestAnimationFrame(main);
  const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
  if (secondsSinceLastRender < 1 / FPS) return;

  lastRenderTime = currentTime;

  if(game.gameOver) {
    if(game.win) {
      if (pausePanel.getPanel() !== 'win') {
        pausePanel.setPanel('win');
        gameboard.style.display = 'none';
      }
    } else {
      if (pausePanel.getPanel() !== 'lose') {
        pausePanel.setPanel('lose');
        gameboard.style.display = 'none';
      }
    }
  }

  if(game.running) {
    // update all game pieces
    update();
    // draw all updated piecesw
    draw();
  } 
}

window.requestAnimationFrame(main);





//////////////////////////////////
////     UPDATE FUNCTIONS     ////
//////////////////////////////////



// MAIN UPDATE FUNCTION
function update() {

  // update game
  game.update();

  // toggle tower clickable depending on the user's money
  updateTowerStore();

  let { type, lives, money, level, difficulty } = game.getLevelStats();

  // update lives and money based on game stats 
  livesLabel.innerHTML = 'Lives: ' + lives;
  moneyLabel.innerHTML = '$' + money;
  levelLabel.innerHTML = 'Level: ' + level; 
  difficultyLabel.innerHTML = 'difficulty: ' + difficulty;
  nextLevelLabel.innerHTML = '';

  if (type) nextLevelLabel.appendChild(ENEMY_IMAGES[type]);
  else nextLevelLabel.style.display = 'none';

  // increase flashing transparency
  flashingTransparency = flashingTransparency + .2;
}


// TODO: check path on tower placement


///////////////////////////////////
////     DRAWING FUNCTIONS     ////
///////////////////////////////////


// MAIN DRAW FUNCTION
function draw() {

  // draw game background
  display.fill('white');

  // draw game map
  drawMap();

  // draw potential tower if player is dragging a tower
  if (controller.dragging && controller.isMouseInCanvas()) {
    drawNewTower();
  };

  // display buffer
  display.draw(); 
}




// draw all the entities on the map
function drawMap() {

  let { grid, enemies } = game.map;
  
  grid.nodes.forEach(node => {
    // don't draw empty nodes
    if (node.type === 'empty') return;

    // draw tower node
    if (node.type === 'tower') {

      let towerImg = TOWER_IMAGES[node.tower.type];
      if (node.tower.level === 4) towerImg = towerImg.final;
      else towerImg = towerImg.base;
      if (node.tower.getOrientation().length > 5) towerImg = towerImg.diagonal;
      else towerImg = towerImg.regular;

      // console.log(node.tower.getOrientation())
      display.drawImage(
        towerImg,
        node.col * NODE_SIZE,
        node.row * NODE_SIZE, 
        NODE_SIZE, 
        NODE_SIZE, 
        node.tower.getOrientation()
      );

      // draw tower range if it is clicked by player
      if (node.isSelected()) {
        display.drawCircle(
          node.col * NODE_SIZE + (NODE_SIZE / 2),
          node.row * NODE_SIZE + (NODE_SIZE / 2),
          node.tower.range * NODE_SIZE,
          'rgba(100, 100, 100, ',
          .2,
        );
        display.drawRectangle(
          node.col * NODE_SIZE,
          node.row * NODE_SIZE,
          NODE_SIZE,
          NODE_SIZE,
          SELECTED_COLOR,
          flashingTransparency,
        )
      } 
    }
     
    if (node.isStart || node.isEnd) {
    // draw start and end node

      display.drawRectangle(
        node.col * NODE_SIZE,
        node.row * NODE_SIZE,
        NODE_SIZE,
        NODE_SIZE,
        NODE_IMAGES[node.type].color
      );

      display.drawImage(
        NODE_IMAGES[node.type].img,
        node.col * NODE_SIZE,
        node.row * NODE_SIZE, 
        NODE_SIZE + 10, 
        NODE_SIZE + 10, 
      );
    }
  });

  // draw enemies to the map
  enemies.map(enemy => {
    display.drawImage(
      ENEMY_IMAGES[enemy.type],
      enemy.x - ENEMY_SIZE / 2, 
      enemy.y - ENEMY_SIZE / 2,
      ENEMY_SIZE,
      ENEMY_SIZE,
      enemy.getOrientation()
    )

    // draw enemy health bar
    display.drawRectangle(
      enemy.x - (HEALTHBAR.width / 2),
      enemy.y - (ENEMY_SIZE / 1.5),
      HEALTHBAR.width,
      HEALTHBAR.height,
      HEALTHBAR.color1,
    )

    // draw enemy health in health bar
    display.drawRectangle(
      enemy.x - (HEALTHBAR.width / 2),
      enemy.y - (ENEMY_SIZE / 1.5),
      HEALTHBAR.width * (enemy.currentHealth / enemy.startingHealth),
      HEALTHBAR.height,
      HEALTHBAR.color2,
    )

    // draw enemy status
    if (enemy.status === 'fire') {
      display.drawCircle(
        enemy.x, 
        enemy.y,
        ENEMY_SIZE / 2,
        'rgba(255, 50, 50, ',
        flashingTransparency,
      );
    }

    if (enemy.status === 'frozen') {
      display.drawCircle(
        enemy.x, 
        enemy.y,
        ENEMY_SIZE / 2,
        'rgba(100, 100, 255, ',
        flashingTransparency,
      );
    }
  });
}


// draw potential tower placement
function drawNewTower() {

  // get tower position and range
  let { x, y } = controller.getMousePos();
  let col = Math.floor(x / NODE_SIZE) * NODE_SIZE;
  let row = Math.floor(y / NODE_SIZE) * NODE_SIZE;
  let draggingTower = controller.getDragObject().id.toString();
  let range = TOWER_STATS[draggingTower]['easy'].range[0] * NODE_SIZE;

  // draw tower
  display.drawRectangle(
    col,
    row,
    NODE_SIZE, 
    NODE_SIZE, 
    'gray'
  );

  // draw tower range
  display.drawCircle(
    col + NODE_SIZE / 2, 
    row + NODE_SIZE / 2,
    range,
    'rgba(100, 100, 100, ',
    .2,
  );
}
