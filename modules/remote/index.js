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
var //express = require('express'),
    // app = express(),
    fs = require('fs-extra'),
    ini = require('ini'),
    // os = require('os'),
    config = ini.parse(fs.readFileSync('./configuration/config.ini', 'utf-8')),
    DeviceInfo = require('../../lib/utils/device-utils');

var routing = {};
routing.get = {}; // Init of get routes
routing.get['/'] = function(req, res/*, next*/){

  DeviceInfo.storeDeviceInfo(req);

  var allThemes = [],
    availableLanguages = [],
    availablethemes = fs.readdirSync('./public/themes/'),
    availableTranslations = fs.readdirSync('./public/translations/');

  availablethemes.forEach(function(file){
    allThemes.push(file);
  });

  availableTranslations.forEach(function(file){
    if (file.match('translation')){
      var languageCode = file.replace(/translation_|.json/g,"");
      availableLanguages.push(languageCode);
    }
  });

  var availableScreensavers = ['dim','backdrop','off'];

  Device.findAll()
  .then(function(devices) {
    DeviceInfo.isDeviceAllowed(req, function(allowed){
      res.render('remote',{
        movielocation: config.moviepath,
        selectedTheme: config.theme,
        musiclocation : config.musicpath,
        tvlocation : config.tvpath,
        selectedBinaryType : config.binaries,
        language: config.language,
        availableLanguages: availableLanguages,
        availableScreensavers: availableScreensavers,
        location: config.location,
        screensaver: config.screensaver,
        spotifyUser: config.spotifyUser,
        spotifyPass: config.spotifyPass,
        themes:allThemes,
        devices:devices,
        allowed: allowed,
        port: config.port,
        oauth: config.oauth,
        oauthKey: config.oauthKey
      });
    });
  });
};


routing.post = {};


exports.routing = routing;
