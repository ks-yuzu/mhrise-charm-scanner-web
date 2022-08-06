import {neatJSON} from 'neatjson'
import {CharmDecoration, DECORATION_LIST} from './decoration-list'

export function getSkillToDecorationArray(decorationList: CharmDecoration[] = DECORATION_LIST) {
  // let order = 0
  const decorationData = []
  for (const d of decorationList) {
    if (d.skill == null) { console.log('invalid skill name') }

    const data = [d.name, d.skill, d.skillLevel, d.slot]

    const skillArray = decorationData.find(i => i[0] === d.skill)
    if (skillArray == null) {
      decorationData.push([d.skill, [data]])
    }
    else {
      skillArray[1].push(data)
    }
  }

  return decorationData
}

if (require.main === module) {
  console.log(
    neatJSON(getSkillToDecorationArray(), {
    short: true,
    wrap: 40,
    aligned: true,
    padding: 1,
    after_comma: 1,
    })
  )
}


// let order = 0
// const decorationData = {}
// for (const d of data) {
//   if (decorationData[d.skill] == null) {
//     decorationData[d.skill] = { order: order++, decorations: [] }
//   }
//   decorationData[d.skill].decorations.push({name: d.name, skillLevel: d.skillLevel, slot: d.slot })
// }
// Object.entries(decorationData))
//   .map(([skill, {order, decorations}]) => {
// })
