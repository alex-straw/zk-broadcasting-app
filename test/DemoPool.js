const fs = require("fs");
const { expect } = require("chai");
const { assert } = require("console");
// const { initialize } = require('zokrates-js');

function randomIntFromInterval(min, max) { 
    return Math.floor(Math.random() * (max-min + 1) + min)
}

const PROOF_JSON = JSON.parse(fs.readFileSync(`./demo/demoProofs/member_${randomIntFromInterval(1,6)}_proof.json`))
const VALID_PROOF = [PROOF_JSON.proof.a, PROOF_JSON.proof.b, PROOF_JSON.proof.c]

const CID_EXAMPLE = 'f01701220c3c4733ec8affd06cf9e9ff50ffc6bcd2ec85a6170004bb709669c31de94391a'

const INVALID_PROOF_JSON = JSON.parse(fs.readFileSync("./demo/demoProofs/invalid_proof.json"))
const INVALID_PROOF = [INVALID_PROOF_JSON.proof.a, INVALID_PROOF_JSON.proof.b, INVALID_PROOF_JSON.proof.c]

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

    before (async function() {
        
        DemoPool = await ethers.getContractFactory("DemoPool");
        
        demoPool = await DemoPool.deploy();
        
        await demoPool.deployed();
    });
        
    it("Has a total upload count of 0", async function () {
        expect(await demoPool.uploadCount()).to.equal(0);
    });
        
    describe("Broadcast data", async function() {

        it("Should revert if an invalid proof is submitted", async function () {
            await expect(demoPool.broadcastData(INVALID_PROOF, CID_EXAMPLE)).to.be.reverted;
        });

        it("Should upload an IPFS CID if a valid proof is submitted", async function () {
            await demoPool.broadcastData(VALID_PROOF, CID_EXAMPLE);
            expect(await demoPool.ipfsCIDs(0)).to.equal(CID_EXAMPLE);
        });

        it("Should revert if a valid but used proof is submitted", async function () {
            await expect(demoPool.broadcastData(VALID_PROOF, CID_EXAMPLE)).to.be.revertedWith(`Proof has already been used`)
        });
    })
});