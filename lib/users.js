'use strict';
var path = require('path');

var passport = require('koa-passport');
var bcrypt   = require('bcrypt-nodejs');
var co       = require('co');
var Bitly    = require('bitly');

var app   = require(path.join(__dirname, '../server'));
var db    = require(__dirname+'/db');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport(smtpTransport({
    host: app.config.mail.host,
    secure: true,
    auth: {
        user: app.config.mail.user,
        pass: app.config.mail.pass
    }
}));

// auth
module.exports.login = function*(next) {
  var ctx = this;
  ctx.body = ctx.request.body;
  yield* passport.authenticate('local', function*(err, user, info) {
    if (err) throw err;
    if (user === false) {
      ctx.status = 401;
      ctx.body = {logged: false};
    }
    else if (user.confirmed) {
      yield ctx.login(user);
      ctx.body = {logged: true};
    }
  }).call(this, next);
};

module.exports.logout = function*(next) {
  this.req.logout();
  this.redirect('/');
};

module.exports.activate = function*(next) {
  var ctx = this;
  var key = yield db.activationCodes.findOne({key: this.params['key']});
  if (key) {
    var userID = key.userID;
    var user = yield db.users.findAndModify({ _id: userID }, { $set: {confirmed: true} });
    db.activationCodes.remove({ _id: key._id });
    if (user)
      yield ctx.login(user);
    this.redirect('/game');
    return;
  }
  this.redirect('/');
};

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
    var checkUsername = yield db.users.findOne({ slug: user.slug });
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
    var checkEmail = yield db.users.findOne({ email: user.email });
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
      var insertedUser = yield db.users.insert(user);

      var existing = null;
      do {
        token = Math.round(Math.random()*1000*user.username.length);
        token = bcrypt.hashSync(user.username + token + app.config.activationkey).replace(/\//g, '-');
        existing = yield db.activationCodes.findOne({key: token});
      } while (existing);
      var url = 'http://conquest.io/activate/'+token;

      var mailOptions = {
        from: 'Register Conquest <conquest.io.game@gmail.com>',
        to: user.email,
        subject: 'Conquest Activation Code',
        text: 'Hello '+user.username+', Click the following link <a href="'+url+'">'+url+'</a> or copy/paste it. Have fun on conquest! The Conquest Team @ConquestioGame contact@conquest.io',
        html: '<p>Hello '+user.username+',</p> <p>Click or copy/paste the following link: <br><a href="'+url+'">'+url+'</a></p> <p>Have fun on Conquest!</p><p>The Conquest Team <br><a href="http://twitter.com/ConquestioGame">@ConquestioGame</a><br><a href="mailto:contact@conquest.io">Contact</a></p>'
      };

      transporter.sendMail(mailOptions, function(error, info) {
        if(error)
          console.log(error);
        else
          console.log('Message sent: ' + info.response);
      });

      var insertedCode = yield db.activationCodes.insert({
        userID: insertedUser._id,
        key: token
      });
      return;
    })();
  });

  ctx.body = {success: true, message: 'Your account has been created. Please check your emails to activate it.'};
};
