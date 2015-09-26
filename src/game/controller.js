var p2 = require('p2');
var Ship = require('./entities/Ship');

var world = new p2.World({
    gravity:[0, 0]
});


var playerId = 0; // incrementing player id
var shipMap = {};
var timeStep = 1 / 30;
setInterval(function(){
    world.step(timeStep);
}, 1000 * timeStep);

module.exports = {
    newPlayer: function (playerName) {
        var newShip = new Ship({
            p2: p2, // p2 passed to entity to allow sharing of entities between client/browser
            id: playerId++,
            playerName: playerName
        });
        shipMap[newShip.id] = newShip;
        return newShip;
    }
};