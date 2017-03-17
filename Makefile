svgbundle.js: bundle.js js/svgct.js
	browserify js/svgct.js -o js/svgct.bundle.js

bundle.min.js: bundle.js
	uglifyjs js/bundle.js -o js/bundle.min.js

bundle.js: clean js/main.js
	browserify js/main.js -o js/bundle.js

clean:
	rm -f js/bundle.js
	rm -f js/bundle.min.js
