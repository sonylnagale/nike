var initialDataURL = "http://bootstrap.client-solutions-uat.fyre.co/api/v3.0/stats.collections.curate/MzAzOTkwOnNuLTEzODkwNjA1NDI1ODg7Mnw=.json?from=-4min&until=-40s",
	subsequentDataURL = "http://bootstrap.client-solutions-uat.fyre.co/api/v3.0/stats.collections.curate/MzAzOTkwOnNuLTEzODkwNjA1NDI1ODg7Mnw=.json?from=-40s&until=-20s";

var dataSet = [];

var WIDTH = 1920,
	HEIGHT = 1080,
	line;

var margin = {top: 170, right: 80, bottom: 168, left: 50},
    width = WIDTH - margin.left - margin.right,
    height = HEIGHT - margin.top - margin.bottom,
	padding = 0;

var axisDuration = 1000;

var svg = d3.select("#nike-graph").append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

var clip = svg.append("defs").append("svg:clipPath")
	.attr("id", "clip")
	.append("svg:rect")
		.attr("id", "clip-rect")
		.attr("x", "-50px")
		.attr("y", "25px")
		.attr("width", width - padding)
		.attr("height", height - padding);


var chartBody = svg.append("g")
	.attr("clip-path", "url(#clip)")
  	.attr("transform", "translate(0," + margin.top + ")");

var graphclip = svg.append("defs").append("svg:clipPath")
	.attr("id", "graphclip")
	.append("svg:rect")
		.attr("id", "clip-rect")
		.attr("x", "0")
		.attr("y", "0")
		.attr("width", width-300)
		.attr("height", height);

var graphBody = svg.append("g")
	.attr("clip-path", "url(#graphclip)")
	.attr("transform", "translate(0," + margin.top + ")")
	.attr("width",width);

var bird = svg.selectAll("image").data([0]);

function epochToDate (epoch) {
    return new Date(epoch * 1000);
}

function trimData (rawData) {
    var trimmedData = [];
    rawData.forEach(function (v, i, arr) {
        if (parseInt(v, 10) != 0) {
            trimmedData.push(arr[i]); 
        }
    });

    return trimmedData;
}

function maxValue(arr) {
	var max = 0;
	for (var i = 0 ; i < arr.length; ++i) {
		if (arr[i][0] > max) {
			max = arr[i][0];
		}				
	}
	
	return max;
}	

var count = 1;

var drawSetup = function (err, rawData) {
    var data = rawData.data["303990"]["sn-1389060542588"]["2"];
    data = trimData(data);

    draw(data, count);
    ++count;
};	
	
function draw(newdata, count) {

	// for a manual data add test
	if (typeof newdata === 'number') {
		newdata = [newdata,new Date().getTime() - 1000];
		dataSet.push(newdata);
	} else if (count != 1)	 {
		dataSet = dataSet.concat(newdata);
	} else if (count == 1) {
		dataSet = newdata;
	}
	
	var xOrdinal = d3.scale.ordinal()
		 .domain(["-260s","-250s","-240s","-230s","-220s","-210s","-200s","-190s","-180s","-170s","-160s","-150s","-140s","-130s","-120s","-110s","-100s","-90s","-80s","-70s","-60s","-50s","-40s","-30s","","   "])
		 .rangePoints([0, width]);
	 
	 
	var x = d3.time.scale()
		.domain([0,dataSet.length])
		.range([0,width]);
	 	 
 	var y = d3.scale.linear()
		.range([height, 0])
		.domain([0,maxValue(dataSet) + 20]);	    
	
 	var xAxis = d3.svg.axis()
	  	.scale(xOrdinal)
	  	.orient('bottom')
	 	.tickPadding(35)
	    .ticks(9);

 	
  	var yAxis = d3.svg.axis()
      	.scale(y)
      	.ticks(3)
  	    .orient("right");

	if (count == 1) { // first run
		
		var xAxisPosition = height + 125;
		
		svg.append("g")
		  	.attr("class", "x axis")
		  	.attr("id", "xAxis")
         	.attr("transform", "translate(-120, " + xAxisPosition + ")")
		  	.call(xAxis);
		
	 	var xticks = d3.select("#xAxis").selectAll(".tick");
	 	
	 	for (var i = 0; i < xticks[0].length; ++i) {
	 		$(xticks[0][i]).attr("class", "xtick tick-" + i);
	 	}
	
		svg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + width +",170)")
			.call(yAxis);
		
		graphBody.append("path")
	      	.attr("class", "line")
	      	.attr("id", "graphLine")
	      	.style("stroke", "#fd5502");
		
		bird.enter()
		    .append("image")
		    .attr("xlink:href", "imgs/graph_twitter_bird_boxed.png")
		    .attr("x", "1480")
		    .attr("y", "500")
		    .attr("width", "44")
		    .attr("height", "46");
	} // /if first run  
	
	// update with animation
 	line = d3.svg.line()
		.x(function(d,i) { 
			return x(i); 
		})
		.y(function(d) { 
			return y(d[0]); 
		})
		.interpolate('linear');

 
	svg.select(".y.axis").transition()
		.duration(axisDuration)
		.ease("linear")
		.call(yAxis);
		
	graphBody.selectAll("path")
		.data([dataSet]) // set the new data
		.attr("transform", "translate(" + x(0) + ")") // set the transform to the right by x(1) pixels (6 for the scale we've set) to hide the new value
		.attr("d", line) // apply the new data values ... but the new value is hidden at this point off the right of the canvas
		
		.interrupt()
		.transition() // start a transition to bring the new value into view
			.ease("linear")
			.duration(10000) // for this demo we want a continual slide so set this to the same as the setInterval amount below
			.attr("transform", "translate(" + x(-2) + ")"); // animate a slide to the left back to x(0) pixels to reveal the new value

	var path = graphBody.selectAll("path").node();

	console.log(path.getPointAtLength(x(0)).y);
	
	var birdY = path.getPointAtLength(x(0)).y - margin.top;
	
	bird.transition()
	    	.ease("linear")
	    	.duration(1000)
	    	.attr("transform", "translate(0," + birdY +")"); // animate a slide to the left back to x(0) pixels to reveal the new value
	
	dataSet.splice(0,2);

//	console.log(path.getPointAtLength(x(0)).y);
	
//	$("#twitterBird").animate({
//		top: path.getPointAtLength(x(0)).y + margin.top,
//		easing: "linear"
//	}, 5000, function() {
//		// complete handler
//	});
};

d3.json(initialDataURL, drawSetup);

setInterval(function() {
	d3.json(subsequentDataURL, drawSetup);
},10000);

