# Overview: zk-broadcasting-app

This repository is for the MVP stage of my dissertation project.

Semi-Anonymous broadcasting in pools of known identities. Applications include:
+ A pool of university staff at many UK universities, who can organise large-scale strikes without exposing the leader of the union. 
+ A pool of X bank employees who can whistle-blow unethical business practices within their organisation or industry. 
+ A pool of 1000 trustworthy journalists who can release information that may otherwise pose a threat to their safety.

Pools of known identities are verified using zero-knowledge proofs (zk-SNARKs). The zk-SNARK checks that an EOA has a valid pre-image for a particular hash digest, without revealing the pre-image itself. 

Prototype:

A list of 'n' email addresses will be submitted by a pseudonymous EOA. This will trigger an AWS event (Event Bridge) to run a Lambda function which will generate 'n' 32-byte pre-images. Each submitted email will receive one of these pre-images, whilst simultaneously the sha3-256 hash of each will be stored on the pool contract. Each email must verify that they have the pre-image for the on-chain hash, whilst also submitting a new hashed password (with pre-image generated locally) to replace the one sent by the trusted AWS server. This is done to de-risk email hacks. In doing this, pseudonymous EOAs verify that they have access to one of the associated email accounts (without revealing which one). Once all the email addresses have been verified (or after a certain 'broadcastThreshold' has been exceeded), the pool becomes operational. 

To broadcast data, users must submit proof demonstrating that they have the pre-image for one of the new hashed secrets (new passwords set by verified users) and submit a corresponding IPFS CID hash (the broadcast). Because each hash digest has no associated email, on-chain transactions will not reveal specific identities. It is recommended that users use new EOAs with each transaction.

Each zk-SNARK has a trusted setup ceremony, which comes with risk if the user that performs this task does not delete the source of randomness (toxic waste) - this enables them to create fake but valid proofs. This is only conducted once when the poolFactory is deployed - and this zk-SNARK is used for all pools to verify knowledge of hash pre-images. In the future, multi-party-computation should be used to perform this ceremony, where only 1/n individual needs to be honest to prevent malicious actors from generating fake but valid proofs.

Each proof is different, and a hash of each (valid) submitted proof is stored to prevent it from being used twice. Otherwise, anyone could find a valid proof from a site like Etherscan to infiltrate the pool and post content.

## Current Prototype Deployment (Kovan)

Pool Factory Address: ` 0xBb5Cc0f2a206BF42c1cbE6Bb32A1d2ED6352feDF `

# Deploy Your Own PoolFactory

### Install Dependencies:

```
npm install
```

+ Ensure Zokrates is installed (make sure to export path):

```
curl -LSfs get.zokrat.es | sh
```

### .env

+ In the root directory
```
touch .env
```

+ Inside the .env file:
  + Add a set of API keys (Infura) for Rinkeby and Kovan
  + Add a private key for an Ethereum account (you will need some test Ether in this account to deploy)

```
RINKEBY_API_KEY = "https://rinkeby.infura.io/v3/********************************"
KOVAN_API_KEY = "https://kovan.infura.io/v3/********************************"
PRIVATE_KEY = "****************************************************************"
```

### Deploy to Kovan

```
npx hardhat run deploy/deploy.js
```

# Demo (hardhat test)

Ensure that you are in the root directory. This uses a fake set of 3 members. Each has a pre-generated proof for the server-set verification hash digest, and the 'random' client-side hash digest (new password).

+ Run Hardhat Tests

```
npx hardhat test
```

### Development (Misc)

+ Generate new random passwords (new proofs will need to be generated)

```
node zokratesPool/setupPasswords/setupPasswords.js
```

+ Perform trusted setup for the zk-SNARK
  + New proving key
  + Original verifier.sol will no longer work (as it is setup specific)
  + Demo proofs will not work

```
node zokratesPool/setupPool/setupPool.js
```

### To add:

1. AWS Backend
2. Automate deployment
3. Build a website
