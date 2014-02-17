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
            this._addCommas(this._clockInstances[i]);
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
        this._addCommas(this._clockInstances[i]);
    }
};
FlipCounter.prototype._addCommas = function (clockInstance) {
    var numDigits = clockInstance.lists.length;

    if (numDigits > 3) {
        for (var i = numDigits, step = 3; i > step; i -= step) {
            $(clockInstance.lists[i - step])[0].$obj.addClass("comma");
        }
    }
};
    