var map = require(__dirname+'/mapper.js');
var game = require(__dirname+'/game.js');

var sockets = {
  init: function(io) {
    io.on('connection', function(socket) {
      socket.emit('init', {message: 'Welcome', type:'success'});

      var user = {team: 'alpha', position: map.spawns[0]};
      game.users.push(user);
      socket.emit('joined', user)
      socket.on('movePlayer', function(data) {
        var user = {team: 'alpha', position: data.position};
        socket.emit('joined', user)
      });
    });
  }
}

module.exports = sockets;
