require("dotenv").config();
const Web3 = require("web3");
const BN = require("bn.js");
const fs = require("fs");

async function deployEthLINK() {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const linkJson = require("../../out/LinkToken.json");
  const tokenContract = new web3.eth.Contract(linkJson.abi);
  const txContract = await tokenContract
    .deploy({
      data: linkJson.bytecode,
    })
    .send({
      from: ethMasterAccount,
      gas: process.env.ETH_GAS_LIMIT,
      gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    });
  const link = `${txContract.options.address}`;
  console.log("Deployed link contract to", link);
  return link;
}

async function deployLINKEthManager(linkAddr, wallet) {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const EthManagerJson = require("../../build/contracts/LINKEthManager.json");
  const managerContract = new web3.eth.Contract(EthManagerJson.abi);
  const txContract = await managerContract
    .deploy({
      data: EthManagerJson.bytecode,
      arguments: [linkAddr, wallet],
    })
    .send({
      from: ethMasterAccount,
      gas: process.env.ETH_GAS_LIMIT,
      gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    });
  const manager = `${txContract.options.address}`;
  console.log("Deployed LINKEthManager contract to", manager);
  return manager;
}

module.exports = {
  deployEthLINK,
  deployLINKEthManager,
};

// deployLINK().then((res) => {
//   deployLINKEthManager(res);
// });
