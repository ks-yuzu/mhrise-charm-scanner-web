#include <gtest/gtest.h>
#include "../lib/charm-slot.hpp"


TEST(dump, 1) {
  testing::internal::CaptureStdout();
  CharmSlot slot(1);
  std::cout << slot;
  std::string stdout = testing::internal::GetCapturedStdout();

  EXPECT_STREQ("1", stdout.c_str());
}

TEST(dump, 2) {
  testing::internal::CaptureStdout();
  CharmSlot slot(2);
  std::cout << slot;
  std::string stdout = testing::internal::GetCapturedStdout();

  EXPECT_STREQ("2", stdout.c_str());
}

int main(void) {
  ::testing::InitGoogleTest();
  return RUN_ALL_TESTS();
}
