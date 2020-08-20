require("dotenv").config();
const Web3 = require("web3");
const { deployERC20, deployEthManager } = require("./deploy_eth");
const { deployHRC20, deployHmyManager } = require("./deploy_hmy");
const {sleep, BLOCK_TO_FINALITY, AVG_BLOCK_TIME} = require("../utils");
const {
  mintERC20,
  checkEthBalance,
  approveEthManger,
  lockToken,
  unlockToken,
} = require("./eth");
const {
  checkHmyBalance,
  approveHmyManger,
  mintToken,
  burnToken,
} = require("./hmy");

const web3 = new Web3(process.env.ETH_NODE_URL);

(async function () {
  const userAddr = process.env.ETH_USER;
  const amount = 100;

  // deploy eth contracts
  let erc20 = await deployERC20();
  let ethManager = await deployEthManager(erc20);

  // deploy harmony contracts
  let hrc20Addr = await deployHRC20();
  let hmyManager = await deployHmyManager(hrc20Addr);
  await approveHmyManger(hrc20Addr, hmyManager);

  // check eth balance before transfer
  console.log(
    "Eth balance of " +
      userAddr +
      ": " +
      (await checkEthBalance(erc20, userAddr))
  );

  // check hmy recipient balance
  console.log(
    "Hmy balance of " +
      process.env.USER +
      " before eth2hmy: " +
      (await checkHmyBalance(hrc20Addr, process.env.USER))
  );

  // let's mint some tokens for transfer on the eth side
  await mintERC20(erc20, userAddr, amount);
  console.log(
    "Eth balance of " +
      userAddr +
      " after minting: " +
      (await checkEthBalance(erc20, userAddr))
  );

  // user approve eth manager to lock tokens
  await approveEthManger(erc20, ethManager, amount);

  // wait sufficient to confirm the transaction went through
  const lockedEvent = await lockToken(ethManager, process.env.USER, amount);
  
  // const expectedBlockNumber = lockedEvent.blockNumber + BLOCK_TO_FINALITY;
  // while (true) {
  //   let blockNumber = await web3.eth.getBlockNumber();
  //   if (blockNumber <= expectedBlockNumber) {
  //     console.log(
  //       `Currently at block ${blockNumber}, waiting for block ${expectedBlockNumber} to be confirmed`
  //     );
  //     await sleep(AVG_BLOCK_TIME);
  //   } else {
  //     break;
  //   }
  // }

  console.log(
    "Eth balance of " +
      userAddr +
      " after locking: " +
      (await checkEthBalance(erc20, userAddr))
  );

  const recipient = lockedEvent.returnValues.recipient;
  
  await mintToken(hmyManager, recipient, amount, lockedEvent.transactionHash);
  console.log(
    "Hmy balance of " +
      recipient +
      " after eth2hmy: " +
      (await checkHmyBalance(hrc20Addr, recipient))
  );

  // let's mint some tokens for user in hrc20
  // await mintHRC20(hrc20Addr, process.env.USER, amount);

  // check hmy recipient balance
  console.log(
    "Hmy balance of " +
      process.env.USER +
      " before hmy2eth: " +
      (await checkHmyBalance(hrc20Addr, process.env.USER))
  );

  // check eth balance before transfer
  console.log(
    "Eth balance of " +
      userAddr +
      ": " +
      (await checkEthBalance(erc20, userAddr))
  );

  // hmy burn tokens, transaction is confirmed instantaneously, no need to wait
  let txHash = await burnToken(hmyManager, userAddr, amount);
  console.log(
    "Hmy balance of " +
      process.env.USER +
      " after burning: " +
      (await checkHmyBalance(hrc20Addr, process.env.USER))
  );

  await unlockToken(ethManager, userAddr, amount, txHash);
  console.log(
    "Eth balance of " +
      userAddr +
      " after unlocking: " +
      (await checkEthBalance(erc20, userAddr))
  );
  process.exit(0);
})();
