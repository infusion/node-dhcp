
const util = require('util');
const dgram = require('dgram');
const EventEmitter = require('events').EventEmitter;

const SeqBuffer = require('./seqbuffer.js');
const Options = require('./options.js');
const Protocol = require('./protocol.js');

const DHCPDISCOVER = 1;
const DHCPOFFER = 2;
const DHCPREQUEST = 3;
const DHCPDECLINE = 4;
const DHCPACK = 5;
const DHCPNAK = 6;
const DHCPRELEASE = 7;
const DHCPINFORM = 8;


const CLIENT_PORT = 2004;//68;
const SERVER_PORT = 2005;//67;


function Server(config, listenOnly) {

  EventEmitter.call(this);

  var self = this;
  var sock = dgram.createSocket('udp4');

  sock.on('message', function (buf) {

    var req = Protocol.parse(buf);

    if (!req.options[53]) {
      self.emit('error', new Error('Got message, without valid message type'), req);
      return;
    }

    self.emit('message', req);

    if (!listenOnly) {
      self._handle(req);
    }
  });

  sock.on('listening', function () {
    var address = sock.address();
    console.info('Server Listening: ' + address.address + ':' + address.port);
  });

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

  _handle: function (req) {


    switch (req.options[53]) {
      case DHCPDISCOVER: // 1.
        this.handleDiscover(req);
        break;
      case DHCPREQUEST: // 3.
        this.handleRequest(req);
        break;
    }


  },

  handleDiscover: function (req) {
    console.log("Handle Discover", req);
    this.sendOffer(req);
  },
  sendOffer: function (req) {

console.log("Send Offer");

    // TODO:
    // - use options.50 offer
    // - handle yiaddr
    // - handle siaddr

    // Formulate the response object
    var ans = {
      op: 2, // Response
      htype: req.htype,
      hlen: req.hlen,
      hops: req.hops,
      xid: req.xid,
      secs: req.secs,
      flags: 0,
      ciaddr: req.ciaddr,
      yiaddr: '192.168.1.26', // my offer
      siaddr: '192.168.1.1', //this.config.get('server'), // server ip, that's us
      giaddr: req.giaddr,
      chaddr: req.chaddr, // Client mac address
      sname: '',
      file: '',
      options: {
        53: DHCPOFFER,
        1: '255.255.255.0',
        3: '192.168.1.1',
        51: 86400,
        54: '192.168.1.1', //this.config.get('server'),
        6: ['8.8.8.8', '8.8.4.4']
      }
    };

    // Send the actual data
    this._send('255.255.255.255', ans);

  },

  handleRequest: function (req) {
    console.log("Handle Request", req);
    this.sendAck(req);
  },
  sendAck: function (req) {
console.log("Send ACK");
    // Formulate the response object
    var ans = {
      op: 2, // Response
      htype: req.htype,
      hlen: req.hlen,
      hops: req.hops,
      xid: req.xid,
      secs: req.secs,
      flags: 0,
      ciaddr: req.ciaddr,
      yiaddr: '192.168.1.26', // my offer
      siaddr: '192.168.1.1', //this.config.get('server'), // server ip, that's us
      giaddr: req.giaddr,
      chaddr: req.chaddr, // Client mac address
      sname: '',
      file: '',
      options: {
        53: DHCPACK, // or DHCPNACK
        1: '255.255.255.0',
        3: '192.168.1.1',
        51: 86400,
        54: '192.168.1.1', //this.config.get('server'),
        6: ['8.8.8.8', '8.8.4.4']
      }
    };

    // Send the actual data
    this._send('255.255.255.255', ans);
  },

  handleRelease: function () {

  },

  handleRenew: function () {
    // Send ack
  },

  listen: function () {

    var sock = this._sock;

    sock.bind(SERVER_PORT, '0.0.0.0', function () {
      sock.setBroadcast(true);
    });
  },

  _send: function (addr, data) {

    var sb = Protocol.format(data);

    this._sock.send(sb._data, 0, sb._w, CLIENT_PORT, addr, function (err, bytes) {
      if (err) {
        console.log(err);
      } else {
        console.log('Sent ', bytes, 'bytes');
      }
    });
  }

};








function Client(config) {

  EventEmitter.call(this);

  var self = this;
  var sock = dgram.createSocket('udp4');

  sock.on('message', function (buf) {

    var req = Protocol.parse(buf);

    if (!req.options[53]) {
      self.emit('error', new Error('Got message, without valid message type'), req);
      return;
    }

    self.emit('message', req);
    self._handle(req);
  });

  sock.on('listening', function () {
    var address = sock.address();
    console.info('Client Listening: ' + address.address + ':' + address.port);
  });

  this._sock = sock;
  this._conf = config;
}

Client.prototype = {

  // Socket handle
  _sock: null,

  // Options object
  _opts: null,

  _handle: function (req) {

    switch (req.options[53]) {
      case DHCPOFFER: // 2.
        this.handleOffer(req);
        break;
      case DHCPACK: // 4.
        this.handleAck(req);
        break;
    }
  },

  sendDiscover: function () {
    
    console.log("Send Discover");

    // Formulate the response object
    var ans = {
      op: 1, // Request
      htype: 1,
      hlen: 6,
      hops: 0,
      xid: 1, // Set unique XID
      secs: 0,
      flags: 0,
      ciaddr: '0.0.0.0',
      yiaddr: '0.0.0.0', // my offer
      siaddr: '0.0.0.0', // server ip
      giaddr: '0.0.0.0',
      chaddr: 'b8:e8:56:2a:b6:c2', // Set mac address
      sname: '',
      file: '',
      options: {
        53: DHCPDISCOVER,
        61: 'secret',
        55: [1, 3, 51, 54, 6]// features I want
      }
    };

    // Send the actual data
    this._send('255.255.255.255', ans);
  },
  handleOffer: function (req) {
    console.log("Handle Offer", req);
    this.sendRequest(req);
  },

  sendRequest: function (req) {
    
    console.log("Send Request");

    // Formulate the response object
    var ans = {
      op: 1, // Request
      htype: 1,
      hlen: 6,
      hops: 0,
      xid: req.xid, // Set unique XID
      secs: 0,
      flags: 0,
      ciaddr: '0.0.0.0',
      yiaddr: '0.0.0.0', // my offer
      siaddr: req.siaddr, // server ip
      giaddr: '0.0.0.0',
      chaddr: 'b8:e8:56:2a:b6:c2', // Set mac address
      sname: '',
      file: '',
      options: {
        53: DHCPREQUEST,
        61: 'secret',
        55: [1, 3, 51, 54, 6]// features I want
      }
    };

    // Send the actual data
    this._send('255.255.255.255', ans);
  },
  handleAck: function (req) {
    // We now know the IP for sure
    console.log("Handle ACK", req);
    
  },

  sendRelease: function () {
    // directly to server
  },

  sendRenew: function () {

  },

  listen: function () {

    var sock = this._sock;

    sock.bind(CLIENT_PORT, '0.0.0.0', function () {
      sock.setBroadcast(true);
    });
  },

  _send: function (addr, data) {

    var sb = Protocol.format(data);

    this._sock.send(sb._data, 0, sb._w, SERVER_PORT, addr, function (err, bytes) {
      if (err) {
        console.log(err);
      } else {
        console.log('Sent ', bytes, 'bytes');
      }
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
