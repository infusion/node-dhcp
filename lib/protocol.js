
var SeqBuffer = require('./seqbuffer.js');

module.exports = {

  parse: function (buf) {

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
  }



};
