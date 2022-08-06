#include <gtest/gtest.h>
#include "../src/skill.hpp"


TEST(EvaluateSkill, 1) {
  EXPECT_EQ(evaluateSkill("攻撃", 1), 2);
  EXPECT_EQ(evaluateSkill("攻撃", 2), 4);
  EXPECT_EQ(evaluateSkill("攻撃", 7), 14);
  EXPECT_EQ(evaluateSkill("防御", 1), 1);
  EXPECT_EQ(evaluateSkill("防御", 5), 4);
  EXPECT_EQ(evaluateSkill("防御", 7), 6);
  EXPECT_EQ(evaluateSkill("水属性攻撃強化", 1), 1);
  EXPECT_EQ(evaluateSkill("水属性攻撃強化", 2), 2);
  EXPECT_EQ(evaluateSkill("水属性攻撃強化", 3), 3);
  EXPECT_EQ(evaluateSkill("水属性攻撃強化", 5), 5);
  EXPECT_EQ(evaluateSkill("鬼火纏", 1), 3);
  EXPECT_EQ(evaluateSkill("鬼火纏", 2), 4);
  EXPECT_EQ(evaluateSkill("鬼火纏", 3), 7);
  EXPECT_EQ(evaluateSkill("幸運", 1), 3);
  EXPECT_EQ(evaluateSkill("幸運", 2), 4);
  EXPECT_EQ(evaluateSkill("幸運", 3), 7);
}

int main(void) {
  ::testing::InitGoogleTest();
  return RUN_ALL_TESTS();
}
