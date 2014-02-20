Livefyre.require([
    "streamhub-sdk/collection",
    "streamhub-sdk/content/views/content-list-view",
    "streamhub-wall"],
function (Collection, ListView, WallView) {

    var Slideshow = function (opts) {
        opts = opts || {};

        this._slideEls = $('.item');
        this._collections = {};
        this._apps = {};
        this._feedIntervalIds = {};
        this._prevIndex = this._slideEls.length-1;
        this._index = 0;
        this._firstRun = true;
        this._config = SLIDE_CONFIG;

        this.$carousel = window.$carousel = opts.el ? $(opts.el) : $('<div>');
        this.slideCounter = 0;
        this.numSlides = this._slideEls.length;
        this.$activeSlide;

        this._parseQueryArgs();
        this._attachHandlers();

        this._initCarousel();
    };

    Slideshow.prototype.isPaused = function () {
        return this.$carousel.data()['bs.carousel'].paused;
    }

    Slideshow.prototype.pause = function () {
        this.$carousel.carousel('pause');
        clearTimeout(this._timeoutId);
    };

    Slideshow.prototype.resume = function () {
        this.$carousel.carousel('cycle');
    };

    Slideshow.prototype.next = function () {
        this.$carousel.carousel('next');
        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
        }
    };

    Slideshow.prototype.prev = function () {
        this.$carousel.carousel('prev');
        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
        }
    };

    Slideshow.prototype.jump = function (index) {
        this.$carousel.carousel(index);
    };

    Slideshow.prototype.beginSlideTransitionEvent = 'slide.bs.carousel';
    Slideshow.prototype.endSlideTransitionEvent = 'slid.bs.carousel';

    Slideshow.prototype._getCollectionForSlide = function (slideIndex) {
        return this._collections[slideIndex];
    };

    Slideshow.prototype._pauseCollection = function (slideIndex) {
        var collectionToPause = this._getCollectionForSlide(slideIndex);
        if (collectionToPause) {
            collectionToPause.pause();
        }
    };

    Slideshow.prototype._activateCollection = function (slideIndex) {
        var appView = this._initAppForSlide(slideIndex);
        if (! appView) {
            return;
        }

        var collectionToActivate = this._getCollectionForSlide(slideIndex);
        collectionToActivate.resume();
    };

    Slideshow.prototype._initAppForSlide = function (slideIndex) {
        if (this._apps[slideIndex] || this._apps[slideIndex] === null) {
            return;
        }

        var view;
        var slideEl = this._slideEls.eq(slideIndex);
        if (slideEl.hasClass('nike-media-wall')) {
            view = this.initMediaWall();
        } else if (slideEl.hasClass('nike-counter-wall')) {
            view = this.initCounterWall();
        } else if (slideEl.hasClass('nike-feed-1')) {
            view = this.initFeed1();
        } else if (slideEl.hasClass('nike-feed-2')) {
            view = this.initFeed2();
        }
        // Note: initMap invoked in endSlideTransitionEvent callback, as 
        // Leaflet expects a visible parent div to render within.

        if (! view) {
            this._apps[slideIndex] = null;
        } else {
            this._apps[slideIndex] = view;
        }

        return view;
    };
    
    Slideshow.prototype._initCarousel = function() {
        $carousel.carousel({
            interval: false,
            pause: ""
        });
        $carousel.trigger(this.endSlideTransitionEvent);
    };

    Slideshow.prototype._attachHandlers = function () {
        var self = this;

        this.$carousel.on(this.beginSlideTransitionEvent, function () {
            self._prevIndex = self._slideEls.index(self.$activeSlide[0]);
            self._index = self._prevIndex+1;
            self.$activeSlide = self._slideEls.eq(self._index);

            if (self.$activeSlide.hasClass('nike-media-wall')) {
                clearInterval(self._apps[self._prevIndex]._intervalId);
            }
            if (self.$activeSlide.hasClass('nike-feed-2')) {
                clearInterval(self._feedIntervalIds[1]);
            }
            if (self.$activeSlide.hasClass('nike-graph')) {
                clearInterval(self._feedIntervalIds[2]);
            }

            // KD text bg
            if (self.$activeSlide.hasClass('nike-kd-bg')) {
                self.$carousel.addClass('nike-kd-bg');
            } else {
                self.$carousel.removeClass('nike-kd-bg');
            }

            // Hide and display small counter
            if (self.$activeSlide.attr("data-next-slide") == "counter") {
                $(".sm-counter-wrapper").hide();
            }
            else if (!(self.$activeSlide.attr("data-hide-counter") && self._firstRun)) {
                $(".sm-counter-wrapper").show();
            }

            self._pauseCollection(self._prevIndex);
        });

        this.$carousel.on(this.endSlideTransitionEvent, function () {
            self.$activeSlide = self.$carousel.find(".active");

            // Preload the next slide,
            // with 2s delay to avoid janking slide animation.
            var nextIndex = self._index+1;
            setTimeout(function () {
                self._activateCollection(nextIndex);
            }, 2000);

            // Operations on next slide
            var $nextSlide = self._slideEls.eq(nextIndex);
            if ($nextSlide.hasClass('nike-counter-wall')) {
                var view = self._apps[nextIndex];
                if (view) {
                    view.restartLoop();
                }
            }

            // Operations on active slide
            if (self.$activeSlide.hasClass('nike-feed-1')) {
                var view = self._apps[self._index];
                if (view) {
                    self._rotateFeed(1);
                }
            }
            if (self.$activeSlide.hasClass('nike-feed-2')) {
                var view = self._apps[self._index];
                if (view) {
                    self._rotateFeed(2);
                }
            }
            if (self.$activeSlide.hasClass('nike-map')) {
                if (self._apps[self._index]) {
                    return;
                 }
                 var view = self.initMap();
                 self._apps[self._index] = view;
            }

            var slideDuration = self.$activeSlide.attr('data-slide-duration');
            if (slideDuration) {
                slideDuration = parseInt(slideDuration, 10);
            } else {
                slideDuration = this.config.carouselInterval;
            }
            this._timeoutId = setTimeout(function () {
                if (! self.isPaused()) {
                    self.next();
                }
            }, slideDuration);

            if (self._config.reloadCycle > 0) {
                if ((self._config.reloadCycle * self.numSlides) == ++self.slideCounter) {
                    self._firstRun = false;
                    self.slideCounter = 0;
                    location.reload();
                }
            }
        });
    };

    Slideshow.prototype._initView = function (opts) {
        opts = opts || {};

        var slideIndex = this._slideEls.index($(opts.el).parents('.item')[0]);
        if (this._collections[slideIndex]) {
            return;
        }

        var collection = this._collections[slideIndex] = opts.collection || new Collection(opts.config);

        opts.config.el = opts.el;
        var view = new opts.view(opts.config);
        collection.pipe(view);

        return view;
    };

    Slideshow.prototype.initMediaWall = function () {
        return this._initView({
            config: this._config.mediaWall,
            collection: new Collection(this._config.mediaWall),
            el: $('#wall')[0],
            view: WallView
        });
    };

    Slideshow.prototype.initCounterWall = function () {
        var view = this._initView({
            config: this._config.counterWall,
            collection: new Collection(this._config.counterWall),
            el: $('#avatar-wall')[0],
            view: AvatarWallView
        });

        if (! this._flipCounter) {
            setTimeout(function () {
                this._flipCounter = new FlipCounter(this._config.ncomments);
            }.bind(this), 1000);
        }

        return view;
    };

    Slideshow.prototype.initFeed1 = function () {
        var $el = $('#feed1');
        var view = this._initView({
            config: this._config.listFeed1,
            collection: new Collection(this._config.listFeed1),
            el: $el[0],
            view: ListView
        });

        return view;
    };

    Slideshow.prototype.initFeed2 = function () {
        var $el = $('#feed2');
        var view = this._initView({
            config: this._config.listFeed1,
            collection: new Collection(this._config.listFeed2),
            el: $el[0],
            view: ListView
        });

        return view;
    };

    Slideshow.prototype._rotateFeed = function (feedIndex) {
        var fn = function () {
            var $el = $('#feed'+feedIndex);
            var $contentEls = $el.find('.hub-content-container');

            // If there's just 1 piece of content, show it
            if ($contentEls == 1) {
                $contentEls.eq(0).find('article').show();
            } else {
                $contentEls.eq(0).find("article").fadeOut("slow", function () {
                    $contentEls.eq(1).find("article").fadeIn("slow", function() {
                         $contentEls.eq(0).appendTo($el.find(".hub-list"));
                    });
                });
            }
        };

        fn();
        this._feedIntervalIds[feedIndex] = setInterval(fn, this._config.feedScrollerInterval);
    };

    Slideshow.prototype.initMap = function () {
        this._initView({
            config: this._config.map,
            collection: new PollingHotCollections(this._config.map.hotCollectionsMeta),
            el: $('#nike-map')[0],
            view: NikeCollectionMapView
        });
    };

    Slideshow.prototype.initGraph = function () {
    };

    Slideshow.prototype._parseQueryArgs = function () {
        // Parse out query params
        var url = location.search;
        var params = url.split("&");

        for (var i = 0, len = params.length; i < len; i++) {
            var kv = params[i].split("=");
            kv[0] = kv[0].replace("?", "");
            kv[1] = parseInt(kv[1]);

            // Carousel Interval
            if (kv[0] == "ci") {
                this._config.set("carouselInterval", kv[1]);
            }

            // Feed Interval
            if (kv[0] == "fi") {
                this._config.set("feedScrollerInterval", kv[1]);
            }

            // Reload Carousel
            if (kv[0] == "rc") {
                this._config.set("reloadCycle", kv[1]);
            }
        }
    };
    
    $(window).on('load', function () {
        window.slideshow = new Slideshow({ el: $('.carousel') });
    });

    // setInterval(function () {
    //     $('body').trigger('increment.counter');
    // }, 750);
}); 
