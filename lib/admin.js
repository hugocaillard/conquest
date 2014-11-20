var path = require('path');
var db = require(path.join(__dirname, './db'));

var app  = require(path.join(__dirname, '../server.js'));
var conf = app.config;

var admin = {
  getUsers: function *(next) {
    var ctx = this;
    var user = yield db.users.findOne({_id: ctx.req.user});

    if (user.email === conf.superadmin) {
      var req = new RegExp(ctx.request.body.userReq, 'i');
      var users = yield db.users.find({slug: req}, {limit: 2});
      ctx.body = users;
    }
  },

  updateUser: function *(next) {
    var ctx = this;
    var user = yield db.users.findOne({_id: ctx.req.user});

    if (user.email === conf.superadmin) {
      var update = ctx.request.body;
      var user = yield db.users.findAndModify({ _id: update.id }, { $set: update.data });
      ctx.body = user;
    }
  }
};


module.exports = admin;