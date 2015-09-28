require('../lib/extends');
var controller = require('./controller');



var loops = [];
var playerName = localStorage.getItem('playerName') || prompt('Player Name');
localStorage.setItem('playerName', playerName);

var earth, moon, player = {}, ships, planets, shipCollisionGroup, planetCollisionGroup, graphics;
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
    graphics = game.add.graphics(0, 0);
    //game.physics.startSystem(Phaser.Physics.P2JS);
    //background = game.add.tileSprite(0, 0, 500, 500, 'stars');

    ships = game.add.group();
    planets = game.add.group();

    earth = planets.create(0, 0, '');

    //game.physics.p2.enable([earth]);

    earth.x = game.world.centerX;
    earth.y = game.world.centerY;

    graphics.beginFill(0xB7B7FF, 0.8);
    graphics.drawCircle(earth.x, earth.y, 150);
    graphics.endFill();

    cursors = game.input.keyboard.createCursorKeys();

/*    socket = io();
    socket.emit('newPlayer', 'testName');
    socket.on('playerId', function (id) {
        playerId = id;
        console.log('player id:', id);
    });*/
}

setInterval(function () {
    if(!player.alive) return;
    graphics.beginFill(0xFFFFFF, 0.8);
    graphics.drawCircle(player.gameEntity.x, player.gameEntity.y, 5);
    graphics.endFill();
}, 100);
function update() {
    //align(ships);

    fixCamera(/*player.gameEntity ? player.gameEntity.body : null ||*/ earth, earth);

    controller.step(30);

    controller.players.forEach(function (ship, i) {
        ship.update({
            x: earth.x + earth.width / 5.4,
            y: earth.y + earth.height / 2.4
        });
    });
    game.world.scale.set(.4);

    if (!adjusting && game.input.activePointer.isDown) {
        if (!player.alive) {
            player = Player();
        }
        else {
            player.thrust();
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
    return Ship();
}

function Ship(options) {
    return controller.newPlayer('test-new-player', ships.create(0, 0, 'ship'));
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

function sqr(n) {
    return n * n;
}

function interval(x, n) {
    return Math.floor(x / n) * n;
}

function direction(body) {
    return Math.atan2(body.velocity.y, body.velocity.x);
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

