import { Controller } from "./controller.js";
import { Display } from "./display.js";
import { Game } from "./game.js";



// global vars
const GAME_SPEED = 24;
let lastRenderTime = 0;
let running = false;

// document elements
let startBtn = document.getElementById('start-btn');
startBtn.addEventListener("click", function() {
  game.createEnemy();
});

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
  if (secondsSinceLastRender < 1 / GAME_SPEED) return;

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
  display.drawMap(game.map);

  // draw everything else
  display.drawOutsideElements(game.stats);

  // display buffer
  display.draw(); 
}