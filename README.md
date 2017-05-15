
![DHCPD.js](https://github.com/infusion/DHCP.js/blob/master/res/logo.png?raw=true "JavaScript DHCP Server")

DHCP.js is a RFC compliant DHCP client and server implementation on top of node.js.


Introduction
===






Usage
===









Installation
===
Installing DHCP.js is as easy as cloning this repo or use npmjs:

```bash
npm install --save dhcp
```

If command line tools `dhcp` and `dhcpd` shall be installed, npmjs can be used as well:

```bash
npm install dhcp -g
```


Troubleshooting
===

A broadcast is typically not spread across all interfaces. In order to route the broadcast to a specific interface, you can reroute 255.255.255.255.

Linux
---
```bash
route add -host 255.255.255.255 dev eth0
```

OS-X
---
```bash
sudo route add -host 255.255.255.255 -interface en4 
```

Testing
===
If you plan to enhance the library, make sure you add test cases and all the previous tests are passing. You can test the library with

```bash
npm test
```

Copyright and licensing
===
Copyright (c) 2017, [Robert Eisele](http://www.xarg.org/)
Dual licensed under the MIT or GPL Version 2 licenses.
