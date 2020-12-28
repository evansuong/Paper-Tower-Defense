import { constants } from "./constants.js";
import { Controller } from "./controller.js";
import { Display } from "./display.js";
import { Game } from "./game.js";



// global vars
const { 
  FPS, 
  NODE_COLORS,
  TOWER_STATS,
  TOWER_COLORS,
  TOWER_STAT_LABELS, 
  GRID_DIMS, 
  ENEMY_SIZE, 
  NODE_SIZE
} = constants

let lastRenderTime = 0;

// spawn enemy test button
let spawnBtn = document.getElementById('spawn-btn');
let a = false;
spawnBtn.addEventListener("click", function() {
  if (a) {
    game.createEnemy('normal');
    a = !a;

  } else {
    game.createEnemy('speed');
    a = !a;
  }
});




////////////////////////////
////     GAME STATS     ////
////////////////////////////


let lives = document.getElementById('lives');
let money = document.getElementById('money');
let level = document.getElementById('level');
let addMoney = document.getElementById('money-btn');
addMoney.addEventListener('click', () => {
  game.stats.money = game.stats.money + 1000;
});






//////////////////////////////
////     TOWER BUTTONS    ////
//////////////////////////////

let upgradeBtn = document.getElementById('upgrade-btn')
let sellBtn = document.getElementById('sell-btn')

// allow tower to be upgraded and sold
upgradeBtn.addEventListener('click', () => onUpgradeBtnClick());
sellBtn.addEventListener('click', () => onSellBtnClick());





/////////////////////////////
////     TOWER STORE     ////
/////////////////////////////


// tower selection logic
function onStoreMouseClick(e) {

  // create tower drag image when user wants to place a tower
  let dragObject = document.createElement('div');
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
    game.buildTower(type, x, y, difficulty);

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
  game.upgradeTower(); 
  
  // figure out how to add towerstats into here TODO: fix that
  let upgradeStats = game.selectTower(towerStats.col * NODE_SIZE, towerStats.row * NODE_SIZE);
  setTowerStatFields(upgradeStats);
}

function onSellBtnClick() {
  game.sellTower();
  game.deselectTower();
  setTowerStatFields();
}



/////////////////////////////
////     TOWER STORE     ////
/////////////////////////////


const towerStore = [...document.getElementsByClassName('store-item')];


// check if a tower is purchaseable by the player 
function updateTowerStore() {

  towerStore.forEach(towerItem => {

    // if player doesn't have enough money then remove event listener
    if(TOWER_STATS[towerItem.id.toString()][difficulty].purchaseCost < game.stats.money) {
      towerItem.addEventListener('click', onStoreMouseClick);
      towerItem.style.opacity = 1;
    } else {
      towerItem.removeEventListener('click', onStoreMouseClick);
      towerItem.style.opacity = .5;
    }
  });
}




Function.prototype.stack = function() {
  console.log('stack')
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
      statField.innerHTML = TOWER_STAT_LABELS[stat] + towerStats[stat].toString();
    });
  } else {
    // set each stat field with selected tower
    towerStatFields.forEach((statField, index) => {
      statField.innerHTML = '';
    });
  }
 
}










/////////////////////////////////
////     MAIN GAME LOGIC     ////
/////////////////////////////////

// game difficulty, move somewhere so it can be set manually
let difficulty = 'easy'

// Object initialization

// Model
const game = new Game(difficulty);
// View
const display = new Display(document.querySelector('canvas'));
// Controller
const controller = new Controller();

// set the internal canvas width and height 
display.buffer.canvas.height = game.map.width;
display.buffer.canvas.width = game.map.height;
display.buffer.imageSmoothingEnabled = false;

// GAME LOOP
function main(currentTime) {
 
  // step render to control animation fps
  window.requestAnimationFrame(main);
  const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
  if (secondsSinceLastRender < 1 / FPS) return;

  lastRenderTime = currentTime;

  // update all game pieces
  update();
  // draw all updated piecesw
  draw();
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

  // update lives and money based on game stats 
  lives.innerHTML = game.stats.lives.toString();
  money.innerHTML = game.stats.money.toString();
  level.innerHTML = game.stats.level.toString();
}

// TODO implement upgrade and sell functions then enemy money when they die





///////////////////////////////////
////     DRAWING FUNCTIONS     ////
///////////////////////////////////


// MAIN DRAW FUNCTION
function draw() {

  // draw game background
  display.fill('white');

  // draw game map
  drawMap();

  // draw everything else
  drawOutsideElements();

  // draw potential tower if player is dragging a tower
  if (controller.dragging && controller.isMouseInCanvas()) {
    drawNewTower();
  };

  // display buffer
  display.draw(); 
}


// draw elements outside of the map
function drawOutsideElements() {

}


// draw all the entities on the map
function drawMap() {

  let { grid, enemies } = game.map;
  
  grid.nodes.forEach(node => {
    // don't draw empty nodes
    if (node.type === 'empty') return;

    // draw tower node
    if (node.type === 'tower') {
      display.drawRectangle(
        node.col * NODE_SIZE,
        node.row * NODE_SIZE, 
        NODE_SIZE, 
        NODE_SIZE, 
        TOWER_COLORS[node.tower.type],
        1
      );

      // draw tower range if it is clicked by player
      if (node.isSelected()) {
        display.drawCircle(
          node.col * NODE_SIZE + (NODE_SIZE / 2),
          node.row * NODE_SIZE + (NODE_SIZE / 2),
          node.tower.range * NODE_SIZE,
          'rgba(100, 100, 100, ',
          .1,
        );
      }
     
    // draw start and end node
    } else {
      display.drawRectangle(
        node.col * NODE_SIZE,
        node.row * NODE_SIZE, 
        NODE_SIZE, 
        NODE_SIZE, 
        NODE_COLORS[node.type],
        1
      );
    }
  });

  // draw enemies to the map
  enemies.map(enemy => {
    display.drawCircle(
      enemy.x,
      enemy.y,
      ENEMY_SIZE / 2,
      enemy.color,
      // enemy.currentHealth / (enemy.startingHealth / 3),
      1, // find a better way to animate health and death
    )
  });
}


// draw potential tower placement
function drawNewTower() {

  // get tower position and range
  let { x, y } = controller.getMousePos();
  let col = Math.floor(x / NODE_SIZE) * NODE_SIZE;
  let row = Math.floor(y / NODE_SIZE) * NODE_SIZE;
  let draggingTower = controller.getDragObject().id.toString();
  let range = TOWER_STATS[draggingTower][difficulty].range[0] * NODE_SIZE;

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
    .1,
  );
}
