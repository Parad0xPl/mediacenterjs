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
'use strict';

function playEpisode(episode, $http, scope){
    var platform = 'desktop';
    if (navigator.userAgent.match(/Android/i)) {
        platform = 'android';
    } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        platform = 'ios';
    }


    $http.get('/tv/'+episode.id+'/play/'+platform).then(function(response) {

        //Get url+port
        // var url = window.location.href;
        // var arr = url.split("/");
        // var result = arr[0] + "//" + arr[2];
        var data = response.data;
        var fileName                =  data.fileName,
            outputFile            =   fileName.replace(/ /g, "-"),
            extentionlessFile     =   outputFile.replace(/\.[^/.]+$/, ""),
            videoUrl              =   data.outputPath,
            subtitleUrl           =   "/data/tv/"+extentionlessFile+".srt",
            playerID              =   'player',
            homeURL               =   '/tv/',
            type                  =   'tv';

        videoJSHandler(playerID, data, episode.id, videoUrl, subtitleUrl, fileName, homeURL, 5000, type, scope);

    }, function () {
        sweetAlert({title : "",
                    text : "The episode " +  episode.title + " could not be found",
                    type : "error",
                    allowOutsideClick : true});
        scope.playing = false;
    });
}

var tvApp = angular.module('tvApp', ['ui.bootstrap']);
tvApp.controller('tvCtrl', function($scope, $http, $modal,player){
    $scope.player = player;
    $scope.focused = null;
    $scope.serverMessage = 0;
    $scope.serverStatus= '';
    $scope.playing = false;
    $http.get('/tv/load').then(function(response) {
        $scope.tvshows = response.data;
    });

    $scope.playEpisode = function(episode){
        $scope.playing = true;
        playEpisode(episode, $http, $scope);
    };

    $scope.changeSelected = function(tvshow){
        $scope.focused = $scope.tvshows.indexOf(tvshow);
    };

    $scope.hideSelected = function(){
        $scope.focused = null;
    };

    $scope.open = function (tvshow) {
        var modalInstance = $modal.open({ // jshint ignore:line
            templateUrl: 'editModal.html',
            controller: ModalInstanceCtrl,
            size: 'md',
            windowClass: "flexible",
            resolve: {
                current: function () {
                    return tvshow;
                }
            }
        });
    };

    var ModalInstanceCtrl = function ($scope, $modalInstance, current) { // jshint ignore:line
        $scope.edit ={};
        $scope.current = current;

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.editItem = function(){ // jshint ignore:line

            if($scope.edit.name === '' || $scope.edit.name === null || $scope.edit.name === undefined ){
                if($scope.current.name  !== undefined || $scope.current.name !== null){
                    $scope.edit.name = $scope.current.name;
                } else {
                    $scope.edit.name = '';
                }
            }

            if($scope.edit.posterURL === '' || $scope.edit.posterURL === null || $scope.edit.posterURL === undefined ){
                if($scope.current.posterURL  !== undefined || $scope.current.posterURL !== null){
                    $scope.edit.posterURL = $scope.current.posterURL;
                } else {
                    $scope.edit.posterURL = '/tv/css/img/nodata.jpg';
                }
            }

            $http({
                method: "post",
                data: {
                    id              : $scope.current.id,
                    name            : $scope.edit.name,
                    posterURL       : $scope.edit.posterURL
                },
                url: "/tv/edit"
            }).then(function() {
                location.reload();
            });
        };
    };

    // var setupSocket = {
    //     async: function() {
    //         var promise = $http.get('/configuration/').then(function (response) {
    //             var configData  = response.data;
    //             var socket      = io.connect();
    //             socket.on('connect', function(data){
    //                 socket.emit('screen');
    //             });
    //             return {
    //                 on: function (eventName, callback) {
    //                     socket.on(eventName, function () {
    //                         var args = arguments;
    //                         $scope.$apply(function () {
    //                             callback.apply(socket, args);
    //                         });
    //                     });
    //
    //                 },
    //                 emit: function (eventName, data, callback) {
    //                     socket.emit(eventName, data, function () {
    //                         var args = arguments;
    //                         $scope.$apply(function () {
    //                             if (callback) {
    //                                 callback.apply(socket, args);
    //                             }
    //                         });
    //                     });
    //                 }
    //             };
    //             return data;
    //         });
    //         return promise;
    //     }
    // };
    //
    //
    // setupSocket.async().then(function(data) {
    //     if (typeof data.on !== "undefined") {
    //         $scope.remote       = remote(data, $scope, player);
    //         $scope.keyevents    = keyevents(data, $scope, player);
    //     }
    // });


});


tvApp.factory('player', function() {
        var player,
            playlist = [],
            current = {
                tvshow: 0,
                episode: 0
            };

        player = {
            playlist: playlist,
            current: current,
            play: function(episode, tvshow) {
                if (!playlist.length) {
                  return;
                }

                if (angular.isDefined(episode)) {
                  current.episode = episode;
                }
                if (angular.isDefined(tvshow)) {
                  current.tvshow = tvshow;
                }
            },
            reset: function() {
                current.tvshow = 0;
                current.episode = 0;
            },
            next: function() {
                if (!playlist.length) {
                  return;
                }
                if (playlist[current.tvshow].Episodes.length > (current.episode + 1)) {
                    current.episode++;
                } else {
                    current.episode = 0;
                    current.tvshow = (current.tvshow + 1) % playlist.length;
                }
            },
            previous: function() {
                if (!playlist.length) {
                  return;
                }
                if (current.episode > 0) {
                    current.episode--;
                } else {
                    current.tvshow= (current.tvshow - 1 + playlist.length) % playlist.length;
                    current.episode = playlist[current.tvshow].tepisode.length - 1;
                }
            }
        };

        playlist.add = function(tvshow) {
            if (playlist.length > 0){
                playlist.splice(0, playlist.length);
            }
            if (playlist.indexOf(tvshow) !== -1) {
              return;
            }
            playlist.push(tvshow);
        };

        playlist.remove = function(tvshow) {
            var index = playlist.indexOf(tvshow);
            if (index === current.tvshow) {
              player.reset();
            }
            playlist.splice(index, 1);
        };

        return player;
});
