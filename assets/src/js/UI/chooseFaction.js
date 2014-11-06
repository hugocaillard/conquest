var _ = require('../tools.js');

var chooseFaction = {
  chooseFaction: _.byId('choose-faction'),

  init: function() {
    var game = require('../game.js');

    _.byId('soldier').addEventListener('click', game.setFaction);
    _.byId('engineer').addEventListener('click', game.setFaction);
    _.byId('medic').addEventListener('click', game.setFaction);
  },

  show: function() {
    this.chooseFaction.classList.add('show');
  },

  hide: function() {
    this.chooseFaction.classList.remove('show');
  }
};


module.exports = chooseFaction;
