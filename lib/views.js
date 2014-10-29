'use strict';

var fs = require('fs');
var path = require('path');

// get html files
function readFileThunk(src) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path.join(__dirname, src), {'encoding': 'utf8'}, function (err, data) {
      if(err) return reject(err);
      resolve(data);
    });
  });
}

module.exports.home = function* () {
  if (this.req.user) {
    this.redirect('/game');
    return;
  }
  else {
    this.body = yield readFileThunk('../views/index.html');
    return;
  }
};
module.exports.game = function* () {
  if (this.req.user) {
    this.body = yield readFileThunk('../views/game.html');
    return;
  }
  else {
    this.redirect('/');
    return;
  }
};
