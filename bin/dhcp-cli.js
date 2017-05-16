#!/usr/bin/env node

process.title = 'node-dhcp';

var path = require('path');
var dhcp = require('../lib/dhcp.js');
var Options = require('../lib/options.js');
var argv = require('minimist')(process.argv.slice(2));

var opts = {};

if (path.basename(process.argv[1]).slice(-1) === 'd') {

  // Create a server

  for (var arg in argv) {

    if (arg === '_') {
      /* void */
    } else if (arg === 'range') {
      opts.range = argv[arg].split('-');
    } else if (Options.conf[arg] !== undefined) {

      if (argv[arg]) {
        opts[arg] = argv[arg];
      } else {
        console.error('Argument ' + arg + ' needs a value.');
        process.exit();
      }

    } else if (arg === 'help') {
      console.log('Usage:\n\tdhcpd --range 192.168.0.1-192.168.0.99 --option1 value1 --option2 value2 ...');
      process.exit();
    } else {
      console.error('Invalid argument ' + arg);
      process.exit();
    }
  }

  var server = dhcp.createServer(opts);

  server.listen();

} else {

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
}
