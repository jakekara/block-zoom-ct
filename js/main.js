const d3 = require("d3");
const spamjs = require("spamjs");
const rbush = require("rbush");
const topojson = require("topojson");



go = function(slice_no){

    var hover = null
    
    d3.json("shapes/" + slice_no + ".topojson", function(error, d) {
	topojson.presimplify(d);

	d3.select("#container").html("");
	var map = new spamjs.ZoomableCanvasMap({
	    element: "#container",
	    data: [{
		features: d.objects,
		static: {
		    paintfeature: function(parameters, d) {
			console.log(d);
			parameters.context.stroke()
		    }
		},
		dynamic: {
		    postpaint: function(parameters) {
			if (!hover)
			    return

			parameters.context.beginPath()
			parameters.context.lineWidth = 2 / parameters.scale
			parameters.context.fillStyle = "rgb(241, 205, 151)"
			parameters.path(hover)
			parameters.context.stroke()
			parameters.context.fill()
		    }
		},
		events: {
		    hover: function(parameters, d) {
			hover = d;
			console.log(d);
			parameters.map.paint()
		    },
		    click: function(parameters, d) {
			console.log(d3.event);
			console.log(parameters, d);
			parameters.map.zoom(d)
		    }
		}
	    }]
	})
	map.init();
	console.log(map);
    })

}

go("r2c6");
