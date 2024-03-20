import sqlite3InitModule               from '@sqlite.org/sqlite-wasm'
import Dexie                           from "dexie"
// import {importDB, exportDB}            from "dexie-export-import"
import cv, {Mat}                       from 'opencv-ts'
import type {Charm}                    from 'assets/mhrise/mhrise-charm'
import {skillEvaluationMap}            from 'assets/mhrise/mhrise-charm-decorations.js'


interface Options {
  isDemoMode: boolean
}


export default class MHRiseCharmManager {
  private dbName = 'mhrise-charm-manager'
  private tableName = 'charms'
  private db        = null              // SQLite WASM
  private indexeddb = null              // IndexedDB
  private charms    = null

  private workers = {}

  constructor(options: Partial<Options> = {}) {
    if ( options.isDemoMode ) {
      this.tableName = 'demoCharms'
    }

    this._init()
  }


  private sql(query: string) {
    const params = !query.startsWith('select') ? {} : {
      rowMode: 'object',
      returnValue: 'resultRows',
    }
    console.log({query, params})
    return this.db.exec(query, params)
  }


  // TODO: use placeholder
  private async _init() {
    // this.db = window.openDatabase(this.dbName, '', 'MHRise charm manager', 5000)
    const sqlite3 = await sqlite3InitModule()
    // this.db = new sqlite3.oo1.DB(`${this.dbName}.sqlite3`, 'ct')
    // this.db = new sqlite3.oo1.DB('file:local?vfs=kvvfs', 'ct')
    this.db = new sqlite3.oo1.JsStorageDb('local')
    console.log('DB open: ', this.db.isOpen())

    await this._createTable()
    // this.sql(`alter table ${this.tableName} add column imagename varchar(128)`).catch(() => {}) // for old schema

    this.indexeddb = new Dexie(this.tableName)
    this.indexeddb.version(1).stores({images: 'name'})

    this.updateCharmArray()
  }


  public reset() {
    this.sql(`drop table if exists ${this.tableName}`)
    this._createTable()
  }


  public registerCharm(charm: Charm, screenshot: Mat) {
    this.saveScreenshot(screenshot, charm.imageName)
    this.registerCharms([charm]) // TODO: impl
  }


  private _timer: number
  public registerCharms(charms: Charm[]) {
    const values = charms
      .map((c: Charm) => {
        if ( !Array.isArray(c.slots) ) { console.log('!!!!!! slots is not array !!!!!!') }
        const slots = c.slots.join(', ')
        const image = c.imageName ? `'${c.imageName}'` : 'NULL'

        return '(' + [
          `'${c.skills[0]}'`,
          c.skillLevels[0],
          `'${c.skills[1]}'`,
          c.skillLevels[1],
          slots,
          image,
        ].join(', ') + ')'
      })
      .join(',\n')

    console.log(values)
    this.sql(`
      insert or ignore into ${this.tableName}
      (skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3, imagename)
      values
      ${values}
    `)

    // this.updateCharmArray()
    ;(() => {
      clearTimeout(this._timer)
      const self = this
      this._timer = setTimeout(() => self.updateCharmArray(), 1000)
    })()
  }


  public saveScreenshot(screenshot: Mat, imageName: string) {
    this.indexeddb.images.put({
      name: imageName,
      rows: screenshot.rows,
      cols: screenshot.cols,
      type: screenshot.type(),
      data: screenshot.data.slice(0),
    })
  }


  public searchCharms(query: string) {
    const result = this.sql(query)
    // console.log({result})
    return result
  }


  private _createTable() {
    this.sql(`create table if not exists ${this.tableName}(
               skill1      varchar(20),
               skill1Level int,
               skill2      varchar(20),
               skill2Level int,
               slot1       int,
               slot2       int,
               slot3       int,
               imagename   varchar(128),
               unique (skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3))`)

    this.sql(`create index if not exists '${this.tableName}.skill1' on ${this.tableName}(skill1, skill1Level)`)
    this.sql(`create index if not exists '${this.tableName}.skill2' on ${this.tableName}(skill2, skill2Level)`)
    this.sql(`create index if not exists '${this.tableName}.slots'  on ${this.tableName}(slot1, slot2, slot3)`)
  }


  async getScreenshot(name: string) {
    const result = await this.indexeddb.images.get(name)
    const img = cv.matFromArray(result.rows, result.cols, result.type, result.data)

    return img
  }


  public updateCharmArray() {
    this.charms = this.searchCharms(`select rowid,* from ${this.tableName}`)
      .map(row => {
        if (skillEvaluationMap[row.skill1] != null && skillEvaluationMap[row.skill2] != null) {
          row.evaluation = skillEvaluationMap[row.skill1][row.skill1Level]
                         + skillEvaluationMap[row.skill2][row.skill2Level]
                         + row.slot1
                         + row.slot2
                         + row.slot3
        }

        return row
      })

    this.searchSubstitutableCharms()
  }

  async searchSubstitutableCharms() {
    // while ( typeof Module.getSubstitutesAll !== 'function' ) {
    //   await new Promise(r => setTimeout(r, 100))
    // }

    // const res = Module.getSubstitutesAll( JSON.stringify(this.charms) ) // use wasm module
    // const substitutes = JSON.parse(res)

    // for (const i in this.charms) {
    //   const [baseId, upperIds] = substitutes[0] || [Number.MAX_SAFE_INTEGER, []]

    //   if ( this.charms[i].rowid > baseId ) {
    //     console.log('internal error')
    //   }
    //   else if ( this.charms[i].rowid < baseId ) {
    //     this.charms[i].substitutableCharms = []
    //   }
    //   else {
    //     this.charms[i].substitutableCharms = upperIds.map((u: number) => this.charms[u - 1])
    //     substitutes.shift()
    //   }
    // }

    const workerName = 'substitutable-charm-searcher'
    if (this.workers[workerName] == null) {
      this.workers[workerName] = new Worker('mhrise-charm-substitution-search.worker.js')
    }

    this.workers[workerName].addEventListener('message', (e: MessageEvent) => {
      console.log(e)
      const substitutes = JSON.parse(e.data.result)
      this._applySubstitutableCharmsUpdate(substitutes)
    })

    this.workers[workerName].postMessage({ charmsJson: JSON.stringify(this.charms) })

    // for (const [baseId, upperIds] of substitutes) {
    //   charms[baseId - 1].substitutableCharms = upperIds.map(i => charms[i - 1])
    // }
  }

  private _applySubstitutableCharmsUpdate(substitutes: (number|number[])[][]) {
    for (const charm of this.charms) {
      const [baseId, upperIds] = substitutes[0] ?? [Number.MAX_SAFE_INTEGER, []]

      if ( charm.rowid > baseId ) {
        // baseId はソートされているので小さくなることはない
        console.log('internal error')
      }
      else if ( charm.rowid < baseId ) {
        // ID が出現しない護石は互換護石が見付からなかったもの. 明示的に空配列を入れておく
        charm.substitutableCharms = []
      }
      else {
        charm.substitutableCharms = (upperIds as number[]).map((upperId: number) => this.charms.find(i => i.rowid === upperId))
        substitutes.shift()
      }
    }

    this.charms = [...this.charms]
  }


  // async exportIdx() {
  //   const blob = await exportDB(this.indexeddb, {
  //     filter: (table) => table === 'images'
  //   })
  // }

  // async importIdx() {
  // }


  // TODO: charm class 作ってコンストラクタでやる
  _row2obj(row) {
    return {
      skills:      [row.skill1, row.skill2],
      skillLevels: [row.skill1Level, row.skill2Level],
      slots:       [row.slot1, row.slot2, row.slot3],
    }
  }

  _isSameCharm(a: Charm, b: Charm) {
    return JSON.stringify(a) === JSON.stringify(b)
  }
}
