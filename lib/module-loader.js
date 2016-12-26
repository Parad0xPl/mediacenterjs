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
  var modulePackage = path.resolve(modulePath, 'package.json'),
      mcmodule = {};
  if(fs.existsSync(modulePackage)){
    modulePackage = fs.readJsonSync(modulePackage);
  }else{
    logger.log('warn', 'No module package.json, module %s not loaded', modulePath);
    return -1;
  }
  if(modulePackage.mcmodule_name !== undefined){
    mcmodule.name = modulePackage.mcmodule_name;
  }else{
    logger.log('warn', 'No module name, module %s not loaded', modulePath);
    return -1;
  }
  if(!fs.existsSync( path.resolve(modulePath, 'index.js'))){
    logger.log('warn', 'No module script, module %s not loaded', mcmodule.name);
    return -1;
  }
  mcmodule.mainscript = require(path.resolve(modulePath, 'index.js'));
  mcmodule.url = modulePackage.mcmodule_url || mcmodule.name;
  mcmodule.viewsdir = modulePackage.mcmodule_viewsdir || "views";
  mcmodule.staticdir = modulePackage.mcmodule_staticdir || "static";
  mcmodule.app = express();
  mcmodule.app.locals.basedir = parent.locals.basedir;
  mcmodule.app.set(`view engine`, "jade");
  mcmodule.app.set(`views`, path.resolve(modulePath, mcmodule.viewsdir) );
  mcmodule.app.use(`/public/${mcmodule.url}/*`,static(path.resolve(modulePath, mcmodule.staticdir)));
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
  modules.push(mcmodule);
  parent.use(mcmodule.app);
};

exports.loadModules = loadModules;
exports.initModule = initModule;
exports.loads = (app) => {
  loadModules().forEach(function (name) {
    initModule(name, app);
  });
};
