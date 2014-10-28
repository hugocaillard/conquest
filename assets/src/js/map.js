'use strict'

var _ = require('./tools.js');
var svg = require('wout/svg.js');

var start;

var map = {
  map: null,
  board: [[{x:0,y:0}]],

  // distance between the center of an hexagon and an angle
  radius: 20,


  init: function() {
    var self = this;
    start = Date.now();
    // Operations we don't want to repeat thousands of times
    self.halfRadius = self.radius/2;
    self.radius15 = self.radius*1.5;
    // Median of a single triangle composing an hexagon
    // The distance bewteen center of the hexa and the center of a side
    self.median = Math.sqrt(self.radius*(self.radius-(self.radius/4)));
    // distance bewteen centers of adjacent hexagones
    self.dist = self.median*2;

    self.wWidth = _.getWindowWidth();
    self.wHeight = _.getWindowHeight();

    self.getMap(function(resData) {
      self.map = resData;
      self.buildMap();
    });
  },


  getMap: function(cb) {
    _.get('/map', cb);
  },


  buildMap: function() {
    var self = this;
    self.ranges = self.map[self.map.length-1].range;

    // build the center
    self.board.push(self.getAdjacentCenters({x: 0, y: 0}, []));

    // build the other ranges
    var i = self.board.length;
    var j = 0;
    var lastTile = 0, newRange = [];

    while (i <= self.ranges) {
      // we get the last tile's index
      lastTile = self.board[i-1][(6*(i-1)-1)];
      // build one just on top of that last tile
      lastTile = {x: lastTile.x, y: lastTile.y - self.dist};
      newRange = [lastTile];

      // do (range - 1) tiles going to top-right
      for (j=0; j<i-1; j++) {
        lastTile = {
          x: lastTile.x + self.radius15,
          y: lastTile.y - self.median
        };
        newRange.push(lastTile);
      }

      // then (range) tiles going to:
      // bottom-right
      for (j=0; j<i; j++) {
        lastTile = {
          x: lastTile.x + self.radius15,
          y: lastTile.y + self.median
        };
        newRange.push(lastTile);
      }

      // bottom
      for (j=0; j<i; j++) {
        lastTile = {
          x: lastTile.x,
          y: lastTile.y + self.dist
        };
        newRange.push(lastTile);
      }

      // bottom-left
      for (j=0; j<i; j++) {
        lastTile = {
          x: lastTile.x - self.radius15,
          y: lastTile.y + self.median
        };
        newRange.push(lastTile);
      }

      // top-left
      for (j=0; j<i; j++) {
        lastTile = {
          x: lastTile.x - self.radius15,
          y: lastTile.y - self.median
        };
        newRange.push(lastTile);
      }

      // top
      for (j=0; j<i; j++) {
        lastTile = {
          x: lastTile.x,
          y: lastTile.y - self.dist
        };
        newRange.push(lastTile);
      }

      // the range is done
      self.board.push(newRange);
      i++;
    }

    // get angles coords
    for(var i=0;i<self.board.length;i++) {
      for (var j=0;j<self.board[i].length;j++) {
        self.board[i][j].angles = self.buildHexa(self.board[i][j], []);
        self.board[i][j].id = i+'-'+(j+1);
      }
    }

    console.log("Map calculated in %s ms.", Date.now()-start);
    self.drawMap();
  },


  // (the center of the checked tiles -obj-,
  // centers of the adjacents tiles -array-)
  getAdjacentCenters: function(center, adjCenters) {
    var self = this;

    adjCenters[0] = {
      x: center.x,
      y: center.y - self.dist};
    adjCenters[1] = {
      x: center.x + self.radius15,
      y: center.y - self.median};
    adjCenters[2] = {
      x: center.x + self.radius15,
      y: center.y + self.median};
    adjCenters[3] = {
      x: center.x,
      y: center.y + self.dist};
    adjCenters[4] = {
      x: center.x - self.radius15,
      y: center.y + self.median};
    adjCenters[5] = {
      x: center.x - self.radius15,
      y: center.y - self.median};

    return adjCenters;
  },


  buildHexa: function(center, coords, range, index) {
    var self = this;

    coords[0] = {
      x: center.x - self.radius,
      y: center.y};
    coords[1] = {
      x: center.x - self.halfRadius,
      y: center.y + self.median};
    coords[2] = {
      x: center.x + self.halfRadius,
      y: center.y + self.median};
    coords[3] = {
      x: center.x + self.radius,
      y: center.y};
    coords[4] = {
      x: center.x + self.halfRadius,
      y: center.y - self.median};
    coords[5] = {
      x: center.x - self.halfRadius,
      y: center.y - self.median};
    return coords;
  },


  // UI
  drawMap: function() {
    var self = this;

    /** SVG.JS */
    var board = SVG('board');
    var tiles   = board.group();
    var hexagon = null;
    var coords  = null;
    var t       = null;

    for(var i=0;i<self.board.length;i++) {
      for (var j=0;j<self.board[i].length;j++) {
        t = self.board[i][j];

        coords = t.angles[0].x+','+t.angles[0].y+' '+
                 t.angles[1].x+','+t.angles[1].y+' '+
                 t.angles[2].x+','+t.angles[2].y+' '+
                 t.angles[3].x+','+t.angles[3].y+' '+
                 t.angles[4].x+','+t.angles[4].y+' '+
                 t.angles[5].x+','+t.angles[5].y;

        if (i<1)
          hexagon = tiles.polygon(coords).fill('#'+i+i+i).stroke({width: 1});
        else
          hexagon = tiles.polygon(coords).fill('#999').stroke({width: 1, color: '#222'});

        hexagon.attr('id', t.id);
        hexagon.attr('data-rank', i);
      }
    }

    // center the map
    tiles.move(_.getWindowWidth()/2, _.getWindowHeight()/2);

    console.log("Map generated in %s ms.", Date.now()-start);
    self.setupMapInterractions(board, tiles);
  },

  setupMapInterractions: function(board, tiles) {
    var self = this;
    var scale = 1;

    self.readyToMove = false;
    board.mousedown(function() {
      self.readyToMove = true;
    });

    board.mouseup(function() {
      self.readyToMove = false;
    });

    board.mousemove(function(e) {
      if (self.readyToMove) {
        window.requestAnimationFrame(function() {
          tiles.dmove(e.movementX/scale, e.movementY/scale);
        });
      }
    });

    var deltaX=0,deltaY=0,newDeltaX=0,newDeltaY=0,tx=0,ty=0;
    board.on('mousewheel', function(e) {
      if ((e.wheelDeltaY>0 && scale+e.wheelDeltaY/1000<3)
          || (e.wheelDeltaY<0 && scale+e.wheelDeltaY/1000>.6)) {

        tx = tiles.x();
        ty = tiles.y();

        // Get the current distance between the
        // pointer and the center of the map
        deltaX = (tx-e.x)/scale;
        deltaY = (ty-e.y)/scale;

        scale += (e.wheelDeltaY/1000);

        // Get the new distance
        newDeltaX = (tx-e.x)/scale;
        newDeltaY = (ty-e.y)/scale;

        // Move the map so the newDeltas match with the old ones
        // TODO: move it to the "animation" function that rune in a RAF
        tiles.scale(scale, scale);
        tiles.dmove(deltaX - newDeltaX, deltaY - newDeltaY);
      }
    });
  }
}

// coordonées du cursor sur la map
// on scale
// mettre la nouvelle coordoné la ou elle était
module.exports = map;
