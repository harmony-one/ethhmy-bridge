require("dotenv").config();
const { Harmony } = require("@harmony-js/core");
const { ChainID, ChainType } = require("@harmony-js/utils");
const hmy = new Harmony(process.env.HMY_NODE_URL, {
  chainType: ChainType.Harmony,
  chainId: ChainID.HmyTestnet,
});
hmy.wallet.addByPrivateKey(process.env.PRIVATE_KEY);

async function deployBUSDHmy() {
  const busdJson = require("../../out/BUSDImplementation.json");
  let busdContract = hmy.contracts.createContract(busdJson.abi);
  let deployOptions = { data: busdJson.bytecode };

  let options = { gasPrice: 1000000000, gasLimit: 6721900 };

  let response = await busdContract.methods
    .contractConstructor(deployOptions)
    .send(options);
  const busdAddr = response.transaction.receipt.contractAddress;
  console.log("BUSD contract deployed at " + busdAddr);
  return busdAddr;
}

async function deployBUSDHmyManager(busdAddr, wallet) {
  const hmyManagerJson = require("../../build/contracts/BUSDHmyManager.json");
  let hmyManagerContract = hmy.contracts.createContract(hmyManagerJson.abi);
  let deployOptions = {
    data: hmyManagerJson.bytecode,
    arguments: [busdAddr, wallet],
  };

  let options = {
    gasPrice: 1000000000,
    gasLimit: 6721900,
  };

  let response = await hmyManagerContract.methods
    .contractConstructor(deployOptions)
    .send(options);
  const managerAddr = response.transaction.receipt.contractAddress;
  console.log("BUSDHmyManager contract deployed at " + managerAddr);
  return managerAddr;
}

module.exports = {
  deployBUSDHmy,
  deployBUSDHmyManager,
};

// deployBUSDHmy().then((res) => {
//   deployBUSDHmyManager(res);
// });
