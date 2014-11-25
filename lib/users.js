'use strict';
var path = require('path');

var passport = require('koa-passport');
var bcrypt   = require('bcrypt-nodejs');
var co       = require('co');
var Bitly    = require('bitly');

var app   = require(path.join(__dirname, '../server'));
var users = require(__dirname+'/db').users;

// auth
module.exports.login = function*(next) {
  var ctx = this;
  ctx.body = ctx.request.body;

  yield* passport.authenticate('local', function*(err, user, info) {
    if (err) throw err;
    if (user === false) {
      ctx.status = 401;
      ctx.body = { logged: false };
    }
    else {
      yield ctx.login(user);
      ctx.body = {logged: true, user: user};
    }
  }).call(this, next);
};

module.exports.logout = function*(next) {
  this.req.logout();
  this.redirect('/');
}

// Register
module.exports.register = function*(next) {
  var ctx = this;
  var user = ctx.request.body;

  user.slug = user.username.replace(/[\/|&;$%@"'<>{}()+,]/g, '');
  user.slug = user.slug.toLowerCase();
  user.username = user.username.replace(/[\/|&;$%@"'<>{}()+,]/g, "");

  // username
  if (!user.slug || user.slug.length<=2) {
    ctx.body = {
      success: false,
      error: 'Username too short',
      fieldName: 'username'
    };
    return;
  }
  if (user.slug) {
    var checkUsername = yield users.findOne({ slug: user.slug });
    if (checkUsername !== null) {
      ctx.body = {
        success: false,
        error: 'Username already taken',
        fieldName: 'username'
      };
      return;
    }
  }

  // password
  if (user.password && user.password.length>=6) {
    user.password =  bcrypt.hashSync(user.password);
  }
  else {
    ctx.body = {
      success: false,
      error: "Password to short",
      fieldName: 'password'
    };
    return;
  }

  // email
  var r =  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!user.email && !r.test(user.email)) {
    ctx.body = {
      success: false,
      error: 'Invalid email',
      fieldName: 'email'
    };
    return;
  }
  else {
    var checkEmail = yield users.findOne({ email: user.email });
    if (checkEmail !== null) {
      ctx.body = {
        success: false,
        error: 'email already taken',
        fieldName: 'email'
      };
      return;
    }
  }

  user.createdAt = Date.now();
  user.confirmed = false;
  user.admin = false;
  user.games = [];

  var token = Math.round(Math.random()*10000);
  user.token = bcrypt.hashSync(user.email + token + app.config.mobilesecret).replace(/\//g, '-');

  var bitly = new Bitly(app.config.bitly.username, app.config.bitly.token);
  bitly.shorten('http://conquest.io/mobile/'+user.token, function(err, response) {
    if (err) throw err;
    user.bitly = response.data.url;

    co(function *() {
      var insertedUser = yield users.insert(user);
      return;
    })();
  });

  ctx.body = {success: true, message: 'User created'};
};
