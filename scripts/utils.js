
function normalizeEthKey(key) {
    let result = key.toLowerCase();
    if (!result.startsWith('0x')) {
        result = '0x' + result;
    }
    return result;
}

module.exports = {
    normalizeEthKey
}