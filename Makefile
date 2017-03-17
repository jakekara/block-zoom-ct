svgbundle.min.js: clean svgbundle.js
	uglifyjs js/svgct.bundle.js -o js/svgct.bundle.min.js
	uglifycss css/blockmap.css > css/blockmap.min.css

svgbundle.js: clean js/svgct.js
	browserify js/svgct.js -o js/svgct.bundle.js

# bundle.min.js: bundle.js
# 	uglifyjs js/bundle.js -o js/bundle.min.js

# bundle.js: clean js/main.js
# 	browserify js/main.js -o js/bundle.js

clean:
	rm -f  js/svgct.bundle.js
	rm -f js/svgct.bundle.min.js
	rm -f css/blockmap.min.css
	# rm -f js/bundle.js
	# rm -f js/bundle.min.js
