const fs = require("fs");
const { initialize } = require('zokrates-js')
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

/*

    ISSUES:
        - Saving proving.key doesn't seem to work in this way
    
    WORKAROUND:
        - Use terminal commands:
            + zokrates compile -i Pool.zok
            + zokrates setup
            + zokrates export-verifier

*/ 

async function compile(filename) {
    const {stdout, stderr } = await exec(`zokrates compile -i ${filename}`);
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
}

async function trustedSetup() {
    const {stdout, stderr } = await exec('zokrates setup');
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
}

function writeFile(data, _fileName) {
    fs.writeFileSync(_fileName, data, function(err) {
        if (err) return console.log(err);
    });
}

async function setupPool(zokratesPath) {

    await compile(zokratesPath);
    
    await trustedSetup(); // Running terminal commands instead of zokrates-js 

    const zokratesProvider = await initialize();

    const verificationKey = JSON.parse(fs.readFileSync("./verification.key"));

    const verifier = zokratesProvider.exportSolidityVerifier(verificationKey)

    let license = '// SPDX-License-Identifier: GPL-3.0'

    verifierWithLicense = [license, verifier.toString()].join("\r\n")

    writeFile(verifierWithLicense, '../../contracts/Verifier.sol')
}

setupPool('./Pool.zok')