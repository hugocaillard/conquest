'use strict';

var _ = require('../tools.js');

var admin = {
  searchUsers: _.byId('search-users'),
  usersResults: _.byId('users-results'),

  registeredEl: _.byId('registered'),
  confirmedEl: _.byId('confirmed'),

  template: _.byId('template'),
  init: function() {
    var self = this;

    self.searchUsers.addEventListener('input', function() {
      _.post('/admin/users', {userReq: self.searchUsers.value}, function(data) {
        self.displayUsers(data.users);
        self.displayStats(data.registered, data.confirmed);
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
        if (childs[i].getAttribute && childs[i].getAttribute('class') !== 'send' &&
            childs[i].getAttribute('class') !== 'delete') {
          input = childs[i].childNodes[0];
          input.setAttribute('data-id', users[user]._id)
          input.value = users[user][input.getAttribute('class')];
        }
        else if (childs[i].getAttribute && childs[i].getAttribute('class') === 'send') {
          childs[i].setAttribute('data-id', users[user]._id);
          childs[i].addEventListener('click', self.updateUser);
        }
        else if (childs[i].getAttribute && childs[i].getAttribute('class') === 'delete') {
          childs[i].setAttribute('data-id', users[user]._id);
          childs[i].addEventListener('click', self.deleteUser);
        }
      }
      self.usersResults.appendChild(container);
    }
  },

  displayStats: function(registered, confirmed) {
    var self = this;

    self.registeredEl.innerHTML = registered;
    self.confirmedEl.innerHTML = confirmed;
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
  },

  deleteUser: function() {
    var id = this.getAttribute('data-id');
    _.post('/admin/users/delete', {id: id}, function(data) {
      console.log(data);
    });
  }
};

admin.init();
