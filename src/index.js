/**
 * Created by william mcmillian on 9/17/15.
 */

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 5000;

var controller = require('./game/controller');

io.on('connection', function (socket) {
    console.log('player connected');
    socket.on('newPlayer', function (playerName) {
        socket.player = controller.newPlayer(playerName);
        socket.emit('playerId', socket.player.id);
    });
});


app.use(express.static(__dirname + '/webroot'));
http.listen(port, function () {
    console.log('listening on port ' + port);
});

