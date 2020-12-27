export const levels = [
  buildLevelObject('normal', 10),
  buildLevelObject('normal', 10),
  buildLevelObject('normal', 10),
  buildLevelObject('normal', 10),
  buildLevelObject('normal', 10),
  buildLevelObject('normal', 10),
  buildLevelObject('normal', 10),
  buildLevelObject('normal', 10),
  buildLevelObject('normal', 10),
  buildLevelObject('normal', 10),
  buildLevelObject('normal', 10),
  buildLevelObject('normal', 10),
  buildLevelObject('normal', 10),
  buildLevelObject('normal', 10),
  buildLevelObject('normal', 10), 
]

function buildLevelObject(enemyType, enemyCount) {
  return {
    enemyType: enemyType,
    enemyCount: enemyCount,
  }
}