var HotCollections = Livefyre.require('streamhub-hot-collections/streams/hot-collections');
var HotCollectionToCollection = Livefyre.require('streamhub-hot-collections/streams/hot-collection-to-collection');
var $ = Livefyre.require('streamhub-sdk/jquery');
var inherits = Livefyre.require('inherits');

var PollingHotCollections = function (opts) {
    HotCollections.call(this, opts);

    this._frequency = opts.frequency || 1000 * 60;
    this._collectionsMap = {};
    this._fetchCount = 0;
};
inherits(PollingHotCollections, HotCollections);

PollingHotCollections.prototype._read = function () {
    var self = this;
    var clientOptions = {
        network: this._network,
        siteId: this._siteId,
        tag: this._tag
    };
    
    var fetchHotCollections = function () {
        // Fetch Hot Collections from StreamHub
        this._client.get(clientOptions, function (err, hotCollections) {
            if (err) {
                return this.emit('error', err);
            }

            // Transform the JSON objects to Collection objects
            var collections = $.map(hotCollections, HotCollectionToCollection.transform);
            var collectionsToPush = [];
            for (var i=0; i < collections.length; i++) {
                var col = collections[i];
                if (col.id in this._collectionsMap) {
                    this._collectionsMap[col.id].heatIndex = col.heatIndex;
                    col.emit('change:heatIndex');
                } else {
                    this._collectionsMap[col.id] = col;
                    collectionsToPush.push(col);
                }
            }

            this._fetchCount++;

            // If there were none, end the stream
            if ( ! collectionsToPush.length) {
                this.push(undefined);
                return;
            }

            // Else push
            this.push.apply(this, collectionsToPush);
        }.bind(this));
    }.bind(this);

    if (this._fetchCount == 0) {
        fetchHotCollections();
        setInterval(fetchHotCollections, this._frequency);
    }
};
