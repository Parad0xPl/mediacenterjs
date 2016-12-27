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
    // var transformed = [];
    // console.log(results);
    // results.forEach(function (element) {
    //   element = element.dataValues;
    //   var obj = {}, x;
    //   for(x in element){
    //     if(typeof element[x] !== undefined){
    //       obj[x.toLocaleLowerCase()] = element[x];
    //     }
    //   }
    //   transformed.push(obj);
    // });
    // results = transformed;
    if (results) {
      return res.json(results);
    }

    return res.status(200).send();
  };
}
var MusicHandler = new MediaHandler('Album', 'Track', require('./metadata-processor'), 'musicpath');


var routing = {};
routing.get = {}; // Init of get routes
routing.get['/'] = function(req, res){
  deviceInfo.isDeviceAllowed(req, function(allowed){
    res.render('music', {
      title: 'Music',
      selectedTheme: config.theme,
      allowed: allowed
    });
  }
);};
routing.get['/load/'] = function(req, res){
  MusicHandler.load({include: [Artist, Track]}, handleCallback(res));
};
routing.get['/:id/play/:action?'] = function (req, res){
  var infoRequest = req.params.id,
      platform = req.params.action;
  MusicHandler.playFile(res, platform, infoRequest);
};

routing.post = {};
routing.post['/edit/'] = function (req, res) {
  MusicHandler.editMetadata(req.body.id, req.body, handleCallback(res));
};

exports.routing = routing;
