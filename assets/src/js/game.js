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
  currentLife: 0,
  currentFaction: '',
  currentSpecs: '',
  currentTile: null,
  currentTileStats: '',

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
    }
  },

  tick: function(d) {
    game.map = d.map;
    map.updateMap(game.map);

    if (d.team && d.team.players[game.playerName]) {
      game.player = d.team.players[game.playerName];
      map.showPlayer(game.player);

      /**
        * Update UI
      */
      // PLAYER SPECS
      if (game.player.faction && game.player.position !== null) {
        game.faction = game.player.factions[game.player.faction];
        if (game.faction.life !== game.currentLife) {
          panels.setPlayerLife(game.faction.life);
          game.currentLife = game.faction.life;
          game.currentSpecs = JSON.stringify(game.faction);
        }
        if (game.player.faction !== game.currentFaction ||
            JSON.stringify(game.faction) !== game.currentSpecs) {
          panels.setPlayerSpecs(game.player.faction, game.faction);
          game.currentFaction = game.player.faction;
          game.currentSpecs = JSON.stringify(game.faction);
        }
      }
      else { // No player's data to display
        panels.hidePlayerPanel();
      }

      // TILES DATA
      if (game.player.position !== null) {
        if (game.player.position !== game.currentPosition) {
          panels.setTileStats(game.map[game.player.position]);
          game.currentPosition = game.player.position;
          game.currentTileStats = JSON.stringify(game.map[game.player.position]);
        }
        else if (game.currentTileStats !== JSON.stringify(game.map[game.player.position])) {
          panels.setTileStats(game.map[game.player.position]);
          game.currentTileStats = JSON.stringify(game.map[game.player.position]);
        }
      }

      //  SCORES
      if (game.teamScore !== d.team.score) {
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
