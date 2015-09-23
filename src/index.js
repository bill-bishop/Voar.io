/**
 * Created by william mcmillian on 9/17/15.
 */

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/webroot'));
app.use(express.static(__dirname + '/game'));

io.on('connection', function (socket) {
    console.log('player connected');
});

http.listen(port, function () {
    console.log('listening on port ' + port);
});
