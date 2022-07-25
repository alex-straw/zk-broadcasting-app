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

    // -------  Events ------- //

    event PoolRequest(
        string indexed _poolName,
        address indexed _from,
        uint _idCount,
        uint _feePaid
    );

    event PoolCreated(
        string indexed _poolName,
        address indexed _contractAddress
    );

    // -------  State ------- //
    uint256 public poolCount = 0;
    string[] public poolNames;
    address payable public owner;

    struct poolAddress {
        address poolAddress;
        bool isAddress;
    }

    mapping(string => poolAddress) public poolAddresses;

    constructor() {
        owner = payable(msg.sender);
    }

    function createPool(
        string memory _poolName,
        string[] memory _emails,
        uint256[2][] memory _verificationHashDigests,
        uint _broadcastThreshold
    ) public onlyOwner {
        if (poolAddresses[_poolName].isAddress) revert();

        Pool pool = new Pool(
            _poolName,
            _emails,
            _verificationHashDigests,
            address(this),
            _broadcastThreshold
        );

        poolNames.push(_poolName);
        poolAddresses[_poolName] = poolAddress(address(pool), true);
        poolCount += 1;
        
        emit PoolCreated(_poolName, address(pool));
    }

    // -------  Pool Request ------- //

    function paySetupFee(string memory poolName, uint idCount) public payable {
        require(!poolAddresses[poolName].isAddress, "Name is already in use");
        owner.transfer(msg.value);
        emit PoolRequest(poolName, msg.sender, idCount, msg.value);
    }

    // -------  Modifiers ------- //

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    // -------  Getters ------- //
    function getPoolAddress(string memory _poolName)
        public
        view
        returns (address)
    {
        return poolAddresses[_poolName].poolAddress;
    }
}
