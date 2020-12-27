const { encode } = require('../consts');

class MarketsStateInterfaceEncoder {
    constructor(web3) {
        this.web3 = web3;
        assert(web3, 'Web3 instance is required.');
    }
}

MarketsStateInterfaceEncoder.prototype.encodeGetDebtToSupplyFor = function() {
    return encode(this.web3, 'getDebtToSupplyFor(address,address,uint256)');
}

module.exports = MarketsStateInterfaceEncoder;