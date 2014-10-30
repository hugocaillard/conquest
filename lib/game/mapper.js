'use strict';
var colors = require('colors');
var path   = require('path');

var app  = require(path.join(__dirname, '../../server.js'));
var conf = app.config.game;

var mapper = {
  map: [{
    index: 0,
    name: "The center",
    range: 0,
    adjacents: [1,2,3,4,5,6]
  }],

  nbOfTiles: 1,
  spawns: [],

  init: function() {
    var self = this;
    console.log('Mapping...'.green);
    var start = Date.now();
    self.generate();
    var duration = Date.now() - start;
    console.log('Map generated %s tiles in %s ms.'.green, self.map.length, duration);
  },

  generate: function() {
    var self = this;

    var game = require(__dirname+'/game.js');
    // Not really elegant but easiest way to clone an object:
    self.teams =  JSON.parse(JSON.stringify(game.teams));

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
      // set team's bases
      if (range === conf.map.size && (index/range)%2 === 0) {
        newTile.spawn = self.teams.splice(0, 1)[0];
        self.spawns.push(index);
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
//module.exports.map = mapper.map;
