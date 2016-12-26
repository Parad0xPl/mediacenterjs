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

var routing = {};
routing.get = {}; // Init of get routes
routing.get['/'] = function(req, res){
  res.render('plugins',{
		selectedTheme: config.theme
	});
};

exports.routing = routing;
