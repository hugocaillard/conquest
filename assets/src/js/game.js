'use strict'

var _ = require('./tools.js');
var map = require('./map.js');

var game = {

  init: function() {
    var self = this;

    if (_.byId('board')) {
      map.init();
    }
  }
}


module.exports = game;
