#pragma once

#include <iostream>
#include <vector>
#include <functional>
#include <iterator>
#include "nlohmann/json.hpp"
#include "indices.hpp"
#include "charm-decorations.hpp"
#include "util.hpp"

#define ALL(a)  std::begin(a), std::end(a)

using JSON = nlohmann::json;
using util::lang::indices;

template<class InputIt1, class InputIt2, class BinaryPredicate>
const auto& every = static_cast<bool(*)(InputIt1, InputIt1, InputIt2, InputIt2, BinaryPredicate)>(std::equal<InputIt1, InputIt2, BinaryPredicate>);


// template<class T, class S>
// std::vector<S> transform(const std::vector<T>& input, const std::function<S(const T&)>& func) {
//   std::vector<S> output;

//   std::transform(
//     std::begin(input), std::end(input),
//     std::back_inserter(output),
//     func
//   );

//   return output;
// }

// template<class T, class S, class U>
// std::vector<S> transform(const std::vector<T>& input1, const std::vector<U>& input2, const std::function<S(const T&, const U&)>& func) {
//   std::vector<S> output;

//   std::transform(
//     std::begin(input1), std::end(input1),
//     std::begin(input2),
//     std::back_inserter(output),
//     func
//   );

//   return output;
// }


bool isSkillSetRealizable(std::unordered_map<std::string, int> skillShortage,
                          std::vector<std::vector<CharmDecoration>> availableDecorationsForEachSlots) {
  // std::cout << availableDecorationsForEachSlots.size() << ": ";
  // for (const auto& [skill, shortage] : skillShortage) {
  //   std::cout << skill << shortage << ", ";
  // }
  // std::cout << std::endl;

  // すでにスキルが充足していれば OK, スキル不足&空きスロ無しなら NG
  const bool isRealized = std::all_of(
    std::begin(skillShortage),
    std::end(skillShortage),
    [](const auto& s){ return s.second <= 0; }
  );
  if (isRealized) { return true; }
  if (availableDecorationsForEachSlots.size() == 0) { return false; }

  // 先頭の装飾品のみ決めて, 以降のスロットは再起呼び出し
  const auto& availableDecorationsForFirstSlot = availableDecorationsForEachSlots[0];

  for (const auto& decoration : availableDecorationsForFirstSlot) {
    const auto skill = decoration.skill;
    if (skillShortage[skill] <= 0) { continue; } // 充足しているスキルに対応する装飾品はスキップ

    // 次の呼び出し用のステートを用意する (不足スキルは減算, スロットは [1:] で切り出し)
    std::unordered_map<std::string, int> newSkillShortage(skillShortage);
    newSkillShortage[skill] -= decoration.skillLevel;

    const bool isRealizable = isSkillSetRealizable(
      newSkillShortage,
      std::vector(std::begin(availableDecorationsForEachSlots) + 1, std::end(availableDecorationsForEachSlots))
    );
    if (isRealizable) {
      // std::cout << decoration.name << std::endl;
      return true;
    }
  }

  return false;
}


class Charm {
  friend std::ostream& operator<<(std::ostream&, const Charm&);

 public:
  Charm(): id(), slots(), skills(), skillLevels() {}
  Charm(
    const std::vector<std::string>& skills,
    const std::vector<int>& skillLevels,
    const std::vector<int>& slots,
    int id = -1
  ): id(id), slots(slots), skills(skills), skillLevels(skillLevels) {}

  Charm(const JSON& c):
    id(c["rowid"]),
    slots({c["slot1"], c["slot2"], c["slot3"]}),
    skills({c["skill1"], c["skill2"]}),
    skillLevels({c["skill1Level"], c["skill2Level"]}) {
  }

  Charm(Charm&&) = default;


  bool operator==(const Charm& another) const {
    if ( this == &another ) { return true; }

    return std::equal(ALL(slots),       std::begin(another.slots))
        && std::equal(ALL(skills),      std::begin(another.skills))
        && std::equal(ALL(skillLevels), std::begin(skillLevels));
  }

  bool operator<(const Charm& another) const {
    if ( this == &another ) { return false; }

    // スロット同士で比較した時の another 側の余剰を調べる
    std::vector<int> surplusSlots(another.slots);
    std::sort(std::begin(surplusSlots), std::end(surplusSlots), std::greater<int>{});

    for (auto it = std::rbegin(this->slots); it != std::rend(this->slots); ++it) {
      // スロットレベル 0 は表記上のものなのでスキップ (e.g. 3-0-0)
      if (*it == 0) { continue; }

      // another 側でスロットが不足すれば NG
      if (surplusSlots.size() == 0) { return false; }

      // ベース側と同等以上のスロットを余剰スロットリストから削除する. 無ければ NG
      const auto slotToBeRemoved = find_if(
        std::rbegin(surplusSlots),
        std::rend(surplusSlots),
        [&it](int s){ return s >= *it; }
      );
      if (slotToBeRemoved == std::rend(surplusSlots)) { return false; }
      surplusSlots.erase(std::next(slotToBeRemoved).base());
    }

    // スキル枠同士で比較した時の another 側の不足, 対応する装飾品を調べる
    std::unordered_map<std::string, int> skillShortage;
    std::vector<CharmDecoration> decorations;

    for ( const auto i : indices(this->skills) ) {
      int levelShortage = this->skillLevels[i];

      // 同じスキルが付いていれば, その分要求レベルから差し引く
      for ( const auto j : indices(another.skills) ) {
        if ( this->skills[i] == another.skills[j] ) {
          levelShortage -= another.skillLevels[j];
        }
      }

      // スキル枠のみで同スキルまかなえている
      if ( levelShortage <= 0 ) { continue; }

      // 対応する装飾品が存在しないスキルが不足していれば NG
      if ( skillToDecorationsMap.count(this->skills[i]) == 0 ) {
        return false;
      }

      skillShortage[this->skills[i]] = levelShortage;
      const auto decorationsToBeAppend = skillToDecorationsMap.at(this->skills[i]);
      decorations.insert(std::end(decorations), std::begin(decorationsToBeAppend), std::end(decorationsToBeAppend));
    }

    std::vector<std::vector<CharmDecoration>> availableDecorationsForEachSlots(surplusSlots.size());
    for (const auto i : indices(surplusSlots)) {
      const int surplusSlot = surplusSlots[i];
      std::vector<CharmDecoration> availableDecorations;
      std::copy_if(
        std::begin(decorations),
        std::end(decorations),
        std::back_inserter(availableDecorations),
        [&surplusSlot](auto decoration){ return decoration.slot <= surplusSlot; }
      );
      availableDecorationsForEachSlots[i] = availableDecorations;
    }

    return isSkillSetRealizable(skillShortage, availableDecorationsForEachSlots);
  }


// private:
  // static const MAX_SKILLS = 2;
  // static const MAX_SLOTS = 3;
  // std::string              name;
  // int                      rarity;

  const int                      id;
  const std::vector<int>         slots;
  const std::vector<std::string> skills;
  const std::vector<int>         skillLevels;
};


// template <class T, class S>
//   std::vector<T>::iterator          first1,
//   std::vector<T>::iterator          last1,
//   std::vector<S>::iterator          first2,
//   std::vector<S>::iterator          last2,
//   std::function<const T&, const S&> func) {
// }


std::ostream& operator<<(std::ostream& os, const Charm& charm) {
  // os << charm.name + " " + std::to_string(charm.rarity) + " ";

  StringJoin skills(",");
  for (unsigned int i = 0; i < charm.skills.size(); i++) {
    skills << charm.skills[i] + std::to_string(charm.skillLevels[i]);
  }

  StringJoin slots("-");
  for ( const auto& slot: charm.slots ) { slots << slot; }

  os << skills << " " << slots;

  return os;
}
