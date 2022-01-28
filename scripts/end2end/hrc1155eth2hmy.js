require("dotenv").config();
const {
    mintERC20,
    checkEthBalance,
    approveEthManger,
    lockToken,
    addHRC1155Token,
    getHRC1155MappingFor,
    mintHRC1155Tokens,
    burnHRC1155Tokens,
} = require("./eth");
const {
    checkHmyBalance,
    addToken,
    getMappingFor,
    mintToken,
    approveHmyManger,
    lockHmy1155Token,
    getHRC1155Detail,
    unlockHmy1155Token,
} = require("./hmy");

(async function () {
    const userAddr = process.env.ETH_USER_1155;
    const masterAddr = process.env.ETH_MASTER;
    const originTokenAddr = "0x420e279A49d12f9224f0863b71FA723872C51658";
    const ethManagerAddr = "0xB58D3349954E7E3Cc54d4d8B7f2878145DDc0Ecf";
    const hmyManagerAddr = "0x78df945ca74e51f08d45531bbdf60a31e520d0ee";
    const ethTokenManagerAddr = "0x5900673f3618b3A1F4D049B827E660750468A753";
    // register erc20Token with token manager
    const originTokenUri = "https://18weapons.oss-cn-hongkong.aliyuncs.com/hrc1155/01/";

    const transAmount = "1";
    const transTokenId = 0;
    let newHRC1155Addr;

    // get bridge token address on eth
    let bridgeTokenAddr = await getHRC1155MappingFor(ethTokenManagerAddr, originTokenAddr);
    if (bridgeTokenAddr === "0x0000000000000000000000000000000000000000") {
        console.log("can not find bridge token");
        process.exit(-1);
    } else {
        newHRC1155Addr = bridgeTokenAddr;
        console.log("bridge token already exist: ", newHRC1155Addr);
    }

    // get token balance on eth
    let ethBalanceBefore = await checkEthBalance(newHRC1155Addr, userAddr, transTokenId);
    console.log("HRC1155 balance of " + userAddr + " before burn: " + ethBalanceBefore);

    // approve token
    let approveTx = await approveEthManger(newHRC1155Addr, ethManagerAddr);
    console.log("approved to manager on ethereum: " + approveTx);

    // burn token on eth
    let burnTx = await burnHRC1155Tokens(ethManagerAddr, newHRC1155Addr, [transTokenId], userAddr, [transAmount]);
    console.log("burned to manager on ethereum: " + burnTx);

    // get token balance on eth
    let ethBalanceAfter = await checkEthBalance(newHRC1155Addr, userAddr, transTokenId);
    console.log("HRC1155 balance of " + userAddr + " after burn: " + ethBalanceAfter);

    // get token balance on hmy
    let hmyBalanceBefore = await checkHmyBalance(originTokenAddr, userAddr, transTokenId);
    console.log("HRC1155 balance of " + userAddr + " before unlock: " + hmyBalanceBefore);

    // unlock token on hmy
    let unlockTx = await unlockHmy1155Token(hmyManagerAddr, originTokenAddr, [transTokenId], userAddr, burnTx, [transAmount], []);
    console.log("unlocked to manager on harmony: " + unlockTx);

    // get token balance on hmy
    let hmyBalanceAfter = await checkHmyBalance(originTokenAddr, userAddr, transTokenId);
    console.log("HRC1155 balance of " + userAddr + " after unlock: " + hmyBalanceAfter);

    process.exit(0);
})();
