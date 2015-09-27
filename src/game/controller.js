var physics = require('./physics');
var playerId = 0; // incrementing player id
var shipMap = {};

module.exports = {
    newPlayer: function (playerName) {
        var newShip = new physics.Ship({
            id: playerId++,
            playerName: playerName
        });
        shipMap[newShip.id] = newShip;
        return newShip;
    }
};


var timeStep = 1;
setInterval(function(){
    //physics.orbitStep;
}, 1000 * timeStep);