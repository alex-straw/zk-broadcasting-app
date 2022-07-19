const fs = require("fs");
const { initialize } = require('zokrates-js')

function writeFile(data, _fileName) {
    fs.writeFile(_fileName, data, function(err) {
        if (err) return console.log(err);
    });
}

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

const preImage = [
    '0',
    '0',
    '7658590220440404420676469324975209807',
    '14820030811989383835308128961039148672'
]

const provingKeyPath = '../SetupPool/proving.key'

const proofFilePath = 'testProof.json'

generatePoolMemberProof(preImage, provingKeyPath, proofFilePath);
  