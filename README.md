# Overview: zk-broadcasting-app

This repository is for the MVP stage of my dissertation project.

## Pool.zok

Zokrates code - a high level language for writing zk-SNARKs. This will check that an EOA has a valid proof of pre-image for one hash-digest within the pool. This is compiled to 'Verifier.sol'.

## Pool.sol

(Initially this will be deployed on its own, in future a PoolFactory contract will be used)

The 'Pool.sol' contract will have an associated zk-Proof contract specific to that deployment (Verifier.sol). This cannot be changed and therefore when the pool contract is launched, all associated IDs must be included. In future governance could be used to upgrade the verifier contract when members join and leave.

All email addresses and their associated hash-passwords are checked before launching the contract. Because Verifier.sol handles verification, no email addresses or hash-passwords need to be stored.

This contract keeps track of used proofs (hashed version) to prevent valid proofs from being used again (as these are public on the blockchain).

There is a risk of front-running - and therefore future upgrades will use flashbots to mitigate this.

## Deployment - JavaScript

Create 3 IDS:

1. email: a@bristol.ac.uk, preImage = [0, 0, 0 5]
2. email: b@bristol.ac.uk, preImage = [0, 0, 0 6]
3. email: c@bbristol.ac.uk, preImage = [0, 0, 0 7]

Initially this will assume that IDS have been distributed (with more secure preImages) and that these are verified (by accessing the associated email).

### GeneratePoolProofCode.js

This will take as input a set of hashed passwords, and generate the .zok code for the pool.

### InitialisePool.js

This will be perform the trusted-setup for the zk-SNARK - which in future will be done by the server. All toxic waste should be deleted immediately. 

This gets the keys necessary for users to generate proofs (client side).

### DeployPool.js

This will deploy the 'Pool.sol' contract (and the associated 'Verifier.sol' contract).