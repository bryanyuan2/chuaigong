var express = require('express');
var index = require('./routes/index');
var video = require('./routes/video');
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
var router = express.Router();
var helmet = require('helmet');
var cors = require('cors');
var path = require("path");

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
router.post('/index', index.handleMessage);

/*
    path: /bot/livedemoit
    description: portal to play video
*/
router.get('/livedemoit', video.getVideo);

router.get('/getcomment', video.getCommentFromMongo);
router.get('/getfilecomment', video.getCommentFromFile);

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

app.listen(port);
console.log('listening on port ' + port);
