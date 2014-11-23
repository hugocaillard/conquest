var _ = require('../tools.js');

var sounds = {
  init: function() {
    var self = this;
    /** SELECT DOM ELEMENTS */
    self.factionHover = _.byId('s-faction-hover');
    self.factionSelected = _.byId('s-faction-selected');
  },

  pFactionHover: function() {
    sounds.factionHover.src = sounds.factionHover.src;
    sounds.factionHover.play();
  },
  pFactionSelected: function() {
    sounds.factionSelected.src = sounds.factionSelected.src;
    sounds.factionSelected.play();
  }
};


module.exports = sounds;
