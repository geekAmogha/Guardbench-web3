// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract S01VerifiedController {

    event DelegationAccepted(address indexed user);

    function activate() external {
        emit DelegationAccepted(msg.sender);
    }
}