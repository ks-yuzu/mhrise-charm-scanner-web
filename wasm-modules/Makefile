SHELL=/bin/bash

.DEFAULT_GOAL := apply
TARGET := build/mhrise-charm-substitutes-search.html

$(TARGET): src/* template.html
	mkdir -p build
	docker run --rm -v `pwd`:/src emscripten/emsdk\
    em++ -I./lib -std=c++17 -O2 -fno-exceptions\
         -s WASM=1 -s NO_EXIT_RUNTIME=1 --bind\
  -s ALLOW_MEMORY_GROWTH=1\
  -s ASSERTIONS=1 -s SAFE_HEAP=1\
  -gsource-map --source-map-base 'http://localhost:5000/cpp-source/'\
         src/main.cpp\
         -o build/mhrise-charm-substitutes-search.html\
         --shell-file template.html

apply: $(TARGET)
	$(eval REPO_ROOT := $(shell git rev-parse --show-toplevel))
	cp build/mhrise-charm-substitutes-search.html      $(REPO_ROOT)/docs/index.html
	cp build/mhrise-charm-substitutes-search.{js,wasm} $(REPO_ROOT)/docs/
	cp build/mhrise-charm-substitutes-search.wasm.map  $(REPO_ROOT)/docs/cpp-source/

debug: src/*
	g++ -std=c++17 -O2 -I./lib src/main.cpp && ./a.out

test:
	cd test;\
	  for cpp in {skill,charm}.cpp; do g++ -Wall -Wextra -std=c++17 -Weffc++ -Wsuggest-override -Winline $$cpp -I../lib -lgtest_main -lgtest -lpthread -o test && ./test; done

data: data/skill-evaluation-map.dat data/skill-to-decoration-map.dat ../src/assets/mhrise/mhrise-charm-decorations.js
data/skill-evaluation-map.dat: scripts/decoration-list.ts
	cd scripts;\
		ts-node generate-skill-evaluation.ts | ts-node convert-json-to-initialization-list.ts | perl -pe 's/"(\d+)"/$$1/g' > ../data/skill-evaluation-map.dat
data/skill-to-decoration-map.dat: scripts/decoration-list.ts
	cd scripts;\
		ts-node generate-skill-to-decoration-map.ts | ts-node convert-json-to-initialization-list.ts | perl -pe 's/"(\d+)"/$$1/g' > ../data/skill-to-decoration-map.dat
../src/assets/mhrise/mhrise-charm-decorations.js: scripts/decoration-list.ts
	cd scripts;\
	  (echo -n 'export const skillEvaluationMap = '; ts-node generate-skill-evaluation.ts | jq) > ../../src/assets/mhrise/mhrise-charm-decorations.js
