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

- [Back] Generate and save in DB the map of the game (*i.e* a big big json file)
- [Front] Render the map in SVG ([svg.js](http://svgjs.com/) or [Snap.js](http://snapsvg.io/))
- [Back] Set-up the game loop, the `ticker`, it will update the map/game and send web sockets of the new data to the connected players every 100ms.
- [Back] Save the state of the map/game in the DB (it doesn't need to be done in the ticker as we can do it every # minutes)
- [Back] Handle mails to confirm accounts ([Nodemailer](http://www.nodemailer.com/))

From here, the back-end will be almost done, and we'll be ready to code the actual game, *i.e*, moving players on the map and make them **fight**!
