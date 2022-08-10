import {DECORATION_LIST, CharmDecoration} from './decoration-list'

const MAX_SKILL_LEVEL = 7

export function getSkillToDecorationMap(decorationList: CharmDecoration[] = DECORATION_LIST) {
  const decorationData = {}
  for (const d of decorationList) {
    decorationData[d.skill] ??= []
    decorationData[d.skill].unshift(d)
  }

  return decorationData
}
const skillToDecorationMap = getSkillToDecorationMap(DECORATION_LIST)

export function evaluateSkill(skill: string, level: number, currentEvaluationValue = 0, currentDecorationSet = []) {
  const decorations = skillToDecorationMap[skill]

  let minEvaluationValue = null
  // let candidateDecorationSet = []

  // console.log({skill, level, currentEvaluationValue, currentDecorationSet})
  // if (level <= 0) { return {evaluationValue: currentEvaluationValue, decorationSet: currentDecorationSet} }
  if (level <= 0) { return currentEvaluationValue }

  for (const d of decorations) {
    // const {evaluationValue, decorationSet} = evaluateSkill(
    const evaluationValue = evaluateSkill(
      skill,
      level - d.skillLevel,
      currentEvaluationValue + d.slot,
      [...currentDecorationSet, d]
    )
    if (minEvaluationValue == null || evaluationValue < minEvaluationValue) {
      minEvaluationValue = evaluationValue
      // candidateDecorationSet = decorationSet
    }
  }

  // return {
  //   evaluationValue: minEvaluationValue,
  //   decorationSet:   candidateDecorationSet,
  // }
  return minEvaluationValue
}


// console.log(evaluateSkill('水属性攻撃強化', 5))
// console.log(evaluateSkill('幸運', 3))

const skillEvaluationMap: {[key: string]: {[key: number]: any}} = {}
for (const skill of Object.keys(skillToDecorationMap)) {
  for (let i = 1; i <= MAX_SKILL_LEVEL; i++) {
    skillEvaluationMap[skill] ??= {0: 0}
    skillEvaluationMap[skill][i] = evaluateSkill(skill, i)
  }
}
//console.log(JSON.stringify(skillEvaluationMap, null, 2))
console.log(JSON.stringify(skillEvaluationMap))
