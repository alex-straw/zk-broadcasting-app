const { initialize } = require('zokrates-js');
const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = hre;
const crypto = require('crypto');
const fs = require("fs");

const CID_EXAMPLE = 'f01701220c3c4733ec8affd06cf9e9ff50ffc6bcd2ec85a6170004bb709669c31de94391a'
const VALID_PROOF_MEMBER_1 = JSON.parse(fs.readFileSync("./demo/demoProofs/member_1_proof.json"))
const INVALID_PROOF = JSON.parse(fs.readFileSync("./demo/demoProofs/invalid_proof.json"))

describe("zk-broadcasting app setup (pool)", function () {

    /*
        1. Take N email addresses as input
        2. Generate bytes32 preImage and sha-3-256 hash digest
        3. Generate Pool.zok file
        4. Compile Pool.zok, and perform trusted setup - generating verification.key and proving.key
        5. Export Verifier.sol - zk-SNARK contract (using verification.key)
        6. Deploy Pool.sol - which is an extension of the pool specific 'Verifier.sol' file
        7. Using public proving.key file, a user will generate a proof of pre-image
            a) Might be necessary to use exec commands here as the compiled binaries are much faster
               than the javascript library - discuss with Theo.
        8. By calling the 'broadcastData' function on the Pool.sol contract they will verify this tx
        9. If the proof is valid, and unused previously, they will append an IPFS CID to the ipfsCIDs array
        10. IPFS data can be accessed by using a or b:
            a) dweb.link/ipfs/{CID}
            b) {CID}.ipfs.dewb.link
    */

    before(async () => {
        DemoPool = await ethers.getContractFactory("demoPool.sol");
        [addr1, addr2] = await ethers.getSigners();
        demoPool = await DemoPool.deploy();
        await demoPool.deployed();
    });

    describe("Broadcast", () => {

        it("Should revert if an EOA sends an invalid proof", async function() {
            expect(await demoPool.broadcastData(INVALID_PROOF, CID_EXAMPLE)).to.revert("Invalid proof")
        });
    });
});