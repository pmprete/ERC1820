const ethTx = require('ethereumjs-tx');
const ethUtils = require('ethereumjs-util');

const artifacts = require('./artifacts')();
const rawTransaction = require('./rawTransaction');



generateDeployTx = () => {
    const tx = new ethTx(rawTransaction);
    const res = {
        sender: ethUtils.toChecksumAddress(tx.getSenderAddress().toString('hex')),
        rawTx: '0x' + tx.serialize().toString('hex'),
        contractAddr: ethUtils.toChecksumAddress(
          ethUtils.generateAddress(tx.getSenderAddress(), ethUtils.toBuffer(0)).toString('hex')),
    };
    return res;
};


deploy = async (web3, privateKey = undefined) => {
    await web3.eth.getBlockNumber();
    console.log('Web3 Connnected')
    const res = generateDeployTx();
    const deployedCode = await web3.eth.getCode(res.contractAddr);
    const amountToSend = '100000000000000000'//'100000000000000000'/* web3.utils.toWei(0.1) */;
    if (deployedCode.length <=4 ) {
        if (!privateKey) {
            let account = (await web3.eth.getAccounts())[0]
            console.log('With default account')
            await web3.eth.sendTransaction({
                from: account, to: res.sender, value: amountToSend
              });
        } else {
            var gasLimit = 3000000;
            var gasPrice = 66000000;
            var privKey =  Buffer.from(privateKey, 'hex');
            var addr = ethUtils.privateToAddress(privKey).toString('hex');
            var nonce = await web3.eth.getTransactionCount(addr);
            var rawTransaction = {
                "from": addr,
                "nonce":  nonce,
                "gasPrice": web3.utils.toHex(gasPrice),
                "gasLimit": web3.utils.toHex(gasLimit),
                "to": res.sender,
                "value": `0x${parseInt(amountToSend).toString(16)}` 
            };
            
            var tx = new ethTx(rawTransaction);
            tx.sign(privKey);
            var serializedTx = tx.serialize();
            await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
        }
       
        await web3.eth.sendSignedTransaction(res.rawTx);
    }
    return await new web3.eth.Contract(artifacts.contracts.ERC1820Registry.ERC1820Registry.abi, res.contractAddr);
};



module.exports.generateDeployTx = generateDeployTx;
module.exports.deploy = deploy;
