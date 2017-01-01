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
    fs = require('fs-extra'),
    path = require('path'),
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
var TvShowHandler = new MediaHandler('Show', 'Episode', require('./metadata-processor'), 'tvpath');


var routing = {};
routing.get = {}; // Init of get routes
routing.get['/'] = function(req, res){
  deviceInfo.isDeviceAllowed(req, function(allowed){
    res.render('tvshows', {
      title: 'tvshows',
      selectedTheme: config.theme,
      allowed: allowed
    });
  }
);};
routing.get['/load/'] = function(req, res){
  TvShowHandler.load({include: [Episode]}, handleCallback(res)); // jshint ignore:line
};
routing.get['/:id/play/:action?'] = function (req, res){
  var infoRequest = req.params.id,
      platform = req.params.action;
  TvShowHandler.playFile(res, platform, infoRequest);
};
routing.get['/stop/'] = function (req, res){
  TvShowHandler.stopTranscoding(handleCallback(res));
};
routing.get['/data/*'] = function (req, res){
  var file = path.resolve(config.tvpath,req.params[0]);
  var range = req.headers.range;
  if (!range) {
   // 416 Wrong range
   return res.send(`<video src="http://localhost:3000/tv/data/${req.params[0]}" controls></video>`);
  }
  fs.stat(file, function(err, stats) {
    if (err) {
      if (err.code === 'ENOENT') {
        // 404 Error if file not found
        return res.sendStatus(404);
      }
      res.end(err);
    }
    if(!stats.isFile()){
      return res.sendStatus(404);
    }

    var positions = range.replace(/bytes=/, "").split("-");
    var start = parseInt(positions[0], 10);
    var total = stats.size;
    var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    var chunksize = (end - start) + 1;
    res.status(206).set({
      "Content-Range": "bytes " + start + "-" + end + "/" + total,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4"
    });

    var stream = fs.createReadStream(file, { start: start, end: end }).pipe(res);
  });
};

routing.post = {};
routing.post['/progress/'] = function (req, res) {
  var data = req.body;
  TvShowHandler.savePlaybackProgress(data.id, data.progression, handleCallback(res));
};
routing.post['/edit/'] = function (req, res) {
  var data = req.body;
  TvShowHandler.editMetadata(data.id, data, handleCallback(res));
};

exports.routing = routing;
