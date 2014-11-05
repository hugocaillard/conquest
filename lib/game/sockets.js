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
              var user = yield db.users.findById(session.passport.user, ['username']);

              handshake.user = user;
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

    var game = require(__dirname+'/game.js');

    self.io.on('connection', function(socket) {
      game.join(socket.request.user, function(player) {
        socket.join(player.team);
        socket.emit('joined', player);

        socket.on('movePlayer', game.movePlayer);
      });
    });
  },



  tick: function(teamsNames, maps) {
    var self = this;
    for (var team in teamsNames) {
      self.io.sockets.to(teamsNames[team]).emit('tick', maps[teamsNames[team]]);
    }
  }
}

module.exports = sockets;
