require("dotenv").config();
const Web3 = require("web3");
const BN = require("bn.js");
const { Harmony } = require("@harmony-js/core");
const { ChainID, ChainType } = require("@harmony-js/utils");
const hmy = new Harmony(process.env.HMY_NODE_URL, {
  chainType: ChainType.Harmony,
  chainId: ChainID.HmyTestnet,
});
hmy.wallet.addByPrivateKey(process.env.PRIVATE_KEY);
hmy.wallet.addByPrivateKey(process.env.HMY_OWNER_PRIVATE_KEY);

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

async function deployMultiSigWallet(owners, required) {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const contractJson = require("../build/contracts/MultiSigWallet.json");
  const contract = new web3.eth.Contract(contractJson.abi);
  const txContract = await contract
    .deploy({
      data: contractJson.bytecode,
      arguments: [owners, required]
    })
    .send({
      from: ethMasterAccount,
      gas: process.env.ETH_GAS_LIMIT,
      gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
    });
  const addr = `${txContract.options.address}`;
  console.log("Deployed MultiSigWallet contract to", addr);
  return addr;
}

async function deployMultiSigWalletHmy(owners, required) {
  const contractJson = require("../build/contracts/MultiSigWallet.json");
  let contract = hmy.contracts.createContract(contractJson.abi);
  contract.wallet.setSigner(process.env.ADMIN);
  let deployOptions = {
    data: contractJson.bytecode,
    arguments: [owners, required],
  };

  let options = {
    gasPrice: 1000000000,
    gasLimit: 6721900,
  };

  let response = await contract.methods
    .contractConstructor(deployOptions)
    .send(options);
  const addr = response.transaction.receipt.contractAddress;
  console.log("MultiSigWallet contract deployed at " + addr);
  return addr;
}

async function submitTx(contractAddr, destination, value, data) {
  const web3 = new Web3(process.env.ETH_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_OWNER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const contractJson = require("../build/contracts/MultiSigWallet.json");
  const contract = new web3.eth.Contract(contractJson.abi, contractAddr);
  return await contract.methods.submitTransaction(destination, value, data).send({
    from: ethMasterAccount,
    gas: process.env.ETH_GAS_LIMIT,
    gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
  });
}

async function submitTxHmy(contractAddr, destination, value, data) {
  const contractJson = require("../build/contracts/MultiSigWallet.json");
  let contract = hmy.contracts.createContract(contractJson.abi, contractAddr);
  contract.wallet.setSigner(process.env.HMY_OWNER);
  let options = { gasPrice: 1000000000, gasLimit: 6721900 };
  let res = await contract.methods.submitTransaction(destination, value, data).send(options);
  if (res.status == 'rejected') {
    throw "transaction failed!!!";
  }
  return res;
}

module.exports = {
  deployTokenManager,
  approveHmyMangerTokenManager,
  checkEthAuthorization,
  checkHmyAuthorization,
  deployMultiSigWallet,
  deployMultiSigWalletHmy,
  submitTx,
  submitTxHmy
};
