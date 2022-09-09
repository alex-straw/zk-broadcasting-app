const { ethers } = require("ethers");
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

exports.handler = async (event) => {
    const poolFactoryAddress = "0xb48996e69c4E8e454bc1EcD050bA8475500cd96e";
    const provider = new ethers.getDefaultProvider("kovan")
    const signer = new ethers.Wallet(privateKey, provider)
    const contract = new ethers.Contract(poolFactoryAddress, poolFactoryABI, signer);

    try {
        const feeMultiplier = 2
        const fakePoolName = "pendingGasEstimator"
        const fakeEmail = "test@bristol.ac.uk"
        const fakeBroadcastThreshold = parseInt(event["queryStringParameters"]["idCount"])
        const fakeHashDigest = [
            "0x00000000000000000000000000000000dded44937bd31c82e6c4d980b6a65171",
            "0x0000000000000000000000000000000030e5f72b782741da5f7213f1203dec49"
        ]
        
        const fakeEmails = []
        const fakeVerificationHashDigests = []

        for(let i = 0; i < fakeBroadcastThreshold; i++) {
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

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({'gasCostEther': gasEstimation * feeMultiplier}),
        }
     } catch(e) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify(e.reason),
        }
    }
}
