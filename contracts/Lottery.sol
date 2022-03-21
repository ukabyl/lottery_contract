// SPDX-License-Identifier: SPDX-License
pragma solidity ^0.8.13;

contract Lottery {
    address private manager; 
    address[] private players;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable limitEntered {
        require(msg.value > .01 ether);
        players.push(msg.sender);
    }

    function getPlayers() public view returns (address[] memory) {
        return players;
    }

    function random() private view returns (uint) {
        return uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }

    function pickWinner() public {
        require(msg.sender == manager);
        uint index = random() % players.length;
        payable(players[index]).transfer(address(this).balance);
        players = new address[](0);
    }

    modifier limitEntered() {
        for (uint i; i < players.length; i++) {
            require(players[i] != msg.sender);
        }
        _;
    }
}
