'use strict'

var _ = require('./tools.js');

var start;

var mapData = {
  mapData: null,
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
      self.mapData = resData;
      self.buildMap();
    });
  },


  getMap: function(cb) {
    _.get('/map', cb);
  },


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


  buildMap: function() {
    var self = this;
    self.ranges = self.mapData[self.mapData.length-1].range;

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
    var concatBoard = [];
    for (var j=0;j<self.board.length;j++) {
      concatBoard = concatBoard.concat(self.board[j]);
    }
    self.board = concatBoard;
    self.setMapData();

    var map = require('./UI/map.js');
    map.drawMap();
    console.log("Map generated in %s ms.", Date.now()-start);
  },

  setMapData: function() {
    var self = this;

    for (var i=0; i<self.mapData.length; i++) {
      self.board[i].adjacents = self.mapData[i].adjacents
      if (self.mapData[i].spawn) self.board[i].spawn = self.mapData[i].spawn
    }
  }
}

module.exports = mapData;
