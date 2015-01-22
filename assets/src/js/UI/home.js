'use strict';

var particles = require('VincentGarreau/particles.js@1.0.3:/particles.js');
var _ = require('../tools.js');

var home = {
  init: function() {
    this.setParticles();
    this.setEventListeners();
  },

  setParticles: function() {
    particlesJS('particles-js', {
      particles: {
        color: '#fff',
        shape: 'circle',
        opacity: .2,
        size: 2,
        size_random: true,
        nb: 150,
        line_linked: {
          enable_auto: true,
          distance: 100,
          color: '#fff',
          opacity: .1,
          width: 1,
          condensed_mode: {
            enable: false,
            rotateX: 600,
            rotateY: 600
          }
        },
        anim: {
          enable: true,
          speed: 1
        }
      },
      interactivity: {
        enable: true,
        mouse: {
          distance: 200
        },
        detect_on: 'window', // "canvas" or "window"
        mode: 'grab',
        line_linked: {
          opacity: .3
        },
        events: {
          onclick: {
            enable: true,
            mode: 'push', // "push" or "remove" (particles)
            nb: 1
          }
        }
      },
      retina_detect: true
    });
  },

  setEventListeners: function() {
    _.$$('.login-cta').addEventListener('click', function(e) {
      e.preventDefault();
      _.$$('.login').classList.add('show');
      _.$$('.cancel').classList.add('show');
      _.$$('.signin-cta').classList.remove('show');
      this.classList.remove('show');
      _.$$('h1').classList.add('up');
      _.$$('.login-section').classList.add('appear');
      _.byId('login-username').focus();
    });

    _.$$('.cancel').addEventListener('click', function(e) {
      e.preventDefault();
      _.$$('.login').classList.remove('show');
      _.$$('.cancel').classList.remove('show');
      _.$$('.login-cta').classList.add('show');
      _.$$('.signin-cta').classList.add('show');
      _.$$('.register').classList.remove('show');
      _.$$('h1').classList.remove('up');
      _.$$('.login-section').classList.remove('appear');
    });

    _.$$('.signin-cta').addEventListener('click', function(e) {
      e.preventDefault();
      _.$$('.register').classList.add('show');
      _.$$('.cancel').classList.add('show');
      this.classList.remove('show');
      _.$$('.login-cta').classList.remove('show');
      _.$$('h1').classList.add('up');
      _.$$('.login-section').classList.add('appear');
      _.byId('register-username').focus();
    });

    var inputUsername = _.byId('register-username')
    var cleanUsername = function() {
      if (this.value != this.value.replace(/[\/|&;$%@"'<>{}()+,.!?]/g, ''))
        this.value = this.value.replace(/[\/|&;$%@"'<>{}()+,.!?]/g, '');
    };

    inputUsername.addEventListener('keypress', cleanUsername);
    inputUsername.addEventListener('keyup', cleanUsername);
    inputUsername.addEventListener('keydown', cleanUsername);
  },

  showMessage: function(msg) {
    _.$$('h1').classList.remove('up');
    _.$$('.login-section').remove();
    _.byId('message').innerHTML = msg;
    _.byId('message').classList.add('show');
  }
}


module.exports = home;
