# Conquest

RTS game.
Made with with modern Web technologies. 

[Koa](http://koajs.com/) requires **node 0.11.9 or higher**.
You can use [n](https://www.npmjs.org/package/n), [nvm](https://www.npmjs.org/package/nvm) or  [nvmw](https://www.npmjs.org/package/nvmw) to manage several versions of node.

## Getting starterd

```
    $ npm i -g duo
    $ cd conquest
    $ npm i
    $ npm start
```

You also need to run MongoDB.

`server.js` runs Gulp for you. So you don't even need to have it installed globally.


## RoadMap

### The Game
- [Front] Integrate information panels
- [Back] Save in DB the map and the state of the game
- [Back] Send the map to each teams (i.e: to each room) via sockets
- [Front] Handle the display of the map, players and all informations at each tick
- [Front] Panel to choose the class of the player at (re)spawn (Soldier, Engineer, Medic)
- [Back] Handle fights a tiles capture
- [Front] Display different states of tiles

### Other
- [Back] Handle mails to confirm accounts ([Nodemailer](http://www.nodemailer.com/))
