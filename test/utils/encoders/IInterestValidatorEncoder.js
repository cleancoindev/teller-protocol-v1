const { encode } = require('../consts');

class IInterestValidatorEncoder {
    constructor(web3) {
        this.web3 = web3;
        assert(web3, 'Web3 instance is required.');
    }
}

IInterestValidatorEncoder.prototype.encodeIsInterestValid = function() {
    return encode(this.web3, 'isInterestValid(address,address,address,uint256)');
}

module.exports = IInterestValidatorEncoder;