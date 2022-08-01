const { ethers } = require("hardhat");
const poolFactoryABI = require("./PoolFactory.json");
const {generatePasswords } = require("./generatePasswords");

/*
    event PoolRequest(
    string indexed _poolName,
    address indexed _from,
    uint _idCount,
    uint _feePaid
*/

/*
    function createPool(
    string memory _poolName,
    string[] memory _emails,
    uint256[2][] memory _verificationHashDigests,
    uint _broadcastThreshold
*/

async function main(event) {
    const poolFactoryAddress = "0x4Cd7249632Df70A27324bd69725727a96Fc47729";
    const provider = new ethers.getDefaultProvider("kovan")
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    const contract = new ethers.Contract(poolFactoryAddress, poolFactoryABI, signer);

    try {
        filterByName = contract.filters.PoolRequest(event["poolName"], null);
        let pastEvent = await contract.queryFilter(filterByName);

        eventInfo = {
            "hashName": pastEvent[0].args[0].hash,
            "from": pastEvent[0].args[1],
            "idCount": pastEvent[0].args[2],
            "feePaid": pastEvent[0].args[3]
        };
    } catch(e) {
        console.log(e.reason)
        return false
    }
    
    event["members"] = generatePasswords(event["members"])

    emails = []
    nMembers = Object.keys(event["members"]).length
    verificationHashDigests = []

    for (id in event["members"]) {
        emails.push(event["members"][id].email)
        verificationHashDigests.push([event["members"][id].hexHash[0], event["members"][id].hexHash[0]])
    }

    emails = Array.from(JSON.stringify(emails))

    try {
        const gasEstimation = await contract.estimateGas.createPool(
            event["poolName"],
            emails,
            verificationHashDigests,
            event["broadcastThreshold"]
        )
    
        gasPrice = await provider.getGasPrice()
        createPoolCost = gasPrice * gasEstimation

        if (eventInfo.feePaid > await createPoolCost*1.5) {
            await contract.createPool(
                event["poolName"],
                emails,
                verificationHashDigests,
                event["broadcastThreshold"]
            )
            return true
        } else {
            await signer.sendTransaction({
                to: eventInfo["from"],
                value: ethers.utils.parseEther(eventInfo["feePaid"]) // 1 ether
              })
            return false
        }

    } catch(e) {
        console.log(e.reason)
        return false
    }
}


/*
============= Example Input =============
*/

const event = {
    "members": {
        0: {"email": "a@b.bristol.ac.uk"},
        1: {"email": "a@b.bristol.ac.uk"},
        2: {"email": "a@b.bristol.ac.uk"},
    },
    "poolName":"name234567",
    "broadcastThreshold": 2,
}

main(event);
