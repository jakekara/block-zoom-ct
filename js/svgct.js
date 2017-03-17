const d3 = require("d3");
const topojson = require("topojson");
const smap = require("./smap.js").smap;
const ct_towns = require("./cttowns.js").ct_towns;
const overlapping_blocks = require("./blockfind.js").overlapping_blocks;
const town_names = require("./townnames.js");

var index; 			// bounding box index
var loaded_objs = {}; 		// cache of layers
var townmap; 			// base map

/* 
 * load_bbox_index - load the  bounding box index, store it in index variable.
 *      notes: index var is used to find a map layer based on coordinates
 */
var load_bbox_index = function(){
    d3.json("shapes/bbox-index.json", function(error, d){
	index = d;
    });
}

/*
 * add_block - load and add a block to the townmap
 */
var add_block = function( block_no )
{
    // return from cache if possible
    if (loaded_objs.hasOwnProperty(block_no))
    {
	// loaded_objs[block_no].draw();
    }
    
    // otherwise, load it
    else
    {
	loaded_objs[block_no] = new smap()
	    .add_to(townmap)
	    .topojson("shapes/" + block_no + ".topojson")
	    .stroke_width(2)
	    .features(function(topo){
		return topo["objects"];
	    })
	    .draw();
    }

    console.log("returning ", loaded_objs[block_no]);
		
    return loaded_objs[block_no]; 
}

/*
 * find_blocks - find and add blocks that overlap withbbox
 */
var find_blocks = function(bbox)
{
    if (typeof(index) == "undefined")
    	throw ("index not yet loaded");

    var projection = townmap.projection()(townmap.container().node());
    var town_bl = projection.invert([bbox.x,(bbox.y + bbox.height)]);
    var town_tr = projection.invert([(bbox.x + bbox.width), bbox.y]);
    var matches = overlapping_blocks(index, town_bl, town_tr);
    
    // console.log("matches", matches);

    var layers = []
    for (var i in matches)
    {
	layers.push(add_block(matches[i]["name"]));
    }

    return layers;
}

var zoom_to_town = function( townpath, d )
{
    console.log("zoom_to_town", d.id);

    d3.selectAll(".town-name")
	.classed("clickable", true)
	.text(town_names.display_name(d.id))
	.on("click", function(){
	    zoom_to_town(townpath, d);
	});
    
    var layers = find_blocks(d3.select(townpath).node().getBBox());
    var timeout;

    var zoom_when_loaded = function()
    {
	// wait for them all to be loaded
	for ( var i in layers )
	{
	    // console.log("all_loaded? ", layers[i].__topojson);
	    if (typeof(layers[i].__topojson) == "undefined")
	    {
		clearTimeout(timeout);
		timeout = setTimeout(zoom_when_loaded, 50);
		return;
	    }

	}

	// wait for them all to be drawn
	for ( var i in layers )
	{
	    if ( layers[i].__drawn != true )
	    {
		layers[i].draw();
		clearTimeout(timeout);
		timeout = setTimeout(zoom_when_loaded, 50);
		return;
	    }
	}

	// make the block-level maps zoomable as well. oh yeah we did.
	layers.forEach(function(a){
	    a.__g.selectAll(".subobj")
		.classed("block", true)
		.on("click", function(d){
		    console.log(d);
		    d3.select(".block-name")
			.text("Census Block " + d["properties"]["GEOID10"]);
		    a.zoom_to(d);
		});
	});

	// when we make it here, we're ready to actually do the zoom.
	townmap.zoom_to(d);

	// zoomed applies to just the town we're zoomed into
	d3.selectAll("path.town").classed("zoomed", false);

	// closeup mode applies to the whole map
	d3.selectAll("g").classed("closeup", true);
	d3.select(townpath).classed("zoomed", true);

	done_loading();
    }

    loading();
    zoom_when_loaded();


}


/*
 * make_zoomy - make the townmap zoomable on click
 */
var make_zoomy = function()
{

    // make sure the map is drawn, otherwise, try again later
    if (townmap.__drawn == false)
    {
	setTimeout(make_zoomy, 100);
	return;
    }

    townmap.__g.selectAll("path.subobj")
	.classed("town", true) 
	.on("click", function(d){
	    var townpath = this;
	    zoom_to_town(townpath, d);
	    
	});
}

/* 
 * zoomout - zoom back to the town-level statewide map 
 */
zoomout = function(){

    d3.select(".town-name")
	.html("&nbsp;");
    d3.select(".block-name")
	.html("&nbsp;");
    
    // reset CSS and zoom out
    d3.selectAll("g").classed("closeup", false);
    d3.selectAll("path.town").classed("zoomed", false);

    townmap.zoom_out.call(townmap);
    // townmap.__svg.selectAll("path.town")
    // .style("stroke-width", 1 + "px");

    for ( var n in loaded_objs )
    {
	loaded_objs[n].remove();
    }
}

var loading = function()
{
    d3.select(".loading").style("display","block");
}

var done_loading = function()
{
    d3.select(".loading").style("display",null);
}

/* 
 * main
 */
var main = function()
{
    load_bbox_index();
    townmap = ct_towns(d3.select("#container"));
    d3.select(".state-name")
	.text("Connecticut")
	.classed("clickable", true)
	.on("click", zoomout);
    make_zoomy();
};

main();
