var _ = require('../tools.js');

var panels = {
  init: function() {
    var self = this;
    // player panel DOM elements
    self.player         = _.byId('player');
    self.playerFaction  = _.byId('faction');
    self.playerLevel    = _.$$('#level>.value');
    self.playerXP       = _.$$('#xp>.value');
    self.playerLife     = _.$$('#life>.value');
    self.playerDmg      = _.$$('#damages>.value');
    self.playerCapt     = _.$$('#capt-pts>.value');
    self.playerHeal     = _.$$('#heal-pts>.value');
    self.playerUpgrades = _.$('#player>div>.upgrade');

    // tile panel DOM elements
    self.tile          = _.byId('tile');
    self.sector        = _.byId('tile-sector');
    self.captState     = _.byId('capt-state');
    self.soldiersStats  = {
      alpha: _.$$('#tile-soldiers>.alpha'),
      beta : _.$$('#tile-soldiers>.beta'),
      gamma: _.$$('#tile-soldiers>.gamma')
    };
    self.engineersStats = {
      alpha: _.$$('#tile-engineers>.alpha'),
      beta : _.$$('#tile-engineers>.beta'),
      gamma: _.$$('#tile-engineers>.gamma')
    };
    self.medicsStats    = {
      alpha: _.$$('#tile-medics>.alpha'),
      beta : _.$$('#tile-medics>.beta'),
      gamma: _.$$('#tile-medics>.gamma')
    };

    // scores DOM elements
    self.scoreAlpha = _.byId('#scoreAlpha');
    self.scoreBeta  = _.byId('#scoreBeta');
    self.scoreGamma = _.byId('#scoreGamma');
  },


  /**
    * Player Spec functions
  */
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

  /**
    * Tiles data functions
  */
  setTileStats: function(d) {
    var self = this;
    self.sector.innerHTML = d.name;
    self.setFactionsStats(d);
    if (d.scores.alpha)
      self.setScoreDisplay('alpha', d.scores.alpha);
    else if (d.scores.beta)
      self.setScoreDisplay('beta', d.scores.beta);
    else if (d.scores.gamma)
      self.setScoreDisplay('gamma', d.scores.gamma);
    else
      self.setScoreDisplay(null, 0);
  },

  setFactionsStats: function(d) {
    var self = this;
    var count = {
      alpha: {
        soldiers: 0,
        engineers: 0,
        medics: 0
      },
      beta: {
        soldiers: 0,
        engineers: 0,
        medics: 0
      },
      gamma: {
        soldiers: 0,
        engineers: 0,
        medics: 0
      },
    };
    for (var team in d.players) {
      for (var player in d.players[team]) {
             if (d.players[team][player] === 'soldier')   count[team].soldiers++;
        else if (d.players[team][player] === 'medic')     count[team].medics++;
        else if (d.players[team][player] === 'engineer')  count[team].engineers ++;
      }
      self.soldiersStats[team].innerHTML  = count[team].soldiers;
      self.engineersStats[team].innerHTML = count[team].engineers;
      self.medicsStats[team].innerHTML    = count[team].medics;
    }
  },

  setScoreDisplay: function(team, score) {
    var self = this;
    if (team) {
      if (!self.captState.classList.contains(team)) {
        self.captState.classList.remove('alpha', 'beta', 'gamma');
        self.captState.classList.add(team);
      }
    }
    else {
      self.captState.classList.remove('alpha', 'beta', 'gamma');
    }
    self.captState.innerHTML = score;
  },


  /**
    * Scores functions
  */
  updateScores: function(d) {

  }
};


module.exports = panels;
