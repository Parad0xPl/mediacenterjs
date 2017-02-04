var os = require('os');
var fs = require('fs-extra');
// var ffmpeg = require('fluent-ffmpeg');
var logger = require('winston');
var _ = require('underscore');

var CurrentTranscodings = {
    desktop : {},
    add : function (child, url) {
        this.desktop[url] = child;
    },
    remove : function(url) {
        delete this.desktop[url];
    },
    isTranscoding : function(url) {
        return this.desktop[url] !== undefined;
    },
    stopAll : function() {
        Object.keys(this.desktop).forEach(function(key) {
            this[key].kill();
            delete this[key];
        }, this.desktop);
    }
};

exports.start = function (mediaID, type, response, url, platform, file, outputPath, ExecConfig) {
    ExecConfig = { maxBuffer: 9000 * 1024 };
    if (os.platform() === 'win32') {
        ExecConfig = _.extend(ExecConfig, { env: process.env.ffmpegPath });
    }

    if (!fs.existsSync(outputPath)) {
        logger.info('Starting transcoding for ' + platform);
        var transcoder = require('./' + platform);
        transcoder.transcode(mediaID, type, response, url, file, outputPath, ExecConfig, CurrentTranscodings);
    }
};

exports.stop = function() {
    CurrentTranscodings.stopAll();
};

exports.CurrentTranscodings = CurrentTranscodings;
