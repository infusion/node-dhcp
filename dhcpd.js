
var dgram = require("dgram");
var EventEmitter = require("events").EventEmitter;
var util = require("util");

var SeqBuffer = require('./lib/seqbuffer.js');
var Options = require('./lib/options.js');

const DHCPDISCOVER = 1;
const DHCPOFFER = 2;
const DHCPREQUEST = 3;
const DHCPDECLINE = 4;
const DHCPACK = 5;
const DHCPNAK = 6;
const DHCPRELEASE = 7;

function Server(settings) {

  EventEmitter.call(this);

  var self = this;
  var sock = dgram.createSocket('udp4');

  settings = settings || {};

  sock.on('message', function (buf) {

    var msg = self._parse(buf);

    if (!msg.options[53]) {
      self.emit("error", new Error("Got message, without valid message type"), msg);
      return;
    }

    self._send('255.255.255.255', self._answer(msg, settings));
  });

  sock.on('listening', function () {
    var address = sock.address();
    console.log("Listening: " + address.address + ":" + address.port);
  });

  this._sock = sock;
}

Server.prototype = {

  // Socket handle
  _sock: null,

  // All mac -> IP mappings, we currently have assigned
  _assigns: {

  },

  _answer: function (msg, settings) {

    var opts;

    var type = Options[53].values[msg.options[53]];

    console.log(type)

    if (msg.options[53] == DHCPDISCOVER) {

      opts = {
        53: DHCPOFFER,

        1: '255.255.255.0', // Subnet mask
        28: '192.168.33.255', // Broadcast

        3: ['192.168.33.2'], // Router

        12: "miau", // hostname

        6: ['8.8.8.8', '8.8.4.4'], // DNS servers   

        51: 86400, // IP lease time
        54: '192.168.33.2', // DHCP server

        58: 60, // Renewal time
        59: 120 // Rebinding time
      };
    } else {
      opts = {
        53: DHCPACK,

        1: '255.255.255.0', // Subnet mask
        28: '192.168.33.255', // Broadcast

        3: ['192.168.33.2'], // Router

        12: "miau", // hostname

        6: ['8.8.8.8', '8.8.4.4'], // DNS servers   

        51: 86400, // IP lease time
        54: '192.168.33.2', // DHCP server

        58: 60, // Renewal time
        59: 120 // Rebinding time
      };
    }

    var ans = {
      op: 2, // Reply
      htype: msg.htype,
      hlen: msg.hlen,
      hops: msg.hops,
      xid: msg.xid,
      secs: msg.secs,
      flags: 0,
      ciaddr: msg.ciaddr,
      yiaddr: '192.168.33.55', // my offer
      siaddr: '192.168.33.2', // server ip
      giaddr: msg.giaddr,
      chaddr: msg.chaddr,
      sname: "",
      file: "",
      options: opts
    };

    return ans;
  },

  _send: function (ip, data) {

    var sb = new SeqBuffer;

    sb.addUInt8(data.op);
    sb.addUInt8(data.htype);
    sb.addUInt8(data.hlen);
    sb.addUInt8(data.hops);
    sb.addUInt32(data.xid);
    sb.addUInt16(data.secs);
    sb.addUInt16(data.flags);
    sb.addIP(data.ciaddr);
    sb.addIP(data.yiaddr);
    sb.addIP(data.siaddr);
    sb.addIP(data.giaddr);
    sb.addMac(data.chaddr);
    sb.addUTF8(data.sname, 64);
    sb.addUTF8(data.file, 128);
    sb.addUInt32(0x63825363);
    sb.addOptions(data.options);

    sb.addUInt8(255); // Mark end

    this._sock.send(sb._data, 0, sb._w, 68, ip, function (err, bytes) {
      if (err) {
        console.log(err);
      } else {
        console.log("Sent ", bytes, "bytes");
      }
    });
  },
  _parse: function (buf) {

    var sb = new SeqBuffer(buf);

    // RFC 2131
    var msg = {
      op: sb.getUInt8(), // op code: 1=request, 2=reply
      htype: sb.getUInt8(), // hardware addr type: 1 for 10mb ethernet
      hlen: sb.getUInt8(), // hardware addr length: 6 for 10mb ethernet
      hops: sb.getUInt8(), // relay hop count
      xid: sb.getUInt32(), // session id, initialized by client
      secs: sb.getUInt16(), // seconds since client began address acquistion
      flags: sb.getUInt16(), // 
      ciaddr: sb.getIP(), // client IP when BOUND, RENEW, REBINDING state
      yiaddr: sb.getIP(), // 'your' client IP
      siaddr: sb.getIP(), // next server to use in boostrap, returned in OFFER & ACK
      giaddr: sb.getIP(), // gateway/relay agent IP
      chaddr: sb.getMAC(), // client hardware address
      sname: sb.getUTF8(64), // server host name
      file: sb.getASCII(128), // boot file name
      magicCookie: sb.getUInt32(), // contains 99, 130, 83, 99
      options: sb.getOptions()
    };
    return msg;
  },
  listen: function () {

    var sock = this._sock;

    sock.bind(67, "0.0.0.0", function () {
      sock.setBroadcast(true);
    });
  }

};

util.inherits(Server, EventEmitter);

module.exports = {
  createServer: function (opt) {
    return new Server(opt);
  },
  createClient: function (opt) {
    return new Client(opt);
  }
};
