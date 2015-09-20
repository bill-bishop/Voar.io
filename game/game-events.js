/**
 * Created by williambishop on 9/19/15.
 */
var phantom = require('phantom');

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
    try {
        msg = JSON.parse(msg);
        if (!msg.eventType) return;
        gameEvents.broadcast(msg.eventType, msg.data);
    }
    catch (e) {
        // ignore msgs that aren't JSON strings
    }
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

phantom.create(function (ph) { //create fails when run via npm script...
    ph.createPage(function (page) {
        gameEvents.page = page;

        page.open(__dirname + "/blorbit.html", function (status) {
            console.log("PhantomJS Connected: ", status);
        });

        page.onConsoleMessage(parseEvent);
    });
});

module.exports = gameEvents;