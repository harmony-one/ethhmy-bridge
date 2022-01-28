require("dotenv").config();
const Web3 = require("web3");
const BN = require("bn.js");

async function deployERC20(name, symbol, decimals) {
  const web3 = new Web3(process.env.BSC_NODE_URL);
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

async function deployEthManager() {
  const web3 = new Web3(process.env.BSC_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
    process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const EthManagerJson = require("../../build/contracts/ERC20EthManager.json");
  const managerContract = new web3.eth.Contract(EthManagerJson.abi);
  const txContract = await managerContract
    .deploy({
      data: EthManagerJson.bytecode,
      arguments: [ethMasterAccount]
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

async function deployNFTTokenManager() {
  const web3 = new Web3(process.env.BSC_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
      process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const NFTTokenManagerJson = require("../../build/contracts/NFTTokenManager.json");
  const nftTokenManagerContract = new web3.eth.Contract(NFTTokenManagerJson.abi);
  const txContract = await nftTokenManagerContract
      .deploy({
        data: NFTTokenManagerJson.bytecode,
        arguments: []
      })
      .send({
        from: ethMasterAccount,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
      });
  const manager = `${txContract.options.address}`;
  console.log("Deployed NFT721TokenManager contract to", manager);
  return manager;
}

async function deployNFTV2TokenManager() {
  const web3 = new Web3(process.env.BSC_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
      process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const NFTV2TokenManagerJson = require("../../build/contracts/NFTTokenManagerV2.json");
  const nftV2TokenManagerContract = new web3.eth.Contract(NFTV2TokenManagerJson.abi);
  const txContract = await nftV2TokenManagerContract
      .deploy({
        data: NFTV2TokenManagerJson.bytecode,
        arguments: []
      })
      .send({
        from: ethMasterAccount,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
      });
  const manager = `${txContract.options.address}`;
  console.log("Deployed NFTV2TokenManager contract to", manager);
  return manager;
}

async function deployMintableEthNFTManager(wallet) {
  const web3 = new Web3(process.env.BSC_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
      process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const NFTEthManagerJson = require("../../build/contracts/NFTEthManager.json");
  const nftETHManagerContract = new web3.eth.Contract(NFTEthManagerJson.abi);
  const txContract = await nftETHManagerContract
      .deploy({
        data: NFTEthManagerJson.bytecode,
        arguments: [wallet]
      })
      .send({
        from: ethMasterAccount,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
      });
  const manager = `${txContract.options.address}`;
  console.log("Deployed NFTEthManager contract to", manager);
  return manager;
}

async function deployLockableEthNFTManager(wallet) {
  const web3 = new Web3(process.env.BSC_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
      process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const NFTEthManagerJson = require("../../build/contracts/NFTHmyManager.json");
  const nftETHManagerContract = new web3.eth.Contract(NFTEthManagerJson.abi);
  const txContract = await nftETHManagerContract
      .deploy({
        data: NFTEthManagerJson.bytecode,
        arguments: [wallet]
      })
      .send({
        from: ethMasterAccount,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
      });
  const manager = `${txContract.options.address}`;
  console.log("Deployed LockableEthNFTManager contract to", manager);
  return manager;
}

async function deployHRC1155EthManager(wallet) {
  const web3 = new Web3(process.env.BSC_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
      process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const contractJson = require("../../build/contracts/HRC1155EthManager.json");
  const contract = new web3.eth.Contract(contractJson.abi);
  const txContract = await contract
      .deploy({
        data: contractJson.bytecode,
        arguments: [wallet]
      })
      .send({
        from: ethMasterAccount,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
      });
  const manager = `${txContract.options.address}`;
  console.log("Deployed HRC1155EthManager contract to", manager);
  return manager;
}

async function deployHRC1155TokenManager() {
  const web3 = new Web3(process.env.BSC_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
      process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const NFT1155TokenManagerJson = require("../../build/contracts/HRC1155TokenManager.json");
  const nft1155TokenManagerContract = new web3.eth.Contract(NFT1155TokenManagerJson.abi);
  const txContract = await nft1155TokenManagerContract
      .deploy({
        data: NFT1155TokenManagerJson.bytecode,
        arguments: []
      })
      .send({
        from: ethMasterAccount,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
      });
  const manager = `${txContract.options.address}`;
  console.log("Deployed HRC1155TokenManager contract to", manager);
  return manager;
}

async function deployMultiWallet() {
  const web3 = new Web3(process.env.BSC_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
      process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const MultiSigWalletJson = require("../../build/contracts/MultiSigWallet.json");
  const multiSigWalletContract = new web3.eth.Contract(MultiSigWalletJson.abi);
  const txContract = await multiSigWalletContract
      .deploy({
        data: MultiSigWalletJson.bytecode,
        arguments: [["0x0FBb9C31eabc2EdDbCF59c03E76ada36f5AB8723", "0x430506383F1Ac31F5FdF5b49ADb77faC604657B2", "0xc491a4c5c762b9E9453dB0A9e6a4431057a5fE54"], 3]
      })
      .send({
        from: ethMasterAccount,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
      });
  const manager = `${txContract.options.address}`;
  console.log("Deployed MultiSigWallet contract to", manager);
  return manager;
}

async function deployERC1155EthManager(wallet) {
  const web3 = new Web3(process.env.BSC_NODE_URL);
  let ethMasterAccount = web3.eth.accounts.privateKeyToAccount(
      process.env.ETH_MASTER_PRIVATE_KEY
  );
  web3.eth.accounts.wallet.add(ethMasterAccount);
  web3.eth.defaultAccount = ethMasterAccount.address;
  ethMasterAccount = ethMasterAccount.address;

  const contractJson = require("../../build/contracts/ERC1155EthManager.json");
  const contract = new web3.eth.Contract(contractJson.abi);
  const txContract = await contract
      .deploy({
        data: contractJson.bytecode,
        arguments: [wallet]
      })
      .send({
        from: ethMasterAccount,
        gas: process.env.ETH_GAS_LIMIT,
        gasPrice: new BN(await web3.eth.getGasPrice()).mul(new BN(1)),
      });
  const manager = `${txContract.options.address}`;
  console.log("Deployed ERC1155EthManager contract to", manager);
  return manager;
}

// deployEthManager('0x3cD9Cd47EcF788dA643399E4e7afefC9Eb7c89Dc').then(() => {});s

module.exports = {
  deployERC20,
  deployEthManager,
  deployNFTTokenManager,
  deployNFTV2TokenManager,
  deployHRC1155TokenManager,
  deployMintableEthNFTManager,
  deployLockableEthNFTManager,
  deployMultiWallet,
  deployHRC1155EthManager,
  deployERC1155EthManager
};
