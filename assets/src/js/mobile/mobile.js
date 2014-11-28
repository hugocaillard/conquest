var _ = require('./tools.js');

var mobile = {
  positionName: null,
  turretPosition: null,
  canSpawn: false,
  gold: 0,
  life: 0,
  maxLife: 0,
  dmg: 0,

  // DOM ELEMENTS
  $sector   : _.byId('sector'),
  $deploy   : _.byId('deploy'),
  $getBack  : _.byId('get-back'),
  $gold     : _.byId('gold'),
  $lifeGrade: _.byId('life-grade'),
  $upLife   : _.byId('up-life'),
  $dmgGrade : _.byId('dmg-grade'),
  $upDmg    : _.byId('up-dmg'),
  $lifeBar : _.$$('#life-bar>div'),

  init: function() {
    var self = this;
    self.socket = io(window.location.hostname);
    self.socket.on('joined', function(d) {
      _.byId('skills').classList.add(d.owner.team);
      self.positionName = d.position;
      self.gold = d.owner.gold;
      self.updateUI();
    });
    self.socket.on('notjoined', function(d) {
      window.location.href = '/';
    });

    self.socket.on('update', function(d) {
      self.turretPosition = d.position;
      self.life = d.life;
      self.maxLife = d.maxLife;
      self.dmg = d.dmg;
      self.updateUI();
    });
    self.socket.on('position', function(d) {
      self.positionName = d.position;
      self.canSpawn = d.canSpawn;
      self.updateUI();
    });
    self.socket.on('gold', function(d) {
      self.gold = d.gold;
      self.updateUIGold();
    });


    self.$deploy.addEventListener('click', function() {
      if (!this.classList.contains('inactive'))
        self.socket.emit('deploy');
    });

    self.$getBack.addEventListener('click', function() {
      if (!this.classList.contains('inactive'))
        self.socket.emit('getBack');
    });

    self.$upDmg.addEventListener('click', function() {
      self.socket.emit('upDmg');
    });
    self.$upLife.addEventListener('click', function() {
      self.socket.emit('upLife');
    });
  },

  updateUI: function() {
    var self = this;
    self.$sector.innerHTML = self.positionName;
    if (!self.positionName || self.positionName.indexOf(' ') > -1)
      self.$sector.classList.add('light');
    else
      self.$sector.classList.remove('light');

    if (self.canSpawn && self.turretPosition == null)
      self.$deploy.classList.remove('inactive');
    else
      self.$deploy.classList.add('inactive');

    if (self.turretPosition != null)
      self.$getBack.classList.remove('inactive');
    else
      self.$getBack.classList.add('inactive');

    self.updateUIGold();


    self.$dmgGrade.innerHTML = self.dmg,
    self.$lifeGrade.innerHTML = self.maxLife/10,

    self.$lifeBar.style.width = (self.life/self.maxLife*100)+'%';
  },

  updateUIGold: function() {
    var self = this;
    self.$gold.innerHTML = self.gold;
    if (self.gold > 0) {
      self.$upDmg.classList.add('show');
      self.$upLife.classList.add('show');
    }
    else {
      self.$upDmg.classList.remove('show');
      self.$upLife.classList.remove('show');
    }

  }
}

document.addEventListener('DOMContentLoaded', function() {
  mobile.init();
});