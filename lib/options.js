

// RFC 1533: https://tools.ietf.org/html/rfc1533
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
    type: "ASCII",
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
  28: {
    name: "Broadcast Address",
    type: "IP",
    option: "broadcast",
    default: function () {
      // ...
    }
  },
  50: {
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
      7: 'DHCPRELEASE'
    }
  },
  54: {
    name: "Server Identifier",
    type: "IP",
    option: "server"
  },
  55: {
    name: "Parameter Request List",
    type: "Array"
  },
  56: {
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
  60: {
    name: "Class-identifier",
    type: "ASCII"
  },
  61: {
    name: "Client-identifier",
    type: "Hex"
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
