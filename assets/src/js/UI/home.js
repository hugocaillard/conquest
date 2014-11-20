var _ = require('../tools.js');

var home = {
  init: function() {
    console.log('home');
    this.setParticles();
  },

  setParticles: function() {
    var particles = require('VincentGarreau/particles.js@1.0.3:/particles.js');
    particlesJS('particles-js', {
      particles: {
        color: '#fff',
        shape: 'circle', // "circle", "edge" or "triangle"
        opacity: 1,
        size: 4,
        size_random: true,
        nb: 150,
        line_linked: {
          enable_auto: true,
          distance: 100,
          color: '#fff',
          opacity: 1,
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
          opacity: .5
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
  }
}


module.exports = home;
