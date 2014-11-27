'use strict'

var _             = require('./tools.js');
var map           = require('./UI/map.js');
var sockets       = require('./sockets.js');
var chat          = require('./chat.js');

var chooseFaction = require('./UI/chooseFaction.js');
var flashMessages = require('./UI/flashMessages.js');
var panels        = require('./UI/panels.js');
var connectTurret = require('./UI/connectTurret.js');
var sounds        = require('./UI/sounds.js');

var game = {
  isReady: false,
  firstTick: true,
  player: {},
  faction: {}, // the current, selected faction
  tileToSpawn: 0,
  currentLife: 0,
  currentFaction: '',
  currentSpecs: '',
  currentTile: null,
  currentTileStats: '',
  currentTurretPos: null,

  init: function() {
    var self = this;

    var mapData = require('./mapData.js');

    self.player = 0;
    if (_.byId('board')) {
      mapData.init('board');

      chooseFaction.init();
      flashMessages.init();
      sounds.init();
      panels.init();
      chat.init();
    }
    else if (_.byId('board-admin')) {
      mapData.init('board-admin');
    }
  },

  ready: function(team, bitly, countdown) {
    if (_.byId('board')) {
      panels.setTeam(team, countdown);
      connectTurret.init(bitly);
    }
  },

  countdown: function(d) {
    if (d.count) {
      panels.setCountdown(d.count/1000);
    }
    if (d.team && d.team.players[game.playerName]) {
      game.player = d.team.players[game.playerName];
      if (!game.isReady) {
        game.isReady = true;
        game.ready(game.player.team, game.player.bitly, true);
      }
    }
  },

  tick: function(d) {
    game.map = d.map;
    map.updateMap(game.map);

    if (d.team && d.team.players[game.playerName]) {
      game.player = d.team.players[game.playerName];
      map.showPlayer(game.player);

      if (game.player.turret && game.currentTurretPos != game.player.turret.position) {
        map.showTurret(game.player.turret.position, game.currentTurretPos);
        game.currentTurretPos = game.player.turret.position;
      }

      /**
        * Update UI
      */
      if (d.ticks) {
        panels.setTick(d.ticks);
      }
      // PLAYER SPECS
      if (game.player.faction && game.player.position !== null) {
        game.faction = game.player.factions[game.player.faction];
        if (game.player.faction !== game.currentFaction ||
            JSON.stringify(game.player) !== game.currentSpecs) {
          panels.setPlayerSpecs(game.player.faction, game.faction);
          game.currentFaction = game.player.faction;
          game.currentSpecs = JSON.stringify(game.player);

          if (game.faction.skillPts)
            panels.showUpgradePlayer();
          else
            panels.hideUpgradePlayer();
        }
      }
      else { // No player's data to display
        panels.setPlayerLife(0);
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
      if (d.scores)
        panels.updateScores(d.scores);


      // on first tick
      if (!game.isReady) {
        game.isReady = true;
        game.ready(game.player.team, game.player.bitly);
        panels.setTileStats(game.map[game.spawn]);
        game.currentTileStats = JSON.stringify(game.map[game.spawn]);
        game.currentPosition = game.spawn
      }
      if (game.firstTick) {
        _.$$('.countdown').classList.remove('show');
        game.firstTick = false;
      }
    }
  },

  joined: function(d) {
    game.playerName = d.username;
    game.spawn = d.spawn;
    panels.showName(d.username);
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
    sounds.pFactionSelected();
  }
}


module.exports = game;
