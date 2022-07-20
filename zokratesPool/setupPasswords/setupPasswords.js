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

function formatBytes32Hash(hashDigest) {

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
    })
}

function generateHashPassword() {
    preImage = generatePreImage()
    preImageSetupInput = formatHexToBigNumber(formatBytes32Hash(preImage))
    preImageFormatted = ["0", "0", preImageSetupInput[0], preImageSetupInput[1]]
    hashDigestHexFormatted = formatBytes32Hash(sha256Hash(preImageFormatted))
    hashDigestDecFormatted = formatHexToBigNumber(hashDigestHexFormatted)
    const password = {
        'preImage' : preImageFormatted,
        'hexHash' : hashDigestHexFormatted,
        'decHash' : hashDigestDecFormatted
    }

    return password;
}

function setupMemberPasswords(membersSetup) {
    for (member in membersSetup) {
        password = generateHashPassword();
        membersSetup[member].preImage = password.preImage
        membersSetup[member].hexHash = password.hexHash
        membersSetup[member].decHash = password.decHash
    }
    let membersSetupJson = JSON.stringify(membersSetup)
    saveFile("./memberPasswords.json", membersSetupJson)
}

function setupPoolPassword() {
    let poolPassword = JSON.stringify(generateHashPassword())
    saveFile("./poolPassword.json", poolPassword)
}

setupMemberPasswords(JSON.parse(fs.readFileSync("./poolEmails.json")))
setupPoolPassword()
