var CollectionMapView = Livefyre.require('streamhub-map/views/collection-map-view');
var StateToContent = Livefyre.require('streamhub-sdk/content/state-to-content');
var MarkerTemplate = Livefyre.require('hgn!streamhub-map/views/templates/marker');
var inherits = Livefyre.require('inherits');

var NikeCollectionMapView = function (opts) {
    CollectionMapView.call(this, opts);
};
inherits(NikeCollectionMapView, CollectionMapView);

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
                    iconAnchor: [22,48],
                    content: contentItem
                })
            }
        );

        this._addMarkerToMap(marker);
    }.bind(this));
};
