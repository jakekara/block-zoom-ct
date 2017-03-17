const d3 = require("d3");
const topojson = require("topojson");
const smap = require("./smap.js").smap;

/* 
 * ct_towns - Make a map of CT using smap.js
 */
var ct_towns = function(selection)
{
    var map = new smap();

    var brect = selection.node().getBoundingClientRect();
    var width = brect.width;
    var height = width * 0.6;

    selection.style("height", height);

    var brect = selection.node().getBoundingClientRect();

    map.container(selection)
	.stroke_width(1)
	.topojson("shapes/ct_towns.topojson")
	.height(height).width(width)
	.projection(function(element){
    	    return d3.geo.mercator()
    		.rotate([72.7, 0, 0])
    		.scale(element.offsetWidth * 22)
    		.center([0, 41.52])
    		.translate([element.offsetWidth/ 2, element.offsetHeight / 2]);
    	})
    	.features(function(topo){
    	    return topojson.feature(topo, topo["objects"]["ct_towns_s"]);
    	})
    	.draw();

    return map;
}

exports.ct_towns = ct_towns;
