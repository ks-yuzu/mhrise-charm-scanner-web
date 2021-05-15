import {fetchImage, countImageDiffAtPoint, getMostMatchedImage, promiseAllRecursive} from './util.js'

export default class MHRiseCharmScanner {
  MAX_PAGE = 34
  COLUMNS_PER_PAGE = 10
  ROWS_PER_PAGE    = 5

  POINT_RARITY       = new cv.Point(1190, 176)
  POINT_SLOTS        = new cv.Point(1160, 200)
  POINT_SKILL1       = new cv.Point(1033, 266)
  POINT_SKILL2       = new cv.Point(1033, 317)
  POINT_SKILL_LEVEL1 = new cv.Point(1190, 289)
  POINT_SKILL_LEVEL2 = new cv.Point(1190, 340)
  POINT_PAGE         = new cv.Point(787, 582)

  POINT_CHARM_AREA_LEFT_TOP = new cv.Point(634, 359)
  SIZE_CHARM_AREA           = new cv.Size(357, 199)

  nCharms = 0
  charms = {}
  templates = null

  async init() {
    this.templates = {
      frame: fetchImage('img/templates/frame.png'),
      rare: {
        7:                    fetchImage('img/templates/rare/7.jpg'),
        6:                    fetchImage('img/templates/rare/6.jpg'),
        5:                    fetchImage('img/templates/rare/5.jpg'),
        4:                    fetchImage('img/templates/rare/4.jpg'),
      },
      lvl: {
        0:                    fetchImage('img/templates/lvl/0.jpg'),
        1:                    fetchImage('img/templates/lvl/1.jpg'),
        2:                    fetchImage('img/templates/lvl/2.jpg'),
        3:                    fetchImage('img/templates/lvl/3.jpg'),
        4:                    fetchImage('img/templates/lvl/4.jpg'),
        5:                    fetchImage('img/templates/lvl/5.jpg'),
      },
      slot: {
        '0-0-0':              fetchImage('img/templates/slot/0.jpg'),
        '1-0-0':              fetchImage('img/templates/slot/1.jpg'),
        '1-1-0':              fetchImage('img/templates/slot/11.jpg'),
        '1-1-1':              fetchImage('img/templates/slot/111.jpg'),
        '2-0-0':              fetchImage('img/templates/slot/2.jpg'),
        '2-1-0':              fetchImage('img/templates/slot/21.jpg'),
        '2-1-1':              fetchImage('img/templates/slot/211.jpg'),
        '2-2-0':              fetchImage('img/templates/slot/22.jpg'),
        '2-2-1':              fetchImage('img/templates/slot/221.jpg'),
        '3-0-0':              fetchImage('img/templates/slot/3.jpg'),
        '3-1-0':              fetchImage('img/templates/slot/31.jpg'),
        '3-1-1':              fetchImage('img/templates/slot/311.jpg'),
        '3-2-0':              fetchImage('img/templates/slot/32.jpg'),
        '3-2-1':              fetchImage('img/templates/slot/321.jpg'),
      },
      skill: {
        'KO術':               fetchImage('img/templates/skill/KO術.jpg'),
        '匠':                 fetchImage('img/templates/skill/匠.jpg'),
        '不屈':               fetchImage('img/templates/skill/不屈.jpg'),
        '体術':               fetchImage('img/templates/skill/体術.jpg'),
        '幸運':               fetchImage('img/templates/skill/幸運.jpg'),
        '心眼':               fetchImage('img/templates/skill/心眼.jpg'),
        '攻撃':               fetchImage('img/templates/skill/攻撃.jpg'),
        '業物':               fetchImage('img/templates/skill/業物.jpg'),
        '渾身':               fetchImage('img/templates/skill/渾身.jpg'),
        '無し':               fetchImage('img/templates/skill/無し.jpg'),
        '砲術':               fetchImage('img/templates/skill/砲術.jpg'),
        '耐震':               fetchImage('img/templates/skill/耐震.jpg'),
        '耳栓':               fetchImage('img/templates/skill/耳栓.jpg'),
        '逆襲':               fetchImage('img/templates/skill/逆襲.jpg'),
        '防御':               fetchImage('img/templates/skill/防御.jpg'),
        '陽動':               fetchImage('img/templates/skill/陽動.jpg'),
        '集中':               fetchImage('img/templates/skill/集中.jpg'),
        'ボマー':             fetchImage('img/templates/skill/ボマー.jpg'),
        '地質学':             fetchImage('img/templates/skill/地質学.jpg'),
        '広域化':             fetchImage('img/templates/skill/広域化.jpg'),
        '挑戦者':             fetchImage('img/templates/skill/挑戦者.jpg'),
        '早食い':             fetchImage('img/templates/skill/早食い.jpg'),
        '植生学':             fetchImage('img/templates/skill/植生学.jpg'),
        '毒耐性':             fetchImage('img/templates/skill/毒耐性.jpg'),
        '水耐性':             fetchImage('img/templates/skill/水耐性.jpg'),
        '氷耐性':             fetchImage('img/templates/skill/氷耐性.jpg'),
        '満足感':             fetchImage('img/templates/skill/満足感.jpg'),
        '火耐性':             fetchImage('img/templates/skill/火耐性.jpg'),
        '破壊王':             fetchImage('img/templates/skill/破壊王.jpg'),
        '納刀術':             fetchImage('img/templates/skill/納刀術.jpg'),
        '見切り':             fetchImage('img/templates/skill/見切り.jpg'),
        '超会心':             fetchImage('img/templates/skill/超会心.jpg'),
        '逆恨み':             fetchImage('img/templates/skill/逆恨み.jpg'),
        '達人芸':             fetchImage('img/templates/skill/達人芸.jpg'),
        '雷耐性':             fetchImage('img/templates/skill/雷耐性.jpg'),
        '鬼火纏':             fetchImage('img/templates/skill/鬼火纏.jpg'),
        '龍耐性':             fetchImage('img/templates/skill/龍耐性.jpg'),
        'ブレ抑制':           fetchImage('img/templates/skill/ブレ抑制.jpg'),
        'ランナー':           fetchImage('img/templates/skill/ランナー.jpg'),
        '乗り名人':           fetchImage('img/templates/skill/乗り名人.jpg'),
        '剛刃研磨':           fetchImage('img/templates/skill/剛刃研磨.jpg'),
        '力の解放':           fetchImage('img/templates/skill/力の解放.jpg'),
        '反動軽減':           fetchImage('img/templates/skill/反動軽減.jpg'),
        '回復速度':           fetchImage('img/templates/skill/回復速度.jpg'),
        '回避性能':           fetchImage('img/templates/skill/回避性能.jpg'),
        '壁面移動':           fetchImage('img/templates/skill/壁面移動.jpg'),
        '弱点特効':           fetchImage('img/templates/skill/弱点特効.jpg'),
        '強化持続':           fetchImage('img/templates/skill/強化持続.jpg'),
        '弾丸節約':           fetchImage('img/templates/skill/弾丸節約.jpg'),
        '弾導強化':           fetchImage('img/templates/skill/弾導強化.jpg'),
        '死中に活':           fetchImage('img/templates/skill/死中に活.jpg'),
        '気絶耐性':           fetchImage('img/templates/skill/気絶耐性.jpg'),
        '泡沫の舞':           fetchImage('img/templates/skill/泡沫の舞.jpg'),
        '泥雪耐性':           fetchImage('img/templates/skill/泥雪耐性.jpg'),
        '滑走強化':           fetchImage('img/templates/skill/滑走強化.jpg'),
        '火事場力':           fetchImage('img/templates/skill/火事場力.jpg'),
        '睡眠耐性':           fetchImage('img/templates/skill/睡眠耐性.jpg'),
        '砲弾装填':           fetchImage('img/templates/skill/砲弾装填.jpg'),
        '翔蟲使い':           fetchImage('img/templates/skill/翔蟲使い.jpg'),
        '装填拡張':           fetchImage('img/templates/skill/装填拡張.jpg'),
        '装填速度':           fetchImage('img/templates/skill/装填速度.jpg'),
        '速射強化':           fetchImage('img/templates/skill/速射強化.jpg'),
        '鈍器使い':           fetchImage('img/templates/skill/鈍器使い.jpg'),
        '風圧耐性':           fetchImage('img/templates/skill/風圧耐性.jpg'),
        '飛び込み':           fetchImage('img/templates/skill/飛び込み.jpg'),
        '高速変形':           fetchImage('img/templates/skill/高速変形.jpg'),
        '麻痺耐性':           fetchImage('img/templates/skill/麻痺耐性.jpg'),
        '回避距離UP':         fetchImage('img/templates/skill/回避距離UP.jpg'),
        'ひるみ軽減':         fetchImage('img/templates/skill/ひるみ軽減.jpg'),
        'ガード強化':         fetchImage('img/templates/skill/ガード強化.jpg'),
        'ガード性能':         fetchImage('img/templates/skill/ガード性能.jpg'),
        '攻めの守勢':         fetchImage('img/templates/skill/攻めの守勢.jpg'),
        '毒属性強化':         fetchImage('img/templates/skill/毒属性強化.jpg'),
        '笛吹き名人':         fetchImage('img/templates/skill/笛吹き名人.jpg'),
        '精霊の加護':         fetchImage('img/templates/skill/精霊の加護.jpg'),
        '腹減り耐性':         fetchImage('img/templates/skill/腹減り耐性.jpg'),
        '体力回復量UP':       fetchImage('img/templates/skill/体力回復量UP.jpg'),
        'キノコ大好き':       fetchImage('img/templates/skill/キノコ大好き.jpg'),
        'ジャンプ鉄人':       fetchImage('img/templates/skill/ジャンプ鉄人.jpg'),
        'スタミナ奪取':       fetchImage('img/templates/skill/スタミナ奪取.jpg'),
        'フルチャージ':       fetchImage('img/templates/skill/フルチャージ.jpg'),
        '剥ぎ取り鉄人':       fetchImage('img/templates/skill/剥ぎ取り鉄人.jpg'),
        '抜刀術【力】':       fetchImage('img/templates/skill/抜刀術【力】.jpg'),
        '抜刀術【技】':       fetchImage('img/templates/skill/抜刀術【技】.jpg'),
        '爆破属性強化':       fetchImage('img/templates/skill/爆破属性強化.jpg'),
        '特殊射撃強化':       fetchImage('img/templates/skill/特殊射撃強化.jpg'),
        '睡眠属性強化':       fetchImage('img/templates/skill/睡眠属性強化.jpg'),
        '麻痺属性強化':       fetchImage('img/templates/skill/麻痺属性強化.jpg'),
        '会心撃【属性】':     fetchImage('img/templates/skill/会心撃【属性】.jpg'),
        '属性やられ耐性':     fetchImage('img/templates/skill/属性やられ耐性.jpg'),
        '水属性攻撃強化':     fetchImage('img/templates/skill/水属性攻撃強化.jpg'),
        '氷属性攻撃強化':     fetchImage('img/templates/skill/氷属性攻撃強化.jpg'),
        '火属性攻撃強化':     fetchImage('img/templates/skill/火属性攻撃強化.jpg'),
        '爆破やられ耐性':     fetchImage('img/templates/skill/爆破やられ耐性.jpg'),
        '砥石使用高速化':     fetchImage('img/templates/skill/砥石使用高速化.jpg'),
        '雷属性攻撃強化':     fetchImage('img/templates/skill/雷属性攻撃強化.jpg'),
        '龍属性攻撃強化':     fetchImage('img/templates/skill/龍属性攻撃強化.jpg'),
        'アイテム使用強化':   fetchImage('img/templates/skill/アイテム使用強化.jpg'),
        'スタミナ急速回復':   fetchImage('img/templates/skill/スタミナ急速回復.jpg'),
        '散弾・拡散矢強化':   fetchImage('img/templates/skill/散弾・拡散矢強化.jpg'),
        '貫通弾・貫通矢強化': fetchImage('img/templates/skill/貫通弾・貫通矢強化.jpg'),
        '通常弾・連射矢強化': fetchImage('img/templates/skill/通常弾・連射矢強化.jpg'),
      },
    }

    this.templates.page = {}
    for (let i = 1; i <= this.MAX_PAGE; i++) {
      this.templates.page[i] = fetchImage(`img/templates/page/${i}.png`)
    }

    this.templates = await promiseAllRecursive(this.templates)
    this.reset()
  }

  reset() {
    this.nCharms = 0
    this.charms = {}
    for (let p = 1; p <= this.MAX_PAGE; p++) {
      this.charms[p] = {}
      for (let r = 1; r <= this.ROWS_PER_PAGE; r++) {
        this.charms[p][r] = {}
      }
    }
  }

  isScaned(page, row, col) {
    return this.charms[page][row][col] != null
  }

  store(params) {
    const {page, row, col} = params
    this.charms[page][row][col] = params
    this.nCharms++
  }

  scan(screenshot) {
    const page          = this._getCurrentPage(screenshot)
    const [pos, match]  = this._getCurrentCharmPos(screenshot)

    if ( match < 0.35 ) {
      // 放置すると blink するので一致度が低い時はスキップ
      // console.log(`low match degress ${match} for charm position searching. skip`)
      return null
    }

    const [col, row]    = pos
    if (this.isScaned(page, row, col)) {
      // console.log(`this charm is already scanned. skip: p${page} (${row}, ${col})`);
      return null
    }

    const rarity        = this._getRarity(screenshot)
    const slots         = this._getSlots(screenshot)
    const skills        = this._getSkills(screenshot)
    const skillLevels   = this._getSkillLevels(screenshot)

    // console.log(`scaned ${row} ${col}`)

    // console.log({col, row, match, page, rarity, slots, skills, skillLevels})
    this.store({page, row, col, rarity, slots, skills, skillLevels})
  }

  countCharms() {
    return this.nCharms
  }

  generateInsertScript() {
    const buf = []

    for (let p = 1; p <= this.MAX_PAGE; p++) {
      for (let r = 1; r <= this.ROWS_PER_PAGE; r++) {
        for (let c = 1; c <= this.COLUMNS_PER_PAGE; c++) {
          const charm = this.charms[p][r][c]
          if ( charm == null ) { continue }

          // console.log(`${charm.slots} ${charm.skills[0]} ${charm.skillLevels[0]} ${charm.skills[1]} ${charm.skillLevels[1]}`)
          buf.push({
            "第一スキル":         charm.skills[0],
            "第一スキルポイント": charm.skillLevels[0],
            "第二スキル":         charm.skills[1],
            "第二スキルポイント": charm.skillLevels[1],
            "スロット":           charm.slots,
          })
        }
      }
    }

    return `const inputs = ${JSON.stringify(buf)}

eval( await (await fetch('https://code.jquery.com/jquery-3.6.0.slim.min.js')).text() )

for (const input of inputs) {
  Object.entries(input).forEach(([key, value]) => {
    \$(\`select[aria-label="\${key}"]\`).val(value)
    \$(\`select[aria-label="\${key}"]\`)[0].dispatchEvent(new Event('change', { bubbles: true }))
  })

  \$('button:contains("追加")').click()
}`
  }

  exportAsText() {
    const buf = []

    for (let p = 1; p <= this.MAX_PAGE; p++) {
      for (let r = 1; r <= this.ROWS_PER_PAGE; r++) {
        for (let c = 1; c <= this.COLUMNS_PER_PAGE; c++) {
          const charm = this.charms[p][r][c]
          if ( charm == null ) { continue }

          buf.push(`${charm.skills[0]},${charm.skillLevels[0]},${charm.skills[1]},${charm.skillLevels[1]},${charm.slots.replace(/-/g, ',')}`)
        }
      }
    }

    return buf.join('\n')
  }

  getCharms() {
    const buf = []

    for (let p = 1; p <= this.MAX_PAGE; p++) {
      for (let r = 1; r <= this.ROWS_PER_PAGE; r++) {
        for (let c = 1; c <= this.COLUMNS_PER_PAGE; c++) {
          const charm = this.charms[p][r][c]
          if ( charm == null ) { continue }

          buf.push(charm)
        }
      }
    }

    return buf
  }

  _getRarity(screenshot) {
    return getMostMatchedImage(screenshot, this.templates.rare, this.POINT_RARITY, 63, 63)
  }

  _getSlots(screenshot) {
    return getMostMatchedImage(screenshot, this.templates.slot, this.POINT_SLOTS, 0, 63)
  }

  _getSkills(screenshot) {
    return [
      getMostMatchedImage(screenshot, this.templates.skill, this.POINT_SKILL1, 0, 63),
      getMostMatchedImage(screenshot, this.templates.skill, this.POINT_SKILL2, 0, 63),
    ]
  }

  _getSkillLevels(screenshot) {
    return [
      getMostMatchedImage(screenshot, this.templates.lvl, this.POINT_SKILL_LEVEL1, 0, 127),
      getMostMatchedImage(screenshot, this.templates.lvl, this.POINT_SKILL_LEVEL2, 0, 127),
    ]
  }

  _getCurrentPage(screenshot) {
    return getMostMatchedImage(screenshot, this.templates.page, this.POINT_PAGE, 31, 63)
  }


  _getCurrentCharmPos(screenshot) {
    const rect = new cv.Rect(this.POINT_CHARM_AREA_LEFT_TOP, this.SIZE_CHARM_AREA)
    const trimmed = screenshot.roi(rect)

    const result = new cv.Mat()
    cv.matchTemplate(trimmed, this.templates.frame, result, cv.TM_CCOEFF_NORMED)

    const {maxLoc, maxVal} = cv.minMaxLoc(result)
    // console.log({maxVal, maxLoc})

    result.delete()
    trimmed.delete()

    return [
      [
        1 + Math.floor(0.5 + maxLoc.x / 36.0),
        1 + Math.floor(0.5 + maxLoc.y / 41.0),
      ],
      maxVal,
    ]
  }
}
