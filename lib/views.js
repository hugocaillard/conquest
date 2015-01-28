'use strict';
var fs           = require('fs');
var path         = require('path');
var MobileDetect = require('mobile-detect');


var db   = require(path.join(__dirname, 'db'));
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

var views = {
  // GAME VIEWS
  home: function* () {
    var md = new MobileDetect(this.request.headers['user-agent']);
    if (!md.mobile()) {
      if (this.req.user) {
        var user = yield db.users.findOne({ _id: this.req.user });
        if (user) {
          if (user.email === conf.superadmin) {
            this.redirect('/admin');
            return;
          }
          this.redirect('/lobby');
          return;
        }
      }
      yield this.render('landing', {title: 'Conquest'});
      return;
    }
    else {
      yield this.render('mobile/home', {title: 'Conquest'});
      return;
    }
  },

  lobby: function* () {
    yield this.render('lobby', {title: 'Conquest | Lobby'});
    return;
  },

  about: function* () {
    yield this.render('about', {title: "Conquest | About"});
    return;
  },

  game: function* () {
    if (this.req.user) {
      var user = yield db.users.findOne({ _id: this.req.user });
      if (user) {
        if (user.email === conf.superadmin) {
          this.redirect('/admin/map');
          return;
        }
        yield this.render('game', {title: 'Conquest'});
        return;
      }
    }
    this.redirect('/');
    return;
  },

  // MOBILE VIEW
  mobile: function* () {
    var md = new MobileDetect(this.request.headers['user-agent']);
      if (this.params['token']) {
        var user = yield db.users.findOne({ token: this.params['token'] });
        if (user) {
          this.cookies.set('turret', this.params['token']);
          yield this.render('mobile/turret', {title: 'Mobile', script: true});
          return;
        }
      }
    this.redirect('/');
    return;
  },

  // ADMIN VIEWS
  admin: function* () {
    if (this.req.user) {
      var user = yield db.users.findOne({ _id: this.req.user });
      if (user && user.email === conf.superadmin) {
        yield this.render('admin/admin', {});
        return;
      }
    }
    this.redirect('/');
    return;
  },
  adminMap: function* () {
    if (this.req.user) {
      var user = yield db.users.findOne({ _id: this.req.user });
      if (user && user.email === conf.superadmin) {
        yield this.render('admin/admin-map', {});
        return;
      }
    }
    this.redirect('/');
    return;
  }
};


module.exports = views;
