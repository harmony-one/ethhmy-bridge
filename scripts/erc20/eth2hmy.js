require("dotenv").config();
const { deployERC20, deployEthManager } = require("./deploy_eth");
const { deployHRC20, deployHmyManager } = require("./deploy_hmy");
// const confirmEtherTransaction = require("./confirm_eth");
const {
  mintERC20,
  checkEthBalance,
  approveEthManger,
  lockToken,
} = require("./eth");
const {
  checkHmyBalance,
  approveHmyManger,
  mintToken,
} = require("./hmy");

(async function () {
  const userAddr = "0x84a81991ceC1Aa5f0770D7a5639E632e513298C4";
  const amount = 100;

  // deploy eth contracts
  let erc20 = await deployERC20();
  let ethManager = await deployEthManager(erc20);

  // deploy harmony contracts
  let hrc20Addr = await deployHRC20();
  let hmyManager = await deployHmyManager(hrc20Addr);
  await approveHmyManger(hrc20Addr, hmyManager);

  // check eth balance before transfer
  console.log("Eth balance of " + userAddr + ": " + (await checkEthBalance(erc20, userAddr)));

  // check hmy recipient balance
  console.log(
    "Hmy balance of " + process.env.USER + " before transfer: " +
      (await checkHmyBalance(hrc20Addr, process.env.USER))
  );

  // let's mint some tokens for transfer on the eth side
  await mintERC20(erc20, userAddr, amount);
  console.log(
    "Eth balance of " + userAddr + " after minting: " + (await checkEthBalance(erc20, userAddr))
  );

  // user approve eth manager to lock tokens
  await approveEthManger(erc20, ethManager, amount);

  // wait sufficient to confirm the transaction went through
  const lockedEvent = await lockToken(ethManager, process.env.USER, amount);
  // confirmEtherTransaction(lockedEvent.transactionHash); TODO: commented for localnet testing

  console.log(
    "Eth balance of " + userAddr + " after locking: " + (await checkEthBalance(erc20, userAddr))
  );

  const recipient = lockedEvent.returnValues.recipient;
  await mintToken(hmyManager, recipient, amount, lockedEvent.transactionHash);
  console.log(
    "Hmy balance of " + recipient + " after transfer: " +
      (await checkHmyBalance(hrc20Addr, recipient))
  );
  process.exit(0);
})();
