const { ethers } = require("ethers");

async function estimateGasCreatePool(
    provider,
    contract,
    name,
    emails,
    VerificationHashDigests,
    broadcastThreshold
) {
    gasPrice = await provider.getGasPrice()

    const gasEstimation = await contract.estimateGas.createPool(
        name,
        emails,
        VerificationHashDigests,
        broadcastThreshold
    )

    createPoolCost = gasPrice * gasEstimation

    return createPoolCost
}

module.exports = {
    estimateGasCreatePool: estimateGasCreatePool,
};