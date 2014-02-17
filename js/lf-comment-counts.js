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
