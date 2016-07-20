"use strict"

module.exports = function (io) {

    var botModel = {};

    var STREAMING_SYNTAX = {
        "讚": "/images/icon/bot-thumb.png",
        "好球": "/images/icon/bot-ball.png",
        "謝謝": "/images/icon/bot-thanks.png",
        "幹": "/images/icon/bot-dislike.png",
        "爽": "/images/icon/bot-cheers.png",
        "[LIKE]": "/images/icon/bot-like.png",
        "[SUPERLIKE]": "/images/icon/bot-thumb.png"
    };
    var likes = [
        '851582_369239386556143_1497813874',
        '851587_369239346556147_162929011',
        '851557_369239266556155_759568595'
    ];

    botModel.handleMessage = function (req, res) {
        var body = req.body;
        var attachment;
        var message = body.message || '';
        var messageType = body.type || 'text';
        var userid = body.userid || 'test';
        var messageText = '';

        // process received attachments
        if(messageType === 'attachments') {
            var sticker_url = _get(message, '0.payload.url', '');
            messageText = sticker_url;
            for (var i=0; i<likes.length; i++) {
                if(sticker_url.indexOf(likes[i]) > 0) {
                    messageText = '[LIKE]';
                }
            }
        }
        // process received text
        else if (messageType === 'text') {
            // TODO: Find a proper way to suppress echo
            if (message.indexOf('已加入 #') >= 0) {
                // do nothing
            } else {
                messageText = message;
            }
        }

        // save received messageText
        if (messageText) {
            var comment = messageText;
            var src;

            // customized output for stickers
            if(messageText in STREAMING_SYNTAX) {
                src = STREAMING_SYNTAX[messageText];
                comment = '<img src="' + src + '" class="sticker" />';
            } else if (messageType === 'attachments') {
                src = messageText;
                comment = '<img src="' + src + '" class="sticker" />';
            }

            io.emit('chat', comment);
        }
        res.status(200).end();
    }
    return botModel;
};
