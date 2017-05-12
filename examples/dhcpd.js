
var dhcpd = require('../dhcpd.js');

var s = dhcpd.createServer([{
  netmask: '255.255.255.0',
  range: [
    "192.168.3.10", "192.168.3.99"
  ],
  static: {
    "11:22:33:44:55:66": "192.168.3.100"
  },
  match: {
    _: "unknownClients", // all unknown (not falling into static) clients will go into this pool
    name: /raspberry/
  },
  config: {
    router: [
      '192.168.0.1'
    ],
    timeServer: null,
    nameServer: null,
    dns: ["8.8.8.8", "8.8.4.4"],
    hostname: "kacknup",
    domainName: "xarg.org",
    broadcast: '192.168.0.255',
    leaseTime: 86400,
    server: '192.168.0.1',
    maxMessageSize: 1500,
    renewalTime: 60,
    rebindingTime: 120,
    randomIP: true, // Get random new IP from pool instead of keeping one ip
    bootFile: function (req) {

      if (req.clientId === 'foo bar') {
        return 'x86linux.0';
      } else {
        return 'x64linux.0';
      }
    }
  }
}]);

s.on("error", function (err, data) {
  console.log(err, data);
});

s.listen();
