var CollectionMapView = Livefyre.require('streamhub-map/views/collection-map-view');
var StateToContent = Livefyre.require('streamhub-sdk/content/state-to-content');
var MarkerTemplate = Livefyre.require('hgn!streamhub-map/views/templates/marker');
var inherits = Livefyre.require('inherits');

var NikeCollectionMapView = function (opts) {
    CollectionMapView.call(this, opts);

    this._collectionToMarker = {};
    this._shiftDistance = opts.shiftDistance || 50;
    this._fitBounds = opts.fitBounds;

    if (this._fitBounds) {
        this._map.fitBounds(this._fitBounds);
    }

    $('body').on('increment.counter', function () {
        var colIds = Object.keys(this._collectionToMarker);
        var markerToNotify = this._collectionToMarker[colIds[NikeCollectionMapView.getRandom(0, colIds.length-1)]];
        this.notifyMarker(markerToNotify);
    }.bind(this));
};
inherits(NikeCollectionMapView, CollectionMapView);

NikeCollectionMapView.prototype.notifyMarker = function (marker) {
    var ring1 = d3.select($(marker._icon).find('.hub-map-heat-marker-1')[0]);
    var ring2 = d3.select($(marker._icon).find('.hub-map-heat-marker-2')[0]);
    var ring3 = d3.select($(marker._icon).find('.hub-map-heat-marker-3')[0]);
    var ring4 = d3.select($(marker._icon).find('.hub-map-heat-marker-4')[0]);

    ring1.transition().attr('stroke-opacity', '0.5').transition().duration(1500).attr('stroke-opacity', '0');
    ring2.transition().delay(10).attr('stroke-opacity', '0.3').transition().duration(1500).attr('stroke-opacity', '0');
    ring3.transition().delay(100).attr('stroke-opacity', '0.2').transition().duration(1500).attr('stroke-opacity', '0');
    ring4.transition().delay(200).attr('stroke-opacity', '0.07').transition().duration(1500).attr('stroke-opacity', '0');
};

NikeCollectionMapView.prototype.add = function (collection) {
    collection.on('change:heatIndex', function () {
        var marker = this._collectionToMarker[collection.id];
        if (! marker) {
            return;
        }

        marker.removeFrom(this._map);
        
        // Adapt Collection to CollectionPoint
        var location = this._collectionToLocation[collection.id];
        if (!location) {
            return;
        }
        var collectionPoint = new CollectionPoint(collection, location);
        CollectionMapView.prototype.add.call(this, collectionPoint);
    });
    CollectionMapView.prototype.add.call(this, collection);
};

NikeCollectionMapView.prototype._drawMap = function () {
    this._map = new L.Map(this.el, this._leafletMapOptions).setView(
        this._leafletMapOptions.center || [0,0],
        this._leafletMapOptions.zoom || 2
    );

    var countryStyle = {
        'color': "#333",
        'stroke': '#333',
        'weight': 0,
        'className': 'hub-country',
        'fillColor': 'url(#countryPattern)',
        'fillOpacity': '1'
    };
    var countriesLayer = L.geoJson(countriesJson, {
        style: countryStyle
    });
    countriesLayer.addTo(this._map);

    var svg = d3.select('svg.leaflet-zoom-animated');
    svg.append('defs')
       .append('pattern')
       .attr('id', 'countryPattern')
       .attr('patternUnits', 'userSpaceOnUse')
       .attr('width', '3')
       .attr('height', '3')
       .append('image')
       .attr('xlink:href', '../imgs/map-fill2.png')
       .attr('width', '3')
       .attr('height', '3');
};

NikeCollectionMapView.prototype._drawMarker = function (dataPoint) {
    var collection = dataPoint.getCollection();
    var collectionArchive = collection.createArchive();

    var fetchContentForAvatars = function (data) {
        var thumbnailUrl;
        var contentItem = data;
        if (contentItem.attachments.length && contentItem.attachments[0].thumbnail_url) {
            thumbnailUrl = contentItem.attachments[0].thumbnail_url;
        } else if (contentItem.author && contentItem.author.avatar) {
            thumbnailUrl = contentItem.author.avatar;
        }

        var svgRings = '<svg class="hub-map-heat-marker" width="340" height="340">';
        svgRings += '<circle class="hub-map-heat-marker-1" cx="170" cy="170" r="42.5" stroke="#fd5300" stroke-width="8" stroke-opacity="0" fill="none"></circle>';
        svgRings += '<circle class="hub-map-heat-marker-2" cx="170" cy="170" r="62.5" stroke="#fd5300" stroke-width="8" stroke-opacity="0" fill="none"></circle>';
        svgRings += '<circle class="hub-map-heat-marker-3" cx="170" cy="170" r="82.5" stroke="#fd5300" stroke-width="8" stroke-opacity="0" fill="none"></circle>';
        svgRings += '<circle class="hub-map-heat-marker-4" cx="170" cy="170" r="102.5" stroke="#fd5300" stroke-width="8" stroke-opacity="0" fill="none"></circle>';
        svgRings += '</svg>';

        var latlng = this._getLatLngFromPoint(dataPoint);
        var marker = new L.Marker(
            latlng, {
                icon: new L.ContentDivIcon({
                    className: 'hub-map-content-marker',
                    html: MarkerTemplate({
                        thumbnail_url: thumbnailUrl || ''
                    }) + svgRings,
                    iconSize: [43,43],
                    content: contentItem
                })
            }
        );
        setInterval(function () {
            var thumbnailEls = $(marker._icon).find('.hub-map-marker-thumbnail');
            var thumbnailEl = thumbnailEls.eq(NikeCollectionMapView.getRandom(0, thumbnailEls.length-1));
            thumbnailEl.addClass('hub-map-marker-zoom');
            setTimeout(function () {
                thumbnailEl.removeClass('hub-map-marker-zoom')
            }, 3000);
        }, NikeCollectionMapView.getRandom(5000,10000));

        this._addMarkerToMap(marker);
        this._collectionToMarker[collection.id] = marker;

        var num = Math.min(Math.round(collection.heatIndex), 5);
        var read = function (data) {
            num--;

            var contentItem = data;
            var thumbnailUrl;
            if (contentItem.attachments.length && contentItem.attachments[0].thumbnail_url) {
                thumbnailUrl = contentItem.attachments[0].thumbnail_url;
            } else if (contentItem.author && contentItem.author.avatar) {
                thumbnailUrl = contentItem.author.avatar;
            }

            var markerEl = $('<img class="hub-map-marker-thumbnail" src="'+thumbnailUrl+'">');
            markerEl.css({
                top: NikeCollectionMapView.getRandom(-1*this._shiftDistance, this._shiftDistance)+'px',
                left: NikeCollectionMapView.getRandom(-1*this._shiftDistance, this._shiftDistance)+'px'
            });
            $(marker._icon).find('.hub-map-marker-bg').append(markerEl);

            if (num < 0) {
                collectionArchive.removeListener('data', read);
                collectionArchive.pause();
            }
        }.bind(this);
        collectionArchive.on('data', read);
    }.bind(this);

    collectionArchive.once('data', fetchContentForAvatars);
};

NikeCollectionMapView.getRandom = function (min, max) {
    return Math.floor(Math.random() * (max - min) + min);
};
