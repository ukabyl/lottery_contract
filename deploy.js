require('dotenv').config();
const Web3 = require('web3');
const { evm: { bytecode: { object } }, abi } = require('./compile');
const HDWalletProvider = require('truffle-hdwallet-provider');

const provider = new HDWalletProvider(process.env.MnemonicPhrase, process.env.Endpoint);
const web3 = new Web3(provider);

async function deploy() {
    const accounts = await web3.eth.getAccounts();
    const lottery = await new web3.eth.Contract(abi)
        .deploy({ data: object })
        .send({ from: accounts[0], gas: '1000000' });

    console.log(abi);
    console.log(lottery.options.address);
}

module.exports = {
    deploy
};