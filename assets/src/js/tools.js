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
