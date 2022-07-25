const fs = require("fs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

function getJson(_filepath) {
    return JSON.parse(fs.readFileSync(_filepath))
}

function getProof(filePath) {
    PROOF_JSON = getJson(filePath)
    return [PROOF_JSON.proof.a, PROOF_JSON.proof.b, PROOF_JSON.proof.c]
}

function getEmails(publicVerificationDetails) {
    const emails = []
    for (member in publicVerificationDetails) {
        emails.push(publicVerificationDetails[member].email)
    }
    return emails
}

function getHashDigests(publicVerificationDetails) {
    const hashDigests = []
    for (member in publicVerificationDetails) {
        hashDigests.push(publicVerificationDetails[member].hexHash)
    }
    return hashDigests
}

/*
    POOL SETUP - ALL PUBLIC INFORMATION
*/

const publicVerificationDetails = getJson('demo/demoPasswords/publicVerificationDetails.json')
const publicNewDetails = getJson('demo/demoPasswords/publicNewDetails.json')

const emails = getEmails(publicVerificationDetails)
const verificationHashDigests = getHashDigests(publicVerificationDetails)

/*
    PRIVATE INFORMATION - VALID PROOFS GENERATED USING PROVING.KEY AND PRE-IMAGES
*/

const CID_EXAMPLE = 'f01701220c3c4733ec8affd06cf9e9ff50ffc6bcd2ec85a6170004bb709669c31de94391a'

const member1VerificationProof = getProof('demo/demoProofs/member1VerificationProof.json')
const member2VerificationProof = getProof('demo/demoProofs/member2VerificationProof.json')
const member3VerificationProof = getProof('demo/demoProofs/member3VerificationProof.json')

const member1NewProof = getProof('demo/demoProofs/member1NewProof.json')
const member2NewProof = getProof('demo/demoProofs/member2VerificationProof.json')
const member3NewProof = getProof('demo/demoProofs/member3VerificationProof.json')

const invalidProof = getProof('demo/demoProofs/invalidProof.json')

const testPoolName = "testPool"
const broadcastThreshold = 3;

async function attachPool(_poolAddress) {
    Pool = await ethers.getContractFactory("Pool");
    pool = await Pool.attach(_poolAddress);
    return pool;
}

describe("PoolFactory.sol Deployment", function () {

    before(async function () {
        [owner, member1, member2] = await ethers.getSigners();
        PoolFactory = await ethers.getContractFactory("PoolFactory");
        poolFactory = await PoolFactory.deploy();
        await poolFactory.deployed();
    });

    it("Has correctly set the owner of the PoolFactory contract", async function () {
        expect(await poolFactory.owner()).to.equal(owner.address);
    });

    it("Reverts if createPool is called by an EOA that is not the owner, with valid inputs", async function () {
        await expect(poolFactory.connect(member1).createPool("Failure", emails, verificationHashDigests, broadcastThreshold)).to.be.revertedWith("Only the owner can call this function")
    });

    describe("Create pool", function () {

        /*
        string memory _poolName,
        string[] memory _emails,
        uint256[2][] memory _verificationHashDigests,
        uint _broadcastThreshold
        */

        before(async function () {
            await poolFactory.connect(owner).createPool(testPoolName, emails, verificationHashDigests, broadcastThreshold);
            testPool = await attachPool(poolFactory.getPoolAddress(testPoolName));
        });

        it("Has a 3 demo members", async function () {
            expect(await testPool.idCount()).to.equal(3);
        });

        it("Has no verified identities", async function () {
            expect(await testPool.verifiedIdCount()).to.equal(0);
        })

        it("Has incremented the 'poolCount' variable", async function () {
            expect(await poolFactory.poolCount()).to.equal(1);
        });

        it("Reverts if a pool with the same name (as another pool) is launched", async function () {
            await expect(poolFactory.connect(owner).createPool(testPoolName, emails, verificationHashDigests, broadcastThreshold)).to.be.reverted;
            expect(await poolFactory.poolCount()).to.equal(1);
        })

        describe("Identity verification", async function () {

            const member1NewPassword = publicNewDetails["member1"].hexHash

            it("Should revert if an invalid proof is submitted", async function () {
                await expect(testPool.verifyId(0, invalidProof, member1NewPassword)).to.be.reverted;
            });

            it("Should revert if a valid proof is submitted but with the wrong member number", async function () {
                await expect(testPool.verifyId(0, member2VerificationProof, member1NewPassword)).to.be.reverted;
            });

            it("Should succeed if a valid proof is submitted with its associated member number", async function () {
                await testPool.verifyId(0, member1VerificationProof, member1NewPassword);

                expect(await testPool.verifiedIdCount()).to.equal(1);
            });

            it("Should revert if a valid proof is submitted for an already verified email", async function () {
                await expect(testPool.verifyId(0, member1VerificationProof, member1NewPassword)).to.be.revertedWith("Email has already been verified");
            })

        })

        // describe("Broadcast data", async function () {

        //     before(async function () {
        //         // Verify the other two members' email addresses
        //         await testPool.verifyId(emails[1], member2VerificationProof);
        //         await testPool.verifyId(emails[2], member3VerificationProof);
        //     });

        //     it("Should upload an IPFS CID if a valid proof is submitted and all addresses are verified", async function () {
        //         await testPool.broadcastData(poolPasswordProof, CID_EXAMPLE);
        //         expect(await testPool.ipfsCIDs(0)).to.equal(CID_EXAMPLE);
        //     });

        //     it("Should revert if an already used proof is submitted (and all addresses are verified)", async function () {
        //         await expect(testPool.broadcastData(poolPasswordProof, CID_EXAMPLE)).to.be.reverted;
        //     });
        // });
    });
});
