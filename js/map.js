var NIKE_MAP_INIT = false;
function initMap(opts) {
    if (NIKE_MAP_INIT) {
        return;
    }
    opts = opts || {};

    var MockHotCollectionsStream = Livefyre.require('streamhub-hot-collections-tests/mocks/streams/mock-hot-collections');

    var mexicoCity = { lat: 19.432607699202634, lon: -99.13320800056681 };
    var newYorkCity = { lat: 40.71591415543329, lon: -74.00597310159355 };
    var losAngeles = { lat: 34.05450978601848, lon: -118.2423116080463 };
    var toronto = { lat: 34.05450978601848, lon: -118.2423116080463 };
    var chicago = { lat: 41.87557725401747, lon: -87.68661811540369 };
    var houston = { lat: 29.760192698840356, lon: -95.36938959849067 };
    var montreal = { lat: 45.50530138500939, lon: -73.55399249936454 };
    var guadalajara = { lat: 20.665481091681226, lon: -103.34960919746663 };
    var minneapolis = { lat: 44.98187696104041, lon: -93.27147652104031 };
    var portland = { lat: 45.520083870183896, lon:  -122.67620709899347 };

    // Collection to Location Mapping
    //TODO(ryanc): collectionId -> lat/lon or articleId -> lat/lon
    var collectionToLocation = {
        60969431: newYorkCity,
        58265981: mexicoCity,
        58201034: losAngeles,
        58366495: toronto,
        46862364: chicago,
        48214966: houston,
        58202936: montreal,
        59096076: guadalajara,
        46988018: minneapolis,
        47080599: portland
    };

    var mapView = window.mapView = new NikeCollectionMapView({
        el: document.getElementById('nike-map')
        ,collectionToLocation: opts.collectionToLocation || collectionToLocation
        ,leafletMapOptions: {
            center: [31.045837782944986, -95.78360229847021],
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

    var hotCollectionsMeta = opts.hotCollectionsMeta || {
        network: 'strategy-prod.fyre.co',
        siteId: '340628'
    };
    var hotCollectionsStream = new PollingHotCollections(hotCollectionsMeta);

    hotCollectionsStream.pipe(mapView);

    NIKE_MAP_INIT = true;
}
