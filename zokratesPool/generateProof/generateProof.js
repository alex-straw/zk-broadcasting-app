const fs = require("fs");
const { initialize } = require('zokrates-js')

function writeFile(data, _fileName) {
    fs.writeFile(_fileName, data, function(err) {
        if (err) return console.log(err)
    })
}

async function generateProofOfPreImage(preImage, hashDigest, provingKeyPath, proofName) {
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
        hashDigest[0],
        hashDigest[1]
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
    hashDigest = members[memberId].proofInputDec
    const provingKeyPath = "../setupPool/proving.key"
    const proofName = `${memberId}Proof.json`

    generateProofOfPreImage(preImage, hashDigest, provingKeyPath, proofName);
}

async function generatePoolPasswordProof() {
    poolPassword = JSON.parse(fs.readFileSync("../setupPasswords/memberPasswords.json"))
    preImage = poolPassword.preImage
    hashDigest = poolPassword.proofInputDec
    const provingKeyPath = "../setupPool/proving.key"
    const proofName = 'poolPasswordProof.json'

    generateProofOfPreImage(preImage, hashDigest, provingKeyPath, proofName)
}

async function generateAllTestProofs() {
    for (let id=1; i <= 3; i++) {
        await generateTestMemberProof(`member${id}`)
    }
    generatePoolPasswordProof()
}

generateAllTestProofs()