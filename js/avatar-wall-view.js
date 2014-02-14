var ContentListView = Livefyre.require('streamhub-sdk/content/views/content-list-view');
var inherits = Livefyre.require('inherits');

var AvatarWallView = function (opts) {
    opts = opts || {};
    this._layers = opts.layers || 5;
    this._falling = false;

    ContentListView.call(this, opts);
};
inherits(AvatarWallView, ContentListView);

AvatarWallView.prototype.foregroundSelector = '.nike-avatar-wall-foreground';
AvatarWallView.prototype.focusSelector = '.nike-avatar-wall-focus';
AvatarWallView.prototype.backgroundSelector = '.nike-avatar-wall-background';

AvatarWallView.prototype.createContentView = function (content) {
    return new AvatarContentView({ content: content });
};

AvatarWallView.prototype._insert = function (contentView) {
    var translateX = getRandomInt(0, this.$el.width())
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

    setTimeout(function () {
        setInterval(function () {
            contentView.$el.removeClass('nike-avatar-wall-fall');
            setTimeout(function () {
                contentView.$el.addClass('nike-avatar-wall-fall');
            }, 500);
        }, 5000);
    }, getRandomInt(500, 5000));
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
