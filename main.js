const Web3 = require('web3');
const index = require('./index.js');

console.log('Start')
var web3 = new Web3('http://127.0.0.1:8545');

let privateKey = undefined;
return index.deploy(web3, privateKey).then(console.log).catch(console.error).then(process.exit)
