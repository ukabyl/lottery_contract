const assert = require('assert');
const Web3 = require('web3');
const ganache = require('ganache-cli');
const web3 = new Web3(ganache.provider());
const { evm: { bytecode: { object } }, abi } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    lottery = await new web3.eth.Contract(abi)
        .deploy({ data: object })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery Contract', () => {
    it('deployes successfuly', () => {
        assert.ok(lottery.options.address);
    });

    it('can enter one account', async () => {
        const addressOfPlayerToEnter = accounts[1];

        const transaction = await lottery.methods.enter().send({
            from: addressOfPlayerToEnter,
            value: web3.utils.toWei('.02', 'ether'),
        });
        const players = await lottery.methods.getPlayers().call();

        assert.ok(transaction.transactionHash);
        assert.ok(players.length);
        assert.equal(players[0], addressOfPlayerToEnter);
    });

    it('can enter multiple accounts', async () => {
        let addressOfPlayer1 = accounts[1];
        let addressOfPlayer2 = accounts[2];
        let addressOfPlayer3 = accounts[3];

        transaction1 = await lottery.methods.enter().send({
            from: addressOfPlayer1,
            value: web3.utils.toWei('.02', 'ether'),
        });
        transaction2 = await lottery.methods.enter().send({
            from: addressOfPlayer2,
            value: web3.utils.toWei('.02', 'ether'),
        });
        transaction3 = await lottery.methods.enter().send({
            from: addressOfPlayer3,
            value: web3.utils.toWei('.02', 'ether'),
        });

        const players = await lottery.methods.getPlayers().call();

        assert.ok(transaction1.transactionHash);
        assert.ok(transaction2.transactionHash);
        assert.ok(transaction3.transactionHash);
        assert.equal(players[0], addressOfPlayer1);
        assert.equal(players[1], addressOfPlayer2);
        assert.equal(players[2], addressOfPlayer3);
        assert.equal(players.length, 3);
    });

    it('one account enters only once', async () => {
        let transaction1, transaction2, players;

        try {
            transaction1 = await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('.02', 'ether'),
            });
            transaction2 = await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('.02', 'ether'),
            });
        } catch (error) {
            assert(error);
        }

        players = await lottery.methods.getPlayers().call();

        assert.ok(transaction1.transactionHash);
        assert.ok(!transaction2);
        assert.equal(players.length, 1);
    });

    it('requires greater than .01 ether to enter', async () => {
        let transaction;

        try {
            transaction = await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('0.01', 'ether'),
            })
        } catch(error) {
            assert(error);
        }
        
        const players = await lottery.methods.getPlayers().call();

        assert(!transaction);
        assert(!players.length);
    });

    it('requires minimum number of players to enter', async () => {
        let transaction;

        try {
            transaction = await lottery.methods.pickWinner().send({
                from: accounts[0]
            });
        } catch (error) {
            assert(error);
        }

        const players = await lottery.methods.getPlayers().call();

        assert(!transaction);
        assert.ok(!players.length);
    });

    it('only manager can pick winner', async () => {
        let transaction;

        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('.02', 'ether')
        });

        try {
            transaction = await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
        } catch(error) {
            assert(error)
        }

        assert(!transaction);
    });

    it('finishes successfully after pick winner and reset players state', async () => {
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('2', 'ether'),
        });

        const initialBalance = await web3.eth.getBalance(accounts[1]);
        await lottery.methods.pickWinner().send({ from: accounts[0] });
        const finalBalance = await web3.eth.getBalance(accounts[1]);

        const players = await lottery.methods.getPlayers().call();
        const difference = finalBalance - initialBalance;
        assert(difference > web3.utils.toWei('1.8', 'ether'));
        assert.ok(!players.length);
    });
});