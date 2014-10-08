(function(window, document, undefined) {
  var tools =  {
    ajax: {
      post: function(url, data) {
        var request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.send(data);
        request.onload = function() {
          if (request.status >= 200 && request.status < 400){
            console.log(request.responseText);
          }
          else {
            console.log('error');
          }
        };
      }
    }
  };


  "use strict";
  var socket = io('http://localhost');

  document.addEventListener('DOMContentLoaded', function(){
    socket.on('init', function(resData) {
      console.log(resData.message);

      tools.ajax.post('/user/test', {
        username: 'Cohars',
        password: 'pcw123'
      });

      // socket.emit('login', {
      //   username: 'Cohars',
      //   password: 'pcw123'
      // });
    });
  });

})(window, window.document);