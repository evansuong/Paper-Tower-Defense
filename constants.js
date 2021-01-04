

const normalImg = createEnemyImage('res/normal');
const flyingImg = createEnemyImage('res/flying');
const speedImg = createEnemyImage('res/speed');
const strongImg = createEnemyImage('res/strong');
const bossImg = createEnemyImage('res/boss');

const paperHole = new Image();
paperHole.src = 'res/paper-hole.png';


const pellet = createImage('res/p');
const pelletDiagonal = createImage('res/pd');
const pelletShooting = createImage('res/ps');
const pelletDiagonalShooting = createImage('res/pds');
const pelletFinal = createImage('res/p2');
const pelletFinalDiagonal = createImage('res/p2d');
const pelletFinalShooting = createImage('res/p2s');
const pelletFinalDiagonalShooting = createImage('res/p2ds');

const fire = createImage('res/f');
const fireDiagonal = createImage('res/fd');
const fireFinal = createImage('res/f2');
const fireFinalDiagonal = createImage('res/f2d');
const fireShooting = createImage('res/fs');
const fireDiagonalShooting = createImage('res/fds');
const fireFinalShooting = createImage('res/f2s');
const fireFinalDiagonalShooting = createImage('res/f2ds');


const freeze = createImage('res/i');
const freezeShooting = createImage('res/is');
const freezeFinal = createImage('res/i2');
const freezeFinalShooting = createImage('res/i2s');

const earthquake = createImage('res/e');
const earthquakeShooting = createImage('res/es');
const earthquakeFinal = createImage('res/e2');
const earthquakeFinalShooting = createImage('res/e2s');

const machine = createImage('res/m');
const machineShooting = createImage('res/ms');
const machineDiagonal = createImage('res/md');
const machineDiagonalShooting = createImage('res/mds');
const machineFinal = createImage('res/m2');
const machineFinalShooting = createImage('res/m2s');
const machineFinalDiagonal = createImage('res/m2d');
const machineFinalDiagonalShooting = createImage('res/m2ds');

const air = createImage('res/a');
const airShooting = createImage('res/as');
const airFinal = createImage('res/a2');
const airFinalShooting = createImage('res/a2s');


const MAP_SIZE = 2040;
const GRID_DIMS = 15;
const NODE_SIZE = MAP_SIZE / GRID_DIMS;
const FPS = 24;
const ENEMY_SIZE = 80;
const TOWER_SIZE_OFFSET = 15;
const START_MONEY = 2000;
const SPAWN_COOLDOWN = 6;



function createImage(src) {
  const image = new Image();
  image.src = src + '.png';
  image.width = 35;
  image.height = 35;
  return image
}

function createEnemyImage(src) {
  const image = new Image();
  image.src = src + '.png';
  return image
}  





export const constants = {

  FPS:               FPS,
  ENEMY_SIZE:        ENEMY_SIZE,
  TOWER_SIZE_OFFSET: TOWER_SIZE_OFFSET,
  MAP_SIZE:          MAP_SIZE,
  START_MONEY:       START_MONEY,  
  GRID_DIMS:         GRID_DIMS,
  NODE_SIZE:         NODE_SIZE,
  SPAWN_COOLDOWN:    SPAWN_COOLDOWN,

  HEALTHBAR: {
    width:  80,
    height: 10,
    color1: 'red',
    color2: 'green'
  },

  START_POS: {
    col: 0,
    row: 7,
  },

  END_POS: {
    col: 14, 
    row: 7,
  },

  LIVES: {
    easy:   25,
    medium: 15,
    hard:   5,
  },

// enemies 6 type, 5 levels of each

  // enemy contains a base speed and base health that increase based on difficulty
  ENEMY_STATS: {
    normal: buildEnemyObjects(20, 5),
    speed:  buildEnemyObjects(20, 10),
    flying:  buildEnemyObjects(30, 5),
    strong: buildEnemyObjects(100, 3),
    boss: buildEnemyObjects(1000, 7),
  },

  ENEMY_IMAGES: {
    normal: normalImg,
    flying: flyingImg,
    strong: strongImg,
    boss: bossImg,
    speed: speedImg,
  },

  SELECTED_COLOR: 'rgba(255, 165, 0, ',

  // tower stats are base damage, base cost, range, shots per second, shotspread respectively
  TOWER_STATS: {
    pellet:     buildTowerObjects(1, 100, 2, 4, 1, true, false),
    fire:       buildTowerObjects(1, 750, 1.5, 2, 5, true, true),
    air:        buildTowerObjects(10, 1500, 3, 2, 3, false, true),
    freeze:     buildTowerObjects(1, 2000, 1.5, 1, 10, true, false),
    earthquake: buildTowerObjects(3, 3000, 1.5, 1, 10, true, false),
    machine:    buildTowerObjects(3, 4000, 3, 24, 1, true, true),
  },

  // replace with image urls
  TOWER_IMAGES: {
    pellet: buildTowerImageObject(
      pellet, 
      pelletDiagonal, 
      pelletShooting, 
      pelletDiagonalShooting,
      pelletFinal, 
      pelletFinalDiagonal,
      pelletFinalShooting,
      pelletFinalDiagonalShooting,
    ),
    fire: buildTowerImageObject(
      fire, 
      fireDiagonal, 
      fireShooting, 
      fireDiagonalShooting,
      fireFinal, 
      fireFinalDiagonal,
      fireFinalShooting,
      fireFinalDiagonalShooting,
    ),
    air: buildTowerImageObject(
      air, 
      air, 
      airShooting, 
      airShooting, 
      airFinal, 
      airFinal, 
      airFinalShooting, 
      airFinalShooting, 
    ),
    earthquake: buildTowerImageObject(
      earthquake, 
      earthquake, 
      earthquakeShooting, 
      earthquakeShooting, 
      earthquakeFinal, 
      earthquakeFinal, 
      earthquakeFinalShooting, 
      earthquakeFinalShooting, 
    ),
    freeze: buildTowerImageObject(
      freeze, 
      freeze, 
      freezeShooting, 
      freezeShooting, 
      freezeFinal, 
      freezeFinal, 
      freezeFinalShooting, 
      freezeFinalShooting, 
    ),
    machine: buildTowerImageObject(
      machine, 
      machineDiagonal, 
      machineShooting, 
      machineDiagonalShooting,
      machineFinal, 
      machineFinalDiagonal,
      machineFinalShooting,
      machineFinalDiagonalShooting,
    ), 
  },

  // replace with image urls
  NODE_IMAGES: {
    start: {
      img: paperHole,
      color: '#0D4300'
    },
    end: {
      img: paperHole,
      color: '#430000'
    },
  },
}



function buildTowerImageObject(base, baseD, baseS, baseDS, final, finalD, finalS, finalDS) {
  return {
    base: {
      regular: {
        resting: base,
        shooting: baseS
      },
      diagonal: {
        resting: baseD,
        shooting: baseDS,
      }
    },
    final: {
      regular: {
        resting: final,
        shooting: finalS,
      },
      diagonal: {
        resting: finalD,
        shooting: finalDS,
      }
    }
  }
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

function buildTowerObjects(baseDamage, baseCost, baseRange, shotsPerSecond, shotSpread, groundShot, airShot) {
  return {
    easy:   buildTower(baseDamage, baseCost, baseRange, shotsPerSecond, shotSpread, groundShot, airShot),
    medium: buildTower(baseDamage, baseCost, baseRange, shotsPerSecond, shotSpread, groundShot, airShot),
    hard:   buildTower(baseDamage, baseCost, baseRange, shotsPerSecond, shotSpread, groundShot, airShot),  
  }
}


// TODO: split cost into purchase price and upgrade cost
function buildTower(baseDamage, baseCost, baseRange, shotsPerSecond, shotSpread, groundShot, airShot) {
  return {
    damage:         [baseDamage, baseDamage + 2, baseDamage + 5, baseDamage + 10, baseDamage + 20],
    purchaseCost:   baseCost,
    upgradeCost:    [baseCost + baseCost, baseCost + baseCost * 2.5, baseCost + baseCost * 7],
    range:          [baseRange,  baseRange,  baseRange + 1,  baseRange + 1, baseRange + 2],
    shotsPerSecond: shotsPerSecond,
    shotSpread:     shotSpread,
    sellCost:       [Math.floor(baseCost * .75), Math.floor((baseCost + baseCost) * .75), Math.floor((baseCost + baseCost * 2.5)  * .75), Math.floor((baseCost + baseCost * 7) * .75)],
    groundShot:     groundShot,
    airShot:        airShot,
  }
}
