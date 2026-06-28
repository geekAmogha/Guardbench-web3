// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract S10NFTMarketplace {
    address public verifiedOperator;
    address public owner;

    mapping(address => bool) public approvedOperators;

    event OperatorApproved(address indexed operator, address indexed nftOwner);
    event NFTListed(address indexed operator, address indexed nftOwner, uint256 tokenId);
    event UnverifiedOperatorBlocked(address indexed operator);

    constructor(address _verifiedOperator) {
        verifiedOperator = _verifiedOperator;
        owner = msg.sender;
        approvedOperators[_verifiedOperator] = true;
    }

    function approveOperator(address operator) external {
        if (approvedOperators[operator]) {
            emit OperatorApproved(operator, msg.sender);
        } else {
            emit UnverifiedOperatorBlocked(operator);
            revert("Operator not verified by marketplace");
        }
    }

    function listNFT(address operator, uint256 tokenId) external {
        require(approvedOperators[operator], "Operator not verified");
        emit NFTListed(operator, msg.sender, tokenId);
    }

    function isVerifiedOperator(address operator) external view returns (bool) {
        return approvedOperators[operator];
    }
}