// Smart contracts

// Util classes
const { zerocollateral } = require("../../scripts/utils/contracts");
const ProcessArgs = require('../utils/ProcessArgs');
const Accounts = require('../utils/Accounts');
const ethUtil = require('ethereumjs-util');
const { createLoanRequest, createUnsignedLoanResponse, } = require('../../test/utils/structs');
const { createLoanResponseSig, hashLoanTermsRequest } = require('../../test/utils/hashes');
const { NULL_ADDRESS, ONE_DAY } = require('../../test/utils/consts');

const processArgs = new ProcessArgs();

const createLoanTermsRequest = (loanRequestInfo) => {
    const loanTermsRequest = createLoanRequest(
        loanRequestInfo.borrower,
        loanRequestInfo.recipient,
        loanRequestInfo.requestNonce,
        loanRequestInfo.amount,
        loanRequestInfo.duration,
        loanRequestInfo.requestTime,
    );
    let requestHash = hashLoanTermsRequest(loanTermsRequest, loanRequestInfo.caller);
    requestHash = ethUtil.bufferToHex(requestHash);
    return {
        loanTermsRequest,
        requestHash,
    }
}

const createSignedInterestResponse = async (web3, loanTermsRequest, loanTermsResponseInfo) => {
    const { requestHash } = loanTermsRequest;
    const unsignedLoanTermsResponse = createUnsignedLoanResponse(
        loanTermsResponseInfo.signer,
        loanTermsResponseInfo.responseTime,
        loanTermsResponseInfo.interestRate,
        loanTermsResponseInfo.collateralRatio,
        loanTermsResponseInfo.maxLoanAmount,
        loanTermsResponseInfo.signerNonce
    );

    const signedResponse = await createLoanResponseSig(
        web3,
        unsignedLoanTermsResponse.signer,
        unsignedLoanTermsResponse,
        requestHash
    );

    return signedResponse;
};

/** Process parameters: */
const tokenName = 'USDC';
const borrowerIndex = 1;
const recipientIndex = -1;
const durationInDays = 10;
const amount = 100;
const collateralValue = 100000;
const nonce = 7;

module.exports = async (callback) => {
    try {
        const accounts = new Accounts(web3);
        const appConf = processArgs.getCurrentConfig();
        const { toTxUrl } = appConf.networkConfig;

        const getContracts = processArgs.createGetContracts(artifacts);
        const loansInstance = await getContracts.getDeployed(zerocollateral.loans(tokenName));

        const borrower = await accounts.getAt(borrowerIndex);
        const recipient = await accounts.getAtOrDefault(recipientIndex, NULL_ADDRESS);

        const signer1 = await accounts.getAt(9);
        const signer2 = await accounts.getAt(10);

        const loanTermsRequestInfo = {
            borrower,
            recipient,
            requestNonce: nonce,
            amount,
            duration: durationInDays * ONE_DAY,
            requestTime: Math.round(Date.now() / 1000),
            caller: loansInstance.address,
        };
        const loanTermsRequest = createLoanTermsRequest(loanTermsRequestInfo);

        const loanResponseInfo1 = {
            signer: signer1,
            responseTime: Math.round(Date.now() / 1000) - 10,
            interestRate: 4000,
            collateralRatio: 6000,
            maxLoanAmount: 20000,
            signerNonce: nonce
        };
        const signedResponse1 = await createSignedInterestResponse(web3, loanTermsRequest, loanResponseInfo1);
        
        const loanResponseInfo2 = {
            signer: signer2,
            responseTime: Math.round(Date.now() / 1000) - 100,
            interestRate: 4000,
            collateralRatio: 6000,
            maxLoanAmount: 20000,
            signerNonce: nonce
        };
        const signedResponse2 = await createSignedInterestResponse(web3, loanTermsRequest, loanResponseInfo2);

        const result = await loansInstance.setLoanTerms(
            loanTermsRequest.loanTermsRequest,
            [signedResponse1, signedResponse2],
            {
              from: borrower,
              value: collateralValue,
            }
        );
        console.log(toTxUrl(result));

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};