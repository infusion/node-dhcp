
var Options = require('./options.js').opts;

function trimZero(str) {

  var pos = str.indexOf('\x00');

  if (pos === -1) {
    return str;
  }
  return str.substr(0, pos);
}

function SeqBuffer(buf, len) {

  this._data = buf || new Buffer(len || 1500).fill(0);
}

SeqBuffer.prototype = {

  _data: null,
  _r: 0,
  _w: 0,

  addUInt8: function (val) {
    this._w = this._data.writeUInt8(val, this._w, true);
  },
  getUInt8: function () {
    return this._data.readUInt8(this._r++, true);
  },
  //
  addInt8: function (val) {
    this._w = this._data.writeInt8(val, this._w, true);
  },
  getInt8: function () {
    return this._data.readInt8(this._r++, true);
  },
  //
  addUInt16: function (val) {
    this._w = this._data.writeUInt16BE(val, this._w, true);
  },
  getUInt16: function () {
    return this._data.readUInt16BE((this._r += 2) - 2, true);
  },
  //
  addInt16: function (val) {
    this._w = this._data.writeInt16BE(val, this._w, true);
  },
  getInt16: function () {
    return this._data.readInt16BE((this._r += 2) - 2, true);
  },
  //
  addUInt32: function (val) {
    this._w = this._data.writeUInt32BE(val, this._w, true);
  },
  getUInt32: function () {
    return this._data.readUInt32BE((this._r += 4) - 4, true);
  },
  //
  addInt32: function (val) {
    this._w = this._data.writeInt32BE(val, this._w, true);
  },
  getInt32: function () {
    return this._data.readInt32BE((this._r += 4) - 4, true);
  },
  //
  addUTF8: function (val, fixLen) {

    if (fixLen) {
      this._data.fill(0, this._w, this._w + fixLen);
      this._data.write(val.slice(0, fixLen), this._w, 'utf8'); // TODO: not optimal truncation
      this._w += fixLen;
    } else {
      this._w += this._data.write(val, this._w, 'utf8');
    }
  },
  getUTF8: function (len) {
    return trimZero(this._data.toString("utf8", this._r, this._r += len));
  },
  //
  addASCII: function (val, fixLen) {

    if (fixLen) {
      this._data.fill(0, this._w, this._w + fixLen);
      this._data.write(val.slice(0, fixLen), this._w, 'ascii');
      this._w += fixLen;
    } else {
      this._w += this._data.write(val, this._w, 'ascii');
    }
  },
  getASCII: function (len) {
    return trimZero(this._data.toString("ascii", this._r, this._r += len));
  },
  //
  addIP: function (ip) {
    var self = this;
    var octs = ip.split(".");

    if (octs.length !== 4) {
      throw new Error('Invalid IP address ' + ip);
    }

    octs.forEach(function (val) {
      val = parseInt(val, 10);

      if (0 <= val && val < 256) {
        self.addUInt8(val);
      } else {
        throw new Error('Invalid IP address ' + ip);
      }

    });
  },
  getIP: function () {

    var ip = "";
    var off = this._r;

    for (var i = 0; i < 4; i++) {

      if (i > 0)
        ip += ".";

      ip += this._data[off].toString(10);
      off++;
    }
    this._r += 4;
    return ip;
  },
  //
  addIPs: function (ips) {
    if (typeof ips === "string") {
      this.addIP(ips);
    } else {
      var self = this;
      ips.forEach(function (ip) {
        self.addIP(ip);
      });
    }
  },
  getIPs: function (len) {
    var ret = [];
    for (var i = 0; i < len; i += 4) {
      ret.push(this.getIP());
    }
    return ret;
  },
  //
  addMac: function (mac) {
    var self = this;
    var octs = mac.split(/[-:]/);

    if (octs.length !== 6) {
      throw new Error('Invalid Mac address ' + mac);
    }

    octs.forEach(function (val) {
      val = parseInt(val, 16);

      if (0 <= val && val < 256) {
        self.addUInt8(val);
      } else {
        throw new Error('Invalid Mac address ' + mac);
      }
    });

    // Add 10 more byte to pad 16 byte
    this.addUInt32(0);
    this.addUInt32(0);
    this.addUInt16(0);
  },
  getMAC: function () {

    var mac = "";
    var off = this._r;

    for (var i = 0; i < 6; i++) {

      if (i > 0)
        mac += "-";

      var c = this._data[off].toString(16).toUpperCase();
      off++;

      mac += c.length < 2 ? "0" + c : c;
    }
    this._r = off + 10; // + 10 since field is 16 byte and only 6 are used
    return mac;
  },
  //
  addBool: function () {
    /* void */
  },
  getBool: function () {
    return true;
  },
  //
  addOptions: function (opts) {

    for (var i in opts) {

      if (opts.hasOwnProperty(i)) {

        var opt = Options[i];
        var len = 0;
        var val = opts[i];
        
        if (val === null) {
          continue;
        }

        switch (opt.type) {
          case 'UInt8':
          case 'Int8':
            len = 1;
            break;
          case 'UInt16':
          case 'Int16':
            len = 2;
            break;
          case 'UInt32':
          case 'Int32':
          case 'IP':
            len = 4;
            break;
          case 'IPs':
            len = typeof val === "string" ? 4 : (4 * val.length);
            break;
          case 'ASCII':
            len = val.length;
            if (len === 0)
              continue; // Min length has to be 1
            if (len > 255) {
              console.error(val + " too long, truncating...");
              val = val.slice(0, 255);
              len = 255;
            }
            break;
          case 'UTF8':
            len = Buffer.from(val, 'utf8').length;
            if (len === 0)
              continue; // Min length has to be 1
            if (len > 255) {
              console.error(val + " too long, truncating...");
              val = val.slice(0, 250); // TODO: needs a better truncation mechanism
              len = Buffer.from(val, 'utf8').length;
            }
            break;
          case 'Bool':
            if (!val)
              continue;
            // Length must be zero, so nothing to do here
            break;
          case 'Array':
            len = val.length;
            break;
          default:
            throw new Error("No such type " + opt.type);
        }

        // Write code
        this.addUInt8(i);

        // Write length
        this.addUInt8(len);

        // Write actual data
        this["add" + opt.type](val);
      }
    }
  },
  getOptions: function () {

    var options = {};
    var buf = this._data;

    while (this._r < buf.length) {

      var type = this.getUInt8();

      if (type === 255) { // End type
        break;
      } else if (type === 0) { // Pad type
        this._r++;
      } else {

        var len = this.getUInt8();

        if (type in Options) {
          options[type] = this["get" + Options[type].type](len);
        } else {
          console.error("Type " + type + " not known");
        }
      }
    }
    return options;
  },
  //
  addArray: function (arr) {
    for (var i = 0; i < arr.length; i++) {
      this.addUInt8(arr[i]);
    }
  },
  getArray: function (len) {
    var ret = [];
    for (var i = 0; i < len; i++) {
      ret.push(this.getUInt8());
    }
    return ret;
  },
  //
  getHex: function (len) {
    return this._data.toString("hex", this._r, this._r += len);
  }
};

module.exports = SeqBuffer;
