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

const express = require('express'),
      fs = require('fs-extra'),
      path = require('path'),
      jade = require('jade'), // jshint ignore:line
      static = require('serve-static'),
      logger = require('winston'),
      modulePath = './modules';
const loadModules = function (){
  var modules = [];
  if(!fs.existsSync(modulePath)){
    logger.log('error', 'No modules directory!');
    process.exit(0);
  }
  fs.readdirSync(modulePath).forEach(function(name){
    if(name.charAt(0) === '.'){
      return;
    }
    if(name === "remote"){
      modules.splice(0,0,path.resolve(modulePath, name));
      return;
    }
    modules.push(path.resolve(modulePath, name));
  });
  return modules;
};

var modules = [];
const initModule = function(modulePath, parent){// jshint ignore:line

  // Search for main package.json
  var modulePackage = path.resolve(modulePath, 'package.json'),
      mcmodule = {};
  mcmodule.path = modulePath;
  if(fs.existsSync(modulePackage)){
    modulePackage = fs.readJsonSync(modulePackage);
  }else{
    logger.log('warn', 'No module package.json, module %s not loaded', modulePath);
    return -1;
  }

  // Loading base data
  if(modulePackage.mcmodule_name !== undefined){
    mcmodule.name = modulePackage.mcmodule_name;
  }else{
    logger.log('warn', 'No module name, module %s not loaded', modulePath);
    return -1;
  }
  if(!fs.existsSync( path.resolve(mcmodule.path, 'index.js'))){
    logger.log('warn', 'No module script, module %s not loaded', mcmodule.name);
    return -1;
  }
  mcmodule.mainscript = require(path.resolve(mcmodule.path, 'index.js'));
  mcmodule.url = modulePackage.mcmodule_url || mcmodule.name;
  mcmodule.viewsdir = modulePackage.mcmodule_viewsdir || "views";
  mcmodule.staticdir = modulePackage.mcmodule_staticdir || "static";

  // Search for tile image
  const tileImgSVGPath = path.resolve(mcmodule.path, mcmodule.staticdir, 'tile.svg');
  const tileImgPNGPath = path.resolve(mcmodule.path, mcmodule.staticdir, 'tile.png');
  if(modulePackage.tileimgUrl !== undefined &&
  fs.existsSync(path.resolve(mcmodule.path, mcmodule.staticdir, modulePackage.tileimgUrl))){
    mcmodule.tileImgUrl = mcmodule.url + '/' + modulePackage.tileimgUrl;
  }else if(fs.existsSync(tileImgSVGPath)){
    mcmodule.tileImgUrl = mcmodule.url + '/' + 'tile.svg';
  }else if(fs.existsSync(tileImgPNGPath)){
    mcmodule.tileImgUrl = mcmodule.url + '/' + 'tile.png';
  }else{
    mcmodule.tileImgUrl = "";
  }

  const tileImgCSSPath = path.resolve(mcmodule.path, mcmodule.staticdir, 'tile.css');
  if(modulePackage.tileCSSUrl !== undefined &&
  fs.existsSync(path.resolve(mcmodule.path, mcmodule.staticdir, modulePackage.tileCSSUrl))){
    mcmodule.tileCSSUrl = mcmodule.url + '/' + modulePackage.tileCSSUrl;
    mcmodule.tileCSSPath = modulePackage.tileCSSUrl;
  }else if(fs.existsSync(tileImgCSSPath)){
    mcmodule.tileCSSUrl = mcmodule.url + '/' + 'tile.css';
    mcmodule.tileCSSPath = 'tile.css';
  }else{
    mcmodule.tileCSSUrl = "";
    mcmodule.tileCSSPath = "";
  }
  mcmodule.tileCSS = "";
  if(mcmodule.tileCSSUrl &&
  fs.existsSync(path.resolve(mcmodule.path, mcmodule.staticdir, mcmodule.tileCSSPath))){
    mcmodule.tileCSS = path.resolve(mcmodule.path, mcmodule.staticdir, mcmodule.tileCSSPath);
    mcmodule.tileCSS = fs.readFileSync(mcmodule.tileCSS, "utf8");
  }

  // Create express instance and binding routes
  mcmodule.app = express();
  mcmodule.app.locals.basedir = parent.locals.basedir;
  mcmodule.app.set(`view engine`, "jade");
  mcmodule.app.set(`views`, path.resolve(modulePath, mcmodule.viewsdir) );
  // mcmodule.app.use(`/public/${mcmodule.url}/*`,static(path.resolve(modulePath, mcmodule.staticdir)));
  var method;
  for(method in mcmodule.mainscript.routing){
    if(!mcmodule.mainscript.routing.hasOwnProperty(method)){
      continue;
    }
    var url;
    for(url in mcmodule.mainscript.routing[method]){
      if(mcmodule.mainscript.routing[method].hasOwnProperty(url)){
        mcmodule.app[method](`/${mcmodule.url}`+url, mcmodule.mainscript.routing[method][url]);
      }
    }
  }

  // Write file for static
  mcmodule.statics = {};
  fs.walkSync(path.resolve(mcmodule.path, mcmodule.staticdir)).forEach(function (file) {
    file = file.replace(/\\/g, "/");
    mcmodule.statics[file.slice(path.resolve(mcmodule.path, mcmodule.staticdir).length)] = file;
  });
  mcmodule.app.use(`/${mcmodule.url}`, require("./module-statics")(mcmodule.url, mcmodule.statics));

  // Push data to core
  modules.push(mcmodule);
  parent.use(mcmodule.app);
};

const getApps = function () {
  var apps = [];
  modules.forEach(function(app){
    if(app.tileImgUrl){
      apps.push({
        appLink: app.url,
        appName: app.name,
        tileLink: app.tileImgUrl,
        tileCSS: app.tileCSS
      });
    }
  });
  apps.push({
    appLink: "remote",
    appName: "remote",
    tileLink: '',
    tileCSS: fs.readFileSync("./modules/remote/static/tile.css", "utf8")
  });
  return apps;
};

exports.getApps = getApps;
exports.loadModules = loadModules;
exports.initModule = initModule;
exports.loads = (app) => {
  loadModules().forEach(function (name) {
    initModule(name, app);
  });
};
