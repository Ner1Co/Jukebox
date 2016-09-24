var YouTube = require('youtube-node');
var youTube = new YouTube();

module.exports = function(Song) {

    function parseGenre(genre){
        var genreIndex = genre.indexOf("(Musical Genre)");
        if(genreIndex > 0){
            return genre.substr(0, genreIndex - 1);
        }

        return "";
    }
    
    Song.observe('before save', (ctx, next) => {
        if (ctx.instance) {
            ctx.instance.updated = new Date();

            youTube.setKey('AIzaSyB1OOSpTREs85WUMvIgJvLTZKye4BVsoFU');

            youTube.getById(ctx.instance.apiId, function(error, result) {
                if (error) {
                    // console.log(error);
                    next();
                }
                else {
                    var genres = [];
                    if(result.items[0].snippet.tags) {
                        result.items[0].snippet.tags.forEach(genre => {
                            if(genre = parseGenre(genre)){
                                genres.push(genre);
                            }
                        });
                    }

                    ctx.instance.genre = genres;
                    ctx.instance.statistics = result.items[0].statistics;
                    next();
                }
            });

        } else {
            ctx.data.updated = new Date();
            next();
        }
    });
};
