require("dotenv").config();
const { Harmony } = require("@harmony-js/core");
const { ChainID, ChainType } = require("@harmony-js/utils");
const hmy = new Harmony(process.env.HMY_NODE_URL, {
  chainType: ChainType.Harmony,
  chainId: ChainID.HmyTestnet,
});
hmy.wallet.addByPrivateKey(process.env.PRIVATE_KEY);

async function deployHmyLINK() {
  const linkJson = require("../../out/LinkToken.json");
  let linkContract = hmy.contracts.createContract(linkJson.abi);
  let deployOptions = { data: linkJson.bytecode };

  let options = { gasPrice: 1000000000, gasLimit: 6721900 };

  let response = await linkContract.methods
    .contractConstructor(deployOptions)
    .send(options);
  const linkAddr = response.transaction.receipt.contractAddress;
  console.log("LINK contract deployed at " + linkAddr);
  return linkAddr;
}

async function deployLINKHmyManager(linkAddr) {
  const hmyManagerJson = require("../../build/contracts/LINKHmyManager.json");
  let hmyManagerContract = hmy.contracts.createContract(hmyManagerJson.abi);
  let deployOptions = {
    data: hmyManagerJson.bytecode,
    arguments: [linkAddr],
  };

  let options = {
    gasPrice: 1000000000,
    gasLimit: 6721900,
  };

  let response = await hmyManagerContract.methods
    .contractConstructor(deployOptions)
    .send(options);
  const managerAddr = response.transaction.receipt.contractAddress;
  console.log("LINKHmyManager contract deployed at " + managerAddr);
  return managerAddr;
}

module.exports = {
  deployHmyLINK,
  deployLINKHmyManager,
};

// deployLINK().then((res) => {
//   deployLINKHmyManager(res);
// });
