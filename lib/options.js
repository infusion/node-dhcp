
/**
 * Format:
 * name: A string description of the option
 * type: A type, which is used by SeqBuffer to parse the option
 * config: The name of the configuration option
 * attr: When a client sends data and an option has no configuration, this is the attribute name for the option
 * default: Gets passed if no configuration is supplied for the option (can be a value or a function)
 * values: Represents a map of possible values for this option
 */

// RFC 1533: https://tools.ietf.org/html/rfc1533
// RFC 2132: https://www.ietf.org/rfc/rfc2132.txt
module.exports = {
  1: {// RFC 2132
    name: "Subnet Mask",
    type: "IP",
    config: "netmask",
    default: function () {

      // Default is the minimal CIDR for the given range

      var range = this.config.get('range');
      var ip1 = this.parseIp(range[0]);
      var ip2 = this.parseIp(range[1]);

      // From http://www.xarg.org/tools/subnet-calculator/
      var cidr = 32 - Math.floor(Math.log2((ip1 ^ (ip2 - 1)) + 2)) - 1;

      return this.formatIp(-1 << (32 - cidr));
    }
  },
  2: {// RFC 2132
    name: "Time Offset",
    type: "Int32",
    config: "timeOffset"
  },
  3: {// RFC 2132
    name: "Router",
    type: "IPs",
    config: "router"
  },
  4: {// RFC 2132
    name: "Time Server",
    type: "IPs",
    config: "timeServer"
  },
  5: {
    name: "Name Server",
    type: "IPs",
    config: "nameServer"
  },
  6: {// RFC 2132
    name: "Domain Name Server",
    type: "IPs",
    config: "dns"
  },
  7: {// RFC 2132
    name: "Log Server",
    type: "IPs",
    config: "logServer"
  },
  8: {
    name: "Cookie Server",
    type: "IPs",
    config: "cookieServer"
  },
  9: {
    name: "LPR Server",
    type: "IPs",
    config: "lprServer"
  },
  10: {
    name: "Impress Server",
    type: "IPs",
    config: "impressServer"
  },
  11: {
    name: "Resource Location Server",
    type: "IPs",
    config: "rscServer"
  },
  12: {// RFC 2132
    name: "Host Name",
    type: "ASCII",
    config: "hostname"
  },
  13: {
    name: "Boot File Size",
    type: "UInt16",
    config: "bootFileSize"
  },
  14: {
    name: "Merit Dump File",
    type: "ASCII",
    config: "dumpFile"
  },
  15: {// RFC 2132
    name: "Domain Name",
    type: "ASCII",
    config: "domainName"
  },
  16: {
    name: "Swap Server",
    type: "IP",
    config: "swapServer"
  },
  17: {
    name: "Root Path",
    type: "ASCII",
    config: "rootPath"
  },
  18: {
    name: "Extension Path",
    type: "ASCII",
    config: "extensionPath"
  },
  19: {
    name: "IP Forwarding", // Force client to enable ip forwarding
    type: "UInt8",
    config: "enableIPforwarding",
    values: {
      0: "Disabled",
      1: "Enabled"
    }
  },
  28: {
    name: "Broadcast Address",
    type: "IP",
    config: "broadcast",
    default: function () {
      // ...
    }
  },
  40: {
    name: "Network Information Service Domain",
    type: "ASCII",
    config: "nisDomain"
  },
  41: {
    name: "Network Information Servers",
    type: "IPs",
    config: "nisServer"
  },
  42: {
    name: "Network Time Protocol Servers",
    type: "IPs",
    config: "ntpServer"
  },
  43: {// RFC 2132
    name: "Vendor Specific Information",
    type: "Array",
    config: "vendor"
  },
  44: {
    name: "NetBIOS over TCP/IP Name Server",
    type: "IPs",
    config: "nbnsServer"
  },
  45: {
    name: "NetBIOS over TCP/IP Datagram Distribution Server",
    type: "IP",
    config: "nbddServer"
  },
  46: {
    name: "NetBIOS over TCP/IP Node Type",
    type: "UInt8",
    values: {
      0x1: "B-node",
      0x2: "P-node",
      0x4: "M-node",
      0x8: "H-node"
    },
    config: "nbNodeType"
  },
  47: {
    name: "NetBIOS over TCP/IP Scope",
    type: "ASCII",
    config: "nbScope"
  },
  48: {
    name: "X Window System Font Server",
    type: "IPs",
    config: "xFontServer"
  },
  49: {
    name: "X Window System Display Manager",
    type: "IPs",
    config: "xDisplayManager"
  },
  50: {// IP wish of client in DHCPDISCOVER
    name: "Requested IP Address",
    type: "IP"
  },
  51: {// RFC 2132
    name: "IP Address Lease Time",
    type: "UInt32",
    config: "leaseTime",
    default: 86400
  },
  52: {
    name: "Option Overload",
    type: "UInt8",
    values: {
      1: "file",
      2: "sname",
      3: "both"
    }
  },
  53: {
    name: "DHCP Message Type",
    type: "UInt8",
    values: {
      1: 'DHCPDISCOVER',
      2: 'DHCPOFFER',
      3: 'DHCPREQUEST',
      4: 'DHCPDECLINE',
      5: 'DHCPACK',
      6: 'DHCPNAK',
      7: 'DHCPRELEASE',
      8: 'DHCPINFORM'
    }
  },
  54: {
    name: "Server Identifier",
    type: "IP",
    config: "server"
  },
  55: {// Sent by client to show all things the client wants
    name: "Parameter Request List",
    type: "Array",
    attr: "requestParameter"
  },
  56: {// Error message sent in DHCPNAK on failure
    name: "Message",
    type: "ASCII"
  },
  57: {
    name: "Maximum DHCP Message Size",
    type: "UInt16",
    config: "maxMessageSize",
    default: 1500
  },
  58: {
    name: "Renewal (T1) Time Value",
    type: "UInt32",
    config: "renewalTime",
    default: 3600
  },
  59: {
    name: "Rebinding (T2) Time Value",
    type: "UInt32",
    config: "rebindingTime",
    default: 14400
  },
  60: {// RFC 2132: Sent by client to identify type of a client
    name: "Vendor Class-Identifier",
    type: "ASCII",
    attr: "classId"
  },
  61: {// Sent by client to specify their unique identifier
    name: "Client-Identifier",
    type: "Hex",
    attr: "clientId"
  },
  64: {
    name: "Network Information Service+ Domain",
    type: "ASCII",
    config: "nisPlusDomain"
  },
  65: {
    name: "Network Information Service+ Servers",
    type: "IPs",
    config: "nisPlusServer"
  },
  66: {// RFC 2132: PXE option
    name: "TFTP server name",
    type: "ASCII",
    config: "tftpServer" // e.g. "192.168.0.1"
  },
  67: {// RFC 2132: PXE option
    name: "Bootfile name",
    type: "ASCII",
    config: "bootFile" // e.g. "pxelinux.0"
  },
  68: {
    name: "Mobile IP Home Agent",
    type: "ASCII",
    config: "homeAgentAddresses"
  },
  69: {
    name: "Simple Mail Transport Protocol (SMTP) Server",
    type: "IPs",
    config: "smtpServer"
  },
  70: {
    name: "Post Office Protocol (POP3) Server",
    type: "IPs",
    config: "pop3Server"
  },
  71: {
    name: "Network News Transport Protocol (NNTP) Server",
    type: "IPs",
    config: "nntpServer"
  },
  72: {
    name: "Default World Wide Web (WWW) Server",
    type: "IPs",
    config: "wwwServer"
  },
  73: {
    name: "Default Finger Server",
    type: "IPs",
    config: "fingerServer"
  },
  74: {
    name: "Default Internet Relay Chat (IRC) Server",
    type: "IPs",
    config: "ircServer"
  },
  75: {
    name: "StreetTalk Server",
    type: "IPs",
    config: "streetTalkServer"
  },
  76: {
    name: "StreetTalk Directory Assistance (STDA) Server",
    type: "IPs",
    config: "streetTalkDAServer"
  },
  80: {// RFC 4039: http://www.networksorcery.com/enp/rfc/rfc4039.txt
    name: "Rapid Commit",
    type: "Bool",
    attr: "rapidCommit"
  }, /*
   82: { // RFC 3046
   
   },*/
  116: {// RFC 2563: https://tools.ietf.org/html/rfc2563
    name: "Auto-Configure",
    type: "UInt8",
    values: {
      0: "DoNotAutoConfigure",
      1: "AutoConfigure"
    },
    attr: "autoConfigure"
  }, /*
   119: {
   
   }, */
  145: {// RFC 6704: https://tools.ietf.org/html/rfc6704
    name: "Forcerenew Nonce",
    type: "Array",
    attr: "renewNonce"
  }
};
