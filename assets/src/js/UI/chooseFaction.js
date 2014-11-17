'use strict';

var _ = require('../tools.js');

var chooseFaction = {
  // DOM Elements
  chooseFaction: _.byId('choose-faction'),

  isVisible: false,

  init: function() {
    var self = this;

    var game = require('../game.js');
    // Get DOM elements and set event listeners
    var factions = ['soldier', 'engineer', 'medic'];
    for (var faction in factions) {
      self[factions[faction]] = {
        xp:   _.$$('#'+ factions[faction] +'>.xp>span'),
        dmg:  _.$$('#'+ factions[faction] +'>.damages>span'),
        maxLife: _.$$('#'+ factions[faction] +'>.life>span'),
        capt: _.$$('#'+ factions[faction] +'>.capture>span'),
        heal: _.$$('#'+ factions[faction] +'>.healing>span')
      };
      _.byId(factions[faction]).addEventListener('click', game.setFaction, false);
    }
  },

  show: function() {
    var self = this;
    var game = require('../game.js');

    for (var faction in game.player.factions) {
      for (var spec in game.player.factions[faction]) {
        if (spec != 'life') // we only want the maxLife
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
