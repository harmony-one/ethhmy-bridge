require("dotenv").config();
const Web3 = require('web3');
const { deployERC20, deployEthManager } = require("./deploy_eth");
const {
  mintERC20,
  checkEthBalance,
  approveEthManger,
  lockToken,
  unlockToken,
} = require("./eth");

(async function () {
  const userAddr = "0x84a81991ceC1Aa5f0770D7a5639E632e513298C4";
  const amount = 100;
  let erc20 = await deployERC20();
  let ethManager = await deployEthManager(erc20);
  console.log("balance: " + (await checkEthBalance(erc20, userAddr)));
  await mintERC20(erc20, userAddr, amount);
  console.log(
    "balance after minting: " + (await checkEthBalance(erc20, userAddr))
  );
  await approveEthManger(erc20, ethManager, amount);
  await lockToken(ethManager, userAddr, amount);
  console.log(
    "balance after locking: " + (await checkEthBalance(erc20, userAddr))
  );
  const receiptId = (new Web3(process.env.ETH_NODE_URL)).utils.fromAscii("abc");
  await unlockToken(ethManager, userAddr, amount, receiptId);
  console.log(
    "balance after unlocking: " + (await checkEthBalance(erc20, userAddr))
  );
})();
