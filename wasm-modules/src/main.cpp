#include <iostream>
#include <sstream>
#include <vector>
#include <algorithm>
#include <unordered_map>
#include <typeinfo>

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#include <emscripten/bind.h>
#else
#define EMSCRIPTEN_KEEPALIVE
#endif //__EMSCRIPTEN__

#include "nlohmann/json.hpp"
#include "charm.hpp"


using JSON = nlohmann::json;


std::string getSubstitutes(const std::string& input) {
  const JSON json = JSON::parse(input);

  std::vector<Charm> charms;
  charms.reserve(1000);

  for (const auto& charm : json) {
    charms.emplace_back(charm);
  }

  // for (const auto& charm : charms) {
  //   std::cout << charm << std::endl;
  // }

  // std::cout << std::boolalpha;
  // std::cout << (charms[0] < charms[304]) << std::endl;
  // std::cout << (charms[0] < charms[44])  << std::endl;
  // std::cout << charms[305] << std::endl
  //           << charms[902] << std::endl;
  // std::cout << (charms[305] < charms[902])  << std::endl;


  // 総当たり
  // ./a.out  5.33s user 0.04s system 91% cpu 5.838 total
  // {
  //   std::vector<std::pair<int, int>> results;

  //   for (const auto i : indices(charms)) {
  //     for (const auto j : indices(charms)) {
  //       if ( i == j ) { continue; }
  //       if ( charms[i] < charms[j] ) {
  //         // std::cout << (i + 1) << " < " << (j + 1) << std::endl;
  //         results.emplace_back(i, j);
  //       }
  //     }
  //   }

  //   for (const auto& [i, j] : results) {
  //     std::cout << (i + 1) << " < " << (j + 1) << std::endl;
  //   }
  // }


  // スキルで絞り込み
  // TODO: 同性能ならスキップするように
  // TOOD: uniq してからチェックをかける
  // ./a.out  0.39s user 0.02s system 37% cpu 1.104 total
  {
    std::unordered_map<std::string, std::vector<Charm const*>> charmsGroupedBySkill;
    for (const auto& charm : charms) {
      for (const auto& skill : charm.skills) {
        charmsGroupedBySkill[skill].push_back(&charm);
      }
    }
    // for (const auto& [key, value]: charmsGroupedBySkill) {
    //   std::cout << key << std::endl;
    //   for ( const auto& charm : value ) {
    //     std::cout << *charm << std::endl;
    //   }
    // }

    std::unordered_map<int, std::vector<Charm const*>> charmsGroupedBySlotCount;
    for (const auto& charm : charms) {
      const int nSlots = count_if(ALL(charm.slots), [](const auto& slot){ return slot > 0; });
      charmsGroupedBySlotCount[nSlots].push_back(&charm);
    }
    // for (const auto& [key, value]: charmsGroupedBySlotCount) {
    //   std::cout << key << std::endl;
    //   for ( const auto& charm : value ) {
    //     std::cout << *charm << std::endl;
    //   }
    // }

    std::vector<std::pair<int, int>> results;

    for (const auto& base : charms) {
      // スキル込みで
      for (const auto& skill : base.skills ) {
        for (const auto& target : charmsGroupedBySkill[skill]) {
          // if ( base == target ) { continue; }

          if ( base < *target ) {
            results.emplace_back(base.id, target->id);
          }
        }
      }

      // スロットのみで
      const int levelSum = std::accumulate(ALL(base.skillLevels), 0);
      for (const int i : {1, 2, 3}) {
        if ( i < levelSum ) { continue; }

        for (const auto& target : charmsGroupedBySlotCount[i]) {
          // if ( base == target ) { continue; }

          if ( base < *target ) {
            results.emplace_back(base.id, target->id);
          }
        }
      }
    }

    // for (const auto& [i, j] : results) {
    //   std::cout << i << " < " << j << std::endl;
    // }

    // std::ostringstream oss;
    // for (const auto& [i, j] : results) {
    //   oss << i << " < " << j << std::endl;
    // }
    // return oss.str().c_str();

    std::map<int, std::vector<int>> res;
    for (const auto& [i, j] : results) {
      res[i].push_back(j);
    }
    for (auto&& [base, uppers] : res) {
      std::sort(ALL(uppers));
      uppers.erase(std::unique(ALL(uppers)), uppers.end());
    }

    return JSON(res).dump();
  }
}


int main(void) {
#ifndef __EMSCRIPTEN__
  std::cout << getSubstitutes(
#include "../test-data/charms.txt"
  ) << std::endl;
#endif //__EMSCRIPTEN__
}


#ifdef __EMSCRIPTEN__
EMSCRIPTEN_BINDINGS(myModule) {
  emscripten::function("getSubstitutes", &getSubstitutes);
}
#endif //__EMSCRIPTEN__
