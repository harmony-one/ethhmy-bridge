require("dotenv").config();
const { Harmony } = require("@harmony-js/core");
const { ChainID, ChainType } = require("@harmony-js/utils");
const { toUtf8Bytes } = require("@harmony-js/contract");
const { hexlify } = require("@harmony-js/crypto");
const hmy = new Harmony(process.env.HMY_NODE_URL, {
  chainType: ChainType.Harmony,
  chainId: ChainID.HmyTestnet,
});
hmy.wallet.addByPrivateKey(process.env.PRIVATE_KEY);
hmy.wallet.addByPrivateKey(process.env.PRIVATE_KEY_USER);

async function mintHRC20(contractAddr, accountAddr, amount) {
  const erc20ContractJson = require("../../build/contracts/BridgedToken.json");
  let erc20Contract = hmy.contracts.createContract(
    erc20ContractJson.abi,
    contractAddr
  );
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };
  await erc20Contract.methods.mint(accountAddr, amount).send(options);
}

async function checkHmyBalance(contract, addr) {
  const erc20ContractJson = require("../../build/contracts/BridgedToken.json");
  let erc20Contract = hmy.contracts.createContract(
    erc20ContractJson.abi,
    contract
  );
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };
  let res = await erc20Contract.methods.balanceOf(addr).call(options);
  return res;
}

async function getMappingFor(managerAddr, erc20TokenAddr) {
  const hmyManagerJson = require("../../build/contracts/HmyManager.json");
  let hmyManagerContract = hmy.contracts.createContract(
    hmyManagerJson.abi,
    managerAddr
  );
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };
  let res = await hmyManagerContract.methods.mappings(erc20TokenAddr).call(options);
  return res;
}

async function approveHmyManger(contract, spender, amount) {
  const erc20ContractJson = require("../../build/contracts/BridgedToken.json");
  let erc20Contract = hmy.contracts.createContract(
    erc20ContractJson.abi,
    contract
  );
  erc20Contract.wallet.setSigner(process.env.USER);
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };
  await erc20Contract.methods.approve(spender, amount).send(options);
}

async function addToken(managerAddr, tokenManagerAddr, erc20TokenAddr, name, symbol, decimals) {
  const hmyManagerJson = require("../../build/contracts/HmyManager.json");
  let hmyManagerContract = hmy.contracts.createContract(
    hmyManagerJson.abi,
    managerAddr
  );
  hmyManagerContract.wallet.setSigner(process.env.USER);
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };

  await hmyManagerContract.methods
    .addToken(tokenManagerAddr, erc20TokenAddr, name, symbol, decimals)
    .send(options);
}

async function mintToken(managerAddr, oneTokenAddr, userAddr, amount, receiptId) {
  const hmyManagerJson = require("../../build/contracts/HmyManager.json");
  let hmyManagerContract = hmy.contracts.createContract(
    hmyManagerJson.abi,
    managerAddr
  );
  hmyManagerContract.wallet.setSigner(process.env.ADMIN);

  let options = { gasPrice: 1000000000, gasLimit: 6721900 };

  await hmyManagerContract.methods
    .mintToken(oneTokenAddr, amount, userAddr, receiptId)
    .send(options);
}

async function burnToken(managerAddr, oneTokenAddr, userAddr, amount) {
  const hmyManagerJson = require("../../build/contracts/HmyManager.json");
  let hmyManagerContract = hmy.contracts.createContract(
    hmyManagerJson.abi,
    managerAddr
  );
  hmyManagerContract.wallet.setSigner(process.env.USER);

  let options = { gasPrice: 1000000000, gasLimit: 6721900 };

  let response = await hmyManagerContract.methods
    .burnToken(oneTokenAddr, amount, userAddr)
    .send(options);
  return response.transaction.id;
}

module.exports = {
  mintHRC20,
  checkHmyBalance,
  getMappingFor,
  approveHmyManger,
  addToken,
  mintToken,
  burnToken,
};
