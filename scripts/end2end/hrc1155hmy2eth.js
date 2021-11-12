require("dotenv").config();
const {
    mintERC20,
    checkEthBalance,
    approveEthManger,
    lockToken,
    addHRC1155Token,
    getHRC1155MappingFor,
    mintHRC1155Tokens,
} = require("./eth");
const {
    checkHmyBalance,
    addToken,
    getMappingFor,
    mintToken,
    approveHmyManger,
    lockHmy1155Token,
    getHRC1155Detail,
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

    const transAmount = "10";
    const transTokenId = 0;
    let newHRC1155Addr;

    // get origin token detail on hmy
    const [originTokenName, originTokenSymbol] = await getHRC1155Detail(originTokenAddr);
    console.log('originTokenName: ' + originTokenName + "\noriginTokenSymbol: ", originTokenSymbol);

    // get bridge token address on eth
    let bridgeTokenAddr = await getHRC1155MappingFor(ethTokenManagerAddr, originTokenAddr);
    if (bridgeTokenAddr === "0x0000000000000000000000000000000000000000") {
        await addHRC1155Token(ethManagerAddr, ethTokenManagerAddr, originTokenAddr, originTokenName, originTokenSymbol, originTokenUri);
        newHRC1155Addr = await getHRC1155MappingFor(ethTokenManagerAddr, originTokenAddr);
        console.log("added bridge token: ", newHRC1155Addr);
    } else {
        newHRC1155Addr = bridgeTokenAddr;
        console.log("bridge token already exist: ", newHRC1155Addr);
    }

    // get token balance on hmy
    let hmyBalanceBefore = await checkHmyBalance(originTokenAddr, userAddr, transTokenId);
    console.log("HRC1155 balance of " + userAddr + " before lock: " + hmyBalanceBefore);

    // approve token
    let approveTx = await approveHmyManger(originTokenAddr, hmyManagerAddr);
    console.log("approved to manager on harmony: " + approveTx);

    // lock token on hmy
    let lockTx = await lockHmy1155Token(hmyManagerAddr, originTokenAddr, [transTokenId], userAddr, [transAmount], []);
    console.log("locked to manager on harmony: " + lockTx);

    // get token balance on hmy
    let hmyBalanceAfter = await checkHmyBalance(originTokenAddr, userAddr, transTokenId);
    console.log("HRC1155 balance of " + userAddr + " after lock: " + hmyBalanceAfter);

    // get token balance on eth
    let ethBalanceBefore = await checkEthBalance(newHRC1155Addr, userAddr, transTokenId);
    console.log("HRC1155 balance of " + userAddr + " before mint: " + ethBalanceBefore);

    // mint token on eth
    let mintTx = await mintHRC1155Tokens(ethManagerAddr, newHRC1155Addr, [transTokenId], userAddr, lockTx, [transAmount], []);
    console.log("minted to manager on harmony: " + mintTx);

    // get token balance on eth
    let ethBalanceAfter = await checkEthBalance(newHRC1155Addr, userAddr, transTokenId);
    console.log("HRC1155 balance of " + userAddr + " after mint: " + ethBalanceAfter);

    process.exit(0);
})();
