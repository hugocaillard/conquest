'use strict';

var passport = require('koa-passport');
var bcrypt   = require('bcrypt-nodejs');
var co       = require('co');

var users = require(__dirname+'/db').users;


passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(user, done) {
  done(null, user)
});

var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(function (username, password, done) {
  username = username.replace(/^\s+|\s+$/g, '');
  username = username.toLowerCase();

  co(function*() {
    var user = yield users.findOne({ slug: username });
    if (user) {
      if (bcrypt.compareSync(password, user.password))
        return (null, user);
      else
        return (null, false);
    }
    else
      return (null, false);
  })(done)
}));

// TODO : Facebook & Twitter strategies
