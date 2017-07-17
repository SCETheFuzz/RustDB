// include rustrconjs
var rcon = require('rustrconjs');
rcon.connect('ws://74.91.125.225:28028/WhatD0seTheF0xSay', "mongodb://admin:rustopia@ds157682.mlab.com:57682/rustdb");

// an example event that logs the player joined object to console
rcon.rconEvent.on('player join', function (message) {
    console.log(message);
});
// an example event that logs the player chat object to console
rcon.rconEvent.on('player chat', function (message) {
    console.log(message);
});
// an example event that logs the player joined object to console
rcon.rconEvent.on('player killed pvp', function (message) {
    console.log(message);
});
// an example event that logs the player joined object to console
rcon.rconEvent.on('player killed other', function (message) {
    console.log(message);
});
// an example event that logs the player joined object to console
rcon.rconEvent.on('player player died', function (message) {
    console.log(message);
});
// an example event that logs the player joined object to console
rcon.rconEvent.on('player enter', function (message) {
    console.log(message);
});
// an example event that logs the player joined object to console
rcon.rconEvent.on('player suicide', function (message) {
    console.log(message);
});
// an example event that logs the player joined object to console
rcon.rconEvent.on('player disconnect', function (message) {
    console.log(message);
});// an example event that logs the player joined object to console
rcon.rconEvent.on('server save', function (message) {
    console.log(message);
});
