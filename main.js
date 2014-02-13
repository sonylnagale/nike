Livefyre.require([
    "streamhub-sdk/collection",
    "streamhub-sdk/content/views/content-list-view",
    "streamhub-wall",
    "base64"],
function (Collection, ListView, WallView, base64) {

    /**
     * Small client wrapper around nComments endpoint
     **/
    var LfCommentCounts = function (opts, callback) {
        opts = opts || {};
        this.network = opts.network;
        this.siteId = opts.siteId;
        this.articleIds = opts.articleIds;
        this.callback = callback;

        this.getCounts();
    };
    LfCommentCounts.prototype.getCounts = function () {
        var url = "http://bootstrap." +
                  this.network +
                  "/api/v1.1/public/comments/ncomments/" +
                  base64.btoa(this._createSiteArticlePairing()) +
                  ".json";
        $.get(url, this.callback);
    };
    LfCommentCounts.prototype._createSiteArticlePairing = function () {
        var retStr = this.siteId + ":";
        for (var i = 0, len = this.articleIds.length; i < len; i++) {
            retStr +=  this.articleIds[i];
            if (i < len - 1) {
                retStr += ",";
            }
        }

        return retStr;
    };
    LfCommentCounts.prototype.toModel = function (requestData) {
        return {
            feed: requestData.feed,
            instagram: requestData.instagram,
            livefyre: requestData.livefyre,
            facebook: requestData.facebook,
            total: requestData.total,
            twitter: requestData.twitter,
        };
    };

    /**
     * Wrapper around the FlipClock library that
     * marries it with the ncomments endpoint. Emits a
     * global "increment.counter" event on the document
     * body per tick.
     **/
    var FlipCounter = function (opts) {
        opts = opts || {};
        this.opts = opts;
        this.targetEls = opts.targetEls;
        this.network = opts.network;
        this.siteId = opts.siteId;
        this.articleIds = opts.articleIds;
        this.defaultInterval = opts.defaultInterval || 30000;
        this.pollFrequency = opts.pollFrequency || 120000;

        this._clockInstances = [];
        this._dataAdapter;

        $("body").on("increment.counter", this.update.bind(this));
        this.init()
    };
    FlipCounter.prototype.init = function () {
        var clk;

        for (var i = 0, len = this.targetEls.length; i < len; i++) {
            clk = $(this.targetEls[i]).FlipClock(0, {
                clockFace: 'Counter'
            });
            this._clockInstances.push(clk);
        }

        this._dataAdapter = new LfCommentCounts(this.opts, this.callback.bind(this));
    };
    FlipCounter.prototype.callback = function (data) {
        var counts = this._dataAdapter.toModel(data.data[this.siteId][this.articleIds[0]]);
        var clock = this._clockInstances[0];
        if (clock.getTime().time == 0) {
            for (var i = 0, len = this._clockInstances.length; i < len; i++) {
                this._clockInstances[i].setTime(counts.total);
            }
            this.tick(1, this.defaultInterval);
        }
        else {
            var timeDiff = counts.total - clock.getTime().time;
            var interval = timeDiff > 1 ? Math.floor(this.pollFrequency / timeDiff) : this.defaultInterval;
            this.tick(1, interval);
        }
    };
    FlipCounter.prototype.tick = function (step, interval) {
        if (step == -1) {
            this._dataAdapter.getCounts();
            return;
        }
        if (step * interval < this.pollFrequency) {
            step++;
        }
        else {
            step = -1;
        }
        $("body").trigger("increment.counter");
        setTimeout(this.tick.bind(this, step, interval), interval);
    };
    FlipCounter.prototype.update = function () {
        for (var i = 0, len = this._clockInstances.length; i < len; i++) {
            this._clockInstances[i].increment();
        }
    };

    var Hub = {
        /*
         * Total number of slides
         */
        totNumSlides: 0,
        /*
         * Number of slides that have been seen
         */
        slideCounter: 0,
        /**
         * Configuration
         **/
        config: {
            // The time (in milliseconds) between slide shifts
            carouselInterval: 10000,

            // The time (in milliseconds) between tweets fading in and out
            feedScrollerInterval: 5000,
            
            // The number of rotations before the carousel reloads
            reloadCycle: 0,
            
            // The media wall collection info
            mediaWall: {
                network: "strategy-prod.fyre.co",
                siteId: '340628',
                articleId: 'custom-1392076496202'
            },
            listFeed: {
                network: "strategy-prod.fyre.co",
                siteId: '340628',
                articleId: 'custom-1392076496202'
            },

            // ncomments config
            ncomments: {
                network : "strategy-prod.fyre.co",
                siteId: "340628",
                articleIds: ["custom-1392076496202"]
            },
            get: function (key) {
                 return this[key];
            },
            set: function (key, value) {
                this[key] = value;
            }
        },
        /**
         * Kicks off the whole process
         */
        init: function () {
            // Parse out query params
            var url = location.search;
            var params = url.split("&");

            for (var i = 0, len = params.length; i < len; i++) {
                var kv = params[i].split("=");
                kv[0] = kv[0].replace("?", "");
                kv[1] = parseInt(kv[1]);

                // Carousel Interval
                if (kv[0] == "ci") {
                    this.config.set("carouselInterval", kv[1]);
                }

                // Feed Interval
                if (kv[0] == "fi") {
                    this.config.set("feedScrollerInterval", kv[1]);
                }

                // Reload Carousel
                if (kv[0] == "rc") {
                    this.config.set("reloadCycle", kv[1]);
                }
            }

            // Figure out the number of slides
            this.totNumSlides = $(".item").length;

            // And go...
            this.initCollections();
            // this.initCarousel();
            this.initFeedScroller();
            this.initFlipCounter();
        },
        /**
         * Setup for the carousel
         **/
        initCarousel: function() {
            var $carousel = $(".carousel");
            var self = this;

            $carousel.on("slid.bs.carousel", function () {
                if (self.config.reloadCycle > 0) {
                    if ((self.config.reloadCycle * self.totNumSlides) == ++self.slideCounter) {
                        self.slideCounter = 0;
                        location.reload();
                    }
                }
                
            });

            $carousel.carousel({
                interval: this.config.carouselInterval,
                pause: ""
            });
        },
        /**
         * Initializes the collection and pipes them into the appropriate
         * views.
         **/
        initCollections: function() {
            var collection1 = new Collection(this.config.mediaWall);

            var wallView = new WallView({
                columns: 4,
                el: document.getElementById("wall"),
            });

            var archive = collection1.createArchive();
            var updater = collection1.createUpdater();
            archive.on("error", function () {
              if (console && typeof console.log === "function") {
                console.log("archive error", arguments);
              }
            });
            updater.on("error", function () {
              if (console && typeof console.log === "function") {
                console.log("updater error", arguments);
              }
            });
            updater.pipe(wallView);
            archive.pipe(wallView.more);

            // var ListViewExt = function (opts) {
            //     ListView.call(this, opts);
            // };
            // ListViewExt.prototype = new ListView();

            // ListViewExt.prototype.add = function (newView) {
            //     if (newView &&
            //         newView.author &&
            //         newView.author.avatar) {
            //             var avatar = newView.author.avatar;
                    
            //             if (avatar.search(/http:\/\/pbs\.twimg\.com\/profile_images\/[0-9]+\//) > -1) {
            //                 newView.author.avatar = avatar.replace("_normal", ""); 
            //             }
            //     }
            //     ListView.prototype.add.call(this, newView);
            // };

            var listView = new ListView({
                el: document.getElementById("feed")
            });

            var collection2 = new Collection(this.config.listFeed);
            collection2.pipe(listView);
        },
        /**
         * Does the fading in and out of the list feed
         **/
        initFeedScroller: function () {
            // Ghetto, account for loading time
            // setTimeout(function() {
            //     $("#feed .hub-content-container").eq(0).find("article").show();
            // }, 1000);

            var fn = function () {
                $cur = $("#feed .hub-content-container");
                $cur.eq(0).find("article").fadeOut("slow", function () {
                    $cur.eq(1).find("article").fadeIn("slow", function() {
                         $cur.eq(0).appendTo($("#feed .hub-list"));
                    });
                });
            };
            setInterval(fn, this.config.feedScrollerInterval);
        },

        initFlipCounter: function () {
            var fc = new FlipCounter({
                network: "strategy-prod.fyre.co",
                siteId: "340628",
                articleIds: ["custom-1392076496202"],
                targetEls: [".lrg-counter", ".sm-counter"],
            });
        }
    };
    
    Hub.init();
}); 