const moduleLoader = require('./lib/module-loader.js');
const express = require('express');
var app = express();
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const static = require('serve-static');
const favicon = require('serve-favicon');
const errorHandler = require('errorhandler');
console.log(moduleLoader.loadModules());

const http = require('http');
var server = http.createServer(app);

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.setMaxListeners(100);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(static(__dirname + '/public'));
app.use(favicon(__dirname + '/public/core/favicon.ico'));
/*app.use(lingua(app, {
    defaultLocale: 'translation_' + language,
    storageKey: 'lang',
    path: __dirname+'/public/translations/',
    cookieOptions: {
        httpOnly: false,
        expires: new Date(Date.now(-1)),
        secure: false
    }
}));*/
app.use(errorHandler({ dumpExceptions: true, showStack: true }));
app.locals.pretty = true;
app.locals.basedir = __dirname + '/views';
moduleLoader.loads(app);
server.listen(3000);
