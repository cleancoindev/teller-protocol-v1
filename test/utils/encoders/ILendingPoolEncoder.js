const { encode } = require('../consts');

class ILendingPoolEncoder {
    constructor(web3) {
        this.web3 = web3;
        assert(web3, 'Web3 instance is required.');
    }
}

ILendingPoolEncoder.prototype.encodeLendingToken = function() {
    return encode(this.web3, 'lendingToken()');
}

module.exports = ILendingPoolEncoder;