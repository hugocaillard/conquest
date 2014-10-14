'use strict'

var _ = require('./tools.js');

var game = {
  map: null,

  init: function() {
    var self = this;
    if (_.byId('board')) {
      self.getMap(function(resData) {
        self.map = resData;

        //console.log(self.map);
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
