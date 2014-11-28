'use strict';

var _ = require('../tools.js');

var sounds = {
  init: function() {
    var self = this;
    /** SELECT DOM ELEMENTS */
    self.factionSelected = _.byId('s-faction-selected');
    self.victory         = _.byId('s-upgrade');
    self.defeat          = _.byId('s-victory');
    self.upgrade         = _.byId('s-defeat');
  },

  pFactionSelected: function() {
    sounds.factionSelected.load();
    sounds.factionSelected.oncanplay = function() {
      sounds.factionSelected.play();
    };
  },

  pUpgrade: function() {
    sounds.upgrade.load();
    sounds.upgrade.oncanplay = function() {
      sounds.upgrade.play();
    };
  },

  pVictory: function() {
    sounds.victory.load();
    sounds.victory.oncanplay = function() {
      sounds.victory.play();
    };
  },

  pDefeat: function() {
    sounds.defeat.load();
    sounds.defeat.oncanplay = function() {
      sounds.defeat.play();
    };
  }
};


module.exports = sounds;
