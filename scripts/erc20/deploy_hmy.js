require("dotenv").config();
const { Harmony } = require("@harmony-js/core");
const { ChainID, ChainType } = require("@harmony-js/utils");
const hmy = new Harmony(process.env.HMY_NODE_URL, {
  chainType: ChainType.Harmony,
  chainId: ChainID.HmyTestnet,
});
hmy.wallet.addByPrivateKey(process.env.PRIVATE_KEY);
hmy.wallet.addByPrivateKey(process.env.PRIVATE_KEY_USER);

async function deployHRC20() {
  const erc20ContractJson = require("../../build/contracts/MyERC20.json");
  let erc20Contract = hmy.contracts.createContract(erc20ContractJson.abi);
  erc20Contract.wallet.setSigner(process.env.ADMIN);
  let deployOptions = { data: erc20ContractJson.bytecode };

  let options = { gasPrice: 1000000000, gasLimit: 6721900 };

  let response = await erc20Contract.methods
    .contractConstructor(deployOptions)
    .send(options);
  const erc20Addr = response.transaction.receipt.contractAddress;
  console.log("HRC20 contract deployed at " + erc20Addr);
  return erc20Addr;
}

async function deployHmyManager(erc20Addr) {
  const hmyManagerJson = require("../../build/contracts/HmyManager.json");
  let hmyManagerContract = hmy.contracts.createContract(hmyManagerJson.abi);
  hmyManagerContract.wallet.setSigner(process.env.ADMIN);
  let deployOptions = { data: hmyManagerJson.bytecode, arguments: [erc20Addr] };

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

module.exports = {
  deployHRC20,
  deployHmyManager,
};
