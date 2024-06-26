/*
	MediaCenterJS - A NodeJS based mediacenter solution

    Copyright (C) 2014 - Jan Smolders

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

var dbSchema = require('./database-schema');
var Device = dbSchema.Device;

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

}


function getPlatform(req) { // jshint ignore:line
    var userAgent = req.headers['user-agent'];
    var userPlatform;
    if(userAgent.toLowerCase().indexOf("windows") > -1){
        userPlatform = 'windows';
    } else if(userAgent.toLowerCase().indexOf("android") > -1){
        userPlatform = 'android';
    } else if(userAgent.toLowerCase().indexOf("ipad") > -1){
        userPlatform = 'ipad';
    } else if(userAgent.toLowerCase().indexOf("iphone") > -1){
        userPlatform = 'iphone';
    } else if(userAgent.toLowerCase().indexOf("macintosh") > -1){
        userPlatform = 'macintosh';
    } else if(userAgent.toLowerCase().indexOf("ipod") > -1){
       userPlatform = 'ipod';
    }else if(userAgent.toLowerCase().indexOf("fedora") > -1){
        userPlatform = 'fedora';
    } else if(userAgent.toLowerCase().indexOf("ubuntu") > -1){
        userPlatform = 'ubuntu';
    } else if(userAgent.toLowerCase().indexOf("debian") > -1){
        userPlatform = 'debian';
    }

    return userPlatform;
}

function getLocalIp(req) {
    var ipAddress;
    var forwardedIpsStr = req.header('x-forwarded-for');
    if (forwardedIpsStr) {
        var forwardedIps = forwardedIpsStr.split(',');
        ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
        ipAddress = req.connection.remoteAddress;
    }

    return ipAddress;
}

exports.storeDeviceInfo = function(req) {

    var deviceLocalIp  = getLocalIp(req);
    var devicePlatform = getPlatform(req);
    var deviceID       = devicePlatform+'_'+deviceLocalIp;
    var currentDate    = getDateTime();

    Device.findOrCreate({where: {deviceID:deviceID}, defaults: {
        deviceID: deviceID,
        lastSeen:currentDate,
        isAllowed:'yes'
    }})
    .spread(function(device) {
        device.updateAttributes({
            lastSeen:currentDate
        });
    });

};

exports.isDeviceAllowed = function(req,callback) {

    var deviceLocalIp  = getLocalIp(req);
    var devicePlatform = getPlatform(req);
    var deviceID       = devicePlatform+'_'+deviceLocalIp;
    Device.find({where:{ deviceID:deviceID}})
    .then(function(device) {
        if (device) {
            callback(device.isAllowed);
        } else {
            callback("yes");
        }
    });
};

function setDeviceLocked(req, res, deviceID, locked) {
    console.log("Setting dievices locked:", locked);
    Device.findOrCreate({where: {deviceID:deviceID}, defaults: {
        deviceID: deviceID,
        lastSeen: getDateTime(),
        isAllowed:locked
    }})
    .spread(function(device) {
        device.updateAttributes({isAllowed:locked})
        .then(function() {
            res.status(200).send('done');
        })
        .error(function (err) {
            console.log(err);
            res.status(500).send();
        });
    })
    .error(function (err) {
        console.log(err);
        res.status(500).send();
    });
}
exports.lockDevice = function(req,res,deviceID) {
    setDeviceLocked(req,res,deviceID,"no");
};

exports.unlockDevice = function(req,res,deviceID) {
    setDeviceLocked(req,res,deviceID,"yes");
};
