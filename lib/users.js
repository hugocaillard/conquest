var passport = require('koa-passport');

var app  = require('../server.js');


// auth
module.exports.login = function*(next) {
  var ctx = this;

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
