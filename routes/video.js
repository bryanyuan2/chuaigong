"use strict"

var fs = require('fs');
var path = require("path");
var botModel = {};

botModel.getSlaughter = function(req, res) {
  var CONST_LOG_FILENAME = "demo-slaughter-15.json";
  //var CONST_LOG_FILENAME = "demo-slaughter-20.json";
  //var CONST_LOG_FILENAME = "demo-slaughter-100.json";
  var target_result = Array();
  var target_time = Array();

  fs.readFile( path.join(__dirname+'/corpus/'+ CONST_LOG_FILENAME), 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    data = data.split('\n');
    for(var i=0;i<data.length-1;i++) {
      var line = data[i].split('|');
      var target_comment = line[0],
          target_tsamp = line[1];
      target_result.push(target_comment);
      target_time.push(target_tsamp);
    }

    if(target_result.length > 0){
      res.send([{status: 'ok'}, {comment: target_result}, {time: target_time}]);
    } else {
      res.send([{status: 'empty'}, {comment: ''}, {time: ''}]);
    }

  });
};

botModel.getVideo = function(req, res) {
    var CONST_VIDEO_HTML_SOURCE = "video.html";
    res.sendFile(path.join(__dirname, CONST_VIDEO_HTML_SOURCE));

};

module.exports = botModel;