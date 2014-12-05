'use strict';
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
      var users = yield db.users.find({slug: req}, {limit: 50});
      var registered = yield db.users.count({});
      var confirmed = yield db.users.count({"confirmed": true});
      ctx.body = {
        users: users,
        registered: registered,
        confirmed: confirmed
      };
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
  },

  deleteUser: function *(next) {
    var ctx = this;
    var user = yield db.users.findOne({_id: ctx.req.user});

    if (user.email === conf.superadmin) {
      var user = yield db.users.remove({ _id:  ctx.request.body.id });
      ctx.body = user;
    }
  }
};


module.exports = admin;