.DEFAULT_GOAL := apply

TARGET := build/mhrise-charm-substitutes-search.html

$(TARGET): src/*
	mkdir -p build
	docker run --rm -v `pwd`:/src emscripten/emsdk\
    em++ -I./lib -std=c++17 -O2 -fno-exceptions\
         -s WASM=1 -s NO_EXIT_RUNTIME=1 --bind\
         src/main.cpp\
         -o build/mhrise-charm-substitutes-search.html\
         --shell-file template.html

apply: $(TARGET)
	$(eval REPO_ROOT := $(shell git rev-parse --show-toplevel))
	cp build/mhrise-charm-substitutes-search.html      $(REPO_ROOT)/docs/index.html
	cp build/mhrise-charm-substitutes-search.{js,wasm} $(REPO_ROOT)/docs/

debug: src/*
	g++ -std=c++17 -O2 -I./lib src/main.cpp && ./a.out
