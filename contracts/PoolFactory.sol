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
        bool isPending;
        bool isDeployed;
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
        require(!poolAddresses[_poolName].isDeployed, "Name is already in use (and deployed)");
        require(poolAddresses[_poolName].isPending, "Name is not pending deployment (call paySetupFee first)");
        Pool pool = new Pool(
            _poolName,
            _emails,
            _verificationHashDigests,
            address(this),
            _broadcastThreshold
        );

        poolNames.push(_poolName);
        poolAddresses[_poolName] = poolAddress(address(pool), false, true);
        poolCount += 1;
        
        emit PoolCreated(_poolName, address(pool));
    }

    // -------  Pool Request ------- //

    function paySetupFee(string memory poolName, uint idCount) public payable {
        require(!poolAddresses[poolName].isDeployed, "Name is already in use");
        require(!poolAddresses[poolName].isPending, "Name is pending deployment");
        owner.transfer(msg.value);
        // Reserve name
        poolAddresses[poolName] = poolAddress(address(0), true, false);
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

    function poolNameInUse(string memory _poolName)
        public
        view
        returns (bool)
    {
        if (poolAddresses[_poolName].isDeployed || poolAddresses[_poolName].isPending) {
            return true;
        }
        return false;
    }
}
