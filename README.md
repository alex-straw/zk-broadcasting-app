# Overview: zk-broadcasting-app

This repository is for the MVP stage of my dissertation project.

Semi-Anonymous broadcasting in pools of known identities. Applications include:
+ A pool of university staff at many UK universities, who can organise large-scale strikes without exposing the leader of the union. 
+ A pool of X bank employees who can whistle-blow unethical business practices within their organisation or industry. 
+ A pool of 1000 trustworthy journalists who can release information that may otherwise pose a threat to their safety.

Pools of known identities are verified using zero-knowledge proofs (zk-SNARKs). The zk-SNARK checks that an EOA has a valid pre-image for a particular hash digest, without revealing the pre-image itself. Pre-images are generated server-side and sent to the associated email addresses. 
First, every user must verify their identity (email) by using the pre-image sent to their email address. Each proof must match up with their email's respective hash digest, which is stored publicly on-chain. 

Once all the email addresses have been verified, the pool becomes operational. To remain anonymous, users must submit proof demonstrating that they have the pre-image for the pool's public hash digest (password). Because this hash digest is the same for all members, any on-chain transactions will not reveal identities. It is recommended that users use new EOAs to submit proofs and not the ones used to verify their email addresses (further work could blacklist these EOS for user protection).

The user can publish the content identifier (CID) for a particular file uploaded to IPFS (a distributed file system) if valid proof is submitted. Each proof is different, and a hash of each (valid) submitted proof is stored to prevent it from being used twice. Otherwise, anyone could find a valid proof from a site like Etherscan to infiltrate the pool and post content.


## To Run:

```
npm install
```

+ Ensure Zokrates is installed (make sure to export path):

```
curl -LSfs get.zokrat.es | sh
```
+ Generate passwords
+ Perform trusted setup for zk-SNARK

```
node zokratesPool/setupPasswords/setupPasswords.js
node zokratesPool/setupPool/setupPool.js
```

### To add:

1. Send emails - host this app on an EC2 with high security
2. Automate deployment
3. Build a website


## Demo (hardhat test)

+ Run:
```
npx hardhat test
```
This uses a fake set of 3 members, with their hash digests and 3 valid proofs. These can only be used once.

