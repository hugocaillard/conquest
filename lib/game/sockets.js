var co     = require('co');
var path   = require('path');

var passport = require(path.join(__dirname, '../../server.js')).passport;
var db       = require(path.join(__dirname, '../db'));

var sockets = {
  io: null,
  init: function(io) {
    var cookie = require('cookie');
    io.set('authorization', function (handshake, callback) {
      if (handshake.headers) {
        var key = cookie.parse(handshake.headers.cookie)['koa.sid'];
        if (key) {
          co(function*() {
            var session = yield db.sessions.findOne({ sid: 'koa:sess:'+key });
            if (session && session._id) {
              var user = yield db.users.findById(session.passport.user);
              callback(null, true);
            }
          })();
        }
      }
    });
    this.io = io;
  },

  ready: function() {
    var self = this;

    var map = require(__dirname+'/mapper.js');
    var game = require(__dirname+'/game.js');

    this.io.on('connection', function(socket) {
      var _user = {team: 'alpha', position: map.spawns[0]};
      game.users.push(_user);
      socket.emit('joined', _user);
      socket.on('movePlayer', function(data) {
        var user = {team: 'alpha', position: data.position};
        socket.emit('joined', user)
      });
    });
  },

  tick: function(game) {
    //this.io.emit('tick', game);
  }
}

module.exports = sockets;
