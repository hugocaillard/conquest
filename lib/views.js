'use strict';

var fs   = require('fs');
var path = require('path');
var MobileDetect = require('mobile-detect');

var db = require(path.join(__dirname, 'db'));
var app  = require(path.join(__dirname, '../server.js'));
var conf = app.config;

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
  var md = new MobileDetect(this.request.headers['user-agent']);
  if (!md.mobile()) {
    if (this.req.user) {
      var user = yield db.users.findOne({ _id: this.req.user });
      if (user) {
        if (user.email === conf.superadmin) {
          this.redirect('/admin');
          return;
        }
        this.redirect('/game');
        return;
      }
    }
    this.body = yield readFileThunk('../views/index.html');
    return;
  }
  else {
    this.body = yield readFileThunk('../views/mobile/home.html');
    return;
  }
};
module.exports.game = function* () {
  if (this.req.user) {
    var user = yield db.users.findOne({ _id: this.req.user });
    if (user) {
      if (user.email === conf.superadmin) {
        this.redirect('/admin/map');
        return;
      }
      this.body = yield readFileThunk('../views/game.html');
      return;
    }
  }
  this.redirect('/');
  return;
};
module.exports.admin = function* () {
  if (this.req.user) {
    var user = yield db.users.findOne({ _id: this.req.user });
    if (user && user.email === conf.superadmin) {
      this.body = yield readFileThunk('../views/admin.html');
      return;
    }
  }
  this.redirect('/');
  return;
};

module.exports.adminMap = function* () {
  if (this.req.user) {
    var user = yield db.users.findOne({ _id: this.req.user });
    if (user && user.email === conf.superadmin) {
      this.body = yield readFileThunk('../views/admin-map.html');
      return;
    }
  }
  this.redirect('/');
  return;
};
