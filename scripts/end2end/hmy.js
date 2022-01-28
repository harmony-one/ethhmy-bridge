require("dotenv").config();
const {Harmony} = require("@harmony-js/core");
const {ChainID, ChainType} = require("@harmony-js/utils");
const {toUtf8Bytes} = require("@harmony-js/contract");
const {hexlify} = require("@harmony-js/crypto");
const hmy = new Harmony(process.env.HMY_NODE_URL, {
    chainType: ChainType.Harmony,
    chainId: Number(process.env.HMY_CHAIN_ID),
});
hmy.wallet.addByPrivateKey(process.env.PRIVATE_KEY);
hmy.wallet.addByPrivateKey(process.env.PRIVATE_KEY_USER);
hmy.wallet.addByPrivateKey(process.env.ETH_USER_PRIVATE_KEY_1155);
hmy.wallet.addByPrivateKey(process.env.HMY_PRIVATE_KEY);

async function mintHRC20(contractAddr, accountAddr, amount) {
    const erc20ContractJson = require("../../build/contracts/BridgedToken.json");
    let erc20Contract = hmy.contracts.createContract(
        erc20ContractJson.abi,
        contractAddr
    );
    let options = {gasPrice: 1000000000, gasLimit: 6721900};
    await erc20Contract.methods.mint(accountAddr, amount).send(options);
}

async function getHRC1155Detail(contract) {
    const erc20ContractJson = require("../../build/contracts/MyERC1155.json");
    let erc20Contract = hmy.contracts.createContract(
        erc20ContractJson.abi,
        contract
    );
    let options = {gasPrice: 1000000000, gasLimit: 6721900};
    let name;
    let symbol;

    try {
        name = await erc20Contract.methods.name().call(options);
    } catch (e) {
        name = "";
    }

    try {
        symbol = await erc20Contract.methods.symbol().call(options);
    } catch (e) {
        symbol = "";
    }

    return [
        name,
        symbol
    ];
}

async function checkHmyBalance(contract, addr, tokenId) {
    const erc20ContractJson = require("../../build/contracts/ERC1155.json");
    let erc20Contract = hmy.contracts.createContract(
        erc20ContractJson.abi,
        contract
    );
    let options = {gasPrice: 1000000000, gasLimit: 6721900};
    return await erc20Contract.methods.balanceOf(addr, tokenId).call(options);
}

async function getMappingFor(managerAddr, erc20TokenAddr) {
    const hmyManagerJson = require("../../build/contracts/HRC1155TokenManager.json");
    let hmyManagerContract = hmy.contracts.createContract(
        hmyManagerJson.abi,
        managerAddr
    );
    let options = {gasPrice: 1000000000, gasLimit: 6721900};
    return await hmyManagerContract.methods.mappings(erc20TokenAddr).call(options);
}

async function approveHmyManger(tokenContract, managerAddr) {
    const erc20ContractJson = require("../../build/contracts/ERC1155.json");
    let erc20Contract = hmy.contracts.createContract(
        erc20ContractJson.abi,
        tokenContract
    );
    erc20Contract.wallet.setSigner(process.env.ETH_USER_1155);

    let options = {gasPrice: 1000000000, gasLimit: 6721900};
    let response = await erc20Contract.methods.setApprovalForAll(managerAddr, true).send(options);
    return response.transaction.id;
}

async function addToken(managerAddr, tokenManagerAddr, erc20TokenAddr, name, symbol, decimals) {
    const hmyManagerJson = require("../../build/contracts/ERC20HmyManager.json");
    let hmyManagerContract = hmy.contracts.createContract(
        hmyManagerJson.abi,
        managerAddr
    );
    hmyManagerContract.wallet.setSigner(process.env.USER);
    let options = {gasPrice: 1000000000, gasLimit: 6721900};

    await hmyManagerContract.methods
        .addToken(tokenManagerAddr, erc20TokenAddr, name, symbol, decimals)
        .send(options);
}

async function mintToken(managerAddr, oneTokenAddr, userAddr, amount, receiptId) {
    const hmyManagerJson = require("../../build/contracts/ERC20HmyManager.json");
    let hmyManagerContract = hmy.contracts.createContract(
        hmyManagerJson.abi,
        managerAddr
    );
    hmyManagerContract.wallet.setSigner(process.env.ADMIN);

    let options = {gasPrice: 1000000000, gasLimit: 6721900};

    await hmyManagerContract.methods
        .mintToken(oneTokenAddr, amount, userAddr, receiptId)
        .send(options);
}

async function burnToken(managerAddr, oneTokenAddr, userAddr, amount) {
    const hmyManagerJson = require("../../build/contracts/HmyManager.json");
    let hmyManagerContract = hmy.contracts.createContract(
        hmyManagerJson.abi,
        managerAddr
    );
    hmyManagerContract.wallet.setSigner(process.env.USER);

    let options = {gasPrice: 1000000000, gasLimit: 6721900};

    let response = await hmyManagerContract.methods
        .burnToken(oneTokenAddr, amount, userAddr)
        .send(options);
    return response.transaction.id;
}

async function lockHmy1155Token(managerAddr, oneTokenAddr, tokenIds, userAddr, amounts, data) {
    const hmyManagerJson = require("../../build/contracts/HRC1155HmyManager.json");
    let hmyManagerContract = hmy.contracts.createContract(
        hmyManagerJson.abi,
        managerAddr
    );
    hmyManagerContract.wallet.setSigner(process.env.ETH_USER_1155);

    let options = {gasPrice: 1000000000, gasLimit: 6721900};

    let response = await hmyManagerContract.methods
        .lockHRC1155Tokens(oneTokenAddr, tokenIds, userAddr, amounts, data)
        .send(options);
    return response.transaction.id;
}

async function unlockHmy1155Token(managerAddr, oneTokenAddr, tokenIds, userAddr, receiptId, amounts, data) {
    const hmyManagerJson = require("../../build/contracts/HRC1155HmyManager.json");
    let hmyManagerContract = hmy.contracts.createContract(
        hmyManagerJson.abi,
        managerAddr
    );
    hmyManagerContract.wallet.setSigner(process.env.HMY_MASTER);

    let options = {gasPrice: 1000000000, gasLimit: 6721900};

    let response = await hmyManagerContract.methods
        .unlockHRC1155Tokens(oneTokenAddr, tokenIds, userAddr, receiptId, amounts, data)
        .send(options);
    return response.transaction.id;
}

async function getManagerWallet(managerAddr) {
    // const hmyManagerJson = require("../../build/contracts/NFTHmyManager.json");
    const hmyManagerJson = require("../../build/contracts/MultiSigWallet.json");
    let hmyManagerContract = hmy.contracts.createContract(
        hmyManagerJson.abi,
        managerAddr
    );
    hmyManagerContract.wallet.setSigner(process.env.HMY_USER);

    let options = {gasPrice: 1000000000, gasLimit: 6721900};

    return await hmyManagerContract.methods
        .owners(2)
        .call(options);
}

module.exports = {
    mintHRC20,
    checkHmyBalance,
    getMappingFor,
    approveHmyManger,
    addToken,
    mintToken,
    burnToken,
    getManagerWallet,
    lockHmy1155Token,
    getHRC1155Detail,
    unlockHmy1155Token,
};
