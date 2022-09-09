const { ethers } = require("ethers");
const poolFactoryABI = require("./PoolFactory.json");
const {generatePasswords } = require("./generatePasswords");
const {estimateGasCreatePool} = require("./estimateGas")
const AWS = require('aws-sdk');
AWS.config.region = 'eu-west-2';
const lambda = new AWS.Lambda();

exports.handler = async (event) => {

    const poolFactoryAddress = "0xb48996e69c4E8e454bc1EcD050bA8475500cd96e";
    const provider = new ethers.getDefaultProvider("kovan")
    const signer = new ethers.Wallet(privateKey, provider)
    const contract = new ethers.Contract(poolFactoryAddress, poolFactoryABI, signer);

    const members = {}
    const verificationHashDigests = []
    const emails = []

    try {
        const idCount = parseInt(event["queryStringParameters"]["idCount"])
        const poolName = event["queryStringParameters"]["poolName"]
        const broadcastThreshold = parseInt(event["queryStringParameters"]["broadcastThreshold"])
        
        for (let i=0; i < idCount; i++) {
            members[i] = {
                email: event["queryStringParameters"][`m${i}`]
            }
        }

        filterByName = contract.filters.PoolRequest(poolName, null);
        let pastEvent = await contract.queryFilter(filterByName);

        eventInfo = {
            "hashName": pastEvent[0].args[0].hash,
            "from": pastEvent[0].args[1],
            "idCount": pastEvent[0].args[2],
            "feePaid": pastEvent[0].args[3]
        };

        // const nMembers = Object.keys(members).length

        const passwordDict = generatePasswords(members)
    
        for (id in members) {
            emails.push(passwordDict[id].email)
            verificationHashDigests.push([passwordDict[id].hexHash[0], passwordDict[id].hexHash[1]])
        }
    
        gasEstimation = await estimateGasCreatePool(
            provider,
            contract,
            poolName,
            emails,
            verificationHashDigests,
            broadcastThreshold
        )

        function sleep(ms) {
            return new Promise((resolve) => {
                setTimeout(resolve, ms);
            });
        }
        
        if (eventInfo.feePaid > await gasEstimation*1.25) {
            await contract.createPool(
                poolName,
                emails,
                verificationHashDigests,
                broadcastThreshold
            )

            const emailsSent = [];

            for (let id in passwordDict) {

                const params = {
                    FunctionName: 'sendEmail',
                    InvocationType: 'Event',
                    LogType: 'Tail',
                    Payload: JSON.stringify({"recipient":passwordDict[id].email, "preImage": JSON.stringify(passwordDict[id].preImage), "poolName": poolName, "memberNumber":id})
                };
               
                await lambda.invoke(params, (err, data) => {
                    if (err) {
                      context.fail(err);
                    } else {
                      context.succeed('Send Email Said ' + data.Payload);
                      emailsSent.push(passwordDict[id].email)
                    }
                })
            };

            await sleep(idCount*500)
              
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Headers" : "Content-Type",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                body: JSON.stringify(emailsSent),
            }
        }
    } catch(e) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify(e),
        }
    }
}

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

/*
Example:
idCount=2&poolName="testCreate"&broadcastThreshold=1&m0="as17163@bristol.ac.uk"&m1="alexanderstraw01@hotmail.co.uk"
*/
