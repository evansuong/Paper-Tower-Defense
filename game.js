
const LIVES = {
  easy: 25,
  medium: 15,
  hard: 5,
};
const GRID_DIMS = 20;

export function Game(difficulty) {
  this.map = {
    enemies: [],
    towers: [],
    width: 750,
    height: 750,
    gridDims: GRID_DIMS,
    grid: new Grid(GRID_DIMS),
  };
  this.stats = {
    lives: LIVES[difficulty],
    money: 10000,
    level: 0,
    difficulty: difficulty,
  };
}

Game.prototype.update = function() {
  this.map.enemies.forEach(enemy => {
    enemy.update(this.map.width, this.map.height);
  })
}

Game.prototype.startNextLevel = function() {
  this.stats.level++;
  let level = this.levels.getLevel(this.stats.level, this.stats.difficulty);
  // for 
}

Game.prototype.createEnemy = function(enemyType) {
  console.log('creating enemy');
  let startNode = this.map.grid.getStartNode();
  let enemyCount = this.map.enemies.length;
  let enemy = new Enemy(
    enemyType, 
    enemyCount, 
    startNode.x, 
    startNode.y, 
    this.map.grid,
    this.map.width / this.map.gridDims,
    (index) => this.onEnemyReachedEnd(index));
  this.map.enemies.push(enemy);
}

Game.prototype.onEnemyReachedEnd = function(index) {
  this.map.enemies = this.map.enemies.filter(enemy => enemy.index !== index);
  console.log('enemy', index, 'reached end');
}







////////////////////////////
////        GRID        ////
////////////////////////////
const START_POS = {
  x: 0, 
  y: 10,
}
const END_POS = {
  x: 19,
  y: 10
}

export function Grid(gridDims) {
  this.nodes = buildGrid(gridDims);
}

Grid.prototype.update = function() {
  // console.log('grid update')
}

Grid.prototype.getStartNode = function() {
  return START_POS;
}

Grid.prototype.getEndNode = function() {
  return END_POS;
}

function buildGrid(gridDims) {
  console.log('building grid')
  let cells = [];
  for (let y = 0; y < gridDims; y++) {
    for (let x = 0; x < gridDims; x++) {
      if(x === START_POS.x && y === START_POS.y) {
        // push end tile
        console.log('pushing start tile')
        cells.push(new StartNode(x, y));
      } else if (x === END_POS.x && y === END_POS.y) {
        // push start tile
        console.log('pushing end tile')
        cells.push(new EndNode(x, y));
      } else {  
        // push regular tile
        console.log('another cell')
        cells.push(new EmptyNode(x, y));
      }
    }
  }
  return cells;
}

// function checkTile(position) {
//   return grid.some((segment, index) => {
//     return equalPositions(segment, position);
//   });
// } 

// function equalPositions(pos1, pos2) {
//   return pos1.x === pos2.x && pos1.y === pos2.y;
// }


















//////////////////////////////////
////        GRID NODES        ////
//////////////////////////////////
function _Node(type, isEmpty, x, y) {
  this.type = type;
  this.isEmpty = isEmpty;
  this.isStart = false;
  this.isEnd = false;
  this.x = x;
  this.y = y;
  this.distance = Infinity;
  this.isVisited = false;
}

export function EmptyNode(x, y) {
  _Node.apply(this, [ 'empty', true, x, y ]);
}

export function StartNode(x, y) {
  _Node.apply(this, [ 'start', true, x, y ]);
  this.isStart = true;
}

export function EndNode(x, y) {
  _Node.apply(this, [ 'end', true, x, y ]);
  this.isEnd = true;
}


EndNode.prototype.onEnemyEnter = function() {
  console.log('enemy entered, subtract one life')
}


export function TowerNode(x, y, tower) {
  _Node.apply(this, [ 'tower', false, x, y ]);
  this.tower = tower;
}













/////////////////////////
////      TOWER      ////
/////////////////////////

















/////////////////////////////////
////         ENEMY           ////
/////////////////////////////////

export function Enemy(type, index, x, y, grid, nodeSize, onReachedEnd) {
  this.type = type;
  this.index = index;
  this.currentNode = { x: x, y: y }, 
  this.x = x * nodeSize;
  this.y = y * nodeSize;
  this.width = 25;
  this.height = 25;
  this.grid = grid;
  this.nodeSize = nodeSize;
  this.path = this.findPath();
  this.speed = 10;
  this.onReachedEnd = onReachedEnd;
}

// TODO: smooth motion
//          create get current node for the current node the enemy is in
//          figure out absolute position of enemey on grid based off cell size
//          call the path shifting only when we enter a new node

Enemy.prototype.update = function() {
  // run pathfinding algorithm on grid
  // figure out enemy movement
    // up down left or right, or diagonal
    // follow the dijkstra path

  // check if we made it to the end node
  if (this.path.length === 0) {
    console.log('got to the end');
    this.onReachedEnd(this.index);
    return;
  }
  console.log(this.path.length)
  // console.log(this.path.length)

  // get current node the enemy is in
  const currentNode = this.getCurrentNode();
  let nextNode = {}

  // check to see if the enemy has moved to a new node
  if (currentNode.x === this.currentNode.x && currentNode.y === this.currentNode.y) {

    // if we are still in the same node, don't change the path
    nextNode = this.path[0];
  } else {

    // if we are in a new node, get the next node in the path
    nextNode = this.path.shift();
    
    // update the current node we are in
    this.currentNode = currentNode;
  }

  // get the movement amounts for the next render
  let { nextX, nextY } = this.calculateMovement(nextNode, this.currentNode);
  this.x = this.x + nextX;
  this.y = this.y + nextY;
}


Enemy.prototype.getCurrentNode = function() {
  // console.log(this.x, this.y, this.nodeSize)

  // get the current node that the enemy is in
  let nodeX = Math.floor((this.x + (this.width / 2)) / this.nodeSize);
  let nodeY = Math.floor((this.y + (this.width / 2)) / this.nodeSize);
  // console.log("from getcurrentnode", nodeX, nodeY)
  return { x: nodeX, y: nodeY };
}

Enemy.prototype.calculateMovement = function(nextNode, currentNode) {
  let xMovement = 0;
  if (nextNode.x > currentNode.x) {
    xMovement = this.speed;
  } else if (nextNode.x < currentNode.x) {
    xMovement = -this.speed;
  }
  let yMovement = 0;
  if(nextNode.y > currentNode.y) {
    yMovement = this.speed;
  } else if (nextNode.y < currentNode.y) {
    yMovement = -this.speed;
  }
  return { nextX: xMovement, nextY: yMovement };
}

// call this only when a tower is placed or the enemy spawns
Enemy.prototype.findPath = function() {
  let aStarGrid = new Graph(buildAStarGrid(this.grid));
  // do the A* algorithm here
  var start = aStarGrid.grid[1][10];
  var end = aStarGrid.grid[20][10];
  console.log(start)
  console.log(end)
  var resultWithDiagonals = astar.search(aStarGrid, start, end, { heuristic: astar.heuristics.diagonal });
  console.log(resultWithDiagonals)
  return getPathFromAStar(resultWithDiagonals)
}

function buildAStarGrid(grid) {
  let newGrid = [[]];
  for (let y = 0; y < 20; y++) {
    let row = [];
    for (let x = 0; x < 20; x++) {
      if(grid.nodes[20 * y + x].isEmpty === true) {
        row.push(1);
      } else {
        row.push(0);
      }
    }
    newGrid.push(row);
  }
  return newGrid;
}

function getPathFromAStar(path) {
  return path.map(node => {
    console.log(node.x - 1, node.y)
    return { x: node.x -1, y: node.y }
  });
}



/**
 * A graph memory structure
 * @param {Array} gridIn 2D array of input weights
 * @param {Object} [options]
 * @param {bool} [options.diagonal] Specifies whether diagonal moves are allowed
 */
function Graph(gridIn, options) {
  options = options || {};
  this.nodes = [];
  this.diagonal = !!options.diagonal;
  this.grid = [];
  for (var x = 0; x < gridIn.length; x++) {
    this.grid[x] = [];

    for (var y = 0, row = gridIn[x]; y < row.length; y++) {
      var node = new GridNode(x, y, row[y]);
      this.grid[x][y] = node;
      this.nodes.push(node);
    }
  }
  this.init();
}

Graph.prototype.init = function() {
  this.dirtyNodes = [];
  for (var i = 0; i < this.nodes.length; i++) {
    astar.cleanNode(this.nodes[i]);
  }
};

Graph.prototype.cleanDirty = function() {
  for (var i = 0; i < this.dirtyNodes.length; i++) {
    astar.cleanNode(this.dirtyNodes[i]);
  }
  this.dirtyNodes = [];
};

Graph.prototype.markDirty = function(node) {
  this.dirtyNodes.push(node);
};

Graph.prototype.neighbors = function(node) {
  var ret = [];
  var x = node.x;
  var y = node.y;
  var grid = this.grid;

  // West
  if (grid[x - 1] && grid[x - 1][y]) {
    ret.push(grid[x - 1][y]);
  }

  // East
  if (grid[x + 1] && grid[x + 1][y]) {
    ret.push(grid[x + 1][y]);
  }

  // South
  if (grid[x] && grid[x][y - 1]) {
    ret.push(grid[x][y - 1]);
  }

  // North
  if (grid[x] && grid[x][y + 1]) {
    ret.push(grid[x][y + 1]);
  }

  if (this.diagonal) {
    // Southwest
    if (grid[x - 1] && grid[x - 1][y - 1]) {
      ret.push(grid[x - 1][y - 1]);
    }

    // Southeast
    if (grid[x + 1] && grid[x + 1][y - 1]) {
      ret.push(grid[x + 1][y - 1]);
    }

    // Northwest
    if (grid[x - 1] && grid[x - 1][y + 1]) {
      ret.push(grid[x - 1][y + 1]);
    }

    // Northeast
    if (grid[x + 1] && grid[x + 1][y + 1]) {
      ret.push(grid[x + 1][y + 1]);
    }
  }

  return ret;
};

Graph.prototype.toString = function() {
  var graphString = [];
  var nodes = this.grid;
  for (var x = 0; x < nodes.length; x++) {
    var rowDebug = [];
    var row = nodes[x];
    for (var y = 0; y < row.length; y++) {
      rowDebug.push(row[y].weight);
    }
    graphString.push(rowDebug.join(" "));
  }
  return graphString.join("\n");
};

function GridNode(x, y, weight) {
  this.x = x;
  this.y = y;
  this.weight = weight;
}

GridNode.prototype.toString = function() {
  return "[" + this.x + " " + this.y + "]";
};

GridNode.prototype.getCost = function(fromNeighbor) {
  // Take diagonal weight into consideration.
  if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
    return this.weight * 1.41421;
  }
  return this.weight;
};

GridNode.prototype.isWall = function() {
  return this.weight === 0;
};



// javascript-astar 0.4.1
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a Binary Heap.
// Includes Binary Heap (with modifications) from Marijn Haverbeke.
// http://eloquentjavascript.net/appendix2.html
(function(definition) {
  /* global module, define */
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = definition();
  } else if (typeof define === 'function' && define.amd) {
    define([], definition);
  } else {
    var exports = definition();
    window.astar = exports.astar;
    window.Graph = exports.Graph;
  }
})(function() {

function pathTo(node) {
  var curr = node;
  var path = [];
  while (curr.parent) {
    path.unshift(curr);
    curr = curr.parent;
  }
  return path;
}

function getHeap() {
  return new BinaryHeap(function(node) {
    return node.f;
  });
}

var astar = {
  /**
  * Perform an A* Search on a graph given a start and end node.
  * @param {Graph} graph
  * @param {GridNode} start
  * @param {GridNode} end
  * @param {Object} [options]
  * @param {bool} [options.closest] Specifies whether to return the
             path to the closest node if the target is unreachable.
  * @param {Function} [options.heuristic] Heuristic function (see
  *          astar.heuristics).
  */
  search: function(graph, start, end, options) {
    graph.cleanDirty();
    options = options || {};
    var heuristic = options.heuristic || astar.heuristics.manhattan;
    var closest = options.closest || false;

    var openHeap = getHeap();
    var closestNode = start; // set the start node to be the closest if required

    start.h = heuristic(start, end);
    graph.markDirty(start);

    openHeap.push(start);

    while (openHeap.size() > 0) {

      // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
      var currentNode = openHeap.pop();

      // End case -- result has been found, return the traced path.
      if (currentNode === end) {
        return pathTo(currentNode);
      }

      // Normal case -- move currentNode from open to closed, process each of its neighbors.
      currentNode.closed = true;

      // Find all neighbors for the current node.
      var neighbors = graph.neighbors(currentNode);

      for (var i = 0, il = neighbors.length; i < il; ++i) {
        var neighbor = neighbors[i];

        if (neighbor.closed || neighbor.isWall()) {
          // Not a valid node to process, skip to next neighbor.
          continue;
        }

        // The g score is the shortest distance from start to current node.
        // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
        var gScore = currentNode.g + neighbor.getCost(currentNode);
        var beenVisited = neighbor.visited;

        if (!beenVisited || gScore < neighbor.g) {

          // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
          neighbor.visited = true;
          neighbor.parent = currentNode;
          neighbor.h = neighbor.h || heuristic(neighbor, end);
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;
          graph.markDirty(neighbor);
          if (closest) {
            // If the neighbour is closer than the current closestNode or if it's equally close but has
            // a cheaper path than the current closest node then it becomes the closest node
            if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
              closestNode = neighbor;
            }
          }

          if (!beenVisited) {
            // Pushing to heap will put it in proper place based on the 'f' value.
            openHeap.push(neighbor);
          } else {
            // Already seen the node, but since it has been rescored we need to reorder it in the heap
            openHeap.rescoreElement(neighbor);
          }
        }
      }
    }

    if (closest) {
      return pathTo(closestNode);
    }

    // No result was found - empty array signifies failure to find path.
    return [];
  },
  // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
  heuristics: {
    manhattan: function(pos0, pos1) {
      var d1 = Math.abs(pos1.x - pos0.x);
      var d2 = Math.abs(pos1.y - pos0.y);
      return d1 + d2;
    },
    diagonal: function(pos0, pos1) {
      var D = 1;
      var D2 = Math.sqrt(2);
      var d1 = Math.abs(pos1.x - pos0.x);
      var d2 = Math.abs(pos1.y - pos0.y);
      return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
    }
  },
  cleanNode: function(node) {
    node.f = 0;
    node.g = 0;
    node.h = 0;
    node.visited = false;
    node.closed = false;
    node.parent = null;
  }
};


function BinaryHeap(scoreFunction) {
  this.content = [];
  this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
  push: function(element) {
    // Add the new element to the end of the array.
    this.content.push(element);

    // Allow it to sink down.
    this.sinkDown(this.content.length - 1);
  },
  pop: function() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it bubble up.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.bubbleUp(0);
    }
    return result;
  },
  remove: function(node) {
    var i = this.content.indexOf(node);

    // When it is found, the process seen in 'pop' is repeated
    // to fill up the hole.
    var end = this.content.pop();

    if (i !== this.content.length - 1) {
      this.content[i] = end;

      if (this.scoreFunction(end) < this.scoreFunction(node)) {
        this.sinkDown(i);
      } else {
        this.bubbleUp(i);
      }
    }
  },
  size: function() {
    return this.content.length;
  },
  rescoreElement: function(node) {
    this.sinkDown(this.content.indexOf(node));
  },
  sinkDown: function(n) {
    // Fetch the element that has to be sunk.
    var element = this.content[n];

    // When at 0, an element can not sink any further.
    while (n > 0) {

      // Compute the parent element's index, and fetch it.
      var parentN = ((n + 1) >> 1) - 1;
      var parent = this.content[parentN];
      // Swap the elements if the parent is greater.
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        // Update 'n' to continue at the new position.
        n = parentN;
      }
      // Found a parent that is less, no need to sink any further.
      else {
        break;
      }
    }
  },
  bubbleUp: function(n) {
    // Look up the target element and its score.
    var length = this.content.length;
    var element = this.content[n];
    var elemScore = this.scoreFunction(element);

    while (true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) << 1;
      var child1N = child2N - 1;
      // This is used to store the new position of the element, if any.
      var swap = null;
      var child1Score;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N];
        child1Score = this.scoreFunction(child1);

        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore) {
          swap = child1N;
        }
      }

      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N];
        var child2Score = this.scoreFunction(child2);
        if (child2Score < (swap === null ? elemScore : child1Score)) {
          swap = child2N;
        }
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap !== null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      }
      // Otherwise, we are done.
      else {
        break;
      }
    }
  }
};

return {
  astar: astar,
  Graph: Graph
};

});