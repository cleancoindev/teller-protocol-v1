pragma solidity 0.5.17;
pragma experimental ABIEncoderV2;

import "../../base/EtherCollateralLoans.sol";

/**
    This contract is created ONLY for testing purposes.
 */
contract LoansBaseModifiersMock is EtherCollateralLoans {
    bool public mockIsDebtToSupplyRatioValid;
    bool public returnIsDebtToSupplyRatioValid;

    function setMockIsDebtToDebtRatioValid(
        bool result,
        bool aResponseIsDebtToSupplyRatioValid
    ) external {
        mockIsDebtToSupplyRatioValid = result;
        returnIsDebtToSupplyRatioValid = aResponseIsDebtToSupplyRatioValid;
    }

    function _isDebtToSupplyRatioValid(uint256 newLoanAmount)
        internal
        view
        returns (bool)
    {
        if (!mockIsDebtToSupplyRatioValid) {
            return super._isDebtToSupplyRatioValid(newLoanAmount);
        }
        return returnIsDebtToSupplyRatioValid;
    }

    function setLoanStatus(uint256 loanID, TellerCommon.LoanStatus status) external {
        loans[loanID].status = status;
    }

    function externalLoanActive(uint256 loanID) external loanActive(loanID) {}

    function externalLoanTermsSet(uint256 loanID) external loanTermsSet(loanID) {}

    function externalLoanActiveOrSet(uint256 loanID) external loanActiveOrSet(loanID) {}

    function externalIsBorrower(address anAddress) external isBorrower(anAddress) {}

    function externalWithValidLoanRequest(TellerCommon.LoanRequest calldata loanRequest)
        external
        withValidLoanRequest(loanRequest)
    {}
}
