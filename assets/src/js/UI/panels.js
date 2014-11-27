'use strict';

var _      = require('../tools.js');
var sockets = require('../sockets.js');

var panels = {
  init: function(team) {
    var self = this;

    self.leftPanel      = _.byId('left-panel');
    self.connectTurret  = _.byId('connect-turret');
    // player panel DOM elements
    self.player         = _.byId('player-infos');
    self.playerFaction  = _.byId('player-class');
    self.factionIcon    = _.byId('faction-icon');
    self.playerLevel    = _.byId('number-level');
    self.playerSkills   = _.byId('skill-points');
    self.playerXP       = _.$$('#xp-progress>span');
    self.playerLife     = _.byId('life-grade');
    self.playerDmg      = _.byId('dmg-grade');
    self.playerCapt     = _.byId('capt-grade');
    self.playerHeal     = _.byId('healing-grade');
    self.playerUpgrades = _.$('.left-panel .upgrade');

    // tile panel DOM elements
    self.tile          = _.byId('tile');
    self.sector        = _.byId('tile-sector');
    self.captState     = _.byId('capt-state');
    self.captProgress  = _.byId('capt-progress');
    self.sectorName   = _.$$('.right-panel .sector-name')
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
    self.scoreAlpha = _.byId('score-alpha');
    self.scoreBeta  = _.byId('score-beta');
    self.scoreGamma = _.byId('score-gamma');

    // time DOM
    self.duration  = _.byId('duration');
    self.countdown = _.byId('countdown');

    // animate left panel
    self.setListeners();
  },

  setTeam: function(team, countdown) {
    if (countdown) _.$$('.countdown').classList.add(team, 'show');
    _.$$('.loader-container').classList.remove('show');
    _.$$('#left-panel').classList.add(team);
    _.$$('#overlays').classList.add(team);
    _.$$('#right-panel').classList.add(team);
    _.$$('.choose-faction').classList.add(team);
    _.$$('.connect-turret').classList.add(team);
  },

  setListeners: function() {
    var self = this;
    _.$$('#hide-panel-tab').addEventListener('click', function() {
      this.classList.toggle('rotate');
      self.leftPanel.classList.toggle('hide-panel');
    });


    _.$$('#deploy-turret').addEventListener('click', function() {
      self.connectTurret.classList.toggle('show');
    });
    _.$$('.close-turret').addEventListener('click', function() {
      self.connectTurret.classList.toggle('show');
    });

    _.elLoop(self.playerUpgrades, function(el) {
      el.addEventListener('click', sockets.upgrade);
    });
  },

  setTick: function(tick) {
    var self = this;
    var time = self.computeTime(tick*2/10);
    if (self.duration.innerHTML != time) self.duration.innerHTML = time;
  },

  setCountdown: function(count) {
    var self = this;
    var time = self.computeTime(count);
    if (self.countdown.innerHTML != time) self.countdown.innerHTML = time;
  },

  computeTime: function(duration) {
    var sec_num = parseInt(duration, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
  },

  /**
    * Player Spec functions
  */
  showName: function(name) {
    _.byId('player-name').innerHTML = name;
  },

  setPlayerLife: function(d) {
    var index = this.playerLife.innerHTML.indexOf('/');
    if (index > -1 && this.playerLife.innerHTML[0] != 0) {
      var lifeString =  this.playerLife.innerHTML.slice(index);
      this.playerLife.innerHTML = d +lifeString;
    }
  },

  setPlayerSpecs: function(faction, d) {
    var self = this;
    self.player.classList.add('show');

    if (!self.factionIcon.contains(faction)) {
      self.factionIcon.classList.remove('soldier', 'engineer', 'medic');
      self.factionIcon.classList.add(faction);
    }
    self.playerFaction.innerHTML = faction;
    self.playerSkills.innerHTML  = (d.skillPts>1) ? d.skillPts+' skill points remaining' : d.skillPts+' skill point remaining';
    self.playerXP.style.width    = (d.xp/d.level)+'%';
    self.playerLevel.innerHTML   = d.level;
    self.playerLife.innerHTML    = d.life + '/' + d.maxLife;
    self.playerDmg.innerHTML     = d.dmg;
    self.playerCapt.innerHTML    = d.capt;
    self.playerHeal.innerHTML    = d.heal;

    // if (d.skillPts && !self.playerUpgrades[0].classList.contains('show'));
    //   self.showUpgradePlayer();
  },

  showUpgradePlayer: function() {
    if (!this.playerUpgrades[0].classList.contains('show'))
      _.elLoop(this.playerUpgrades, function(el) {
        el.classList.add('show');
      });
  },
  hideUpgradePlayer: function() {
    if (this.playerUpgrades[0].classList.contains('show'))
      _.elLoop(this.playerUpgrades, function(el) {
        el.classList.remove('show');
      });
  },

  /**
    * Tiles data functions
  */
  setTileStats: function(d) {
    var self = this;
    if (d.name.indexOf(' ') > -1)
      self.sectorName.classList.add('light');
    else
      self.sectorName.classList.remove('light');
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
      if (!self.captProgress.classList.contains(team)) {
        self.captProgress.classList.remove('alpha', 'beta', 'gamma');
        self.captProgress.classList.add(team);
      }
    }
    else {
      self.captProgress.classList.remove('alpha', 'beta', 'gamma');
    }
    self.captProgress.style.width = score+'%';
    self.captState.innerHTML = score;
  },


  /**
    * Scores functions
  */
  updateScores: function(scores) {
    var self = this;
    var scoreA = scores.alpha/scores.toReach*100;
    var scoreB = scores.beta/scores.toReach*100;
    var scoreG = scores.gamma/scores.toReach*100;

    if (self.scoreAlpha.style.width != scoreA)
      self.scoreAlpha.style.width = (scoreA <= 100) ? scoreA+'%' : '100%';
    if (self.scoreBeta.style.width  != scoreB)
      self.scoreBeta.style.width  = (scoreB <= 100) ? scoreB+'%' : '100%';
    if (self.scoreGamma.style.width != scoreG)
      self.scoreGamma.style.width = (scoreG <= 100) ? scoreG+'%' : '100%';
  },


  displayVictory: function() {
    _.byId('victory').classList.add('show');
    setTimeout(function() {
      window.location.href = "/lobby";
    }, 3000);
  },

  displayDefeat: function() {
    _.byId('defeat').classList.add('show');
    setTimeout(function() {
      window.location.href = "/lobby";
    }, 3000);
  }
};


module.exports = panels;
