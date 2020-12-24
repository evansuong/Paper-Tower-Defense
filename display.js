const ROWS = 20;
const COLS = 20;

// temp map, replace with actual tower images
const towerColors = {
  archer: 'green',
  pellet: 'black',
  splash: 'blue',
  earthquake: 'brown',
  air: 'yellow',
  ice: 'white',
  start: 'purple',
  end: 'red',
};

export function Display(canvas) {
  this.buffer  = document.createElement("canvas").getContext("2d"),
  this.context = canvas.getContext("2d");
  this.nodeWidth = canvas.height / ROWS;
  this.nodeHeight = canvas.width / COLS;
}


// draws rectangles to the buffer
Display.prototype.drawRectangle = function(x, y, width, height, color) {
  this.buffer.fillStyle = color;
  this.buffer.fillRect(x, y, width, height);
};

// draws background to the buffer
Display.prototype.fill = function(color) {
  this.buffer.fillStyle = color;
  this.buffer.fillRect(0, 0, this.buffer.canvas.width, this.buffer.canvas.height);
};


// draws the buffer to the actual canvas
Display.prototype.draw = function() { 
  this.context.clearRect(0, 0, this.context.width, this.context.height);
  this.context.drawImage(this.buffer.canvas, 0, 0, this.buffer.canvas.width, this.buffer.canvas.height, 0, 0, this.context.canvas.width, this.context.canvas.height); };

/**
 * draws the game grid with all the towers 
 * @param {array} grid the game map with all the towers
 */
Display.prototype.drawMap = function(map) {

  let { grid, enemies, towers } = map;
  
  grid.nodes.forEach(node => {
    // don't draw empty nodes
    if (node.type === 'empty') return;
    // draw non empty nodes to the buffer
    this.drawRectangle(
      node.x * this.nodeWidth,
      node.y * this.nodeHeight, 
      this.nodeWidth, 
      this.nodeHeight, 
      towerColors[node.type]
    );
  });

  enemies.map(enemy => {
    this.drawRectangle(
      enemy.x,
      enemy.y,
      enemy.width,
      enemy.height,
      'pink',
    )
  });

  towers.map(() => {
    console.log('drawing tower')})
}

/**
 * draws all the extra stuff like the tower store, health and money counts, and level selector
 * @param {object} gameStats contains game stats like the store, money, health, etc
 */
Display.prototype.drawOutsideElements = function(gameStats) {
  console.log('drawing outside elements')
}






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


