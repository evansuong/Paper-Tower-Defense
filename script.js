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
  GRID_DIMS, 
  ENEMY_SIZE, 
  TOWER_SIZE_OFFSET,
  MAP_SIZE,
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




////////////////////
//// GAME STATS ////
////////////////////


let lives = document.getElementById('lives');
let money = document.getElementById('money');
let level = document.getElementById('level');
let addMoney = document.getElementById('money-btn');
addMoney.addEventListener('click', () => {
  game.stats.money = game.stats.money + 1000;
});



/////////////////////
//// TOWER STORE ////
/////////////////////



const towerStore = [...document.getElementsByClassName('store-item')];

// determine if user is currently placing a tower
let placingTower = false;
let mousePos = { x: 0, y:0 };
let draggingTower = '';

// tower selection logic
function onMouseClick(event) {

  placingTower = true;

  // create tower drag image when user wants to place a tower
  let dragObject = document.createElement('div');
  dragObject.className = 'mouse-drag-object';
  dragObject.id = `${event.target.id}`;
  draggingTower = dragObject.id.toString();

  // some rendering offset to have the mouse in the middle of the tower
  dragObject.style.left = event.pageX - TOWER_SIZE_OFFSET + 'px';
  dragObject.style.top = event.pageY - TOWER_SIZE_OFFSET + 'px';

  // event listener to have tower follow mouse points
  document.addEventListener('mousemove', e => onMouseMove(e, dragObject));

  // event listener for tower placement
  document.addEventListener('mouseup', e => onMouseUp(e, dragObject), false);

  // draw tower to screen
  document.querySelector('body').appendChild(dragObject);
}



// set tower x, y position to the mouse
function onMouseMove(e, dragObject) {
  dragObject.style.left = e.pageX - TOWER_SIZE_OFFSET + 'px';
  dragObject.style.top = e.pageY - TOWER_SIZE_OFFSET + 'px';
  getMousePos(e);
}


function mouseInCanvas(mousePos) {
  let { x, y } = mousePos;
  return (x < MAP_SIZE && x > 0 && y < MAP_SIZE && y > 0)
}


// TOWER PLACEMENT LOGIC
function onMouseUp(e, dragObject) {

  placingTower = false;
  
  // remove draggable tower from screen
  document.querySelector('body').removeChild(dragObject);

  // remove the mouse event listeners
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', this);

  // get mouse position relative to canvas boundary
  getMousePos(e);
  let { x, y } = mousePos;

  // if mouse is inside canvas, then place the tower
  if (mouseInCanvas(mousePos)) {

    // build tower 
    let type = e.target.id.toString();
    game.buildTower(type, x, y, difficulty);

  } else { console.log('tower placed outside') }
};

// get mouse position relative to the canvas
function getMousePos(evt) {
  var rect = document.querySelector('canvas').getBoundingClientRect();
  mousePos = {
    x: evt.clientX - rect.left - 10,
    y: evt.clientY - rect.top - 10
  };
}






/////////////////////////
//// MAIN GAME LOGIC ////
/////////////////////////

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



//////////////////////////
//// UPDATE FUNCTIONS ////
//////////////////////////

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

// check if a tower is purchaseable by the player 
function updateTowerStore() {

  towerStore.filter(towerItem => {

    // if player doesn't have enough money then remove event listener
    if(TOWER_STATS[towerItem.id.toString()][difficulty].cost[0] < game.stats.money) {
      towerItem.addEventListener('click', onMouseClick);
      towerItem.style.opacity = 1;
    } else {
      towerItem.removeEventListener('click', onMouseClick);
      towerItem.style.opacity = .5;
    }
  })
  
// pelletStore.addEventListener('click', onMouseClick);
// splashStore.addEventListener('click', onMouseClick);
// airStore.addEventListener('click', onMouseClick);
// iceStore.addEventListener('click', onMouseClick);
// earthquakeStore.addEventListener('click', onMouseClick);
// machineStore.addEventListener('click', onMouseClick);

}





///////////////////////////
//// DRAWING FUNCTIONS ////
///////////////////////////


// MAIN DRAW FUNCTION
function draw() {

  // draw game background
  display.fill('white');

  // draw game map
  drawMap();

  // draw everything else
  drawOutsideElements();

  // draw potential tower if player is dragging a tower
  if (placingTower && mouseInCanvas(mousePos)) {
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

    // draw non empty nodes to the buffer

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

      // ONLY DRAW IF TOWER IS CLICKED maybe write an isClicked() in tower
      // display.drawCircle(
      //   node.col * NODE_SIZE + NODE_SIZE / 2,
      //   node.row * NODE_SIZE + NODE_SIZE / 2,
      //   node.tower.range[node.tower.level - 1] * (NODE_SIZE / 2),
      //   'rgba(100, 100, 100, ',
      //   .1,
      // );

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

function drawNewTower() {

  // get tower position and range
  let { x, y } = mousePos;
  let col = Math.floor(x / NODE_SIZE) * NODE_SIZE;
  let row = Math.floor(y / NODE_SIZE) * NODE_SIZE;
  let range = TOWER_STATS[draggingTower][difficulty].range[0] * (NODE_SIZE / 2);

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
