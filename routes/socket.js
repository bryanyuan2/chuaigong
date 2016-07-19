"use strict"

var path = require("path");
var botModel = {};

botModel.init = function(req, res) {
    var CONST_SOCKET_HTML_SOURCE = "socket.html";
    res.sendFile(path.join(__dirname, CONST_SOCKET_HTML_SOURCE));
};

module.exports = botModel;