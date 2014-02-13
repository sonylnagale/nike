/**
 * lftrends
 * 
 * Graphs. Graphs. Graphs. Oh my god, graphs.
 * Use Social Counter API to graph trends over time
 * 
 * @todo see if we already have a base64 encoder tool instead of using https://github.com/carlo/jquery-base64
 * @see https://github.com/Livefyre/livefyre-docs/wiki/Social-Counter-API
 * @author Sonyl Nagale <sonyl@livefyre.com>
 * @version 0.1
 */

/**
 * @constructor
 * @param {Object} opts Object of options
 * @todo make options into its own class thing
 */
var lftrends = function(opts) {
	/** @default */
	var defaults = {
		network: "client-solutions-uat.fyre.co",
		version: "3.0",
		resource: "http://bootstrap.{network}/api/v{version}/stats.collections.curate/{query}.json",
		initialFrom: "-5min",
		subsequentFrom: "-10s",
		initialUntil: null,
		subsequentUntil: null,
		rules: [],
		type: "OR",
		interval: 10000,
		container: "container"
	};
		
	this.opts = opts || {};
	
	this.opts = $.extend(defaults,opts);

	this.updateCount = 0;
	this.chart;

	this._draw();
		
};

/**
 * @private
 * Constructs Base64 query to be used by API
 * @see https://github.com/Livefyre/livefyre-docs/wiki/Social-Counter-API#resource
 * 
 * @return {String} query 
 */
lftrends.prototype._constructQuery = function() {
	var query = '';
	var delimeter = (this.opts.type == 'OR') ? '|' : ',';
	
	for (var rule in this.opts.rules) {
		var rule = this.opts.rules[rule];
		query += rule.site + ':' + rule.articleId + ';' + rule.rule;
		query += delimeter;
	}
	
	query = btoa(query);
	
	return query;
};

/**
 * @private
 * Uses _constructQuery and member options to construct the API URL
 */
lftrends.prototype._constructResource = function() {
	this.opts.resource = this.opts.resource.replace('{network}',this.opts.network);
	this.opts.resource = this.opts.resource.replace('{version}',this.opts.version);
	this.opts.resource = this.opts.resource.replace('{query}',this._constructQuery());
};

/**
 * @private
 * Makes the requests to the API and uses other helpers to massage the data
 */
lftrends.prototype._request = function() {
	var url = this.opts.resource, 
		delimeter = '?', 
		from = (this.updateCount == 0) ? this.opts.initialFrom : this.opts.subsequentFrom,
		until = (this.updateCount == 0) ? this.opts.initialUntil : this.opts.subsequentUntil;	
	
	
	if (from != null) {
		url += delimeter + 'from=' + from;
		delimeter = '&';
	}
	
	if (until != null) {
		url += delimeter + 'until=' + until;
	}
		
	$.ajax({
        url: url,
        jsonp: true,
        success: $.proxy(function(data) {
        	this._constructSeries(this._processData(data));
        	setTimeout($.proxy(function() { this._request();},this), this.opts.interval);
        },this),
        cache: false
    });
};

/**
 * @private
 * Preprocesses data returned from Social Counter before being used for the chart
 * @param {Object} data Data from _request()
 * @return {Object} collections All the, erm, data?
 */ 
lftrends.prototype._processData = function(data) {
	
	// exit if it failed. Let's keep it quiet for now
	if (data.code != "200") {
		return;
	}
	
//	// get them all together into one object
//	for (var site in data.data) {
//		if (data.data.hasOwnProperty(site)) {			
//			collections = $.extend(collections,data.data[site]);
//		}
//	}

	var siteObjects = []; // let's pretend we're querying more than one site
	
	for (var site in data.data) {
		siteObjects.push(data.data[site]);
	}

	var massagedData = []; // now let's get all the collections into one object to pass to d3

	var collectionData = [];

	for (var site in siteObjects) {
		
		for (var collection in siteObjects[site]) {
			//console.log(collection);
			//collections[collection] = siteObjects[site][collection]["2"]; 
			collectionData.push({'collection':collection,'data':siteObjects[site][collection]["2"]}); // assume everything is twitter now (rule 2)
		}
	}

	for (var i = 0; i < collectionData[0]['data'].length; ++i) {
		var datum = {};
		//datum.date = new Date(collectionData[0]['data'][i][1] * 1000);
		datum.date = new Date(collectionData[0]['data'][i][1] * 1000);
		for (var j = 0; j < Object.keys(collectionData).length; ++j ) {
			datum[this.opts.rules[collectionData[j]['collection']].name] = collectionData[j]['data'][i][0];
		}
		massagedData.push(datum);
	}

//	
//	for (var collection in collections) {
//		
//	}
//	
//	console.log(datapoints);

//	// this feels really stupid and expensive. Need to find a better way
//	// I probably want to change the structure of the rules array to an object or something
//	for (var i = 0; i < this.opts.rules.length; ++i) {
//		collections[this.opts.rules[i].articleId].title = this.opts.rules[i].name;
//	}
//	
	
	++this.updateCount;
	return massagedData;
};

/**
 * @private
 * Take the data after _processData() and format it into a nice series that Highcharts likes
 * @param {Object} data Data from _processData()
 */
lftrends.prototype._constructSeries = function(data) {
//	if (this.updateCount == 1) {
//		displayGraphExample("#graph1", 1000, 500, "linear", true, this.opts.interval, this.opts.interval, data);
//	} else {
//		redrawWithAnimation("#graph1", 1000, 500, "linear", true, this.opts.interval, this.opts.interval, data);
//	}
	draw(data, this.updateCount);

};


/**
 * @private
 * Initial draw of the chart
 */
lftrends.prototype._draw = function() {
	this._constructResource();
	this._request();
       
};
