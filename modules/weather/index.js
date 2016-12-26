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
var fs = require('fs-extra'),
    ini = require('ini'),
    // http = require('http'),
    config = ini.parse(fs.readFileSync('./configuration/config.ini', 'utf-8'));


var routing = {};
routing.get = {}; // Init of get routes
routing.get['/'] = function (req, res) {
  res.render('weather',{
		userLanguage: config.language,
		userLocation: config.location,
		selectedTheme: config.theme
	});
};

routing.post = {};


exports.routing = routing;
