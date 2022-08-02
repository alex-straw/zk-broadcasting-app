const { ethers } = require("hardhat");
const poolFactoryABI = require("./PoolFactory.json");
const {estimateGasCreatePool} = require("./estimateGas")

/*
    function createPool(
    string memory _poolName,
    string[] memory _emails,
    uint256[2][] memory _verificationHashDigests,
    uint _broadcastThreshold
*/


/*
============= Example Input =============

const event = {
    "idCount" : 10
}

*/

exports.handler = async function(event) {
    const poolFactoryAddress = "0x4Cd7249632Df70A27324bd69725727a96Fc47729";
    const provider = new ethers.getDefaultProvider("kovan")
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    const contract = new ethers.Contract(poolFactoryAddress, poolFactoryABI, signer);

    try {
        const feeMultiplier = 2
        const fakePoolName = "pendingGasEstimator"
        const fakeEmail = "test@bristol.ac.uk"
        const fakeBroadcastThreshold = event["idCount"]
        const fakeHashDigest = [
            "0x00000000000000000000000000000000dded44937bd31c82e6c4d980b6a65171",
            "0x0000000000000000000000000000000030e5f72b782741da5f7213f1203dec49"
        ]
        
        const fakeEmails = []
        const fakeVerificationHashDigests = []

        for(let i = 0; i < event["idCount"]; i++) {
            fakeEmails.push(fakeEmail)
            fakeVerificationHashDigests.push(fakeHashDigest)
        }

        gasEstimation = await estimateGasCreatePool(
            provider,
            contract,
            fakePoolName,
            fakeEmails,
            fakeVerificationHashDigests,
            fakeBroadcastThreshold
        )

        return gasEstimation * feeMultiplier
    } catch(e) {
        console.log(e.reason)
        return false
    }
}