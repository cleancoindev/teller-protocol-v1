// JS Libraries
const ILoansBaseEncoder = require("../utils/encoders/ILoansBaseEncoder");
const loanStatus = require("../utils/loanStatus");
const { createLoan } = require('../utils/loans');
const { encodeLoanParameter } = require("../utils/loans");
const { escrow } = require("../utils/events");
const { withData } = require("leche");
const { t } = require("../utils/consts");

// Mock contracts
const DAI = artifacts.require("./mock/token/DAIMock.sol");

// Smart contracts
const Escrow = artifacts.require("./mock/base/EscrowMock.sol");
const LoansBase = artifacts.require("./mock/base/LoansBaseMock.sol");

// Libraries
const LoanLib = artifacts.require("../util/LoanLib.sol");

contract("EscrowClaimTokensTest", function(accounts) {
  const loansEncoder = new ILoansBaseEncoder(web3);

  let loans;
  let instance;

  beforeEach(async () => {
    const loanLib = await LoanLib.new();
    await LoansBase.link("LoanLib", loanLib.address);
    loans = await LoansBase.new();
    instance = await Escrow.new();
  });

  withData({
    _1_loan_active: [ loanStatus.Active, accounts[1], accounts[1], false, 0, 0, true, "LOAN_NOT_CLOSED" ],
    _2_loan_not_liquidated_recipient_not_borrower: [ loanStatus.Closed, accounts[1], accounts[2], false, 0, 0, true, "LOAN_NOT_LIQUIDATED" ],
    _3_loan_not_liquidated_recipient_is_borrower: [ loanStatus.Closed, accounts[1], accounts[1], false, 2, 1000, true, "LOAN_NOT_LIQUIDATED" ],
    _4_loan_liquidated_recipient_is_borrower: [ loanStatus.Closed, accounts[1], accounts[1], true, 2, 1000, false, null ],
    _5_loan_liquidated_recipient_not_borrower: [ loanStatus.Closed, accounts[1], accounts[2], true, 2, 1000, true, "CALLER_MUST_BE_LOANS" ],
  }, function(
    status,
    recipient,
    borrower,
    liquidated,
    tokensCount,
    tokenBalance,
    mustFail,
    expectedErrorMessage
  ) {
    it(t("user", "claimTokens", "Should be able to claim tokens after the loan is closed.", mustFail), async function() {
      // Setup
      const loan = createLoan({ status, liquidated, escrow: instance.address, loanTerms: { borrower, recipient } });
      await loans.setLoan(loan);
      await instance.mockIsOwner(true, true);
      await instance.mockInitialize(loans.address, loan.id);

      const tokens = [];
      for (let i = 0; i < tokensCount; i++) {
        const token = await DAI.new();
        await token.mint(instance.address, tokenBalance);
        tokens.push(token.address);
      }
      await instance.externalSetTokens(tokens)

      try {
        // Invocation
        const result = await instance.claimTokens({ from: borrower });
        
        // Assertions
        for (let i = 0; i < tokensCount; i++) {
          const token = await DAI.at(tokens[i]);
          const escrowBalance = await token.balanceOf(instance.address);
          const recipientBalance = await token.balanceOf(borrower);

          assert.equal(escrowBalance.toString(), '0', 'Token balance left in Escrow')
          assert.equal(recipientBalance.toString(), tokenBalance.toString(), 'Recipient did not receive tokens')
        }

        escrow
          .tokensClaimed(result)
          .emitted(borrower);
        
      } catch (error) {
        assert(mustFail, error.message);
        assert.equal(error.reason, expectedErrorMessage);
      }
    });
  });
});
