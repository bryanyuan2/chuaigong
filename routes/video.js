'use strict';

var fs = require('fs');
var path = require('path');
var botModel = {};

botModel.getSlaughter = function(req, res) {
  var CONST_LOG_FILENAME = 'demo-slaughter-15.json';
  //var CONST_LOG_FILENAME = "demo-slaughter-20.json";
  //var CONST_LOG_FILENAME = "demo-slaughter-100.json";
  var targetResult = [];
  var targetTime = [];

  fs.readFile( path.join(__dirname, 'corpus', CONST_LOG_FILENAME), 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    data = data.split('\n');
    for(var i=0;i<data.length-1;i++) {
      var line = data[i].split('|');
      var targetComment = line[0],
          targetTsamp = line[1];
      targetResult.push(targetComment);
      targetTime.push(targetTsamp);
    }

    if(targetResult.length > 0){
      res.send([{status: 'ok'}, {comment: targetResult}, {time: targetTime}]);
    } else {
      res.send([{status: 'empty'}, {comment: ''}, {time: ''}]);
    }

  });
};

botModel.getVideo = function(req, res) {
    var CONST_VIDEO_HTML_SOURCE = 'video.html';
    res.sendFile(path.join(__dirname, CONST_VIDEO_HTML_SOURCE));

};

module.exports = botModel;