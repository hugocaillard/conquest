var passport = require('koa-passport');

var user = {id: 1, username: 'Cohars'};

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  done(null, user);
});

var localStrategy = require('passport-local').Strategy;
passport.use(new localStrategy(function(username, password, done) {
  // TODO : get user from db
  if (username === 'Cohars' && password === 'pcw123')
    done(null, user);
  else
    done(null, false);
}));

// TODO : Facebook & Twitter strategies
