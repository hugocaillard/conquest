var co     = require('co');
var path   = require('path');

var db = require(path.join(__dirname, '../db'));
var app  = require(path.join(__dirname, '../../server.js'));
var conf = app.config;

var sockets = {
  io: null,
  init: function(io) {
    var cookie = require('cookie');

    // desktop sockets
    io.set('authorization', function (handshake, callback) {
      if (handshake.headers) {

        // MOBILE TURRET CONNECTION
        var turret = cookie.parse(handshake.headers.cookie)['turret'];
        if (turret) {
          co(function*() {
            var user = yield db.users.findOne({token: turret});
            if (user) {
              handshake.turretOwner = user.username;
              callback(null, true);
              return;
            }
          })();
        }

        // USER COONECTION
        var key = cookie.parse(handshake.headers.cookie)['koa.sid'];
        if (key) {
          co(function*() {
            var session = yield db.sessions.findOne({ sid: 'koa:sess:'+key });
            if (session && session._id) {
              var user = yield db.users.findById(session.passport.user, ['username', 'email', 'bitly']);
              if (user) {
                handshake.user = user;
                callback(null, true);
                return;
              }
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
      if (socket.request.user) {
        if (socket.request.user.email === conf.superadmin) {
          socket.join('admin');
          return;
        }
        else {
          game.join(socket.request.user, function(player) {
            socket.join(player.team);
            socket.emit('joined', socket.request.user.username);
            socket.on('movePlayer', function(d) {
              game.movePlayer.call(this, d, player.team);
            });
            socket.on('setFaction', function(d) {
              game.setFaction.call(this, d, player.team);
            });
          });
          return;
        }
      }
      else if (socket.request.turretOwner) {
        //self.io.sockets.connected[socket.id].emit('hey');
        var username = socket.request.turretOwner;
        var owner = game.findInTeam(username);
        if (owner) {
          game.setTurret(username, owner, socket.id);

          socket.on('deploy', function(d) {
            game.deployTurret.call(this, owner.team)
          });
          socket.on('getBack', function(d) {
            game.getBackTurret.call(this, owner.team)
          });
          socket.on('disconnect', function() {
            game.setTurret(username, owner, null);
          });
          socket.emit('joined', owner);
        }
        else
          socket.emit('notjoined');
      }
    });
  },


  tick: function(board, teamsNames, maps, teams) {
    var self = this;
    for (var team in teamsNames) {
      self.io.sockets.to(teamsNames[team]).emit('tick', {
        map:  maps[teamsNames[team]],
        team: teams[teamsNames[team]]
      });
    }
    self.io.sockets.to('admin').emit('tick', {
      map: board,
      team: null,
    });
  }
}

module.exports = sockets;
