var _ = require('./tools.js');

/**
  * Handle socket.io
*/

var socket = io('localhost');

var sockets = {
  init: function() {
    var self = this;

    socket.on('init', function(resData) {
      console.log(resData.message);

      var game = require('./game.js');
      socket.on('flash', self.flash);
      socket.on('joined', game.joined);
    });
  },

  flash: function(resData) {
    //if (resData.type == 'success')
    console.log(resData.message);
  },

  move: function(index) {
    socket.emit('movePlayer', {position: index});
  }
};

module.exports = sockets;
