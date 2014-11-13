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

      self.computePoints();

      self.sockets.tick(self.teamsNames, self.getTeamsMaps(self.board, {
        alpha: {},
        beta: {},
        gamma: {}
      }));

      // the delta can be negative (it's like 0)
      console.log(200-(Date.now()-now));
      setTimeout(tick, (200-(Date.now()-now)));
    })();
  },


  computePoints: function() {
    var self = this;
    for (var tile in self.board) {
      tile = self.board[tile];


      /**
        * compute capture pts
      */

      // Retrieve how many points to add/remove
      var pts = self.getTeamsPoints(tile);
      if (pts && pts.capt) {
        var team = null, score = 0, enemyTeam = null;
        if (pts.capt.alpha>pts.capt.beta && pts.capt.alpha>pts.capt.gamma && tile.scores.alpha < 100) {
          team = "alpha";
          score = pts.capt.alpha - Math.max(pts.capt.beta, pts.capt.gamma);
          if (tile.scores.beta || tile.scores.gamma)
            enemyTeam = (tile.scores.beta > tile.scores.gamma) ? "beta" : "gamma";
        }
        else if (pts.capt.beta>pts.capt.alpha && pts.capt.beta>pts.capt.gamma && tile.scores.beta < 100) {
          team = "beta";
          score = pts.capt.beta - Math.max(pts.capt.alpha, pts.capt.gamma);
          if (tile.scores.alpha || tile.scores.gamma)
            enemyTeam = (tile.scores.alpha > tile.scores.gamma) ? "alpha" : "gamma";
        }
        else if (pts.capt.gamma>pts.capt.alpha && pts.capt.gamma>pts.capt.beta && tile.scores.gamma < 100) {
          team = "gamma";
          score = pts.capt.gamma - Math.max(pts.capt.alpha, pts.capt.beta);
          if (tile.scores.alpha || tile.scores.beta)
            enemyTeam = (tile.scores.alpha > tile.scores.beta) ? "alpha" : "beta";
        }

        // Apply the points
        if (team && score && self.tileCanBeCapture(tile, team)) {
          var doCompute = true;
          if (enemyTeam) {
            doCompute = false;
            tile.scores[enemyTeam] -= score;
            if (tile.scores[enemyTeam] <= 0) {
              score = -tile.scores[enemyTeam]; // we have to re-add this points to the team
              doCompute = true; // so we do compute
              tile.scores[enemyTeam] = 0; // never goes lower
              tile.ownedBy = null;
            }
          }

          if (doCompute) {
            tile.scores[team] += score;
            if (tile.scores[team] >= 100) {
              tile.scores[team] = 100; // never goes higher
              tile.ownedBy = team;
            }
          }
        }


        /**
          * compute damages and heals points
        */
      }
    }
  },

  tileCanBeCapture: function(tile, team) {
    var self = this;
    if (!tile.spawn) {
      for (var i=0;i<tile.adjacents.length;i++) {
        if (self.board[tile.adjacents[i]].ownedBy === team) return true;
      }
    }
    return false;
  },


  getTeamsPoints: function(tile) {
    var self = this;
    var points = {};
    points.capt = {
      alpha: 0,
      beta: 0,
      gamma: 0
    };
    var doSend = false;
    for (var team in tile.players) {
      for (var player in tile.players[team]) {
        player = self.findInTeam(tile.players[team][player]);
        if (player.faction.length) {
          if (self.tileCanBeCapture(tile, team))
            points.capt[team] += player.factions[player.faction].capt;
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
    if (tile && tile.adjacents.indexOf(d.position) > -1) {
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
