var express = require('express');
var index = require('./routes/index');
var video = require('./routes/video');
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
var router = express.Router();
var helmet = require('helmet');
var cors = require('cors');
var _get = require('lodash/get');
var likes = [
    '851582_369239386556143_1497813874',
    '851587_369239346556147_162929011',
    '851557_369239266556155_759568595'
];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());

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
        if (message == '收到') {
            //
        } else {
            messageText = message;
        }
    }

    if (messageText) {
        console.log('messageText:', messageText);
    }

    res.status(200).json({text: 'kerker'});
});

/*
    http://localhost:8080/bot/video
    description: portal to play video
*/
router.get('/video', video.getVideo);
router.get('/getcomment', video.getComment);

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
app.use(cors(corsOptions));

/* */
app.use('/bot', router);

app.listen(port);
console.log('port ' + port);
