var _ = require('../tools.js');

var tuto = {
  init: function() {
    var self = this;

    self.container = _.byId('img-container');
    self.tuto      = _.byId('tuto');
    self.next      = _.byId('next-slide')
    self.previous  = _.byId('previous-slide')

    self.next.addEventListener('click', function() {
      var index = _.attr(self.container, 'data-index');
      if (index<7) {
        self.previous.classList.remove('hide');
        _.attr(self.container, 'data-index', parseInt(index)+1);
      }
      if (index==6)
        this.classList.add('hide');
    }, true);

    self.previous.addEventListener('click', function() {
      var index = _.attr(self.container, 'data-index');
      if (index>1) {
        self.next.classList.remove('hide');
        _.attr(self.container, 'data-index', parseInt(index)-1);
      }
      if (index==2)
        this.classList.add('hide');
    });

    _.byId('quit-slide').addEventListener('click', function() {
      self.tuto.classList.remove('show');
    });

    _.byId('show-slide').addEventListener('click', function(e) {
      e.preventDefault();
      self.tuto.classList.add('show');
    });

    self.tuto.addEventListener('click', function() {
      self.tuto.classList.remove('show');
    });

    self.container.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
};

module.exports = tuto;
