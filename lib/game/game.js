'use strict';
var path    = require('path');
var co      = require('co');
var request = require('request');
var twit    = require('twit');


var mapper = require(__dirname+'/mapper.js');
var app    = require(path.join(__dirname, '../../server.js'));
var conf   = app.config.game;
var db = require(path.join(__dirname, '../db'));


var game = {
  ticks: 0,
  teamsNames: conf.teams,
  init: function() {
    var self = this;

    // We check in the DB if there is an un-finished game to continue
    co(function*() {
      var lastGame = yield db.games.findOne(
                        {ticks: {$gt: 1}, winner: null, endedAt: null},
                        {limit : 1, sort : {willStartAt: -1}}
                      );

      if (lastGame) {
        console.log("Retrieved game in DB");

        // Re-set the game
        self.id       = lastGame._id;
        self.board    = lastGame.board;
        mapper.map    = lastGame.map;
        self.alpha    = lastGame.teams.alpha;
        self.beta     = lastGame.teams.beta;
        self.gamma    = lastGame.teams.gamma;
        self.ticks    = lastGame.ticks;
        mapper.spawns = lastGame.spawns;

        self.sockets = require(__dirname+'/sockets.js');
        self.ticker();
        return;
      }
      // We create a new game
      else {
        for (var i=0;i<self.teamsNames.length;i++) {
          self[self.teamsNames[i]] = {
            score: 0,
            players: {}
          };
        }

        // Create and get the map
        self.board = mapper.init();

        // Initial save the map in DB
        co(function *() {
          var insertedGame = yield db.games.insert({
            startedAt: null,
            endedAt: null,
            willStartAt: Date.now() + conf.countdown*60*1000,
            ticks: self.ticks,
            board: self.board,
            map: mapper.map,
            spawns: mapper.spawns,
            winner: null,
            teams: {
              alpha: self.alpha,
              beta: self.beta,
              gamma: self.gamma
            }
          });
          self.id = insertedGame._id;
          self.sockets = require(__dirname+'/sockets.js');
          // Start the countdown
          self.waitFotStart(conf.countdown*60*1000);
          return;
        })();
      }
    })();
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
    if (count%1000 === 0)
      self.updateGameTeams();
    if (count > 0) {
      setTimeout(function() {
        self.waitFotStart(count-200);
      }, 200);
    }
    else {
      self.saveMapBegin(Date.now());
      // LAUNCH THE GAME!
      self.ticker();
    }
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

      // This compute and apply all damages,
      // captures and healing
      self.computePoints();

      // Send the updates to the players
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

      // Check for win, or continue the game
      if (self.alpha.score >= conf.win ||
          self.beta.score  >= conf.win ||
          self.gamma.score >= conf.win) {
        var winner = Math.max(self.alpha.score,self.beta.score,self.gamma.score);
        var loosers = [];
        if (self.alpha.score === winner) {winner = 'alpha'; loosers=['beta', 'gamma'];}
        else if (self.beta.score === winner) {winner = 'beta'; loosers=['alpha', 'gamma'];}
        else if (self.gamma.score === winner) {winner = 'gamma'; loosers=['alpha', 'beta'];}
        game.sayYo();
        game.tweet(winner);
        console.log('The '+winner+' team wins');
        self.saveMapState(winner, Date.now(), loosers);

        // start a new game in 5, 4, 3, 2, 1...
        setTimeout(function() {
          game.init();
        }, 5000);
      }
      else {
        // update the map in DB every three minute
        if (self.ticks%((5*60*3)) === 0)
          self.saveMapState(null, null);

        // the delta can be negative (it's like 0)
        // console.log(200-(Date.now()-now));
        setTimeout(tick, (200-(Date.now()-now)));
      }
    })();
  },

  sayYo: function() {
    request.post(
      'http://api.justyo.co/yoall/',
      { form: { 'api_token': app.config.yo.token,
                'link': 'http://conquest.io/lobby' } },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
        }
      }
    );
  },

  tweet: function(winner) {
    var self = this;
    var twitter = new twit({
      consumer_key:       app.config.twitter.consumer_key,
      consumer_secret:    app.config.twitter.consumer_secret,
      access_token:       app.config.twitter.access_token,
      access_token_secret:app.config.twitter.access_token_secret
    });

    // Let's build a tweet
    var w1 = ['epic', 'massive', ''];
    var w2 = ['battle', 'war', 'conflict'];
    var w3 = ['stars', 'space'];
    w1 = w1[Math.floor(Math.random()*w1.length)];
    w2 = w2[Math.floor(Math.random()*w2.length)];
    w3 = w3[Math.floor(Math.random()*w3.length)];

    var tweets = [
      'Another '+w1+' '+w2+' ended on #Conquest! Come and join the '+w3+' explorers to conquer new territories http://conquest.io/lobby',
      'Team '+winner+' just won a massive '+w2+' on #Conquest! Join or fight them, and reign over the '+w3+' http://conquest.io/lobby',
      'A new '+w2+' is starting up on #Conquest in '+app.config.game.countdown+' minutes! Take part in this '+w1+' game and reign over the '+w3+' http://conquest.io/lobby'
    ];

    // We don't want to tweet the same thing twice
    var index;
    do {
      index = Math.floor(Math.random()*tweets.length);
    } while (index === self.lastTweetIndex);

    var tweet = tweets[index];

    twitter.post('statuses/update', { status: tweet }, function(err, data, response) {
      self.lastTweetIndex = index;
    });
  },

  computePoints: function() {
    var self = this;

    // boolean, scores a computed every 2 seconds
    var incrementScore = (self.ticks%10 === 0);

    // Check if a team got all the center
    if (incrementScore && self.scoreBonus())
      self[self.board[0].ownedBy].score += 20;

      // Loop through all the tiles
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
              for (var _team in tile.players) {
                for (var username in tile.players[_team]) {
                  player = self[_team].players[username];
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
              game.sockets.sendPositionToTurret(null, false, player.turret);
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
        game.sockets.updateGoldTurret(player.turret, player.gold);
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
    var player = self.findOrJoinTeam(user.username, user.email, user.bitly);
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
        game.board[d.position].players[player.team][username] = player.faction;
        var canSpawnTurret = true;
        if (game.board[d.position].name.indexOf(' ') > -1)
            canSpawnTurret = false;
        game.sockets.sendPositionToTurret(game.board[d.position].name, canSpawnTurret, player.turret);
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
      game.board[d.position].players[player.team][username] = player.faction;
      var canSpawnTurret = true;
      if (game.board[d.position].name.indexOf(' ') > -1)
          canSpawnTurret = false;
      game.sockets.sendPositionToTurret(game.board[d.position].name, canSpawnTurret, player.turret);
    }
  },

  upgradeSkill: function(d, team) {
    var username = this.request.user.username;
    var player   = game[team].players[username];
    var faction  = player.factions[player.faction];

    if (faction.skillPts) {
      if (d.skill == 'maxLife') {
        faction.maxLife += 10;
        faction.life = faction.maxLife;
        faction.skillPts--;
      }
      else if (d.skill == 'dmg' || d.skill == 'capt' || d.skill == 'heal') {
        faction[d.skill] += 1;
        faction.skillPts--;
      }
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

  // Retrieve player or create it
  findOrJoinTeam: function(username, email, bitly) {
    var self = this;
    var player = self.findInTeam(username);

    // Retrieve the player
    if (player) {
      game.sockets.broadcastJoinMessage(username, player.team, false);
      return player;
    }

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
    if (nbInAlpha+nbInBeta+nbInGamma < conf.maxPlayers*3) {
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
      self.savePlayerGames(email);
      game.sockets.broadcastJoinMessage(username, player.team, true);
      return player;
    }
    return false;
  },


  /**
    * TURRETS
  */
  // Create the turret of a player
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
  },

  upDmgTurret: function(team) {
    var username = this.request.turretOwner;
    var player = game[team].players[username];
    if (player.gold > 0) {
      player.gold--;
      player.turret.dmg++;
      game.sockets.updateTurret(player.turret);
      game.sockets.updateGoldTurret(player.turret, player.gold);
    }
  },

  upLifeTurret: function(team) {
    var username = this.request.turretOwner;
    var player = game[team].players[username];
    if (player.gold > 0) {
      player.gold--;
      player.turret.maxLife += 10;
      game.sockets.updateTurret(player.turret);
      game.sockets.updateGoldTurret(player.turret, player.gold);
    }
  },


  /**
    * DB
  */
  //add the game id to player's game
  savePlayerGames: function(email) {
    var self = this;
    co(function *() {
      var insertedUser = yield db.users.findAndModify({ email: email }, { $push: {
        games: self.id
      }});
      return;
    })();
  },

  // save the map in the DB
  saveMapState: function(winner, endDate, loosers) {
    var self = this;
    var data = {
      endedAt: endDate,
      ticks: self.ticks,
      board: self.board,
      winner: winner,
      teams: {
        alpha: self.alpha,
        beta: self.beta,
        gamma: self.gamma
      }
    };

    // If the game is finished we wait for it to be saved (using co and yield)
    if (winner) {
      co(function*() {
        yield db.games.findAndModify({ _id: self.id }, { $set: data});
        game.sockets.sendResult(winner, loosers);
      })();
    }
    // If the game is still running we just save it
    else
      db.games.findAndModify({ _id: self.id }, { $set: data});
    console.log('Game updated in DB'.green);
    return;

  },
  saveMapBegin: function(start) {
    var self = this;
    var insertedGame = db.games.findAndModify({ _id: self.id }, { $set: {
      startedAt: start,
      teams: {
        alpha: self.alpha,
        beta:  self.beta,
        gamma: self.gamma
      }
    }});
    console.log('Game updated in DB'.green);
    return;
  },
  updateGameTeams: function(start) {
    var self = this;
    var insertedGame = db.games.findAndModify({ _id: self.id }, { $set: {
      teams: {
        alpha: self.alpha,
        beta:  self.beta,
        gamma: self.gamma
      }
    }});
    return;
  }
};


module.exports = game;
