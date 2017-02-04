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

 ////////////////\\\\\\\\\\\\\\\

 File based on Spludo Framework. Copyright (c) 2009-2010 DracoBlue, http://dracoblue.net/
 Licensed under the terms of MIT License.

 */
var server,
    logger = require('winston'),
    path = require('path'),
    appDir = path.dirname(require.main.filename),
    child_process = require('child_process'),
    fs = require("fs-extra");

function cleanUp(output, dir) {
    logger.info('Cleanup...');
    var rimraf = require('rimraf');
    rimraf(dir, function (e) {
        if(e) {
            logger.error('Error cleaning temp update folder', e);
        }
    });

    logger.info('Install dependencies...');
    var exec = require('child_process').exec,
        child = exec('npm install', { maxBuffer: 9000*1024 }, function(err) {
            if (err) {
                logger.error('Metadata fetcher error: ',err) ;
            }
        });

    child.stdout.on('data', function(data) {
        logger.info(data.toString());
    });
    child.stderr.on('data', function(data) {
        logger.info(data.toString());
    });

    child.on('exit', function() {
        if(fs.existsSync(output) === true){
            fs.unlinkSync(output);
            server.update = false;
            server.start();
        }
    });
}


function installUpdate(output, dir){
    logger.info('Installing update...');
    fs.copy('./install/mediacenterjs-master', './', function (err) {
        if (err) {
            logger.error('Error', err);
        } else {
            cleanUp(output, dir);
        }
    });
}

server = {
   process: null,
   files: [],
   restarting: false,
   update:false,

   "restart": function() {
       this.restarting = true;
       logger.info('Stopping server for restart');
       this.process.kill();
   },
   "start": function() {
       var that = this;
       if(that.update === true){
           var output = './master.zip';
           var dir = './install';
           that.update = false;
           setTimeout(function(){
               installUpdate(output, dir);
           },2000);
       } else {
           logger.info('Starting server');
           that.watchFile();

           this.process = child_process.spawn(process.argv[0], ['index.js']);

           this.process.stdout.addListener('data', function (data) {
               process.stdout.write(data);
           });

           this.process.stderr.addListener('data', function (data) {
               console.log(data.toString());
           });

           this.process.addListener('exit', function () {
               this.process = null;
               if (that.restarting) {
                   that.restarting = true;
                   that.start();
               }
           });
       }
   },
   "watchFile": function() {
       // var that = this;
       // fs.watchFile('./configuration/config.ini', {interval : 500}, function(curr, prev) {
       //     if (curr.mtime.valueOf() != prev.mtime.valueOf() || curr.ctime.valueOf() != prev.ctime.valueOf()) {
       //         logger.info('Restarting because of changed file');
       //         // give browser time to load finish page
       //         setTimeout(function(){
       //             server.restart();
       //         },2000);
       //     }
       // });
       // fs.watchFile('./configuration/update.js', {interval : 500}, function(curr, prev) {
       //     if (curr.mtime.valueOf() != prev.mtime.valueOf() || curr.ctime.valueOf() != prev.ctime.valueOf()) {
       //         logger.info('Restarting because an update is available' );
       //         that.update = true;
       //         server.restart();
       //     }
       // });
   }
};

if(fs.existsSync(appDir + "/log/") === false){
    fs.mkdirSync(appDir + "/log/");
    fs.openSync(appDir + "/log/server.log", 'w');
    fs.chmodSync(appDir + "/log/server.log", 755);
}

logger.remove(logger.transports.Console);
logger.add(logger.transports.File, { filename:appDir + "/log/server.log" });
logger.add(logger.transports.Console, { level: 'debug', colorize:true });

server.start();
