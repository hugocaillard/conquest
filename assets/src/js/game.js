'use strict'
//var svg = require('wout/svg.js@1.0.1:/dist/svg.min.js');
//var snap = require('adobe-webplatform/Snap.svg@0.3.0:/dist/snap.svg.js');


var _ = require('./tools.js');

var game = {
  map: null,

  init: function() {
    var self = this;
    if (_.byId('board')) {
      self.getMap(function(d) {
        self.map = d;
        self.buildMap();
      });
    }
  },

  getMap: function(cb) {
    _.get('/map', cb);
  },

  buildMap: function() {
    var self = this;
  }
}


module.exports = game;
