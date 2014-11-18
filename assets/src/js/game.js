'use strict'

var _             = require('./tools.js');
var map           = require('./UI/map.js');
var sockets       = require('./sockets.js');

var chooseFaction = require('./UI/chooseFaction.js');
var flashMessages = require('./UI/flashMessages.js');

var game = {
  player: {},
  tileToSpawn: 0,

  init: function() {
    var self = this;
    self.playerLife = 0;
    self.teamScore = 0;
    if (_.byId('board')) {
      var mapData = require('./mapData.js');
      mapData.init('board');

      chooseFaction.init();
      flashMessages.init();
    }
    else if (_.byId('board-admin')) {
      var mapData = require('./mapData.js');
      mapData.init('board-admin');
    }
  },

  tick: function(d) {
    game.map = d.map;
    map.updateMap(game.map);

    if (d.team) {
      game.player = d.team.players[game.playerName];
      map.showPlayer(game.player);

      // TODO: move this
      if (game.player.faction && game.playerLife != game.player.factions[game.player.faction].life) {
        game.playerLife = game.player.factions[game.player.faction].life;
        _.byId('p-life').innerHTML = game.playerLife;
      }
      if (game.teamScore != d.team.score) {
        game.teamScore = d.team.score;
        _.byId('score').innerHTML = game.teamScore;
      }
    }
  },

  joined: function(d) {
    game.playerName = d;
  },

  setFaction: function(el) {
    el = el.target;
    var faction = el.id;
    while (!faction || faction.length === 0) {
      el = el.parentNode;
      faction = el.id;
    }
    sockets.setFaction(faction);
    if (chooseFaction.isVisible) chooseFaction.hide();
    if (flashMessages.isVisible) flashMessages.hide();
  }
}


module.exports = game;
