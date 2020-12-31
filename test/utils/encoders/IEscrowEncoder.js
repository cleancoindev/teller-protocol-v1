const { encode } = require('../consts');

class IEscrowEncoder {
    constructor(web3) {
        this.web3 = web3
    }
}

IEscrowEncoder.prototype.encodeCalculateTotalValue = function() {
    return encode(this.web3, 'calculateTotalValue()');
}

IEscrowEncoder.prototype.encodeInitialize = function() {
    return encode(this.web3, 'initialize(address,uint256)');
}

IEscrowEncoder.prototype.encodeClaimTokens = function() {
    return encode(this.web3, 'claimTokens(address)');
}

module.exports = IEscrowEncoder;