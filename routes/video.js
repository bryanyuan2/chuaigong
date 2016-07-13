var _ = require("lodash");
var path = require("path");
var fs = require('fs');
var botModel = {};

botModel.getVideo = function(req, res) {
    var output = res,
        CONST_LOG_FILENAME = "comment",
        CONST_TIME_INTERVAL = 3000,
        CONST_VIDEO_HTML_SOURCE = "video.html";
    var previous_timestamp = 0,
        current_timestamp = 0;

    /* setInterval and reach comment */
    setInterval(function(){

      current_timestamp = new Date().getTime();

      console.log("current_timestamp = " + current_timestamp);
      console.log("previous_timestamp = " + previous_timestamp);

      /* read comment */
      fs.readFile( path.join(__dirname+'/'+ CONST_LOG_FILENAME), 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }

        data = data.split('\n');
        for(var i=0;i<data.length-1;i++) {
          var line = data[i].split('|');
          var target_comment = line[0],
              target_timestamp = line[1];

          if (target_timestamp > previous_timestamp && target_timestamp <= current_timestamp) {
            // show up comment
            console.log(target_comment);
          } else {
            console.log("no latest comment");
          }
        }
        previous_timestamp = current_timestamp;
      });
    }, CONST_TIME_INTERVAL);


    //output.send("show video");
    output.sendFile(path.join(__dirname+ '/' + CONST_VIDEO_HTML_SOURCE));

};

module.exports = botModel;