// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "Verifier.sol";

contract IdentityFactory is Verifier {

    uint public uploadCount = 0;
    string[] public ipfsCIDs;
    mapping(bytes32 => bool) usedProof;
    
    // Add a mapping here containing usedProofs

    function invalidateProof(Proof memory proof) {
        usedProof[sha256(Proof)] = true;
    }

    function broadcastData(Proof memory proof, string memory cid) public { 
        if (verifyTx(proof) == true) {
            bytes32 proofId = sha256(Proof);
            require(usedProof[proofId] != true, "Proof has already been used");
            usedProof[proofId] = true;
            uploadCount += 1;
            ipfsCIDs.push(cid);
        } else {
            revert("Invalid proof");
        }
    }
}