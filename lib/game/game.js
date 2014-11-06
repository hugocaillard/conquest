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

    self.board = mapper.init();
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

      sockets.tick(self.teamsNames, self.getTeamsMaps(self.board, {
        alpha: {},
        beta: {},
        gamma: {}
      }));

      delta = Date.now() - now;
      setTimeout(tick, (200-delta)); // the delta can be negative (it's like 0)
    })();
  },

  getTeamsMaps: function(board, maps) {
    // Get all the tiles that each team can see
    //  - if the tile is owned by the team
    //  - if a player of the team is on the tile
    //  - all adjacents tiles to the previous ones
    var tile = null;
    for (var i=0; i<board.length; i++) {
      tile = board[i];
      if (tile.ownedBy && !maps[tile.ownedBy][i]) {
        maps[tile.ownedBy][i] = tile;
        this.adjTilesToMap(board,maps[tile.ownedBy], tile);
      }
      for (var team in tile.players) {
        if (tile.players[team].length && !maps[team][i]) {
          maps[team][i] = tile;
          this.adjTilesToMap(board,maps[team], tile);
        }
      }

    }
    return maps;
  },

  // Add all the adjacent tile to the map of the team
  adjTilesToMap: function(board, map, center) {
    for (var i=0;i<center.adjacents.length;i++) {
      if (!map[center.adjacents[i]])
        map[center.adjacents[i]] = board[center.adjacents[i]]
    }
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
    var username = this.request.user.username;
    var player   = game.findInTeam(username);

    var tile = game.board[player.position];
    // Check if the user can move
    if (tile.adjacents.indexOf(d.position) > -1) {
      tile.players[player.team].splice(tile.players[player.team].indexOf(username),1);
      player.position = d.position;
      game.board[player.position].players[player.team].push(username);
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
