
var dhcpd = require('../lib/dhcp.js');

var s = dhcpd.createServer({
  // System settings
  range: [
    "10.0.10.3", "10.0.10.50"
  ],
  provider: new dhcpd.FileProvider('./dhcp-leases'),
  // Option settings
  netmask: '255.255.255.0',
  router: [
    '10.0.10.1'
  ],
  timeServer: null,
  nameServer: null,
  dns: ["10.0.10.2", "8.8.8.8"],
  hostname: "orchestrator",
  domainName: "home.local",
  broadcast: '10.0.10.255',
  server: '10.0.10.2', // This is us
  maxMessageSize: 1500,
  leaseTime: 86400,
  renewalTime: 60,
  rebindingTime: 120,
});

s.on('message', function (data) {
  console.log(data);
});

s.on('bound', function(state) {
  console.log("BOUND:");
  console.log(state);
});

s.on("error", function (err, data) {
  console.log(err, data);
});

s.on("listening", function (sock) {
  var address = sock.address();
  console.info('Server Listening: ' + address.address + ':' + address.port);
});

s.on("close", function () {
  console.log('close');
});

s.listen();

process.on('SIGINT', () => {
    s.close();
});
