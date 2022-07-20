const fs = require("fs");
const { initialize } = require('zokrates-js')

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

async function generateTestMemberProof(memberId) {
    /* 
    This function is used only for testing proof generation with one of the 
    randomly generated passwords.
    */ 

    members = JSON.parse(fs.readFileSync("../setupPasswords/memberPasswords.json"))
    preImage = members[memberId].preImage
    decHashDigest = members[memberId].decHash
    const provingKeyPath = "../setupPool/proving.key"
    const proofName = `../../demo/demoProofs/${memberId}Proof.json`

    generateProofOfPreImage(preImage, decHashDigest, provingKeyPath, proofName);
}

async function generatePoolPasswordProof() {
    poolPassword = JSON.parse(fs.readFileSync("../setupPasswords/poolPassword.json"))
    preImage = poolPassword["preImage"]
    decHashDigest = poolPassword["decHash"]
    const provingKeyPath = "../setupPool/proving.key"
    const proofName = '../../demo/demoProofs/poolPasswordProof.json'

    generateProofOfPreImage(preImage, decHashDigest, provingKeyPath, proofName)
}

async function generateAllTestProofs() {
    // Using zokrates.js this function can take longer than 10 minutes
    for (let id=1; id <= 3; id++) {
        await generateTestMemberProof(`member${id}`)
    }
    generatePoolPasswordProof()
}

generateAllTestProofs()
