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

        hexagon = tiles.polygon(coords).fill('#'+i+i+i).stroke({ width: 1});
        hexagon.attr('id', t.id);
        hexagon.attr('data-rank', i);
      }
    }
    tiles.move(_.getWindowWidth()/2, _.getWindowHeight()/2);
    console.log("Map generated in %s ms.", Date.now()-start);
  }
}


module.exports = map;
