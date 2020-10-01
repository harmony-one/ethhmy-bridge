require("dotenv").config();
const Web3 = require("web3");
const BN = require("bn.js");

async function initBUSDEth(contractAddr) {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const busdJson = require("../../out/BUSDImplementation.json");
  const busdContract = new web3.eth.Contract(busdJson.abi, contractAddr);
  await busdContract.methods.unpause().send({
    from: ethMasterAccount,
    gas: process.env.ETH_GAS_LIMIT,
    gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
  });
}

async function checkEthBalance(contract, addr) {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  const ethBUSDJson = require("../../out/BUSDImplementation.json");
  const ethBUSDContract = new web3.eth.Contract(ethBUSDJson.abi, contract);
  return await ethBUSDContract.methods.balanceOf(addr).call();
}

async function setSupplyController(contractAddr, addr) {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const busdJson = require("../../out/BUSDImplementation.json");
  const busdContract = new web3.eth.Contract(busdJson.abi, contractAddr);
  await busdContract.methods.setSupplyController(addr).send({
    from: ethMasterAccount,
    gas: process.env.ETH_GAS_LIMIT,
    gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
  });
}

async function mintBUSD(contractAddr, accountAddr, amount) {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const busdJson = require("../../out/BUSDImplementation.json");
  const busdContract = new web3.eth.Contract(busdJson.abi, contractAddr);
  await busdContract.methods.increaseSupply(amount).send({
    from: ethMasterAccount,
    gas: process.env.ETH_GAS_LIMIT,
    gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
  });
  await busdContract.methods.transfer(accountAddr, amount).send({
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

  const busdJson = require("../../out/BUSDImplementation.json");
  const busdContract = new web3.eth.Contract(busdJson.abi, contractAddr);
  let transaction = await busdContract.methods.approve(managerAddr, amount).send({
    from: ethUserAccount,
    gas: process.env.ETH_GAS_LIMIT,
    gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
  });
  return transaction.events.Approval;
}

async function lockToken(managerAddr, userAddr, amount) {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  let ethUserAccount = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_USER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethUserAccount);
  web3.eth.defaultAccount = ethUserAccount.address;
  ethUserAccount = ethUserAccount.address;

  const EthManagerJson = require("../../build/contracts/BUSDEthManager.json");
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

  const EthManagerJson = require("../../build/contracts/BUSDEthManager.json");
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

  const EthManagerJson = require("../../build/contracts/BUSDEthManager.json");
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
  initBUSDEth,
  checkEthBalance,
  setSupplyController,
  mintBUSD,
  approveEthManger,
  lockToken,
  lockTokenFor,
  unlockToken
};
