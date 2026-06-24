// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract S01AttackerController {

    event DelegationCaptured(address indexed victim);

    function activate() external {
        emit DelegationCaptured(msg.sender);
    }
}