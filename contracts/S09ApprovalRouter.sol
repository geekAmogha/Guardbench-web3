// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title GuardBench-Web3 S09 Mock Router
/// @notice Simulates ERC20 approval requests.

contract S09ApprovalRouter {

    mapping(address => mapping(address => uint256))
        public allowances;

    event ApprovalGranted(
        address indexed owner,
        address indexed spender,
        uint256 amount
    );

    function approve(
        address spender,
        uint256 amount
    )
        external
    {
        allowances[msg.sender][spender] =
            amount;

        emit ApprovalGranted(
            msg.sender,
            spender,
            amount
        );
    }

    function allowance(
        address owner,
        address spender
    )
        external
        view
        returns(uint256)
    {
        return allowances[owner][spender];
    }
}