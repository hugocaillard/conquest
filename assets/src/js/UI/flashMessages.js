'use strict';

var _ = require('../tools.js');

var flashMessage = {
  // DOM Elements
  flashMessage: _.byId('flash'),
  isVisible: false,

  init: function() {
    var game = require('../game.js');
    this.spawning = _.$$('#flash>.spawning');
  },

  show: function(msg) {
    var self = this;
    var game = require('../game.js');

    if (self.spawning.innerHTML != msg)
      self.spawning.innerHTML = msg;
    self.flashMessage.classList.add('show');
    self.isVisible = true;
  },

  hide: function() {
    var self = this;
    self.spawning.innerHTML = "";
    self.flashMessage.classList.remove('show');
    self.isVisible = false;
  }
};


module.exports = flashMessage;
