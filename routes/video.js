var _ = require("lodash");
var path = require("path");
var fs = require('fs');
var botModel = {};

botModel.getVideo = function(req, res) {
    var output = res;
    var video = '';
    var log_filename = "comment";

    fs.readFile( path.join(__dirname+'/'+ log_filename), 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      console.log(data);
    });

    //output.send("show index" + video);
    output.sendFile(path.join(__dirname+'/video.html'));

};

module.exports = botModel;