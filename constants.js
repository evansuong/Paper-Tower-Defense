

export const constants = {

  FPS:               24,
  ENEMY_SIZE:        20,
  TOWER_SIZE_OFFSET: 15,
  MAP_SIZE:          600,
  START_MONEY:       100000000,  
  GRID_DIMS:         20,
  NODE_SIZE:         600 / 20,
  SPAWN_COOLDOWN:    3,

  HEALTHBAR: {
    width:  20,
    height: 3,
    color1: 'red',
    color2: 'green'
  },

  START_POS: {
    col: 0,
    row: 10,
  },

  END_POS: {
    col: 19, 
    row: 10,
  },

  LIVES: {
    easy:   25,
    medium: 15,
    hard:   5,
  },

// enemies 6 type, 5 levels of each

  // enemy contains a base speed and base health that increase based on difficulty
  ENEMY_STATS: {
    normal: buildEnemyObjects(20, 2),
    speed:  buildEnemyObjects(20, 5),
  },

  // replace with image urls
  ENEMY_COLORS: {
    normal: 'rgb(180, 180, 180)',
    speed:  'rgb(200, 150, 180)',
  },

  SELECTED_COLOR: 'rgba(255, 165, 0, ',

  // tower stats are base damage, base cost, range, shots per second, shotspread respectively
  TOWER_STATS: {
    pellet:     buildTowerObjects(1, 100, 3, 4, 1),
    splash:     buildTowerObjects(2, 750, 2, 12, 2),
    air:        buildTowerObjects(3, 1500, 3, 2, 3),
    ice:        buildTowerObjects(0, 2000, 1, 1, 10),
    earthquake: buildTowerObjects(3, 3000, 3, 1, 10),
    machine:    buildTowerObjects(3, 4000, 3, 24, 1),
  },

  // replace with image urls
  TOWER_COLORS: {
    pellet:     'black',
    splash:     'blue',
    air:        'yellow',
    earthquake: 'burlywood',
    ice:        'cyan',
    machine:    'slategray'
  },

  // tower stat labels for stat panel
  TOWER_STAT_LABELS: {
    type:   'type: ',
    level:  'level: ',
    damage: 'damage per shot: ',
    // TODO: edit upgrade cost
    cost:   'upgrade cost: ',
    range:  'range: ',
    reload: 'shots per second: ',
    spread: 'shot spread: ',
    sell:   'sell cost: ',
  },

  // replace with image urls
  NODE_COLORS: {
    start: 'green',
    end:   'red'
  },
}


function buildEnemyObjects(baseHealth, baseSpeed) {
  return {
    easy: {
      health: baseHealth,
      speed:  baseSpeed,
    },
    medium: {
      health: baseHealth * 1.5,
      speed:  baseSpeed,
    }, 
    hard: {
      health: baseHealth * 2,
      speed:  baseSpeed * 1.2,
    }
  }
}

function buildTowerObjects(baseDamage, baseCost, baseRange, shotsPerSecond, shotSpread) {
  return {
    easy:   buildTower(baseDamage, baseCost, baseRange, shotsPerSecond, shotSpread),
    medium: buildTower(baseDamage, baseCost, baseRange, shotsPerSecond, shotSpread),
    hard:   buildTower(baseDamage, baseCost, baseRange, shotsPerSecond, shotSpread),  
  }
}


// TODO: split cost into purchase price and upgrade cost
function buildTower(baseDamage, baseCost, baseRange, shotsPerSecond, shotSpread) {
  return {
    damage:         [baseDamage, baseDamage + 2, baseDamage + 5, baseDamage + 10, baseDamage + 20],
    purchaseCost:   baseCost,
    upgradeCost:    [baseCost + 100, baseCost + 500, baseCost + 1000],
    range:          [baseRange,  baseRange,  baseRange + 1,  baseRange + 1, baseRange + 2],
    shotsPerSecond: shotsPerSecond,
    shotSpread:     shotSpread,
    sellCost:       [baseCost * .75, (baseCost + 100) * .75, (baseCost + 500)  * .75, (baseCost + 1000 * .75)]
  }
}