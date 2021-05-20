import {skillToSlotLevel} from './mhrise-charm-decorations.js'

export default class MHRiseCharmManager {
  MAX_SKILLS = 2
  MAX_SLOTS  = 3

  db        = null              // WebSQL
  indexeddb = null              // IndexedDB

  constructor() {
    this.db = openDatabase('mhrise-charm-manager', '', 'MHRise charm manager', 5000)
    this._createTable()

    this.indexeddb = new Dexie('charms')
    this.indexeddb.version(1).stores({images: 'name'})
  }


  sql(query, placeholderValues) {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        tx => tx.executeSql(
          query,
          placeholderValues,
          (tx, result) => resolve({tx, result}),
          (...args) => reject(args)
        )
      )
    })
  }


  async reset() {
    await this.sql('drop table if exists charms')
    await this._createTable()
  }


  async registerCharms(charms) {
    const values = charms
      .map(c => `("${c.skills[0]}", ${c.skillLevels[0]}, "${c.skills[1]}", ${c.skillLevels[1]}, ${c.slots.replace(/-/g, ', ')}, "${c.imageName}")`)
      .join(',\n')

    console.log(values)
    await this.sql(`insert or ignore into charms values ${values}`)
  }


  async searchCharms(query) {
    const {tx, result} = await this.sql(query)
    return result.rows
  }


  async _createTable() {
    await this.sql(`create table if not exists charms(
               skill1      varchar(20),
               skill1Level int,
               skill2      varchar(20),
               skill2Level int,
               slot1       int,
               slot2       int,
               slot3       int,
               imagename   varchar(128),
               unique (skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3))`)

    await this.sql(`create index if not exists 'charms.skill1' on charms(skill1, skill1Level)`)
    await this.sql(`create index if not exists 'charms.skill2' on charms(skill2, skill2Level)`)
    await this.sql(`create index if not exists 'charms.slots' on charms(slot1, slot2, slot3)`)
  }


  async getScreenshot(name) {
    const result = await this.indexeddb.images.get(name)
    const img = cv.matFromArray(result.rows, result.cols, result.type, result.data)

    return img
  }


  async findSubstitutableCharms(charm) {
    // interface Charm {
    //   skills:      string[]
    //   skillLevels: number[]
    //   slots:       number[]
    // }
    const sl = []
    const substitutableCharms = []

    for (sl[0] = charm.skillLevels[0]; sl[0] >= 0; sl[0]--) {
      for (sl[1] = charm.skillLevels[1]; sl[1] >= 0; sl[1]--) {
        // console.log(sl[0], sl[1])
        // 装飾品で実現するスキルレベル
        const skillLevelsRequiredInDecorations = [...Array(this.MAX_SKILLS).keys()].map(i => charm.skillLevels[i] - sl[i])

        // スキル用の要求スロット数
        const slotRequirementForSkill = skillLevelsRequiredInDecorations.reduce(((a, b) => a + b), 0)

        // 装飾品の要求スロット数 + charm のスロット数 > 3 なら実現不可能
        if ( slotRequirementForSkill + charm.slots.filter(i => i).length > this.MAX_SLOTS ) {
          // それ以上 sl (=スキル要求) を減らして探索しても意味がない
          break
        }

        const requiredSlots = [
          ...charm.slots,
          ...Array.from( {length: skillLevelsRequiredInDecorations[0]}, () => skillToSlotLevel[charm.skills[0]] ),
          ...Array.from( {length: skillLevelsRequiredInDecorations[1]}, () => skillToSlotLevel[charm.skills[1]] ),
        ].filter(i => i).sort().reverse()

        // conbination にしないといけない
        const skill1Constraints = sl[0] ? `(skill1 = '${charm.skills[0]}' and skill1Level >= ${sl[0]})` : ''
        const skill2Constraints = sl[1] ? `(skill2 = '${charm.skills[1]}' and skill2Level >= ${sl[1]})` : ''
        const skillConstraints = [skill1Constraints, skill2Constraints].filter(i => i).join(' and ')

        const skill1ConstraintsRev = sl[1] ? `(skill1 = '${charm.skills[1]}' and skill1Level >= ${sl[1]})` : ''
        const skill2ConstraintsRev = sl[0] ? `(skill2 = '${charm.skills[0]}' and skill2Level >= ${sl[0]})` : ''
        const skillConstraintsRev  = [skill1ConstraintsRev, skill2ConstraintsRev].filter(i => i).join(' and ')

        const sc = skillConstraints.length
              ? '(' + [`(${skillConstraints})`, `(${skillConstraintsRev})`].filter(i => i).join(' or ') + ') and '
              : ''

        const query =`select rowid,* from charms where ${sc} slot1 >= ${requiredSlots[0] || 0} and slot2 >= ${requiredSlots[1] || 0} and slot3 >= ${requiredSlots[2] || 0}`
        // console.log(query)
        const {result} = await this.sql(query)
        // console.log(result.rows)

        substitutableCharms.push(
          ...[...result.rows].filter(i => !this._isSameCharm(this._row2obj(i), charm))
        )
        // TODO: 合計スキルレベルの条件 (WebSQL 用) は必要？
      }
    }

    return substitutableCharms.sort((a, b) => (a.rowid < b.rowid) ? -1 : (a.rowid > b.rowid) ? 1 : 0)
  }

  // TODO: charm class 作ってコンストラクタでやる
  _row2obj(row) {
    return {
      skills:      [row.skill1, row.skill2],
      skillLevels: [row.skill1Level, row.skill2Level],
      slots:       [row.slot1, row.slot2, row.slot3],
    }
  }

  _isSameCharm(a, b) {
    return JSON.stringify(a) === JSON.stringify(b)
  }
}
