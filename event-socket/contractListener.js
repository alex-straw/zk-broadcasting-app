const { ethers } = require("hardhat");
const poolFactoryABI = require("./abis/PoolFactory.json");

async function main() {
    const poolFactoryAddress = "0xBb5Cc0f2a206BF42c1cbE6Bb32A1d2ED6352feDF";
    const provider = new ethers.providers.WebSocketProvider(process.env.KOVAN_API_KEY);
    const contract = new ethers.Contract(poolFactoryAddress, poolFactoryABI, provider);

    /*
        event PoolRequest(
        string indexed _poolName,
        address indexed _from,
        uint _idCount,
        uint _feePaid

    */

    contract.on("PoolRequest", (_poolname, _from, _idCount, _feePaid) => {
        let info = {
            'poolname': _poolname,
            'from': _from,
            'idCount': _idCount,
            'feePaid': ethers.utils.formatUnits(_feePaid, 18),
        }
        console.log(JSON.stringify(info, null, 4))
    });
}

main();
