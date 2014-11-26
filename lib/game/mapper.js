'use strict';
var colors = require('colors');
var path   = require('path');

var app  = require(path.join(__dirname, '../../server.js'));
var conf = app.config.game;

var mapper = {

  init: function() {
    var self = this;

    self.nbOfTiles = 1;
    self.spawns = [];
    // First tile, all tiles will have same schema of data
    self.map = [{
      index: 0,
      name: "the center",
      range: 0,
      adjacents: [1,2,3,4,5,6],
      ownedBy: null,
      pPT: 20,
      scores: {alpha:0,beta:0,gamma:0},
      players: { // players of each team on the tile
        alpha: {},
        beta: {},
        gamma: {}
      },
      turrets: { // turrets of each team on the tile
        alpha: [],
        beta: [],
        gamma: []
      }
    }];
    console.log('Mapping...'.green);
    var start = Date.now();
    self.generate();
    var duration = Date.now() - start;
    console.log('Map generated %s tiles in %s ms.'.green, self.map.length, duration);
    return self.map;
  },

  generate: function() {
    var self = this;

    var game = require(__dirname+'/game.js');
    // Not really elegant but easiest way to clone an object:
    self.teams =  JSON.parse(JSON.stringify(game.teamsNames));

    // map size is the range of the map
    for (var i=0;i<=conf.map.size;i++) {
      self.generateRange(i);
    }

    // Once the map is generated
    // we sort the array `adjacents`
    for (var i=0;i<self.map.length;i++) {
      self.map[i].adjacents.sort(function(a, b){return a-b});
    }
  },

  generateRange: function(range) {
    var self = this;

    var newTile = {};
    var index = 0;

    var temp1, temp2, diff; // so we don't declare var in the loop
    // each range has a multiple of 6 number of tiles
    for (var i=1;i<=range*6;i++) {
      index = self.nbOfTiles;
      newTile = {
        index: index,
        name: range+'-'+i,
        range: range,
        adjacents: []
      };


      /*
       * Set adjacents tiles
      */
      // Ranges 0 and 1 are a bit particular
      if (range === 1)
        newTile.adjacents.push(0);

      // Everytime we add a tile we set the link with the
      // tiles of the previous range and the tiles that
      // are already setted in this range

      // The adjacent tiles in the same range
      if (range > 0) {
        if (i === 1)
          newTile.adjacents.push((index-1)+(range*6), index+1);
        else if (i === range*6)
          newTile.adjacents.push(index-1, (index+1)-(range*6));
        else
          newTile.adjacents.push(index-1, index+1);
      }

      // The adjacent tiles in the previous range
      if (range > 1) {
        // "angles" of the map have one adjoining tile
        if (index%range === 0) {
          temp1 = index-(range-1)*6-(i/range);
          newTile.adjacents.push(temp1);
          self.map[temp1].adjacents.push(index);
        }
        // others tiles have two adjoining tiles
        else {
          diff = index%range;
          temp1 = (index-diff)-(range-1)*6-((i-diff)/range)+(diff);
          if (i === 1)
            temp2 = index - 1;
          else
            temp2 = temp1 - 1;

          newTile.adjacents.push(temp1, temp2);
          self.map[temp1].adjacents.push(index);
          self.map[temp2].adjacents.push(index);
        }
      }


      /*
       * Tiles properties
      */
      // set game infos
      newTile.ownedBy = null;
      newTile.scores = {alpha:0,beta:0,gamma:0},
      newTile.players = { // players of each team on the tile
        alpha: {},
        beta: {},
        gamma: {}
      };
      newTile.turrets = {
        alpha: [],
        beta: [],
        gamma: []
      };

      newTile.pPT = 0; // points per tick
      // set team's bases
      if (range === conf.map.size && (index/range)%2 === 0) {
        newTile.ownedBy = self.teams[0];
        newTile.name = self.teams[0] + ' base';
        newTile.scores[self.teams[0]] = 100;
        newTile.spawn = self.teams.splice(0, 1)[0];
        self.spawns.push(index);
      }
      else {
        var ptsRand = Math.floor(Math.random()*10)+1;
        // 40%: 1 point/tick
        if (ptsRand <= 4)
          newTile.pPT = 1;
        // 30%: 3 points/tick
        else if (ptsRand <= 7)
          newTile.pPT = 3;
        // 20%: 5 points/ticks
        else if (ptsRand <= 9)
          newTile.pPT = 5;
        // 10%: 10 points/ticks
        else if (ptsRand == 10)
          newTile.pPT = 10;

        // AVERAGE: 3.5 p/t
      }


      /*
       * Add the tile
      */
      self.map.push(newTile);
      self.nbOfTiles++;
    }
  }
};


module.exports = mapper;
