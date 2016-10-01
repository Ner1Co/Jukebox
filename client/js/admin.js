

//youtube player
var stopPlayTimer;
var url = "";
var sugId = "";
var sentReqForNewSong = false;
// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '352',
        width: '640',
        videoId: '',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
//                event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
//                var done = false;
function onPlayerStateChange(event) {
    clearTimeout(stopPlayTimer);
    if (event.data == YT.PlayerState.PLAYING /*&& !sentReqForNewSong*/) {
        console.log(player.getDuration() - player.getCurrentTime());
        elapsedTime = player.getCurrentTime();
        vDuration = player.getDuration();
        stopPlayTimer = setTimeout(getNewVideo, (vDuration - elapsedTime - 10) * 1000);
        sentReqForNewSong = true;
    }
    if (event.data == YT.PlayerState.ENDED) {

        player.cueVideoById(url);
        player.playVideo();
        playSongToServer();
        sentReqForNewSong = false;
    }
}
function playSongToServer() {
    pData = {
        "id": sugId,
        "playDate":new Date(),
        "played":true
    };
    $.ajax({
        url: "/api/suggestions",
        type: "PUT",
        data: pData,
        success: function (data) {
            console.log("success playing new song to server")
            console.log(data)
        },
        error: function (err) {
            console.log("failed playing new song to serva")
            console.log(err)
        }
    });
}
function getNewVideo(callback) {
    console.log("new video request at: " + player.getCurrentTime());
    //generate request to server to get new song id
    $.ajax({
        url: "/api/users/" + userId + "/getNextSong?spotId=" + spotId,
        type: "GET",
        success: function (sData) {
            console.log("success next video");
            console.log(sData);
            url = sData.song.apiId;
            sugId = sData.id;
            if (callback !== undefined) {
                callback()
            }
        },
        error: function (err) {
            console.log("fail getting next video");
            console.log(err);
            setTimeout(function(){ getNewVideo(callback); }, 3000);
        }
    });

}
function stopVideo() {
    player.stopVideo();
}


//login and signup
$('document').ready(function () {
    $("#myModal").modal();
});


var state = "login";
var spotId = "";
var userId = "";
function changeFormState() {
    if (state === "login") {
        $('#login').fadeOut("fast", function () {
            $('#signup').fadeIn("fast");
        });
        $('#stateText').text("Already created a Spot? Sign In");
        $('#modalTitle').text("");
        $('#modalTitle').append("<span class='glyphicon glyphicon-pushpin'></span> Create a new spot");
        state = "signup"
    } else {
        $('#signup').fadeOut("fast", function () {
            $('#login').fadeIn("fast");
        });
        $('#stateText').text("Don't have a spot? Sign Up");
        $('#modalTitle').text("");
        $('#modalTitle').append("<span class='glyphicon glyphicon-lock'></span> Spot Login");


        state = "login"
    }
}
$("#signup").submit(function (e) {
    e.preventDefault();
});
$("#login").submit(function (e) {
    e.preventDefault();
});
function signup() {
    if ($('#spsw1').val() !== $('#spsw2').val()) {
        alert("passwords must match")
    } else {
        var sdata = {
            "name": $('#spotName').val()
        };
        $.ajax({
            url: "/api/spots",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(sdata),
            success: function (spotData, textStatus) {
                console.log("success spot creation")
                console.log(spotData);
                spotId = spotData.id;
                var data = {
                    "email": $('#susrname').val(),
                    "password": $('#spsw1').val(),
                    "admin": spotData.id
                };
                $.ajax({
                    url: "/api/users",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(data),
                    success: function (userData, textStatus) {
                        console.log("success user with spot creation")
                        console.log(userData);
                        $('#spotNameTitl' +
                            'e').text("Welcome to " + sdata.name);
                        userId = userData.userId;
                        getNewVideo(function () {
                            player.cueVideoById(url);
                            player.playVideo();
                            playSongToServer()
                        });
                        $('#myModal').modal('hide');
                    },
                    error: function (err, txtStatus) {
                        console.log("fail creation of user with spot");
                        console.log(err)
                    }
                });
            },
            error: function (err, txtStatus) {
                console.log("fail creation of spot")
                console.log(err)
            }
        })
    }
}
function login() {
    var data = {
        "email": $('#usrname').val(),
        "password": $('#psw').val(),
        "ttl": 1209600000
    };
    $.ajax({
        url: "/api/users/login?include=user",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (userData, textStatus) {
            console.log("success login");
            console.log(userData);
            userId = userData.userId;
            if (userData.user.admin === undefined || userData.user.admin === "") {
                alert("no spot found for this user, please register a new spot user or login with a valid user");
            } else {
                $.ajax({
                    url: "/api/spots/" + userData.user.admin,
                    type: "GET",
                    success: function (sData) {
                        console.log("success getting spot data of user");
                        $('#spotNameTitle').text("Welcome to " + sData.name);
                        spotId = sData.id;

                        getNewVideo(function () {
                            player.cueVideoById(url);
                            player.playVideo();
                            playSongToServer()
                        });

                        $('#myModal').modal('hide');
                    },
                    error: function (err) {
                        console.log("fail getting spot data");
                        console.log(err);
                    }
                });
            }
        },
        error: function (err, txtStatus) {
            console.log("fail login");
            console.log(err);
        }
    })
}
