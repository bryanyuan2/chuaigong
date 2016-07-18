$(document).ready(function() {

    /* this should be replaced when env changes */
    //var DOMAIN = "localhost",

    var DOMAIN = "hack.wjhuang.net",
        GET_COMMENT_API = "http://" + DOMAIN + ":3000/bot/getmongocomment",
        GET_DEMO_API = "http://" + DOMAIN + ":3000/bot/getslaughter",
        CONST_NORMAL_INTERVAL = 2000,
        CONST_DEMO_INTERVAL = 1000;
    var STREAMING_CONF = {
        'left': ['1', '2', '3', '4', '5'],
        "fontSize": ['18', '24', '28', '32'],
        "top": ['60', '120', '180', '240', '300', '360', '420', '330', '390', '450'],
        "speed": ['5', '5.5', '6'],
        "color": ['#FFFFFF']
    };
    var STREAMING_SYNTAX = [{
        "id": "1",
        "pattern": "讚",
        "icon": "http://" + DOMAIN + ":3000/images/icon/bot-thumb.png",
    }, {
        "id": "2",
        "pattern": "好球",
        "icon": "http://" + DOMAIN + ":3000/images/icon/bot-ball.png",
    }, {
        "id": "3",
        "pattern": "謝謝",
        "icon": "http://" + DOMAIN + ":3000/images/icon/bot-thanks.png"
    }, {
        "id": "4",
        "pattern": "幹",
        "icon": "http://" + DOMAIN + ":3000/images/icon/bot-dislike.png",
    }, {
        "id": "5",
        "pattern": "加油",
        "icon": "http://" + DOMAIN + ":3000/images/icon/bot-cheers.png",
    }, {
        "id": "6",
        "pattern": "[LIKE]",
        "icon": "http://" + DOMAIN + ":3000/images/icon/bot-like.png",
    }];
    var CONST_COMMENT_START_POS = "-120px";


    var __T = Date.now();
    var videoOverlay = $('.video-overlay');

    // barrage
    var videoWidth = videoOverlay.first().width();
    var videoHeight = videoOverlay.first().height();
    var videoLeftBufferWidth = 300;
    var videoDummyWidth = videoWidth + videoLeftBufferWidth;
    var barrage = new Barrage(videoDummyWidth, videoHeight);

    function randText() {
        var _rs = '一二三四五六七八九零';
        var len = Math.ceil(Math.random() * 10);
        var str = '';
        for (var i = 0; i < len; i++) {
            var idx = Math.min(Math.floor(Math.random() * 10), 9);
            str += _rs[idx];
        }
        return str;
    }


    /*function generateText(str, size, y, speed, t, videoOverlay) {
        setTimeout(function() {
            var bullet = $('<div class="bullet">' + str + '</div>').first();
            var css = {
                'top': y+'px',
                'font-size': size+'px',
                'visible': 'hidden',
                'left': videoWidth+'px',
                'transition-property': 'left',
                'transition-timing-function': 'linear'
            };
            bullet.css(css);
            videoOverlay.append(bullet);
            // console.log(bullet[0].clientWidth);
            // console.log(bullet.width());
            // console.log(videoDummyWidth);
            var w = bullet.width();
            var travelDist = videoDummyWidth + w;
            var dur = travelDist / speed;
            // shoot!
            bullet.css('visibility', 'visible');
            bullet.css('transition-duration', dur+'s');
            bullet.css('left', (-videoLeftBufferWidth-w)+'px');
            setTimeout(function() { bullet.remove(); }, dur*1000);
        }, Math.max(t-Date.now(), 0));
    }*/

    function delegateToBarrage(str) {
        barrage.shoot(str, {}, videoOverlay, videoLeftBufferWidth);
        /*var outputInfo = barrage.getOutputInfo(str);
        console.log(outputInfo);
        console.log(outputInfo.t-__T, outputInfo.t-Date.now());
        var size = outputInfo.size;
        var y = outputInfo.y;
        var speed = outputInfo.speed;
        var t = outputInfo.t;
        //
        generateText(str, size, y, speed, t, videoOverlay);*/
    }

    /*
    setInterval(function() {
        var t = randText();
        delegateToBarrage(t);
        // console.log(t);
    }, 500);
    setInterval(function() {
        var t = randText();
        delegateToBarrage(t);
        // console.log(t);
    }, 300);
    */

    /* setInterval and reach comment */
    setInterval(function() {
        $.getJSON(GET_COMMENT_API, function(data) {
            // console.log("data", data);
            // get comment
            if (data[0]['status'] === 'ok') {

                // hjyang need: data[1]['comment'][i]
                //getDynamicComponentRendering(cfg = array('comment' => '', 'top' => '', 'left' => '', 'speed => ''', 'fontSize => ''', 'color' => ''))
                for (var i = 0; i < data[1]['comment'].length; i++) {
                    var comment = data[1]['comment'][i];
                    delegateToBarrage(comment);
                }
                // no comment
            } else if (data[0]['status'] === 'empty') {
                //console.log("empty");
            }
        });
    }, CONST_NORMAL_INTERVAL);


    $(".demo-btn").on('click', function() {
        $.getJSON(GET_DEMO_API, function(data) {
            // console.log("slaughter", data);
            if (data[0]['status'] === 'ok') {
                var second_counter = 1;
                setInterval(function() {

                    // hjyang need: data[1]['comment'][i]
                    // getDynamicComponentRendering(cfg = array('comment' => '', 'top' => '', 'left' => '', 'speed => ''', 'fontSize => ''', 'color' => ''))
                    for (var i = 0; i < data[1]['comment'].length; i++) {
                        if (data[2]['time'][i] == second_counter) {
                            delegateToBarrage(data[1]['comment'][i]);
                        }
                    }
                    second_counter = second_counter + 1;
                }, CONST_DEMO_INTERVAL);
            }
        });
    });

});
