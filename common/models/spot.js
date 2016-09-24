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
};
