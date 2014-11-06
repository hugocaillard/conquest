var _ = require('./tools.js');

/**
  * Handle socket.io
*/


var sockets = {
  init: function() {
    var self = this;

    self.socket = io('localhost');
    self.socket.on('init', function(resData) {
      console.log(resData.message);
    });

    self.socket.on('flash', self.flash);

    var game = require('./game.js');
    self.socket.on('joined', game.joined);
    self.socket.on('player', game.setPlayer);
    self.socket.on('tick', game.tick);
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
    console.log(game.tileToSpawn);
    this.socket.emit('setFaction', {
      position: game.tileToSpawn,
      faction: faction
    });
  }
};

module.exports = sockets;
