var express = require('express');
var index = require('./routes/index');
var video = require('./routes/video');
var socket = require('./routes/socket');
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
var router = express.Router();
var helmet = require('helmet');
var cors = require('cors');
var path = require("path");
var _get = require('lodash/get');

// integrate Socket.IO
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());

/* root */
router.get('/', function(req, res) {
    res.json({ message: '2016 yahoo botday' });
});

/* bot route */
/*
    path: /bot/index
    description: restful api to get msg indexing
*/
/* Socket IO */
io.on('connection', function(socket) {
    socket.on('chat', function(msg){
        io.emit('chat', msg);
    });
});

// router.post('/index', index.handleMessage);

/* temporarily move all index.handleMessage to here */
var STREAMING_SYNTAX = {
    "讚": "/images/icon/bot-thumb.png",
    "好球": "/images/icon/bot-ball.png",
    "謝謝": "/images/icon/bot-thanks.png",
    "幹": "/images/icon/bot-dislike.png",
    "爽": "/images/icon/bot-cheers.png",
    "[LIKE]": "/images/icon/bot-like.png",
    "[SUPERLIKE]": "/images/icon/bot-thumb.png"
};
router.post('/index', function handleMessage(req, res) {

    var body = req.body;
    var attachment;
    var message = body.message || '';
    var messageType = body.type || 'text';
    var userid = body.userid || 'test';
    var messageText = '';

    // process received attachments
    if(messageType === 'attachments') {
        var sticker_url = _get(message, '0.payload.url', '');
        messageText = sticker_url;
        for (var i=0; i<likes.length; i++) {
            if(sticker_url.indexOf(likes[i]) > 0) {
                messageText = '[LIKE]';
            }
        }
    }
    // process received text
    else if (messageType === 'text') {
        // TODO: Find a proper way to suppress echo
        if (message.indexOf('已加入 #') >= 0) {
            // do nothing
        } else {
            messageText = message;
        }
    }

    // save received messageText
    if (messageText) {
        var comment = messageText;
        var src;

        // customized output for stickers
        if(messageText in STREAMING_SYNTAX) {
            src = STREAMING_SYNTAX[messageText];
            comment = '<img src="' + src + '" class="sticker" />';
        } else if (messageType === 'attachments') {
            src = messageText;
            comment = '<img src="' + src + '" class="sticker" />';
        }

        io.emit('chat', comment);
    }
    res.status(200).end();
});

router.get('/socket', socket.init);

/*
    path: /bot/livedemoit
    description: portal to play video
*/
router.get('/livedemoit', video.getVideo);

router.get('/getmongocomment', video.getCommentFromMongo);

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

/*
    mount router under the path /bot
*/
app.use('/bot', router);

server.listen(port);
console.log('listening on port ' + port);
