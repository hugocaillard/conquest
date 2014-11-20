var _ = require('../tools.js');

var panels = {
  init: function() {
    var self = this;
    // player panel DOM
    self.player         = _.byId('player');
    self.playerFaction  = _.byId('faction');
    self.playerLevel    = _.$$('#level>.value');
    self.playerXP       = _.$$('#xp>.value');
    self.playerLife     = _.$$('#life>.value');
    self.playerDmg      = _.$$('#damages>.value');
    self.playerCapt     = _.$$('#capt-pts>.value');
    self.playerHeal     = _.$$('#heal-pts>.value');
    self.playerUpgrades = _.$('#player>div>.upgrade');

    // scores DOM element
    self.scoreAlpha = _.byId('#scoreAlpha');
    self.scoreBeta  = _.byId('#scoreBeta');
    self.scoreGamma = _.byId('#scoreGamma');
  },


  // ––– Player Spec function
  setPlayerLife: function(d) {
    this.playerLife.innerHTML = d;
  },

  setPlayerSpecs: function(faction, d) {
    var self = this;
    if (!self.player.classList.contains('show'))
      self.player.classList.add('show');

    self.playerFaction.innerHTML = faction;
    self.playerLevel.innerHTML   = d.level;
    self.playerXP.innerHTML      = d.xp + '/'+ d.level*100;
    self.playerLife.innerHTML    = d.life + '/' + d.maxLife;
    self.playerDmg.innerHTML     = d.dmg;
    self.playerCapt.innerHTML    = d.capt;
    self.playerHeal.innerHTML    = d.heal;

    if (d.skillPts && !self.playerUpgrades[0].classList.contains('show'));
      self.showUpgradePlayer();
  },

  hidePlayerPanel: function() {
    if (this.player.classList.contains('show'))
      this.player.classList.remove('show');
  },

  showUpgradePlayer: function() {
    _.elLoop(this.playerUpgrades, function(el) {
      el.classList.add('show');
    });
  },

  // ––– Scores functions
  updateScores: function(d) {

  }
};


module.exports = panels;
