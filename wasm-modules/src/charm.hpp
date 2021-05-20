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


class Charm {
  friend std::ostream& operator<<(std::ostream&, const Charm&);

 public:
  Charm(): id(), slots(), skills() {}
  Charm(
    const std::vector<int>& slots,
    const std::vector<std::string>& skills,
    const std::vector<int>& skillLevels,
    int id = -1
  ): id(id), slots(slots), skills(skills), skillLevels(skillLevels) {}

  Charm(const JSON& c):
    id(c["rowid"]),
    slots({c["slot1"], c["slot2"], c["slot3"]}),
    skills({c["skill1"], c["skill2"]}),
    skillLevels({c["skill1Level"], c["skill2Level"]}) {
  }

  bool operator<(const Charm& another) const {
    if ( this == &another ) { return false; }

    std::vector<int> requiredSlots(this->slots);

    for ( const auto i : indices(this->skills) ) {
      int level = this->skillLevels[i];

      for ( const auto j : indices(another.skills) ) {
        if ( this->skills[i] == another.skills[j] ) {
          level -= another.skillLevels[j];
        }
      }

      const int skillRank = skillToSlotLevel.at(this->skills[i]);
      // std::cout << "skill rank: " << skillRank << std::endl;
      // std::cout << "reduced level: " << level << std::endl;

      if ( level > 0 ) {
        requiredSlots.insert(std::end(requiredSlots), level, skillRank);
      }
    }
    std::sort(std::begin(requiredSlots), std::end(requiredSlots));
    // std::cout << "required slots: " << requiredSlots << std::endl;

    const auto first = std::upper_bound(ALL(requiredSlots), 0);
    // std::cout << "pos: " << first - std::begin(requiredSlots) << std::endl;

    const auto rlast = std::make_reverse_iterator(first);
    // std::cout << "required slot: " << (rlast - std::rbegin(requiredSlots)) << std::endl;

    const int nRequiredSlots = std::end(requiredSlots) - first;
    if ( nRequiredSlots > static_cast<int>(another.slots.size()) ) {
      return false;
    }

    const auto anotherLast = std::begin(another.slots) + nRequiredSlots;

    // for (auto it = std::rbegin(requiredSlots); it != rlast; it++) {
    //   std::cout << *it << std::endl;
    // }
    // for (auto it = std::begin(another.slots); it != anotherLast; it++) {
    //   std::cout << *it << std::endl;
    // }

    return std::equal(
      std::rbegin(requiredSlots), rlast,
      std::begin(another.slots),  anotherLast,
      std::less_equal<int>()
    );
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
  skills << charm.skills[0] + std::to_string(charm.skillLevels[0])
         << charm.skills[1] + std::to_string(charm.skillLevels[1]);

  StringJoin slots("-");
  for ( const auto& slot: charm.slots ) { slots << slot; }

  os << skills << " " << slots;

  return os;
}
