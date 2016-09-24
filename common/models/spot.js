module.exports = function(spot) {

    spot.extendedSuggestions = function (id, callback) {
        var Suggestion = spot.app.models.Suggestion;
        var mindate = Date.now() - 3 * 60 * 60 * 1000;
        var filter =
        {
            where: {
                and :[{spotId: id},  {date: {gt: mindate}}]
            },
            include:[
                {
                    relation:"song"
                },
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
        'extendedSuggestions',
        {
            accepts: [{arg: 'id', type: 'string'}],
            http: {path: '/:id/extendedSuggestions', verb: 'get'},
            returns: {arg: 'result', type: 'object', root: true}
        }
    );

    spot.extendedPlayedSongs = function (id, callback) {
        var PlayedSong = spot.app.models.PlayedSong;
        var filter =
        {
            where: {
                spotId: id
            },
            include:[
                {
                    relation: "suggestion",
                    scope: {
                        include:[
                            {
                                relation:"song",
                                scope: {
                                    fields: ['apiId']
                                }
                            },
                        ]
                    }
                }
            ]
        };

        PlayedSong.find(filter, (err ,playedSongs) => {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, playedSongs);
        })
    };

    spot.remoteMethod(
        'extendedPlayedSongs',
        {
            accepts: [{arg: 'id', type: 'string'}],
            http: {path: '/:id/extendedPlayedSongs', verb: 'get'},
            returns: {arg: 'result', type: 'object', root: true}
        }
    );
};
