var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 5000;
var browserify = require('browserify');
require('./lib/extends');
var controller = require('./game/controller');

io.on('connection', function (socket) {
    console.log('player connected');
    socket.on('newPlayer', function (playerName) {
        socket.player = controller.newPlayer(playerName);
        socket.emit('playerId', socket.player.id);
    });
});


app.use(express.static(__dirname + '/webroot'));

app.get('/app.js', function (req, res) {
    res.setHeader('content-type', 'application/javascript');
    var b = browserify(__dirname + '/game/client.js').bundle();
    b.on('error', console.error);
    b.pipe(res);
});

http.listen(port, function () {
    console.log('listening on port ' + port);
});


