/*
    MediaCenterJS - A NodeJS based mediacenter solution

    Copyright (C) 2014 - Jan Smolders

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/**

    Generic plain javascript VideoJS handler with events specifically for the way MCJS handles video playback and saving playback state.

    @param playerID     ID of video element in DOM
    @param data         Callback from ajaxcall to get video specifications (eg. a JSON with title, duration and subtitle)
    @param videoUrl     URL of transcoded file
    @param subtitleUrl  URL of copied subtitle
    @param title        Filename of video
    @param homeURL      Redirect url
    @param timeout      Timeout before starting playback

 **/

 function _setDuration(player, data){
     var videoDuration = player.duration(data.duration); // jshint ignore:line
     player.bufferedPercent(0);
 }

 function postAjaxCall(url, params){
     var xmlhttp;
     xmlhttp = new XMLHttpRequest();
     xmlhttp.open("POST", url, true);
     xmlhttp.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
     xmlhttp.send(JSON.stringify(params));
 }

var globalplayer = null, closeButton = null;
function videoJSHandler(playerID, data, mediaID, videoUrl, subtitleUrl, title, homeURL, timeout, type, scope){ // jshint ignore:line
    var player          = videojs(playerID);
    globalplayer = player;
    var actualDuration  = data.duration;
    if(!closeButton){
      closeButton = player.addChild("closeButton");
      console.log(closeButton);
      closeButton.el_.onclick = function () {
        player.pause();
        scope.playing = false;
        scope.$apply();
        player.currentTime(0);
      };
    }
    player.ready(function() {
      console.log("Player readyplayer");
        // setTimeout(function(){
            player.src({
                type    : "video/mp4",
                src     : videoUrl
            });

            if(data.subtitle === true){
                var track   = document.createElement("track");
                track.src   = subtitleUrl;
                track.label = 'Subtitle';
                document.getElementById(playerID).appendChild(track);
            }

            if(data.duration - 5*60 > data.progression){
              console.log("progress");
            }else{
              console.log("Reset");
              data.progression = 0;
            }


            var setProgression  = parseFloat(data.progression);
            console.log(data.duration - 3*60, data.progression, data.duration - 3*60 > data.progression);

            player.currentTime(setProgression);
            player.volume(0.4);
            player.play();

            _setDuration(player, data);
            // _pageVisibility(player);
        // },timeout);

    });

    var currentTime = parseFloat(data.progression);
    player.on('error', function(e){
        console.log('Error', e);
    });

    player.on('timeupdate', function(){
        _setDuration(player, data);
    });

    player.on('progress', function(){
        _setDuration(player, data);
    });

    player.on('pause', function(){
        currentTime = player.currentTime();

        if(mediaID !== undefined && currentTime !== undefined ){
           var progressionData = {
                id         : mediaID,
                'progression'   : currentTime
            };
            postAjaxCall('/'+type+'/progress', progressionData);
        }

    });

    player.on('loadeddata', function(){
        _setDuration(player, data);
        if(currentTime > 0){
            player.currentTime(currentTime);
        }
    });

    player.on('loadedmetadata', function(){
        if(currentTime > 0){
            player.currentTime(currentTime);
        }
    });

    player.on('ended', function(){
        currentTime = player.currentTime();
        if( currentTime < actualDuration){
            player.load();
            player.play();
        } else {
            // player.dispose();
            // window.location.replace(homeURL);
            scope.playing = false;
            scope.$apply();
            player.currentTime(0);
        }
    });
}
