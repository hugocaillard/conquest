// get the config file
var fs = require('fs');
var config;
if (fs.existsSync('./config'))
  config = require('./config')
else {
  console.log('Warning: You should rename config.sample.json to config.json');
  config = require('./config.sample');
}

// run the gulp command to build and watch (and re-build) the assets
// only in dev
if (config.env == 'development') {
  var exec = require('child_process').exec;
  console.log('Running Gulp');
  exec('./node_modules/.bin/gulp');
}

/**
  APP
**/
var app = require('koa')();


// session
var session = require('koa-session');
app.keys = [config.secret];
app.use(session());


// body parser
var bodyParser = require('koa-bodyparser');
app.use(bodyParser());


// auth
require('./lib/auth');
var passport = require('koa-passport');
app.use(passport.initialize());
app.use(passport.session());


// serve assets
var serve = require('koa-static');
app.use(serve('./assets/public/'));


// routes
var router = require('koa-router');
app.use(router(app));

var users = require('./lib/users');
app.post('/users/login', users.login);


// serve views
var views = require('./lib/views');
app.get('/', views.home);
app.get('/game', views.game);


// sockets
var server = require('http').Server(app.callback());
var io = require('socket.io')(server);

io.on('connection', function(socket){
  socket.emit('init', {message: "Hey you"});
});


// expose some objects to other modules
var conquest = {};
conquest.io = io;
module.exports.c = conquest;


// let's go
server.listen(3000);
console.log('Listening :3000');
