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
  config = require(__dirname+'/config.sample');
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
var session = require('koa-session');
app.keys = [config.secret];
app.use(session());


// auth
require(__dirname+'/lib/auth');
var passport = require('koa-passport');
app.use(passport.initialize());
app.use(passport.session());


// body parser
var bodyParser = require('koa-bodyparser');
app.use(bodyParser());


// users routes
var router = require('koa-router');
app.use(router(app));

var users = require(__dirname+'/lib/users');
app.post('/users/login', users.login);
app.post('/users/register', users.register);


// serve assets
var serve = require('koa-static');
app.use(serve(__dirname+'/assets/public'));


// serve views
var views = require(__dirname+'/lib/views');
app.get('/', views.home);
app.get('/game', views.game);


// sockets
var server = require('http').Server(app.callback());
var io = require('socket.io')(server);
module.exports.io = io;

io.on('connection', function(socket){
  socket.emit('init', {message: "Hey you"});
});


// The game
var game = require(__dirname+'/lib/game/game');
game.init();
// send the JSON of the map
var map = require(__dirname+'/lib/game/mapper').map;
map = JSON.stringify(map);
app.get('/map', function*(next) {
  this.body = map;
});


// let's go
server.listen(config.port);
console.log('[Info] Listening :%s'.green, config.port);
