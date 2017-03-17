/*
 * svgmap - svg map in d3
 */

const d3 = require("d3");
const topojson = require("topojson");

var smap = function() {
    this.__layers = [];
    this.__centered = null;
    this.__drawn = false;
};

exports.smap = smap;

// set the stroke-width when the map is not zoomed in
smap.prototype.stroke_width = function(w)
{
    if ( typeof(w) == "undefined" ) {
	return this.__stroke_width || 1;
    }
    this.__stroke_width = w;
    return this;
}

// set or get the projection
smap.prototype.projection = function(p)
{
    if (typeof(p) == "undefined") return this.__projection;
    this.__projection = p;
    return this;
}

// load the topojson from file or memory
smap.prototype.topojson = function(fname)
{
    if (typeof(fname) == "undefined") return this.__topojson;
    
    var that = this;

    d3.json(fname, function(error, d){
	if (error) return console.error(error);
	that.__topojson = d;
    });
    
    return this;
}

// define a function to get the features from the topojson object
smap.prototype.features = function(f)
{
    if (typeof(f) == "undefined") return this.__features;
    this.__features = f;
    return this;
}

// smap.prototype.subobjects = function(s)
// {
//     if (typeof(s) == "undefined") return this.__subobjects;
//     this.__subobjects = s;
//     return this;
// }

// smap.prototype.shapefile = function (fname)
// {
//     if (typeof(fname) == "undefined") return this.__fname;
//     this.__fname = fname;
//     return this;
// }

// set the container (d3 selection) in which to draw
smap.prototype.container = function(selection)
{
    if (typeof(selection) == "undefined") return this.__d3selection;
    this.__d3selection = selection;
    return this;
}

// set the height
smap.prototype.height = function(h)
{
    if (typeof(h) == "undefined") return this.__height || 600;
    this.__height = h;
    return this;
}

/* set the width */
smap.prototype.width = function(w)
{
    if(typeof(w) == "undefined") return this.__width || 600;
    this.__width = w;
    return this;
}

/* set the svg to an existing svg for layering */
smap.prototype.add_to = function(map)
{
    this.__svg = map.__svg;
    this.height(map.height());
    this.width(map.width());
    this.projection(map.projection());
    this.container(map.container());

    map.__layers.push(map);

    return this;
}

/* add svg if there isn't one (helper function for draw */
smap.prototype.add_svg = function(svg)
{
    
    // var brect = this.__d3selection.node().getBoundingClientRect();
    // var width = brect.width;

    // if there is no svg, add one
    if (typeof(this.__svg) == "undefined")
    {
	this.__svg = this.container().append("svg")
	    .attr("width", this.width() + "px")
	    .attr("height", this.height() + "px");
    }

    // if there is a group, remove it
    // this way we can drop this map and redraw it
    // without affecting other layers
    if (typeof(this.__g) != "undefined")
    {
	this.__g.remove();
    }

    
    // this.__g = this.__svg.append("g")
    this.__g =    this.__svg.insert("g",":first-child")
	.classed("smap_layer", true);

    this.__element = this.container().node();
}

/* add features (helper function for draw */
smap.prototype.add_features = function()
{
    var projection = this.projection()(this.container().node());

    this.__path = d3.geo.path().projection(projection);
    var path = this.__path;

    var features = this.features()(this.__topojson);


    this.__g.append("path")
	.datum(features)
	.attr("d", path)
	// .each(function(d){
	//     console.log("path", d);
	// });

    var that = this;
    this.__g.selectAll(".subobj")
	.data(features.features)
	.enter()
	.append("path")
	.classed("subobj", true)
	.attr("data-obj-name", function(d){ return d.id; })
	// .style("fill","white")
	.style("stroke-width", this.stroke_width() + "px")
	// .style("stroke","gray")
	.attr("d", path)
	// .on("click",function(d){

	//     // that.zoom_to.call(that, d);
	//     // console.log("centroid", path.centroid(d));
	//     // console.log("coordinates: ", projection.invert(d3.mouse(this)));
	//     // console.log(d);
	// });


    
    this.__drawn = true;
}

smap.prototype.zoom_to = function(d)
{
    var x, y, k;
    var dur = 500;
    var path = this.__path;
    var width = this.width();
    var height = this.height();
    
    if (d && this.__centered !== d) {
	var centroid = path.centroid(d);
	x = centroid[0];
	y = centroid[1];
	k = 4;
	this.__centered = d;
    } else {
	// x = width / 2;
	// y = height / 2;
	// k = 1;
	this.__centered = null;
	this.zoom_out();
    }


    var bounds = path.bounds(d),
	dx = bounds[1][0] - bounds[0][0],
	dy = bounds[1][1] - bounds[0][1],
	x = (bounds[0][0] + bounds[1][0]) / 2,
	y = (bounds[0][1] + bounds[1][1]) / 2,
	scale = .9 / Math.max(dx / width, dy / height),
	translate = [width / 2 - scale * x, height / 2 - scale * y];

    var trans = "translate(" + translate + ")scale(" + scale + ")";
    var stroke = this.stroke_width() / scale;

    // this.__g.selectAll("path")
    this.__svg.selectAll("path")
        .style("stroke-width", stroke + "px")
        .classed("active", this.__centered && function(d) {
	    return d === this.__centered; });
    
    // this.__g.transition()
    this.__svg.selectAll("g")
	.transition()
        .duration(dur)
        .attr("transform", trans)

    
        // .style("stroke-width", stroke);

    for ( var i in this.__layers )
    {
	var layer = this.__layers[i];

	// console.log("zooming layer " + i, trans, stroke, layer);
	// layer.__g.transition()
        // .duration(dur)
        // .attr("transform", trans)
        // .style("stroke-width", stroke);
    }
    
    this.height(height);
    this.width(width);
    // this.standout();
}

// smap.prototype.standout = function()
// {
//     this.__svg.selectAll("defs").remove();
//     this.__svg.append("defs")
// 	.append("mask")
// 	.attr("id", "map-mask")
// 	.style("fill","#00ff00")
// 	.html(this.__g.html())

//     this.__svg.selectAll("g")
// 	.attr("mask","url(#map-mask)");
// }

// smap.prototype.standend = function()
// {
//     this.__svg.selectAll("defs").remove();
//     this.__svg.selectAll("g")
// 	.attr("mask", null);
// }

smap.prototype.zoom_out = function()
{

    this.__svg.selectAll("g").transition()
        .duration(500)
        .attr("transform", "");

    this.__g.selectAll("path")
	// .transition()
	// .duration(100)
	.style("stroke-width", this.stroke_width() + "px");
    
    // for ( var i in this.__layers )
    // {
    // 	this.__layers[i].zoom_out();
    // }
    
}

/* pass a function to color all features */
smap.prototype.color = function(f)
{

    var that = this;

    try{
	this.__g.selectAll(".subobj")
	    .style("fill", f);
	return this;
    }
    catch (e) {
	setTimeout(function(){
	    that.color.call(that, f);
	}, 50);
    }
    return this;
}

/* remove the map */
smap.prototype.remove = function()
{

    if (typeof(this.__g) != "undefined")
	this.__g.remove();
    this.__drawn = false;
    
}

/* draw the map */
smap.prototype.draw = function(tries)
{

    if (typeof(tries) == "undefined") tries = 0;
    if ( tries > 20 )
    {
	console.error("topojson failed to load 20 times. Giving up.");
	this.__topojson = null;
	return;
    }
    
    // make sure topojson is loaded
    if (typeof(this.__topojson) == "undefined")
    {
	console.error("topojson file not loaded yet, retrying in 200ms");
	var that = this;

	setTimeout(function(){
	    that.draw.call(that, tries + 1);
	}, 200);
	return this;
    }

    this.__drawn = false;
    
    this.remove();
    
    this.add_svg();

    this.add_features();


    return this;
}

