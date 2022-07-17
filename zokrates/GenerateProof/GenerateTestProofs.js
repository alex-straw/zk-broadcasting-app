const fs = require("fs");
const { initialize } = require('zokrates-js')
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);


// Used to generate a number of proofs in the same way that a user would - for testing purposes

async function generateAllProofs(members, provingKeyPath) {
    // Only for testing - this will take some time ~ 10+ minutes
    for (member in members) {
        let proofFilePath = `${member}_proof.json`
        console.log(proofFilePath)
        await generatePoolMemberProof(members[member].preImage, provingKeyPath, proofFilePath)
    }
}

function writeFile(data, _fileName) {
    fs.writeFileSync(_fileName, data, function(err) {
        if (err) return console.log(err);
    });
}

// Copy and pasted from GenerateProof.js --> delete after changing project to module (and fixing imports)
async function generatePoolMemberProof(preImage, provingKeyPath, proofFilePath) {
    const zokratesProvider = await initialize();
    const source = fs.readFileSync("../SetupPool/Pool.zok").toString();
    console.log("compilation")
    const artifacts = zokratesProvider.compile(source);
    const provingKey = fs.readFileSync(provingKeyPath);

    console.log("computation")
    const { witness, output } = zokratesProvider.computeWitness(artifacts, [
        preImage[0], 
        preImage[1], 
        preImage[2], 
        preImage[3]
    ]);

    console.log("generate proof")
    const proof = zokratesProvider.generateProof(artifacts.program, witness, provingKey);

    writeFile(JSON.stringify(proof, null, 2), proofFilePath);
}

members = JSON.parse(fs.readFileSync("../SetupMembers/Members.json"))
const provingKeyPath = "../SetupPool/proving.key"
generateAllProofs(members, provingKeyPath)

// generatePoolMemberProof(members["member_1"].preImage, '../SetupPool/proving.key', 'testProof.json')

