require("dotenv").config();
const Web3 = require("web3");
const BN = require("bn.js");

async function checkEthBalance(contract, addr) {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  const linkJson = require("../../out/LinkToken.json");
  const linkContract = new web3.eth.Contract(linkJson.abi, contract);
  return await linkContract.methods.balanceOf(addr).call();
}

async function mintLINK(contractAddr, accountAddr, amount) {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const linkJson = require("../../out/LinkToken.json");
  const linkContract = new web3.eth.Contract(linkJson.abi, contractAddr);
  await linkContract.methods.transfer(accountAddr, amount).send({
    from: ethMasterAccount,
    gas: process.env.ETH_GAS_LIMIT,
    gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
  });
}

async function approveEthManger(contractAddr, managerAddr, amount) {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  let ethUserAccount = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_USER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethUserAccount);
  web3.eth.defaultAccount = ethUserAccount.address;
  ethUserAccount = ethUserAccount.address;

  const linkJson = require("../../out/LinkToken.json");
  const linkContract = new web3.eth.Contract(linkJson.abi, contractAddr);
  await linkContract.methods.approve(managerAddr, amount).send({
    from: ethUserAccount,
    gas: process.env.ETH_GAS_LIMIT,
    gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
  });
}

async function lockToken(managerAddr, userAddr, amount) {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  let ethUserAccount = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_USER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethUserAccount);
  web3.eth.defaultAccount = ethUserAccount.address;
  ethUserAccount = ethUserAccount.address;

  const EthManagerJson = require("../../build/contracts/LINKEthManager.json");
  const managerContract = new web3.eth.Contract(
    EthManagerJson.abi,
    managerAddr
  );
  let transaction = await managerContract.methods
    .lockToken(amount, userAddr)
    .send({
      from: ethUserAccount,
      gas: process.env.ETH_GAS_LIMIT,
      gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    });
  return transaction.events.Locked;
}

async function lockTokenFor(managerAddr, userAddr, amount, recipient) {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  let ethUserAccount = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethUserAccount);
  web3.eth.defaultAccount = ethUserAccount.address;
  ethUserAccount = ethUserAccount.address;

  const EthManagerJson = require("../../build/contracts/LINKEthManager.json");
  const managerContract = new web3.eth.Contract(
    EthManagerJson.abi,
    managerAddr
  );
  let transaction = await managerContract.methods
    .lockTokenFor(userAddr, amount, recipient)
    .send({
      from: ethUserAccount,
      gas: process.env.ETH_GAS_LIMIT,
      gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    });
  return transaction.events.Locked;
}

async function unlockToken(managerAddr, userAddr, amount, receiptId) {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const EthManagerJson = require("../../build/contracts/LINKEthManager.json");
  const managerContract = new web3.eth.Contract(
    EthManagerJson.abi,
    managerAddr
  );

  await managerContract.methods.unlockToken(amount, userAddr, receiptId).send({
    from: ethMasterAccount,
    gas: process.env.ETH_GAS_LIMIT,
    gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)), //new BN(process.env.ETH_GAS_PRICE)
  });
}

module.exports = {
  checkEthBalance,
  mintLINK,
  approveEthManger,
  lockToken,
  lockTokenFor,
  unlockToken
};
