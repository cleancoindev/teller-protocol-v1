const { encode } = require('../consts');

class IATMGovernanceEncoder {
    constructor(web3) {
        this.web3 = web3;
        assert(web3, 'Web3 instance is required.');
    }
}

IATMGovernanceEncoder.prototype.encodeGetGeneralSetting = function() {
    return encode(this.web3, 'getGeneralSetting(bytes32)');
}

module.exports = IATMGovernanceEncoder;