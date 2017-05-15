
const util = require('util');
const dgram = require('dgram');
const os = require('os');
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

const SERVER_PORT = 2004;//67;
const CLIENT_PORT = 2005;//68;

const BOOTREQUEST = 1;
const BOOTREPLY = 2;

function Server(config, listenOnly) {

  EventEmitter.call(this);

  var self = this;
  var sock = dgram.createSocket('udp4');

  sock.on('message', function (buf) {

    var req = Protocol.parse(buf);

    if (req.op !== BOOTREQUEST) {
      self.emit('error', new Error('Malformed packet'), req);
      return;
    }

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
    self.emit('listening', sock);
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
    console.log('Handle Discover', req);
    this.sendOffer(req);
  },
  sendOffer: function (req) {

    console.log('Send Offer');

    // Formulate the response object
    var ans = {
      op: BOOTREPLY,
      htype: 1, // TODO, ARP hardware type
      hlen: 6,
      hops: 0,
      xid: req.xid, // 'xid' from client DHCPDISCOVER message
      secs: 0,
      flags: req.flags,
      ciaddr: '0.0.0.0',
      yiaddr: '192.168.1.26', // my offer
      siaddr: '192.168.1.1', //this.config.get('server'), // next server in bootstrap. That's us
      giaddr: req.giaddr,
      chaddr: req.chaddr, // Client mac address
      sname: '', // TODO: Server hostname
      file: '',
      options: {
        53: DHCPOFFER,
        1: '255.255.255.0',
        3: '192.168.1.1',
        51: 86400, // MUST
        54: '192.168.1.1', // MUST TODO: this.config.get('server'),
        6: ['8.8.8.8', '8.8.4.4']
      }
    };

    // Send the actual data
    this._send('255.255.255.255', ans);

  },

  handleRequest: function (req) {
    console.log('Handle Request', req);
    this.sendAck(req);
  },
  sendAck: function (req) {
    console.log('Send ACK');
    // Formulate the response object
    var ans = {
      op: BOOTREPLY,
      htype: 1, // TODO, ARP hardware type
      hlen: 6,
      hops: 0,
      xid: req.xid, // 'xid' from client DHCPREQUEST message
      secs: 0,
      flags: req.flags, // 'flags' from client DHCPREQUEST message
      ciaddr: req.ciaddr,
      yiaddr: '192.168.1.26', // my offer
      siaddr: '192.168.1.1', //this.config.get('server'), // server ip, that's us
      giaddr: req.giaddr, // 'giaddr' from client DHCPREQUEST message
      chaddr: req.chaddr, // 'chaddr' from client DHCPREQUEST message
      sname: '',
      file: '',
      options: {
        53: DHCPACK,
        1: '255.255.255.0',
        3: '192.168.1.1',
        51: 86400, // MUST
        54: '192.168.1.1', //MUST: TODO this.config.get('server'),
        6: ['8.8.8.8', '8.8.4.4']
      }
    };

    // Send the actual data
    this._send('255.255.255.255', ans);
  },
  sendNak: function (req) {
    console.log('Send NAK');
    // Formulate the response object
    var ans = {
      op: BOOTREPLY,
      htype: 1, // TODO, ARP hardware type
      hlen: 6,
      hops: 0,
      xid: req.xid, // 'xid' from client DHCPREQUEST message
      secs: 0,
      flags: req.flags, // 'flags' from client DHCPREQUEST message
      ciaddr: '0.0.0.0',
      yiaddr: '0.0.0.0',
      siaddr: '0.0.0.0',
      giaddr: req.giaddr, // 'giaddr' from client DHCPREQUEST message
      chaddr: req.chaddr, // 'chaddr' from client DHCPREQUEST message
      sname: '', // unused
      file: '', // unused
      options: {
        53: DHCPNAK,
        54: '192.168.1.1' //MUST: TODO this.config.get('server'),
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

  listen: function (host, port, fn) {

    var sock = this._sock;

    sock.bind(port || SERVER_PORT, host || '0.0.0.0', function () {
      sock.setBroadcast(true);
      if (fn instanceof Function) {
        process.nextTick(fn);
      }
    });
  },

  _send: function (host, data) {

    var sb = Protocol.format(data);

    this._sock.send(sb._data, 0, sb._w, CLIENT_PORT, host, function (err, bytes) {
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

    if (req.op !== BOOTREPLY) {
      self.emit('error', new Error('Malformed packet'), req);
      return;
    }

    if (!req.options[53]) {
      self.emit('error', new Error('Got message, without valid message type'), req);
      return;
    }

    self.emit('message', req);
    self._handle(req);
  });

  sock.on('listening', function () {
    self.emit('listening', sock);
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
      case DHCPNAK: // 4.
        this.handleAck(req);
        break;
    }
  },

  sendDiscover: function () {

    console.log('Send Discover');

    // Formulate the response object
    var ans = {
      op: BOOTREQUEST,
      htype: 1, // TODO, ARP hardware type
      hlen: 6, // Hardware Address length
      hops: 0,
      xid: Math.random() * 2147483648 | 0, // Selected by client on DHCPDISCOVER, TODO: is this incremental?
      secs: 0, // 0 or seconds since DHCP process started
      flags: 0, // 0 or 0x80 (if client requires broadcast reply)
      ciaddr: '0.0.0.0', // 0 for DHCPDISCOVER
      yiaddr: '0.0.0.0',
      siaddr: '0.0.0.0',
      giaddr: '0.0.0.0',
      chaddr: 'b8:e8:56:2a:b6:c2', // TODO: Set mac address (os.networkInterfaces())
      sname: '', // unused
      file: '', // unused
      options: {
        53: DHCPDISCOVER,
        61: 'secret', // MAY
        55: [1, 3, 51, 54, 6]// features I want, MAY
                // TODO: requested IP optional
      }
    };

    // Send the actual data
    this._send('255.255.255.255', ans);
  },
  handleOffer: function (req) {
    console.log('Handle Offer', req);
    this.sendRequest(req);
  },

  sendRequest: function (req) {

    console.log('Send Request');

    // Formulate the response object
    var ans = {
      op: BOOTREQUEST,
      htype: 1, // TODO, ARP hardware type
      hlen: 6, // Hardware Address length
      hops: 0,
      xid: req.xid, // 'xid' from server DHCPOFFER message
      secs: 0, // 0 or seconds since DHCP process started
      flags: 0, // 0 or 0x80 (if client requires broadcast reply)
      ciaddr: '0.0.0.0', // 0 for DHCPDISCOVER
      yiaddr: '0.0.0.0',
      siaddr: '0.0.0.0',
      giaddr: '0.0.0.0',
      chaddr: 'b8:e8:56:2a:b6:c2', // TODO: Set mac address
      sname: '', // unused
      file: '', // unused
      options: {
        53: DHCPREQUEST,
        61: 'secret', // MAY (use MAC here?)
        55: [1, 3, 51, 54, 6]// features I want
                // TODO: requested IP: MUST (selecting or INIT REBOOT) MUST NOT (BOUND, RENEW)
                // TODO: server identifier: MUST (after selecting) MUST NOT (INIT REBOOT, BOUND, RENEWING, REBINDING)
      }
    };

    // Send the actual data
    this._send('255.255.255.255', ans);
  },
  handleAck: function (req) {

    if (req.options[53] === DHCPACK) {
      // We now know the IP for sure
      console.log('Handle ACK', req);

      // `ip address add IP/MASK dev eth0`
      // `echo HOSTNAME > /etc/hostname`
      // `ip route add default via 192.168.1.254`
    } else {
      // We're sorry, today we have no IP for you...
    }
  },

  sendRelease: function (req) {

    console.log('Send Release');

    // Formulate the response object
    var ans = {
      op: BOOTREQUEST,
      htype: 1, // TODO, ARP hardware type
      hlen: 6, // Hardware Address length
      hops: 0,
      xid: Math.random() * 2147483648 | 0, // Selected by client on DHCPRELEASE
      secs: 0, // 0 or seconds since DHCP process started
      flags: 0,
      ciaddr: '192.168.1.11', // todo: MY IP ADDRESS
      yiaddr: '0.0.0.0',
      siaddr: '0.0.0.0',
      giaddr: '0.0.0.0',
      chaddr: 'b8:e8:56:2a:b6:c2', // TODO: Set mac address
      sname: '', // unused
      file: '', // unused
      options: {
        53: DHCPRELEASE,
        // TODO: MAY clientID
        // TODO: MUST server identifier
      }
    };

    // Send the actual data
    this._send('255.255.255.255', ans); // TODO: really broadcast or directly?
  },

  sendRenew: function () {

  },

  listen: function (host, port, fn) {

    var sock = this._sock;

    sock.bind(port || CLIENT_PORT, host || '0.0.0.0', function () {
      sock.setBroadcast(true);
      if (fn instanceof Function) {
        process.nextTick(fn);
      }
    });
  },

  _send: function (host, data) {

    var sb = Protocol.format(data);

    this._sock.send(sb._data, 0, sb._w, SERVER_PORT, host, function (err, bytes) {
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
  createBroadcastHandler: function () {
    return new Server(null, true);
  },
  DHCPDISCOVER: DHCPDISCOVER,
  DHCPOFFER: DHCPOFFER,
  DHCPREQUEST: DHCPREQUEST,
  DHCPDECLINE: DHCPDECLINE,
  DHCPACK: DHCPACK,
  DHCPNAK: DHCPNAK,
  DHCPRELEASE: DHCPRELEASE,
  DHCPINFORM: DHCPINFORM
};
