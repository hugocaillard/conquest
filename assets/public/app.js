(function outer(modules, cache, entries){

  /**
   * Global
   */

  var global = (function(){ return this; })();

  /**
   * Require `name`.
   *
   * @param {String} name
   * @param {Boolean} jumped
   * @api public
   */

  function require(name, jumped){
    if (cache[name]) return cache[name].exports;
    if (modules[name]) return call(name, require);
    throw new Error('cannot find module "' + name + '"');
  }

  /**
   * Call module `id` and cache it.
   *
   * @param {Number} id
   * @param {Function} require
   * @return {Function}
   * @api private
   */

  function call(id, require){
    var m = cache[id] = { exports: {} };
    var mod = modules[id];
    var name = mod[2];
    var fn = mod[0];

    fn.call(m.exports, function(req){
      var dep = modules[id][1][req];
      return require(dep ? dep : req);
    }, m, m.exports, outer, modules, cache, entries);

    // expose as `name`.
    if (name) cache[name] = cache[id];

    return cache[id].exports;
  }

  /**
   * Require all entries exposing them on global if needed.
   */

  for (var id in entries) {
    if (entries[id]) {
      global[entries[id]] = require(id);
    } else {
      require(id);
    }
  }

  /**
   * Duo flag.
   */

  require.duo = true;

  /**
   * Expose cache.
   */

  require.cache = cache;

  /**
   * Expose modules
   */

  require.modules = modules;

  /**
   * Return newest require.
   */

   return require;
})({
1: [function(require, module, exports) {
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
}, {}]}, {}, {"1":""})
