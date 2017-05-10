

// RFC 1533: https://tools.ietf.org/html/rfc1533
module.exports = {
  1: {
    label: "Subnet Mask",
    type: "IP",
    option: "netmask",
    preset: function () {
      // aus cidr holen, oder default per class
    }
  },
  2: {
    label: "Time Offset",
    type: "Int32",
    option: "timeOffset"
  },
  3: {
    label: "Router",
    type: "IPs",
    option: "router",
    preset: function () {

    }
  },
  4: {
    label: "Time Server",
    type: "IPs",
    option: "timeServer"
  },
  5: {
    label: "Name Server",
    type: "IPs",
    option: "nameServer"
  },
  6: {
    label: "Domain Name Server",
    type: "IPs",
    option: "dns"
  },
  7: {
    label: "Log Server",
    type: "IPs",
    option: "logServer"
  },
  12: {
    label: "Host Name",
    type: "ASCII",
    option: "hostname"
  },
  15: {
    label: "Domain Name",
    type: "ASCII",
    option: "domainName"
  },
  28: {
    label: "Broadcast Address",
    type: "IP",
    option: "broadcast",
    preset: function () {
      // ...
    }
  },
  50: {
    label: "Requested IP Address",
    type: "IP"
  },
  51: {
    label: "IP Address Lease Time",
    type: "UInt32",
    option: "leaseTime"
  },
  52: {
    label: "Option Overload",
    type: "UInt8",
    values: {
      1: "file",
      2: "sname",
      3: "both"
    }
  },
  53: {
    label: "DHCP Message Type",
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
    label: "Server Identifier",
    type: "IP",
    option: "server"
  },
  55: {
    label: "Parameter Request List",
    type: "Array"
  },
  56: {
    label: "Message",
    type: "ASCII"
  },
  57: {
    label: "Maximum DHCP Message Size",
    type: "UInt16",
    option: "maxMessageSize",
    preset: 1500
  },
  58: {
    label: "Renewal (T1) Time Value",
    type: "UInt32",
    option: "renewalTime"
  },
  59: {
    label: "Rebinding (T2) Time Value",
    type: "UInt32",
    option: "rebindingTime"
  },
  60: {
    label: "Class-identifier",
    type: "ASCII"
  },
  61: {
    label: "Client-identifier",
    type: "Hex"
  },
  80: {// RFC 4039: http://www.networksorcery.com/enp/rfc/rfc4039.txt
    label: "Rapid Commit",
    type: "Bool"
  },
  116: {// RFC 2563: https://tools.ietf.org/html/rfc2563
    label: "Auto-Configure",
    type: "UInt8",
    values: {
      0: "DoNotAutoConfigure",
      1: "AutoConfigure"
    }
  },
  // TODO: 119
  145: {// RFC 6704: https://tools.ietf.org/html/rfc6704
    label: "Forcerenew Nonce",
    type: "Bool"
  }
};
