module.exports = function(spot) {

    spot.extendedSuggestions = function (id, callback) {

        var Suggestion = spot.app.models.Suggestion;
        var filter =
        {
            where: {
                spotId: id
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
};
