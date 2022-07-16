const fs = require("fs");
const { initialize } = require('zokrates-js')

function writeFile(data, _fileName) {
    fs.writeFile(_fileName, data, function(err) {
        if (err) return console.log(err);
    });
}

async function generatePoolMemberProof(preImage, filename) {
    const zokratesProvider = await initialize();
    const source = fs.readFileSync("../Pool.zok").toString();

    console.log("compilation")
    const artifacts = zokratesProvider.compile(source);

    // console.log("setup")
    // const keypair = zokratesProvider.setup(artifacts.program);

    const provingKey = fs.readFileSync("../SetupPool/proving.key");

    console.log("computation")
    const { witness, output } = zokratesProvider.computeWitness(artifacts, [
        preImage[0], 
        preImage[1], 
        preImage[2], 
        preImage[3]
    ]);

    console.log("generate proof")
    const proof = zokratesProvider.generateProof(artifacts.program, witness, provingKey);

    writeFile(JSON.stringify(proof, null, 2), filename);
}

const preImage = ["0", "0", "0", "5"]
const filename = "../TestProofMember_1.json"

generatePoolMemberProof(preImage, filename)