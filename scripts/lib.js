require("dotenv").config();
const Web3 = require("web3");
const { Harmony } = require("@harmony-js/core");
const { ChainID, ChainType } = require("@harmony-js/utils");
const hmy = new Harmony(process.env.HMY_NODE_URL, {
  chainType: ChainType.Harmony,
  chainId: ChainID.HmyTestnet,
});
hmy.wallet.addByPrivateKey(process.env.PRIVATE_KEY);

async function deployTokenManager() {
  const tokenManagerJson = require("../build/contracts/TokenManager.json");
  let tokenManagerContract = hmy.contracts.createContract(tokenManagerJson.abi);
  tokenManagerContract.wallet.setSigner(process.env.ADMIN);
  let deployOptions = { data: tokenManagerJson.bytecode };

  let options = { gasPrice: 1000000000, gasLimit: 6721900 };

  let response = await tokenManagerContract.methods
    .contractConstructor(deployOptions)
    .send(options);
  const tokenManagerAddr = response.transaction.receipt.contractAddress;
  console.log("TokenManager contract deployed at " + tokenManagerAddr);
  return tokenManagerAddr;
}

async function approveHmyMangerTokenManager(contract, addr) {
  const erc20ContractJson = require("../build/contracts/TokenManager.json");
  let erc20Contract = hmy.contracts.createContract(
    erc20ContractJson.abi,
    contract
  );
  erc20Contract.wallet.setSigner(process.env.ADMIN);
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };
  await erc20Contract.methods.rely(addr).send(options);
}

async function checkHmyAuthorization(contractFile, managerAddr, addr) {
  const hmyManagerJson = require(contractFile);
  let hmyManagerContract = hmy.contracts.createContract(
    hmyManagerJson.abi,
    managerAddr
  );
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };
  let res = await hmyManagerContract.methods.wards(addr).call(options);
  return res;
}

async function checkEthAuthorization(contractFile, managerAddr, addr) {
  const web3 = new Web3(process.env.ETH_NODE_URL);

  const contractJson = require(contractFile);
  const contract = new web3.eth.Contract(contractJson.abi, managerAddr);
  return await contract.methods.wards(addr).call();
}

module.exports = {
  deployTokenManager,
  approveHmyMangerTokenManager,
  checkEthAuthorization,
  checkHmyAuthorization
};
