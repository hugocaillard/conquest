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
var _ = require('../tools.js');

var mobile = {
  init: function() {
    var self = this;
    self.socket = io(window.location.hostname);

    self.socket.on('joined', function(d) {
      console.log(d);
    });
    self.socket.on('notjoined', function(d) {
      console.log(d);
    });


    _.byId('deploy').addEventListener('click', function() {
      self.socket.emit('deploy');
    });

    _.byId('get-back').addEventListener('click', function() {
      self.socket.emit('getBack');
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  mobile.init();
});
}, {"../tools.js":2}],
2: [function(require, module, exports) {
// Our library of useful functions.

/**
  * dom manipulation and selectors
*/
var _ = module.exports;
module.exports.byClass = function(className) {
  return document.getElementsByClassName(className);
};

module.exports.byId = function(idName) {
  return document.getElementById(idName);
};

module.exports.$ = function(selector) {
  return document.querySelectorAll(selector);
};

module.exports.$$ = function(selector) {
  return document.querySelector(selector);
};

module.exports.elLoop = function(array, cb) {
  for (var i=0; i<array.length; i++) {
    cb(array[i]);
  }
};

module.exports.previous = function(el) {
  var p = el.previousSibling;
  do p = p.previousSibling;
  while (p && p.nodeType != 1);
  return p;
};

module.exports.attr = function attr(el, attr, value) {
  if (value)
    return el.setAttribute(attr, value);
  else
    return el.getAttribute(attr);
};

module.exports.getWindowWidth = function() {
  return window.innerWidth || document.documentElement.clientWidth;
};

module.exports.getWindowHeight = function() {
  return window.innerHeight|| document.documentElement.clientHeight;
};


/**
  * AJAX functions
*/
module.exports.post = function(url, data, cb) {
  var request = new XMLHttpRequest();
  request.open('POST', url, true);
  request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  request.onreadystatechange = function() {
    if(this.readyState == this.DONE) {
      if (request.status >= 200 && request.status < 400) {
        if (cb) {
          cb.call(this, JSON.parse(request.response));
        }
        else
          console.log(JSON.parse(request.response));
      }
      else
        console.log('error');
    }
  };

  request.send(JSON.stringify(data));
};

module.exports.get = function(url, cb) {
  request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400){
      cb.call(this,JSON.parse(request.responseText));
    } else {
      console.log('An error happened while getting %s.', url)
    }
  };

  request.onerror = function() {
    console.log('An error happened while getting %s.', url)
  };

  request.send();
}

/**
  * forms and data functions
*/
module.exports.serialize = function(form) {
  var inputs = form.children;
  var data = {};
  var el, name;
  for (var i=0; i<inputs.length; i++) {
    el = inputs[i];
    name = _.attr(el, 'name');

    if (name && el.value.length>1)
      data[name] = el.value;
  }

  if (Object.keys(data).length > 0)
    return data;
  else
    return false;
};

}, {}]}, {}, {"1":""})

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlcXVpcmUuanMiLCJhc3NldHMvc3JjL2pzL21vYmlsZS9tb2JpbGUuanMiLCJhc3NldHMvc3JjL2pzL3Rvb2xzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gb3V0ZXIobW9kdWxlcywgY2FjaGUsIGVudHJpZXMpe1xuXG4gIC8qKlxuICAgKiBHbG9iYWxcbiAgICovXG5cbiAgdmFyIGdsb2JhbCA9IChmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfSkoKTtcblxuICAvKipcbiAgICogUmVxdWlyZSBgbmFtZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0ganVtcGVkXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHJlcXVpcmUobmFtZSwganVtcGVkKXtcbiAgICBpZiAoY2FjaGVbbmFtZV0pIHJldHVybiBjYWNoZVtuYW1lXS5leHBvcnRzO1xuICAgIGlmIChtb2R1bGVzW25hbWVdKSByZXR1cm4gY2FsbChuYW1lLCByZXF1aXJlKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nhbm5vdCBmaW5kIG1vZHVsZSBcIicgKyBuYW1lICsgJ1wiJyk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCBtb2R1bGUgYGlkYCBhbmQgY2FjaGUgaXQuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXF1aXJlXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gY2FsbChpZCwgcmVxdWlyZSl7XG4gICAgdmFyIG0gPSBjYWNoZVtpZF0gPSB7IGV4cG9ydHM6IHt9IH07XG4gICAgdmFyIG1vZCA9IG1vZHVsZXNbaWRdO1xuICAgIHZhciBuYW1lID0gbW9kWzJdO1xuICAgIHZhciBmbiA9IG1vZFswXTtcblxuICAgIGZuLmNhbGwobS5leHBvcnRzLCBmdW5jdGlvbihyZXEpe1xuICAgICAgdmFyIGRlcCA9IG1vZHVsZXNbaWRdWzFdW3JlcV07XG4gICAgICByZXR1cm4gcmVxdWlyZShkZXAgPyBkZXAgOiByZXEpO1xuICAgIH0sIG0sIG0uZXhwb3J0cywgb3V0ZXIsIG1vZHVsZXMsIGNhY2hlLCBlbnRyaWVzKTtcblxuICAgIC8vIGV4cG9zZSBhcyBgbmFtZWAuXG4gICAgaWYgKG5hbWUpIGNhY2hlW25hbWVdID0gY2FjaGVbaWRdO1xuXG4gICAgcmV0dXJuIGNhY2hlW2lkXS5leHBvcnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcXVpcmUgYWxsIGVudHJpZXMgZXhwb3NpbmcgdGhlbSBvbiBnbG9iYWwgaWYgbmVlZGVkLlxuICAgKi9cblxuICBmb3IgKHZhciBpZCBpbiBlbnRyaWVzKSB7XG4gICAgaWYgKGVudHJpZXNbaWRdKSB7XG4gICAgICBnbG9iYWxbZW50cmllc1tpZF1dID0gcmVxdWlyZShpZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcXVpcmUoaWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEdW8gZmxhZy5cbiAgICovXG5cbiAgcmVxdWlyZS5kdW8gPSB0cnVlO1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY2FjaGUuXG4gICAqL1xuXG4gIHJlcXVpcmUuY2FjaGUgPSBjYWNoZTtcblxuICAvKipcbiAgICogRXhwb3NlIG1vZHVsZXNcbiAgICovXG5cbiAgcmVxdWlyZS5tb2R1bGVzID0gbW9kdWxlcztcblxuICAvKipcbiAgICogUmV0dXJuIG5ld2VzdCByZXF1aXJlLlxuICAgKi9cblxuICAgcmV0dXJuIHJlcXVpcmU7XG59KSIsInZhciBfID0gcmVxdWlyZSgnLi4vdG9vbHMuanMnKTtcblxudmFyIG1vYmlsZSA9IHtcbiAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuc29ja2V0ID0gaW8od2luZG93LmxvY2F0aW9uLmhvc3RuYW1lKTtcblxuICAgIHNlbGYuc29ja2V0Lm9uKCdqb2luZWQnLCBmdW5jdGlvbihkKSB7XG4gICAgICBjb25zb2xlLmxvZyhkKTtcbiAgICB9KTtcbiAgICBzZWxmLnNvY2tldC5vbignbm90am9pbmVkJywgZnVuY3Rpb24oZCkge1xuICAgICAgY29uc29sZS5sb2coZCk7XG4gICAgfSk7XG5cblxuICAgIF8uYnlJZCgnZGVwbG95JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuc29ja2V0LmVtaXQoJ2RlcGxveScpO1xuICAgIH0pO1xuXG4gICAgXy5ieUlkKCdnZXQtYmFjaycpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICBzZWxmLnNvY2tldC5lbWl0KCdnZXRCYWNrJyk7XG4gICAgfSk7XG4gIH1cbn1cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCkge1xuICBtb2JpbGUuaW5pdCgpO1xufSk7IiwiLy8gT3VyIGxpYnJhcnkgb2YgdXNlZnVsIGZ1bmN0aW9ucy5cblxuLyoqXG4gICogZG9tIG1hbmlwdWxhdGlvbiBhbmQgc2VsZWN0b3JzXG4qL1xudmFyIF8gPSBtb2R1bGUuZXhwb3J0cztcbm1vZHVsZS5leHBvcnRzLmJ5Q2xhc3MgPSBmdW5jdGlvbihjbGFzc05hbWUpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoY2xhc3NOYW1lKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmJ5SWQgPSBmdW5jdGlvbihpZE5hbWUpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkTmFtZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy4kID0gZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xufTtcblxubW9kdWxlLmV4cG9ydHMuJCQgPSBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5lbExvb3AgPSBmdW5jdGlvbihhcnJheSwgY2IpIHtcbiAgZm9yICh2YXIgaT0wOyBpPGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgY2IoYXJyYXlbaV0pO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5wcmV2aW91cyA9IGZ1bmN0aW9uKGVsKSB7XG4gIHZhciBwID0gZWwucHJldmlvdXNTaWJsaW5nO1xuICBkbyBwID0gcC5wcmV2aW91c1NpYmxpbmc7XG4gIHdoaWxlIChwICYmIHAubm9kZVR5cGUgIT0gMSk7XG4gIHJldHVybiBwO1xufTtcblxubW9kdWxlLmV4cG9ydHMuYXR0ciA9IGZ1bmN0aW9uIGF0dHIoZWwsIGF0dHIsIHZhbHVlKSB7XG4gIGlmICh2YWx1ZSlcbiAgICByZXR1cm4gZWwuc2V0QXR0cmlidXRlKGF0dHIsIHZhbHVlKTtcbiAgZWxzZVxuICAgIHJldHVybiBlbC5nZXRBdHRyaWJ1dGUoYXR0cik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5nZXRXaW5kb3dXaWR0aCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gd2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZ2V0V2luZG93SGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB3aW5kb3cuaW5uZXJIZWlnaHR8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xufTtcblxuXG4vKipcbiAgKiBBSkFYIGZ1bmN0aW9uc1xuKi9cbm1vZHVsZS5leHBvcnRzLnBvc3QgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNiKSB7XG4gIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIHJlcXVlc3Qub3BlbignUE9TVCcsIHVybCwgdHJ1ZSk7XG4gIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9VVRGLTgnKTtcbiAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnJlYWR5U3RhdGUgPT0gdGhpcy5ET05FKSB7XG4gICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPj0gMjAwICYmIHJlcXVlc3Quc3RhdHVzIDwgNDAwKSB7XG4gICAgICAgIGlmIChjYikge1xuICAgICAgICAgIGNiLmNhbGwodGhpcywgSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgIGNvbnNvbGUubG9nKEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZSkpO1xuICAgICAgfVxuICAgICAgZWxzZVxuICAgICAgICBjb25zb2xlLmxvZygnZXJyb3InKTtcbiAgICB9XG4gIH07XG5cbiAgcmVxdWVzdC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmdldCA9IGZ1bmN0aW9uKHVybCwgY2IpIHtcbiAgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XG5cbiAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAocmVxdWVzdC5zdGF0dXMgPj0gMjAwICYmIHJlcXVlc3Quc3RhdHVzIDwgNDAwKXtcbiAgICAgIGNiLmNhbGwodGhpcyxKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdBbiBlcnJvciBoYXBwZW5lZCB3aGlsZSBnZXR0aW5nICVzLicsIHVybClcbiAgICB9XG4gIH07XG5cbiAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ0FuIGVycm9yIGhhcHBlbmVkIHdoaWxlIGdldHRpbmcgJXMuJywgdXJsKVxuICB9O1xuXG4gIHJlcXVlc3Quc2VuZCgpO1xufVxuXG4vKipcbiAgKiBmb3JtcyBhbmQgZGF0YSBmdW5jdGlvbnNcbiovXG5tb2R1bGUuZXhwb3J0cy5zZXJpYWxpemUgPSBmdW5jdGlvbihmb3JtKSB7XG4gIHZhciBpbnB1dHMgPSBmb3JtLmNoaWxkcmVuO1xuICB2YXIgZGF0YSA9IHt9O1xuICB2YXIgZWwsIG5hbWU7XG4gIGZvciAodmFyIGk9MDsgaTxpbnB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICBlbCA9IGlucHV0c1tpXTtcbiAgICBuYW1lID0gXy5hdHRyKGVsLCAnbmFtZScpO1xuXG4gICAgaWYgKG5hbWUgJiYgZWwudmFsdWUubGVuZ3RoPjEpXG4gICAgICBkYXRhW25hbWVdID0gZWwudmFsdWU7XG4gIH1cblxuICBpZiAoT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoID4gMClcbiAgICByZXR1cm4gZGF0YTtcbiAgZWxzZVxuICAgIHJldHVybiBmYWxzZTtcbn07XG4iXX0=