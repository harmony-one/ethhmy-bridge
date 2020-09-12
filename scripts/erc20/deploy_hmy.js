require("dotenv").config();
const { Harmony } = require("@harmony-js/core");
const { ChainID, ChainType } = require("@harmony-js/utils");
const hmy = new Harmony(process.env.HMY_NODE_URL, {
  chainType: ChainType.Harmony,
  chainId: ChainID.HmyTestnet,
});
hmy.wallet.addByPrivateKey(process.env.PRIVATE_KEY);
hmy.wallet.addByPrivateKey(process.env.PRIVATE_KEY_USER);

async function deployHmyManager() {
  const hmyManagerJson = require("../../build/contracts/HmyManager.json");
  let hmyManagerContract = hmy.contracts.createContract(hmyManagerJson.abi);
  hmyManagerContract.wallet.setSigner(process.env.ADMIN);
  let deployOptions = { data: hmyManagerJson.bytecode };

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
  deployHmyManager,
};
