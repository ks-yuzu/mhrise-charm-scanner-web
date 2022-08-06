#pragma once

#include <vector>
#include <sstream>
#include <iterator>


std::string join(std::vector<std::string> strings, std::string delimiter = ", ");

class StringJoin {
 public:
  StringJoin(const std::string sep) :sep(sep), buf() {};

  template <typename T>
  StringJoin& operator<<(const T& v) {
    if ( isEmpty ) {
      buf << v;
      isEmpty = false;
    }
    else {
      buf << sep << v;
    }
    return *this;
  }

  friend
  std::ostream& operator<<(std::ostream& os, const StringJoin& s) {
    return os << s.buf.str();
  }

 private:
  const std::string sep;
  std::ostringstream buf;
  bool isEmpty = true;
};



template <typename T>
std::ostream& operator<< (std::ostream& out, const std::vector<T>& v) {
  if ( !v.empty() ) {
    out << '[';
    std::copy (v.begin(), v.end(), std::ostream_iterator<T>(out, ", "));
    out << "\b\b]";
  }
  return out;
}
