module.exports = function(spot) {

    spot.suggestionsWithSongs = function (id, callback) {
        var Suggestion = spot.app.models.Suggestion;
        var mindate = Date.now() - 3 * 60 * 60 * 1000;
        var filter =
        {
            where: {
                and :[{spotId: id}, {played:false}]
            },
            include:[
                {
                    relation:"song"
                }
            ]
        };

        Suggestion.find(filter, (err ,suggestions) => {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, suggestions);
        })
    };

    spot.remoteMethod(
        'suggestionsWithSongs',
        {
            accepts: [{arg: 'id', type: 'string'}],
            http: {path: '/:id/suggestionsWithSongs', verb: 'get'},
            returns: {arg: 'result', type: 'object', root: true}
        }
    );

    spot.playedSongs = function (id, callback) {
        console.log(id)
        var Suggestion = spot.app.models.Suggestion;
        var filter =
        {
            where: {
                spotId: id,
                played: true
            },
            order: 'date DESC',
            limit: 50,
            include:[
                {
                    relation:"song",
                    scope: {
                        fields: ['apiId']
                    }
                },
            ]
        };

        Suggestion.find(filter, (err ,suggestions) => {
            if (err) {
                callback(err, null);
                return;
            }
            console.log(suggestions);
            callback(null, suggestions);
        })
    };

    spot.remoteMethod(
        'playedSongs',
        {
            accepts: [{arg: 'id', type: 'string'}],
            http: {path: '/:id/playedSongs', verb: 'get'},
            returns: {arg: 'result', type: 'object', root: true}
        }
    );
};
