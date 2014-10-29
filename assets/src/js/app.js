'use strict';

var _ = require('./tools.js');
var game = require('./game.js');

var users = {
  loginHandler: function(resData) {
    console.log(resData);
  }
};


document.addEventListener('DOMContentLoaded', function() {
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
      var data = _.serialize(self);
      if (data && method === 'post' && url === '/users/login') {
        _.post(url, data, function(d) {
          if (d.logged === true) {
            window.location.href = '/game';
          }
        });
      }
      else if (data && method === 'post')
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

  game.init();
});
