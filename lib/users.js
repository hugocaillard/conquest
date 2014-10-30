'use strict';
var path = require('path');

var passport = require('koa-passport');
var bcrypt   = require('bcrypt-nodejs');
var co       = require('co');

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

// Register
module.exports.register = function*(next) {
  var ctx = this;
  var user = ctx.request.body;

  // username
  if (!user.username || user.username.length<=2) {
    ctx.body = {
      success: false,
      error: 'Username too short',
      fieldName: 'username'
    };
    return;
  }
  if (user.username) {
    var checkUsername = yield users.findOne({ username: user.username });
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
    ctx.body = {error: "Password to short"};
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

  var insertedUser = yield users.insert(user);
  ctx.body = {success: true, message: 'User created'};
};
