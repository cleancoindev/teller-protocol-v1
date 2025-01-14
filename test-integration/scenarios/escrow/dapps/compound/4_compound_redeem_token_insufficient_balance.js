const BigNumber = require("bignumber.js");

const { teller, tokens, ctokens } = require("../../../../../scripts/utils/contracts");
const {
  loans: loansActions,
  escrow: escrowActions,
  tokens: tokensActions,
} = require("../../../../../scripts/utils/actions");
const { toDecimals } = require("../../../../../test/utils/consts");
const helperActions = require("../../../../../scripts/utils/actions/helper");

module.exports = async (testContext) => {
  const {
    getContracts,
    accounts,
    collTokenName,
    tokenName,
  } = testContext;
  console.log("Scenario: Compound#4 - Redeem token insufficient balance");
  const allContracts = await getContracts.getAllDeployed(
    {teller, tokens},
    tokenName,
    collTokenName
  );
  const {token, collateralToken} = allContracts;
  const tokenInfo = await tokensActions.getInfo({token});
  const collateralTokenInfo = await tokensActions.getInfo({
    token: collateralToken,
  });

  const depositFundsAmount = toDecimals(300, tokenInfo.decimals);
  const maxAmountRequestLoanTerms = toDecimals(100, tokenInfo.decimals);
  const amountTakeOut = toDecimals(50, tokenInfo.decimals);
  let initialOraclePrice;
  let collateralAmountDepositCollateral;
  let collateralAmountWithdrawCollateral;
  if (collTokenName.toLowerCase() === "eth") {
    initialOraclePrice = "0.00295835"
    collateralAmountDepositCollateral = toDecimals(0.2, collateralTokenInfo.decimals);
    collateralAmountWithdrawCollateral = toDecimals(0.1,collateralTokenInfo.decimals);
  }
  if (collTokenName.toLowerCase() === "link") {
    initialOraclePrice = "0.100704"
    collateralAmountDepositCollateral = toDecimals(6.1, collateralTokenInfo.decimals);
    collateralAmountWithdrawCollateral = toDecimals(1, collateralTokenInfo.decimals);
  }
  const durationInDays = 5;
  const signers = await accounts.getAllAt(12, 13);
  const borrowerTxConfig = await accounts.getTxConfigAt(1);
  const lenderTxConfig = await accounts.getTxConfigAt(0);

  const loan = await helperActions.takeOutNewLoan(
    allContracts,
    {testContext},
    {
      borrowerTxConfig,
      oraclePrice: initialOraclePrice,
      lenderTxConfig,
      depositFundsAmount,
      maxAmountRequestLoanTerms,
      amountTakeOut,
      collateralAmountDepositCollateral,
      durationInDays,
      signers,
      tokenInfo,
      collateralTokenInfo,
    }
  );

  allContracts.escrow = await loansActions.getEscrow(
    allContracts,
    {testContext},
    {
      loanId: loan.id,
    }
  );

  const context = { testContext, txConfig: borrowerTxConfig };

  allContracts.cToken = await getContracts.getDeployed(ctokens.fromTokenName(tokenName))

  const borrowedAmount = loan.borrowedAmount.toString()
  await escrowActions.dapp.compound.lend(allContracts, context,
    { amount: borrowedAmount }
  )

  const tokenAmount = new BigNumber(borrowedAmount).multipliedBy(2)
  await escrowActions.dapp.compound.redeem(allContracts, context,
    { amount: tokenAmount.toString(), shouldFail: true, expectedRevertReason: "COMPOUND_INSUFFICIENT_BALANCE" }
  )
};