/*
    MediaCenterJS - A NodeJS based mediacenter solution

    Copyright (C) 2013 - Jan Smolders

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

var config = require('../../lib/handlers/configuration-handler').getConfiguration(),
    deviceInfo = require('../../lib/utils/device-utils'),
    MediaHandler = require('../../lib/media-handler'),
    logger = require('winston');

function handleCallback(res) {
  return function (err, results) {
    if (err) {
      logger.error(err);
      return res.status(500).send();
    }

    if (results) {
      return res.json(results);
    }

    return res.status(200).send();
  };
}
var MovieHandler = new MediaHandler('Movie', 'Movie', require('./metadata-processor'), 'moviepath');


var routing = {};
routing.get = {}; // Init of get routes
routing.get['/'] = function(req, res){
  deviceInfo.isDeviceAllowed(req, function(allowed){
    res.render('movies', {
      title: 'Movies',
      selectedTheme: config.theme,
      allowed: allowed
    });
  }
);};
routing.get['/load/'] = function(req, res){
  MovieHandler.load({}, handleCallback(res));
};
routing.get['/play/:id/:action?'] = function (req, res){
  var infoRequest = req.params.id,
      platform = req.params.action;
  MovieHandler.playFile(res, platform, infoRequest);
};
routing.get['/stop/'] = function (req, res){
  MovieHandler.stopTranscoding(handleCallback(res));
};

routing.post = {};
routing.post['/progress/'] = function (req, res) {
  var data = req.body;
  MovieHandler.savePlaybackProgress(data.id, data.progression, handleCallback(res));
};
routing.post['/edit/'] = function (req, res) {
  var data = req.body;
  MovieHandler.editMetadata(data.id, data, handleCallback(res));
};
routing.post['/update/'] = function (req, res) {
  var data = req.body;
  MovieHandler.updateMetadata(data.id, data, handleCallback(res));
};

exports.routing = routing;
