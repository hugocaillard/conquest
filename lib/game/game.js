'use strict';
var path = require('path');

var mapper = require(__dirname+'/mapper.js');
var app    = require(path.join(__dirname, '../../server.js'));
var conf   = app.config.game;

var game = {
  ticks: 0,
  teamsNames: conf.teams,
  init: function() {
    var self = this;
    for (var i=0;i<self.teamsNames.length;i++) {
      self[self.teamsNames[i]] = {
        score: 0,
        players: {}
      };
    }

    self.board = mapper.init();
    self.sockets = require(__dirname+'/sockets.js');
    self.waitFotStart(conf.countdown*60*1000)
  },

  waitFotStart: function(count) {
    var self = this;
    self.sockets.countDown(
      count,
      self.teamsNames,
      {
        alpha  : self.alpha,
        beta   : self.beta,
        gamma  : self.gamma
      }
    );
    if (count > 0) {
      setTimeout(function() {
        self.waitFotStart(count-200)
      }, 200);
    }
    else
      self.ticker();
  },

  /**
    * MAIN GAME LOOP
  */
  ticker: function() {
    console.log('Game starts'.green);
    var self = this;
    var now = 0, delta = 0;

    (function tick() {
      self.ticks+= 1;
      now = Date.now();

      self.computePoints();

      self.sockets.tick(
        self.ticks,
        self.board,
        self.teamsNames,
        // maps
        self.getTeamsMaps(self.board, {
          alpha: {},
          beta: {},
          gamma: {}
        }),
        // teams (scores and players)
        {
          alpha  : self.alpha,
          beta   : self.beta,
          gamma  : self.gamma
        }
      );

      // the delta can be negative (it's like 0)
      if (self.alpha.score >= conf.win ||
          self.beta.score  >= conf.win ||
          self.gamma.score >= conf.win) {
        console.log('win');
        game.sayYo();
        game.init(); // restart
      }
      else {
        // console.log(200-(Date.now()-now));
        setTimeout(tick, (200-(Date.now()-now)));
      }
    })();
  },

  sayYo: function() {
    //Setup the yo request
    var request = require('request');

    request.post(
      'http://api.justyo.co/yoall/',
      { form: { 'api_token': app.config.yo.token,
                'link': 'http://google.com' } },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
        }
      }
    );
  },


  computePoints: function() {
    var self = this;

    var incrementScore = (self.ticks%10 === 0);
    if (incrementScore && self.scoreBonus())
      self[self.board[0].ownedBy].score += 20;

    for (var tile in self.board) {
      tile = self.board[tile];

      if (incrementScore && tile.ownedBy)
        self[tile.ownedBy].score += tile.pPT;

      // Retrieve capture stats of each team
      // Also apply DAMAGES
      var pts = self.getTeamsPoints(tile);
      var player = null;

      /**
        * compute CAPTURE pts
      */
      if (pts && pts.capt) {
        var team = null, score = 0, enemyTeam = null;
        if (pts.capt.alpha>pts.capt.beta && pts.capt.alpha>pts.capt.gamma && tile.scores.alpha < 100) {
          team = "alpha";
          score = pts.capt.alpha - Math.max(pts.capt.beta, pts.capt.gamma);
          if (tile.scores.beta || tile.scores.gamma)
            enemyTeam = (tile.scores.beta > tile.scores.gamma) ? "beta" : "gamma";
        }
        else if (pts.capt.beta>pts.capt.alpha && pts.capt.beta>pts.capt.gamma && tile.scores.beta < 100) {
          team = "beta";
          score = pts.capt.beta - Math.max(pts.capt.alpha, pts.capt.gamma);
          if (tile.scores.alpha || tile.scores.gamma)
            enemyTeam = (tile.scores.alpha > tile.scores.gamma) ? "alpha" : "gamma";
        }
        else if (pts.capt.gamma>pts.capt.alpha && pts.capt.gamma>pts.capt.beta && tile.scores.gamma < 100) {
          team = "gamma";
          score = pts.capt.gamma - Math.max(pts.capt.alpha, pts.capt.beta);
          if (tile.scores.alpha || tile.scores.beta)
            enemyTeam = (tile.scores.alpha > tile.scores.beta) ? "alpha" : "beta";
        }

        // Apply the capture points
        if (team && score && self.tileCanBeCapture(tile, team)) {
          var doCompute = true;
          if (enemyTeam) {
            doCompute = false;
            tile.scores[enemyTeam] -= score;
            if (tile.scores[enemyTeam] <= 0) {
              score = -tile.scores[enemyTeam]; // we have to re-add this points to the team
              doCompute = true; // so we do compute
              tile.scores[enemyTeam] = 0; // never goes lower
              tile.ownedBy = null;
            }
          }

          if (doCompute) {
            tile.scores[team] += score;
            if (tile.scores[team] >= 100) {
              tile.scores[team] = 100; // never goes higher
              tile.ownedBy = team;
              for (var team in tile.players) {
                for (var username in tile.players[team]) {
                  player = self[team].players[username];
                  if (player.faction === 'engineer')
                    player.factions[player.faction].xp += 20;
                  else
                    player.factions[player.faction].xp += 10;

                  this.checkLevelUp(player);
                }
              }
            }
          }
        }


        /**
          * Apply HEALING points and check death
        */
        var medics = [], initialHeal = 0;
        var delta = 0;
        for (var team in tile.players) {
          initialHeal =  pts.heal[team];

          for (var username in tile.players[team]) {
            player = self[team].players[username];

            if (player.faction === 'medic')
              medics.push(player);

            if (player.factions[player.faction].life <= 0) {
              // dead
              delete tile.players[player.team][username];
              player.position = null;
              // but ready to respawn
              player.factions[player.faction].life = player.factions[player.faction].maxLife;
            }
            else {
              player = player.factions[player.faction];
              // heal
              if (player.life < player.maxLife && pts.heal[team] > 0) {
                delta = player.life;
                player.life += pts.heal[team];
                if (player.life > player.maxLife) player.life = player.maxLife;
                pts.heal[team] -= player.life - delta;
              }
            }
          }

          // Give XP to the medics
          if (initialHeal > 0 && (initialHeal - pts.heal[team])/medics.length > 0) {
            delta = Math.ceil((initialHeal - pts.heal[team])/medics.length);
            for (var j=0; j<medics.length; j++) {
              medics[j].factions.medic.xp += delta;
              this.checkLevelUp(medics[j]);
            }
          }

        }

      }
    }
  },

  /**
    * CAPTURE, DAMAGES & HEALING FUNCTIONS
  */
  tileCanBeCapture: function(tile, team) {
    var self = this;
    if (!tile.spawn) {
      for (var i=0;i<tile.adjacents.length;i++) {
        if (self.board[tile.adjacents[i]].ownedBy === team) return true;
      }
    }
    return false;
  },

  getTeamsPoints: function(tile) {
    var self = this;
    var points = {};
    points.capt = {
      alpha: 0,
      beta: 0,
      gamma: 0
    };
    points.heal = {
      alpha: 0,
      beta: 0,
      gamma: 0
    };
    var doSend = false;

    // loop in all the players in all the team on a tile
    var player, turret, dmgEnemy = 0;
    for (var team in tile.players) {
      var enemies = [], turrets = [];
      if (team === 'alpha') {
        enemies = self.getEnemies(tile.players.beta, tile.players.gamma);
        turrets = turrets.concat(tile.turrets.beta, tile.turrets.gamma);
      }
      else if (team === 'beta') {
        enemies = self.getEnemies(tile.players.alpha, tile.players.gamma);
        turrets = turrets.concat(tile.turrets.alpha, tile.turrets.gamma);
      }
      else if (team === 'gamma') {
        enemies = self.getEnemies(tile.players.alpha, tile.players.beta);
        turrets = turrets.concat(tile.turrets.alpha, tile.turrets.beta);
      }


      for (var username in tile.players[team]) {
        player = self[team].players[username];
        if (player.faction) {
          doSend = true;
          if (self.tileCanBeCapture(tile, team))
            points.capt[team] += player.factions[player.faction].capt;

          // Compute all the damages and apply it to turrets or enemies
          if (enemies.length && turrets.length) {
            dmgEnemy = Math.floor(Math.random()*2);
            if (dmgEnemy) self.applyDmg(tile, player, enemies, null);
            else          self.applyDmg(tile, player, null, turrets);
          }
          else if (enemies.length)
            self.applyDmg(tile, player, enemies, null);
          else if (turrets.length)
            self.applyDmg(tile, player, null, turrets);

          // Save the healing points to apply it later
          points.heal[team] += player.factions[player.faction].heal;
        }
      }

      for (var i=0; i<tile.turrets[team].length; i++) {
        player = self[team].players[tile.turrets[team][i]];
        turret = player.turret;
        if (enemies.length && turrets.length) {
          dmgEnemy = Math.floor(Math.random()*2);
          if (dmgEnemy) self.applyTurretDmg(tile, turret, enemies, null);
          else          self.applyTurretDmg(tile, turret, null, turrets);
        }
        else if (enemies.length)
          self.applyTurretDmg(tile, turret, enemies, null);
        else if (turrets.length)
          self.applyTurretDmg(tile, turret, null, turrets);
      }
    }
    if (doSend)
      return points;
    else
      return null;
  },

  applyDmg: function(tile, player, enemies, turrets) {
    if (enemies) {
      var enemy = this.findInTeam(enemies[Math.floor(Math.random()*enemies.length)]);
      enemy = enemy.factions[enemy.faction];
      var faction = player.factions[player.faction];

      enemy.life -= faction.dmg;
      if (enemy.life < 0) {
        faction.xp += faction.dmg + enemy.life;
        enemy.life = 0;
      }
      else
        faction.xp += faction.dmg;

      this.checkLevelUp(player);
    }
    else if (turrets) {
      var enemyTurret = this.findInTeam(turrets[Math.floor(Math.random()*turrets.length)]).turret;
      var faction = player.factions[player.faction];
      this.dmgToTurret(tile, enemyTurret, faction.dmg)
    }
  },

  applyTurretDmg: function(tile, turret, enemies, turrets) {
    if (enemies) {
      var enemy = this.findInTeam(enemies[Math.floor(Math.random()*enemies.length)]);
      enemy = enemy.factions[enemy.faction];
      enemy.life -= turret.dmg;
      if (enemy.life < 0)
        enemy.life = 0;
    }
    else if (turrets) {
      var enemyTurret = this.findInTeam(turrets[Math.floor(Math.random()*turrets.length)]).turret;
      this.dmgToTurret(tile, enemyTurret, turret.dmg)
    }
  },

  dmgToTurret: function(tile, turret, dmg) {
    if (turret.position !== null) {
      turret.life -= dmg;
      if (turret.life <= 0) {
        tile.turrets[turret.team].splice(tile.turrets[turret.team].indexOf(turret.owner), 1);
        turret.life = turret.maxLife;
        turret.position = null;
      }
      if (turret.socketID !== null)
        this.sockets.updateTurret(turret);
    }
  },

  scoreBonus: function() {
    var self = this;
    // if the seven tiles of the middle
    // are owned by the same team
    return (self.board[0].ownedBy &&
      self.board[0].ownedBy === self.board[1].ownedBy &&
      self.board[0].ownedBy === self.board[2].ownedBy &&
      self.board[0].ownedBy === self.board[3].ownedBy &&
      self.board[0].ownedBy === self.board[4].ownedBy &&
      self.board[0].ownedBy === self.board[5].ownedBy &&
      self.board[0].ownedBy === self.board[6].ownedBy
    );
  },

  getEnemies: function(teamA, teamB) {
    var a = [];
    for (var username in teamA) {a.push(username)}
    for (var username in teamB) {a.push(username)}
    return  a;
  },

  // Level up if needed
  checkLevelUp: function(player) {
    if (player.faction) {
      var faction = player.factions[player.faction];
      var toReach = faction.level * 100;
      while (faction.xp >= toReach) {
        player.gold++;
        faction.level++;
        faction.skillPts++;
        faction.xp -= toReach;
        toReach = faction.level * 100;
      }
    }
  },

  /**
    * WHICH PART OF THE MAP TO SEND TO EACH TEAM
  */
  getTeamsMaps: function(board, maps) {
    // Get all the tiles that each team can see
    //  - if the tile is owned by the team
    //  - if a player of the team is on the tile
    //  - all adjacents tiles to the previous ones
    var tile = null;
    for (var i=0; i<board.length; i++) {
      tile = board[i];
      if (tile.ownedBy) {
        if (!maps[tile.ownedBy][i]) maps[tile.ownedBy][i] = tile;
        this.adjTilesToMap(board,maps[tile.ownedBy], tile);
      }
      for (var team in tile.players) {
        if (Object.keys(tile.players[team]).length) {
          if (!maps[team][i]) maps[team][i] = tile;
          this.adjTilesToMap(board,maps[team], tile);
        }
      }

    }
    return maps;
  },

  // Add all the adjacent tile to the map of the team
  adjTilesToMap: function(board, map, center) {
    for (var i=0;i<center.adjacents.length;i++) {
      if (!map[center.adjacents[i]])
        map[center.adjacents[i]] = board[center.adjacents[i]]
    }
  },


  /**
    * PLAYERS
  */
  // A player joins for the first time
  join: function(user, cb) {
    var self = this;
    var player = self.findOrJoinTeam(user.username, user.bitly);
    cb.call(self, player);
  },

  // A player moves
  movePlayer: function(d, team) {
    var username = this.request.user.username;
    var player   = game[team].players[username];
    if (player) {
      var tile = game.board[player.position];
      // Check if the user can move
      if (tile && tile.adjacents.indexOf(d.position) > -1) {
        delete tile.players[player.team][username];
        player.position = d.position;
        game.board[player.position].players[player.team][username] = player.faction;
      }
    }
  },

  setFaction: function(d, team) {
    var username = this.request.user.username;
    var player   = game[team].players[username];

    if (game.board[d.position] &&
        game.board[d.position].ownedBy === player.team) {
      player.position = d.position;
      player.faction = d.faction;
      game.board[player.position].players[player.team][username] = player.faction;
    }
  },


  // Get the team of a player
  findInTeam: function(username) {
    if (!username) return null;
    var self = this;

    for (var i=0;i<self.teamsNames.length;i++) {
      if (self[self.teamsNames[i]].players[username])
        return self[self.teamsNames[i]].players[username];
    }
    return null;
  },

  findOrJoinTeam: function(username, bitly) {
    var self = this;
    var player = self.findInTeam(username);

    // Retrieve the player
    if (player) return player;

    // The player is joining for the 1st time
    var player = {
      team: null,
      position: null,
      faction: null,
      gold: 0,
      bitly: bitly,
      factions: {
        soldier : {level:1,skillPts:1,xp:0, maxLife:50 ,life:50 ,dmg:5,capt:1, heal:0},
        engineer: {level:1,skillPts:1,xp:0, maxLife:100,life:100,dmg:1,capt:20,heal:0},
        medic   : {level:1,skillPts:1,xp:0, maxLife:70 ,life:70 ,dmg:0,capt:1, heal:4}
      }
    };
    var nbInAlpha = Object.keys(self.alpha.players).length;
    var nbInBeta  = Object.keys(self.beta.players).length;
    var nbInGamma = Object.keys(self.gamma.players).length;
    if (nbInAlpha === nbInGamma) {
      console.log('A player joined the alpha team.');
      player.team = "alpha";
      self.alpha.players[username] = player;
    }
    else if (nbInBeta === nbInGamma) {
      console.log('A player joined the beta team.');
      player.team = "beta";
      self.beta.players[username] = player;
    }
    else {
      console.log('A player joined the gamma team.');
      player.team = "gamma";
      self.gamma.players[username] = player;
    }
    return player;
  },


  /**
    * TURRETS
  */
  setTurret: function(username, player, socketID) {
    if (player.turret === undefined) {
      player.turret = {
        team    : 'alpha',
        socketID: socketID,
        owner   : username,
        position: null,
        life    : 50,
        maxLife : 50,
        dmg     : 1
      }
    }
    else {
      player.turret.socketID = socketID;
    }
  },

  deployTurret: function(team) {
    var username = this.request.turretOwner;
    var player = game[team].players[username];

    if (player.position !== null && player.turret.position === null) {
      player.turret.position = player.position;
      game.board[player.position].turrets[team].push(username);
      game.sockets.updateTurret(player.turret);
    }
  },

  getBackTurret: function(team) {
    var username = this.request.turretOwner;
    var player = game[team].players[username];

    if (player.turret.position !== null) {
      var turrets = game.board[player.turret.position].turrets[team];
      player.turret.position = null;
      turrets.splice(turrets.indexOf(username), 1);
      game.sockets.updateTurret(player.turret);
    }
  }
};


module.exports = game;
