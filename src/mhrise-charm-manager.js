export default class MHRiseCharmManager {
  db = null


  constructor() {
    this.db = openDatabase('mhrise-charm-manager', '', 'MHRise charm manager', 5000)
    this._createTable()
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
      .map(c => `("${c.skills[0]}", ${c.skillLevels[0]}, "${c.skills[1]}", ${c.skillLevels[1]}, ${c.slots.replace(/-/g, ', ')})`)
      .join(',\n')

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
               unique (skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3))`)
  }
}
