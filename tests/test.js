const { test, expect } = require('@jest/globals');
const fs = require('fs');
const pac = require('pac-resolver');


// Wrapper around pac-resolver
// Override the myIpaddress function to return the passed Ip address
// This allows for testing behaviour for different Ip addresses
//
function findProxy(pacfile, url, myIp) {
  var FindProxyForURL = pac(pacfile, { sandbox: {myIpAddress: () => myIp}});
  return FindProxyForURL(url);
};

// Load the pac File
const pacfile = fs.readFileSync('proxy.pac');

// Test cases that should return DIRECT
const direct_test_cases = [
  // Localhost related tests
  {url: 'http://localhost', expected: 'DIRECT'},
  {url: 'http://localhost.localdomain',expected: 'DIRECT'},
  {url: 'http://127.0.0.1', expected: 'DIRECT'},
  // Wildcard DIRECT domain tests
  {url: 'http://server1.corp.example.com', expected: 'DIRECT'},
  {url: 'http://server1.domain1.corp.example.com', expected: 'DIRECT'},
  {url: 'http://server1.cloud.example.com', expected: 'DIRECT'},
  {url: 'http://server1.domain1.cloud.example.com', expected: 'DIRECT'},
  {url: 'http://server1.us.net', expected: 'DIRECT'},
  {url: 'http://server1.domain1.us.net', expected: 'DIRECT'},
  // Plain hostname with no domains test
  {url: 'http://server1', expected: 'DIRECT'},
  {url: 'http://server2', expected: 'DIRECT'},
  {url: 'https://server1', expected: 'DIRECT'},
  {url: 'https://server2', expected: 'DIRECT'},
  // fqdn tests
  {url: 'http://web1.example.com', expected: 'DIRECT'},
  {url: 'https://web1.example.com', expected: 'DIRECT'},
  {url: 'http://web1.example.net', expected: 'DIRECT'},
  {url: 'https://web1.example.net', expected: 'DIRECT'},
  // IP address
  {url: 'http://12.12.12.1', expected: 'DIRECT'},
  {url: 'http://12.12.12.3', expected: 'DIRECT'},
  // Ip wildcard
  {url: 'http://13.13.13.12', expected: 'DIRECT'},
  {url: 'http://13.13.13.222', expected: 'DIRECT'},
  {url: 'http://14.14.13.12', expected: 'DIRECT'},
  {url: 'http://14.14.14.222', expected: 'DIRECT'},

];

describe('Test for DIRECT cases', () => {
  const myIp = '69.69.69.69';
  test.each(direct_test_cases)('Proxy for $url should be $expected', async ({url,expected}) => {
    const res = await findProxy(pacfile, url, myIp);
    expect(res).toBe(expected);
  });
});


// Testspecific proxy for specific addresses
const site_specific_proxy_test_cases = [
  {url: 'http://toto.myapp.mydomain.com', expected: 'PROXY 3.3.3.3:7777: PROXY 4.4.4.4:7777'},
  {url: 'http://toto.tutu.myapp.mydomain.com', expected: 'PROXY 3.3.3.3:7777: PROXY 4.4.4.4:7777'},
];

describe('Test for site specific proxy cases', () => {
  const myIp = '69.69.69.69';
  test.each(site_specific_proxy_test_cases)('Proxy for $url should be $expected', async ({url,expected}) => {
    const res = await findProxy(pacfile, url, myIp);
    expect(res).toBe(expected);
  });
});




// Test for url that should really use a proxy
const proxyOdd = 'PROXY 1.1.1.1:8080; PROXY 2.2.2.2:8080';
const proxyEven = 'PROXY 2.2.2.2:8080; PROXY 1.1.1.1:8080';
const proxySubnet1 = 'PROXY 3.3.3.3:8080; PROXY 4.4.4.4:8080';
const proxySubnet2 = 'PROXY 3.3.3.3:9999; PROXY 4.4.4.4:9999';


const noDirectTestCases = [
  // Odd Ip Addresses
  {url: 'http://www.google.com', myIp: "69.69.69.69", expected: proxyOdd  },
  {url: 'https://www.google.com', myIp: "69.69.69.69", expected: proxyOdd},
  {url: 'http://server1.example.com', myIp: "69.69.69.69", expected: proxyOdd},
  {url: 'https://server1.example.com', myIp: "69.69.69.69", expected: proxyOdd},
  // Even Ip Addresses
  {url: 'http://www.google.com', myIp: "69.69.69.68", expected: proxyEven  },
  {url: 'https://www.google.com', myIp: "69.69.69.68", expected: proxyEven},
  {url: 'http://server1.example.com', myIp: "69.69.69.68", expected: proxyEven},
  {url: 'https://server1.example.com', myIp: "69.69.69.68", expected: proxyEven},

  // Subnet 1 specific proxy
  {url: 'http://www.google.com', myIp: "70.70.10.11", expected: proxySubnet1  },
  {url: 'http://www.google.com', myIp: "70.70.20.222", expected: proxySubnet1  },
  {url: 'http://server1.example.com', myIp: "70.70.10.11", expected: proxySubnet1  },
  {url: 'http://server1.example.com', myIp: "70.70.20.222", expected: proxySubnet1  },

  // Subnet 2 specific proxy
  {url: 'http://www.google.com', myIp: "80.80.10.11", expected: proxySubnet2  },
  {url: 'http://www.google.com', myIp: "80.80.20.222", expected: proxySubnet2  },
  {url: 'http://server1.example.com', myIp: "80.80.10.11", expected: proxySubnet2  },
  {url: 'http://server1.example.com', myIp: "80.80.20.222", expected: proxySubnet2  },
];

describe('Test for no DIRECT cases', () => {

  describe('Testing Odd IP addresses ', () => {
    test.each(noDirectTestCases)('Proxy for $url for client ip $myIp should be '+proxyOdd, async ({url,myIp,expected}) => {
      const res = await findProxy(pacfile, url, myIp);
      expect(res).toBe(expected);
    });
  });

});

