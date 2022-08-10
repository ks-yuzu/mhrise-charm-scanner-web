#include <gtest/gtest.h>
#include "../src/charm.hpp"


TEST(dump, 1) {
  testing::internal::CaptureStdout();

  Charm charm(
    { "見切り", "攻撃" },
    { 2, 1 },
    { 1, 1 }
  );
  std::cout << charm << std::endl;

  std::string stdout = testing::internal::GetCapturedStdout();

  EXPECT_STREQ("見切り2,攻撃1 1-1\n", stdout.c_str());
}

TEST(dump, 2) {
  testing::internal::CaptureStdout();

  Charm charm(
    { "攻撃" },
    { 3 },
    { 4 }
  );
  std::cout << charm << std::endl;

  std::string stdout = testing::internal::GetCapturedStdout();

  EXPECT_STREQ("攻撃3 4\n", stdout.c_str());
}

TEST(compare, 1) {
  EXPECT_TRUE(
    Charm({ "攻撃" }, { 2 }, {})
    <
    Charm({ "攻撃" }, { 3 }, { 4 })
  );
  EXPECT_TRUE(
    Charm({ "攻撃" }, { 2 }, { 4 })
    <
    Charm({ "攻撃" }, { 3 }, { 4 })
  );
  EXPECT_TRUE(
    Charm({ "攻撃" }, { 3 }, { 4 })
    <
    Charm({ "攻撃" }, { 2 }, { 4, 2 })
  );
  EXPECT_FALSE(
    Charm({ "攻撃" }, { 3 }, { 4 })
    <
    Charm({ "攻撃" }, { 2 }, { 4 })
  );
  EXPECT_TRUE(
    Charm({ "攻撃", "見切り" }, { 2, 1 }, {})
    <
    Charm({ "攻撃" }, { 2 }, { 2 })
  );
  EXPECT_TRUE(
    Charm({ "回避性能" }, { 3 }, {})
    <
    Charm({ "回避性能" }, { 1 }, { 4, 1 })
  );
  EXPECT_TRUE(
    Charm({ "水属性攻撃強化" }, { 3 }, { 1, 1 })
    <
    Charm({ "水属性攻撃強化" }, { 2 }, { 1, 1, 1 })
  );
  EXPECT_FALSE(
    Charm({ "水属性攻撃強化" }, { 3 }, { 1, 1 })
    <
    Charm({ "水属性攻撃強化" }, { 5 }, {})
  );
  EXPECT_TRUE(
    Charm({ "水属性攻撃強化" }, { 4 }, { 2 })
    <
    Charm({ "水属性攻撃強化" }, { 3 }, { 2, 1 })
  );
  EXPECT_TRUE(
    Charm({ "水属性攻撃強化", "回避性能" }, { 4, 2 }, {})
    <
    Charm({ "水属性攻撃強化" }, { 2 }, { 4, 1, 1 })
  );
  EXPECT_FALSE(
    Charm({ "水属性攻撃強化", "回避性能" }, { 4, 2 }, {})
    <
    Charm({ "水属性攻撃強化" }, { 2 }, { 3, 1, 1 })
  );
  EXPECT_TRUE(
    Charm({ "水属性攻撃強化" }, { 4 }, {})
    <
    Charm({ "風圧耐性" }, { 1 }, { 3, 1 })
  );
  EXPECT_TRUE(
    Charm({ "水属性攻撃強化" }, { 4 }, {})
    <
    Charm({ "風圧耐性" }, { 1 }, { 2, 2 })
  );
  EXPECT_TRUE(
    Charm({ "水属性攻撃強化" }, { 5 }, {})
    <
    Charm({ "風圧耐性" }, { 1 }, { 3, 2 })
  );
  EXPECT_TRUE(
    Charm({ "防御" }, { 5 }, {})
    <
    Charm({ "風圧耐性" }, { 1 }, { 4 })
  );
  EXPECT_TRUE(
    Charm({ "鬼火纏" }, { 2 }, { 1, 1 })
    <
    Charm({ "風圧耐性" }, { 1 }, { 4, 1, 1 })
  );
  EXPECT_TRUE(
    Charm({ "合気", "回避性能" }, { 2, 1 }, { 1 })
    <
    Charm({ "合気" }, { 1 }, { 3, 2, 1 })
  );
  EXPECT_TRUE(
    Charm({ "攻撃" }, { 2 }, { 1, 0, 0 })
    <
    Charm({ "精霊の加護", "不屈" }, { 1, 1 }, { 3, 2, 1 })
  );
  EXPECT_TRUE(
    Charm({ "災禍転福", "無し" }, { 2, 0 }, { 1, 0, 0 })
    <
    Charm({ "精霊の加護", "不屈" }, { 1, 1 }, { 3, 2, 1 })
  );
}


int main(void) {
  ::testing::InitGoogleTest();
  return RUN_ALL_TESTS();
}
