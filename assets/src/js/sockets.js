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
    self.socket.on('tick', self.tick);

    var game = require('./game.js');
    self.socket.on('joined', game.joined);
  },

  tick: function(resData) {
    console.log(resData.ticks);
  },

  flash: function(resData) {
    //if (resData.type == 'success')
    console.log(resData.message);
  },

  move: function(index) {
    this.socket.emit('movePlayer', {position: index});
  }
};

module.exports = sockets;
