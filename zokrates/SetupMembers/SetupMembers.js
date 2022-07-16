var fs = require('fs')
const { ethers } = require("ethers");

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

function saveFile(path, content) {
    fs.writeFile(path, content, err => {
        if (err) {
            console.error(err);
        }
        // file written successfully
    })
}

function setupMembers(_membersSetup) {
    for (member in _membersSetup) {
        memberPreImage = (membersSetup[member].preImage)
        membersSetup[member].proofInput = formatHashDigest(sha256Hash(memberPreImage))
    }
    let membersSetupJson = JSON.stringify(membersSetup)
    saveFile("../Members.json", membersSetupJson)
}

const membersSetup = JSON.parse(fs.readFileSync("./MembersSetup.json"));

setupMembers(membersSetup);