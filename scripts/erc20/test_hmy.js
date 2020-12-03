require("dotenv").config();
const { Harmony } = require("@harmony-js/core");
const { ChainID, ChainType } = require("@harmony-js/utils");
const { toUtf8Bytes } = require("@harmony-js/contract");
const { hexlify } = require("@harmony-js/crypto");
const {
  checkHmyBalance,
  approveHmyManger,
  getMappingFor,
  addToken,
  mintToken,
  burnToken,
} = require("./hmy");
const { tokenDetails } = require("./eth");
const { deployHmyManager } = require("./deploy_hmy");
const { deployTokenManager, approveHmyMangerTokenManager } = require("../lib");
const hmy = new Harmony(process.env.HMY_NODE_URL, {
  chainType: ChainType.Harmony,
  chainId: Number(process.env.HMY_CHAIN_ID),
});
hmy.wallet.addByPrivateKey(process.env.PRIVATE_KEY);
hmy.wallet.addByPrivateKey(process.env.PRIVATE_KEY_USER);

(async function () {
  const userAddr = process.env.USER;
  const amount = 100;
  const erc20TokenAddr = "0x061941D4F007291713ab52D644705D30DFC34D2E";
  let tokenManagerAddr = await deployTokenManager();
  let managerAddr = await deployHmyManager();
  // approve manager to call permission token manager methods
  await approveHmyMangerTokenManager(tokenManagerAddr, managerAddr);
  // register erc20Token to token manager
  const [name, symbol, decimals] = await tokenDetails(erc20TokenAddr);
  await addToken(managerAddr, tokenManagerAddr, erc20TokenAddr, name, symbol, decimals);
  // get the oneTokenAddr from token manager, also available in event
  let oneTokenAddr = await getMappingFor(managerAddr, erc20TokenAddr);
  console.log("added token", oneTokenAddr);
  console.log("balance: " + (await checkHmyBalance(oneTokenAddr, userAddr)));
  // await approveHmyManger(oneTokenAddr, managerAddr);
  const receiptId = hexlify(toUtf8Bytes("abc"));
  await mintToken(managerAddr, oneTokenAddr, userAddr, amount, receiptId);
  console.log(
    "balance after minting: " + (await checkHmyBalance(oneTokenAddr, userAddr))
  );
  await approveHmyManger(oneTokenAddr, managerAddr, amount);
  await burnToken(managerAddr, oneTokenAddr, userAddr, amount);
  console.log(
    "balance after burning: " + (await checkHmyBalance(oneTokenAddr, userAddr))
  );
  process.exit(0);
})();
