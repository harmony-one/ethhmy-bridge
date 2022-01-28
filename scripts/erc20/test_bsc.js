require("dotenv").config();
const Web3 = require("web3");
const {
    deployERC20,
    deployEthManager,
    deployNFTTokenManager,
    deployNFTV2TokenManager,
    deployMintableEthNFTManager,
    deployLockableEthNFTManager,
    deployMultiWallet,
    deployHRC1155EthManager,
    deployHRC1155TokenManager,
    deployERC1155EthManager
} = require("./deploy_bsc");
const {sleep, BLOCK_TO_FINALITY, AVG_BLOCK_TIME} = require("../utils");
const {
    mintERC20,
    checkEthBalance,
    approveEthManger,
    lockToken,
    unlockToken,
    relyNFTTokenManger,
    relyHRC1155TokenManger,
} = require("./bsc");
const web3 = new Web3(process.env.BSC_NODE_URL);

(async function () {
    const target = "bep1155";
    const userAddr = process.env.ETH_USER_1155;
    const masterAddr = process.env.ETH_MASTER;
    const multiSigWallet = "0x310336b9EBc8291f2Fde665145110d2ace555a13";

    // let multiWallet = await deployMultiWallet();

    // return;
    /** ==== HRC 721 === */
    if (target === "hrc721") {
        // HRC721TokenManager
        let hRC721TokenManager = await deployNFTTokenManager();

        // HRC721BscManager
        let hRC721BscManager = await deployMintableEthNFTManager(multiSigWallet);

        // rely manager
        await relyNFTTokenManger(hRC721TokenManager, hRC721BscManager);
    }
    /** ==== HRC 721 === */

    /** ==== BEP 721 === */
    if (target === "bep721") {
        // BEP721BscManager
        let bEP721BscManager = await deployLockableEthNFTManager(multiSigWallet);
    }
    /** ==== BEP 721 === */

    /** ==== HRC 1155 === */
    if (target === "hrc1155") {
        // HRC1155TokenManager
        let hRC1155TokenManager = await deployHRC1155TokenManager();

        // HRC1155EthManager
        let hRC1155EthManager = await deployHRC1155EthManager(multiSigWallet);

        // rely manager
        await relyHRC1155TokenManger(hRC1155TokenManager, hRC1155EthManager);
    }
    /** ==== HRC 1155 === */

    /** ==== BRP 1155 === */
    if (target === "bep1155") {
        // ERC1155EthManager
        let eRC1155HmyManager = await deployERC1155EthManager(multiSigWallet);
    }
    /** ==== BRP 1155 === */
    process.exit(0);

    // const amount = 100;
    // let erc20 = await deployERC20("MyERC20 first", "MyERC20-1", 18);
    // let ethManager = await deployEthManager();

    // let ethNFTManager = await deployEthNFTManager("0x4D2F08369476F21D4DEB834b6EA9c41ACAd11413");

    // let multiWallet = await deployMultiWallet();

    // let nftTokenManager = await deployNFTTokenManager();

    // let nftV2TokenManager = await deployNFTV2TokenManager();

    // let nft1155TokenManager = await deployNFT1155TokenManager();

    // let rely = await relyNFTTokenManger("0x66e531be7251c8225e8f6ce97a9Aa1Ff2A05613c", "0x4500Bbc8e248629C20F0b87F865eD1C8649572B9");

    // let rely = await relyNFT1155TokenManger("0x561cCF7C7d1aFCf9C6E5Ef553f8e1289e75D7e6B", "0x4500Bbc8e248629C20F0b87F865eD1C8649572B9");
    // console.log("balance: " + (await checkEthBalance(erc20, userAddr)));

    // await mintERC20(erc20, userAddr, amount);
    // console.log(
    //   "balance after minting: " + (await checkEthBalance(erc20, userAddr))
    // );
    // await approveEthManger(erc20, ethManager, amount);
    // let lockedEvent = await lockToken(ethManager, erc20, userAddr, amount);
    // console.log(
    //   "balance after locking: " + (await checkEthBalance(erc20, userAddr))
    // );

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

    // const receiptId = new Web3(process.env.ETH_NODE_URL).utils.fromAscii("abc");
    // await unlockToken(ethManager, erc20, userAddr, amount, receiptId);
    // console.log(
    //   "balance after unlocking: " + (await checkEthBalance(erc20, userAddr))
    // );
})();
