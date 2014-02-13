var $ = Livefyre.require('streamhub-sdk/jquery');
var CollectionMapView = Livefyre.require('streamhub-map/views/collection-map-view');
var StateToContent = Livefyre.require('streamhub-sdk/content/state-to-content');
var MarkerTemplate = Livefyre.require('hgn!streamhub-map/views/templates/marker');
var inherits = Livefyre.require('inherits');

var NikeCollectionMapView = function (opts) {
    CollectionMapView.call(this, opts);

    this._collectionToMarker = {};
};
inherits(NikeCollectionMapView, CollectionMapView);

NikeCollectionMapView.prototype.notify = function (collection) {
    var marker = this._collectionToMarker[collection.id];
    if (!marker) {
        return;
    }

    var ring1 = d3.select($(marker._icon).find('.hub-map-heat-marker-1')[0]);
    var ring2 = d3.select($(marker._icon).find('.hub-map-heat-marker-2')[0]);
    var ring3 = d3.select($(marker._icon).find('.hub-map-heat-marker-3')[0]);
    var ring4 = d3.select($(marker._icon).find('.hub-map-heat-marker-4')[0]);

    ring1.attr('stroke-opacity', '0.6').transition().duration(1000).attr('stroke-opacity', '0');
    ring2.transition().delay(50).attr('stroke-opacity', '0.35').transition().duration(1000).attr('stroke-opacity', '0');
    ring3.transition().delay(200).attr('stroke-opacity', '0.15').transition().duration(1000).attr('stroke-opacity', '0');
    ring4.transition().delay(300).attr('stroke-opacity', '0.05').transition().duration(1000).attr('stroke-opacity', '0');
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

    var svg = d3.select('svg');
    svg.append('defs')
       .append('pattern')
       .attr('id', 'countryPattern')
       .attr('patternUnits', 'userSpaceOnUse')
       .attr('width', '3')
       .attr('height', '3')
       .append('image')
       .attr('xlink:href', '/imgs/map-fill.png')
       .attr('width', '3')
       .attr('height', '3');
};

NikeCollectionMapView.prototype._drawMarker = function (dataPoint) {
    var collection = dataPoint.getCollection();
    var collectionArchive = collection.createArchive();

    collectionArchive.once('data', function (data) {
        var thumbnailUrl;
        var contentItem = data;
        if (contentItem.attachments.length && contentItem.attachments[0].thumbnail_url) {
            thumbnailUrl = contentItem.attachments[0].thumbnail_url;
        } else if (contentItem.author && contentItem.author.avatar) {
            thumbnailUrl = contentItem.author.avatar;
        }

        var svgRings = '<svg class="hub-map-heat-marker" width="305" height="305">';
        svgRings += '<circle class="hub-map-heat-marker-1" cx="152.5" cy="152.5" r="42.5" stroke="#fd5300" stroke-width="15" stroke-opacity="0" fill="none"></circle>';
        svgRings += '<circle class="hub-map-heat-marker-2" cx="152.5" cy="152.5" r="80" stroke="#fd5300" stroke-width="15" stroke-opacity="0" fill="none"></circle>'
        svgRings += '<circle class="hub-map-heat-marker-3" cx="152.5" cy="152.5" r="117.5" stroke="#fd5300" stroke-width="15" stroke-opacity="0" fill="none"></circle>'
        svgRings += '<circle class="hub-map-heat-marker-4" cx="152.5" cy="152.5" r="145" stroke="#fd5300" stroke-width="15" stroke-opacity="0" fill="none"></circle>'
        svgRings += '</svg>';

        var latlng = this._getLatLngFromPoint(dataPoint);
        var marker = new L.Marker(
            latlng, {
                icon: new L.ContentDivIcon({
                    className: 'hub-map-content-marker',
                    html: MarkerTemplate({
                        thumbnail_url: thumbnailUrl || ''
                    }) + svgRings,
                    iconSize: [53,53],
                    content: contentItem
                })
            }
        );

        this._addMarkerToMap(marker);
        this._collectionToMarker[collection.id] = marker;

        //if (collection.id == 48078130) setTimeout(function () { setInterval(function () {this.notify(collection); }.bind(this), 2000) }.bind(this), 2000);
    }.bind(this));
};
