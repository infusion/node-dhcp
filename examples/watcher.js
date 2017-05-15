
var dhcp = require('../lib/dhcp.js');

var s = dhcp.createBroadcastHandler();

s.on('message', function (data) {

  if (data.options[53] === dhcp.DHCPDISCOVER) {
    if (data.chaddr === '12-34-56-78-90-AB') {
      console.log('Welcome home!');
    }
  }
});

s.listen();
