export interface CharmEntry {
  rowid:       number
  rarity?:     number
  page?:       number
  row?:        number
  col?:        number
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
  rarity?:     number
  page?:       number
  row?:        number
  col?:        number
  skills:      string[]
  skillLevels: number[]
  slots:       number[]
  imageName?:  string
}


// TODO: class にして equals にする
export function isSameCharm(c1: Charm, c2: Charm) {
  const isSameArray = (a1: (string|number)[], a2: (string|number)[]) => {
    return a1.length === a2.length && a1.every(i => a2.includes(i))
  }

  return isSameArray(c1.skills, c2.skills)
      && isSameArray(c1.skillLevels, c2.skillLevels)
      && isSameArray(c1.slots, c2.slots)
}

export function flatCharm2charm(c: FlatCharm): Charm {
  return {
    skills:      [c.skill1, c.skill2],
    skillLevels: [c.skill1Level, c.skill2Level],
    slots:       [c.slot1, c.slot2, c.slot3],
  }
}
