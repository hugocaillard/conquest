'use strict'

var _             = require('./tools.js');
var map           = require('./UI/map.js');
var chooseFaction = require('./UI/chooseFaction.js');
var sockets       = require('./sockets.js');

var game = {
  player: {},
  tileToSpawn: 0,

  init: function() {
    var self = this;

    var mapData = require('./mapData.js');
    mapData.init();
    chooseFaction.init();
  },

  tick: function(d) {
    game.map = d;
    map.updateMap(d);
  },

  joined: function(d) {
    game.player = d;
    map.showPlayer(game.player);
  },

  setPlayer: function(d) {
    game.player = d;
    if (chooseFaction.isVisible) chooseFaction.hide();
    map.showPlayer(game.player);
  },

  setFaction: function(el) {
    el = el.target;
    var faction = el.id;
    while (!faction || faction.length === 0) {
      el = el.parentNode;
      faction = el.id;
    }
    sockets.setFaction(faction);
  }
}


module.exports = game;
