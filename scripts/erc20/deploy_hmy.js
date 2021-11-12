require("dotenv").config();
const {Harmony} = require("@harmony-js/core");
const {ChainID, ChainType} = require("@harmony-js/utils");

const hmy = new Harmony(process.env.HMY_NODE_URL, {
    chainType: ChainType.Harmony,
    chainId: Number(process.env.HMY_CHAIN_ID),
});
hmy.wallet.addByPrivateKey(process.env.HMY_PRIVATE_KEY);
hmy.wallet.addByPrivateKey(process.env.HMY_PRIVATE_KEY_USER);

async function deployHmyManager(wallet) {
    const hmyManagerJson = require("../../build/contracts/ERC20HmyManager.json");
    let hmyManagerContract = hmy.contracts.createContract(hmyManagerJson.abi);
    hmyManagerContract.wallet.setSigner(process.env.ADMIN);
    let deployOptions = {data: hmyManagerJson.bytecode, arguments: [wallet]};

    let options = {
        gasPrice: 1000000000,
        gasLimit: 6721900,
    };

    let response = await hmyManagerContract.methods
        .contractConstructor(deployOptions)
        .send(options);
    const managerAddr = response.transaction.receipt.contractAddress;
    console.log("HmyManager contract deployed at " + managerAddr);
    return managerAddr;
}

async function deployHmyNFTManager(wallet) {
    const hmyNFTManagerJson = require("../../build/contracts/NFTHmyManager.json");
    let hmyNFTManagerContract = hmy.contracts.createContract(hmyNFTManagerJson.abi);
    hmyNFTManagerContract.wallet.setSigner(process.env.HMY_ADMIN);

    let deployOptions = {data: hmyNFTManagerJson.bytecode, arguments: [wallet]};

    let options = {
        gasPrice: 1000000000,
        gasLimit: 6721900,
    };

    let response = await hmyNFTManagerContract.methods
        .contractConstructor(deployOptions)
        .send(options);
    const managerAddr = response.transaction.receipt.contractAddress;
    console.log("HmyManager contract deployed at " + managerAddr);
    return managerAddr;
}

async function deployHmyMultiSigWallet() {
    const hmyMultiSigWalletJson = require("../../build/contracts/MultiSigWallet.json");
    let hmyMultiSigWalletContract = hmy.contracts.createContract(hmyMultiSigWalletJson.abi);
    hmyMultiSigWalletContract.wallet.setSigner(process.env.HMY_ADMIN);

    let deployOptions = {
        data: hmyMultiSigWalletJson.bytecode, arguments: [
            ["0xd76DCbFc77069B3c4C46c32f101217F8Bb81Acd2", "0xb4f6Ef0A037b6234Bce922cBfC38beD68435a2AE", "0x08160A046120980c060AB19506c99c184eEB678b"],
            3
        ]
    };

    let options = {
        gasPrice: 1000000000,
        gasLimit: 6721900,
    };

    let response = await hmyMultiSigWalletContract.methods
        .contractConstructor(deployOptions)
        .send(options);
    const managerAddr = response.transaction.receipt.contractAddress;
    console.log("MultiSigWallet contract deployed at " + managerAddr);
    return managerAddr;
}

async function deployHRC1155HmyManager(wallet) {
    const hmyNFTManagerJson = require("../../build/contracts/HRC1155HmyManager.json");
    let hmyNFTManagerContract = hmy.contracts.createContract(hmyNFTManagerJson.abi);
    hmyNFTManagerContract.wallet.setSigner(process.env.HMY_ADMIN);

    let deployOptions = {data: hmyNFTManagerJson.bytecode, arguments: [wallet]};

    let options = {
        gasPrice: 1000000000,
        gasLimit: 6721900,
    };

    let response = await hmyNFTManagerContract.methods
        .contractConstructor(deployOptions)
        .send(options);
    const managerAddr = response.transaction.receipt.contractAddress;
    console.log("HRC1155HmyManager contract deployed at " + managerAddr);
    return managerAddr;
}

async function deployERC1155TokenManager() {
    const hmyNFTManagerJson = require("../../build/contracts/ERC1155TokenManager.json");
    let hmyNFTManagerContract = hmy.contracts.createContract(hmyNFTManagerJson.abi);
    hmyNFTManagerContract.wallet.setSigner(process.env.HMY_ADMIN);

    let deployOptions = {data: hmyNFTManagerJson.bytecode, arguments: []};

    let options = {
        gasPrice: 1000000000,
        gasLimit: 6721900,
    };

    let response = await hmyNFTManagerContract.methods
        .contractConstructor(deployOptions)
        .send(options);
    const managerAddr = response.transaction.receipt.contractAddress;
    console.log("ERC1155TokenManager contract deployed at " + managerAddr);
    return managerAddr;
}

async function deployERC1155HmyManager(wallet) {
    const hmyNFTManagerJson = require("../../build/contracts/ERC1155HmyManager.json");
    let hmyNFTManagerContract = hmy.contracts.createContract(hmyNFTManagerJson.abi);
    hmyNFTManagerContract.wallet.setSigner(process.env.HMY_ADMIN);

    let deployOptions = {data: hmyNFTManagerJson.bytecode, arguments: [wallet]};

    let options = {
        gasPrice: 1000000000,
        gasLimit: 6721900,
    };

    let response = await hmyNFTManagerContract.methods
        .contractConstructor(deployOptions)
        .send(options);
    const managerAddr = response.transaction.receipt.contractAddress;
    console.log("ERC1155HmyManager contract deployed at " + managerAddr);
    return managerAddr;
}

module.exports = {
    deployHmyManager,
    deployHmyNFTManager,
    deployHmyMultiSigWallet: deployHmyMultiSigWallet,
    deployHRC1155HmyManager,
    deployERC1155TokenManager,
    deployERC1155HmyManager,
};
