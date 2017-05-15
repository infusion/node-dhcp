
var dhcp = require('../dhcp.js');

var s = dhcp.createClient();

s.on('message', function (data) {
  console.log(data);
});

s.on('error', function (err, data) {
  console.log(err, data);
});

s.on('listening', function (sock) {
  var address = sock.address();
  console.info('Client Listening: ' + address.address + ':' + address.port);
});

s.listen();
