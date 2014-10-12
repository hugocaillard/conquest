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
  this.body = yield readFileThunk('../views/index.html');
};
module.exports.game = function* () {
  this.body = yield readFileThunk('../views/game.html');
};
