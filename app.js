// Run the gulp command to build and watch (and re-build) the assets
var exec = require('child_process').exec;
exec('./node_modules/.bin/gulp', function (err, stdout, stderr) {
  console.log(stdout);
  console.log(stderr);
});

var serve = require('koa-static');
var route = require('koa-route');

var app = require('koa')();


// Set public path to serve assets
app.use(serve('./assets/public/'));


// Serve views
var views = require('./lib/views.js');
app.use(route.get('/', views.home));
app.use(route.get('/game', views.game));


// sockets
var server = require('http').Server(app.callback());
var io = require('socket.io')(server);


server.listen(3000);
console.log('Listening :3000');
