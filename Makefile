BROWSERIFY:=./node_modules/.bin/browserify

ENGINES:=$(patsubst src/%.jsx, build/%.js, $(wildcard src/engines/*))

all: build/bundle.js $(ENGINES)

build/bundle.js: $(wildcard src/*) $(wildcard src/**) $(wildcard src/*/**) config/welcome.md
	NODE_PATH="node_modules:src" $(BROWSERIFY) \
			  --ignore-missing \
			  --extension=.less -t lessify \
			  --extension=.jsx -t [ reactify --es6 ] \
			  -t brfs \
			  src/main.jsx -o build/bundle.js

$(ENGINES): build/%.js: src/%.jsx
	NODE_PATH="node_modules:src" $(BROWSERIFY) \
			  --ignore-missing \
			  --extension=.less -t lessify \
			  --extension=.jsx -t [ reactify --es6 ] \
			  -t brfs \
			  $< >$@

update:
	npm install
	bower install

clean:
	rm -rf build/* browserify-cache.json

.PHONY: update clean
