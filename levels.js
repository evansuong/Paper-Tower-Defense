export function getLevels() {
  return [
    buildLevelObject('normal', 10),

    buildLevelObject('speed', 10),
    buildLevelObject('air', 10),
    buildLevelObject('boss', 1),
    // buildLevelObject('normal', 10),
    // buildLevelObject('normal', 10),
    // buildLevelObject('speed', 10),
    // buildLevelObject('normal', 10),
    // buildLevelObject('speed', 10),
    // buildLevelObject('normal', 10),
    // buildLevelObject('normal', 10),
    // buildLevelObject('normal', 10),
    // buildLevelObject('normal', 10),
    // buildLevelObject('normal', 10),
    // buildLevelObject('normal', 10),
    // buildLevelObject('normal', 10),
    // buildLevelObject('normal', 10),
    // buildLevelObject('normal', 10),
    // buildLevelObject('normal', 10),
    // buildLevelObject('normal', 10), 
  ]
} 
  
function buildLevelObject(enemyType, enemyCount) {
  return {
    enemyType: enemyType,
    enemyCount: enemyCount,
  }
}
 