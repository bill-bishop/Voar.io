/**
 * Created by william mcmillian on 9/17/15.
 */

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/webroot'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/webroot/index.html');
});



var shipMap = {};

io.on('connection', function (socket) {
    for(var id in shipMap) {
        socket.emit('ship', shipMap[id]);
    }
    socket.on('thrust', function (ship) {
        socket.broadcast.emit('thrust', ship);
    });

    socket.on('ship', function (options) {
        shipMap[options.shipId] = options;
        socket.broadcast.emit('ship', options);

        socket.on('disconnect', function () {
            killShip(options);
        });

        console.log('living ships:', Object.getOwnPropertyNames(shipMap));
    });

    socket.on('update', function (options) {
        if(shipMap[options.shipId])
            shipMap[options.shipId] = options;
    });

    socket.on('kill', killShip);

    function killShip (options) {
        if(shipMap[options.shipId]) {
            delete shipMap[options.shipId];
            socket.broadcast.emit('kill', options);
        }
    }
});

http.listen(port, function () {
    console.log('listening on port ' + port);
});