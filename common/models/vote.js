var request = require('request');

module.exports = function(Vote) {

    function getKeyPhrases(string, callback){
        var post_data = {
            documents: [
                {
                    language: "en",
                    id: "1",
                    text: string
                }
            ]
        };

        var post_options = {
            url: 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases',
            method: 'POST',
            json: post_data,
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': '4bf90a46c747404094b48697a4fa1d10'
            }
        };

        request(post_options, function(err, res, body) {
            callback(err, body.documents[0].keyPhrases);
        });
    }

    Vote.observe('before save', function computePercentage(ctx, next) {
        if (ctx.instance && ctx.instance.comment) {
            getKeyPhrases(ctx.instance.comment, (err, keyPhrases) => {
                ctx.instance.tags = keyPhrases;
                next();
            });
        } else {
            next();
        }
    });
};
