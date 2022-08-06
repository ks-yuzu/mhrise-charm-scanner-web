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
#include "skill.hpp"


using JSON = nlohmann::json;


std::string getSubstitutesAll(const std::string& input) {
  const JSON json = JSON::parse(input);

  std::vector<Charm> charms;
  charms.reserve(1000);

  for (const auto& charm : json) {
    charms.emplace_back(charm);
  }

  // 総当たり
  // ./a.out  28.57s user 0.04s system 99% cpu 28.650 total (for 3070 charms, w/o -O option)
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
  // ./a.out  4.14s user 0.00s system 98% cpu 4.196 total (for 3070 charms, w/o -O option)
  // ./a.out  0.53s user 0.00s system 95% cpu 0.553 total (for 3070 charms, w/ -O2 option)
  {
    std::unordered_map<std::string, std::vector<Charm const*>> charmsGroupedBySkill;
    for (const auto& charm : charms) {
      for (const auto& skill : charm.skills) {
        charmsGroupedBySkill[skill].push_back(&charm);
      }
    }

    std::unordered_map<int, std::vector<Charm const*>> charmsGroupedBySlotEvaluation;
    for (const auto& charm : charms) {
      const int slotEvaluation = accumulate(ALL(charm.slots), 0);
      charmsGroupedBySlotEvaluation[slotEvaluation].push_back(&charm);
    }

    std::vector<std::pair<int, int>> results;

    for (const auto& base : charms) {
      // スキル込みで
      for (const auto& skill : base.skills ) {
        for (const auto& target : charmsGroupedBySkill[skill]) {
          if ( base < *target ) {
            results.emplace_back(base.id, target->id);
          }
        }
      }

      // スロットのみで
      const int requiredSlotEvaluation = [&base](){ // スキルとスロットの合計評価値
        int sum = 0;
        for (const auto i : indices(base.skills)) {
          sum += evaluateSkill(base.skills[i], base.skillLevels[i]);
        }
        return sum + accumulate(ALL(base.slots), 0);
      }();

      for (const auto& [slotEvaluation, targets] : charmsGroupedBySlotEvaluation) {
        if (slotEvaluation < requiredSlotEvaluation) { continue; }

        for (const auto& target : targets) {
          if ( base < *target ) {
            results.emplace_back(base.id, target->id);
          }
        }
      }
    }

    // 出力用に構造化
    std::map<int, std::vector<int>> output;
    for (const auto& [i, j] : results) {
      output[i].push_back(j);
    }
    for (auto&& [base, uppers] : output) {
      std::sort(ALL(uppers));
      uppers.erase(std::unique(ALL(uppers)), uppers.end());
    }

    return JSON(output).dump();
  }
}


/*
 * allCharms の中から base の上位互換を探す
 */
std::string getSubstitutes(const std::string& _allCharms, const std::string& _base) {
  const auto baseJson = JSON::parse(_base);
  const Charm base(baseJson["skills"], baseJson["skillLevels"], baseJson["slots"]);

  std::vector<Charm> allCharms;
  allCharms.reserve(1000);

  for (const auto& charm : JSON::parse(_allCharms)) {
    allCharms.emplace_back(charm);
  }

  std::vector<int> results;
  for (const auto i : indices(allCharms)) {
    // if ( base == allCharms[i] ) {} else
    if ( base < allCharms[i] ) {
      results.emplace_back(allCharms[i].id);
    }
  }

  std::sort(ALL(results));
  results.erase(std::unique(ALL(results)), results.end());

  return JSON(results).dump();
}


int main(void) {
#ifndef __EMSCRIPTEN__
 // std::cout << getSubstitutes(
 //   #include "../test-data/charms.txt"
 //   ,
 //   "{\"rowid\": -1, \"skills\": [\"攻撃\"], \"skillLevels\": [2], \"slots\": [1, 0, 0]}"
 //   //"{\"rowid\": -1, \"skills\": [\"ブレ抑制\", \"炎\"], \"skillLevels\": [1, 1], \"slots\": [1, 0, 0]}"
 // ) << std::endl;

std::cout << getSubstitutesAll(
  #include "../test-data/charms.txt"
) << std::endl;
#endif //__EMSCRIPTEN__
}


#ifdef __EMSCRIPTEN__
EMSCRIPTEN_BINDINGS(myModule) {
  emscripten::function("getSubstitutesAll", &getSubstitutesAll);
  emscripten::function("getSubstitutes",    &getSubstitutes);
}
#endif //__EMSCRIPTEN__
