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
    address payable public setupAddress;
    uint public createFeePerUser = 500000000;

    struct poolAddress {
        address poolAddress;
        bool isAddress;
    }

    mapping(string => poolAddress) public poolAddresses;

    constructor() {
        setupAddress = payable(msg.sender);
    }

    function createPool(string memory _poolName, string[] memory _emails)
        public
        payable
    {
        uint setupCost = createFeePerUser * _emails.length;
        require(msg.value >= setupCost, "Please send more Ether to cover the setup costs");
        if (poolAddresses[_poolName].isAddress) revert();
        Pool pool = new Pool(_poolName, _emails, setupAddress, address(this));
        poolNames.push(_poolName);
        poolAddresses[_poolName] = poolAddress(address(pool), true);
        poolCount += 1;
        setupAddress.transfer(createFeePerUser * _emails.length);
    }

    function updateCreateFee(uint _createFeePerUser) public onlySetupAddress {
        createFeePerUser = _createFeePerUser;
    }

    // -------  Getters ------- //

    function getPoolAddress(string memory _poolName)
        public
        view
        returns (address)
    {
        return poolAddresses[_poolName].poolAddress;
    }

    // -------  Modifiers ------- //

    modifier onlySetupAddress() {
        require(
            msg.sender == setupAddress,
            "Only the setup address can call this function"
        );
        _;
    }
}
