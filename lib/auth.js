var passport = require('koa-passport');
var localStrategy = require('passport-local').Strategy;

// -----------
// TESTS

var user = { id: 1, username: 'Cohars' };

module.exports.login = function(data) {
  passport.use(new localStrategy(function(username, password, done) {
    if (data.username === 'Cohars' && data.password === 'pcw123') {
      //done(null, user)
    } else {
      //done(null, false)
    }
  }));
};
