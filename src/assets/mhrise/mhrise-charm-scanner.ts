import cv, {Mat, Point}                                             from 'opencv-ts'
import Dexie                                                        from "dexie"
import type {Charm}                                                 from 'assets/mhrise/mhrise-charm'
import {MAX_PAGE, ROWS_PER_PAGE_IN_EQLIST, COLS_PER_PAGE_IN_EQLIST, ROWS_PER_PAGE_IN_RINNE, COLS_PER_PAGE_IN_RINNE}
                                                                    from 'assets/mhrise/metadata'
import {fetchImage, getMostMatchedImage, promiseAllRecursive}       from 'util.js'
import {dumpImage, dumpImageNewline, setNextCanvas, setFirstCanvas} from 'util.js' // for debug

export const SCAN_MODE = {
  MODE_EQUIP_LIST: 'equip_list',
  MODE_RINNE: 'rinne',
} as const
export type ScanMode = typeof SCAN_MODE[keyof typeof SCAN_MODE]

export const SCAN_SKIP_MODE = {
  SKIP_SCANNED_CHARM: 'skip_scanned_charm',
  SKIP_SAME_CHARM_AS_IMMEDIATELY_BEFORE: 'skip_same_charm_as_immediately_before',
  NO_SKIP: 'no_skip',
}
export type ScanSkipMode = typeof SCAN_SKIP_MODE[keyof typeof SCAN_SKIP_MODE]


export default class MHRiseCharmScanner {
  private readonly EQUIPMENT_SPEC_HEADER_BASE_X = 1023
  private readonly EQUIPMENT_SPEC_HEADER_BASE_Y = 88

  private readonly POINT_RARITY                = new cv.Point(1190, 176)
  private readonly POINT_SLOTS                 = new cv.Point(1160, 200)
  private readonly POINT_SKILL1                = new cv.Point(1033, 266)
  private readonly POINT_SKILL2                = new cv.Point(1033, 317)
  private readonly POINT_SKILL_LEVEL1          = new cv.Point(1190, 290)
  private readonly POINT_SKILL_LEVEL2          = new cv.Point(1190, 340)

  // 装備確認画面
  private readonly POINT_PAGE                  = new cv.Point(787, 582) // ページ番号 (1桁数字 & 2桁数字の1桁目)
  private readonly POINT_PAGE_SECOND_DIGIT     = new cv.Point(796, 582) // ページ番号 (2桁数字)
  private readonly POINT_CHARM_AREA            = new cv.Point(634, 359) // アイコンリストの左上座標
  private readonly SIZE_CHARM_AREA             = new cv.Size(357, 199)  // アイコンリストのサイズ

  // 輪廻画面 (位置調整する都合で, EQUIPMENT_SPEC_HEADER_BASE に相対位置を足して定義)
  // offset(-334, 14) で adjust されるはず? 手元のキャプボでは 1px ずれるので (-335, 13) で確認
  private readonly POINT_PAGE_IN_RINNE         = new cv.Point(796, 532) // ページ番号
  private readonly POINT_PAGE_SECOND_DIGIT_IN_RINNE = new cv.Point(805, 532) // ページ番号 (2桁数字)
  private readonly POINT_CHARM_AREA_IN_RINNE   = new cv.Point(657, 358) // アイコンリストの左上座標 (-366, 270)
  private readonly SIZE_CHARM_AREA_IN_RINNE    = new cv.Size(329, 164)  // アイコンリストのサイズ

  private readonly scanMode: ScanMode
  private readonly scanSkipMode: ScanSkipMode

  private readonly ROWS_PER_PAGE: number
  private readonly COLS_PER_PAGE: number

  private          prevPosition = {page: -1, row: -1, col: -1}

  private          indexeddb = null
  private          nCharms = 0 // このスキャンで読んだ護石の数
  private          charms = {} // このスキャンで読んだ護石のスペック

  adjustOffset = {x: 0, y: 0}

  static templates: null | {[key: string]: {[key: string]: Mat}}

  static async init() {
    const templateFetchPromises = {
      others: {
        charmSelectFrame:         fetchImage('img/templates/others/charm-select-frame.png'),
        charmSelectFrameForRinne: fetchImage('img/templates/others/charm-select-frame-for-rinne.png'),
        equipmentSpecHeader:      fetchImage('img/templates/others/equipment-spec-header.png'),
      },
      page: {},
      'page-parts': {
        0:                    fetchImage('img/templates/page-parts/0.png'),
        1:                    fetchImage('img/templates/page-parts/1.png'),
        2:                    fetchImage('img/templates/page-parts/2.png'),
        3:                    fetchImage('img/templates/page-parts/3.png'),
        4:                    fetchImage('img/templates/page-parts/4.png'),
        5:                    fetchImage('img/templates/page-parts/5.png'),
        6:                    fetchImage('img/templates/page-parts/6.png'),
        7:                    fetchImage('img/templates/page-parts/7.png'),
        8:                    fetchImage('img/templates/page-parts/8.png'),
        9:                    fetchImage('img/templates/page-parts/9.png'),
      },
      rare: {
        10:                   fetchImage('img/templates/rare/10.jpg'),
        9:                    fetchImage('img/templates/rare/9.jpg'),
        8:                    fetchImage('img/templates/rare/8.jpg'),
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
        '4-0-0':              fetchImage('img/templates/slot/4.jpg'),
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
        // added in sunbreak
        'チャージマスター':   fetchImage('img/templates/skill/チャージマスター.jpg'),
        'チューンアップ':     fetchImage('img/templates/skill/チューンアップ.jpg'),
        '供応':               fetchImage('img/templates/skill/供応.jpg'),
        '刃鱗磨き':           fetchImage('img/templates/skill/刃鱗磨き.jpg'),
        '合気':               fetchImage('img/templates/skill/合気.jpg'),
        '壁面移動【翔】':     fetchImage('img/templates/skill/壁面移動【翔】.jpg'),
        '攻勢':               fetchImage('img/templates/skill/攻勢.jpg'),
        '災禍転福':           fetchImage('img/templates/skill/災禍転福.jpg'),
        '研磨術【鋭】':       fetchImage('img/templates/skill/研磨術【鋭】.jpg'),
        '連撃':               fetchImage('img/templates/skill/連撃.jpg'),
      },
    }

    for (let i = 1; i <= 9; i++) {
      templateFetchPromises.page[i] = fetchImage(`img/templates/page/${i}.png`)
    }

    MHRiseCharmScanner.templates = await promiseAllRecursive(templateFetchPromises)
  }

  constructor({scanMode, scanSkipMode}: {scanMode: ScanMode, scanSkipMode: ScanSkipMode}) {
    this.scanMode = scanMode ?? SCAN_MODE.MODE_EQUIP_LIST
    this.scanSkipMode = scanSkipMode ?? SCAN_SKIP_MODE.SKIP_SAME_CHARM_AS_IMMEDIATELY_BEFORE
    this.ROWS_PER_PAGE = (scanMode === SCAN_MODE.MODE_RINNE) ? ROWS_PER_PAGE_IN_RINNE : ROWS_PER_PAGE_IN_EQLIST
    this.COLS_PER_PAGE = (scanMode === SCAN_MODE.MODE_RINNE) ? COLS_PER_PAGE_IN_RINNE : COLS_PER_PAGE_IN_EQLIST

    this.reset()
    this.indexeddb = new Dexie('charms')
    this.indexeddb.version(1).stores({images: 'name'})
  }

  public reset() {
    this.nCharms = 0
    this.charms = {}
    for (let p = 1; p <= MAX_PAGE; p++) {
      this.charms[p] = {}
      for (let r = 1; r <= this.ROWS_PER_PAGE; r++) {
        this.charms[p][r] = {}
      }
    }
  }


  private _isScaned(page: number, row: number, col: number) {
    return this._getCache({page, row, col}) != null
  }

  private _setCache({page, row, col}: {page: number, row: number, col: number}, charm: Charm) {
    this.charms[page][row][col] = charm
  }

  private _getCache({page, row, col}: {page: number, row: number, col: number}) {
    return this.charms[page][row][col]
  }


  public getAdjustOffset(screenshot: Mat) {
    const template = MHRiseCharmScanner.templates.others.equipmentSpecHeader
    const result = new cv.Mat()
    cv.matchTemplate(screenshot, template, result, cv.TM_CCOEFF_NORMED)
    const {maxLoc, maxVal} = cv.minMaxLoc(result)
    result.delete()

    return {
      x: maxLoc.x - this.EQUIPMENT_SPEC_HEADER_BASE_X,
      y: maxLoc.y - this.EQUIPMENT_SPEC_HEADER_BASE_Y,
    }
  }

  // 事前に Point オブジェクトの調整をする (無駄にヒープを使って GC 誘発を避けたい)
  public adjustPosition(screenshot: Mat) {
    const offset = this.getAdjustOffset(screenshot)
    console.log({offset})

    this.POINT_RARITY              .x += (offset.x - this.adjustOffset.x)
    this.POINT_RARITY              .y += (offset.y - this.adjustOffset.y)
    this.POINT_SLOTS               .x += (offset.x - this.adjustOffset.x)
    this.POINT_SLOTS               .y += (offset.y - this.adjustOffset.y)
    this.POINT_SKILL1              .x += (offset.x - this.adjustOffset.x)
    this.POINT_SKILL1              .y += (offset.y - this.adjustOffset.y)
    this.POINT_SKILL2              .x += (offset.x - this.adjustOffset.x)
    this.POINT_SKILL2              .y += (offset.y - this.adjustOffset.y)
    this.POINT_SKILL_LEVEL1        .x += (offset.x - this.adjustOffset.x)
    this.POINT_SKILL_LEVEL1        .y += (offset.y - this.adjustOffset.y)
    this.POINT_SKILL_LEVEL2        .x += (offset.x - this.adjustOffset.x)
    this.POINT_SKILL_LEVEL2        .y += (offset.y - this.adjustOffset.y)
    this.POINT_PAGE                .x += (offset.x - this.adjustOffset.x)
    this.POINT_PAGE                .y += (offset.y - this.adjustOffset.y)
    this.POINT_PAGE_SECOND_DIGIT   .x += (offset.x - this.adjustOffset.x)
    this.POINT_PAGE_SECOND_DIGIT   .y += (offset.y - this.adjustOffset.y)
    this.POINT_PAGE_IN_RINNE       .x += (offset.x - this.adjustOffset.x)
    this.POINT_PAGE_IN_RINNE       .y += (offset.y - this.adjustOffset.y)
    this.POINT_PAGE_SECOND_DIGIT_IN_RINNE.x += (offset.x - this.adjustOffset.x)
    this.POINT_PAGE_SECOND_DIGIT_IN_RINNE.y += (offset.y - this.adjustOffset.y)
    this.POINT_CHARM_AREA          .x += (offset.x - this.adjustOffset.x)
    this.POINT_CHARM_AREA          .y += (offset.y - this.adjustOffset.y)
    this.POINT_CHARM_AREA_IN_RINNE .x += (offset.x - this.adjustOffset.x)
    this.POINT_CHARM_AREA_IN_RINNE .y += (offset.y - this.adjustOffset.y)
    console.log({POINT_PAGE_IN_RINNE: this.POINT_PAGE_IN_RINNE})

    this.adjustOffset = offset
  }


  public scan(screenshot: Mat, movieName: string, matchThresholdOverwrite?: number): {charm: Charm, isCache: boolean} | null {
    const page = this._getCurrentPage(screenshot)
    // if (page <= 0 || MAX_PAGE < page) {
    //   console.log(`invalid page number: ${page}`)
    //   return null
    // }

    // スキャンモード (装備確認ページと輪廻ページ) でパラメータ設定を分岐
    const {pos, match, matchThreshold} = (() => {
      switch (this.scanMode) {
        case SCAN_MODE.MODE_EQUIP_LIST:
          return {
            ...this._getCurrentCharmPos(screenshot),
            matchThreshold: matchThresholdOverwrite ?? 0.31,
          }
        case SCAN_MODE.MODE_RINNE:
          return {
            ...this._getCurrentCharmPosForRinne(screenshot),
            matchThreshold: matchThresholdOverwrite ?? 0.28,
          }
        default:
          throw new Error('[internal error] invalid scan mode')
      }
    })()

    if ( match < matchThreshold ) {
      // 放置すると blink するので一致度が低い時はスキップ
      // console.log(`low match degress ${match} for charm position searching. skip`)
      return null
    }

    const [col, row] = pos
    // console.log(`scaned ${row} ${col}`)

    const isCacheEnabled = (() => {
      switch (this.scanSkipMode) {
        case SCAN_SKIP_MODE.SKIP_SCANNED_CHARM:
          return true
        case SCAN_SKIP_MODE.SKIP_SAME_CHARM_AS_IMMEDIATELY_BEFORE:
          return page === this.prevPosition.page && col === this.prevPosition.col && row === this.prevPosition.row
        default:
          return false
      }
    })()
    this.prevPosition = {page, row, col}

    if ( isCacheEnabled ) {
      const cache = this._getCache({ page, row, col })
      if (cache != null) {
        // console.log(`this charm is already scanned. skip: p${page} (${row}, ${col})`);
        return { charm: cache, isCache: true }
      }
    }

    const rarity        = this._getRarity(screenshot)
    const slots         = this._getSlots(screenshot)
    const skills        = this._getSkills(screenshot)
    const skillLevels   = this._getSkillLevels(screenshot)
    skills.forEach((i, idx) => {
      if (i === '無し') { skillLevels[idx] = 0 }
    })
    // console.log(JSON.stringify({col, row, match, page, rarity, slots, skills, skillLevels}, null, 2))

    const imageName = `${movieName}_${page}-${row}-${col}`
    const charm = {page, row, col, rarity, slots, skills, skillLevels, imageName}
    this.nCharms++
    this._setCache({page, row, col}, charm)
    return {charm, isCache: false}
  }


  public countCharms() {
    return this.nCharms
  }


  public exportAsText() {
    const buf = []

    for (let p = 1; p <= MAX_PAGE; p++) {
      for (let r = 1; r <= this.ROWS_PER_PAGE; r++) {
        for (let c = 1; c <= this.COLS_PER_PAGE; c++) {
          const charm = this.charms[p][r][c]
          if ( charm == null ) { continue }

          buf.push([
            charm.skills[0],
            charm.skillLevels[0],
            charm.skills[1],
            charm.skillLevels[1],
            ...charm.slots,
          ].join(','))
        }
      }
    }

    return buf.join('\n')
  }


  public getCharms() {
    const buf = []

    for (let p = 1; p <= MAX_PAGE; p++) {
      for (let r = 1; r <= this.ROWS_PER_PAGE; r++) {
        for (let c = 1; c <= this.COLS_PER_PAGE; c++) {
          const charm = this.charms[p][r][c]
          if ( charm == null ) { continue }

          buf.push(charm)
        }
      }
    }

    return buf
  }

  private _getTrimRect(templates: {[key: string]: Mat}, point: Point) {
    const template = Object.values(templates).shift()
    const size = new cv.Size(template.cols, template.rows)
    const rect = new cv.Rect(point, size)
    return rect
  }


  private _getRarity(screenshot: Mat): number {
    const templates     = MHRiseCharmScanner.templates.rare
    const rect          = this._getTrimRect(templates, this.POINT_RARITY)
    const diffThreshold = 63
    return getMostMatchedImage(screenshot, templates, rect, diffThreshold).name
  }


  private _getSlots(screenshot: Mat): number[] {
    const templates     = MHRiseCharmScanner.templates.slot
    const rect          = this._getTrimRect(templates, this.POINT_SLOTS)
    const diffThreshold = 63
    return getMostMatchedImage(screenshot, templates, rect, diffThreshold).name.split('-').map(i => parseInt(i))
  }


  private _getSkills(screenshot: Mat) {
    const templates     = MHRiseCharmScanner.templates.skill
    const rect1         = this._getTrimRect(templates, this.POINT_SKILL1)
    const rect2         = this._getTrimRect(templates, this.POINT_SKILL2)
    const diffThreshold = 63

    return [
      getMostMatchedImage(screenshot, templates, rect1, diffThreshold).name,
      getMostMatchedImage(screenshot, templates, rect2, diffThreshold).name,
    ]
  }


  private _getSkillLevels(screenshot: Mat): number[] {
    const templates     = MHRiseCharmScanner.templates.lvl
    const rect1         = this._getTrimRect(templates, this.POINT_SKILL_LEVEL1)
    const rect2         = this._getTrimRect(templates, this.POINT_SKILL_LEVEL2)
    const diffThreshold = 127

    const filter = (input: Mat) => {
      const hsv = new cv.Mat()
      cv.cvtColor(input, hsv, cv.COLOR_BGR2HSV, 3)

      const channels = new cv.MatVector()
      cv.split(hsv, channels)
      const brightness = channels.get(2)
      const binary = new cv.Mat()
      cv.threshold(brightness, binary, 110, 255, cv.THRESH_OTSU)

      cv.cvtColor(binary, input, cv.COLOR_GRAY2BGRA)

      binary.delete()
      channels.delete()
      hsv.delete()
    }

    return [
      getMostMatchedImage(screenshot, templates, rect1, diffThreshold, filter).name,
      getMostMatchedImage(screenshot, templates, rect2, diffThreshold, filter).name,
    ].map(i => parseInt(i))
  }


  private _getCurrentPage(screenshot: Mat) {
    // 1桁と仮定してマッチング
    const candidateForAssumingOneDigitNumber = (() => {
      const templates = MHRiseCharmScanner.templates.page
      const rect = this._getTrimRect(
        templates,
        this.scanMode === SCAN_MODE.MODE_RINNE ? this.POINT_PAGE_IN_RINNE : this.POINT_PAGE
      )
      const diffThreshold = 127

      return getMostMatchedImage(screenshot, templates, rect, diffThreshold)
    })()

    if (candidateForAssumingOneDigitNumber.diffCount === 0) {
      return parseInt(candidateForAssumingOneDigitNumber.name)
    }

    // setFirstCanvas()
    // const debug = (images: any) => {
    //   setNextCanvas(); dumpImage(images.trimmed)
    //   setNextCanvas(); dumpImage(images.templateImage)
    //   // setNextCanvas(); dumpImage(images.templateMask)
    //   // setNextCanvas(); dumpImage(images.masked)
    //   setNextCanvas(); dumpImage(images.diff)
    //   setNextCanvas(); dumpImage(images.result)
    //   dumpImageNewline()
    // }

    // 2桁と仮定してマッチング
    const candidateForAssumingTwoDigitNumber = (() => {
      const templates = MHRiseCharmScanner.templates['page-parts']
      const rectForFirstDigit = this._getTrimRect(
        templates,
        this.scanMode === SCAN_MODE.MODE_RINNE ? this.POINT_PAGE_IN_RINNE : this.POINT_PAGE
      )
      const rectForSecondDigit = this._getTrimRect(
        templates,
        this.scanMode === SCAN_MODE.MODE_RINNE ? this.POINT_PAGE_SECOND_DIGIT_IN_RINNE : this.POINT_PAGE_SECOND_DIGIT
      )
      const diffThreshold = 127

      const firstDigitCandidate  = getMostMatchedImage(screenshot, templates, rectForFirstDigit, diffThreshold)
      const secondDigitCandidate = getMostMatchedImage(screenshot, templates, rectForSecondDigit, diffThreshold)

      return {
        name: '' + firstDigitCandidate.name + secondDigitCandidate.name,
        diffCount: firstDigitCandidate.diffCount + secondDigitCandidate.diffCount,
      }
    })()

    // 1桁/2桁で一致度が高い方を返す
    if (candidateForAssumingOneDigitNumber.diffCount < candidateForAssumingTwoDigitNumber.diffCount) {
      return parseInt(candidateForAssumingOneDigitNumber.name)
    }
    else {
      return parseInt(candidateForAssumingTwoDigitNumber.name)
    }
  }


  private _getCurrentCharmPos(screenshot: Mat) {
    const rect = new cv.Rect(this.POINT_CHARM_AREA, this.SIZE_CHARM_AREA)
    const trimmed = screenshot.roi(rect)

    const template = MHRiseCharmScanner.templates.others.charmSelectFrame
    const result = new cv.Mat()
    cv.matchTemplate(trimmed, template, result, cv.TM_CCOEFF_NORMED)

    const {maxLoc, maxVal} = cv.minMaxLoc(result)

    result.delete()
    trimmed.delete()

    return {
      pos: [
        1 + Math.floor(0.5 + maxLoc.x / 36.0),
        1 + Math.floor(0.5 + maxLoc.y / 41.0),
      ],
      match: maxVal,
    }
  }


  // TODO: 元の関数と統合 (mode で分岐するように)
  private _getCurrentCharmPosForRinne(screenshot: Mat) {
    const rect = new cv.Rect(this.POINT_CHARM_AREA_IN_RINNE, this.SIZE_CHARM_AREA_IN_RINNE)
    const trimmed = screenshot.roi(rect)

    const template = MHRiseCharmScanner.templates.others.charmSelectFrameForRinne
    const result = new cv.Mat()
    cv.matchTemplate(trimmed, template, result, cv.TM_CCOEFF_NORMED)

    const {maxLoc, maxVal} = cv.minMaxLoc(result)

    // debug
    // if (maxVal > 0.3) {
    //   console.log({ maxLoc, maxVal })
    //   const color = new cv.Scalar(0, 0, 255)
    //   const p2 = new cv.Point(maxLoc.x + template.cols, maxLoc.y + template.rows)
    //   cv.rectangle(trimmed, maxLoc, p2, color, cv.LINE_4)
    //   setFirstCanvas()
    //   dumpImage(trimmed)
    // }

    result.delete()
    trimmed.delete()

    return {
      pos: [
        1 + Math.floor(0.5 + maxLoc.x / 41.0),
        1 + Math.floor(0.5 + maxLoc.y / 41.0),
      ],
      match: maxVal,
    }
  }
}
