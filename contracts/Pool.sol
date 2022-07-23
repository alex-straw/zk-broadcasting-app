// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

interface IPoolFactory {
    function verifyTx(Pool.Proof memory proof, uint[2] memory input)
        external
        returns (bool);
}

contract Pool {
    uint256 public uploadCount = 0;
    string[] public emails;
    uint256 public verifiedIdCount = 0;
    uint256 public idCount;
    string[] public ipfsCIDs;
    uint256[2] public poolHashDigest;
    string public poolName;
    address public poolFactory;
    address public setupAddress;
    bool public initialised = false;

    struct Id {
        uint[2] idHashDigest;
        bool verified;
    }

    mapping(bytes32 => bool) private usedProofs;
    mapping(string => Id) public ids;

    // -------  Proof Type ------- //

    struct G1Point {
        uint X;
        uint Y;
    }

    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }

    struct Proof {
        G1Point a;
        G2Point b;
        G1Point c;
    }

    constructor(
        string memory _poolName,
        string[] memory _emails,
        address _setupAddress,
        address _poolFactory
    ) {
        poolName = _poolName;
        emails = _emails;
        setupAddress = _setupAddress;
        poolFactory = _poolFactory;
    }

    // -------  Setup ------- //

    function addHashDigests(
        uint256[2][] memory _hashDigests,
        uint256[2] memory _poolHashDigest
    ) public onlySetupAddress notInitialised {
        poolHashDigest = _poolHashDigest;
        idCount = _hashDigests.length;
        for (uint256 i = 0; i < idCount; i++) {
            ids[emails[i]] = Id(_hashDigests[i], false);
        }
        initialised = true;
    }

    // -------  Functions ------- //

    function verifyId(string memory email, Proof memory proof)
        public
        isInitialised
    {
        require(
            ids[email].verified == false,
            "Email has already been verified"
        );
        if (
            IPoolFactory(poolFactory).verifyTx(
                proof,
                ids[email].idHashDigest
            ) == true
        ) {
            ids[email].verified = true;
            verifiedIdCount += 1;
        } else {
            revert("Invalid proof");
        }
    }

    /*
        1. Checks if a submitted proof is valid. If it is, add the hash of this to a used proofs mapping.
        2. Check that all accounts have been verified. This must be done after adding the proof to the used
           proofs array - otherwise, a malicious actor could re-use a valid proof that was submitted before
           all email addresses were verified (by looking through old tx data).
        3. Keep track of upload count for easy indexing, and push the CID to an array.
    */

    function broadcastData(Proof memory proof, string memory cid)
        public
        isInitialised
    {
        if (IPoolFactory(poolFactory).verifyTx(proof, poolHashDigest) == true) {
            bytes32 proofId = keccak256(abi.encode(proof.a, proof.b, proof.c));
            require(usedProofs[proofId] != true, "Proof has already been used");
            usedProofs[proofId] = true;
            require(
                verifiedIdCount == idCount,
                "Not all accounts have been verified"
            );
            uploadCount += 1;
            ipfsCIDs.push(cid);
        } else {
            revert("Invalid proof");
        }
    }

    // -------  Modifiers ------- //

    modifier onlySetupAddress() {
        require(
            msg.sender == setupAddress,
            "Only the setup address can call this function"
        );
        _;
    }

    modifier isInitialised() {
        require(
            !initialised,
            "The pool must be initialised first by the setup address"
        );
        _;
    }

    modifier notInitialised() {
        require(initialised, "The pool has already been initialised");
        _;
    }

    receive() external payable {}
}
