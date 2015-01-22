'use strict';

var _ = require('./tools.js');
var instantClick = require('hugocaillard/instantclick@v3.0.2:/instantclick.js');

document.addEventListener('DOMContentLoaded', function() {
  instantClick.init(true);
  instantClick.on('change', function() {
    domReady()
  });

  domReady();
});

function domReady() {
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
        console.log('login')
        _.post(url, data, function(d) {
          if (d.logged === true) {
            window.location.href = '/game';
          }
        });
        return;
      }
      if (data && method === 'post' && url === '/users/register') {
        _.post(url, data, function(d) {
          if (d.success === true) {
            var home = require('./UI/home.js');
            home.showMessage(d.message);
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

  if (_.byId('board') || _.byId('board-admin')) {
    var game = require('./game.js');
    setTimeout(function() {
      game.init();
    }, 500);
  }

  if (!!_.byId('landing')) {
    var home = require('./UI/home.js');
    home.init();
  }

  if (!!_.byId('lobby')) {
    var lobby = require('./lobby.js');
    lobby.init();
    var home = require('./UI/home.js');
    home.setParticles();
  }

  if (!!_.byId('about-page')) {
    var home = require('./UI/home.js');
    home.setParticles();
  }

  if (!!_.byId('tuto')) {
    var tuto = require('./UI/tuto.js');
    tuto.init();
  }
}


