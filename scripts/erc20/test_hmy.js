require("dotenv").config();
const { Harmony } = require("@harmony-js/core");
const { ChainID, ChainType } = require("@harmony-js/utils");
const { toUtf8Bytes } = require("@harmony-js/contract");
const { hexlify } = require("@harmony-js/crypto");
const {
  checkHmyBalance,
  approveHmyManger,
  mintToken,
  burnToken,
} = require("./hmy");
const { deployHRC20, deployHmyManager } = require("./deploy_hmy");
const hmy = new Harmony(process.env.HMY_NODE_URL, {
  chainType: ChainType.Harmony,
  chainId: ChainID.HmyTestnet,
});
hmy.wallet.addByPrivateKey(process.env.PRIVATE_KEY);
hmy.wallet.addByPrivateKey(process.env.PRIVATE_KEY_USER);

(async function () {
  const userAddr = process.env.USER;
  const amount = 100;
  let erc20Addr = await deployHRC20();
  let managerAddr = await deployHmyManager(erc20Addr);
  console.log("balance: " + (await checkHmyBalance(erc20Addr, userAddr)));
  await approveHmyManger(erc20Addr, managerAddr);
  const receiptId = hexlify(toUtf8Bytes("abc"));
  await mintToken(managerAddr, userAddr, amount, receiptId);
  console.log(
    "balance after minting: " + (await checkHmyBalance(erc20Addr, userAddr))
  );
  await burnToken(managerAddr, userAddr, amount);
  console.log(
    "balance after burning: " + (await checkHmyBalance(erc20Addr, userAddr))
  );
  process.exit(0);
})();
