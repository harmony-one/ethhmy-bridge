require("dotenv").config();
const {Harmony} = require("@harmony-js/core");
const {ChainID, ChainType} = require("@harmony-js/utils");
const {toUtf8Bytes} = require("@harmony-js/contract");
const {hexlify} = require("@harmony-js/crypto");
const {
    checkHmyBalance,
    approveHmyManger,
    getMappingFor,
    addToken,
    mintToken,
    burnToken,
    getManagerWallet,
    relyERC1155TokenManger,
    relyBridgeAirdrop
} = require("./hmy");
const {tokenDetails} = require("./eth");
const {
    deployHmyManager,
    deployHmyMultiSigWallet,
    deployHRC1155HmyManager,
    deployERC1155TokenManager,
    deployERC1155HmyManager,
    deployBridgeAirdrop,
    deployLockableHmyNFTManager,
    deployMintableNFTManager
} = require("./deploy_hmy");
const {deployTokenManager, approveHmyMangerTokenManager, deployNFTTokenManager, approveHmyMangerNFTTokenManager} = require("../lib");
const hmy = new Harmony(process.env.HMY_NODE_URL, {
    chainType: ChainType.Harmony,
    chainId: Number(process.env.HMY_CHAIN_ID),
});
hmy.wallet.addByPrivateKey(process.env.HMY_PRIVATE_KEY);
hmy.wallet.addByPrivateKey(process.env.HMY_PRIVATE_KEY_USER);

(async function () {
    const target = "none";
    const userAddr = process.env.HMY_USER;
    const masterAddr = process.env.HMY_MASTER;
    const multiSigWallet = "0x5705dd3530bf7dd82c14aa3a949941970f157bc7";

    // return;
    /** ==== HRC 721 === */
    if (target === "hrc721" || target === "all") {
        // HRC721HMYManager
        let managerAddr = await deployLockableHmyNFTManager(multiSigWallet);
    }
    /** ==== HRC 721 === */

    /** ==== ETH 721 === */
    if (target === "erc721" || target === "all") {
        // ERC721HMYTokenManager
        let nftTokenManagerAddr = await deployNFTTokenManager();

        // ERC721HMYManager
        let managerAddr = await deployMintableNFTManager(multiSigWallet);

        // rely manager
        await approveHmyMangerNFTTokenManager(nftTokenManagerAddr, managerAddr);
    }
    /** ==== ETH 721 === */

    /** ==== HRC 1155 === */
    if (target === "hrc1155" || target === "all") {
        // HRC1155EthManager
        let hRC1155HmyManager = await deployHRC1155HmyManager(multiSigWallet);
    }
    /** ==== HRC 1155 === */
    /** ==== ERC 1155 === */
    if (target === "erc1155" || target === "all") {
        // ERC1155TokenManager
        let eRC1155TokenManager = await deployERC1155TokenManager();

        // ERC1155EthManager
        let eRC1155EthManager = await deployERC1155HmyManager(multiSigWallet);

        // rely manager
        await relyERC1155TokenManger(eRC1155TokenManager, eRC1155EthManager);
    }
    /** ==== ERC 1155 === */

    // BridgeAirdrop
    // let bridgeAirdrop = await deployBridgeAirdrop();
    // await relyERC1155TokenManger(bridgeAirdrop, "0xd76DCbFc77069B3c4C46c32f101217F8Bb81Acd2");

    process.exit(0);

    // const amount = 100;
    // const erc20TokenAddr = "0x061941D4F007291713ab52D644705D30DFC34D2E";
    // let tokenManagerAddr = await deployTokenManager();
    // let managerAddr = await deployHmyManager();

    // let managerAddr = await deployLockableHmyNFTManager("0x5705dd3530bf7dd82c14aa3a949941970f157bc7");

    // let multiSigWallet = await deployHmyMultiSigWallet();

    // let managerWallet = await getManagerWallet("0x5705dd3530bf7dd82c14aa3a949941970f157bc7");
    // console.log('managerWallet: ', managerWallet);

    // // approve manager to call permission token manager methods
    // await approveHmyMangerTokenManager(tokenManagerAddr, managerAddr);
    // // register erc20Token to token manager
    // const [name, symbol, decimals] = await tokenDetails(erc20TokenAddr);
    // await addToken(managerAddr, tokenManagerAddr, erc20TokenAddr, name, symbol, decimals);
    // // get the oneTokenAddr from token manager, also available in event
    // let oneTokenAddr = await getMappingFor(managerAddr, erc20TokenAddr);
    // console.log("added token", oneTokenAddr);
    // console.log("balance: " + (await checkHmyBalance(oneTokenAddr, userAddr)));
    // // await approveHmyManger(oneTokenAddr, managerAddr);
    // const receiptId = hexlify(toUtf8Bytes("abc"));
    // await mintToken(managerAddr, oneTokenAddr, userAddr, amount, receiptId);
    // console.log(
    //   "balance after minting: " + (await checkHmyBalance(oneTokenAddr, userAddr))
    // );
    // await approveHmyManger(oneTokenAddr, managerAddr, amount);
    // await burnToken(managerAddr, oneTokenAddr, userAddr, amount);
    // console.log(
    //   "balance after burning: " + (await checkHmyBalance(oneTokenAddr, userAddr))
    // );
    process.exit(0);
})();
