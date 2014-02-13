var $ = Livefyre.require('streamhub-sdk/jquery');
var CollectionMapView = Livefyre.require('streamhub-map/views/collection-map-view');
var StateToContent = Livefyre.require('streamhub-sdk/content/state-to-content');
var MarkerTemplate = Livefyre.require('hgn!streamhub-map/views/templates/marker');
var inherits = Livefyre.require('inherits');

var NikeCollectionMapView = function (opts) {
    CollectionMapView.call(this, opts);
};
inherits(NikeCollectionMapView, CollectionMapView);

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
        console.log(thumbnailUrl);

        var latlng = this._getLatLngFromPoint(dataPoint);
        var marker = new L.Marker(
            latlng, {
                icon: new L.ContentDivIcon({
                    className: 'hub-map-content-marker',
                    html: MarkerTemplate({
                        thumbnail_url: thumbnailUrl || ''
                    }),
                    iconSize: [44,48],
                    //iconAnchor: [22,48],
                    content: contentItem
                })
            }
        );

        this._addMarkerToMap(marker);
    }.bind(this));
};
