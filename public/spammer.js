var Spammer = function(cb) {
    this.barrageCallback = cb;
    this.itv = null;
};

Spammer.MAX_PER_SEC = 20;
Spammer.MIN_PER_SEC = 0;

Spammer.randText = function() {
    var _rs = '一二三四五六七八九零';
    var len = Math.ceil(Math.random()*10);
    var str = '';
    for (var i=0; i<len; i++) {
        var idx = Math.min(Math.floor(Math.random()*10), 9);
        str += _rs[idx];
    }
    return str;
};

Spammer.prototype.setRate = function(rate) {
    var cb = this.barrageCallback;
    clearInterval(this.itv);
    if (rate > 1e-3) {
        var t = 1000 / rate;
        this.itv = setInterval(function() {
            cb(Spammer.randText());
        }, t);
    }
};

Spammer.prototype.setRateByScore = function(score) {
    var rate = Spammer.MIN_PER_SEC + (Spammer.MAX_PER_SEC - Spammer.MIN_PER_SEC) * score / 100;
    this.setRate(rate);
};
