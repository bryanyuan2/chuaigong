"use strict"

var express = require('express');
var video = require('./routes/video');
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
var router = express.Router();
var helmet = require('helmet');
var cors = require('cors');
var path = require("path");

// integrate Socket.IO
var server = require('http').Server(app);
var io = require('socket.io')(server);

var socket = require('./routes/socket')(io);

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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());

app.use(express.static('public'));
app.use(cors(corsOptions));


/* root */
router.get('/', function(req, res) {
    res.json({ message: '2016 yahoo botday' });
});

/* Socket IO */
io.on('connection', function(socket) {
    socket.on('chat', function(msg){
        io.emit('chat', msg);
    });
});

/* bot route */

/* handle incomming message
 * path: /bot/index
 * desc: handle post incoming message
 */
router.post('/index', socket.handleMessage);

/*
 * path: /bot/live
 * path: /bot/livedemoit
 * description: portal to play video
 */
router.get('/live', video.getVideo);
router.get('/livedemoit', video.getVideo);

/*
 * path: /bot/getslaughter
 * description: portal to play slaughter
 */
router.get('/getslaughter', video.getSlaughter);

// mount router under the path /bot
app.use('/bot', router);

server.listen(port);

console.log('listening on port ' + port);
