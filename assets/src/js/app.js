'use strict';

var _ = require('./tools.js');
var game = require('./game.js');
console.log(game);
var socket = io('http://localhost');


var users = {
  loginHandler: function(resData) {
    console.log(resData);
  }
};

document.addEventListener('DOMContentLoaded', function(){

  /**
    * send forms with ajax
  */
  var forms = _.$('form.ajax');
  _.elLoop(forms, function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var self = this;
      var url = _.attr(self, 'action')
      var method = _.attr(self, 'method');
      var data = _.serialize(this);
      if (data && method === 'post')
        _.post(url, data);
    });
  });

  /**
    * show passwords
  */
  var showPassButtons = _.$('input[data-action="showPassword"]');
  _.elLoop(showPassButtons, function(button) {
    button.addEventListener('change', function() {
      var self = this;
      var previous = _.previous(self);
      if (self.checked)
        _.attr(previous, 'type', 'text');
      else
        _.attr(previous, 'type', 'password');
    });
  });

  /**
    * socket.io
  */
  socket.on('init', function(resData) {
    console.log(resData.message);

    socket.on('message', function(resData) {
      console.log(resData.message);
    });
  });

  game.init();
});
