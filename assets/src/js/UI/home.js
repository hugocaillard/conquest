var particles = require('VincentGarreau/particles.js@1.0.3:/particles.js');
var _ = require('../tools.js');

var home = {
  init: function() {
    console.log('home');
    this.setParticles();
    this.displayLoginForm();
    this.removeLoginForm();
    this.displaySigninForm();
    this.signinToLogin();
  },

  setParticles: function() {
    console.log(particles);
    particlesJS('particles-js', {
      particles: {
        color: '#fff',
        shape: 'circle', // "circle", "edge" or "triangle"
        opacity: .3,
        size: 4,
        size_random: true,
        nb: 150,
        line_linked: {
          enable_auto: true,
          distance: 100,
          color: '#fff',
          opacity: .3,
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
          distance: 250
        },
        detect_on: 'canvas', // "canvas" or "window"
        mode: 'grab',
        line_linked: {
          opacity: .3
        },
        events: {
          onclick: {
            enable: true,
            mode: 'push', // "push" or "remove" (particles)
            nb: 4
          }
        }
      },
      /* Retina Display Support */
      retina_detect: true
    });
  },

  displayLoginForm: function() {
    var startButton = _.$('.start');
    startButton[0].addEventListener('click', function(e) {
      _.$('.login')[0].classList.add('show');
      _.$('.cancel')[0].classList.add('show');
      _.$('.start')[0].classList.remove('show');
      _.$('.cta-signin')[0].classList.add('show');
    });
  },

  removeLoginForm: function() {
    var cancelButton = _.$('.cancel');
    cancelButton[0].addEventListener('click', function(e) {
      _.$('.login')[0].classList.remove('show');
      _.$('.cancel')[0].classList.remove('show');
      _.$('.start')[0].classList.add('show');
      _.$('.register')[0].classList.remove('show');
      _.$('.cta-login')[0].classList.remove('show');
      _.$('.cta-signin')[0].classList.remove('show');
    });
  },

  displaySigninForm: function() {
    var signinButton = _.$('.cta-signin');
    signinButton[0].addEventListener('click', function(e) {
      _.$('.login')[0].classList.remove('show');
      _.$('.register')[0].classList.add('show');
      signinButton[0].classList.remove('show');
      _.$('.cta-login')[0].classList.add('show');
    });
  },

  signinToLogin: function() {
    var loginButton = _.$('.cta-login');
      loginButton[0].addEventListener('click', function(e) {
      _.$('.login')[0].classList.add('show');
      _.$('.register')[0].classList.remove('show');
      loginButton[0].classList.remove('show');
      _.$('.cta-signin')[0].classList.add('show');
    });
  }
}


module.exports = home;
