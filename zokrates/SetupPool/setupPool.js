const fs = require("fs");
const { initialize } = require('zokrates-js')

/*

    ISSUES:
        - Saving proving.key doesn't seem to work in this way
    
    WORKAROUND:
        - Use terminal commands:
            + zokrates compile -i Pool.zok
            + zokrates setup
            + zokrates export-verifier
            
*/ 

function writeFile(data, _fileName) {
    fs.writeFileSync(_fileName, data, function(err) {
        if (err) return console.log(err);
    });
}

async function setupPool(zokratesPath) {
    const zokratesProvider = await initialize();
    const source = fs.readFileSync(zokratesPath).toString();
    const artifacts = zokratesProvider.compile(source);
    const keypair = zokratesProvider.setup(artifacts.program);
    const verifier = zokratesProvider.exportSolidityVerifier(keypair.vk)

    writeFile(verifier.toString(), '../../contracts/Verifier.sol')
    writeFile(keypair.pk, './proving.key')
}

setupPool('../Pool.zok')