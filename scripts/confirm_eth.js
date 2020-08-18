const Web3 = require("web3");
// based on https://blog.ethereum.org/2016/05/09/on-settlement-finality/
// 13 confirmation is enough
// delay between confirmations is equals to the average block mining time 
// which is between 10 to 20 seconds, let's keep it 20
const DEFAULT_CONFIRMATIONS = 13;
const AVG_BLOCK_TIME = 20 * 1000;
async function getConfirmations(txHash) {
  try {
    // Instantiate web3 with HttpProvider
    const web3 = new Web3(process.env.ETH_NODE_URL);

    // Get transaction details
    const trx = await web3.eth.getTransaction(txHash);

    // Get current block number
    const currentBlock = await web3.eth.getBlockNumber();

    // When transaction is unconfirmed, its block number is null.
    // In this case we return 0 as number of confirmations
    return trx.blockNumber === null ? 0 : currentBlock - trx.blockNumber;
  } catch (error) {
    console.log(error);
  }
}

function confirmEtherTransaction(txHash, confirmations = DEFAULT_CONFIRMATIONS) {
  setTimeout(async () => {
    // Get current number of confirmations and compare it with sought-for value
    const trxConfirmations = await getConfirmations(txHash);
    console.log(
      "Transaction with hash " +
        txHash +
        " has " +
        trxConfirmations +
        " confirmation(s)"
    );

    if (trxConfirmations >= confirmations) {
      // Handle confirmation event according to your business logic

      console.log(
        "Transaction with hash " + txHash + " has been successfully confirmed"
      );

      return;
    }
    // Recursive call
    return confirmEtherTransaction(txHash, confirmations);
  }, AVG_BLOCK_TIME);
}

module.exports = confirmEtherTransaction;
