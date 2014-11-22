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

  setEventListeners: function() {
    _.$$('.start').addEventListener('click', function(e) {
      _.$$('.login').classList.add('show');
      _.$$('.cancel').classList.add('show');
      this.classList.remove('show');
      _.$$('.cta-signin').classList.add('show');
    });

    _.$$('.cancel').addEventListener('click', function(e) {
      _.$$('.login').classList.remove('show');
      _.$$('.cancel').classList.remove('show');
      _.$$('.start').classList.add('show');
      _.$$('.register').classList.remove('show');
      _.$$('.cta-login').classList.remove('show');
      _.$$('.cta-signin').classList.remove('show');
    });

    _.$$('.cta-signin').addEventListener('click', function(e) {
      _.$$('.login').classList.remove('show');
      _.$$('.register').classList.add('show');
      this.classList.remove('show');
      _.$$('.cta-login').classList.add('show');
    });

    _.$$('.cta-login').addEventListener('click', function(e) {
      _.$$('.login').classList.add('show');
      _.$$('.register').classList.remove('show');
      this.classList.remove('show');
      _.$$('.cta-signin').classList.add('show');
    });
  }
}


module.exports = home;
