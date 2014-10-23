'use strict'

var _ = require('./tools.js');

var map = {
  map: null,
  board: [[{x:0,y:0}]],

  // distance between the center of an hexagon and an angle
  radius: 100,


  init: function() {
    var self = this;

    // Operations we don't want to repeat thousands of times
    self.halfRadius = self.radius/2;
    self.radius15 = self.radius*1.5;

    // Median of a single triangle composing an hexagon
    // (It a sixth of the hexagon and an equilateral triangle)
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
    while (self.board.length <= self.ranges) {
      console.log('hey');
      self.board.push([]);
    }

    // get angles coords
    for(var i=0;i<self.board.length;i++) {
      for (var j=0;j<self.board[i].length;j++) {
        self.board[i][j].angles = self.getAdjacentCenters(self.board[i][j], []);
      }
    }

    console.log(self.board);
  },


  // (the center of the checked tiles -obj-,
  // centers of the adjacents tiles -array-)
  getAdjacentCenters: function(center, adjCenters) {
    var self = this;

    adjCenters[0] = {
      x: center.x,
      y: center.y + self.dist};
    adjCenters[1] = {
      x: center.x + self.radius15,
      y: center.y + self.median};
    adjCenters[2] = {
      x: center.x + self.radius15,
      y: center.y - self.median};
    adjCenters[3] = {
      x: center.x,
      y: center.y - self.dist};
    adjCenters[4] = {
      x: center.x - self.radius15,
      y: center.y - self.median};
    adjCenters[5] = {
      x: center.x - self.radius15,
      y: center.y + self.median};

    return adjCenters;
  },


  buildHexa: function(center, coords) {
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
  }
}


module.exports = map;
