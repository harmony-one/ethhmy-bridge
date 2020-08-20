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
let options = { gasPrice: 1000000000, gasLimit: 6721900 };

async function checkHmyBalance(contract, addr) {
  const linkJson = require("../../out/LinkToken.json");
  let linkContract = hmy.contracts.createContract(
    linkJson.abi,
    contract
  );
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };
  let res = await linkContract.methods.balanceOf(addr).call(options);
  return res;
}

async function mintLINKHmy(contractAddr, accountAddr, amount) {
  const linkJson = require("../../out/LinkToken.json");
  let linkContract = hmy.contracts.createContract(
    linkJson.abi,
    contractAddr
  );
  linkContract.wallet.setSigner(process.env.ADMIN);
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };
  await linkContract.methods.transfer(accountAddr, amount).send(options);
}

async function approveHmyManger(contractAddr, managerAddr, amount) {
  const linkJson = require("../../out/LinkToken.json");
  let linkContract = hmy.contracts.createContract(
    linkJson.abi,
    contractAddr
  );
  linkContract.wallet.setSigner(process.env.USER);
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };
  await linkContract.methods.approve(managerAddr, amount).send(options);
}

async function mintToken(managerAddr, userAddr, amount, receiptId) {
  const hmyManagerJson = require("../../build/contracts/LINKHmyManager.json");
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
  const hmyManagerJson = require("../../build/contracts/LINKHmyManager.json");
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
  checkHmyBalance,
  mintLINKHmy,
  approveHmyManger,
  mintToken,
  burnToken,
};
