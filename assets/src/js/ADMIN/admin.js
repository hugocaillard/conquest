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
