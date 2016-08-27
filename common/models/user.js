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
            accepts: [{arg: 'id', type: 'string'}, {arg: 'data', type: 'json', http: { source: 'body' }}],
            http: {path: '/:id/newSuggestion', verb: 'post'},
            returns: {arg: 'result', type: 'string', root: true}
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
