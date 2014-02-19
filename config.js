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
        articleId: 'custom-1385074953161'
    },
    listFeed1: {
        network: "strategy-prod.fyre.co",
        siteId: '340628',
        articleId: 'custom-1392076496202'
    },
    listFeed2: {
        network: "strategy-prod.fyre.co",
        siteId: '340628',
        articleId: 'custom-1392076496202'
    },

    // ncomments config
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
