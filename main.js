Livefyre.require([
    "streamhub-sdk/collection",
    "streamhub-sdk/content/views/content-list-view",
    "streamhub-wall"],
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
        
        /*
         * Pointer to media wall
         */
        mediaWallInstance: null,

        /*
         * Pointer to list feed
         */
        feedInstance1: null,
        feedInstance2: null,

        /**
         * Flag if this is the first cycle of the carousel
         */
        firstRun: true,

        config: SLIDE_CONFIG,

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
            this.initFeedScroller("#feed1");
            this.initFeedScroller("#feed2");
            this.initFlipCounter();
            this.initCarousel();
        },

        /**
         * Setup for the carousel
         **/
        initCarousel: function() {
            var $carousel = window.$carousel = $(".carousel");
            var self = this;

            $carousel.on("slide.bs.carousel", function () {
                $activeSlide = $carousel.find(".active");

                if ($activeSlide.hasClass('nike-kd-bg')) {
                    $carousel.addClass('nike-kd-bg');
                } else {
                    $carousel.removeClass('nike-kd-bg');
                }

                /* smoke and mirrors for the small counter*/
                if ($activeSlide.attr("data-next-slide") == "counter") {
                    $(".sm-counter-wrapper").hide();
                }
                else if (!($activeSlide.attr("data-hide-counter") && self.firstRun)) {
                    $(".sm-counter-wrapper").show();   
                }

                if ($activeSlide.attr("data-next-slide") == "avatar-wall") {
                    initAvatarWall(); //global
                }

                /* pause and resume the media wall*/
                if ($activeSlide.attr("data-next-slide") == "media-wall") {
                    destroyAvatarWall(); //global
                    self.mediaWallInstance.pause();
                }

                if ($activeSlide.find("#wall").length > 0) {
                    self.mediaWallInstance.resume();
                }

                if ($activeSlide.attr("data-next-slide") == "nike-map") {
                    setTimeout(function () { initMap(); }, 500); //global
                }

            });

            $carousel.on("slid.bs.carousel", function () {
                $activeSlide = $carousel.find(".active");

                var slideDuration = $activeSlide.attr('data-slide-duration');
                if (slideDuration) {
                    slideDuration = parseInt(slideDuration, 10);
                } else {
                    slideDuration = this.config.carouselInterval;
                }
                setTimeout(function () {
                    if (! $carousel.data()['bs.carousel'].paused) {
                        $carousel.carousel('next');
                    }
                }, slideDuration);

                if (self.config.reloadCycle > 0) {
                    if ((self.config.reloadCycle * self.totNumSlides) == ++self.slideCounter) {
                        self.firstRun = false;
                        self.slideCounter = 0;
                        location.reload();
                    }
                }
            });

            $carousel.carousel({
                interval: false,
                pause: ""
            });
            $carousel.trigger('slid.bs.carousel');
        },

        /**
         * Initializes the collection and pipes them into the appropriate
         * views.
         **/
        initCollections: function() {
            var wallView = new WallView({
                columns: 4,
                el: document.getElementById("wall"),
            });

            var collection1 = new Collection(this.config.mediaWall);
            this.mediaWallInstance = collection1;
            collection1.pipe(wallView);

            var listView1 = new ListView({
                el: document.getElementById("feed1")
            });

            var collection2 = new Collection(this.config.listFeed1);
            this.feedInstance1 = collection2;
            collection2.pipe(listView1);

            var listView2 = new ListView({
                el: document.getElementById("feed2")
            });

            var collection3 = new Collection(this.config.listFeed2);
            this.feedInstance2 = collection3;
            collection3.pipe(listView2);
        },

        /**
         * Does the fading in and out of the list feed
         **/
        initFeedScroller: function (targetElId) {
            var $cur;
            var fn = function () {
                $cur = $(targetElId + " .hub-content-container");

                // If there's just 1 piece of content, just show it
                if ($cur.length == 1) {
                    $cur.eq(0).find("article").show();
                    return;
                }

                $cur.eq(0).find("article").fadeOut("slow", function () {
                    $cur.eq(1).find("article").fadeIn("slow", function() {
                         $cur.eq(0).appendTo($(targetElId + " .hub-list"));
                    });
                });
            };
            setInterval(fn, this.config.feedScrollerInterval);
        },

        /**
         * Initializes and kicks off the counters
         **/
        initFlipCounter: function () {
            var fc = new FlipCounter(this.config.ncomments);
        }
    };
    
    $(window).on('load', function () { Hub.init(); });

    setInterval(function () {
        $('body').trigger('increment.counter');
    }, 750);
}); 
