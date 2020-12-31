const { encode } = require('../consts');

class ISettingsEncoder {
    constructor(web3) {
        this.web3 = web3;
        assert(web3, 'Web3 instance is required.');
    }
}

ISettingsEncoder.prototype.encodeGetPlatformSettingValue = function() {
    return encode(this.web3, 'getPlatformSettingValue(bytes32)');
}

ISettingsEncoder.prototype.encodeHasPauserRole = function() {
    return encode(this.web3, 'hasPauserRole(address)');
}

ISettingsEncoder.prototype.encodeRequirePauserRole = function() {
    return encode(this.web3, 'requirePauserRole(address)');
}

ISettingsEncoder.prototype.encodeIsPaused = function() {
    return encode(this.web3, 'isPaused()');
}

ISettingsEncoder.prototype.encodeIsPoolPaused = function() {
    return encode(this.web3, 'isPoolPaused(address)');
}

ISettingsEncoder.prototype.encodeMarketsState = function() {
    return encode(this.web3, 'marketsState()');
}

ISettingsEncoder.prototype.encodeEscrowFactory = function() {
    return encode(this.web3, 'escrowFactory()');
}

ISettingsEncoder.prototype.encodeETH_ADDRESS = function() {
    return encode(this.web3, 'ETH_ADDRESS()');
}

ISettingsEncoder.prototype.encodeATMSettings = function() {
    return encode(this.web3, 'atmSettings()');
}

ISettingsEncoder.prototype.encodeMarketsState = function() {
    return encode(this.web3, 'marketsState()');
}

ISettingsEncoder.prototype.encodeVersionsRegistry = function() {
    return encode(this.web3, 'versionsRegistry()');
}

ISettingsEncoder.prototype.encodeInterestValidator = function() {
    return encode(this.web3, 'interestValidator()');
}

ISettingsEncoder.prototype.encodeGetAssetSettings = function() {
    return encode(this.web3, 'getAssetSettings(address)');
}

ISettingsEncoder.prototype.encodeGetCTokenAddress = function() {
    return encode(this.web3, 'getCTokenAddress(address)');
}

module.exports = ISettingsEncoder;