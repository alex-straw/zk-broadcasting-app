var fs = require('fs')
var filename = 'Pool.zok'

/*
This file is used to auto-generate zk-SNARK Zokrates files (.zok) which are compiled to
deployable smart contracts. This was done because of limitations with the .zok language.

Pool Smart Contract: 
    """
        1. Has a list of hashed passwords corresponding to the members of the pool
        2. Allows a user to demonstrate that they have the pre-image for one of these
           pooled identities, without exposing the pre-image or the associated ID.
    """
*/

const members = JSON.parse(fs.readFileSync("./Members.json"));

// Ensure that the file is empty before proceeding:
try {
    fs.unlinkSync(filename)
}
catch(err) {
    console.log("No file reset necessary")
}

var logger = fs.createWriteStream(filename, {
    flags: 'a' // 'a' preserves old data when appending
})

logger.write('import "hashes/sha256/512bitPacked" as sha256packed;' + "\r\n")

// Store the members' hashed passwords as Zokrates variables (global)

for (member in members) {
    logger.write("const field " + member + "_" + "h0" + " = " +     members[member].proofInput[0]    + ";" + "\r\n") 
    logger.write("const field " + member + "_" + "h1" + " = " +     members[member].proofInput[1]    + ";" + "\r\n") 

}

logger.write("\r\n" + "def main(private field a, private field b, private field c, private field d) {" + "\r\n")

logger.write("    field[2] hash_digest = sha256packed([a, b, c, d]);" + "\r\n")

logger.write("    field mut is_member = 0;" + "\r\n")


// Check pre-image against all hashes for members within the pool
for (member in members) {
    logger.write("    is_member = is_member + if(hash_digest[0] == " + member + "_" + "h0" + " && hash_digest[1] == " + member + "_" + "h1" + ") { 1 } else { 0 };" + "\r\n") 
}

// Ensure that 1 pre-image has a hash digest within the pool of hashed passwords
logger.write("    assert(is_member == 1);"+ "\r\n") 

logger.write("    return;" + "\r\n")

logger.write("}")