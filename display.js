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
    let alpha = Math.sin(transparency) / 2 + .5;
    this.buffer.fillStyle = color + `${alpha - .3}` + ')';
  }
  this.buffer.arc(x, y, radius, 0, 2 * Math.PI);
  this.buffer.fill();
};

Display.prototype.drawImage = function(img, x, y, width, height, orientation) {

  let {rotation, offsetX, offsetY} = getOrientationOffsets(orientation, width, height)
  
  this.buffer.imageSmoothingEnabled = false;

  if (rotation === 0) {
    this.buffer.drawImage(img, x, y, width, height);
  } else {
    this.buffer.translate(x, y);
    this.buffer.rotate(rotation);
    this.buffer.drawImage(img, offsetX, offsetY, width, height);
    this.buffer.rotate(-rotation);
    this.buffer.translate(-x, -y);
  }
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


function getOrientationOffsets(orientation, width, height) {
  let rotation = 0;
  let offsetX = 0;
  let offsetY = 0;
  switch(orientation) {
    case 'right':
      break;
    case 'left':
      rotation = Math.PI;
      offsetX = -width;
      offsetY = -height;
      break;
    case 'up':
      rotation = -Math.PI / 2;
      offsetX = -width;
      offsetY = 0;
      break
    case 'down':
      rotation = Math.PI / 2;
      offsetX = 0;
      offsetY = -height;
    case 'upright':
      break;
    case 'upleft':
      rotation = -Math.PI / 2;
      offsetX = -width;
      offsetY = 0;
      break;
    case 'downright':
      rotation = Math.PI / 2;
      offsetX = 0;
      offsetY = -height;
      break;
    case 'downleft':
      rotation = Math.PI;
      offsetX = -width;
      offsetY = -height;
      break;
  }

  return {
    rotation: rotation,
    offsetX: offsetX,
    offsetY: offsetY
  }
}
