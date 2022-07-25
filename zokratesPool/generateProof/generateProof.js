const fs = require("fs");
const { initialize } = require('zokrates-js')

/*

This file is used to mass-generate a set of proofs of pre-image for:
    + The initial verification pre-images sent to each email
    + Some 'mock' user secrets that would replace those sent to email

This is performed purely to see that Hardhat is functioning correctly - and takes a long time using Zokrates-JS.

*/

function writeFile(data, _fileName) {
    fs.writeFile(_fileName, data, function(err) {
        if (err) return console.log(err)
    })
}

async function generateProofOfPreImage(preImage, decHashDigest, provingKeyPath, proofName) {
    const zokratesProvider = await initialize()
    const source = fs.readFileSync("../setupPool/verifyPreImage.zok").toString();

    console.log("compilation")
    const artifacts = zokratesProvider.compile(source)

    const provingKey = fs.readFileSync(provingKeyPath)

    console.log("computation")
    const { witness, output } = zokratesProvider.computeWitness(artifacts, [
        preImage[0], 
        preImage[1], 
        preImage[2], 
        preImage[3],
        decHashDigest[0],
        decHashDigest[1]
    ])

    console.log("generate proof")
    const proof = zokratesProvider.generateProof(artifacts.program, witness, provingKey)

    writeFile(JSON.stringify(proof, null, 2), proofName)
}   

async function generateTestMemberProof(memberId, privateJson, publicJson, proofSuffix) {
    /* 
    This function is used only for testing proof generation with one of the 
    randomly generated passwords.
    */ 

    preImage = privateJson[memberId].preImage
    decHashDigest = publicJson[memberId].decHash

    const provingKeyPath = "../../demo/proving.key"
    const proofName = `../../demo/demoProofs/${memberId}${proofSuffix}Proof.json`

    generateProofOfPreImage(preImage, decHashDigest, provingKeyPath, proofName);
}

async function generateAllTestProofs() {
    for (let id=1; id <= 3; id++) {
        await generateTestMemberProof(`member${id}`, JSON.parse(fs.readFileSync("../../demo/demoPasswords/privateVerificationDetails.json")), JSON.parse(fs.readFileSync("../../demo/demoPasswords/publicVerificationDetails.json")), 'Verification')
    }
    
    for (let id=1; id <= 3; id++) {
        await generateTestMemberProof(`member${id}`, JSON.parse(fs.readFileSync("../../demo/demoPasswords/privateNewDetails.json")), JSON.parse(fs.readFileSync("../../demo/demoPasswords/publicNewDetails.json")), 'Verification')
    }
}

generateAllTestProofs()