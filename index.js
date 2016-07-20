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
var _get = require('lodash/get');

// integrate Socket.IO
var server = require('http').Server(app);
var io = require('socket.io')(server);

var socket = require('./routes/socket')(io);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());

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
 * path: /bot/livedemoit
 * description: portal to play video
 */
router.get('/livedemoit', video.getVideo);

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
