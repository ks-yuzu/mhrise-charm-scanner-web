#include <unordered_map>

class CharmDecoration {
public:
  CharmDecoration(std::string name, std::string skill, int skillLevel, int slot):
    name(name), skill(skill), skillLevel(skillLevel), slot(slot) {};

  std::string name;
  std::string skill;
  int skillLevel;
  int slot;
};

const int MAX_SLOT_LEVEL = 4;
inline const std::unordered_map<std::string, std::vector<CharmDecoration>> skillToDecorationsMap({
#include "../data/skill-to-decoration-map.dat"
});
