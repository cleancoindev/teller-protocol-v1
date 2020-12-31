// JS Libraries
const withData = require('leche').withData;
const { t, NULL_ADDRESS, createMocks } = require('../utils/consts');
const { atmSettings } = require('../utils/events');
const SettingsEncoder = require('../utils/encoders/ISettingsEncoder');

// Mock contracts
const Mock = artifacts.require("./mock/util/Mock.sol");

// Smart contracts
const ATMSettings = artifacts.require("./settings/ATMSettings.sol");

contract('ATMSettingsUpdateATMToMarketTest', function (accounts) {
    const ISettingsEncoder = new SettingsEncoder(web3);
    const owner = accounts[0];
    let instance;
    let settings;
    let mocks;
    
    beforeEach('Setup for each test', async () => {
        mocks = await createMocks(Mock, 10);

        settings = await Mock.new();
        instance = await ATMSettings.new();
        await instance.initialize(settings.address);
    });

    const newAtM = (borrowedTokenIndex, collateralTokenIndex, atmAddressIndex) => ({borrowedTokenIndex, collateralTokenIndex, atmAddressIndex});

    withData({
        _1_basic: [[newAtM(0, 1, 2)], newAtM(0, 1, 3), 0, true, true, false, undefined, false],
        _2_invalid_not_exist: [[newAtM(0, 1, 2)], newAtM(1, 1, 2), 0, true, true, false, 'ATM_TO_MARKET_NOT_EXIST', true],
        _3_borrowed_token_not_contract: [[newAtM(3, 1, 0)], newAtM(99, 2, 3), 0, true, true, false, 'BORROWED_TOKEN_MUST_BE_CONTRACT', true],
        _4_collateral_token_not_contract: [[newAtM(3, 1, 0)], newAtM(1, 99, 3), 0, true, true, false, 'COLL_TOKEN_MUST_BE_CONTRACT', true],
        _5_sender_not_pauser: [[newAtM(2, 3, 1)], newAtM(2, 3, 1), 1, true, false, false, 'NOT_PAUSER', true],
        _6_same_value: [[newAtM(0, 1, 2)], newAtM(0, 1, 2), 0, true, true, false, 'PROVIDE_NEW_ATM_FOR_MARKET', true],
    }, function(previousATMToMarkets, atmToMarket, senderIndex, encodeIsATM, encodeHasPauserRole, encodeIsPaused, expectedErrorMessage, mustFail) {
        it(t('user', 'updateATMToMarket', 'Should (or not) be able to update an ATM from a market.', mustFail), async function() {
            // Setup
            for (const previousATMIndex of previousATMToMarkets) {
                await instance.setATMToMarket(
                    mocks[previousATMIndex.borrowedTokenIndex],
                    mocks[previousATMIndex.collateralTokenIndex],
                    mocks[previousATMIndex.atmAddressIndex],
                    { from: owner }
                );
            }
            const sender = accounts[senderIndex];
            const atmAddress = atmToMarket.atmAddressIndex === -1 ? NULL_ADDRESS : mocks[atmToMarket.atmAddressIndex];
            await settings.givenMethodReturnBool(ISettingsEncoder.encodeHasPauserRole(), encodeHasPauserRole);
            if(!encodeHasPauserRole) {
                await settings.givenMethodRevertWithMessage(
                    ISettingsEncoder.encodeRequirePauserRole(),
                    "NOT_PAUSER"
                );
            }
            
            await settings.givenMethodReturnBool(ISettingsEncoder.encodeIsPaused(), encodeIsPaused);
            const borrowedToken = atmToMarket.borrowedTokenIndex === 99 ? accounts[0] : mocks[atmToMarket.borrowedTokenIndex];
            const collateralToken = atmToMarket.collateralTokenIndex === 99 ? accounts[1] : mocks[atmToMarket.collateralTokenIndex];

            try {
                // Invocation
                const result = await instance.updateATMToMarket(
                    borrowedToken,
                    collateralToken,
                    atmAddress,
                    { from: sender }
                );
                
                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');

                const isATMForMarketResult = await instance.isATMForMarket(borrowedToken, collateralToken, atmAddress);
                assert.equal(isATMForMarketResult, true);

                const atmAddressResult = await instance.getATMForMarket(
                    borrowedToken,
                    collateralToken
                );
                assert.equal(atmAddressResult, atmAddress);

                const oldAtmToMarket = previousATMToMarkets.find(
                    atm =>  atm.borrowedTokenIndex === atmToMarket.borrowedTokenIndex &&
                            atm.collateralTokenIndex === atmToMarket.collateralTokenIndex
                );
                const oldAtmAddress = mocks[oldAtmToMarket.atmAddressIndex];

                atmSettings
                    .marketToAtmUpdated(result)
                    .emitted(
                        borrowedToken,
                        collateralToken,
                        oldAtmAddress,
                        atmAddress,
                        sender
                    );

            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert.equal(error.reason, expectedErrorMessage);
            }
        });
    });
});