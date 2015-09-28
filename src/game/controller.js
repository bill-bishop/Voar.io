var physics = require('./physics');
var Ship = require('./entities/Ship');
var Planet = require('./entities/Planet');
var playerId = 0; // incrementing player id
var shipMap = {};


// game options
var dt = 25;
var rkm = 40000; // initial distance from earth in km
var vrkm = -1.0; // initial radial velocity in km
var vthetakm = 2.0; // initial tangential velocity in km/s
var earth = Planet.EARTH;

var entities = [];

var controller = {
    players: [],
    newPlayer: function (playerName, gameEntity) {
        var newShip = new Ship({
            id: playerId++,
            gameEntity: gameEntity,
            playerName: playerName,
            position: new physics.Position(rkm * 1000, 0),
            velocity: new physics.Velocity(vrkm * dt * 1000, vthetakm * dt / rkm)
        });
        shipMap[newShip.id] = newShip;
        this.players.push(newShip);
        return newShip;
    },
    step: function (steps) {
        if(!this.players.length) return;
        physics.gravity.orbitStep(this.players, earth, dt, steps);
    }
};
module.exports = controller;

/*

var ship = controller.newPlayer('test-player');

var timeInterval = 250, steps = 600, scale = .00001, elapsed = 0;
var loop = setInterval(function () {
    elapsed += dt * steps;

    physics.gravity.orbitStep(ship, earth, dt, steps);

    if(ship.position.theta > Math.PI * 2) { // stop after one rotation
        clearInterval(loop);
    }

}, timeInterval);*/
