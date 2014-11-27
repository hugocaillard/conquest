'use strict';

var colors = require('colors');
// get the config file
var fs = require('fs');
var config;
if (fs.existsSync(__dirname+'/config.json')) {
  console.log('[Warning] Got config.json'.green);
  config = require(__dirname+'/config');
}
else {
  console.log('[Warning] You should rename config.sample.json to config.json'.yellow);
  config = require(__dirname+'/config.sample.json');
}
module.exports.config = config;

// run the gulp command to build and watch (and re-build, only on dev) the assets
var exec = require('child_process').exec;
if (config.development) {
  console.log('[Info] Running Gulp and Watching'.green);
  exec(__dirname+'/node_modules/.bin/gulp');
}
else {
  console.log('[Info] Running Gulp Prod'.green);
  exec(__dirname+'/node_modules/.bin/gulp prod');
}


/**
  APP
**/
var app = require('koa')();


// session
var session = require('koa-generic-session');
var MongoStore = require('koa-generic-session-mongo');
app.keys = [config.secret];
app.use(session({
  store: new MongoStore({
    host: config.db.host,
    port: config.db.port,
    db: config.db.name,
    user: config.db.user,
    passw: config.db.pass
  })
}));


// auth
require(__dirname+'/lib/auth');
var passport = require('koa-passport');
app.use(passport.initialize());
app.use(passport.session());
module.exports.passport = passport;


// body parser
var bodyParser = require('koa-bodyparser');
app.use(bodyParser());


// users routes
var router = require('koa-router');
app.use(router(app));

var users = require(__dirname+'/lib/users');
app.post('/users/login', users.login);
app.post('/users/register', users.register);
app.get('/logout', users.logout);
app.get('/activate/:key', users.activate);

var admin = require(__dirname+'/lib/admin');
app.post('/admin/users', admin.getUsers);
app.post('/admin/users/update', admin.updateUser);
app.post('/admin/users/delete', admin.deleteUser);


// serve assets
var serve = require('koa-static');
app.use(serve(__dirname+'/assets/public'));


// serve views
var views = require(__dirname+'/lib/views');
app.get('/', views.home);
app.get('/game', views.game);
app.get('/lobby', views.lobby);
app.get('/admin', views.admin);
app.get('/admin/map', views.adminMap);
app.get('/mobile/:token', views.mobile);


// sockets
var server = require('http').Server(app.callback());
var io = require('socket.io')(server);

var sockets = require(__dirname+'/lib/game/sockets.js');
sockets.init(io);


// The game
var game = require(__dirname+'/lib/game/game');
game.init();
// send the JSON of the map
var map = require(__dirname+'/lib/game/mapper');
app.get('/map', function*(next) {
  this.body = JSON.stringify(map.map);
});

sockets.ready();


// let's go
server.listen(config.port);
console.log(('[Info] Listening :'+config.port).green);
