const { encode } = require('../consts');

class IMarketsStateEncoder {
    constructor(web3) {
        this.web3 = web3;
        assert(web3, 'Web3 instance is required.');
    }
}

IMarketsStateEncoder.prototype.encodeGetSupplyToDebtFor = function() {
    return encode(this.web3, 'getSupplyToDebtFor(address,address,uint256)');
}

module.exports = IMarketsStateEncoder;