var YouTube = require('youtube-node');
var youTube = new YouTube();

module.exports = function(user) {
    //data : {spotId, song : {link, api}, comment}
    user.newSuggestion = function (id, data, callback){
        var Song = user.app.models.Song;
        var Suggestion = user.app.models.Suggestion;
        var Vote = user.app.models.Vote;

        function createSuggestion(song) {
            Suggestion.create({userId: id, songId: song.id, spotId: data.spotId}, (err, newSuggestion) => {
                Vote.create({score: 1, date: new Date(), comment: data.comment, suggestionId: newSuggestion.id,
                    userId: id, spotId: data.spotId}, (err, newVote) => {
                    newSuggestion.vote = newVote;
                    callback(null, newSuggestion);
                });
            });
        }



        Song.findOne({where: {and :[{api: data.song.api}, {link: data.song.link}]}}, (err ,foundSong) => {
            if(foundSong) {
                createSuggestion(foundSong);
            } else {
                Song.create(data.song, (err, newSong) => {
                    createSuggestion(newSong);
                })
            }
        });
    };

    user.remoteMethod(
        'newSuggestion',
        {
            accepts: [{arg: 'id', type: 'string'}, {arg: 'data', type: 'object', http: { source: 'body' }}],
            http: {path: '/:id/newSuggestion', verb: 'post'},
            returns: {arg: 'result', type: 'string', root: true}
        }
    );

    user.getNextSong = function (id, spotId, callback) {
        var Song = user.app.models.Song;
        var Suggestion = user.app.models.Suggestion;
        var Vote = user.app.models.Vote;
        var Spot = user.app.models.Spot;

        Spot.findById({id: spotId}, {include: [{suggestions: "songs"}, "playedSongs"]}, (err, spot) => {

        });
        // Suggestion.find({include: "song"},(err, suggestions) => {
        //
        // });



        youTube.setKey('AIzaSyB1OOSpTREs85WUMvIgJvLTZKye4BVsoFU');

        youTube.getRating('HcwTxRuq-uk', function(error, result) {
            if (error) {
                callback(error, null);
               // console.log(error);
            }
            else {
                callback(null, result);
               // console.log(JSON.stringify(result, null, 2));
            }
        });


    };

    user.remoteMethod(
        'getNextSong',
        {
            accepts: [{arg: 'id', type: 'string'}, {arg: 'spotId', type: 'string'}],
            http: {path: '/:id/getNextSong', verb: 'get'},
            returns: {arg: 'result', type: 'object', root: true}
        }
    );
};


/**
 * Examples
 *
 *
 {
   "spotId": "1",
   "song": {
     "link": "https://www.youtube.com/watch?v=T2zazSUlxzU",
     "api": "youtube"
   },
   "comment": "new comment"
 }
 *
 */
