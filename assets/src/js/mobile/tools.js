'use strict';

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

module.exports._attr = function(el, _attr, value) {
  if (value)
    return el.setAttribute(_attr, value);
  else
    return el.getAttribute(_attr);
};
