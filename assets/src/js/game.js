'use strict'

var _ = require('./tools.js');
var map = require('./UI/map.js');

var game = {
  player: {},

  init: function() {
    var self = this;

    if (_.byId('board')) {
      var mapData = require('./mapData.js');
      mapData.init();

      var sockets = require('./sockets.js');
      sockets.init();
    }
  },

  joined: function(d) {
    self.player = d;
    map.showPlayer(self.player);
  }
}


module.exports = game;
