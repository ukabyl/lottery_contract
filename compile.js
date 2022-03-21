const path = require('path');
const fs = require('fs');
const solc = require('solc');

const lotteryContractPath = path.resolve(__dirname, 'contracts', 'Lottery.sol');
const sourceCodeOfLotteryContract = fs.readFileSync(lotteryContractPath, 'utf-8');

const lotteryContractPattern = {
    language: 'Solidity',
    sources: {
      'Lottery.sol': {
        content: sourceCodeOfLotteryContract
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };

const output = JSON.parse(solc.compile(JSON.stringify(lotteryContractPattern)));

module.exports = output.contracts['Lottery.sol'].Lottery;