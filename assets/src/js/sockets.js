'use strict';

var _ = require('./tools.js');

/**
  * Handle socket.io
*/


var sockets = {
  init: function() {
    var self = this;
    self.socket = io(window.location.hostname);

    self.socket.on('flash', self.flash);

    var game = require('./game.js');
    var chat = require('./chat.js');
    var panels = require('./UI/panels.js');

    self.socket.on('joined', game.joined);
    self.socket.on('tick', game.tick);
    self.socket.on('countdown', game.countdown);
    self.socket.on('newMsg', chat.displayMsg);
    self.socket.on('newJoinMsg', chat.displayMsg);
    self.socket.on('victory', panels.displayVictory);
    self.socket.on('defeat', panels.displayDefeat);
  },

  flash: function(resData) {
    //if (resData.type == 'success')
    console.log(resData.message);
  },

  move: function(index) {
    this.socket.emit('movePlayer', {position: index});
  },

  setFaction: function(faction) {
    var game = require('./game.js');
    this.socket.emit('setFaction', {
      position: game.tileToSpawn,
      faction: faction
    });
  },

  upgrade: function() {
    sockets.socket.emit('upgrade', {skill: _.attr(this, 'data-skill')});
  },

  chatMsg: function(msg) {
    sockets.socket.emit('chatMsg', {msg: msg});
  }
};

module.exports = sockets;
