const { encode } = require('../consts');

class ILoansBaseEncoder {
    constructor(web3) {
        this.web3 = web3
    }
}

ILoansBaseEncoder.prototype.encodeCollateralToken = function() {
    return encode(this.web3, 'collateralToken()');
}

ILoansBaseEncoder.prototype.encodeLendingPool = function() {
    return encode(this.web3, 'lendingPool()');
}

ILoansBaseEncoder.prototype.encodeLendingToken = function() {
    return encode(this.web3, 'lendingToken()');
}

ILoansBaseEncoder.prototype.encodeLoans = function() {
    return encode(this.web3, 'loans(uint256)');
}

ILoansBaseEncoder.prototype.encodeGetTotalOwed = function() {
    return encode(this.web3, 'getTotalOwed(uint256)');
}

ILoansBaseEncoder.prototype.encodeCanLiquidateLoan = function() {
    return encode(this.web3, 'canLiquidateLoan(uint256)');
}

ILoansBaseEncoder.prototype.encodeRepay = function() {
    return encode(this.web3, 'repay(uint256,uint256)');
}

ILoansBaseEncoder.prototype.encodeIsLoanSecured = function() {
    return encode(this.web3, 'isLoanSecured(uint256)');
}

module.exports = ILoansBaseEncoder;