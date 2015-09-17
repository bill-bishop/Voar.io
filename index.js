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


io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('thrust', function (ship) {
        console.log('thrust: ' + ship);
        io.emit('thrust', ship);
    });
});

http.listen(port, function () {
    console.log('listening on *:' + port);
});