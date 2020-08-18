const BLOCK_TO_FINALITY = 13;
const AVG_BLOCK_TIME = 20 * 1000;
const sleep = duration => new Promise(res => setTimeout(res, duration))

function normalizeEthKey(key) {
    let result = key.toLowerCase();
    if (!result.startsWith('0x')) {
        result = '0x' + result;
    }
    return result;
}

module.exports = {
    normalizeEthKey,
    sleep,
    BLOCK_TO_FINALITY,
    AVG_BLOCK_TIME
}