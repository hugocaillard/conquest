'use strict';

var _       = require('./tools');
var sockets = require('./sockets');

var chat = {
  template: _.byId('template-message'),
  messages: _.byId('messages'),
  lastSend: 0,

  init: function() {
    var self = this;
    self.input = _.byId('send-msg');
    self.template.remove();
    self.template.removeAttribute('id');

    self.input.addEventListener('keypress', function(e) {
      if (this.value.length && (Date.now()-self.lastSend)>2200) {
        if (e.keyCode == 13) {
          sockets.chatMsg(this.value);
          this.value = '';
          self.lastSend = Date.now();
        }

      }
    });
  },

  displayMsg: function(d) {
    var container = chat.template.cloneNode(true);
    if (d.type && d.type == 'notice')
      container.classList.add('notice');
    container.childNodes[1].innerHTML = d.username;
    container.childNodes[3].innerHTML = d.msg;
    chat.messages.appendChild(container);
    self.messages.scrollTop = self.messages.scrollHeight;
  }
}

module.exports = chat;
