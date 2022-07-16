// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./Verifier.sol";

contract IdentityFactory is Verifier {

    uint public uploadCount = 0;
    string[] public ipfsCIDs;
    mapping(bytes32 => bool) usedProof;

    function broadcastData(Proof memory proof, string memory cid) public { 
        if (verifyTx(proof) == true) {
            bytes32 proofId = keccak256(abi.encode(proof.a, proof.b, proof.c));
            require(usedProof[proofId] != true, "Proof has already been used");
            usedProof[proofId] = true;
            uploadCount += 1;
            ipfsCIDs.push(cid);
        } else {
            revert("Invalid proof");
        }
    }
}