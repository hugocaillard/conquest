'use strict';

var app = require('../server');
var dbConf = app.config.db;

var monk = require('monk');
var wrap = require('co-monk');

// mongodb://admin:123456@localhost:27017
var conf = [
  'mongodb://',
  dbConf.user, // has to be 'admin:' not just 'admin'
  dbConf.pass,
  '@',
  dbConf.host,
  ':',
  dbConf.port
].join('');

var db = monk(conf+'/conquest');

module.exports.users = wrap(db.get("users"));
