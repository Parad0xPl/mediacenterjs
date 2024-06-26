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
    DeviceInfo = require('../../lib/utils/device-utils'),
    config = ini.parse(fs.readFileSync('./configuration/config.ini', 'utf-8'));

const getDevices = function (req, res) {
    Device.findAll()
     .then(function (devices) {
        res.json(devices);
     });
};

function loadCustomSettings(callback){
    var path = require('path');
    var appDir = path.dirname(require.main.filename);
    //search node_modules for plugins
    var nodeModules = appDir + '/node_modules';
    var pluginPrefix = config.pluginPrefix;

    var plugSettings = [];
    fs.readdirSync(nodeModules).forEach(function(name){
        //Check if the folder in the node_modules starts with the prefix
        if(name.substr(0, pluginPrefix.length) !== pluginPrefix){
            return;
        } else {
            var pluginPath = nodeModules + '/' + name;
            var pluginSettingsJSON = pluginPath + '/settings.json';
            if(fs.existsSync( pluginSettingsJSON)){
                var parsedJSON = require(pluginSettingsJSON);
                plugSettings.push(parsedJSON);
            }
        }
    });
    callback(plugSettings);
}

const getData = function (req, res) {
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

    var availableScreensavers = [
      'dim',
      'backdrop',
      'off'
    ];

    var availableQuality = [
      'lossless',
      'high',
      'medium',
      'low'
    ];

    loadCustomSettings(function(pluginSettings){
      res.json({
        availableLanguages : availableLanguages,
        availableQuality : availableQuality,
        availableScreensavers : availableScreensavers,
        themes : availablethemes,
        config : config,
        pluginSettings  : pluginSettings,
        countries : require('../../lib/utils/countries').countries
      });
    });
};

var routing = {};
routing.get = {}; // Init of get routes
routing.get['/'] = function (req, res) {

  DeviceInfo.storeDeviceInfo(req);

  Device.findAll()
  .then(function () {
    DeviceInfo.isDeviceAllowed(req, function (allowed) {
      res.render('settings', {
        title: 'Settings',
        selectedTheme: config.theme,
        allowed: allowed
      });
    });
  });

};
routing.get['/getToken/'] = function (req, res) {
  var token = config.oauth;
  if(!token) {
    res.json({message: 'No token'}, 500);
  }
  res.json({token: token});
};
routing.get['/load/'] = function (req, res) {
  getData(req, res);
};
routing.get['/devices/'] = function (req, res) {
  getDevices(req, res);
};

routing.post = {};


exports.routing = routing;
