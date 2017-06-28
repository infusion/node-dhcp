#!/usr/bin/env node

process.title = 'node-dhcp';

var path = require('path');
var dhcp = require('../lib/dhcp.js');
var argv = require('minimist')(process.argv.slice(2));

// Create a client

var client = dhcp.createClient({
  features: argv._
});

client.on('bound', function () {

  var opt = this._state.options;

  // Print all requested options
  for (var i in opt) {
    console.log(i, ": ", opt[i] instanceof Array ? opt[i].join(", ") : opt[i]);
  }

  // Exit when finished
  process.exit();
});

client.listen();

// Send first handshake
client.sendDiscover();
