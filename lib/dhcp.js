
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

const INADDR_ANY = '0.0.0.0';
const INADDR_BROADCAST = '255.255.255.255';

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

  // Config (cache) object
  _conf: null,

  // All mac -> IP mappings, we currently have assigned or blacklisted
  state: {

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
      htype: 1, // 1=Ethernet, 6=Tokenring, 8=FDDI (keep it constant)
      hlen: 6, // Mac addresses are 6 byte
      hops: 0,
      xid: req.xid, // 'xid' from client DHCPDISCOVER message
      secs: 0,
      flags: req.flags,
      ciaddr: INADDR_ANY,
      yiaddr: '192.168.1.26', // my offer, ARP check if ip already exists?
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
    // INADDR_BROADCAST : 68 <- SERVER_IP : 67
    this._send(INADDR_BROADCAST, ans);

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
      htype: 1, // 1=Ethernet, 6=Tokenring, 8=FDDI (keep it constant)
      hlen: 6, // Mac addresses are 6 byte
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
    // INADDR_BROADCAST : 68 <- SERVER_IP : 67
    this._send(INADDR_BROADCAST, ans);
  },
  sendNak: function (req) {
    console.log('Send NAK');
    // Formulate the response object
    var ans = {
      op: BOOTREPLY,
      htype: 1, // 1=Ethernet, 6=Tokenring, 8=FDDI (keep it constant)
      hlen: 6, // Mac addresses are 6 byte
      hops: 0,
      xid: req.xid, // 'xid' from client DHCPREQUEST message
      secs: 0,
      flags: req.flags, // 'flags' from client DHCPREQUEST message
      ciaddr: INADDR_ANY,
      yiaddr: INADDR_ANY,
      siaddr: INADDR_ANY,
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
    this._send(INADDR_BROADCAST, ans);
  },

  handleRelease: function () {

  },

  handleRenew: function () {
    // Send ack
  },

  listen: function (port, host, fn) {

    var sock = this._sock;

    sock.bind(port || SERVER_PORT, host || INADDR_ANY, function () {
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
  this._conf = config || {};
}

Client.prototype = {

  // Socket handle
  _sock: null,

  // Config (cache) object
  _conf: null,

  // Current client state
  _state: {
    bindTime: null, // Time when we got an ACK
    leasePeriod: 86400, // Seconds the lease is allowed to live, next lease in "leasePeriod - (now - bindTime)"
    renewPeriod: 1440, // Seconds till a renew is due, next renew in "renewPeriod - (now - bindTime)"
    rebindPeriod: 14400, // Seconds till a rebind is due, next rebind in "rebindPeriod - (now - bindTime)"
    state: null, // Current State, like BOUND, INIT, REBOOTING, ...
    server: null, // The server we got our config from
    address: null, // actual IP address we got
    options: null, // object of all other options we got
    tries: 0, // number of tries in order to complete a state
    xid: 1 // unique id, incremented with every request
  },

  config: function (key) {

    if (key === 'mac') {

      if (this._conf.mac === undefined) {

        var interfaces = os.networkInterfaces();

        for (var interface in interfaces) {
          var addresses = interfaces[interface];
          for (var address in addresses) {
            if (addresses[address].family === 'IPv4' && !addresses[address].internal) {

              if (this._conf.mac === undefined) {
                this._conf.mac = addresses[address].mac;
              } else {
                throw new Error('Too many network interfaces, set mac address manually:\n\tclient = dhcp.createClient({mac: "12:23:34:45:56:67"});');
              }
            }
          }
        }
      }
      return this._conf.mac;

    } else {
      throw new Error('Unknown config key ' + key);
    }

  },

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
      htype: 1, // 1=Ethernet, 6=Tokenring, 8=FDDI (keep it constant)
      hlen: 6, // Mac addresses are 6 byte
      hops: 0,
      xid: this._state.xid++, // Selected by client on DHCPDISCOVER
      secs: 0, // 0 or seconds since DHCP process started
      flags: 0, // 0 or 0x80 (if client requires broadcast reply)
      ciaddr: INADDR_ANY, // 0 for DHCPDISCOVER, other implementations send currently assigned IP - but we follow RFC
      yiaddr: INADDR_ANY,
      siaddr: INADDR_ANY,
      giaddr: INADDR_ANY,
      chaddr: this.config('mac'),
      sname: '', // unused
      file: '', // unused
      options: {
        57: 1500, // Max message size
        53: DHCPDISCOVER,
        61: this.config('mac'), // MAY
        55: [1, 3, 51, 54, 6]// features I want, MAY TODO
                // TODO: requested IP optional
      }
    };

    this._state.state = 'SELECTING';
    this._state.tries = 0;

    // TODO: set timeouts

    // Send the actual data
    // INADDR_ANY : 68 -> INADDR_BROADCAST : 67
    this._send(INADDR_BROADCAST, ans);
  },
  handleOffer: function (req) {
    console.log('Handle Offer', req);

    // Select an offer out of all offers
    // We simply take the first one and change the state then

    if (req.options[54]) { // TODO: check previous state here
      this.sendRequest(req);
    } else {
      this.emit('error', 'Offer does not have a server identifier', req);
    }
  },

  sendRequest: function (req) {

    console.log('Send Request');

    // Formulate the response object
    var ans = {
      op: BOOTREQUEST,
      htype: 1, // 1=Ethernet, 6=Tokenring, 8=FDDI (keep it constant)
      hlen: 6, // Mac addresses are 6 byte
      hops: 0,
      xid: req.xid, // 'xid' from server DHCPOFFER message
      secs: 0, // 0 or seconds since DHCP process started
      flags: 0, // 0 or 0x80 (if client requires broadcast reply)
      ciaddr: INADDR_ANY, // 0 for DHCPREQUEST
      yiaddr: INADDR_ANY,
      siaddr: INADDR_ANY,
      giaddr: INADDR_ANY,
      chaddr: this.config('mac'),
      sname: '', // unused
      file: '', // unused
      options: {
        57: 1500, // Max message size
        53: DHCPREQUEST,
        61: this.config('mac'), // MAY
        55: [1, 3, 51, 54, 6], // features I want
        50: this._state.address, // requested IP, TODO: MUST (selecting or INIT REBOOT) MUST NOT (BOUND, RENEW)
        // TODO: server identifier: MUST (after selecting) MUST NOT (INIT REBOOT, BOUND, RENEWING, REBINDING)
      }
    };

    this._state.server = req.options[54];
    this._state.address = req.yiaddr;
    this._state.state = 'REQUESTING';
    this._state.tries = 0;

    // TODO: retry timeout

    // INADDR_ANY : 68 -> INADDR_BROADCAST : 67
    this._send(INADDR_BROADCAST, ans);
  },
  handleAck: function (req) {

    if (req.options[53] === DHCPACK) {
      // We now know the IP for sure
      console.log('Handle ACK', req);

      this._state.bindTime = new Date;
      this._state.state = 'BOUND';
      this._state.address = req.yiaddr;
      this._state.options = {};

      // Lease time is available
      if (req.options[51]) {
        this._state.leasePeriod = req.options[51];
        this._state.renewPeriod = req.options[51] / 2;
        this._state.rebindPeriod = req.options[51];
      }

      // Renewal time is available
      if (req.options[58]) {
        this._state.renewPeriod = req.options[58];
      }

      // Rebinding time is available
      if (req.options[59]) {
        this._state.rebindPeriod = req.options[59];
      }

      // TODO: set renew & rebind timer

      var options = req.options;
      this._state.options = {};

      // Map all options from request
      for (var id in options) {

        if (id === '53' || id === '51' || id === '58' || id === '59')
          continue;

        var conf = Options.opts[id];
        var key = conf.config || conf.attr;

        this._state.options[key] = options[id];
      }

      // If netmask is not given, set it to a class related mask
      if (!this._state.options.netmask) {

        var first = this._state.address.split(".")[0] | 0;

        if (first <= 127) {
          this._state.options.netmask = '255.0.0.0';
        } else if (first >= 192) {
          this._state.options.netmask = '255.255.255.0';
        } else {
          this._state.options.netmask = '255.255.0.0';
        }
      }

      this.emit('bound');

      // TODO: should we change actual system config? delete ip, gateway, netmask

      // `ip address add IP/MASK dev eth0`
      // `echo HOSTNAME > /etc/hostname && hostname HOSTNAME`
      // `ip route add default via 192.168.1.254`
      // `sysctl -w net.inet.ip.forwarding=1`

    } else {
      // We're sorry, today we have no IP for you...
    }
  },

  sendRelease: function (req) {

    console.log('Send Release');

    // Formulate the response object
    var ans = {
      op: BOOTREQUEST,
      htype: 1, // 1=Ethernet, 6=Tokenring, 8=FDDI (keep it constant)
      hlen: 6, // Mac addresses are 6 byte
      hops: 0,
      xid: this._state.xid++, // Selected by client on DHCPRELEASE
      secs: 0, // 0 or seconds since DHCP process started
      flags: 0,
      ciaddr: '192.168.1.11', // todo: MY IP ADDRESS
      yiaddr: INADDR_ANY,
      siaddr: INADDR_ANY,
      giaddr: INADDR_ANY,
      chaddr: this.config('mac'),
      sname: '', // unused
      file: '', // unused
      options: {
        53: DHCPRELEASE
                // TODO: MAY clientID
                // TODO: MUST server identifier
      }
    };

    // TODO: should we change actual system config? delete ip, gateway, netmask

    this._state.bindTime = null;
    this._state.state = 'RELEASED';
    this._state.tries = 0;

    // Send the actual data
    this._send(this._state.server, ans); // Send release directly to server
  },

  sendRenew: function () {

    console.log('Send Renew');

    // TODO: check ans against rfc

    // Formulate the response object
    var ans = {
      op: BOOTREQUEST,
      htype: 1, // 1=Ethernet, 6=Tokenring, 8=FDDI (keep it constant)
      hlen: 6, // Mac addresses are 6 byte
      hops: 0,
      xid: this._state.xid++, // Selected by client on DHCPRELEASE
      secs: 0, // 0 or seconds since DHCP process started
      flags: 0,
      ciaddr: '192.168.1.11', // todo: MY IP ADDRESS
      yiaddr: INADDR_ANY,
      siaddr: INADDR_ANY,
      giaddr: INADDR_ANY,
      chaddr: this.config('mac'),
      sname: '', // unused
      file: '', // unused
      options: {
        53: DHCPREQUEST,
        50: this._state.address
                // TODO: MAY clientID
                // TODO: MUST server identifier
      }
    };

    // TODO: should we change actual system config? delete ip, gateway, netmask

    this._state.state = 'RENEWING';
    this._state.tries = 0;

    // Send the actual data
    this._send(this._state.server, ans); // Send release directly to server
  },

  sendRebind: function () {

    console.log('Send Rebind');

    // TODO: check ans against rfc

    // Formulate the response object
    var ans = {
      op: BOOTREQUEST,
      htype: 1, // 1=Ethernet, 6=Tokenring, 8=FDDI (keep it constant)
      hlen: 6, // Mac addresses are 6 byte
      hops: 0,
      xid: this._state.xid++, // Selected by client on DHCPRELEASE
      secs: 0, // 0 or seconds since DHCP process started
      flags: 0,
      ciaddr: '192.168.1.11', // todo: MY IP ADDRESS
      yiaddr: INADDR_ANY,
      siaddr: INADDR_ANY,
      giaddr: INADDR_ANY,
      chaddr: this.config('mac'),
      sname: '', // unused
      file: '', // unused
      options: {
        53: DHCPREQUEST,
        50: this._state.address
                // TODO: MAY clientID
                // TODO: MUST server identifier
      }
    };

    this._state.state = 'REBINDING';
    this._state.tries = 0;
    
    // TODO: timeout

    // Send the actual data
    this._send(INADDR_BROADCAST, ans); // Send release directly to server
  },

  listen: function (port, host, fn) {

    var sock = this._sock;

    sock.bind(port || CLIENT_PORT, host || INADDR_ANY, function () {
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
