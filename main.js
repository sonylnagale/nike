Livefyre.require([
    'streamhub-sdk/collection',
    'streamhub-sdk/content/views/content-list-view',
    'streamhub-wall'],
function (Collection, ListView, WallView) {

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
            this.initCarousel();
            this.initFeedScroller();
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
        }
    };
    
    Hub.init();
}); 