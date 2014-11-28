'use strict';

var _ = require('./tools');

var lobby = {
  init: function () {
    var self = this;

    self.template = _.byId('template');
    self.template.remove();
    self.template.removeAttribute('id');

    _.get('/lobby/games', function(d) {
      console.log(d);
      self.setLobby(d.logged, d.games, d.maxPlayers*3)
    });
  },

  setLobby: function(logged, games, maxPlayers) {
    var self = this;
    var title = _.byId('title');
    var join = _.byId('lobby-join');
    var timeTillGame = _.byId('time-till-game');
    var players = _.byId('players-next-game');

    if (!logged) {
      _.$$('.lobby .login').classList.add('show');
      join.innerHTML = 'login';
      join.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/';
      });
    }

    if (games[0].winner) {
      title.innerHTML = 'A new game will start very soon!';
    }
    else {
      if (!games[0].ticks && games[0].willStartAt > Date.now()) {
        title.innerHTML = 'Next game starting soon';
        if (logged) {
          join.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/game';
          });
        }
      }
      else
        title.innerHTML = 'A game is currently in progress';

      if (games[0].nbOfPlayers === maxPlayers) {
        _.byId('game-full').classList.add('show')
      }
      if (games[0].nbOfPlayers === maxPlayers && logged) {
        join.classList.add('inactive');
      }
      else if (logged) {
        join.addEventListener('click', function(e) {
          e.preventDefault();
          window.location.href = '/game';
        });
      }
      players.innerHTML = games[0].nbOfPlayers+'/'+maxPlayers+ 'players';
    }

    var container, winner;
    var history = _.$$('.game-history');
    for (var i=1; i<games.length;i++) {

      winner = games[i].winner;
      container = self.template.cloneNode(true);

      if (winner) {
        container.classList.add(winner);
        container.childNodes[1].innerHTML = winner + ' team wins!';
      }

      if (games[i].userTeam) {
        container.childNodes[3].innerHTML = 'Your team';
        container.childNodes[3].classList.add(games[i].userTeam);
      }
      else {
        container.childNodes[3].innerHTML = 'You didn\'t play';
      }

      container.childNodes[5].innerHTML = games[i].nbOfPlayers + ' players';
      history.appendChild(container);
    }

  },

  computeTime: function(duration) {
    var sec_num = parseInt(duration, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
  }
};


module.exports = lobby;
