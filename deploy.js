const Web3 = require('web3');
const { evm: { bytecode: { object } }, abi } = require('./compile');
const HDWalletProvider = require('truffle-hdwallet-provider');

const mnemonicPhrase = '';

const provider = new HDWalletProvider(mnemonucPhrase);
const web3 = new Web3(provider);

async function deploy() {
    const accounts = await web3.eth.getAccount();
    await new web3.eth.Contract(abi)
        .deploy({ data: object })
        .send({ from: accounts[0], gas: '1000000' });
}

module.export = {
    deploy
};