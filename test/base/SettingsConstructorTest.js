// JS Libraries
const withData = require('leche').withData;
const { t } = require('../utils/consts');

// Mock contracts

// Smart contracts
const Settings = artifacts.require("./base/Settings.sol");

contract('SettingsConstructorTest', function (accounts) {

    withData({
        _1_basic: [1, 1, 1, undefined, false],
        _2_not_required_submissionns: [0, 2, 3, 'MUST_PROVIDE_REQUIRED_SUBS', true],
        _3_not_response_expiry_length: [2, 0, 0, 'MUST_PROVIDE_RESPONSE_EXP', true],
    }, function(requiredSubmissions, maximumTolerance, responseExpiryLength, expectedErrorMessage, mustFail) {
        it(t('user', 'new', 'Should (or not) be able to create a new instance.', mustFail), async function() {
            // Setup

            try {
                // Invocation
                const result = await Settings.new(requiredSubmissions, maximumTolerance, responseExpiryLength);
                
                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');
                assert(result);
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert.equal(error.reason, expectedErrorMessage);
            }
        });
    });
});