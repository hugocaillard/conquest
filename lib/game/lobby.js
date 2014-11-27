'use strict';
var path    = require('path');
var co      = require('co');

var mapper = require(__dirname+'/mapper.js');
var app    = require(path.join(__dirname, '../../server.js'));
var db = require(path.join(__dirname, '../db'));

var lobby = {
  getGames: function*() {
    var ctx = this;
    var lastGames = yield db.games.find({}, {limit : 7, sort : {willStartAt: -1}});

    var response = {
      logged: false,
      games: []
    };


    if (ctx.isAuthenticated()) {
      response.logged = true;
      var user = yield db.users.findOne({ _id: this.req.user });
    }
    if (!user)
      user = {username:null};

    var game;
    for (var i=0; i<lastGames.length; i++) {
      game = lastGames[i];
      response.games.push({
        userTeam: lobby.getTeam(game, user.username),
        winner: game.winner,
        ticks: game.ticks,
        nbOfPlayers: lobby.getNbOfPlayers(game),
        willStartAt: game.willStartAt,
        endedAt: game.endedAt
      });
      response.games.winner = game.winner;
      response.maxPlayers = app.config.game.maxPlayers;
    }
    ctx.body = response;
  },

  getTeam: function(game, username) {
    if (username) {
      if (game.teams.alpha.players[username]) return 'alpha';
      else if (game.teams.beta.players[username]) return 'beta';
      else if (game.teams.gamma.players[username]) return 'gamma';
    }
    return null;
  },

  getNbOfPlayers: function(game) {
    return Object.keys(game.teams.alpha.players).length +
           Object.keys(game.teams.beta.players).length +
           Object.keys(game.teams.gamma.players).length;
  }
};

module.exports = lobby;
