
const util = require("util");
const dgram = require("dgram");
const EventEmitter = require("events").EventEmitter;

const SeqBuffer = require('./seqbuffer.js');
const Options = require('./options.js');

const DHCPDISCOVER = 1;
const DHCPOFFER = 2;
const DHCPREQUEST = 3;
const DHCPDECLINE = 4;
const DHCPACK = 5;
const DHCPNAK = 6;
const DHCPRELEASE = 7;
const DHCPINFORM = 8;





function Server(config, listenOnly) {

  EventEmitter.call(this);

  var self = this;
  var sock = dgram.createSocket('udp4');

  sock.on('message', function (buf) {

    var req = self._parse(buf);

    if (!req.options[53]) {
      self.emit("error", new Error("Got message, without valid message type"), req);
      return;
    }

    self.emit('message', req);

    if (!listenOnly) {
      self._answer(req);
    }
  });

  sock.on('listening', function () {
    var address = sock.address();
    console.info("Server Listening: " + address.address + ":" + address.port);
  });

  console.log(config);
  this._sock = sock;
  this._conf = config;
}

Server.prototype = {

  // Socket handle
  _sock: null,

  // Options object
  _conf: null,

  // All mac -> IP mappings, we currently have assigned or blacklisted
  assigns: {

  },

  handleDiscover: function () {
    // sendOffer()
  },
  sendOffer: function () {
    // source=192.168.1.1; destination=255.255.255.255
  },

  handleRequest: function () {
    // Send ack
  },
  sendAck: function () {
    // -> source=192.168.1.1; destination=255.255.255.255
  },

  handleRelease: function () {

  },

  handleRenew: function () {
    // Send ack
  },

  listen: function () {

    var sock = this._sock;

    sock.bind(67, "0.0.0.0", function () {
      sock.setBroadcast(true);
    });
  }

};








function Client(config) {

  EventEmitter.call(this);

  var self = this;
  var sock = dgram.createSocket('udp4');

  sock.on('message', function (buf) {

    var req = self._parse(buf);

    if (!req.options[53]) {
      self.emit("error", new Error("Got message, without valid message type"), req);
      return;
    }

    self.emit('message', req);
    self._answer(req);
  });

  sock.on('listening', function () {
    var address = sock.address();
    console.info("Client Listening: " + address.address + ":" + address.port);
  });

  console.log(config);
  this._sock = sock;
  this._conf = config;
}

Client.prototype = {

  // Socket handle
  _sock: null,

  // Options object
  _opts: null,

  sendDiscover: function () {
    // -> source=0.0.0.0; destination=255.255.255.255
  },
  handleOffer: function () {
    // sendRequest()
  },

  sendRequest: function () {
    // -> source=0.0.0.0 destination=255.255.255.255
  },
  handleAck: function () {
    // We now know the IP
  },

  sendRelease: function () {
    // directly to server
  },

  sendRenew: function () {

  },

  listen: function () {

    var sock = this._sock;

    sock.bind(68, "0.0.0.0", function () {
      sock.setBroadcast(true);
    });
  }
};





util.inherits(Server, EventEmitter);
util.inherits(Client, EventEmitter);

module.exports = {
  createServer: function (opt) {
    return new Server(opt);
  },
  createClient: function (opt) {
    return new Client(opt);
  },
  createBroadcastHandler: function (opt) {
    return new Server(opt, true);
  }
};
