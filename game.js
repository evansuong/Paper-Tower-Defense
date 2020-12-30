import { constants } from "./constants.js";
import { getLevels } from "./levels.js";

const { LIVES, GRID_DIMS, MAP_SIZE, START_MONEY, NODE_SIZE, SPAWN_COOLDOWN } = constants;

export function Game(difficulty) {
  this.map = {
    enemies: [],
    enemiesToSpawn: [],
    towers: new Map(),
    width: MAP_SIZE,
    height: MAP_SIZE,
    gridDims: GRID_DIMS,
    grid: new Grid(GRID_DIMS, difficulty),
  };
  
  this.stats = {
    lives: LIVES[difficulty],
    money: START_MONEY,
    level: 0,
    difficulty: difficulty,
  };

  this.levels = getLevels();
  this.spawnCooldown = 0;
  this.roundStarted = false;
  this.running = true;
  this.gameOver = false;
  this.win = false;
}

Game.prototype.getDifficulty = function() {
  return this.stats.difficulty;
}


Game.prototype.update = function() {

  // spawn enemies when a new level starts
  if (this.map.enemiesToSpawn.length > 0) {

    // create a new enemy when spawn cooldown is done
    if (this.spawnCooldown > SPAWN_COOLDOWN) {
      this.createEnemy(this.map.enemiesToSpawn.shift());
      this.spawnCooldown = 0;
    } else {
      this.spawnCooldown = this.spawnCooldown + 1;
    }
  }

  // check if game over
  if (this.stats.lives <= 0) {
    this.onGameLose();
  }

  // check if round is over
  if (this.map.enemies.length <= 0 && 
      this.map.enemiesToSpawn.length <= 0 && 
      this.roundStarted
    ) {
    this.roundStarted = false;
    this.levels.shift();

    // if there are no more levels left, then game is won
    if (this.levels.length === 0) {
      this.onGameWin();
    }

    this.stats.level = this.stats.level + 1;
  }

  // update enemy 
  this.map.enemies.forEach(enemy => {
    enemy.update(this.map.width, this.map.height);
  });

  // for each tower, find if there are enemies in range
  this.map.towers.forEach(tower => {

    // for each enemy in range, call shoot on them
    let enemiesInRange = this.getEnemiesInRange(tower);
    if(enemiesInRange) tower.shoot(enemiesInRange);
  })
}

// get enemies in range for each tower on the map
Game.prototype.getEnemiesInRange = function(tower) {
  let enemiesInRange = [];
  let rangeFull = false;

  // if there are no enemies return
  if (this.map.enemies.length === 0) return;

  this.map.enemies.forEach(enemy => {

    let { col, row } = enemy.getCurrentNode();

    // check if enemy is in the range of this tower
    if(col > tower.col - tower.range &&
       col < tower.col + tower.range &&
       row > tower.row - tower.range &&
       row < tower.row + tower.range) {

        // add the enemy to range list
        if (!rangeFull) {
          enemiesInRange.push(enemy);
        }

        // return when we have added the max amount of enemies for the tower
        if (enemiesInRange.length === tower.shotSpread) {
          rangeFull = true;
        }
      }
  });

  return enemiesInRange;
}

Game.prototype.pause = function() {
  this.running = false;
}

Game.prototype.unpause = function() {
  this.running = true;
}

// start next level
Game.prototype.startNextLevel = function() {

  // start game if it is not running
  if (!this.running) this.running = true; 

  // if round is in progress then disable level increment
  if (this.roundStarted) return

  // get enemy type and count for current level
  let { enemyType, enemyCount } = this.levels[0];
  
  // spawn enemies
  for (let i = 0; i < enemyCount; i++) {
    this.map.enemiesToSpawn.push({ type: enemyType, id: i.toString() + this.stats.level.toString() });
  }

  // indicate round has started
  this.roundStarted = true;
}

// spawn an enemy
Game.prototype.createEnemy = function({ type, id }) {
  let startNode = this.map.grid.getStartNode();
  let endNode = this.map.grid.getEndNode();
  let enemy = new Enemy(
    type, 
    id, 
    startNode.col, 
    startNode.row,
    endNode.col,
    endNode.row, 
    this.map.grid,
    id => this.onEnemyReachedEnd(id),
    id => this.onEnemyDeath(id),
    this.stats.difficulty,
  )
  this.map.enemies.push(enemy);
}

Game.prototype.onGameWin = function() {
  console.log('you win');
  this.gameOver = true;
  this.running = false;
  this.win = true;
}

Game.prototype.onGameLose = function() {
  console.log('you lose');
  this.gameOver = true;
  this.running = false;
  this.win = false;
}


// build tower
Game.prototype.buildTower = function(towerType, x, y, difficulty) {

  // subtract tower cost from player money
  this.stats.money = this.stats.money - TOWER_STATS[towerType][difficulty].purchaseCost;

  // get grid row and column 
  let { col, row } = this.map.grid.getNodeRowCol(x, y);

  // create new tower
  let tower = new Tower(towerType, col, row, difficulty);

  // place tower node in grid
  this.map.grid.nodes = this.map.grid.placeTower(tower);

  // add new tower to game tower list
  this.map.towers.set(tower.toHash(), tower);

  // reset enemy search 
  this.map.enemies.forEach(enemy => {
    enemy.findPath();
  });  
}


Game.prototype.upgradeTower = function() {
  let stats = {};
  this.map.grid.nodes.forEach(node => {

    if (node.type === 'tower' && node.isSelected()) {

      // get tower and upgarde it
      let towerToUpgrade = node.tower;
      towerToUpgrade.upgrade();

      // subtract moeny
      this.stats.money = this.stats.money - towerToUpgrade.upgradeCost;

      // return updated stats
      stats = this.selectTower(towerToUpgrade.col * NODE_SIZE + 5, towerToUpgrade.row * NODE_SIZE + 5);
    }
  });
  return stats;
}


Game.prototype.sellTower = function() {
  this.map.grid.nodes.forEach(node => {
    if (node.type === 'tower' && node.isSelected()) {
      let towerToDelete = node.tower;
      
      // remove towernode from grid
      this.map.grid.removeTower(towerToDelete.col, towerToDelete.row);

      // get money back
      this.stats.money = this.stats.money + towerToDelete.sellCost;

      // remove tower from tower map
      this.map.towers.delete(towerToDelete.toHash());
    }
  });
}

Game.prototype.selectTower = function(x, y) {
  let { col, row } = this.map.grid.getNodeRowCol(x, y);
  let node = this.map.grid.getNode(col, row);

  // if node isn't a tower node do nothing
  if (node.type !== 'tower') return false;
    
  // set node to selected
  node.select();

  // return tower stats for stat panel
  const towerStats = node.getTower().getStats();
  return towerStats;
}

Game.prototype.deselectTower = function() {
  this.map.grid.nodes.forEach(node => {
    if (node.type === 'tower' && node.isSelected()) {
      node.deselect();
    }
  });
}

Game.prototype.onEnemyReachedEnd = function(index) {

  // filter out the enemy that reached end
  this.map.enemies = this.map.enemies.filter(enemy => enemy.index !== index);

  // decrement life counter
  this.stats.lives = this.stats.lives - 1;
}

Game.prototype.onEnemyDeath = function(index) {

  // filter out the enemy that died
  this.map.enemies = this.map.enemies.filter(enemy => enemy.index !== index);
  this.stats.money = this.stats.money + this.stats.level * 10 + 10;
  console.log('enemy length', this.map.enemies.length)
  console.log('enemy', index, 'died');

}

Game.prototype.getLevelStats = function() {
  let { enemyType } = this.levels[0];
  return {
    type: enemyType,
    levels: this.levels,
    ...this.stats
  }
}

Game.prototype.reset = function() {
  console.log('resetting')
  this.gameOver = false;
  this.map = null;  
}









////////////////////////////
////        GRID        ////
////////////////////////////
const { START_POS, END_POS } = constants

export function Grid(gridDims, difficulty) {
  this.nodes  = this.buildGrid(gridDims, difficulty); 
}

Grid.prototype.placeTower = function(tower) {
  this.nodes[tower.row * GRID_DIMS + tower.col] = new TowerNode(tower);
  return this.nodes;
}

Grid.prototype.removeTower = function(col, row) {
  this.nodes[row * GRID_DIMS + col] = new EmptyNode();
}

Grid.prototype.getNode = function(col, row) {
  return this.nodes[row * GRID_DIMS + col];
}

Grid.prototype.getNodeRowCol = function(x, y) { 
  return { 
    col: Math.floor(x / NODE_SIZE), 
    row: Math.floor(y / NODE_SIZE)
  };
}

Grid.prototype.getStartNode = function() {
  return START_POS;
}

Grid.prototype.getEndNode = function() {
  return END_POS;
}

Grid.prototype.buildGrid = function(gridDims, difficulty) {

  let nodes = [];

  // build a 20x20 grid of nodes
  for (let row = 0; row < gridDims; row++) {
    for (let col = 0; col < gridDims; col++) {

      // push the start node
      if(col === START_POS.col && row === START_POS.row) {
        nodes.push(new StartNode(col, row));

      // push the end node
      } else if (col === END_POS.col && row === END_POS.row) {
        nodes.push(new EndNode(col, row));

      // push an empty node 
      } else {  
        // push regular tile
        nodes.push(new EmptyNode(col, row));
      }
    }
  }
  return nodes;
}


















//////////////////////////////////
////        GRID NODES        ////
//////////////////////////////////
function _Node(type, isEmpty, col, row) {
  this.type = type;
  this.isEmpty = isEmpty;
  this.isStart = false;
  this.isEnd = false;
  this.col = col;
  this.row = row;
}


export function EmptyNode(col, row) {
  _Node.apply(this, [ 'empty', true, col, row ]);
}

export function StartNode(col, row) {
  _Node.apply(this, [ 'start', true, col, row ]);
  this.isStart = true;
}

export function EndNode(col, row) {
  _Node.apply(this, [ 'end', true, col, row ]);
  this.isEnd = true;
}


EndNode.prototype.onEnemyEnter = function() {
  console.log('enemy entered, subtract one life')
}


export function TowerNode(tower) {
  _Node.apply(this, [ 'tower', false, tower.col, tower.row ]);
  this.tower = tower;
  this.selected = false;
}

TowerNode.prototype.select = function() {
  console.log('selecting tower')
  this.selected = true;
}

TowerNode.prototype.deselect = function() {
  this.selected = false;
}

TowerNode.prototype.isSelected = function() {
  return this.selected;
}

TowerNode.prototype.getTower = function() {
  return this.tower;
}













/////////////////////////
////      TOWER      ////
/////////////////////////
const { 
  TOWER_STATS,
  FPS
 } = constants;


export function Tower(type, col, row, difficulty) {
  this.type           = type;
  this.level          = 1;
  this.damage         = TOWER_STATS[type][difficulty].damage[0];
  // TODO: change this to uppgrade cost
  this.purchaseCost   = TOWER_STATS[type][difficulty].purchaseCost[0];
  this.upgradeCost    = TOWER_STATS[type][difficulty].upgradeCost[0];
  this.range          = TOWER_STATS[type][difficulty].range[0];
  this.shotsPerSecond = TOWER_STATS[type][difficulty].shotsPerSecond;
  this.shotReloadTime = parseInt(FPS / TOWER_STATS[type][difficulty].shotsPerSecond);
  this.shotSpread     = TOWER_STATS[type][difficulty].shotSpread;
  this.sellCost       = TOWER_STATS[type][difficulty].sellCost[0];
  this.col            = col;
  this.row            = row;
  this.reloadElapsed  = this.shotReloadTime;
  this.difficulty     = difficulty;
  console.log('tower reload time (frames)', this.shotReloadTime);
  console.log('tower at ', this.col, this.row, 'initialized')
}


Tower.prototype.shoot = function(enemiesInRange) {

  // TODO: HAVE TOWERS SHOOT AT FIXED TIMES
  // shoot every enemy in range
  enemiesInRange.forEach(enemy => {

    // don't shoot if reload time hasn't been met
    if (this.reloadElapsed < this.shotReloadTime) {
      this.reloadElapsed++;
    } else {

      // shoot enemy
      enemy.getShot(this.damage);
      this.reloadElapsed = 0;
    }
  });
}

Tower.prototype.upgrade = function() {
  console.log('upgrade')

  // prevent upgrades greater than 4
  if (this.level >= 4) {
    console.log('max level reached')
    return;
  }

  // increment level
  this.level++;
  console.log(this.level)

  // increase tower stats to next level
  this.damage = TOWER_STATS[this.type][this.difficulty].damage[this.level - 1];
  this.upgradeCost = TOWER_STATS[this.type][this.difficulty].upgradeCost[this.level - 1];
  this.range = TOWER_STATS[this.type][this.difficulty].range[this.level - 1];
  this.sellCost = TOWER_STATS[this.type][this.difficulty].sellCost[this.level - 1];

  console.log(this.damage, this.upgradeCost, this.range, this.sellCost)
}

Tower.prototype.getStats = function() {
  console.log('getting stats')
  return {
    type:   this.type,
    level:  this.level,
    damage: this.damage,
    cost:   this.upgradeCost,
    range:  this.range,
    reload: this.shotsPerSecond,
    spread: this.shotSpread,
    sell:   this.sellCost,
    row:    this.row,
    col:    this.col,
  }
}

Tower.prototype.toHash = function() {
  return this.type + this.col.toString() + this.row.toString()
}









/////////////////////////////////
////         ENEMY           ////
/////////////////////////////////

const { ENEMY_STATS, ENEMY_COLORS, ENEMY_SIZE } = constants; 

export function Enemy(
  type, 
  index, 
  spawnCol, 
  spawnRow, 
  endCol, 
  endRow, 
  grid, 
  onReachedEnd,
  onDeath,
  difficulty
) 
{
  this.type           = type;
  this.index          = index;
  this.currentNode    = { col: spawnCol, row: spawnRow }, 
  this.x              = spawnCol * NODE_SIZE + ENEMY_SIZE / 2;
  this.y              = spawnRow * NODE_SIZE + ENEMY_SIZE / 2;
  this.endNode        = { col: endCol, row: endRow },
  this.grid           = grid;
  this.color          = ENEMY_COLORS[type];
  this.path           = [];
  this.speed          = ENEMY_STATS[type][difficulty].speed;
  this.startingHealth = ENEMY_STATS[type][difficulty].health;
  this.currentHealth  = this.startingHealth; 
  this.onReachedEnd   = onReachedEnd;
  this.onDeath        = onDeath;
  this.orientation    = 'right';
  this.findPath()
}

Enemy.prototype.update = function() {

  // check if we made it to the end node
  if (this.path.length === 0) {
    console.log('got to the end');
    this.onReachedEnd(this.index);
    return;
  }

  // get current row and column the enemy is in
  const currentNode = this.getCurrentNode(); // node is just a row and column
  let nextNode = {};
  // console.log(this.path)

  // check to see if the enemy has moved to a new node
  if (currentNode.col === this.currentNode.col && currentNode.row === this.currentNode.row) {

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

  // get the current node that the enemy is in
  let nodeX = Math.floor(this.x / NODE_SIZE);
  let nodeY = Math.floor(this.y / NODE_SIZE);

  return { col: nodeX, row: nodeY };
}


Enemy.prototype.calculateMovement = function(nextNode, currentNode) {

  // check if enemy should move horizontally and in what direction
  let xMovement = 0;

  // is the next node in the column to left or right
  if (nextNode.col > currentNode.col) {
    xMovement = this.speed;
    this.orientation = 'right';
  } else if (nextNode.col < currentNode.col) {
    xMovement = -this.speed;
    this.orientation = 'left';
  }

  // check if enemy should move vertically and in what direction
  let yMovement = 0;

  // is the next node in the row above or below
  if(nextNode.row > currentNode.row) {
    yMovement = this.speed;
    this.orientation = 'down';
  } else if (nextNode.row < currentNode.row) {
    yMovement = -this.speed;
    this.orientation = 'up';
  }

  // returns the amount and in which direction the enemy will move next update
  return { nextX: xMovement, nextY: yMovement };
}

// call this only when a tower is placed or the enemy spawns
Enemy.prototype.findPath = function() {

  // get current node as the start node
  let startNode = this.getCurrentNode();
  let endNode = { col: this.endNode.col, row: this.endNode.row };

  // convert node grid to astar tranparency grid
  let aStarGrid = new Graph(buildAStarGrid(this.grid));

  // declare start and end nodes
  var start = aStarGrid.grid[startNode.row][startNode.col];
  var end = aStarGrid.grid[endNode.row][endNode.col];

  // console.log('start node 324', start)
  // console.log('endNode 325', end)
  // get shortest path from start to end node
  var resultWithDiagonals = astar.search(
    aStarGrid, 
    start, 
    end, 
    {
      heuristic: astar.heuristics.diagonal 
    }
  );
  this.path = getPathFromAStar(resultWithDiagonals);
}

Enemy.prototype.getShot = function(damage) {
  this.currentHealth = this.currentHealth - damage;
  // console.log(this.currentHealth)
  if(this.currentHealth <= 0) {
    this.onDeath(this.index);
  }
}

Enemy.prototype.getOrientation = function() {
  return this.orientation;
}

function buildAStarGrid(grid) {
  // turn grid into 2D array of either empty of filled nodes
  // console.log(grid.nodes)
  let newGrid = [];
  for (let row = 0; row < GRID_DIMS; row++) {
    let gridRow = [];
    for (let col = 0; col < GRID_DIMS; col++) {
      if(grid.nodes[GRID_DIMS * row + col].isEmpty === true) {
        gridRow.push(1);
      } else {
        gridRow.push(0);
      }
    }
    newGrid.push(gridRow);
  }
  return newGrid;
}


function getPathFromAStar(path) {
  return path.map(node => {
    // the algorithm is kinda wierd and sets the column indices to be y
    return { col: node.y, row: node.x }
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