// get the config file
var config = require('./config');

// run the gulp command to build and watch (and re-build) the assets
var exec = require('child_process').exec;
exec('./node_modules/.bin/gulp', function (err, stdout, stderr) {
  console.log(stdout);
  console.log(stderr);
});


var serve    = require('koa-static');
var router   = require('koa-router');
var session  = require('koa-session');
var passport = require('koa-passport');
var json     = require('koa-json');

var app = require('koa')();


app.use(router(app));


// sessions
app.keys = [config.secret];
//app.use(session());


// authentication
//require('./lib/auth')
//app.use(passport.initialize());
//app.use(passport.session());

var users = require('./lib/users');
app.post('/user/test', function *(next) {
  console.log('hey');
  this.body = "connected"
  yield next;
});


// set public path to serve assets
app.use(serve('./assets/public/'));


// serve views
var views = require('./lib/views');
app.get('/', views.home);
app.get('/game', views.game);


// API
app.use(json());

// var users = require('./lib/users');
// app.use(app.get('/user/:id', users.getOne):


// sockets
var server = require('http').Server(app.callback());
var io = require('socket.io')(server);

io.on('connection', function(socket){
  socket.emit('init', {message: "Hey you"});

  //socket.on('login', users.login);
});


// let's go
server.listen(3000);
console.log('Listening :3000');
