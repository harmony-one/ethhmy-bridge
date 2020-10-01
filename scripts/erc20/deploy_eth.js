require("dotenv").config();
const Web3 = require("web3");
const BN = require("bn.js");

async function deployERC20(name, symbol, decimals) {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const MyERC20Json = require("../../build/contracts/MyERC20.json");
  const tokenContract = new web3.eth.Contract(MyERC20Json.abi);
  const txContract = await tokenContract
    .deploy({
      data: MyERC20Json.bytecode,
      arguments: [name, symbol, decimals],
    })
    .send({
      from: ethMasterAccount,
      gas: process.env.ETH_GAS_LIMIT,
      gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    });
  const erc20 = `${txContract.options.address}`;
  console.log("Deployed ERC20 contract to", erc20);
  return erc20;
}

async function deployEthManager(wallet) {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const EthManagerJson = require("../../build/contracts/EthManager.json");
  const managerContract = new web3.eth.Contract(EthManagerJson.abi);
  const txContract = await managerContract
    .deploy({
      data: EthManagerJson.bytecode,
      arguments: [wallet]
    })
    .send({
      from: ethMasterAccount,
      gas: process.env.ETH_GAS_LIMIT,
      gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    });
  const manager = `${txContract.options.address}`;
  console.log("Deployed EthManager contract to", manager);
  return manager;
}
// deployEthManager('0x3cD9Cd47EcF788dA643399E4e7afefC9Eb7c89Dc').then(() => {});s

module.exports = {
  deployERC20,
  deployEthManager
};
