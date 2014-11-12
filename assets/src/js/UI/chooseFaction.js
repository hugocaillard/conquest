var _ = require('../tools.js');

var chooseFaction = {
  // DOM Elements
  chooseFaction: _.byId('choose-faction'),
  soldier: {
    dmg: _.$$('#soldier>.damages>span'),
    life: _.$$('#soldier>.life>span'),
    capt: _.$$('#soldier>.capture>span'),
    heal: _.$$('#soldier>.healing>span'),
  },
  engineer: {
    dmg: _.$$('#engineer>.damages>span'),
    life: _.$$('#engineer>.life>span'),
    capt: _.$$('#engineer>.capture>span'),
    heal: _.$$('#engineer>.healing>span'),
  },
  medic: {
    dmg: _.$$('#medic>.damages>span'),
    life: _.$$('#medic>.life>span'),
    capt: _.$$('#medic>.capture>span'),
    heal: _.$$('#medic>.healing>span'),
  },


  isVisible: false,

  init: function() {
    var game = require('../game.js');

    _.byId('soldier').addEventListener('click', game.setFaction);
    _.byId('engineer').addEventListener('click', game.setFaction);
    _.byId('medic').addEventListener('click', game.setFaction);
  },

  show: function() {
    var self = this;
    var game = require('../game.js');

    for (var faction in game.player.factions) {
      for (var spec in game.player.factions[faction]) {
        self[faction][spec].innerHTML = game.player.factions[faction][spec];
      }
    }
    this.chooseFaction.classList.add('show');
    this.isVisible = true;
  },

  hide: function() {
    this.isVisible = false;
    this.chooseFaction.classList.remove('show');
  }
};


module.exports = chooseFaction;
