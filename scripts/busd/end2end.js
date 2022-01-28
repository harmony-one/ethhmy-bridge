require("dotenv").config();
const Web3 = require("web3");
const {deployBUSD, deployBUSDEthManager} = require("./deploy_eth");
const {deployBUSDHmy, deployBUSDHmyManager} = require("./deploy_hmy");
const {deployTokenManager, deployNFTV2TokenManager, approveHmyMangerTokenManager} = require("../lib");
const {sleep, BLOCK_TO_FINALITY, AVG_BLOCK_TIME} = require("../utils");
const {
    initBUSDEth,
    checkEthBalance,
    mintBUSD,
    approveEthManger,
    lockToken,
    lockTokenFor,
    unlockToken,
} = require("./eth");
const {
    initBUSDHmy,
    setSupplyControllerBUSDHmy,
    checkHmyBalance,
    approveHmyManger,
    registerToken,
    mintToken,
    burnToken,
} = require("./hmy");

const web3 = new Web3(process.env.ETH_NODE_URL);

(async function () {
    const userAddr = process.env.ETH_USER;
    const amount = "5000000000000000000";

    // deploy eth contracts
    // let busd = await deployBUSD();
    const busd = "0xb0e18106520d05adA2C7fcB1a95f7db5e3f28345";
    // await initBUSDEth(busd);
    //let ethManager = await deployBUSDEthManager(busd);
    const ethManager = "0xcc71cCec8650fa19CbF3ebe21f19C839969d80c2";
    // deploy harmony contracts
    // let busdHmy = await deployBUSDHmy();
    // await initBUSDHmy(busdHmy);

    // deploy token manager
    // let tokenManagerAddr = await deployTokenManager();

    let tokenManagerAddr = await deployNFTV2TokenManager();

    // deploy hmyManager
    // let hmyManager = await deployBUSDHmyManager(busdHmy);
    // await setSupplyControllerBUSDHmy(busdHmy, hmyManager);

    // approve hmyManager to register token
    // await approveHmyMangerTokenManager(tokenManagerAddr, hmyManager);

    // hmyManager register token
    // await registerToken(hmyManager, tokenManagerAddr, busd);

    // check eth balance before transfer
    console.log(
        "Eth balance of " +
        userAddr +
        ": " +
        (await checkEthBalance(busd, userAddr))
    );

    // check hmy recipient balance
    // console.log(
    //   "Hmy balance of " +
    //     process.env.USER +
    //     " before eth2hmy: " +
    //     (await checkHmyBalance(busdHmy, process.env.USER))
    // );

    // let's mint some tokens for transfer on the eth side
    // await mintBUSD(busd, userAddr, amount);
    // console.log(
    //   "Eth balance of " +
    //     userAddr +
    //     " after minting: " +
    //     (await checkEthBalance(busd, userAddr))
    // );

    // user approve eth manager to lock tokens
    // await approveEthManger(busd, ethManager, amount);

    // wait sufficient to confirm the transaction went through
    // const lockedEvent = await lockTokenFor(ethManager, userAddr, amount, process.env.ETH_USER);
    // console.log("lockedEvent: " + lockedEvent);

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
    //
    // console.log(
    //   "Eth balance of " +
    //     userAddr +
    //     " after locking: " +
    //     (await checkEthBalance(busd, userAddr))
    // );
    //
    // const recipient = lockedEvent.returnValues.recipient;
    //
    // await mintToken(hmyManager, recipient, amount, lockedEvent.transactionHash);
    // console.log(
    //   "Hmy balance of " +
    //     recipient +
    //     " after eth2hmy: " +
    //     (await checkHmyBalance(busdHmy, recipient))
    // );
    //
    // // check hmy recipient balance
    // console.log(
    //   "Hmy balance of " +
    //     process.env.USER +
    //     " before hmy2eth: " +
    //     (await checkHmyBalance(busdHmy, process.env.USER))
    // );
    //
    // // check eth balance before transfer
    // console.log(
    //   "Eth balance of " +
    //     userAddr +
    //     ": " +
    //     (await checkEthBalance(busd, userAddr))
    // );
    //
    // // user needs to approve hmy manager to burn token
    // await approveHmyManger(busdHmy, hmyManager, amount);
    //
    // // hmy burn tokens, transaction is confirmed instantaneously, no need to wait
    // let txHash = await burnToken(hmyManager, userAddr, amount);
    // console.log(
    //   "Hmy balance of " +
    //     process.env.USER +
    //     " after burning: " +
    //     (await checkHmyBalance(busdHmy, process.env.USER))
    // );
    //
    // await unlockToken(ethManager, userAddr, amount, "0x3ad02b841a44f072ce99c98ce661ae3441b103148c99909f88e90c9d77ad82d1");
    // console.log(
    //   "Eth balance of " +
    //     userAddr +
    //     " after unlocking: " +
    //     (await checkEthBalance(busd, userAddr))
    // );
    process.exit(0);
})();
