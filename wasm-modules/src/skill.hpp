#include <unordered_map>

const int INF = 10000;

const std::unordered_map<std::string, std::unordered_map<int, int>> skillEvaluationMap({
#include "../data/skill-evaluation-map.dat"
});
// {
//   { "攻撃", { {1, 2}, {2, 4}, {3, 6}, {4, 8}, {5, 10}, {6, 12}, {7, 14}, } },
// };

int evaluateSkill(const std::string& skill, int level) {
  // 装飾品が無く代替不可なので, 十分に大きい評価値にする
  if (skillEvaluationMap.count(skill) == 0) { return INF; }
  if (skillEvaluationMap.at(skill).count(level) == 0) { return INF; } // これは無いはず

  return skillEvaluationMap.at(skill).at(level);
}
