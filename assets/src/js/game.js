'use strict'

var _             = require('./tools.js');
var map           = require('./UI/map.js');
var sockets       = require('./sockets.js');

var chooseFaction = require('./UI/chooseFaction.js');
var flashMessages = require('./UI/flashMessages.js');
var panels = require('./UI/panels.js');

var game = {
  player: {},
  faction: {}, // the current, selected faction
  tileToSpawn: 0,
  previousLife: 0,
  previousFaction: '',
  previousSpecs: '',

  init: function() {
    var self = this;

    var mapData = require('./mapData.js');

    self.player = 0;
    self.teamScore = 0;
    if (_.byId('board')) {
      mapData.init('board');

      chooseFaction.init();
      flashMessages.init();
      panels.init();
    }
    else if (_.byId('board-admin')) {
      mapData.init('board-admin');
      console.log('hey')
    }
  },

  tick: function(d) {
    game.map = d.map;
    map.updateMap(game.map);

    if (d.team && d.team.players[game.playerName]) {
      game.player = d.team.players[game.playerName];
      map.showPlayer(game.player);

      // Update UI
      if (game.player.faction && game.player.position !== null) {
        game.faction = game.player.factions[game.player.faction];
        if (game.faction.life != game.previousLife) {
          panels.setPlayerLife(game.faction.life);
          game.previousLife = game.faction.life;
        }
        if (game.player.faction != game.previousFaction ||
            JSON.stringify(game.faction) != game.previousSpecs) {
          panels.setPlayerSpecs(game.player.faction, game.faction);
          game.previousFaction = game.player.faction;
          game.previousSpecs = JSON.stringify(game.faction);
        }
      }
      else {
        panels.hidePlayerPanel();
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
