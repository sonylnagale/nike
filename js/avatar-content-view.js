var ContentView = Livefyre.require('streamhub-sdk/content/views/content-view');
var inherits = Livefyre.require('inherits');

var AvatarContentView = function (opts) {
    ContentView.call(this, opts);
};
inherits(AvatarContentView, ContentView);

AvatarContentView.prototype.events = {};

AvatarContentView.prototype.render = function () {
    var thumbnailUrl;
    if (this.content.attachments.length && this.content.attachments[0].thumbnail_url) {
        thumbnailUrl = this.content.attachments[0].thumbnail_url;
    } else if (this.content.author && this.content.author.avatar) {
        thumbnailUrl = this.content.author.avatar;
    }

    var img = $('<div>')
        .addClass(this.avatarSelector.substring(1))
        .css('background-image', 'url('+thumbnailUrl+')');
    this.$el.append(img);

    // If avatar fails to load, hide it
    // Error events don't bubble, so we have to bind here
    // http://bit.ly/JWp86R
    img.on('error', $.proxy(this._handleAvatarError, this));
};

AvatarContentView.prototype._handleAvatarError = function (e) {
    $(e.target).remove();
};
