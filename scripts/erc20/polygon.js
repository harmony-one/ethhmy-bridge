require("dotenv").config();
const Web3 = require("web3");
const BN = require("bn.js");

async function mintERC20(contractAddr, accountAddr, amount) {
    const web3 = new Web3(process.env.POLYGON_NODE_URL);
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

async function checkEthBalance(contract, addr) {
    const web3 = new Web3(process.env.POLYGON_NODE_URL);
    const MyERC20Json = require("../../build/contracts/MyERC20.json");
    const erc20Contract = new web3.eth.Contract(MyERC20Json.abi, contract);
    return await erc20Contract.methods.balanceOf(addr).call();
}

async function tokenDetails(contract) {
    const web3 = new Web3(process.env.POLYGON_NODE_URL);
    const MyERC20Json = require("../../build/contracts/MyERC20.json");
    const erc20Contract = new web3.eth.Contract(MyERC20Json.abi, contract);
    return [
        await erc20Contract.methods.name().call(),
        await erc20Contract.methods.symbol().call(),
        await erc20Contract.methods.decimals().call(),
    ];
}

async function approveEthManger(contractAddr, managerAddr, amount) {
    const web3 = new Web3(process.env.POLYGON_NODE_URL);
    let ethUserAccount = web3.eth.accounts.privateKeyToAccount(
        process.env.ETH_USER_PRIVATE_KEY
    );
    web3.eth.accounts.wallet.add(ethUserAccount);
    web3.eth.defaultAccount = ethUserAccount.address;
    ethUserAccount = ethUserAccount.address;

    const MyERC20Json = require("../../build/contracts/MyERC20.json");
    const erc20Contract = new web3.eth.Contract(MyERC20Json.abi, contractAddr);
    await erc20Contract.methods.approve(managerAddr, amount).send({
        from: ethUserAccount,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    });
}

async function relyNFTTokenManger(contractAddr, guy) {
    const web3 = new Web3(process.env.POLYGON_NODE_URL);
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
    console.log("Rely NFTTokenManger to ", guy);
}

async function lockToken(managerAddr, ethToken, userAddr, amount) {
    const web3 = new Web3(process.env.POLYGON_NODE_URL);
    let ethUserAccount = web3.eth.accounts.privateKeyToAccount(
        process.env.ETH_USER_PRIVATE_KEY
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
    const web3 = new Web3(process.env.POLYGON_NODE_URL);
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
    const web3 = new Web3(process.env.POLYGON_NODE_URL);
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
    const web3 = new Web3(process.env.POLYGON_NODE_URL);
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
};
