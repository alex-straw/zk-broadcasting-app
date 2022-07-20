const fs = require("fs");
const { expect } = require("chai");
const { assert } = require("console");

function getJson(_filepath) {
    return JSON.parse(fs.readFileSync(_filepath))
}

function getProof(filePath) {
    PROOF_JSON = getJson(filePath)
    return [PROOF_JSON.proof.a, PROOF_JSON.proof.b, PROOF_JSON.proof.c]
}

function getEmails(publicMemberDetails) {
    const emails = []
    for (member in publicMemberDetails) {
        emails.push(publicMemberDetails[member].email)
    }
    return emails
}

function getHashDigests(publicMemberDetails) {
    const hashDigests = []
    for (member in publicMemberDetails) {
        hashDigests.push(publicMemberDetails[member].hexHash)
    }
    return hashDigests
}

/*
    POOL SETUP - ALL PUBLIC INFORMATION
*/

const publicMemberDetails = getJson('demo/demoPasswords/publicMemberDetails.json')
const publicPoolPassword = getJson('demo/demoPasswords/publicPoolPassword.json')

const emails = getEmails(publicMemberDetails)
const memberHashDigests = getHashDigests(publicMemberDetails)
const poolHashDigest = publicPoolPassword.hexHash

/*
    PRIVATE INFORMATION - VALID PROOFS GENERATED USING PROVING.KEY AND PRE-IMAGES
*/

const CID_EXAMPLE = 'f01701220c3c4733ec8affd06cf9e9ff50ffc6bcd2ec85a6170004bb709669c31de94391a'

const member1Proof = getProof('demo/demoProofs/member1Proof.json')
const member2Proof = getProof('demo/demoProofs/member2Proof.json')
const member3Proof = getProof('demo/demoProofs/member3Proof.json')
const invalidProof = getProof('demo/demoProofs/invalidProof.json')
const poolPasswordProof = getProof('demo/demoProofs/poolPasswordProof.json')

describe("zk-broadcasting app setup (pool)", function () {

    before (async function() {
        
        DemoPool = await ethers.getContractFactory("DemoPool");
        demoPool = await DemoPool.deploy(emails, memberHashDigests, poolHashDigest);
        await demoPool.deployed();
    });
        
    it("Has a 3 demo members", async function () {
        expect(await demoPool.idCount()).to.equal(3);
    });

    it("Has no verified identities", async function () {
        expect(await demoPool.verifiedIdCount()).to.equal(0);
    })
        
    describe("Identity verification", async function() {

        it("Should revert if an invalid proof is submitted", async function () {
            await expect(demoPool.verifyId(emails[0], invalidProof)).to.be.reverted;
        });

        it("Should revert if a valid proof is submitted but with the wrong email", async function () {
            await expect(demoPool.verifyId(emails[0], member2Proof)).to.be.reverted;
        });

        it("Should succeed if a valid proof is submitted with its associated email", async function () {
            await demoPool.verifyId(emails[0], member1Proof);
            
            expect(await demoPool.verifiedIdCount()).to.equal(1);
        });

        it("Should revert if a valid proof is submitted for an already verified email", async function () {
            await expect(demoPool.verifyId(emails[0], member1Proof)).to.be.revertedWith("Email has already been verified");
        })

    })

    describe("Broadcast data", async function() {

        before (async function() {
            // Verify the other two members' email addresses
            await demoPool.verifyId(emails[1], member2Proof);
            await demoPool.verifyId(emails[2], member3Proof);
        });

        it("Should upload an IPFS CID if a valid proof is submitted and all addresses are verified", async function () {
            await demoPool.broadcastData(poolPasswordProof, CID_EXAMPLE);
            expect(await demoPool.ipfsCIDs(0)).to.equal(CID_EXAMPLE);
        });

        it("Should revert if an already used proof is submitted (and all addresses are verified)", async function () {
            await expect(demoPool.broadcastData(poolPasswordProof, CID_EXAMPLE)).to.be.reverted;
        });
    })
});