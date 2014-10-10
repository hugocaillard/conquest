var passport = require('koa-passport');
var bcrypt = require('bcrypt-nodejs');
var co = require('co');


var users = require('./db').users;


passport.serializeUser(function(user, done) {
  done(null, user.id)
});

passport.deserializeUser(function(id, done) {
  done(null, user)
});

function* getUser(username) {
  return
};


var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(co(function* (email, password, done) {
  var user = yield users.findOne({ email: email });


  if (user) {
    if (email === user.email && bcrypt.compareSync(password, user.password)) {
      console.log('hello');
      done(null, user);
    }
    else
      done(null, false);
  }
  else
    done(null, false);
})));

// TODO : Facebook & Twitter strategies
