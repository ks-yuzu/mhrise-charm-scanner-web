export interface CharmEntry {
  rowid:       number
  skill1:      string
  skill1Level: number
  skill2:      string
  skill2Level: number
  slot1?:      number
  slot2?:      number
  slot3?:      number
  imagename?:  string
}

export interface FlatCharm {    // TODO: remove
  skill1:      string
  skill1Level: number
  skill2:      string
  skill2Level: number
  slot1?:      number
  slot2?:      number
  slot3?:      number
}


export interface Charm {
  skills:      string[]
  skillLevels: number[]
  slots:       number[]
}
