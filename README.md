# Overview: zk-broadcasting-app

This repository is for the MVP stage of my dissertation project.

This code allows for the creation of trusted pools of known identities which are verified using zero-knowledge proofs (zk-SNARKs specifically). The zk-SNARK checks that a user has a valid pre-image for a particular hash digest, without revealing the pre-image itself. Pre-images are generated server-side and sent to the associated email addresses. For the pool to become operational, every user must verify their email using the pre-image sent to their account. In each case, it must match up with their email's respective hash digest which is stored publically on chain. 

Once all the email addresses have been verified, the pool becomes operational. To remain anonymous, users must submit a proof demonstrating that they have the pre-image for the pool's public hash digest (password). Because this hash digest is the same for all members, any on-chain transactions will not reveal identities. Furthermore, it is recommended that users use new EOAs to submit proofs and not the one used to verify their email address (further work could blacklist these EOS for user protection).

If a valid proof is subitted, the user is able to publish the content identifier (CID) for a particular file uploaded to IPFS (a distributed file system). Each proof is different, and a hash of each is stored to prevent any proof from being used twice. This is because all transactions are public, enabling a malicious actor to find valid proofs using sites like Etherscan.

## To Run:

+ Make sure to do:

npm install

+ Ensure Zokrates is installed (make sure to export path):

curl -LSfs get.zokrat.es | sh

node zokratesPool/setupPasswords/setupPasswords.js

node zokratesPool/setupPool/setupPool.js


### To add:

1. Send emails - host this app on an EC2 with high security
2. Automate Deployment
3. Build website


## Demo (hardhat test)

+ npx hardhat test

This uses a fake set of 3 members, with their own hash digests and 3 valid proofs. These can only be used once.
