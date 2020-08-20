# ethhmy-bridge
Ethereum&lt;>Harmony two way bridge (trusted version)

## Transferring ERC20 from Ethereum to Harmony
![eth2hmy](assets/eth2hmy.jpg)

## Transferring HRC20 from Harmony back to Ethereum
![hmy2eth](assets/hmy2eth.jpg)

## Execution Plan

| Milestone | Components                                          | Trust Requirement | Centralization | Target Date    |
|-----------|-----------------------------------------------------|-------------------|----------------|----------------|
| v1        | Smart contracts w/ permissioned mint/unlock         | Trusted           | Centralized    | DONE           |
| v2        | Smart contracts w/ single relayer hosted by harmony | Semi-trusted      | Centralized    | Sept 1, 2020   |
| v3        | Smart contracts w/ a network of relayers            | Trustless         | Decentralized  | Sept 15, 2020  |

## Setup

Create two ropsten accounts and get test tokens using https://faucet.ropsten.be 

Export following variables for ethereum testnet:
```
ETH_NODE_URL='https://ropsten.infura.io/v3/acb534b53d3a47b09d7886064f8e51b6'
ETH_MASTER_PRIVATE_KEY=<private-key-of-first-account-for-deploying-contracts>
ETH_USER_PRIVATE_KEY=<private-key-of-second-account-for-transferring-across-chains>
ETH_USER=<account-address-of-second-eth-account>
ETH_GAS_PRICE=100000000000
ETH_GAS_LIMIT=4712388
```

Create two harmony accounts and get test tokens using https://onefaucet.ibriz.ai

Export following variables for harmony testnet:
```
HMY_NODE_URL='https://api.s0.b.hmny.io'
PRIVATE_KEY=<private-key-of-first-harmony-account-for-deploying-contracts>
PRIVATE_KEY_USER=<private-key-of-second-harmony-account-for-transferring-across-chains>
USER=<hex-account-address-of-the-second-harmony-account>
GAS_LIMIT=6721900
GAS_PRICE=1000000000
```

## Running end to end demo using ethereum ropsten and harmony testnets

```
node scripts/end2end.js
```
