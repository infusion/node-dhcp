

// RFC 1533: https://tools.ietf.org/html/rfc1533
// RFC 2132: https://www.ietf.org/rfc/rfc2132.txt
module.exports = {
  1: {
    name: "Subnet Mask",
    type: "IP",
    option: "netmask",
    default: function () {
      // aus cidr holen, oder default per class - 255.255.255.0
    }
  },
  2: {
    name: "Time Offset",
    type: "Int32",
    option: "timeOffset"
  },
  3: {
    name: "Router",
    type: "IPs",
    option: "router"
  },
  4: {
    name: "Time Server",
    type: "IPs",
    option: "timeServer"
  },
  5: {
    name: "Name Server",
    type: "IPs",
    option: "nameServer"
  },
  6: {
    name: "Domain Name Server",
    type: "IPs",
    option: "dns"
  },
  7: {
    name: "Log Server",
    type: "IPs",
    option: "logServer"
  },
  8: {
    name: "Cookie Server",
    type: "IPs",
    option: "cookieServer"
  },
  9: {
    name: "LPR Server",
    type: "IPs",
    option: "lprServer"
  },
  10: {
    name: "Impress Server",
    type: "IPs",
    option: "impressServer"
  },
  11: {
    name: "Resource Location Server",
    type: "IPs",
    option: "rscServer"
  },
  12: {
    name: "Host Name",
    type: "ASCII",
    option: "hostname"
  },
  13: {
    name: "Boot File Size",
    type: "UInt16",
    option: "bootFileSize"
  },
  14: {
    name: "Merit Dump File",
    type: "ASCII",
    option: "dumpFile"
  },
  15: {
    name: "Domain Name",
    type: "ASCII",
    option: "domainName"
  },
  16: {
    name: "Swap Server",
    type: "IP",
    option: "swapServer"
  },
  17: {
    name: "Root Path",
    type: "ASCII",
    option: "rootPath"
  },
  18: {
    name: "Extension Path",
    type: "ASCII",
    option: "extensionPath"
  },
  19: {
    name: "IP Forwarding", // Force client to enable ip forwarding
    type: "Bool",
    option: "enableIPforwarding"
  },
  28: {
    name: "Broadcast Address",
    type: "IP",
    option: "broadcast",
    default: function () {
      // ...
    }
  },
  40: {
    name: "Network Information Service Domain",
    type: "ASCII",
    option: "nisDomain"
  },
  41: {
    name: "Network Information Servers",
    type: "IPs",
    option: "nisServer"
  },
  42: {
    name: "Network Time Protocol Servers",
    type: "IPs",
    option: "ntpServer"
  },
  43: {
    name: "Vendor Specific Information",
    type: "Array",
    option: "vendor"
  },
  44: {
    name: "NetBIOS over TCP/IP Name Server",
    type: "IPs",
    option: "nbnsServer"
  },
  45: {
    name: "NetBIOS over TCP/IP Datagram Distribution Server",
    type: "IP",
    option: "nbddServer"
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
    option: "nbNodeType"
  },
  47: {
    name: "NetBIOS over TCP/IP Scope",
    type: "ASCII",
    option: "nbScope"
  },
  48: {
    name: "X Window System Font Server",
    type: "IPs",
    option: "xFontServer"
  },
  49: {
    name: "X Window System Display Manager",
    type: "IPs",
    option: "xDisplayManager"
  },
  50: {// IP wish of client in DHCPDISCOVER
    name: "Requested IP Address",
    type: "IP"
  },
  51: {
    name: "IP Address Lease Time",
    type: "UInt32",
    option: "leaseTime"
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
    option: "server"
  },
  55: {// Sent by client to show all things the client wants
    name: "Parameter Request List",
    type: "Array"
  },
  56: {// Error message sent in DHCPNAK on failure
    name: "Message",
    type: "ASCII"
  },
  57: {
    name: "Maximum DHCP Message Size",
    type: "UInt16",
    option: "maxMessageSize",
    default: 1500
  },
  58: {
    name: "Renewal (T1) Time Value",
    type: "UInt32",
    option: "renewalTime"
  },
  59: {
    name: "Rebinding (T2) Time Value",
    type: "UInt32",
    option: "rebindingTime"
  },
  60: {// Sent by client to identify type of a client
    name: "Vendor Class-Identifier",
    type: "ASCII"
  },
  61: {// Sent by client to specify their unique identifier
    name: "Client-Identifier",
    type: "Hex"
  },
  64: {
    name: "Network Information Service+ Domain",
    type: "ASCII",
    method: "nisPlusDomain"
  },
  65: {
    name: "Network Information Service+ Servers",
    type: "IPs",
    option: "nisPlusServer"
  },
  66: {// PXE option
    name: "TFTP server name",
    type: "ASCII",
    option: "tftpServer" // e.g. 10.10.10.10
  },
  67: {// PXE option
    name: "Bootfile name",
    type: "ASCII",
    option: "bootFile" // e.g. \smsboot\x64\wdsnbp.com
  },
  68: {
    name: "Mobile IP Home Agent",
    type: "ASCII",
    option: "homeAgentAddresses"
  },
  69: {
    name: "Simple Mail Transport Protocol (SMTP) Server",
    type: "IPs",
    option: "smtpServer"
  },
  70: {
    name: "Post Office Protocol (POP3) Server",
    type: "IPs",
    option: "pop3Server"
  },
  71: {
    name: "Network News Transport Protocol (NNTP) Server",
    type: "IPs",
    option: "nntpServer"
  },
  72: {
    name: "Default World Wide Web (WWW) Server",
    type: "IPs",
    option: "wwwServer"
  },
  73: {
    name: "Default Finger Server",
    type: "IPs",
    option: "fingerServer"
  },
  74: {
    name: "Default Internet Relay Chat (IRC) Server",
    type: "IPs",
    option: "ircServer"
  },
  75: {
    name: "StreetTalk Server",
    type: "IPs",
    option: "streetTalkServer"
  },
  76: {
    name: "StreetTalk Directory Assistance (STDA) Server",
    type: "IPs",
    option: "streetTalkDAServer"
  },
  80: {// RFC 4039: http://www.networksorcery.com/enp/rfc/rfc4039.txt
    name: "Rapid Commit",
    type: "Bool"
  },
  116: {// RFC 2563: https://tools.ietf.org/html/rfc2563
    name: "Auto-Configure",
    type: "UInt8",
    values: {
      0: "DoNotAutoConfigure",
      1: "AutoConfigure"
    }
  },
  // TODO: 119
  145: {// RFC 6704: https://tools.ietf.org/html/rfc6704
    name: "Forcerenew Nonce",
    type: "Bool"
  }
};
