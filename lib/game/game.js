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
    self.sockets = require(__dirname+'/sockets.js');

    (function tick() {
      self.ticks+= 1;
      now = Date.now();

      self.computeCapture();

      self.sockets.tick(self.teamsNames, self.getTeamsMaps(self.board, {
        alpha: {},
        beta: {},
        gamma: {}
      }));

      // the delta can be negative (it's like 0)
      // console.log(100-(Date.now()-now));
      setTimeout(tick, (100-(Date.now()-now)));
    })();
  },


  computeCapture: function() {
    var self = this;
    for (var tile in self.board) {
      tile = self.board[tile];

      var points = self.getTeamsPoints(tile);
      if (points) {
        if (self.tileCanBeCapture(tile, "alpha")) {
          tile.scores.alpha += points.alpha.capt;
          if (tile.scores.alpha >= 100) tile.ownedBy = "alpha";
        }
      }
    }
  },

  tileCanBeCapture: function(tile, team) {
    var self = this;
    if (!tile.spawn && tile.scores.alpha < 100) {
      for (var i=0;i<tile.adjacents.length;i++) {
        if (self.board[tile.adjacents[i]].ownedBy === team) return true;
      }
    }
    return false;
  },


  getTeamsPoints: function(tile) {
    var self = this;
    var points = {
      alpha: {capt:0},
      beta: {capt:0},
      gamma: {capt:0}
    };
    var doSend = false;
    for (var team in tile.players) {
      for (var player in tile.players[team]) {
        player = self.findInTeam(tile.players[team][player]);
        if (player.faction.length) {
          points[team].capt += player.factions[player.faction].capt;
          doSend = true;
        }
      }
    }
    if (doSend)
      return points;
    else
      return null;
  },

  getTeamsMaps: function(board, maps) {
    // Get all the tiles that each team can see
    //  - if the tile is owned by the team
    //  - if a player of the team is on the tile
    //  - all adjacents tiles to the previous ones
    var tile = null;
    for (var i=0; i<board.length; i++) {
      tile = board[i];
      if (tile.ownedBy) {
        if (!maps[tile.ownedBy][i]) maps[tile.ownedBy][i] = tile;
        this.adjTilesToMap(board,maps[tile.ownedBy], tile);
      }
      for (var team in tile.players) {
        if (tile.players[team].length) {
          if (!maps[team][i]) maps[team][i] = tile;
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
      game.sockets.updatePlayer(this, player);
    }
  },

  setFaction: function(d) {
    var username = this.request.user.username;
    var player   = game.findInTeam(username);

    if (game.board[d.position] &&
        game.board[d.position].ownedBy === player.team) {
      player.position = d.position;
      game.board[player.position].players[player.team].push(username);
      player.faction = d.faction;
      game.sockets.updatePlayer(this, player);
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
      team: null,
      xp: 0,
      position: null,
      faction: null,
      factions: {
        soldier : {life:50 ,dmg:5,capt:2,heal:1},
        engineer: {life:100,dmg:2,capt:5,heal:0},
        medic   : {life:70 ,dmg:1,capt:1,heal:5}
      }
    };
    var nbInAlpha = Object.keys(self.alpha.players).length;
    var nbInBeta  = Object.keys(self.beta.players).length;
    var nbInGamma = Object.keys(self.gamma.players).length;
    if (nbInAlpha === nbInGamma) {
      console.log('A player joined the alpha team.');
      player.team = "alpha";
      self.alpha.players[username] = player;
    }
    else if (nbInBeta === nbInGamma) {
      console.log('A player joined the beta team.');
      player.team = "beta";
      self.beta.players[username] = player;
    }
    else {
      console.log('A player joined the gamma team.');
      player.team = "gamma";
      self.gamma.players[username] = player;
    }
    return player;
  }
};


module.exports = game;
