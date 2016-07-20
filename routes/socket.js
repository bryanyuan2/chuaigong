'use strict';

var _get = require('lodash/get');

module.exports = function (io) {

    var factory = {};

    var STREAMING_SYNTAX = {
        '讚': '/images/icon/bot-thumb.png',
        '好球': '/images/icon/bot-ball.png',
        '謝謝': '/images/icon/bot-thanks.png',
        '幹': '/images/icon/bot-dislike.png',
        '爽': '/images/icon/bot-cheers.png',
        '[LIKE]': '/images/icon/bot-like.png',
        '[SUPERLIKE]': '/images/icon/bot-thumb.png'
    };

    // var likes = [
    //     '851582_369239386556143_1497813874',
    //     '851587_369239346556147_162929011',
    //     '851557_369239266556155_759568595'
    // ];

    /*
     * Method to extract url from attachment
     * @param message {object/string} incoming facebook message object or string
     * @returns {string} url string in an attachment
     */
    factory._extractAttachmentsUrl = function (message) {
        return _get(message, '0.payload.url', '');
    };
        // customized output for stickers

    /*
     * Method to replace some keywords with predefined stickers
     * @param messageText {string} message text string, maybe text, url or empty string
     * @param replacements {object} an object containing the mapping between keyword and image src
     * @returns {string} html string
     */
    factory._replaceCostumizedSticker = function (messageText, replacements) {

        var src = messageText in replacements ? replacements[messageText] : messageText;
        return src && '<img src="' + src + '" class="sticker" />' || '';
    };

    /*
     * Method to handle incoming messages
     * @param req request
     * @param res response
     */
    factory.handleMessage = function (req, res) {

        var body = req.body;
        var message = body.message || '';
        var messageType = body.type || null;
        var messageText = '';
        var comment;

        if(messageType === 'attachments') {
            messageText = factory._extractAttachmentsUrl(message);
            comment = factory._replaceCostumizedSticker(messageText, STREAMING_SYNTAX);
        }
        else if (messageType === 'text') {
            comment = message.indexOf('已加入 #') < 0 && message;
        }

        // TODO: recognize user id
        // ...
        // var userid = body.userid || 'test';

        // emit comment
        if (comment) {
            io.emit('chat', comment);
        }
        res.status(200).end();
    };

    return factory;
};
