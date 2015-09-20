/**
 * Created by williambishop on 9/19/15.
 */
var phantom = require('node-phantom');

// Bridge for events between PhantomJS instance and node
function EventHandler() {
    this.listeners = {};
    this.on = function (event, handler) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(handler);
    };
    this.broadcast = function (event, data) {
        console.log('msg received: ', event, data);
        (this.listeners[event] || []).forEach(function (handler) {
            handler(data);
        });
    }
}

function parseEvent(msg) {
    if (!msg.eventType) return;
    gameEvents.broadcast(msg.eventType, msg.data);
}

var gameEvents = new EventHandler();
gameEvents.spawn = function (options) {
    gameEvents.page.evaluate(function (options) {
            spawn(options);
        },
        function (result) {
        },
        options);
};
gameEvents.thrust = function (options) {
    gameEvents.page.evaluate(function (options) {
            thrust(options);
        },
        function (result) {
        },
        options);
};

phantom.create(function (err, ph) {
    ph.createPage(function (err, page) {
        if(err) return console.log(err);

        gameEvents.page = page;
        page.onCallback = parseEvent;
        page.open(__dirname + "/blorbit.html", function (err, status) {
            console.log("PhantomJS Connected: ", status);
        });
    });
});

module.exports = gameEvents;