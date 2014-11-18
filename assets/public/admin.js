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
'use strict';

var _ = require('../tools.js');

var admin = {
  init: function() {
    var self = this;

    self.searchUsers = _.byId('search-users');
    self.usersResults = _.byId('users-results');


    self.template = _.byId('template');

    self.searchUsers.addEventListener('keyup', function() {
      _.post('/admin/users', {userReq: self.searchUsers.value}, function(data) {
        self.displayUsers(data);
      });
    });
  },

  displayUsers: function(users) {
    var self = this;
    self.usersResults.innerHTML = '';
    var container, childs, input;
    for (var user in users) {
      container = self.template.cloneNode(true);
      container.removeAttribute('id');
      childs = container.childNodes;
      for (var i=0;i<childs.length; i++) {
        if (childs[i].getAttribute && childs[i].getAttribute('class') !== 'send') {
          input = childs[i].childNodes[0];
          input.setAttribute('data-id', users[user]._id)
          input.value = users[user][input.getAttribute('class')];
        }
        else if (childs[i].getAttribute && childs[i].getAttribute('class') === 'send') {
          childs[i].setAttribute('data-id', users[user]._id);
          childs[i].addEventListener('click', self.updateUser);
        }
      }
      self.usersResults.appendChild(container);
    }
  },

  updateUser: function() {
    var id = this.getAttribute('data-id');
    var d= {
      id      : id,
      data: {
        username : _.$$('.username[data-id="'+id+'"]').value,
        email    : _.$$('.email[data-id="'+id+'"]').value,
        slug     : _.$$('.slug[data-id="'+id+'"]').value,
        confirmed: JSON.parse(_.$$('.confirmed[data-id="'+id+'"]').value),
        admin    : JSON.parse(_.$$('.admin[data-id="'+id+'"]').value),
        password : _.$$('.password[data-id="'+id+'"]').value
      }
    }
    _.post('/admin/users/update', d, function(data) {
      console.log(data);
    });
  }
};

admin.init();

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlcXVpcmUuanMiLCJhc3NldHMvc3JjL2pzL2FkbWluL2FkbWluLmpzIiwiYXNzZXRzL3NyYy9qcy90b29scy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gb3V0ZXIobW9kdWxlcywgY2FjaGUsIGVudHJpZXMpe1xuXG4gIC8qKlxuICAgKiBHbG9iYWxcbiAgICovXG5cbiAgdmFyIGdsb2JhbCA9IChmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfSkoKTtcblxuICAvKipcbiAgICogUmVxdWlyZSBgbmFtZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0ganVtcGVkXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHJlcXVpcmUobmFtZSwganVtcGVkKXtcbiAgICBpZiAoY2FjaGVbbmFtZV0pIHJldHVybiBjYWNoZVtuYW1lXS5leHBvcnRzO1xuICAgIGlmIChtb2R1bGVzW25hbWVdKSByZXR1cm4gY2FsbChuYW1lLCByZXF1aXJlKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nhbm5vdCBmaW5kIG1vZHVsZSBcIicgKyBuYW1lICsgJ1wiJyk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbCBtb2R1bGUgYGlkYCBhbmQgY2FjaGUgaXQuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpZFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXF1aXJlXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gY2FsbChpZCwgcmVxdWlyZSl7XG4gICAgdmFyIG0gPSBjYWNoZVtpZF0gPSB7IGV4cG9ydHM6IHt9IH07XG4gICAgdmFyIG1vZCA9IG1vZHVsZXNbaWRdO1xuICAgIHZhciBuYW1lID0gbW9kWzJdO1xuICAgIHZhciBmbiA9IG1vZFswXTtcblxuICAgIGZuLmNhbGwobS5leHBvcnRzLCBmdW5jdGlvbihyZXEpe1xuICAgICAgdmFyIGRlcCA9IG1vZHVsZXNbaWRdWzFdW3JlcV07XG4gICAgICByZXR1cm4gcmVxdWlyZShkZXAgPyBkZXAgOiByZXEpO1xuICAgIH0sIG0sIG0uZXhwb3J0cywgb3V0ZXIsIG1vZHVsZXMsIGNhY2hlLCBlbnRyaWVzKTtcblxuICAgIC8vIGV4cG9zZSBhcyBgbmFtZWAuXG4gICAgaWYgKG5hbWUpIGNhY2hlW25hbWVdID0gY2FjaGVbaWRdO1xuXG4gICAgcmV0dXJuIGNhY2hlW2lkXS5leHBvcnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcXVpcmUgYWxsIGVudHJpZXMgZXhwb3NpbmcgdGhlbSBvbiBnbG9iYWwgaWYgbmVlZGVkLlxuICAgKi9cblxuICBmb3IgKHZhciBpZCBpbiBlbnRyaWVzKSB7XG4gICAgaWYgKGVudHJpZXNbaWRdKSB7XG4gICAgICBnbG9iYWxbZW50cmllc1tpZF1dID0gcmVxdWlyZShpZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcXVpcmUoaWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEdW8gZmxhZy5cbiAgICovXG5cbiAgcmVxdWlyZS5kdW8gPSB0cnVlO1xuXG4gIC8qKlxuICAgKiBFeHBvc2UgY2FjaGUuXG4gICAqL1xuXG4gIHJlcXVpcmUuY2FjaGUgPSBjYWNoZTtcblxuICAvKipcbiAgICogRXhwb3NlIG1vZHVsZXNcbiAgICovXG5cbiAgcmVxdWlyZS5tb2R1bGVzID0gbW9kdWxlcztcblxuICAvKipcbiAgICogUmV0dXJuIG5ld2VzdCByZXF1aXJlLlxuICAgKi9cblxuICAgcmV0dXJuIHJlcXVpcmU7XG59KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCcuLi90b29scy5qcycpO1xuXG52YXIgYWRtaW4gPSB7XG4gIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHNlbGYuc2VhcmNoVXNlcnMgPSBfLmJ5SWQoJ3NlYXJjaC11c2VycycpO1xuICAgIHNlbGYudXNlcnNSZXN1bHRzID0gXy5ieUlkKCd1c2Vycy1yZXN1bHRzJyk7XG5cblxuICAgIHNlbGYudGVtcGxhdGUgPSBfLmJ5SWQoJ3RlbXBsYXRlJyk7XG5cbiAgICBzZWxmLnNlYXJjaFVzZXJzLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24oKSB7XG4gICAgICBfLnBvc3QoJy9hZG1pbi91c2VycycsIHt1c2VyUmVxOiBzZWxmLnNlYXJjaFVzZXJzLnZhbHVlfSwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBzZWxmLmRpc3BsYXlVc2VycyhkYXRhKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuXG4gIGRpc3BsYXlVc2VyczogZnVuY3Rpb24odXNlcnMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi51c2Vyc1Jlc3VsdHMuaW5uZXJIVE1MID0gJyc7XG4gICAgdmFyIGNvbnRhaW5lciwgY2hpbGRzLCBpbnB1dDtcbiAgICBmb3IgKHZhciB1c2VyIGluIHVzZXJzKSB7XG4gICAgICBjb250YWluZXIgPSBzZWxmLnRlbXBsYXRlLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgIGNvbnRhaW5lci5yZW1vdmVBdHRyaWJ1dGUoJ2lkJyk7XG4gICAgICBjaGlsZHMgPSBjb250YWluZXIuY2hpbGROb2RlcztcbiAgICAgIGZvciAodmFyIGk9MDtpPGNoaWxkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoY2hpbGRzW2ldLmdldEF0dHJpYnV0ZSAmJiBjaGlsZHNbaV0uZ2V0QXR0cmlidXRlKCdjbGFzcycpICE9PSAnc2VuZCcpIHtcbiAgICAgICAgICBpbnB1dCA9IGNoaWxkc1tpXS5jaGlsZE5vZGVzWzBdO1xuICAgICAgICAgIGlucHV0LnNldEF0dHJpYnV0ZSgnZGF0YS1pZCcsIHVzZXJzW3VzZXJdLl9pZClcbiAgICAgICAgICBpbnB1dC52YWx1ZSA9IHVzZXJzW3VzZXJdW2lucHV0LmdldEF0dHJpYnV0ZSgnY2xhc3MnKV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY2hpbGRzW2ldLmdldEF0dHJpYnV0ZSAmJiBjaGlsZHNbaV0uZ2V0QXR0cmlidXRlKCdjbGFzcycpID09PSAnc2VuZCcpIHtcbiAgICAgICAgICBjaGlsZHNbaV0uc2V0QXR0cmlidXRlKCdkYXRhLWlkJywgdXNlcnNbdXNlcl0uX2lkKTtcbiAgICAgICAgICBjaGlsZHNbaV0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWxmLnVwZGF0ZVVzZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzZWxmLnVzZXJzUmVzdWx0cy5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgIH1cbiAgfSxcblxuICB1cGRhdGVVc2VyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgaWQgPSB0aGlzLmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpO1xuICAgIHZhciBkPSB7XG4gICAgICBpZCAgICAgIDogaWQsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHVzZXJuYW1lIDogXy4kJCgnLnVzZXJuYW1lW2RhdGEtaWQ9XCInK2lkKydcIl0nKS52YWx1ZSxcbiAgICAgICAgZW1haWwgICAgOiBfLiQkKCcuZW1haWxbZGF0YS1pZD1cIicraWQrJ1wiXScpLnZhbHVlLFxuICAgICAgICBzbHVnICAgICA6IF8uJCQoJy5zbHVnW2RhdGEtaWQ9XCInK2lkKydcIl0nKS52YWx1ZSxcbiAgICAgICAgY29uZmlybWVkOiBKU09OLnBhcnNlKF8uJCQoJy5jb25maXJtZWRbZGF0YS1pZD1cIicraWQrJ1wiXScpLnZhbHVlKSxcbiAgICAgICAgYWRtaW4gICAgOiBKU09OLnBhcnNlKF8uJCQoJy5hZG1pbltkYXRhLWlkPVwiJytpZCsnXCJdJykudmFsdWUpLFxuICAgICAgICBwYXNzd29yZCA6IF8uJCQoJy5wYXNzd29yZFtkYXRhLWlkPVwiJytpZCsnXCJdJykudmFsdWVcbiAgICAgIH1cbiAgICB9XG4gICAgXy5wb3N0KCcvYWRtaW4vdXNlcnMvdXBkYXRlJywgZCwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgfSk7XG4gIH1cbn07XG5cbmFkbWluLmluaXQoKTtcbiIsIi8vIE91ciBsaWJyYXJ5IG9mIHVzZWZ1bCBmdW5jdGlvbnMuXG5cbi8qKlxuICAqIGRvbSBtYW5pcHVsYXRpb24gYW5kIHNlbGVjdG9yc1xuKi9cbnZhciBfID0gbW9kdWxlLmV4cG9ydHM7XG5tb2R1bGUuZXhwb3J0cy5ieUNsYXNzID0gZnVuY3Rpb24oY2xhc3NOYW1lKSB7XG4gIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNsYXNzTmFtZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5ieUlkID0gZnVuY3Rpb24oaWROYW1lKSB7XG4gIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZE5hbWUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMuJCA9IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLiQkID0gZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZWxMb29wID0gZnVuY3Rpb24oYXJyYXksIGNiKSB7XG4gIGZvciAodmFyIGk9MDsgaTxhcnJheS5sZW5ndGg7IGkrKykge1xuICAgIGNiKGFycmF5W2ldKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMucHJldmlvdXMgPSBmdW5jdGlvbihlbCkge1xuICB2YXIgcCA9IGVsLnByZXZpb3VzU2libGluZztcbiAgZG8gcCA9IHAucHJldmlvdXNTaWJsaW5nO1xuICB3aGlsZSAocCAmJiBwLm5vZGVUeXBlICE9IDEpO1xuICByZXR1cm4gcDtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmF0dHIgPSBmdW5jdGlvbiBhdHRyKGVsLCBhdHRyLCB2YWx1ZSkge1xuICBpZiAodmFsdWUpXG4gICAgcmV0dXJuIGVsLnNldEF0dHJpYnV0ZShhdHRyLCB2YWx1ZSk7XG4gIGVsc2VcbiAgICByZXR1cm4gZWwuZ2V0QXR0cmlidXRlKGF0dHIpO1xufTtcblxubW9kdWxlLmV4cG9ydHMuZ2V0V2luZG93V2lkdGggPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmdldFdpbmRvd0hlaWdodCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gd2luZG93LmlubmVySGVpZ2h0fHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcbn07XG5cblxuLyoqXG4gICogQUpBWCBmdW5jdGlvbnNcbiovXG5tb2R1bGUuZXhwb3J0cy5wb3N0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjYikge1xuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICByZXF1ZXN0Lm9wZW4oJ1BPU1QnLCB1cmwsIHRydWUpO1xuICByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PVVURi04Jyk7XG4gIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5yZWFkeVN0YXRlID09IHRoaXMuRE9ORSkge1xuICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID49IDIwMCAmJiByZXF1ZXN0LnN0YXR1cyA8IDQwMCkge1xuICAgICAgICBpZiAoY2IpIHtcbiAgICAgICAgICBjYi5jYWxsKHRoaXMsIEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjb25zb2xlLmxvZyhKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2UpKTtcbiAgICAgIH1cbiAgICAgIGVsc2VcbiAgICAgICAgY29uc29sZS5sb2coJ2Vycm9yJyk7XG4gICAgfVxuICB9O1xuXG4gIHJlcXVlc3Quc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5nZXQgPSBmdW5jdGlvbih1cmwsIGNiKSB7XG4gIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgcmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuXG4gIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHJlcXVlc3Quc3RhdHVzID49IDIwMCAmJiByZXF1ZXN0LnN0YXR1cyA8IDQwMCl7XG4gICAgICBjYi5jYWxsKHRoaXMsSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnQW4gZXJyb3IgaGFwcGVuZWQgd2hpbGUgZ2V0dGluZyAlcy4nLCB1cmwpXG4gICAgfVxuICB9O1xuXG4gIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdBbiBlcnJvciBoYXBwZW5lZCB3aGlsZSBnZXR0aW5nICVzLicsIHVybClcbiAgfTtcblxuICByZXF1ZXN0LnNlbmQoKTtcbn1cblxuLyoqXG4gICogZm9ybXMgYW5kIGRhdGEgZnVuY3Rpb25zXG4qL1xubW9kdWxlLmV4cG9ydHMuc2VyaWFsaXplID0gZnVuY3Rpb24oZm9ybSkge1xuICB2YXIgaW5wdXRzID0gZm9ybS5jaGlsZHJlbjtcbiAgdmFyIGRhdGEgPSB7fTtcbiAgdmFyIGVsLCBuYW1lO1xuICBmb3IgKHZhciBpPTA7IGk8aW5wdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZWwgPSBpbnB1dHNbaV07XG4gICAgbmFtZSA9IF8uYXR0cihlbCwgJ25hbWUnKTtcblxuICAgIGlmIChuYW1lICYmIGVsLnZhbHVlLmxlbmd0aD4xKVxuICAgICAgZGF0YVtuYW1lXSA9IGVsLnZhbHVlO1xuICB9XG5cbiAgaWYgKE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aCA+IDApXG4gICAgcmV0dXJuIGRhdGE7XG4gIGVsc2VcbiAgICByZXR1cm4gZmFsc2U7XG59O1xuIl19