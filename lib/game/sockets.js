var cookie = require('cookie');
var co     = require('co');
var path   = require('path');

var passport = require(path.join(__dirname, '../../server.js')).passport;
var db       = require(path.join(__dirname, '../db'));

var sockets = {
  io: null,
  init: function(io) {
    this.io = io;
  },

  ready: function() {
    var self = this;

    var map = require(__dirname+'/mapper.js');
    var game = require(__dirname+'/game.js');

    this.io.on('connection', function(socket) {
      co(function*() {
        var key = cookie.parse(socket.request.headers.cookie)['koa.sid'];
        var user = yield db.sessions.findOne({ sid: 'koa:sess:'+key });

        if (user._id) {
          var user = yield db.users.findById(user.passport.user);

          socket.emit('init', {message: 'Welcome '+user.username, type:'success'});

          var _user = {team: 'alpha', position: map.spawns[0]};
          game.users.push(_user);
          socket.emit('joined', _user);
          socket.on('movePlayer', function(data) {
            var _user = {team: 'alpha', position: data.position};
            socket.emit('joined', _user)
          });
        }
      })();
    });
  },

  tick: function(game) {
    //this.io.emit('tick', game);
  }
}

module.exports = sockets;
