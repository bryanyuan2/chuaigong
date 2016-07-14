/**
 * EVENT
 */

var __TS = Date.now();

var StringUtils = {
    getByteLength: function(charCode) {
        if (0x0000 <= charCode && charCode <= 0x0019) {
            return 0;
        } else if (0x0020 <= charCode && charCode <= 0x1FFF) {
            // !
            return 1;
        } else if (0x2000 <= charCode && charCode <= 0xFF60) {
            // 0x6211 我
            return 2;
        } else if (0xFF61 <= charCode && charCode <= 0xFF9F) {
            // 0xFF84 ﾄ
            return 1;
        } else if (0xFFA0 <= charCode) {
            // 65505 ￡
            return 2;
        }
    },
    /**
     * Return width of multi-byte string
     * multi-byte characters are usually twice the width of single byte characters.
     * @param {string} str string
     * @return {int} the width of string
     * @see http://php.net/manual/en/function.mb-strwidth.php
     */
    getMbStringWidth: function(str, begin, end) {
        var i;
        var c;
        var length = 0;
        // default args
        begin = (begin === undefined) ? 0 : begin;
        end = (end === undefined) ? str.length : end;
        // calculate accumulated byte length
        for (i = begin; i < end; i++) {
            c = str.charCodeAt(i);
            length += this.getByteLength(c);
        }
        return length;
    }
};

var Event = function(t, val) {
    this.t = t;
    this.val = val;
};

/**
 * QUEUE
 */

var Queue = function(qsize) {
    // default size
    qsize = (qsize !== undefined) ? qsize : 1000;
    // init
    this.QSIZE = qsize;
    this.q = [];
    this.ql = 0;
    this.qr = 0;
    this.sum = 0;
};
Queue.prototype.size = function() {
    return this.ql<=this.qr ? this.qr-this.ql : this.qr-this.ql+this.QSIZE;
};
Queue.prototype.push = function(e) {
    this.q[this.qr++] = e;
    this.sum += e.val;
    if (this.qr == this.ql) this.ql++;
    if (this.qr == this.QSIZE) this.qr = 0;
};
Queue.prototype.pop = function() {
    if (this.ql == this.qr) return;
    this.sum -= this.q[this.ql].val;
    this.q[this.ql++];
    if (this.ql == this.QSIZE) this.ql = 0;
};
Queue.prototype.head = function() {
    return this.q[this.ql];
};
Queue.prototype.getSum = function() {
    return this.sum;
};

/**
 * BUCKET
 */

var Bucket = function(l, r, val) {
    this.l = l;
    this.r = r;
    this.val = val;
};
Bucket.prototype.getSize = function() {
    return this.r - this.l;
};
Bucket.prototype.dump = function() {
    var out = '(' + this.l + ', ' + this.r + ', ' + (this.val-Date.now())/1000 + ')';
    //var out = '(' + (this.val-__TS)/1000 + ')';
    return out;
}

/**
 * LNode
 */
var LNode = function(obj, prev, next) {
    this.obj = obj;
    this.prev = prev;
    this.next = next;
    this.valid = true;
}
LNode.prototype.remove = function() {
    if (this.prev) this.prev.next = this.next;
    if (this.next) this.next.prev = this.prev;
    this.valid = false;
}
LNode.prototype.insert = function(v) {
    this.next.prev = v;
    v.next = this.next;
    this.next = v;
    v.prev = this;
}
LNode.prototype.lmerge = function() {
    if (!this.prev) return;
    this.prev.obj.r = this.obj.r;
    this.remove();
}
LNode.prototype.rmerge = function() {
    if (!this.next) return;
    this.next.obj.l = this.obj.l;
    this.remove();
}

/**
 * SEGMENT
 */

var Segment = function(yMax, initVal) {
    this.MAX = yMax;
    this.seg = [new Bucket(0, this.MAX, initVal)];
};
Segment.prototype.blindFillBuckets = function(fillTo) {
    var arr = [];
    for (var i=0; i<this.seg.length; i++) {
        var b = this.seg[i];
        var filledVal = Math.max(b.val, fillTo);
        if (arr.length && arr[arr.length-1].val == filledVal) {
            arr[arr.length-1].r = b.r;
        } else {
            arr.push(new Bucket(b.l, b.r, filledVal));
        }
    }
    return arr;
};
Segment.prototype.fillBuckets = function(minBucketSize) {
    if (this.seg.length <= 0) return;
    //
    var head = new LNode(new Bucket(0, 0, 2000000000));
    var tail = new LNode(new Bucket(this.yMax, this.yMax, 2000000000));
    head.next = tail;
    tail.prev = head;
    head.prev = tail.next = null;
    var arr = [];
    for (var i=0; i<this.seg.length; i++) {
        var v = new LNode(this.seg[i]);
        tail.prev.insert(v);
        arr.push(v);
    }
    arr.sort(function(a, b) {
        return a.obj.getSize() - b.obj.getSize();
    });
    //
    for (var i=0; i<arr.length; i++) {
        var v = arr[i];
        if (!v.valid) continue;
        if (v.obj.getSize() >= minBucketSize) continue; 
        if (v.prev.obj.val < v.obj.val || v.next.obj.val < v.obj.val) continue;
        if (v.next == tail || v.prev != head && v.prev.obj.val <= v.next.obj.val) v.lmerge();
        else v.rmerge();
    }
    //
    var newseg = [];
    for (var v=head.next; v!=tail; v=v.next) {
        newseg.push(v.obj);
    }
    this.seg = newseg;
    /*
    // discretify
    var vals = this.seg.map(function(b) { return b.val; });
    vals = _.sortBy(vals);
    vals = _.sortedUniq(vals);
    // binary search
    var lb = -1;
    var rb = vals.length-1;
    while (lb+1 < rb) {
        var m = Math.floor((lb+rb) / 2);
        var arr = this.blindFillBuckets(vals[m]);
        var okay = true;
        for (var i=0; i<arr.length; i++) {
            if (arr[i].getSize() < minBucketSize) {
                okay = false;
                break;
            }
        }
        if (okay) rb = m;
        else lb = m;
    }
    // fill!
    this.seg = this.blindFillBuckets(vals[rb]);
    */
};
Segment.prototype.getBuckets = function(minBucketSize) {
    this.fillBuckets(minBucketSize);
    return this.seg;
};
Segment.prototype.insert = function(ele) {
    //console.log('insert', ele.l, ele.r, ele.val-__TS);
    var arr = [];
    // gen
    for (var i=0; i<this.seg.length; i++) {
        var b = this.seg[i];
        if (b.l < ele.l) arr.push(new Bucket(b.l, Math.min(b.r, ele.l), b.val));
    }
    arr.push(new Bucket(ele.l, ele.r, ele.val));
    for (var i=0; i<this.seg.length; i++) {
        var b = this.seg[i];
        if (b.r > ele.r) arr.push(new Bucket(Math.max(b.l, ele.r), b.r, b.val));
    }
    this.seg = arr;
};
Segment.prototype.dump = function() {
    var out = '> ';
    for (var i=0; i<this.seg.length; i++) {
        if (!i) out += ' ';
        out += this.seg[i].dump();
    }
    return out;
};

/**
 * ROULETTE
 */

var Roulette = function(roulette) {
    this.roulette = roulette;
    var sum = 0;
    for (var i=0; i<this.roulette.length; i++)
        sum += this.roulette[i];
    if (sum > 1e-6) {
        for (var i=0; i<this.roulette.length; i++)
            this.roulette[i] /= sum;
    } else {
        for (var i=0; i<roulette.length; i++)
            this.roulette[i] = 1 / this.roulette.length;
    }
};
Roulette.prototype.roll = function() {
    var thr = Math.random();
    for (var i=0; i<this.roulette.length; i++) {
        if (thr <= this.roulette[i]) return i;
        thr -= this.roulette[i];
    }
    return this.roulette.length - 2;
};

/**
 * BARRAGE
 */

var Barrage = function(width, height) {
    /**
     * Rule of thumbs:
     * 1. We want different message position/size/speed.
     * 2. Minimize, if not completely avoid, overlapping.
     * 3. speed * (screen-height * use-ratio / text-height) ~ input capacity
     *    i.e. throughput / (screenheight * use-ratio) ~ speed / text-height
     * 4. size/speed should have some upper/lower bound
     * 
     * Some thoughts:
     * 1. Dynamic size/speed base on message flow.
     */

    /**
     * constants
     */
    // dimension
    this.WIDTH = width;
    this.HEIGHT = height;
    // text constraints
    this.MIN_SIZE = Math.max(height/24, 24);
    this.MAX_SIZE = Math.min(height/6, 70);
    this.MIN_SPEED = Math.max(width/12, 36);
    this.MAX_SPEED = Math.min(width/3, 240);
    this.PADDING = Math.max(this.MIN_SIZE/3, 12);
    // definition of "recent" event
    this.RECENT_DUR = 10 * 1000; // 10s
    // constants that affect randomization & distribution
    this.USE_RATIO = 0.8;
    this.FLUCTUATE_RATIO = 0.2;
    this.HALF_LIFE = this.MIN_SPEED;

    // states
    this.recent = new Queue();
    this.segment = new Segment(this.HEIGHT, Date.now());
};

Barrage.prototype.getThroughput = function(text) {
    var tnow = Date.now();
    var tpast = tnow - this.RECENT_DUR;
    while (this.recent.size() > 0 && this.recent.head().t < tpast)
        this.recent.pop();
    return this.recent.getSum() * 1000 / this.RECENT_DUR;
};

Barrage.prototype.shoot = function(html, css, parent, videoLeftBufferWidth) {
    var tnow = Date.now();
    var bullet = $('<div class="bullet">' + html + '</div>').first();
    var css = {
        'visible': 'hidden',
        'left': this.WIDTH+'px',
        'transition-property': 'left',
        'transition-timing-function': 'linear'
    };
    bullet.css(css);
    parent.append(bullet);
    var w = bullet.width();

    this.recent.push(new Event(tnow, w));
    // use throughput to determine size & speed
    var throughput = this.getThroughput();
    var prod = throughput * 1000 / (this.HEIGHT * this.USE_RATIO);
    var size = this.MAX_SIZE/Math.sqrt(prod) * 12;
    size = Math.min(Math.max(size, this.MIN_SIZE), this.MAX_SIZE) + (Math.random()*8);
    var speed = prod * 800 /size; // px/sec
    speed = Math.min(Math.max(speed, this.MIN_SPEED), this.MAX_SPEED) + (Math.random()*20);
    console.log(prod, size, speed);
    // with size & speed given, determine where the text should emerge
    // the probability to emerge at a position scale with how early the position is available
    var buckets = this.segment.getBuckets(size);
    var rb = 0;
    var wts = [];
    for (var i=0; i<buckets.length; i++)
        rb = Math.max(rb, buckets[i].val);
    for (var i=0; i<buckets.length; i++) {
        var b = buckets[i];
        var wt = b.getSize() * Math.exp((rb - b.val) * 2 / this.HALF_LIFE);
        wts.push(wt);
    }
    var roulette = new Roulette(wts);
    var idx = roulette.roll();
    //console.log('idx', idx);
    // with bucket fixed, determine y & t
    var b0 = buckets[idx];
    //console.log('b0', b0.dump());
    var y0 = b0.l + (b0.getSize() - size) * Math.random();
    y0 = Math.min(Math.max(y0, 0), this.HEIGHT-size);
    //
    var bb = b0.val;
    for (var i=0; i<buckets.length; i++) {
        var b = buckets[i];
        if (b.l<y0+size && b.r>y0) bb = Math.max(bb, b.val);
    }
    var t0 = Math.max(b0.val + this.PADDING*1000/speed, tnow);
    // update segment
    //var approxTextLen = StringUtils.getMbStringWidth(text) * size * 1.2;
    //console.log(approxTextLen, approxTextLen*1000/speed);
    //this.segment.insert(new Bucket(y0, y0+size, t0+approxTextLen*1000/speed));
    this.segment.insert(new Bucket(y0, y0+size, t0+w*1000/speed));
    //console.log(this.segment.dump());
    //
    //return {
        //text: text,
        //size: size,
        ////speed: speed/this.WIDTH, // speed unit is 100%W/1000
        //speed: speed,
        //y: y0,
        //t: t0
    //};
    //
    //////
    var travelDist = this.WIDTH + w;
    var dur = travelDist / speed;
    // shoot!
    setTimeout(function() {
        css = {
            'top': y0+'px',
            'font-size': size+'px',
            'visibility': 'visible',
            'transition-duration': dur+'s',
            'left': (-videoLeftBufferWidth-w)+'px'
        };
        bullet.css(css);
        setTimeout(function() { bullet.remove(); }, dur*1000);
    }, t0-Date.now());

    return bullet;
};

//Barrage.prototype.input = function(text, callback) {
    //var outputInfo = this.getOutputInfo(text);
    //var timeFromNow = Math.max((outputInfo.t - Date.now()), 0) / 1000;
    //setTimeout(callback.bind(undefined, outputInfo), timeFromNow);
//};
