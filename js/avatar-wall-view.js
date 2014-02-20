var ContentListView = Livefyre.require('streamhub-sdk/content/views/content-list-view');
var inherits = Livefyre.require('inherits');

var AvatarWallView = function (opts) {
    opts = opts || {};
    this._layers = opts.layers || 5;
    this._falling = false;

    this._intervalIds = [];

    ContentListView.call(this, opts);
};
inherits(AvatarWallView, ContentListView);

AvatarWallView.prototype.foregroundSelector = '.nike-avatar-wall-foreground';
AvatarWallView.prototype.focusSelector = '.nike-avatar-wall-focus';
AvatarWallView.prototype.backgroundSelector = '.nike-avatar-wall-background';

AvatarWallView.prototype.createContentView = function (content) {
    return new AvatarContentView({ content: content });
};

AvatarWallView.prototype._getWidth = function () {
    return this._width || this._width = $('#carousel').width();
};

AvatarWallView.prototype._insert = function (contentView) {
    var translateX = getRandomInt(0, $('#carousel').width())
    contentView.$el.css({
        'left': translateX+'px'
    });

    this.$listEl.append(contentView.$el);
    contentView.render();

    var wallClass;
    if (this.views.length % 3 == 0) {
        wallClass = 'nike-avatar-wall-background';
    } else if (this.views.length % 4 == 0) {
        wallClass = 'nike-avatar-wall-foreground';
    } else {
        var layerIndex = getRandomInt(2, this._layers-1);
        wallClass = 'nike-avatar-wall-focus nike-avatar-wall-'+layerIndex;
    }
    contentView.$el.addClass(wallClass);

    this.startLoop(contentView);

};

AvatarWallView.prototype.startLoop = function(contentView) {
    if (contentView) {
        setTimeout(function () {
            this._intervalIds.push(setInterval(function () {
                contentView.$el.removeClass('nike-avatar-wall-fall');
                setTimeout(function () {
                    contentView.$el.addClass('nike-avatar-wall-fall');
                }, 500);
            }, 5000));
        }.bind(this), getRandomInt(500, 5000));
    } else {
        for (var i=0; i < this.views.length; i++) {
            (function (i) {
                setTimeout(function () {
                    contentView = this.views[i];
                    this._intervalIds.push(setInterval(function () {
                        contentView.$el.removeClass('nike-avatar-wall-fall');
                        setTimeout(function () {
                            contentView.$el.addClass('nike-avatar-wall-fall');
                        }, 500);
                    }, 5000));
                }.bind(this), getRandomInt(500, 5000));
            }.bind(this))(i);
        }
    }
};

AvatarWallView.prototype.clearLoop = function () {
    for (var i=0; i < this._intervalIds.length; i++) {
        clearInterval(this._intervalIds[i]);
    }
    this._intervalIds = [];
};

AvatarWallView.prototype.restartLoop = function () {
    this.clearLoop();
    this.startLoop();
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

