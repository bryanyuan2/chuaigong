var _ = require("lodash");
var fs = require('fs');
var path = require("path");
var botModel = {};

botModel.logIndex = function(req, res) {
    var log_filename = "comment";

    var logtimestamp = new Date().getTime();
    var log_comment = "test comment"
    var log_content = log_comment + "|" + logtimestamp + "\n";

    fs.appendFile( path.join(__dirname+'/'+ log_filename), log_content, function(err) {
        if(err) {
            res.send([{status: 'error'}, {comment: log_comment}, {log: err}]);
            return console.log(err);
        }
        res.send([{status: 'ok'}, {comment: log_comment}]);
    });
};

module.exports = botModel;