var _ = require('../tools.js');

var turret = {
  init: function() {
    var url = encodeURI('http://api.qrserver.com/v1/create-qr-code/?data=http://google.com&size=256x256');
    _.get(url, function(d) {
      console.log(d);
    });

  }
}

module.exports = turret;
