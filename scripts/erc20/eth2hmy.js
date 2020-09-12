require("dotenv").config();
const { deployERC20, deployEthManager } = require("./deploy_eth");
const { deployHmyManager } = require("./deploy_hmy");
const { deployTokenManager, approveHmyMangerTokenManager } = require("../lib");
// const confirmEtherTransaction = require("./confirm_eth");
const {
  mintERC20,
  checkEthBalance,
  tokenDetails,
  approveEthManger,
  lockToken,
} = require("./eth");
const {
  checkHmyBalance,
  addToken,
  getMappingFor,
  mintToken,
} = require("./hmy");

(async function () {
  const userAddr = process.env.ETH_USER;
  const amount = 100;

  // deploy eth contracts
  let erc20 = await deployERC20("MyERC20 first", "MyERC20-1", 18);
  let ethManager = await deployEthManager();

  // deploy harmony contracts
  let tokenManagerAddr = await deployTokenManager();
  let hmyManager = await deployHmyManager();
  await approveHmyMangerTokenManager(tokenManagerAddr, hmyManager);

  // register erc20Token with token manager
  const [name, symbol, decimals] = await tokenDetails(erc20);
  await addToken(hmyManager, tokenManagerAddr, erc20, name, symbol, decimals);
  let hrc20Addr = await getMappingFor(hmyManager, erc20);
  console.log("added token", hrc20Addr);

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
  const lockedEvent = await lockToken(ethManager, erc20, process.env.USER, amount);
  // confirmEtherTransaction(lockedEvent.transactionHash); TODO: commented for localnet testing

  console.log(
    "Eth balance of " + userAddr + " after locking: " + (await checkEthBalance(erc20, userAddr))
  );

  const recipient = lockedEvent.returnValues.recipient;
  await mintToken(hmyManager, hrc20Addr, recipient, amount, lockedEvent.transactionHash);
  console.log(
    "Hmy balance of " + recipient + " after transfer: " +
      (await checkHmyBalance(hrc20Addr, recipient))
  );
  process.exit(0);
})();
