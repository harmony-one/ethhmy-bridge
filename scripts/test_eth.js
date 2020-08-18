require("dotenv").config();
const Web3 = require("web3");
const { deployERC20, deployEthManager } = require("./deploy_eth");
const {sleep, BLOCK_TO_FINALITY, AVG_BLOCK_TIME} = require("./utils");
const {
  mintERC20,
  checkEthBalance,
  approveEthManger,
  lockToken,
  unlockToken,
} = require("./eth");
const web3 = new Web3(process.env.ETH_NODE_URL);
(async function () {
  const userAddr = process.env.ETH_USER;
  const amount = 100;
  let erc20 = await deployERC20();
  let ethManager = await deployEthManager(erc20);
  console.log("balance: " + (await checkEthBalance(erc20, userAddr)));
  await mintERC20(erc20, userAddr, amount);
  console.log(
    "balance after minting: " + (await checkEthBalance(erc20, userAddr))
  );
  await approveEthManger(erc20, ethManager, amount);
  let lockedEvent = await lockToken(ethManager, userAddr, amount);
  console.log(
    "balance after locking: " + (await checkEthBalance(erc20, userAddr))
  );
  
  const expectedBlockNumber = lockedEvent.blockNumber + BLOCK_TO_FINALITY;
  while (true) {
    let blockNumber = await web3.eth.getBlockNumber();
    if (blockNumber <= expectedBlockNumber) {
      console.log(
        `Currently at block ${blockNumber}, waiting for block ${expectedBlockNumber} to be confirmed`
      );
      await sleep(AVG_BLOCK_TIME);
    } else {
      break;
    }
  }
  
  const receiptId = new Web3(process.env.ETH_NODE_URL).utils.fromAscii("abc");
  await unlockToken(ethManager, userAddr, amount, receiptId);
  console.log(
    "balance after unlocking: " + (await checkEthBalance(erc20, userAddr))
  );
})();
