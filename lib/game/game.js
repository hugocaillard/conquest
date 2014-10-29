'use strict';
var path = require('path');

var mapper = require(__dirname+'/mapper.js');
var app = require(path.join(__dirname, '../../server.js'));
var conf = app.config.game;

var game = {
  teams: conf.teams,
  users: [],
  init: function() {
    mapper.init();
  },

  ticker: function() {
    var now = 0, delta = 0;
    (function tick() {
      now = Date.now();

      game.ticks+= 1;
      io.emit('tick', game);

      delta = Date.now() - now;
      setTimeout(tick, (100-delta));
    })();
  }
};


module.exports = game;
