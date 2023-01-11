# ChainWars Lootbox
## Pre-Initialization

Please create a `.mnemonic` file containing the 12-word mnemonic phrase to your BSC wallet

## Initialization

Please run `npm install`

# Compiling contracts

Please run `npm run build`

# Deploying contracts

Please run `npm run deploy`

# Running tests

Please run `npm run test`

# Using the contract:

0. first of all you’ll need to maintain some LINK tokens on the contract. each “random” request is 0.2 LINK as fee, which is being used from the contract. please read this: https://docs.chain.link/docs/vrf-contracts/#binance-smart-chain-mainnet
1. before “unwrapping” the “getRandomNumber” function should be called by the owner of the lootbox.
2. “getRandomNumber” function will emit an event: RandomnessInitiated with two arguments: sender and requestId
3. the caller should listen for the event RandomnessFulfilled with the given requestId and only after that the “unwrap” function could be called
4. The “unwrap” function accepts either 1 or 2 arguments. The first argument is the tokenId, which could be only 1 or 2 (the ID of the lootbox). The second argument is optional and is the quantity, meaning how many lootboxes the user wants to open at once.
5. Each lootbox will mint 4 random cards (basing on described rules)
6. As soon as “unwrap” succeed you’ll need to call the “getRandomNumber” function again to “unwrap” new box/boxes by the same user
7. random number is tight to the caller. so if “Jordi” called and signed the “getRandomNumber” and “Glen” wants also to unwrap his lootbox, “Glen” should call the “getRandomNumber” function by his own.

