var _ = require('../tools.js');

var turret = {
  init: function(bitly) {
    _.attr(_.byId('qrcode'), 'src',
          'https://api.qrserver.com/v1/create-qr-code/?data='+bitly+'&size=100x100&color=fff&bgcolor=000');
    _.byId('bitly').innerHTML = bitly;
  }
}

module.exports = turret;
