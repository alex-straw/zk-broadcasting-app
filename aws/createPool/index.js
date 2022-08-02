const { ethers } = require("ethers");
const poolFactoryABI = require("./PoolFactory.json");
const {generatePasswords } = require("./generatePasswords");
const {estimateGasCreatePool} = require("./estimateGas")

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

exports.handler = async (event) => {
    const poolFactoryAddress = "0x4Cd7249632Df70A27324bd69725727a96Fc47729";
    const provider = new ethers.getDefaultProvider("kovan")
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    const contract = new ethers.Contract(poolFactoryAddress, poolFactoryABI, signer);


    const AWS = require('aws-sdk');
    AWS.config.region = 'eu-west-2';
    const lambda = new AWS.Lambda();

    try {
        filterByName = contract.filters.PoolRequest(event["poolName"], null);
        let pastEvent = await contract.queryFilter(filterByName);

        eventInfo = {
            "hashName": pastEvent[0].args[0].hash,
            "from": pastEvent[0].args[1],
            "idCount": pastEvent[0].args[2],
            "feePaid": pastEvent[0].args[3]
        };

        event["members"] = generatePasswords(event["members"])

        emails = []
        verificationHashDigests = []
    
        for (id in event["members"]) {
            emails.push(event["members"][id].email)
            verificationHashDigests.push([event["members"][id].hexHash[0], event["members"][id].hexHash[0]])
        }
    
        gasEstimation = estimateGasCreatePool(
            provider,
            contract,
            event["poolName"],
            emails,
            verificationHashDigests,
            event["broadcastThreshold"]
        )
        
        console.log({"gasEstimation": await gasEstimation})

        if (eventInfo.feePaid > await gasEstimation*1.5) {
            await contract.createPool(
                event["poolName"],
                emails,
                verificationHashDigests,
                event["broadcastThreshold"]
            )
        
            for (id in event["members"]) {
                const params = {
                    FunctionName: 'sendEmail',
                    InvocationType: 'RequestResponse',
                    LogType: 'Tail',
                    Payload: JSON.stringify({"recipient":event["members"][id].email, "preImage": JSON.stringify(event["members"][id].preImage)})
                  };


                lambda.invoke(params, (err) => {
                    if (err) {
                      console.log(err)
                    } else {
                      console.log('Sent');
                    }
                  })
            };
        }
    } catch(e) {
        console.log(e.reason)
        return {status: false,}
    }
}