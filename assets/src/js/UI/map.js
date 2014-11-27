'use strict';

var _ = require('../tools.js');
var mapData = require('../mapData.js')
var svg = require('wout/svg.js');
var sockets = require('../sockets.js');

var chooseFaction = require('./chooseFaction.js');
var flashMessages = require('./flashMessages.js');

var map = {
  player: {},
  currentPos: null,

  showPlayer: function(player) {
    var self = this;
    self.player = player;
    if (player.position !== null) {
      if (self.currentPos !== null)
        self.currentPos.element.back().first().stroke({'width': 1, 'color': '#111'});

      var tile = mapData.board[player.position];
      tile.element.front().first().stroke({'width': 4, 'color': '#fff'});

      self.currentPos = tile;
    }
    else {
      if (self.currentPos !== null)
        self.currentPos.element.back().first().stroke({'width': 1, 'color': '#181818'});
      if (player.faction === null)
        flashMessages.show('Welcome.<br>Click on a tile owned by your team to spawn');
      else
        flashMessages.show('You are dead<br>Click on a tile owned by your team to respawn');

    }
  },

  showTurret: function(position, oldPos) {
    if (oldPos != null) {
      var children = mapData.board[oldPos].element.children();
      children[4].style('opacity', 0);
    }
    if (position != null) {
      var children = mapData.board[position].element.children();
      children[4].style('opacity', 1);
    }
  },

  tileClick: function(e) {
    e.preventDefault();
    var el = e.target || e.toElement;
    el = el.parentNode;
    var index = parseInt(el.id);

    // spawn
    var game = require('../game.js');
    if (map.player.position === null &&
        game.map[index] &&
        game.map[index].ownedBy === map.player.team) {
      chooseFaction.show();
      game.tileToSpawn = index;
    }

    // move
    else if (mapData.board[index].adjacents.indexOf(map.player.position)>-1) {
      sockets.move(index);
    }
  },


  /**
    * UPDATE MAP
  */
  visibleTiles: [],
  updateMap: function(map) {
    var self = this;
    var children = null;
    (function(visibleTiles) {
      for (var i=0;i<visibleTiles.length;i++) {
        if (map[visibleTiles[i]] === undefined) {
          mapData.board[visibleTiles[i]].element.first().fill('#1d1d1e');
        }
        children = mapData.board[visibleTiles[i]].element.children();
        if (children[1].style('opacity') == 1) children[1].style('opacity', 0);
        if (children[2].style('opacity') == 1) children[2].style('opacity', 0);
        if (children[3].style('opacity') == 1) children[3].style('opacity', 0);
      }
    })(self.visibleTiles);

    self.visibleTiles = [];
    for (var tile in map) {
      self.visibleTiles.push(map[tile].index);
      // colors the map
      if (map[tile].ownedBy === "alpha")
        mapData.board[map[tile].index].element.first().fill('#bf2318');
      else if (map[tile].ownedBy === "beta")
        mapData.board[map[tile].index].element.first().fill('#459d42');
      else if (map[tile].ownedBy === "gamma")
        mapData.board[map[tile].index].element.first().fill('#2a5faa');
      else
        mapData.board[map[tile].index].element.first().fill('#bbb');
      // display players dots
      children = mapData.board[map[tile].index].element.children();
      if (Object.keys(map[tile].players.alpha).length)
        children[1].style({opacity: 1});
      if (Object.keys(map[tile].players.beta).length)
        children[2].style({opacity: 1});
      if (Object.keys(map[tile].players.gamma).length)
        children[3].style({opacity: 1});
    }
  },

  /**
    * INITAL MAPPING
  */
  drawMap: function(median) {
    var self = this;


    /** SVG.JS */
    var boardContainer = SVG(mapData.boardName);
    var tiles   = boardContainer.group();
    var nested  = null;
    var hexagon = null;
    var circle  = null;
    var turret  = null;
    var coords  = null;
    var t       = null;
    var circleRadius = 4;

    var delta = (median/2)-(circleRadius/2);

    var colors = {'alpha': '#DD4B39', 'beta': '#7AB800', 'gamma': '#4183C4'};
    for(var i=0;i<mapData.board.length;i++) {
      t = mapData.board[i];

      coords = t.angles[0].x+','+t.angles[0].y+' '+
               t.angles[1].x+','+t.angles[1].y+' '+
               t.angles[2].x+','+t.angles[2].y+' '+
               t.angles[3].x+','+t.angles[3].y+' '+
               t.angles[4].x+','+t.angles[4].y+' '+
               t.angles[5].x+','+t.angles[5].y;


      nested  = tiles.nested();
      hexagon = nested.polygon(coords)
                      .fill('#1d1d1e')
                      .stroke({width: 1, color: '#111'});

      circle = nested.circle(circleRadius) // alha
                      .fill('#e74238')
                      .style({'opacity': 0})
                      .move(t.angles[5].x+delta+1.5,t.angles[5].y+delta-1.4);
      circle = nested.circle(circleRadius) // beta
                      .fill('#77b829')
                      .style({'opacity': 0})
                      .move(t.angles[3].x-(delta*2),t.angles[3].y+delta-3.7);
      circle = nested.circle(circleRadius) // gamma
                      .fill('#4e82c2')
                      .style({'opacity': 0})
                      .move(t.angles[1].x-delta+5.5,t.angles[1].y-(delta*2)-1.1);

      coords = t.angles[0].x+','+t.angles[0].y+' '+
               t.angles[2].x+','+t.angles[2].y+' '+
               t.angles[4].x+','+t.angles[4].y;

      turret = nested.polygon(coords)
                     .scale(.4, .4)
                     .rotate(-30)
                     .dmove(6.5, 6.5)
                     .style({'opacity': 0})
                     .stroke({width: 0})
                     .fill('#fff');

      nested.attr('id', i);
      nested.attr('name', t.id);
      nested.attr('data-rank', i);
      mapData.board[i].element = nested;
      nested.on('click', self.tileClick);
    }

    // center and resize the map
    tiles.move(_.getWindowWidth()/2, _.getWindowHeight()/2);
    var scale = 1;
    var deltaX=0,deltaY=0,newDeltaX=0,newDeltaY=0,tx=0,ty=0;
    tx = tiles.x()-_.getWindowWidth()/2;
    ty = tiles.y()-_.getWindowHeight()/2;
    deltaX = tx/scale;
    deltaY = ty/scale;
    scale = 0.5;
    newDeltaX = tx/scale;
    newDeltaY = ty/scale;
    tiles.scale(scale, scale);
    tiles.dmove(deltaX - newDeltaX, deltaY - newDeltaY);

    window.addEventListener('resize', function() {
      tiles.move(_.getWindowWidth()/2, _.getWindowHeight()/2);
    });
    self.setupMapInterractions(boardContainer, tiles, scale);
  },

  setupMapInterractions: function(boardContainer, tiles, scale) {
    var self = this;
    var scale = scale;

    self.readyToMove = false;
    boardContainer.on('mousedown', function() {
      self.readyToMove = true;
    });

    boardContainer.on('mouseup', function() {
      self.readyToMove = false;
    });

    boardContainer.on('mousemove', function(e) {
      if (self.readyToMove) {
        var x = e.movementX || e.mozMovementX;
        var y = e.movementY || e.mozMovementY;
        var bgL, bgT;
        window.requestAnimationFrame(function() {
          tiles.dmove(x/scale, y/scale);
        });
      }
    });

    var deltaX=0,deltaY=0,newDeltaX=0,newDeltaY=0,tx=0,ty=0;
    boardContainer.on('wheel', function(e) {
      if ((e.deltaY>0 && scale-e.deltaY/1000>.35) // zoom out
          || (e.deltaY<0 && scale-e.deltaY/1000<3)) { // zoom in

        tx = tiles.x()-e.pageX;
        ty = tiles.y()-e.pageY;

        // Get the current distance between the
        // pointer and the center of the map
        deltaX = tx/scale;
        deltaY = ty/scale;

        scale -= e.deltaY/1000;

        // Get the new distance
        newDeltaX = tx/scale;
        newDeltaY = ty/scale;

        // Move the map so the newDeltas match with the old ones
        // TODO: move it to the "animation" function that rune in a RAF
        tiles.scale(scale, scale);
        tiles.dmove(deltaX - newDeltaX, deltaY - newDeltaY);
      }
    });
  }
}

module.exports = map;
