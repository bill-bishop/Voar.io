
var loops = [];
var playerName = localStorage.getItem('playerName') || prompt('Player Name');
localStorage.setItem('playerName', playerName);

var earth, moon, player, ships, planets, shipCollisionGroup, planetCollisionGroup;
var initX, initY, initVelX = 100, initVelY = -500, initOffset = 370;
var socket, cursors, background, forceType, scale = {factor: 0.5}, shipMap = {}, playerId, adjusting, scaling;

var debug = {};
var $ = function (selector) {
    return document.querySelector(selector);
};

var game = new Phaser.Game('100%', '100%', Phaser.AUTO, 'blorbit', {
    preload: preload,
    create: create,
    update: update,
    render: render
});

function preload() {

    game.load.image('ship', 'assets/images/ship.png');
    game.load.image('earth', 'assets/images/earth.png');
    game.load.image('stars', 'assets/images/stars.jpg');

}

function create() {
    game.stage.disableVisibilityChange = true;
    game.world.setBounds(0, 0, 10000, 10000);
    //background = game.add.tileSprite(0, 0, 500, 500, 'stars');
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);

    ships = game.add.group();
    planets = game.add.group();
    shipCollisionGroup = game.physics.p2.createCollisionGroup();
    planetCollisionGroup = game.physics.p2.createCollisionGroup();

    earth = planets.create(0, 0, 'earth');
    moon = planets.create(0, 0, '');

    game.physics.p2.enable([moon, earth]);

    earth.body.x = game.world.centerX;
    earth.body.y = game.world.centerY;
    var earthScale = 1;
    var moonScale = earthScale * 1 / 6;
    earth.scale.set(earthScale);
    moon.scale.set(moonScale);

    moon.body.x = earth.body.x + 600;
    moon.body.y = earth.body.y;

    forceType = Number($('input[name="force-type"][checked]').value);
    earth.body.mass = Number($('#earth-mass').value);
    moon.body.mass = earth.body.mass * moonScale;

//            ship.body.velocity.x = 300;
    //          ship.body.velocity.y = -250;
    moon.body.velocity.x = 0;
    moon.body.velocity.y = 999;
//            earth.body.velocity.x = 0;
//            earth.body.velocity.y = 0;

    earth.body.setCircle(100 * earthScale);
    //moon.body.setCircle(100 * moonScale);

    player = {};

    earth.body.setCollisionGroup(planetCollisionGroup);
    moon.body.setCollisionGroup(planetCollisionGroup);

    planets.forEach(function (planet) {
        planet.body.collides(shipCollisionGroup);
    });

    cursors = game.input.keyboard.createCursorKeys();

    fixCamera(earth.body);


    socket = io();
    socket.emit('newPlayer', 'testName');
    socket.on('playerId', function (id) {
        playerId = id;
        console.log('player id:', id);
    });
}

function update() {
    //gravitate(ships, earth);
    //gravitate(ships, moon);
    align(ships);
    //spiral(moon, earth);
    //gravitate(moon, earth);

    ships.forEach(function (ship) {
        if(ship.alive) {
            ship.text.x = ship.body.x - ship.text.width / 2;
            ship.text.y = ship.body.y + ship.height;
        }
    });

    //orbit(earth, {x: game.world.centerX, y: game.world.centerY});
    fixCamera(player.body || earth.body, earth.body);
    game.world.scale.set(.4);

    if (!adjusting && game.input.activePointer.isDown) {
        if (!player.alive) {
            player = Player();
        }
        else {
            thrust(player);
        }
        adjusting = true;
    }
    else if (game.input.activePointer.isUp) {
        adjusting = false;
    }
}

function render() {
}

// entities

function Player() {
    return Ship({
        playerName: playerName,
        x: earth.body.x - initOffset,
        y: earth.body.y - 0,
        velocity: {
            x: initVelX,
            y: initVelY
        }
    });
}

function Ship(options) {
    var x = options.x, y = options.y,
        velX = options.velocity.x, velY = options.velocity.y,
        name = options.playerName || '', id = options.shipId || Math.floor(Math.random() * 99999);
    var newShip = ships.create(x, y, 'ship');
    newShip.playerName = name;
    newShip.text = game.add.text(game.world.centerX - 200, game.world.centerY,
        name, { font: '25px Arial', fill: '#FFF'});
    newShip.shipId = id;

    var shipScale = 1;
    newShip.scale.set(shipScale);
    game.physics.p2.enable(newShip);
    newShip.body.setRectangle(17 * shipScale, 30 * shipScale);
    newShip.body.setCollisionGroup(shipCollisionGroup);

    newShip.body.mass = 3.5 * Math.pow(10, 5);
    newShip.body.velocity.x = velX;
    newShip.body.velocity.y = velY;

    newShip.body.collides([shipCollisionGroup, planetCollisionGroup], function () {
        newShip.kill();
        if (player === newShip) {
            socket.emit('kill', player.getOptions());
            //socket.emit('kill', body.sprite.getOptions());
        }
        game.world.remove(newShip.text);
    }, this);


    newShip.getOptions = function () {
        return {
            shipId: newShip.shipId,
            playerName: newShip.playerName,
            x: newShip.body.x,
            y: newShip.body.y,
            velocity: {
                x: newShip.body.velocity.x,
                y: newShip.body.velocity.y
            }
        };
    };

    shipMap[id] = newShip;
    return newShip;
}


// helpers

function fixCamera(target, viewTarget) {
    var x = target.x || 0;
    var y = target.y || 0;
    game.camera.x = x * game.world.scale.x - game.width / 2;
    game.camera.y = y * game.world.scale.y - game.height / 2;

    if (viewTarget) {
        var distance = Math.sqrt(sqr(viewTarget.x - target.x) + sqr(viewTarget.y - target.y));
        var adjustedScale = Phaser.Math.clamp(interval(450 / distance, 0.6), 0.6, 1);

        if (adjustedScale !== scale.factor) {
            clearTimeout(scaling);
            scale.factor = adjustedScale;
            scaling = setTimeout(function () {
                game.world.scale.set(scale.factor);
            }, 500);
        }
    }
}

function align(obj) {
    if (obj.forEach) {
        obj.forEach(function (o) {
            align(o);
        });
    }
    else {
        obj.body.rotation = direction(obj.body) + game.math.degToRad(270);
    }
}

function sqr (n) {
    return n * n;
}

function interval(x, n) {
    return Math.floor(x / n) * n;
}

function direction(body) {
    return Math.atan2(body.velocity.y, body.velocity.x);
}

// controls

function thrust(ship) {
    var speedInc = 200;
    var degreeInc = 1 + Math.atan2(ship.body.y - earth.body.y, ship.body.x - earth.body.x);
    var adjustment = {
        x: Math.cos(degreeInc) * speedInc,
        y: Math.sin(degreeInc) * speedInc
    };
    ship.body.velocity.x += adjustment.x;
    ship.body.velocity.y += adjustment.y;

    socket.emit('thrust', ship.getOptions());
}


// gravity calculations

function gravitationalForce(mass, radius) {
    var G = Math.pow(6.67, -11);
    return G * mass / Math.pow(radius, 2);
}

function Position (radial, tangential) {
    this.radial = radial;
    this.tangential = tangential;
}

function gravitate(a, b, dt) {
    var position = a.position;
    var velocity = a.velocity;
    var dr = velocity.radial * dt;
    var dtheta = velocity.tangential * dt;
    var force = gravitationalForce(b.mass, position.radial);

    var radialVelocityIncrease = position.radial + (.5 * dr * Math.pow(dtheta, 2) - force * Math.pow(dt, 2));
    var tangentialVelocityIncrease = 0 - 2 * dr * dtheta / (position.radial + .5 * dr);

    position.radial += dr;
    position.tangential += dtheta;
    velocity.radial += radialVelocityIncrease;
    velocity.tangential += tangentialVelocityIncrease;
}


// debug

function orbitTest() {
    var timeout = 0.1, range = 3000, inc = 200, period = Math.PI / 10;
    for (var offset = 150, i = 0; offset <= 800; offset += inc, i += 50) {
        var error;
        for (var force = range; force > 0; force -= inc) {
            for (var p = 0; p <= Math.PI; p += period, i++) {
                var x = Math.cos(p) * force;
                var y = Math.sin(p) * force;
                (function (x, y, offset) {
                    loops.push(setTimeout(function () {
                        Ship(offset, 0, x, y);
                    }, i * timeout));
                })(x, y, offset);
            }
        }
        if (error) break;
    }
}