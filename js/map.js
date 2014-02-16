var NIKE_MAP_INIT = false;
function initMap() {
    if (NIKE_MAP_INIT) {
        return;
    }
    var MockHotCollectionsStream = Livefyre.require('streamhub-hot-collections-tests/mocks/streams/mock-hot-collections');

    var sfLatLon = { lat: 37.7749295, lon: -122.4194155 };
    var usaLatLon = { lat: 37.09024, lon: -95.712891 };
    var europeLatLon = { lat: 54.5259614, lon: 15.2551187 };
    var southAmericaLatLon = { lat: -8.783195, lon: -55.491477 };
    var indiaLatLon = { lat: 20.593684, lon: 78.96288 };
    var indonesiaLatLon = { lat: -0.789275, lon: 113.921327 };

    // Collection to Location Mapping
    //TODO(ryanc): collectionId -> lat/lon or articleId -> lat/lon
    var collectionToLocation = {
        60969431: sfLatLon,
        58265981: usaLatLon,
        58201034: europeLatLon,
        58366495: southAmericaLatLon,
        46862364: indiaLatLon,
        48214966: indonesiaLatLon
    };

    var mapView = window.mapView = new NikeCollectionMapView({
        el: document.getElementById('nike-map')
        ,collectionToLocation: collectionToLocation
        ,leafletMapOptions: {
            center: [36.02571363233062, -92.61560440063477],
            zoom: 5,
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            zoomControl: false,
            attributionControl: false
        }
    });

    var hotCollectionsStream = new PollingHotCollections({
        network: 'strategy-prod.fyre.co',
        siteId: '340628'
    });

    hotCollectionsStream.pipe(mapView);

    NIKE_MAP_INIT = true;
}
