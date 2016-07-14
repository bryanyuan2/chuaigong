var express = require('express');
var index = require('./routes/index');
var video = require('./routes/video');
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
var router = express.Router();
var helmet = require('helmet');
var cors = require('cors');
var fs = require('fs');
var path = require("path");

var _get = require('lodash/get');
var likes = [
    '851582_369239386556143_1497813874',
    '851587_369239346556147_162929011',
    '851557_369239266556155_759568595'
];

var msgs = ['大聲講話啊', '一起踹共啊', '快點打字啊'];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());

var DOMAIN = "hack.wjhuang.net";
var STREAMING_SYNTAX = {
    "讚":"http://" + DOMAIN + ":3000/images/icon/bot-thumb.png",
    "好球": "http://" + DOMAIN + ":3000/images/icon/bot-ball.png",
    "謝謝": "http://" + DOMAIN + ":3000/images/icon/bot-thanks.png",
    "幹": "http://" + DOMAIN + ":3000/images/icon/bot-dislike.png",
    "爽": "http://" + DOMAIN + ":3000/images/icon/bot-cheers.png",
    "[LIKE]": "http://" + DOMAIN + ":3000/images/icon/bot-like.png",
    "[SUPERLIKE]": "http://" + DOMAIN + ":3000/images/icon/bot-thumb.png"
}

/* root */
router.get('/', function(req, res) {
    res.json({ message: '2016 yahoo botday' });
});

/* bot route */
/*
    path: http://localhost:8080/bot/index
    description: restful api to get msg indexing
*/
router.post('/index', function(req, res, next) {

    var body = req.body;
    var attachment;
    var message = body.message || '';
    var messageType = body.type || 'text';
    var userid = body.userid || 'john_doe';

    var messageText = '';


    // extract keyword
    // TODO
    // [LOVE], [BALL] ...

    // process received message
    if(messageType === 'attachments') {
        // attachment = message && message.length && message[0];
        var sticker_url = _get(message, '0.payload.url', '');
        for (var i=0; i<likes.length; i++) {
            if(sticker_url.indexOf(likes[i]) > 0) {
                messageText = '[LIKE]';
            }
        }
    }
    else if (messageType === 'text') {
        // pick a message from message pool
        // TODO
        if (msgs.indexOf(message) >= 0) {
            // do nothing
        } else {
            messageText = message;
        }
    }

    if (messageText) {
        // replace text
console.log('>>> messageText:', messageText);
        var comment = messageText;
        if(messageText in STREAMING_SYNTAX) {
            var src = STREAMING_SYNTAX[messageText];
            comment = '<img src="' + src + '" class="sticker" />';
        }
console.log('>>> commment:', comment);

        var commentPath = path.join(__dirname+'/routes/log_demo/comment');
        var timestamp = Date.now();
        fs.appendFileSync(commentPath, comment + '|' + timestamp + '\n');
    }

    res.status(200).end();
});

/*
    http://localhost:8080/bot/video
    description: portal to play video
*/
router.get('/livedemoit', video.getVideo);

router.get('/getcomment', video.getComment);
router.get('/getslaughter', video.getSlaughter);

var whitelist = [
    'http://localhost:3000',
];
var corsOptions = {
    origin: function(origin, callback){
        var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
    },
    credentials: true
};

app.use(express.static('public'));
app.use(cors(corsOptions));

/* */
app.use('/bot', router);

app.listen(port);
console.log('port ' + port);
