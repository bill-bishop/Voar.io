// Bridge between PhantomJS instance and Node
function fireEvent (type, data) {
    window.callPhantom({
        eventType: type,
        data: data
    });
}

function spawn (options) {
    fireEvent('spawn request received', options);
}

var loops = [];
var playerName = 'server';

var earth, moon, player, ships, planets, shipCollisionGroup, planetCollisionGroup;
var initX, initY, initVelX = 100, initVelY = -500, initOffset = 370;
var socket, cursors, background, forceType, scale = {factor: 0.5}, shipMap = {};

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

window.destroyGame = function () {
    game.destroy();
    loops.forEach(clearTimeout);
};

window.orbitTest = orbitTest;

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

function preload() {

    game.load.image('ship', 'assets/images/ship.png');
    game.load.image('earth', 'assets/images/earth.png');
    game.load.image('stars', 'assets/images/stars.jpg');

}

function reset() {
    ships.forEach(function (ship) {
        if (ship === player) return;
        ship.body.destroy();
    });
    ships.children = [player];
}


function create() {
    game.stage.disableVisibilityChange = true;
    game.world.setBounds(0, 0, 10000, 10000);
    //background = game.add.tileSprite(0, 0, 500, 500, 'stars');
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    game.physics.p2.restitution = 0.8;

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
    //socket.emit('ship', player.getOptions());
    function updateShip(options) {
        if (options.forEach) return options.forEach(updateShip);

        var ship = shipMap[options.shipId];
        if (ship === player) return;
        ship.body.x = options.x;
        ship.body.y = options.y;
        ship.body.velocity.x = options.velocity.x;
        ship.body.velocity.y = options.velocity.y;
    }

    socket.on('thrust', updateShip);
    socket.on('update', updateShip);
    socket.on('ship', function (options) {
        console.log('creating ship', options);
        Ship(options);
    });
    socket.on('kill', function (options) {
        var ship = shipMap[options.shipId];
        console.log('killing ship', ship);
        ship.kill();
    });
}

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
        name, {font: '25px Arial', fill: '#FFF'});
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

var adjusting = false, scaling = null;

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


function update() {
    gravitate(ships, earth);
    //gravitate(ships, moon);
    align(ships);
    //spiral(moon, earth);
    //gravitate(moon, earth);

    if (player.alive)
        socket.emit('update', player.getOptions());

    ships.forEach(function (ship) {
        if (ship.alive) {
            ship.text.x = ship.body.x - ship.text.width / 2;
            ship.text.y = ship.body.y + ship.height;
        }
    });

    //orbit(earth, {x: game.world.centerX, y: game.world.centerY});
    fixCamera(player.body || earth.body, earth.body);
    game.world.scale.set(.4);

    /*   if(player.alive) {
     background.tilePosition.x = player.body.x;
     background.tilePosition.y = player.body.y;
     }*/

    if (!adjusting && game.input.activePointer.isDown) {
        if (!player.alive) {
            player = Player();
            socket.emit('ship', player.getOptions());
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

function orbit(satellite, orbitTarget) {
    satellite = satellite.body || satellite;
    orbitTarget = orbitTarget.body || orbitTarget;
    var period = game.time.now * .00001;
    var xRad = 2500, yRad = 2500;
    satellite.x = orbitTarget.x + Math.cos(period) * xRad;
    satellite.y = orbitTarget.y + Math.sin(period) * yRad;
}


var period = 0;

function spiral(satellite, target) {
    satellite = satellite.body || satellite;
    target = target.body || target;

    period += .1;
    var a = 1, b = 1;
    satellite.x = target.x + a * Math.cos(period) * Math.pow(Math.E, b * period);
    satellite.y = target.y + b * Math.sin(period) * Math.pow(Math.E, b * period);
}

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

function sqr(n) {
    return n * n;
}

function interval(x, n) {
    return Math.floor(x / n) * n;
}

function gravitationalForce(a, b) {
    a = a.body;
    b = b.body;

    var G = Math.pow(6.67, -11);
    var r = Math.sqrt(sqr(b.x - a.x) + sqr(b.y - a.y));

    //F
    return G * a.mass * b.mass / Math.pow(r, Number($('#distance-power').value));
}

function direction(body) {
    return Math.atan2(body.velocity.y, body.velocity.x);
}

// gravitates obj1 towards obj2
// either object can be a collection


var updateFrequency = 1;

function gravitate(obj1, obj2) {
    if (game.time.now % 100 > 100 * updateFrequency) return;
    if (obj1.forEach) {
        obj1.forEach(function (o) {
            gravitate(o, obj2);
        });
        return;
    }
    if (obj2.forEach) {
        obj2.forEach(function (o) {
            gravitate(obj1, o);
        });
        return;
    }

    var force = gravitationalForce(obj1, obj2);
    var gravity = {
        x: (obj2.body.x - obj1.body.x) * force,
        y: (obj2.body.y - obj1.body.y) * force
    };

    switch (forceType) {
        case 0:
            obj1.body.force.x = gravity.x;
            obj1.body.force.y = gravity.y;
            break;
        case 1:
            obj1.body.force.x += gravity.x;
            obj1.body.force.y += gravity.y;
            break;
        default:
            obj1.body.velocity.x += gravity.x;
            obj1.body.velocity.y += gravity.y;
    }

    debug.gravity = gravity;
}

function render() {
}