require("dotenv").config();
const Web3 = require("web3");
const BN = require("bn.js");
const fs = require("fs");

async function deployBUSD() {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const busdJson = require("../../out/BUSDImplementation.json");
  const tokenContract = new web3.eth.Contract(busdJson.abi);
  const txContract = await tokenContract
    .deploy({
      data: busdJson.bytecode,
    })
    .send({
      from: ethMasterAccount,
      gas: process.env.ETH_GAS_LIMIT,
      gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    });
  const busd = `${txContract.options.address}`;
  console.log("Deployed busd contract to", busd);
  return busd;
}

async function deployBUSDEthManager(erc20Addr) {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const EthManagerJson = require("../../build/contracts/BUSDEthManager.json");
  const managerContract = new web3.eth.Contract(EthManagerJson.abi);
  const txContract = await managerContract
    .deploy({
      data: EthManagerJson.bytecode,
      arguments: [erc20Addr, ethMasterAccount],
    })
    .send({
      from: ethMasterAccount,
      gas: process.env.ETH_GAS_LIMIT,
      gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    });
  const manager = `${txContract.options.address}`;
  console.log("Deployed BUSDEthManager contract to", manager);
  return manager;
}

module.exports = {
  deployBUSD,
  deployBUSDEthManager,
};

// deployBUSD().then(res => {
//   deployBUSDEthManager(res);
// });
