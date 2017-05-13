
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
const DHCPINFORM = 8;


_getOptionFromConfig = function (confName) {

  // TODO: make this an O(1) lookup
  for (var o in Options) {
    if (Options[o].config === confName) {
      return o;
    }
  }
  return null;
};

function parseIp(str) {
  var octs = str.split(".");
  var num = 0;

  if (octs.length !== 4) {
    throw new Error('Invalid IP address ' + str);
  }

  octs.forEach(function (val) {
    val = parseInt(val, 10);

    if (0 <= val && val < 256) {
      num <<= 8;
      num |= val;
    } else {
      throw new Error('Invalid IP address ' + str);
    }
  });
}

function formatIp(num) {
  var ip = "";

  for (var i = 3; i >= 0; i--) {

    if (ip)
      ip += ".";

    ip += ((num >>> (i * 8)) & 0xFF).toString(10);
  }
  return ip;
}

function Server(settings) {

  EventEmitter.call(this);

  var self = this;
  var sock = dgram.createSocket('udp4');

  settings = settings || {};


  // Ducktyping for the moment
  settings.get = function (conf) {

    var val;
    var optId = _getOptionFromConfig(conf);

    // If config setting is set by user
    if (this[conf] !== undefined) {
      val = this[conf];
    } else {

      // Search for default values
      if (Options[optId] !== undefined) {
        val = Options[optId].default;
        if (val === undefined) {
          return null;
        }
      } else {
        // TODO: report
      }
    }

    // If a function was provided
    if (val instanceof Function) {
      val = val.call({
        config: settings,
        parseIp: parseIp,
        formatIp: formatIp
      });
    }

    // If it's a string value and the option has a "values" attribute:
    if (typeof val === "string" && Option[optId].values) {
      var values = Option[optId].values;
      for (var i in values) {
        if (values[i] === val) {
          return parseInt(i, 10);
        }
      }
    }
    return val;
  };

  sock.on('message', function (buf) {

    var req = self._parse(buf);

    if (!req.options[53]) {
      self.emit("error", new Error("Got message, without valid message type"), req);
      return;
    }
    self._answer(req, settings);
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

  _answer: function (req, settings) {

    var force = settings.get('forceOptions');
    var type = req.options[53];
    var requestedParams = req.options[55];
    var params = {};

    // Add all parameters the client wants 
    for (var i = 0; i < requestedParams.length; i++) {
      params[requestedParams[i]] = null;
    }

    // Add all parameter the user forces
    if (force instanceof Array) {
      for (var i = 0; i < force.length; i++) {

        var id = _getOptionFromConfig(force[i]);
        if (id !== null) {

        } else {
          this.emit("error", "Unknown config force option", force[i]);
        }
      }
    } else if (force !== undefined) {
      this.emit("error", "Invalid forceOptions value", force);
    }

    // Formulate an options object
    var opts = this._getOptions(type, settings, params);

    // Formulate the response object
    var ans = {
      op: 2, // Reply
      htype: req.htype,
      hlen: req.hlen,
      hops: req.hops,
      xid: req.xid,
      secs: req.secs,
      flags: 0,
      ciaddr: req.ciaddr,
      yiaddr: this._chooseIp(settings), // my offer
      siaddr: settings.get('server'), // server ip
      giaddr: req.giaddr,
      chaddr: req.chaddr,
      sname: "",
      file: "",
      options: opts
    };

    // Send the actual data
    this._send('255.255.255.255', ans);
  },

  _chooseIp: function (settings) {

    // 1. Hat es static binding?

    // 2. Welche IP will der client?
    //    -> ist randomIP an?
    //         ja: gib zufällige ip aus range
    //         nein: ist gewünschte IP verfügbar?
    //               ja: done
    //               nein: gib zufällige ip aus range

    return '192.168.33.55';

  },

  _getOptions: function (type, settings, params) {


    // Get the options config ready
    var ret = {};
    for (var i in params) {

      if (Options[i] === undefined) {
        this.emit('error', 'Unknown option ' + i);
      } else {
        ret[i] = settings.get(Options[i].config);
      }
    }

    // Add message type
    switch (type) {
      case DHCPDISCOVER:
        ret[53] = DHCPOFFER;
        break;
      default: // temporary
        ret[53] = DHCPACK;
    }
    return ret;
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
