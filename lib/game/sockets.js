'use strict';
var co     = require('co');
var path   = require('path');

var mapper = require(__dirname+'/mapper.js');
var db     = require(path.join(__dirname, '../db'));
var app    = require(path.join(__dirname, '../../server.js'));
var conf   = app.config;

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
            if (player === false) {
              socket.emit('redirect', {url: '/lobby'});
              return false;
            }

            socket.join(player.team);

            if (player.team === 'alpha') var spawn = mapper.spawns[0];
            else if (player.team === 'beta') var spawn = mapper.spawns[1];
            else if (player.team === 'gamma') var spawn = mapper.spawns[2];
            socket.emit('joined', {username: socket.request.user.username, spawn: spawn});
            socket.on('movePlayer', function(d) {
              game.movePlayer.call(this, d, player.team);
            });
            socket.on('setFaction', function(d) {
              game.setFaction.call(this, d, player.team);
            });
            socket.on('upgrade', function(d) {
              game.upgradeSkill.call(this, d, player.team);
            });
            socket.on('chatMsg', function(d) {
              self.broadcastChat.call(this, socket.request.user.username, d.msg, player);
            });
          });
          return;
        }
      }
      else if (socket.request.turretOwner) {
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


  tick: function(ticks, board, teamsNames, maps, teams) {
    var self = this;
    for (var team in teamsNames) {
      self.io.sockets.to(teamsNames[team]).emit('tick', {
        ticks: ticks,
        map  :  maps[teamsNames[team]],
        team : teams[teamsNames[team]],
        scores: {
          toReach: conf.game.win,
          alpha: teams.alpha.score,
          beta :  teams.beta.score,
          gamma: teams.gamma.score,
        }
      });
    }
    self.io.sockets.to('admin').emit('tick', {
      map: board,
      team: null,
    });
  },

  sendResult: function(winner, loosers) {
    var self = this;

    self.io.sockets.to(winner).emit('victory');
    self.io.sockets.to(loosers[0]).emit('defeat');
    self.io.sockets.to(loosers[0]).emit('defeat');
  },

  countDown: function(count, teamsNames, teams) {
    var self = this;
    for (var team in teamsNames) {
      self.io.sockets.to(teamsNames[team]).emit('countdown', {
        count: count,
        team : teams[teamsNames[team]]
      });
    }
  },

  updateTurret: function(turret) {
    var socket = sockets.io.sockets.connected[turret.socketID];
    if (socket != undefined) {
      socket.emit('update', turret);
    }
  },

  broadcastChat: function(username, msg, player) {
    if (!player.lastSend || Date.now()-player.lastSend>2000) {
      player.lastSend = Date.now();
      sockets.io.sockets.to(player.team).emit('newMsg', {
        username: username,
        msg: msg
      });
    }
  },

  broadcastJoinMessage: function(username, team, firstTime) {
    if (firstTime) var msg = 'just joined your team!';
    else          var msg = 'is back!';
    sockets.io.sockets.to(team).emit('newJoinMsg', {
      username: username,
      msg: msg,
      type: 'notice'
    });
  }
}

module.exports = sockets;
