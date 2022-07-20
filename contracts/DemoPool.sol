// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

import "./DemoVerifier.sol";

contract DemoPool is DemoVerifier {

    uint public uploadCount = 0;
    string[] public emails;
    uint public verifiedIdCount = 0;
    uint public idCount;
    string[] public ipfsCIDs;
    uint[2] public poolHashDigest;

    struct Id {
        uint[2] idHashDigest;
        bool verified;
    }

    mapping(bytes32 => bool) private usedProofs;
    mapping(string => Id) public ids;

    constructor (string[] memory _emails, uint[2][] memory _hashDigests, uint[2] memory _poolHashDigest) {
        poolHashDigest = _poolHashDigest;
        emails = _emails;
        idCount = _hashDigests.length;
        for (uint i=0; i<idCount; i++) {
            ids[_emails[i]] = Id(_hashDigests[i], false);
        }
    }

    function verifyId(string memory email, Proof memory proof) public {
        require(ids[email].verified == false, "Email has already been verified");
        if (verifyTx(proof, ids[email].idHashDigest) == true) {
            ids[email].verified = true; 
            verifiedIdCount += 1;
        } else {
            revert("Invalid proof");
        }
    }

    function broadcastData(Proof memory proof, string memory cid) allVerified public { 
        if (verifyTx(proof, poolHashDigest) == true) {
            bytes32 proofId = keccak256(abi.encode(proof.a, proof.b, proof.c));
            require(usedProofs[proofId] != true, "Proof has already been used");
            usedProofs[proofId] = true;
            uploadCount += 1;
            ipfsCIDs.push(cid);
        } else {
            revert("Invalid proof");
        }
    }

    modifier allVerified() {
        require(verifiedIdCount == idCount, "Not all accounts have been verified");
        _;
    }
}