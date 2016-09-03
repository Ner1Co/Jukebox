module.exports = function(user) {
    /*
     {
        "spotId":"id",
         "song":{
             "apiId":"id",
            "api":"api"
        },
        "comment":"str"
     }
     */
    user.newSuggestion = function (id, data, callback){
        var Song = user.app.models.Song;
        var Suggestion = user.app.models.Suggestion;
        var Vote = user.app.models.Vote;

        function createSuggestion(song) {
            Suggestion.create({userId: id, songId: song.id, spotId: data.spotId, date: new Date()}, (err, newSuggestion) => {
                Vote.create({score: 1, date: new Date(), comment: data.comment, suggestionId: newSuggestion.id,
                    userId: id, spotId: data.spotId}, (err, newVote) => {
                    newSuggestion.vote = newVote;
                    callback(null, newSuggestion);
                });
            });
        }



        Song.findOne({where: {and :[{api: data.song.api}, {apiId: data.song.apiId}]}}, (err ,foundSong) => {
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

    function getElasticRating(suggestion, callback) {
        callback(null, 0);
    }

    function getYoutubeRating(suggestion) {
        var song = suggestion.song();
        var rating = song.statistics.likeCount / song.statistics.viewCount - song.statistics.dislikeCount / song.statistics.viewCount;

        return rating;
    }

    // return a number between 0 and 1
    function getLocalRating(suggestion, playedSongs) {
        playedSongs.forEach(playedSong => {
            if (playedSong.suggestion().songId == suggestion.songId) {
                return 0;
            }
        });

        var rating = 0;
        suggestion.votes().forEach(vote => {
            rating += vote.score;
        });
        return (rating / suggestion.votes().length + 1) / 2;
    }

    user.getCurrentSong = function(id, spotId, callback) {
        var Spot = user.app.models.Spot;
        var filter =
        {
            include:[
                {
                    relation: "playedSongs",
                    scope: {
                        include:[
                            {
                                relation: "suggestion",
                                scope:{
                                    include: {
                                        relation: "song"
                                    }
                                }
                            }
                        ]
                    }
                }
            ]
        };

        Spot.findById(spotId, filter, (err, spot) => {

            var playedSongs = spot.playedSongs();
            console.log(playedSongs);
            playedSongs.sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });

            var songIndex = playedSongs.length - 1;
            var lastSong = playedSongs[songIndex];
            lastSong.suggestion = playedSongs[songIndex].suggestion();
            lastSong.suggestion.song = playedSongs[songIndex].suggestion().song;

            callback(null, lastSong);
        });
    };

    user.remoteMethod(
        'getCurrentSong',
        {
            accepts: [{arg: 'id', type: 'string'}, {arg: 'spotId', type: 'string'}],
            http: {path: '/:id/getCurrentSong', verb: 'get'},
            returns: {arg: 'result', type: 'object', root: true}
        }
    );

    user.getNextSong = function (id, spotId, callback) {
        var Spot = user.app.models.Spot;
        var filter =
        {
            include:[
                {
                    relation: "suggestions",
                    scope:{
                        include:[
                            {
                                relation:"song"
                            },
                            {
                                relation:"votes"
                            }
                        ]
                    }
                },
                {
                    relation: "playedSongs",
                    scope: {
                        include:[
                            {
                                relation: "suggestion"
                            }
                        ]
                    }
                }
            ]
        };

        Spot.findById(spotId, filter, (err, spot) => {
            var elasticCounter = spot.suggestions().length;
            var topRatedSong = null;
            var maxScore = 0;
            spot.suggestions().forEach(suggestion => {
                getElasticRating(suggestion, (err, elasticRating) => {
                    if (err) {
                        callback(err, null);
                    }
                    var score = getLocalRating(suggestion, spot.playedSongs()) + getYoutubeRating(suggestion) + elasticRating;
                    if(score > maxScore) {
                        topRatedSong = suggestion.song();
                    }

                    if (--elasticCounter == 0) {
                        callback(null, topRatedSong);
                    }

                })
            })

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
     "apiId": "T2zazSUlxzU",
     "api": "youtube"
   },
   "comment": "new comment"
 }
 *
 */
