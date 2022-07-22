// SPDX-License-Identifier: GPL-3.0

import "./Verifier.sol";
import "./Pool.sol";

pragma solidity ^0.8.7;

/* 

1. This contract keeps track of all officially deployed pools.
2. It deploys a generic Verifier.sol contract which can be reused for all pools.
    a) This improves security as the zk-SNARK trusted setup must only be performed once.
    b) This decreases the gas costs associated with deploying a new pool.
*/

contract PoolFactory is Verifier {
    
    // -------  State ------- //
    uint256 public poolCount = 0;
    string[] public poolNames;
    address public owner;

    struct poolAddress {
        address poolAddress;
        bool isAddress;
    }

    mapping(string => poolAddress) public poolAddresses;

    constructor() {
        owner = msg.sender;
    }

    function createPool(
        string memory _poolName,
        string[] memory _emails,
        uint256[2][] memory _hashDigests,
        uint256[2] memory _poolHashDigest
    ) public onlyOwner {

        if(poolAddresses[_poolName].isAddress) revert();

        Pool pool = new Pool(
            _poolName,
            _emails,
            _hashDigests,
            _poolHashDigest,
            address(this)
        );

        poolNames.push(_poolName);
        poolAddresses[_poolName] = poolAddress(address(pool), true);
        poolCount += 1;
    }

    // -------  Modifiers ------- //

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    // -------  Getters ------- //
    function getPoolAddress(string memory _poolName) public view returns(address) {
        return poolAddresses[_poolName].poolAddress;
    }

}
