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

Display.prototype.drawImage = function(img, x, y, width, height) {
  this.buffer.imageSmoothingEnabled = true;
  this.buffer.drawImage(img, x, y, width, height);
}

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
