import { constants } from "./constants.js";
import { Controller } from "./controller.js";
import { Display } from "./display.js";
import { Game } from "./game.js";



// global vars
const { 
  FPS, 
  NODE_COLORS,
  TOWER_COLORS, 
  GRID_DIMS, 
  ENEMY_SIZE, 
  TOWER_SIZE_OFFSET 
} = constants

let lastRenderTime = 0;

// document elements
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

// document elements
let buildBtn = document.getElementById('build-btn');
buildBtn.addEventListener("click", function() {
  game.buildTower('pellet', 10, 10, 'easy')
});


let pelletStore = document.getElementById('pellet-tower');
let splashStore = document.getElementById('splash-tower');
let airStore = document.getElementById('air-tower');
let iceStore = document.getElementById('ice-tower');
let earthquakeStore = document.getElementById('earthquake-tower');
let machineStore = document.getElementById('machine-tower');

pelletStore.addEventListener('click', onMouseClick);
splashStore.addEventListener('click', onMouseClick);
airStore.addEventListener('click', onMouseClick);
iceStore.addEventListener('click', onMouseClick);
earthquakeStore.addEventListener('click', onMouseClick);
machineStore.addEventListener('click', onMouseClick);




function onMouseClick(event) {
  // game.pickTower(event.target.id);
  let dragObject = document.createElement('div');
  dragObject.className = 'mouse-drag-object';
  dragObject.id = `${event.target.id}`
  dragObject.style.left = event.pageX - TOWER_SIZE_OFFSET + 'px';
  dragObject.style.top = event.pageY - TOWER_SIZE_OFFSET + 'px';

  // draw the tower being dragged by the user
  document.addEventListener('mousemove', e => onMouseMove(e, dragObject));
  document.addEventListener('mouseup', e => onMouseUp(e, dragObject), false);
  document.querySelector('body').appendChild(dragObject);
}

function onMouseMove(e, dragObject) {
  dragObject.style.left = e.pageX - TOWER_SIZE_OFFSET + 'px';
  dragObject.style.top = e.pageY - TOWER_SIZE_OFFSET + 'px';
}

function onMouseUp(e, dragObject) {
  console.log('mouseup')
  
  document.querySelector('body').removeChild(dragObject);
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', this);
  let type = e.target.id.toString();
  type = type.split('-')[0];
  let { x, y } = getMousePos(e);
  game.buildTower(type, x, y, difficulty);
};

function getMousePos(evt) {
  var rect = document.querySelector('canvas').getBoundingClientRect();
  console.log(evt.clientX)
  return {
    x: evt.clientX - rect.left - 10,
    y: evt.clientY - rect.top - 10
  };
}

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

const nodeWidth = game.map.width / GRID_DIMS;
const nodeHeight = game.map.height / GRID_DIMS;


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


// main update and render functions
function update() {
  game.update();
}

function draw() {

  // draw game background
  display.fill('white');

  // draw game map
  drawMap();

  // draw everything else
  drawOutsideElements();

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
        node.col * nodeWidth,
        node.row * nodeHeight, 
        nodeWidth, 
        nodeHeight, 
        TOWER_COLORS[node.tower.type],
        1
      );

      display.drawCircle(
        node.col * nodeWidth + nodeWidth / 2,
        node.row * nodeHeight + nodeHeight / 2,
        node.tower.range[node.tower.level] * (nodeHeight / 2),
        'rgba(100, 100, 100, ',
        .1,
      );

    // draw start and end node
    } else {
      display.drawRectangle(
        node.col * nodeWidth,
        node.row * nodeHeight, 
        nodeWidth, 
        nodeHeight, 
        NODE_COLORS[node.type],
        1
      );
    }
    

    
  });

  enemies.map(enemy => {
    console.log(enemy.currentHealth)
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
