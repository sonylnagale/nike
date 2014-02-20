var MAP_CITIES = {
    'mexicoCity':{ lat: 19.432607699202634, lon: -99.13320800056681 },
    'newYorkCity': { lat: 40.71591415543329, lon: -74.00597310159355 },
    'losAngeles': { lat: 34.05450978601848, lon: -118.2423116080463 },
    'toronto': { lat: 34.05450978601848, lon: -118.2423116080463 },
    'chicago': { lat: 41.87557725401747, lon: -87.68661811540369 },
    'houston': { lat: 29.760192698840356, lon: -95.36938959849067 },
    'montreal': { lat: 45.50530138500939, lon: -73.55399249936454 },
    'guadalajara': { lat: 20.665481091681226, lon: -103.34960919746663 },
    'minneapolis':  { lat: 44.98187696104041, lon: -93.27147652104031 },
    'portland': { lat: 45.520083870183896, lon:  -122.67620709899347 }
};

/**
 * Configuration
 **/
var SLIDE_CONFIG = {
    // The time (in milliseconds) between slide shifts
    carouselInterval: 10000,

    // The time (in milliseconds) between tweets fading in and out
    feedScrollerInterval: 10000,

    // The number of rotations before the carousel reloads
    reloadCycle: 0,

    // Collections info
    mediaWall: {
        network: "strategy-prod.fyre.co",
        siteId: '340628',
        articleId: 'custom-1385074953161',
        columns: 4,
        initial: 20,
        showMore: 0
    },
    counterWall: {
        "network": "labs-t402.fyre.co",
        "siteId": "303827",
        "articleId": "xbox-0",
        "environment": "t402.livefyre.com"
    },
    listFeed1: {
        network: "strategy-prod.fyre.co",
        siteId: '340628',
        articleId: 'custom-1392076496202',
        initial: 10,
        showMore: 0
    },
    listFeed2: {
        "network": "labs-t402.fyre.co",
        "siteId": "303827",
        "articleId": "xbox-0",
        "environment": "t402.livefyre.com",
        initial: 10,
        showMore: 0
    },
    map: {
        collectionToLocation: {
            60969431: MAP_CITIES.newYorkCity,
            58265981: MAP_CITIES.mexicoCity,
            58201034: MAP_CITIES.losAngeles,
            58366495: MAP_CITIES.toronto,
            46862364: MAP_CITIES.chicago,
            48214966: MAP_CITIES.houston,
            58202936: MAP_CITIES.montreal,
            59096076: MAP_CITIES.guadalajara,
            46988018: MAP_CITIES.minneapolis,
            47080599: MAP_CITIES.portland
        },
        hotCollectionsMeta: {
            network: 'strategy-prod.fyre.co',
            siteId: '340628'
        },
        leafletMapOptions: {
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
    },
    graph: {

    },
    ncomments: {
        network: "strategy-prod.fyre.co",
        siteId: "340628",
        articleIds: ["custom-1392076496202"],
        targetEls: [".lrg-counter", ".sm-counter"],
    },

    get: function (key) {
         return this[key];
    },
    set: function (key, value) {
        this[key] = value;
    }
};
