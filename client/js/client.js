//Voting and suggestions

var suggestedIds = [];

var submitSug = function () {
    suggestedIds.push($("#suggestModal").attr("data-vid"));

    //send suggestion via ajax call
    var sugData = {
        spotId: Cookies.get("spot"),
        song: {
            apiId: $("#suggestModal").attr("data-vid"),
            api: "youtube"
        },
        comment: $('#suggestText').val(),
        played: false
    };


    console.log(JSON.stringify(sugData));
    $.ajax({
        url: "/api/users/" + Cookies.get("id") + "/makeSuggestion",
        type: "POST",
        data: JSON.stringify(sugData),
        contentType: "application/json",
        success: function (data, textStatus) {
            console.log("suggestion success");
            console.log(data);
            $('button[data-vid="' + $("#suggestModal").attr("data-vid") + '"]').text("Suggestion Accepted!");
            $('button[data-vid="' + $("#suggestModal").attr("data-vid") + '"]').attr("disabled", "disabled");
            $('#suggestText').val("");
        },
        error: function (err, txtStatus) {
            console.log("fail suggestion");
            console.log(err)
            if (err.responseJSON.error.error.status !== undefined && err.responseJSON.error.error.status === 999) {
                alert("Song was already suggested in the last 24 hours, you can vote it in Suggestions tab :(");
                $('button[data-vid="' + $("#suggestModal").attr("data-vid") + '"]').text("Suggestion Played!");
                $('button[data-vid="' + $("#suggestModal").attr("data-vid") + '"]').attr("disabled", "disabled");
                $('#suggestText').val("");
            } else {
                console.log("failed suggesting song...:(")
            }

        }
    })
};
var ytIds = [];
var getHist = function () {
    $('#histLoad').fadeIn();
    $('.histCtr').fadeOut();
    $('.histCtr ').empty();
    //ajax call to server to get ids of history videos
    $.ajax({
        url: "/api/spots/" + Cookies.get("spot") + "/PlayedSongs",
        type: "GET",
        success: function (data, textStatus) {
            console.log("get all history");
            console.log(data);
            data.reverse().forEach(function (sug, idx) {
                if (sug.song !== undefined) {
                    entry = getVideoData(sug.song.apiId, function (entry) {
                        var row = document.createElement('div');
                        row.className = "row";
                        row.setAttribute("data-vid", sug.song.apiId);
                        console.log(entry)
                        row.innerHTML = '<div class="col-lg-12"><h3>' + entry.snippet.title + '</h3> <div>' + (entry.contentDetails ? 'Duration: ' + ytEmbed.formatDuration(entry.contentDetails.duration) + ' | ' : '') + (entry.statistics ? 'Views: ' + entry.statistics.viewCount + '<br>' : '') + '</a></div></div><div><img src="' + entry.snippet.thumbnails.medium.url + '" alt=""/></div>';
                        $('.histCtr').prepend(row);
                    });
                }
            });
        },
        error: function (err, txtStatus) {
            console.log("fail getting suggestions");
            console.log(err)
        }
    });
};
var getSug = function () {
    var voteObj;
    var votesNum=[];
    $('#sugLoad').fadeIn();
    $('.sugCtr').fadeOut();
    $('.sugCtr ').empty();
    //ajax call to server to get ids of suggested videos
    $.ajax({
        url: "/api/users/" + Cookies.get("id") + "/spotSuggestions?spotId=" + Cookies.get("spot"),
        type: "GET",
        success: function (data, textStatus) {
            if (data.length === 0) {
                $('#sugLoad').fadeOut();
                $('.sugCtr').append("<h3>No suggestions found currently</h3>");
                $('.sugCtr').fadeIn();
            } else {
                console.log(data)
                data.forEach(function (sug, idx) {
                    votesNum=getNumOfVotes(sug.votes);
                    ytIds.push(sug.song.apiId)
                    entry = getVideoData(sug.song.apiId, function (entry) {
                        var row = document.createElement('div');
                        row.className = "row";
                        row.setAttribute("data-vid", sug.song.apiId);
                        row.setAttribute("data-sugid", sug.id);
                        row.innerHTML = '<div class="col-lg-12"><h3>' + entry.snippet.title + '</h3> <div>' + (entry.contentDetails ? 'Duration: ' + ytEmbed.formatDuration(entry.contentDetails.duration) + ' | ' : '') + (entry.statistics ? 'Views: ' + entry.statistics.viewCount + '<br>' : '') + '</a></div></div><div><img src="' + entry.snippet.thumbnails.medium.url + '" alt=""/></div><div class="vote"><span id="voteup_'+sug.id +'" class="voteSign">'+ votesNum[0]+'</span><span data-sid="' + sug.id + '" class="up glyphicon glyphicon-thumbs-up" aria-hidden="true" onclick="vote(this,' + "'up'" + ",'" + sug.id + "'" + ')"></span> <span data-sid="' + sug.id + '" class="glyphicon glyphicon-thumbs-down down" aria-hidden="true" onclick="vote(this,' + "'down'" + ",'" + sug.id + "'" + ')"></span> <span id="votedown_'+sug.id +'"  class="voteSign">'+ votesNum[1]+'</span></div>';
                        $('.sugCtr').prepend(row);
                        voteObj = isUserVoted(sug.votes);

                        if (voteObj !== 0) {
                            updateVoteStatus(voteObj.suggestionId, voteObj.score, voteObj.id)
                        }

                    });
                });
            }
        },
        error: function (err, txtStatus) {
            console.log("fail getting suggestions");
            console.log(err)
        }
    });
};

function isUserVoted(votesArr) {
    var v = -1;
    votesArr.forEach(function (vote, idx) {

        if (vote.userId === Cookies.get('id')) {
            console.log(vote)
            v = vote;
        }
    });
    return v
}

function getNumOfVotes(votesArr){
    var counterUp=0;
    var counterDown=0;
    votesArr.forEach(function (vote, idx) {

        if (vote.score === 1) {
            counterUp++;
        }else{
            counterDown++;
        }
    });
    return [counterUp,counterDown];
}
function updateVoteStatus(id, type, vid) {
    $('.up[data-sid="' + id + '"]').attr("data-voteid", vid);
    $('.down[data-sid="' + id + '"]').attr("data-voteid", vid);
    if (type === 1) {
        $('.up[data-sid="' + id + '"]').animate({'color': '#FC0', 'font-size': '40px'}, 1000);
        $('.down[data-sid="' + id + '"]').animate({'color': '#FFF', 'font-size': '12px'}, 1000);
        $('.up[data-sid="' + id + '"]').attr("disabled", true);
        $('.down[data-sid="' + id + '"]').attr("disabled", false);
    } else if (type === -1) {
        $('.down[data-sid="' + id + '"]').animate({'color': '#FC0', 'font-size': '40px'}, 1000);
        $('.up[data-sid="' + id + '"]').animate({'color': '#FFF', 'font-size': '12px'}, 1000);
        $('.down[data-sid="' + id + '"]').attr("disabled", true);
        $('.up[data-sid="' + id + '"]').attr("disabled", false);
    }
}
var defineSug = function (elm) {
    $('#suggestModal').attr("data-vid", $(elm).attr("data-vid"))
    console.log("defineSug");
};
var vote = function (t, v, id) {
    if ($(t).attr('disabled') === 'disabled') {
        return;
    }
    var score = 0;
    //send vote to server with id
    if (v === "up") {
        if ($('.down[data-sid="' + id + '"]').attr('disabled')==='disabled'){
            $('#votedown_'+id).text(parseInt($('#votedown_'+id).text())-1)
            $('#voteup_'+id).text(parseInt($('#voteup_'+id).text())+1)
        }else{
            $('#voteup_'+id).text(parseInt($('#voteup_'+id).text())+1)
        }
        $('.up[data-sid="' + id + '"]').animate({'color': '#FC0', 'font-size': '40px'}, 1000);
        $('.up[data-sid="' + id + '"]').attr('disabled', true);
        $('.down[data-sid="' + id + '"]').attr('disabled', false);
        $('.down[data-sid="' + id + '"]').animate({'color': '#FFF', 'font-size': '12px'}, 1000);

        score = 1;
    } else {
        if ($('.up[data-sid="' + id + '"]').attr('disabled')==='disabled'){
            $('#voteup_'+id).text(parseInt($('#voteup_'+id).text())-1)
            $('#votedown_'+id).text(parseInt($('#votedown_'+id).text())+1)
        }else{
            $('#votedown_'+id).text(parseInt($('#votedown_'+id).text())+1)
        }
        $('.down[data-sid="' + id + '"]').animate({'color': '#FC0', 'font-size': '40px'}, 1000);
        $('.down[data-sid="' + id + '"]').attr('disabled', true);
        $('.up[data-sid="' + id + '"]').attr('disabled', false);
        $('.up[data-sid="' + id + '"]').animate({'color': '#FFF', 'font-size': '12px'}, 1000);

        score = -1;
    }
    var data = {
        "suggestionId": id,
        "spotId": Cookies.get('spot'),
        "userId": Cookies.get('id'),
        "score": score,
        "date": new Date()
    }
    $.ajax({
        url: "/api/users/" + Cookies.get('id') + "/votes",
        type: "POST",
        data: data,
        success: function (data) {
        },
        error: function (err) {
            if (err.status === 422) {
                $.ajax({
                    url: "/api/users/" + Cookies.get('id') + "/votes/" + $(t).data('voteid'),
                    type: "PUT",
                    data: data,
                    success: function (data) {
                        console.log("success voting update");
                    },
                    error: function (err) {
                        console.log("error voting update");
                    }
                })
            }
            console.log("error voting");
        }
    })
};
var voteCurrent = function (v) {
    alert(v);
    //send vote to server with id
    if (v === "up") {
        $('#vu').animate({'color': '#FC0', 'font-size': '40px'}, 1000);
        $('#vd').animate({'color': '#FFF', 'font-size': '12px'}, 1000);
    } else {
        $('#vd').animate({'color': '#FC0', 'font-size': '40px'}, 1000);
        $('#vu').animate({'color': '#FFF', 'font-size': '12px'}, 1000);
    }
};
var timerSearch = 0;
function onLoadFn() {
    // make gapi.client calls
    gapi.client.setApiKey("AIzaSyB-bHFy0ffnjj909Gb96OKISWFu57pkp8g");
    gapi.client.load("youtube", "v3", function () {
        console.log("loaded");
        loginCallback();
        timerSearch = setInterval(loginCallback, 5000);
    })
}
function getSpots(callback) {
//get spot lists
    $.ajax({
        url: "/api/spots",
        type: "GET",
        success: function (data) {
            data.forEach(function (item, index) {
                if (item.name === undefined || item.name === "") {
                    $('#spots').append('<option data-id="' + item.id + '">' + item.id + '</option>');
                    $('#spotsReg').append('<option data-id="' + item.id + '">' + item.id + '</option>');
                } else {
                    $('#spots').append('<option data-id="' + item.id + '">' + item.name + '</option>');
                    $('#spotsReg').append('<option data-id="' + item.id + '">' + item.name + '</option>');
                }

            });
            callback();
        },
        error: function (err) {
            console.log("cannot read spots lists");
            console.log(err)
        }
    });
}
$('document').ready(function () {
    if (Cookies.get("id") === undefined) {
        getSpots(function () {
            $("#myModal").modal();
        })
    } else {
        $('#spotName').text(Cookies.get("spotName"));
        gapi.load("client", onLoadFn);
    }
});

function loginCallback() {
    if (Cookies.get("id") !== undefined) {
        $.ajax({
            url: "/api/users/" + Cookies.get("id") + "/getCurrentSong?spotId=" + Cookies.get("spot"),
            type: "GET",
            success: function (data, textStatus) {
                search(data.song.apiId)
            },
            error: function (err, txtStatus) {
                console.log("fail song search")
                console.log(err)

                if (err.responseJSON.error.error.status !== undefined && err.responseJSON.error.error.status === 998 ||
                    err.responseJSON.error.error.status === 997) {
                    $('#currSong').text("Silence in the spot, no songs yet...");
                }
            }
        })
    } else {
        alert("Please login again");
        clearInterval(timerSearch);
        delCook();
    }
}

var lastSearchResult;
function search(id) {
    var request = gapi.client.youtube.videos.list({
        id: id,
        part: 'snippet'
    });
    request.execute(function (response) {
        var str = JSON.stringify(response.result);
        lastSearchResult = response.result;
        console.log(lastSearchResult);
        $('#currSong').text(lastSearchResult.items[0].snippet.title)
        $('#currSong').attr("data-vid", id)
        $('#currImg').attr('src',lastSearchResult.items[0].snippet.thumbnails.medium.url)


    });
}
function getVideoData(id, callback) {
    var request = gapi.client.youtube.videos.list({
        id: id,
        part: 'snippet'
    });
    request.execute(function (response) {
        var str = JSON.stringify(response.result);
//                console.log(response.result.items[0].snippet)
        callback(response.result.items[0])
        $('#sugLoad').fadeOut();
        $('.sugCtr').fadeIn();
        $('#histLoad').fadeOut();
        $('.histCtr').fadeIn();
        //return response.result.items[0];
    });
}


//login and signup

$("#signup").submit(function (e) {
    e.preventDefault();
});
$("#login").submit(function (e) {
    e.preventDefault();
});
function signup() {
    if ($('#spsw1').val() !== $('#spsw2').val()) {
        alert("passwords must match")
        return;
    }
    if (!validateEmail($('#susrname').val())){
        alert("email is not valid")
        return;
    }

    var data = {
        "email": $('#susrname').val(),
        "password": $('#spsw1').val()
    };
    $.ajax({
        url: "/api/users",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (data, textStatus) {
            console.log("success signup")
            console.log(data);

            $('#spotName').text("Welcome to " + $('#spotsReg').val())
            Cookies.set("spot", $('#spotsReg option:selected').attr('data-id'));
            Cookies.set("spotName", $('#spotsReg').val());
            Cookies.set("id", data.id)
            $('#myModal').modal('hide');
            gapi.load("client", onLoadFn);
        },
        error: function (err, txtStatus) {
            console.log("fail register")
            console.log(err);
            if (err.status === 422) {
                alert("User name already exists in the system");
            }
        }
    })

}
function login() {
    var data = {
        "email": $('#usrname').val(),
        "password": $('#psw').val(),
        "ttl": 1209600000
    };
    $.ajax({
        url: "/api/users/login",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (data, textStatus) {
            console.log("success login")
            console.log(data);
            $('#spotName').text("Welcome to " + $('#spots').val());
            Cookies.set("id", data.userId);
            Cookies.set("spot", $('#spots option:selected').attr('data-id'));
            Cookies.set("spotName", $('#spots').val());
            $('#myModal').modal('hide');
            gapi.load("client", onLoadFn);
        },
        error: function (err, txtStatus) {
            console.log("fail login");
            console.log(err)
            if (err.status === 401) {
                alert("user does not exist or password dont match");
            }

        }
    })
}

var state = "login";

function changeFormState() {
    if (state === "login") {
        $('#login').fadeOut("fast", function () {
            $('#signup').fadeIn("fast");
        });
        $('#stateText').text("Already a member? Sign In");
        $('#modalTitle').text("Sign Up");
        state = "signup"
    } else {
        $('#signup').fadeOut("fast", function () {
            $('#login').fadeIn("fast");
        });
        $('#stateText').text("Not a member? Sign Up");
        $('#modalTitle').text("Login");
        state = "login"
    }
}

//logout
function delCook() {
    Cookies.remove('id');
    Cookies.remove('spot');
    Cookies.remove('spotName');
    $('#currSong').text("");
    $('#currSong').attr("data-vid", "");
    $('#spotName').text("");
    $('#spots').find('option').remove().end();
    $('#spotsReg').find('option').remove().end();
    $('#login').trigger("reset");
    $('#signup').trigger("reset");
    clearInterval(timerSearch);
    getSpots(function () {
        $("#myModal").modal();
    })
}


//utils
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}