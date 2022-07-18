//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

import "./DemoVerifier.sol";

contract DemoPool is DemoVerifier {

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