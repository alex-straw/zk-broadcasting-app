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
    uint public broadcastThreshold;
    uint256 public idCount;
    string[] public ipfsCIDs;
    string poolName;
    address poolFactory;

    struct Member {
        uint[2] hashDigest;
        bool verified;
    }

    mapping(bytes32 => bool) private usedProofs;
    mapping(uint => Member) public members;

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
        uint256[2][] memory _verificationHashDigests,
        address _poolFactory,
        uint _broadcastThreshold
    ) {
        poolName = _poolName;
        emails = _emails;
        poolFactory = _poolFactory;
        broadcastThreshold = _broadcastThreshold;
        idCount = _verificationHashDigests.length;
        require(
            broadcastThreshold <= idCount,
            "Threshold cannot be higher than total number of members"
        );
        for (uint256 i = 0; i < idCount; i++) {
            members[i] = Member(_verificationHashDigests[i], false);
        }
    }

    // -------  Functions ------- //

    function setNewUserHash(uint _memberNumber, uint[2] memory _newHashDigest)
        internal
    {
        require(
            members[_memberNumber].verified,
            "Cannot update a password unless the member is verified"
        ); // Sanity check
        members[_memberNumber].hashDigest = _newHashDigest;
    }

    function verifyId(
        uint memberNumber,
        Proof memory proof,
        uint[2] memory newHashDigest
    ) public {
        require(
            !members[memberNumber].verified,
            "Email has already been verified"
        );
        if (
            IPoolFactory(poolFactory).verifyTx(
                proof,
                members[memberNumber].hashDigest
            ) == true
        ) {
            members[memberNumber].verified = true;
            verifiedIdCount += 1;
            setNewUserHash(memberNumber, newHashDigest);
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

    function broadcastData(
        uint memberNumber,
        Proof memory proof,
        string memory cid
    ) public {
        if (
            IPoolFactory(poolFactory).verifyTx(
                proof,
                members[memberNumber].hashDigest
            ) == true
        ) {
            bytes32 proofId = keccak256(abi.encode(proof.a, proof.b, proof.c));
            require(usedProofs[proofId] != true, "Proof has already been used");
            usedProofs[proofId] = true;
            require(
                members[memberNumber].verified,
                "This account is not verified"
            );
            require(
                verifiedIdCount >= broadcastThreshold,
                "More members must verify their accounts before broadcasting"
            );
            uploadCount += 1;
            ipfsCIDs.push(cid);
        } else {
            revert("Invalid proof");
        }
    }
}
