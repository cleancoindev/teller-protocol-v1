const { encode } = require('../consts');

class ICompoundEncoder {
    constructor(web3) {
        this.web3 = web3;
        assert(web3, 'Web3 instance is required.');
    }
}

ICompoundEncoder.prototype.encodeMint = function() {
    return encode(this.web3, 'mint(uint256)');
}

ICompoundEncoder.prototype.encodeRedeemUnderlying = function() {
    return encode(this.web3, 'redeemUnderlying(uint256)');
}

ICompoundEncoder.prototype.encodeExchangeRateStored = function() {
    return encode(this.web3, 'exchangeRateStored()');
}

ICompoundEncoder.prototype.encodeDecimals = function() {
    return encode(this.web3, 'decimals()');
}

ICompoundEncoder.prototype.encodeUnderlying = function() {
    return encode(this.web3, 'underlying()');
}

module.exports = ICompoundEncoder;
