const fs = require('fs')
const { ethers } = require("ethers");
const crypto = require('crypto')

/*

This file takes as input a list of emails and pre-images (of suitable type for implementation with Zokrates) and generates hash digests.
This is saved to ../Members.json - which is necessary for setting up the zk-SNARK verifier contract.

*/

function generatePreImage() {
    // Will eventually be used to generate secure random preImages
    return crypto.randomBytes(32).toString("hex");
}

function sha256Hash(preImage) {
    return ethers.utils.soliditySha256(["int128", "int128", "int128", "int128"], [preImage[0], preImage[1], preImage[2], preImage[3]])
}

function addHexLetters(_str) {
    return "0x".concat(_str)
}

function padHex(_str, nBytes) {
    return ethers.utils.hexZeroPad(_str, nBytes)
}

function formatHashDigest(hashDigest) {

    hashLength = hashDigest.length;

    _h0pub = hashDigest.slice(2, (hashLength/2) + 1);
    _h1pub = hashDigest.slice((hashLength/2) + 1, hashLength);

    _h0pub = addHexLetters(_h0pub)
    _h1pub = addHexLetters(_h1pub)

    _h0pubPadded = padHex(_h0pub, 32)
    _h1pubPadded = padHex(_h1pub, 32)

    return [_h0pubPadded, _h1pubPadded]
}

function formatHexToBigNumber(_formattedHexHashArray) {
    return [ethers.BigNumber.from(_formattedHexHashArray[0]).toString(), ethers.BigNumber.from(_formattedHexHashArray[1]).toString()]
}


function saveFile(path, content) {
    fs.writeFile(path, content, err => {
        if (err) {
            console.error(err);
        }
        // file written successfully
    })
}

function setupTestMembers(membersSetup) {
    for (member in membersSetup) {
        // Generate a random 32 bytes hex string - performed server side
        // Format this into two 16 byte padded hex strings
        // Concatenate two empty values in 'a' and 'b' - to be of the form [a,b,c,d] - necessary for zokrates

        preImage = generatePreImage()
        proofInput = formatHashDigest(preImage)
        setupInput = formatHexToBigNumber(proofInput)
        membersSetup[member].preImage = preImage
        membersSetup[member].proofInput = proofInput
        membersSetup[member].setupInput = setupInput

        // In release preImages will not be stored They will be emailed to corresponding email addresses and deleted.
        // The proofInput and ProofSetup i.e., public hash digest information will be stored
    }
    let membersSetupJson = JSON.stringify(membersSetup)
    saveFile("./Members.json", membersSetupJson)
}

setupTestMembers(JSON.parse(fs.readFileSync("./MembersSetupRandom.json")))