

export const constants = {

  FPS: 24,

  ENEMY_SIZE: 25,
  
  TOWER_SIZE_OFFSET: 15,

  MAP_SIZE: 500,

  START_MONEY: 10000,

  GRID_DIMS: 20,

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

  // enemy contains a base speed and base health that increase based on difficulty
  ENEMY_STATS: {
    normal: buildEnemyObjects(1000, 2),
    speed:  buildEnemyObjects(20, 5),
  },

  // replace with image urls
  ENEMY_COLORS: {
    normal: 'rgba(180, 180, 180, ',
    speed:  'rgba(200, 150, 180, ',
  },

  // tower stats are base damage, base cost, range, shots per second, shotspread in that order
  TOWER_STATS: {
    pellet:     buildTowerObjects(1, 500, 3, 1, 1),
    splash:     buildTowerObjects(2, 1500, 2, 2, 2),
    air:        buildTowerObjects(3, 2000, 3, 2, 3),
    ice:        buildTowerObjects(0, 2000, 1, 1, -1),
    earthquake: buildTowerObjects(3, 3000, 3, 1, -1),
    machine:    buildTowerObjects(3, 4000, 3, 5, -1),
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

function buildTower(baseDamage, baseCost, baseRange, shotsPerSecond, shotSpread) {
  return {
    damage:         [baseDamage, baseDamage + 2, baseDamage + 5, baseDamage + 10],
    cost:           [baseCost,   baseCost + 100, baseCost + 500, baseCost + 1000],
    range:          [baseRange,  baseRange + 1,  baseRange + 2,  baseRange + 3],
    shotsPerSecond: shotsPerSecond,
    shotSpread:     shotSpread,
  }
}