var _ = require('./tools.js');

var socket = io('http://localhost');


var users = {
  loginHandler: function(resData) {
    console.log(resData);
  }
};

document.addEventListener('DOMContentLoaded', function(){
  // authentification is handled with AJAX
  var data = {
    username: 'Cohars',
    password: 'pcw123'
  };
  _.post('/users/login', data, users.loginHandler);

  // game data uses socket.io
  socket.on('init', function(resData) {
    console.log(resData.message);

    socket.on('message', function(resData) {
      console.log(resData.message);
    });
  });
});