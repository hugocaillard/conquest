'use strict';
var path = require('path');

var mapper = require(__dirname+'/mapper.js');
var app    = require(path.join(__dirname, '../../server.js'));
var conf   = app.config.game;

var game = {
  ticks: 0,
  teamsNames: conf.teams,
  init: function() {
    var self = this;
    for (var i=0;i<self.teamsNames.length;i++) {
      self[self.teamsNames[i]] = {
        score: {},
        players: {}
      };
    }

    mapper.init();
    self.ticker();
  },

  /**
    * MAIN GAME LOOP
  */
  ticker: function() {
    var self = this;
    var now = 0, delta = 0;
    var sockets = require(__dirname+'/sockets.js');

    (function tick() {
      now = Date.now();

      self.ticks+= 1;
      sockets.tick(self);

      delta = Date.now() - now;
      setTimeout(tick, (100-delta));
    })();
  },

  /**
    * PLAYERS
  */

  // A player joins for the first time
  join: function(user, cb) {
    var self = this;
    var player = self.findOrJoinTeam(user.username);
    cb.call(self, player);
  },

  // A player moves
  movePlayer: function(d) {
    var player = game.findInTeam(this.request.user.username);

    var currentPos = player.position;
    // Check if the user can move
    if (mapper.map[player.position].adjacents.indexOf(d.position) > -1) {
      player.position = d.position;
    }
  },

  // Get the team of a player
  findInTeam: function(username) {
    var self = this;

    for (var i=0;i<self.teamsNames.length;i++) {
      if (self[self.teamsNames[i]].players[username])
        return self[self.teamsNames[i]].players[username];
    }
    return null;
  },

  findOrJoinTeam: function(username) {
    var self = this;
    var player = self.findInTeam(username);

    // Retrieve the player
    if (player) return player;

    // The player is joining for the 1st time
    var player = {
      type: null,
      position: null,
      team: null,
      xp: 0,
      dmg: 0,
      capt: 0,
      heal: 0,
      life: 0
    };
    var nbInAlpha = Object.keys(self.alpha.players).length;
    var nbInBeta  = Object.keys(self.beta.players).length;
    var nbInGamma = Object.keys(self.gamma.players).length;
    if (nbInAlpha === nbInGamma) {
      console.log('A player joined the alpha team.');
      player.team = "alpha";
      player.position = mapper.spawns[0];
      self.alpha.players[username] = player;
    }
    else if (nbInBeta === nbInGamma) {
      console.log('A player joined the beta team.');
      player.team = "beta";
      player.position = mapper.spawns[1];
      self.beta.players[username] = player;
    }
    else {
      console.log('A player joined the gamma team.');
      player.team = "gamma";
      player.position = mapper.spawns[2];
      self.gamma.players[username] = player;
    }
    return player;
  }
};


module.exports = game;
