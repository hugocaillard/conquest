var _ = require('../tools.js');
var mapData = require('../mapData.js')
var svg = require('wout/svg.js');
var sockets = require('../sockets.js')

var map = {
  player: {},
  currentPos: null,
  showPlayer: function(player) {
    var self = this;
    self.player = player;

    if (self.currentPos !== null)
      self.currentPos.element.back().stroke({'width': .5});

    var tile = mapData.board[player.position];
    tile.element.front().stroke({'width': 4});

    self.currentPos = tile;
  },

  tileClick: function(e) {
    var index = parseInt(e.toElement.id);
    if (mapData.board[index].adjacents.indexOf(self.player.position) > -1) {
      sockets.move(index)
    }
  },

  // INITAL DISPLAY OF THE MAP
  drawMap: function() {
    var self = this;

    /** SVG.JS */
    var boardContainer = SVG('board');
    var tiles   = boardContainer.group();
    var hexagon = null;
    var coords  = null;
    var t       = null;


    var colors = {'alpha': '#DD4B39', 'beta': '#7AB800', 'gamma': '#4183C4'};

    for(var i=0;i<mapData.board.length;i++) {
      t = mapData.board[i];

      coords = t.angles[0].x+','+t.angles[0].y+' '+
               t.angles[1].x+','+t.angles[1].y+' '+
               t.angles[2].x+','+t.angles[2].y+' '+
               t.angles[3].x+','+t.angles[3].y+' '+
               t.angles[4].x+','+t.angles[4].y+' '+
               t.angles[5].x+','+t.angles[5].y;

      if (i<1)
        hexagon = tiles.polygon(coords).fill('#'+i+i+i).stroke({width: .5});
      else
        hexagon = tiles.polygon(coords)
                  .fill('#999')
                  .stroke({width: .5, color: '#222'});

      if (t.spawn) {
        hexagon.fill(colors[t.spawn]);
      }

      hexagon.attr('id', i);
      hexagon.attr('name', t.id);
      hexagon.attr('data-rank', i);
      mapData.board[i].element = hexagon;
      hexagon.on('click', self.tileClick);
    }

    // center the map
    tiles.move(_.getWindowWidth()/2, _.getWindowHeight()/2);
    window.addEventListener('resize', function() {
      tiles.move(_.getWindowWidth()/2, _.getWindowHeight()/2);
    });

    this.setupMapInterractions(boardContainer, tiles);
  },

  setupMapInterractions: function(boardContainer, tiles) {
    var self = this;
    var scale = 1;

    self.readyToMove = false;
    boardContainer.on('mousedown', function() {
      self.readyToMove = true;
    });

    boardContainer.on('mouseup', function() {
      self.readyToMove = false;
    });

    boardContainer.on('mousemove', function(e) {
      if (self.readyToMove) {
        window.requestAnimationFrame(function() {
          tiles.dmove(e.movementX/scale, e.movementY/scale);
        });
      }
    });

    var deltaX=0,deltaY=0,newDeltaX=0,newDeltaY=0,tx=0,ty=0;
    boardContainer.on('mousewheel', function(e) {
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

module.exports = map;
