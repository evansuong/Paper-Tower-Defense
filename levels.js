export function getLevels() {
  return [
    buildLevelObject('normal', 10),
    buildLevelObject('normal', 20),
    buildLevelObject('normal', 20),
    buildLevelObject('strong', 10),
    buildLevelObject('normal', 20),
    buildLevelObject('speed', 15),
    buildLevelObject('speed', 10),
    buildLevelObject('strong', 20),
    buildLevelObject('normal', 30),
    buildLevelObject('boss', 1),
    buildLevelObject('strong', 25),
    buildLevelObject('flying', 30),
    buildLevelObject('normal', 20),
    buildLevelObject('speed', 15),
    buildLevelObject('flying', 10),
    buildLevelObject('strong', 10),
    buildLevelObject('speed', 10),
    buildLevelObject('flying', 10),
    buildLevelObject('strong', 10),
    buildLevelObject('boss', 2),
  ]
} 
  
function buildLevelObject(enemyType, enemyCount) {
  return {
    enemyType: enemyType,
    enemyCount: enemyCount,
  }
}
 