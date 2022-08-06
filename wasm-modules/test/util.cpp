#include <gtest/gtest.h>
#include "../lib/util.hpp"


TEST(Join, 1elm) {
  EXPECT_STREQ(
    "1",
    join(std::vector<std::string>{"1"}).c_str()
  );
}

TEST(Join, 3elms) {
  EXPECT_STREQ(
    "1, 2, 3",
    join(std::vector<std::string>{"1", "2", "3"}).c_str()
  );
}

TEST(Join, CustomDelimiter) {
  EXPECT_STREQ(
    "1-2-3",
    join(std::vector<std::string>{"1", "2", "3"}, "-").c_str()
  );
}


int main(void) {
  ::testing::InitGoogleTest();
  return RUN_ALL_TESTS();
}
