// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

import "./Verifier.sol";

contract Pool is Verifier {

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

    /*
        1. Checks if a submitted proof is valid. If it is, add the hash of this to a used proofs mapping.
        2. Check that all accounts have been verified. This must be done after adding the proof to the used
           proofs array - otherwise, a malicious actor could re-use a valid proof that was submitted before
           all email addresses were verified (by looking through old tx data).
        3. Keep track of upload count for easy indexing, and push the CID to an array.
    */

    function broadcastData(Proof memory proof, string memory cid) public { 
        if (verifyTx(proof, poolHashDigest) == true) {
            bytes32 proofId = keccak256(abi.encode(proof.a, proof.b, proof.c));
            require(usedProofs[proofId] != true, "Proof has already been used");
            usedProofs[proofId] = true;
            require(verifiedIdCount == idCount, "Not all accounts have been verified");
            uploadCount += 1;
            ipfsCIDs.push(cid);
        } else {
            revert("Invalid proof");
        }
    }
}