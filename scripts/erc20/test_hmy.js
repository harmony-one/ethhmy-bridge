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
} = require("./hmy");
const {tokenDetails} = require("./eth");
const {
    deployHmyManager,
    deployHmyNFTManager,
    deployHmyMultiSigWallet,
    deployHRC1155HmyManager,
    deployERC1155TokenManager,
    deployERC1155HmyManager
} = require("./deploy_hmy");
const {deployTokenManager, approveHmyMangerTokenManager} = require("../lib");
const hmy = new Harmony(process.env.HMY_NODE_URL, {
    chainType: ChainType.Harmony,
    chainId: Number(process.env.HMY_CHAIN_ID),
});
hmy.wallet.addByPrivateKey(process.env.HMY_PRIVATE_KEY);
hmy.wallet.addByPrivateKey(process.env.HMY_PRIVATE_KEY_USER);

(async function () {
    const userAddr = process.env.HMY_USER;
    const masterAddr = process.env.HMY_MASTER;
    const multiSigWallet = "0x5705dd3530bf7dd82c14aa3a949941970f157bc7";

    // return;
    /** ==== HRC 1155 === */
    // HRC1155EthManager
    // let hRC1155HmyManager = await deployHRC1155HmyManager(multiSigWallet);


    /** ==== HRC 1155 === */
    /** ==== ERC 1155 === */
    // ERC1155TokenManager
    // let eRC1155TokenManager = await deployERC1155TokenManager();

    // ERC1155EthManager
    // let eRC1155EthManager = await deployERC1155HmyManager(multiSigWallet);

    // rely manager
    // await relyERC1155TokenManger(eRC1155TokenManager, eRC1155EthManager);
    await relyERC1155TokenManger("0xf7d9bb030cc9ca461082c207bb094ac1465b9d92", "0x5fe1f4e07b7143542c429d9118766a1789984671");
    /** ==== ERC 1155 === */
    process.exit(0);

    // const amount = 100;
    // const erc20TokenAddr = "0x061941D4F007291713ab52D644705D30DFC34D2E";
    // let tokenManagerAddr = await deployTokenManager();
    // let managerAddr = await deployHmyManager();

    // let managerAddr = await deployHmyNFTManager("0x5705dd3530bf7dd82c14aa3a949941970f157bc7");

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
