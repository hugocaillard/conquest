var _ = require('../tools.js');

var mobile = {
  init: function() {
    var self = this;
    self.socket = io(window.location.hostname);

    self.socket.on('joined', function(d) {
      console.log(d);
    });
    self.socket.on('notjoined', function(d) {
      console.log(d);
    });

    self.socket.on('update', function(d) {
      console.log(d);
    });


    _.byId('deploy').addEventListener('click', function() {
      self.socket.emit('deploy');
    });

    _.byId('get-back').addEventListener('click', function() {
      self.socket.emit('getBack');
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  mobile.init();
});