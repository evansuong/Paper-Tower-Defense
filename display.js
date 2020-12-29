import { constants } from "./constants.js";

const { GRID_DIMS, ENEMY_SIZE } = constants;

export function Display(canvas) {
  this.buffer  = document.createElement("canvas").getContext("2d"),
  this.context = canvas.getContext("2d");
  this.nodeWidth = canvas.height / GRID_DIMS;
  this.nodeHeight = canvas.width / GRID_DIMS;
}


// draws rectangles to the buffer
Display.prototype.drawRectangle = function(x, y, width, height, color, transparency=1) {
  if (transparency === 1) {
    this.buffer.fillStyle = color;
  } else {
    let alpha = Math.sin(transparency) / 2 + .5;
    this.buffer.fillStyle = color + `${alpha}` + ')';
  }
  this.buffer.fillRect(x, y, width, height);
};

// draws rectangles to the buffer
Display.prototype.drawCircle = function(x, y, radius, color, transparency=1) {
  this.buffer.beginPath();
  if (transparency === 1) {
    this.buffer.fillStyle = color;
  } else {
    this.buffer.fillStyle = color + `${transparency}` + ')';
  }
  this.buffer.arc(x, y, radius, 0, 2 * Math.PI);
  this.buffer.fill();
};

// draws background to the buffer
Display.prototype.fill = function(color) {
  this.buffer.fillStyle = color;
  this.buffer.fillRect(0, 0, this.buffer.canvas.width, this.buffer.canvas.height);
}; 

// draws the buffer to the actual canvas
Display.prototype.draw = function() { 
  this.context.clearRect(0, 0, this.context.width, this.context.height);
  this.context.drawImage(this.buffer.canvas, 0, 0, this.buffer.canvas.width, this.buffer.canvas.height, 0, 0, this.context.canvas.width, this.context.canvas.height); 
};

/**
 * draws the game grid with all the towers 
 * @param {array} grid the game map with all the towers
 */
// Display.prototype.drawMap = function(map) {

//   let { grid, enemies } = map;
  
//   grid.nodes.forEach(node => {
//     // don't draw empty nodes
//     if (node.type === 'empty') return;
//     // draw non empty nodes to the buffer
//     this.drawRectangle(
//       node.col * this.nodeWidth,
//       node.row * this.nodeHeight, 
//       this.nodeWidth, 
//       this.nodeHeight, 
//       towerColors[node.type]
//     );
//   });

//   enemies.map(enemy => {
//     this.drawCircle(
//       enemy.x,
//       enemy.y,
//       ENEMY_SIZE,
//       ENEMY_SIZE,
//       enemy.color,
//     )
//   });
// }

/**
 * draws all the extra stuff like the tower store, health and money counts, and level selector
 * @param {object} gameStats contains game stats like the store, money, health, etc
 */
// Display.prototype.drawOutsideElements = function(gameStats) {
//   // console.log('drawing outside elements')
// }






  // this.resize = function(width, height, height_width_ratio) {

  //   if (height / width > height_width_ratio) {

  //     this.context.canvas.height = width * height_width_ratio;
  //     this.context.canvas.width = width;

  //   } else {

  //     this.context.canvas.height = height;
  //     this.context.canvas.width = height / height_width_ratio;

  //   }

  //   this.context.imageSmoothingEnabled = false;

  // };


