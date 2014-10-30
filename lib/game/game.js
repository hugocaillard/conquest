'use strict';
var path = require('path');

var mapper = require(__dirname+'/mapper.js');
var app    = require(path.join(__dirname, '../../server.js'));
var conf   = app.config.game;

var game = {
  teams: conf.teams,
  users: [],
  ticks: 0,
  init: function() {
    mapper.init();
    this.ticker();
  },

  ticker: function() {
    var self = this;
    var now = 0, delta = 0;
    var sockets = require(__dirname+'/sockets.js');

    (function tick() {
      now = Date.now();

      self.ticks+= 1;
      sockets.tick(self),

      delta = Date.now() - now;
      setTimeout(tick, (100-delta));
    })();
  }
};


module.exports = game;
