const esprima = require('esprima');
const fs = require('fs');
const pac = require('pac-resolver');
const { resolve } = require('path');
const vm = require('vm');
const ip = require('ip');

const pacFile = fs.readFileSync('proxy.pac');
//var FindProxyForURL = pac(fs.readFileSync('proxy.pac'));
var FindProxyForURL = pac(pacFile, { sandbox: {myIpAddress: ip.address} });

const url = "http://localhost";
FindProxyForURL(url).then((res) => {
  console.log(res);
});