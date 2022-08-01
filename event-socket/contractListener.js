const { ethers } = require("hardhat");
const poolFactoryABI = require("./abis/PoolFactory.json");

async function main(_poolname) {
    const poolFactoryAddress = "0x4Cd7249632Df70A27324bd69725727a96Fc47729";
    const provider = new ethers.getDefaultProvider("kovan")
    const contract = new ethers.Contract(poolFactoryAddress, poolFactoryABI, provider);

    /*
        event PoolRequest(
        string indexed _poolName,
        address indexed _from,
        uint _idCount,
        uint _feePaid
    */

    filterByName = contract.filters.PoolRequest(_poolname, null);

    // events = await contract.queryFilter(filterName);

    let pastEvent = await contract.queryFilter(filterByName);

    info = {
        'hashName': pastEvent[0].args[0].hash,
        'from': pastEvent[0].args[1],
        'idCount': pastEvent[0].args[2],
        'feePaid': pastEvent[0].args[3]
    };

    console.log(info)
    
    gasPrice = await provider.getGasPrice()

    console.log(gasPrice)
    return
}

main("name");
