
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
  option: {
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
    //filename: "blub",
    //nextServer: "bla.com",
    randomIP: true, // Get random new IP from pool instead of keeping one ip
  }
}]);

s.on("error", function (err, data) {
  console.log(err, data);
});

s.listen();
