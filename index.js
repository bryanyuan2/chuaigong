var express = require('express');
var index = require('./routes/index');
var video = require('./routes/video');
var app = express();
var bodyParser = require('body-parser');
var port = 8080;
var router = express.Router();
var helmet = require('helmet');
var cors = require('cors');

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
router.get('/index', index.logIndex);

/*
    http://localhost:8080/bot/video
    description: portal to play video
*/
router.get('/video', video.getVideo);



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