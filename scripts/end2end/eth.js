require("dotenv").config();
const Web3 = require("web3");
const BN = require("bn.js");

async function mintERC20(contractAddr, accountAddr, amount) {
    const web3 = new Web3(process.env.ETH_NODE_URL);
    let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
        process.env.ETH_MASTER_PRIVATE_KEY
    );
    web3.eth.accounts.wallet.add(ethMasterAccount);
    web3.eth.accounts.wallet.add(ethMasterAccount);
    web3.eth.defaultAccount = ethMasterAccount.address;
    ethMasterAccount = ethMasterAccount.address;

    const MyERC20Json = require("../../build/contracts/MyERC20.json");
    const erc20Contract = new web3.eth.Contract(MyERC20Json.abi, contractAddr);
    await erc20Contract.methods.mint(accountAddr, amount).send({
        from: ethMasterAccount,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    });
}

async function checkEthBalance(contract, userAddr, tokenId) {
    const web3 = new Web3(process.env.ETH_NODE_URL);
    const MyERC20Json = require("../../build/contracts/Bridged1155Token.json");
    const erc20Contract = new web3.eth.Contract(MyERC20Json.abi, contract);
    return await erc20Contract.methods.balanceOf(userAddr, tokenId).call();
}

async function tokenDetails(contract) {
    const web3 = new Web3(process.env.ETH_NODE_URL);
    const MyERC20Json = require("../../build/contracts/ERC1155.json");
    const erc20Contract = new web3.eth.Contract(MyERC20Json.abi, contract);
    return [
        await erc20Contract.methods.uri().call(),
    ];
}

async function approveEthManger(contractAddr, managerAddr) {
    const web3 = new Web3(process.env.ETH_NODE_URL);
    let ethUserAccount = web3.eth.accounts.privateKeyToAccount(
        process.env.ETH_USER_PRIVATE_KEY_1155
    );
    web3.eth.accounts.wallet.add(ethUserAccount);
    web3.eth.defaultAccount = ethUserAccount.address;
    ethUserAccount = ethUserAccount.address;

    const MyERC20Json = require("../../build/contracts/Bridged1155Token.json");
    const erc20Contract = new web3.eth.Contract(MyERC20Json.abi, contractAddr);
    let res = await erc20Contract.methods.setApprovalForAll(managerAddr, true).send({
        from: ethUserAccount,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    });
    return res.transactionHash;
}

async function relyNFTTokenManger(contractAddr, guy) {
    const web3 = new Web3(process.env.ETH_NODE_URL);
    let ethUserAccount = web3.eth.accounts.privateKeyToAccount(
        process.env.ETH_USER_PRIVATE_KEY
    );
    web3.eth.accounts.wallet.add(ethUserAccount);
    web3.eth.defaultAccount = ethUserAccount.address;
    ethUserAccount = ethUserAccount.address;

    const MyERC20Json = require("../../build/contracts/NFTTokenManager.json");
    const erc20Contract = new web3.eth.Contract(MyERC20Json.abi, contractAddr);
    await erc20Contract.methods.rely(guy).send({
        from: ethUserAccount,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    });
}

async function lockToken(managerAddr, ethToken, userAddr, amount) {
    const web3 = new Web3(process.env.ETH_NODE_URL);
    let ethUserAccount = web3.eth.accounts.privateKeyToAccount(
        process.env.ETH_USER_PRIVATE_KEY_1155
    );
    web3.eth.accounts.wallet.add(ethUserAccount);
    web3.eth.defaultAccount = ethUserAccount.address;
    ethUserAccount = ethUserAccount.address;

    const EthManagerJson = require("../../build/contracts/HRC1155EthManager.json");
    const managerContract = new web3.eth.Contract(
        EthManagerJson.abi,
        managerAddr
    );
    let transaction = await managerContract.methods
        .lockToken(ethToken, amount, userAddr)
        .send({
            from: ethUserAccount,
            gas: process.env.ETH_GAS_LIMIT,
            gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
        });
    return transaction.events.Locked;
}

async function lockTokenFor(
    managerAddr,
    ethToken,
    userAddr,
    amount,
    recipient
) {
    const web3 = new Web3(process.env.ETH_NODE_URL);
    let ethUserAccount = web3.eth.accounts.privateKeyToAccount(
        process.env.ETH_MASTER_PRIVATE_KEY
    );
    web3.eth.accounts.wallet.add(ethUserAccount);
    web3.eth.defaultAccount = ethUserAccount.address;
    ethUserAccount = ethUserAccount.address;

    const EthManagerJson = require("../../build/contracts/ERC20EthManager.json");
    const managerContract = new web3.eth.Contract(
        EthManagerJson.abi,
        managerAddr
    );
    let transaction = await managerContract.methods
        .lockTokenFor(ethToken, userAddr, amount, recipient)
        .send({
            from: ethUserAccount,
            gas: process.env.ETH_GAS_LIMIT,
            gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
        });
    return transaction.events.Locked;
}

async function unlockToken(managerAddr, ethToken, userAddr, amount, receiptId) {
    const web3 = new Web3(process.env.ETH_NODE_URL);
    let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
        process.env.ETH_MASTER_PRIVATE_KEY
    );
    web3.eth.accounts.wallet.add(ethMasterAccount);
    web3.eth.accounts.wallet.add(ethMasterAccount);
    web3.eth.defaultAccount = ethMasterAccount.address;
    ethMasterAccount = ethMasterAccount.address;

    const EthManagerJson = require("../../build/contracts/ERC20EthManager.json");
    const managerContract = new web3.eth.Contract(
        EthManagerJson.abi,
        managerAddr
    );

    await managerContract.methods
        .unlockToken(ethToken, amount, userAddr, receiptId)
        .send({
            from: ethMasterAccount,
            gas: process.env.ETH_GAS_LIMIT,
            gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)), //new BN(process.env.ETH_GAS_PRICE)
        });
}

async function relyHRC1155TokenManger(contractAddr, guy) {
    const web3 = new Web3(process.env.ETH_NODE_URL);
    let ethUserAccount = web3.eth.accounts.privateKeyToAccount(
        process.env.ETH_USER_PRIVATE_KEY
    );
    web3.eth.accounts.wallet.add(ethUserAccount);
    web3.eth.defaultAccount = ethUserAccount.address;
    ethUserAccount = ethUserAccount.address;

    const MyERC20Json = require("../../build/contracts/HRC1155TokenManager.json");
    const erc20Contract = new web3.eth.Contract(MyERC20Json.abi, contractAddr);
    await erc20Contract.methods.rely(guy).send({
        from: ethUserAccount,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    });
    console.log('success rely ' + guy + ' to ' + contractAddr);
}

async function addHRC1155Token(contractAddr, tokenManager, ethTokenAddr, name, symbol, baseURI) {
    const web3 = new Web3(process.env.ETH_NODE_URL);
    let ethUserAccount = web3.eth.accounts.privateKeyToAccount(
        process.env.ETH_MASTER_PRIVATE_KEY
    );
    web3.eth.accounts.wallet.add(ethUserAccount);
    web3.eth.defaultAccount = ethUserAccount.address;
    ethUserAccount = ethUserAccount.address;

    const MyERC20Json = require("../../build/contracts/HRC1155EthManager.json");
    const erc20Contract = new web3.eth.Contract(MyERC20Json.abi, contractAddr);
    await erc20Contract.methods.addToken(tokenManager, ethTokenAddr, name, symbol, baseURI).send({
        from: ethUserAccount,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    });
    console.log('success add ' + ethTokenAddr + ' to tokenManager');
}

async function getHRC1155MappingFor(ethTokenManagerAddr, originTokenAddr) {
    const web3 = new Web3(process.env.ETH_NODE_URL);
    const MyERC20Json = require("../../build/contracts/HRC1155TokenManager.json");
    const erc20Contract = new web3.eth.Contract(MyERC20Json.abi, ethTokenManagerAddr);
    return await erc20Contract.methods.mappedTokens(originTokenAddr).call();
}

async function mintHRC1155Tokens(contractAddr, newHRC1155Addr, tokenIds, userAddr, receiptId, amounts, data) {
    const web3 = new Web3(process.env.ETH_NODE_URL);
    let ethUserAccount = web3.eth.accounts.privateKeyToAccount(
        process.env.ETH_MASTER_PRIVATE_KEY
    );
    web3.eth.accounts.wallet.add(ethUserAccount);
    web3.eth.defaultAccount = ethUserAccount.address;
    ethUserAccount = ethUserAccount.address;

    const MyERC20Json = require("../../build/contracts/HRC1155EthManager.json");
    const erc20Contract = new web3.eth.Contract(MyERC20Json.abi, contractAddr);
    let res = await erc20Contract.methods.mintTokens(newHRC1155Addr, tokenIds, userAddr, receiptId, amounts, data).send({
        from: ethUserAccount,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    });
    console.log('success mint ' + newHRC1155Addr + ' token to ' + userAddr);
    return res.transactionHash;
}

async function burnHRC1155Tokens(contractAddr, newHRC1155Addr, tokenIds, userAddr, amounts) {
    const web3 = new Web3(process.env.ETH_NODE_URL);
    let ethUserAccount = web3.eth.accounts.privateKeyToAccount(
        process.env.ETH_USER_PRIVATE_KEY_1155
    );
    web3.eth.accounts.wallet.add(ethUserAccount);
    web3.eth.defaultAccount = ethUserAccount.address;
    ethUserAccount = ethUserAccount.address;

    const MyERC20Json = require("../../build/contracts/HRC1155EthManager.json");
    const erc20Contract = new web3.eth.Contract(MyERC20Json.abi, contractAddr);
    let res = await erc20Contract.methods.burnTokens(newHRC1155Addr, tokenIds, userAddr, amounts).send({
        from: ethUserAccount,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    });
    console.log('success burn ' + newHRC1155Addr + ' token to ' + userAddr);
    return res.transactionHash;
}

module.exports = {
    mintERC20,
    checkEthBalance,
    tokenDetails,
    approveEthManger,
    lockToken,
    lockTokenFor,
    unlockToken,
    relyNFTTokenManger,
    relyHRC1155TokenManger,
    addHRC1155Token,
    getHRC1155MappingFor,
    mintHRC1155Tokens,
    burnHRC1155Tokens,
};
