export function getLevels() {
  return [
    buildLevelObject('normal', 1),
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
 