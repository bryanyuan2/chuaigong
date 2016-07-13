var _ = require("lodash");
var path = require("path");
var fs = require('fs');
var botModel = {};

botModel.getVideo = function(req, res) {
    var output = res,
        log_filename = "comment";

    /* read comment */
    fs.readFile( path.join(__dirname+'/'+ log_filename), 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }

      data = data.split('\n');
      for(var i=0;i<data.length-1;i++) {
        var line = data[i].split('|');
        var target_comment = line[0],
            target_timestamp = line[1];
        console.log(target_comment, target_timestamp);
      }
    });

    /* setInterval */
    setInterval(function(){
      console.log("Hello");
    }, 3000);


    //output.send("show video");
    output.sendFile(path.join(__dirname+'/video.html'));

};

module.exports = botModel;