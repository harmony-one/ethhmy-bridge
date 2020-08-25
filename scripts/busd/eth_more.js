require("dotenv").config();
const Web3 = require("web3");
const { deployBUSD, deployBUSDEthManager } = require("./deploy_eth");
const { mintBUSD, checkEthBalance, initBUSDEth, approveEthManger, lockToken } = require("./eth");
const web3 = new Web3(process.env.ETH_NODE_URL);

(async function () {
  // deploy eth contracts
  let busd = await deployBUSD();
  await initBUSDEth(busd);
  const userAddr = process.env.ETH_USER;
  const amount = 100;
  let ethManager = await deployBUSDEthManager(busd);
  let approvalEvent = await approveEthManger(busd, ethManager, amount);
  let receipt = await web3.eth.getTransactionReceipt(
    approvalEvent.transactionHash
  );
  let decoded = web3.eth.abi.decodeLog(
    [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "spender", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    receipt.logs[0].data,
    receipt.logs[0].topics.slice(1)
  );
  console.log('data from transaction receipted of approval event');
  console.log('owner: ' + decoded.owner);
  console.log('spender: ' + decoded.spender);
  console.log('value: ' + decoded.value);

  // let's mint some tokens for transfer on the eth side
  await mintBUSD(busd, userAddr, amount);
  console.log(
    "Eth balance of " +
      userAddr +
      " after minting: " +
      (await checkEthBalance(busd, userAddr))
  );

  const lockedEvent = await lockToken(ethManager, process.env.USER, amount);
  receipt = await web3.eth.getTransactionReceipt(lockedEvent.transactionHash);
  //emits two events {Transfer, Locked}, we should decode the second
  decoded = web3.eth.abi.decodeLog(
    [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    receipt.logs[1].data,
    receipt.logs[1].topics.slice(1)
  );
  console.log('data from transaction receipted of locked event');
  console.log('amount: ' + decoded.amount);
  console.log('recipient: ' + decoded.recipient);
})();
