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
  const erc20ContractJson = require("../build/contracts/MyERC20.json");
  let erc20Contract = hmy.contracts.createContract(
    erc20ContractJson.abi,
    contractAddr
  );
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };
  await erc20Contract.methods.mint(accountAddr, amount).send(options);
}

async function checkHmyBalance(contract, addr) {
  const erc20ContractJson = require("../build/contracts/MyERC20.json");
  let erc20Contract = hmy.contracts.createContract(
    erc20ContractJson.abi,
    contract
  );
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };
  let res = await erc20Contract.methods.balanceOf(addr).call(options);
  return res;
}

async function approveHmyManger(contract, addr) {
  const erc20ContractJson = require("../build/contracts/MyERC20.json");
  let erc20Contract = hmy.contracts.createContract(
    erc20ContractJson.abi,
    contract
  );
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };
  await erc20Contract.methods.rely(addr).send(options);
}

async function mintToken(managerAddr, userAddr, amount, receiptId) {
  const hmyManagerJson = require("../build/contracts/HmyManager.json");
  let hmyManagerContract = hmy.contracts.createContract(
    hmyManagerJson.abi,
    managerAddr
  );
  hmyManagerContract.wallet.setSigner(process.env.ADMIN);

  let options = { gasPrice: 1000000000, gasLimit: 6721900 };

  await hmyManagerContract.methods
    .mintToken(amount, userAddr, receiptId)
    .send(options);
}

async function burnToken(managerAddr, userAddr, amount) {
  const hmyManagerJson = require("../build/contracts/HmyManager.json");
  let hmyManagerContract = hmy.contracts.createContract(
    hmyManagerJson.abi,
    managerAddr
  );
  hmyManagerContract.wallet.setSigner(process.env.USER);

  let options = { gasPrice: 1000000000, gasLimit: 6721900 };

  let response = await hmyManagerContract.methods
    .burnToken(amount, userAddr)
    .send(options);
  return response.transaction.id;
}

module.exports = {
  mintHRC20,
  checkHmyBalance,
  approveHmyManger,
  mintToken,
  burnToken,
};
