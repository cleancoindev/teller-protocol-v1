const assert = require('assert');
const {
    toDecimals
} = require('../../test/utils/consts');
const MOCK_NETWORKS = ['test', 'soliditycoverage'];
/**
 * We set all assets settings.
 * 
 * @param settingsInstance a Settings contract instance.
 * @param param1 contains the settings we need for the asset.
 * @param param2 contains an ERC20Detailed instance. 
 */
async function initAssetSettings(
    settingsInstance, {
        assetSettings,
        tokens,
        compound,
        txConfig,
        network,
    }, {
        ERC20
    }
) {
    console.log('Configuring asset settings.')
    for (const tokenName of Object.keys(assetSettings)) {
        const tokenConfig = assetSettings[tokenName];

        const tokenAddress = tokens[tokenName.toUpperCase()];
        assert(tokenAddress, `Token address (${tokenName}) not found (${network}).`);
        const cTokenAddress = compound[tokenConfig.cToken.toUpperCase()];
        assert(cTokenAddress, `cToken address (${tokenConfig.cToken}) not found (${network}).`);

        const tokenInstance = await ERC20.at(tokenAddress);
        const decimals = await tokenInstance.decimals();
        const maxLoanAmountWithDecimals = toDecimals(tokenConfig.maxLoanAmount, decimals);

        console.log(`Configuring asset: ${tokenName} (${tokenAddress}) / ${tokenConfig.cToken} (${cTokenAddress}) / Max Loan Amount: ${tokenConfig.maxLoanAmount} (${maxLoanAmountWithDecimals.toFixed(0)})`);
        await settingsInstance.createAssetSettings(
            tokenAddress,
            cTokenAddress,
            maxLoanAmountWithDecimals,
            txConfig,
        );
    }
}

/**
 * We add initial Node Components version to Settings contract to start the platform.
 * 
 * @param settingsInstance a Settings contract instance. 
 * @param web3 web3 library reference.
 */
function initNodeComponents(settingsInstance, nodeComponentsVersions, web3) {
    const WEB2 = 'WEB2';
    const EVENT_LISTENER = 'EVENT_LISTENER';
    const POSTGRES = 'POSTGRES';
    const REDIS = 'REDIS';

    console.log('Initializing Node Components versions on settings.');

    console.log(`Node component: ${WEB2} version: ${nodeComponentsVersions.WEB2}`);
    settingsInstance.addNewComponent(web3.utils.asciiToHex(WEB2), nodeComponentsVersions.WEB2);
    console.log(`Node component: ${EVENT_LISTENER} version: ${nodeComponentsVersions.EVENT_LISTENER}`);
    settingsInstance.addNewComponent(web3.utils.asciiToHex(EVENT_LISTENER), nodeComponentsVersions.EVENT_LISTENER);
    console.log(`Node component: ${POSTGRES} version: ${nodeComponentsVersions.POSTGRES}`);
    settingsInstance.addNewComponent(web3.utils.asciiToHex(POSTGRES), nodeComponentsVersions.POSTGRES);
    console.log(`Node component: ${REDIS} version: ${nodeComponentsVersions.REDIS}`);
    settingsInstance.addNewComponent(web3.utils.asciiToHex(REDIS), nodeComponentsVersions.REDIS);
}

module.exports = async function (
    settingsInstance, web3, {
        nodeComponentsVersions,
        assetSettings,
        tokens,
        compound,
        txConfig,
        network,
    }, {
        ERC20
    },
) {
    console.log('Initializing platform settings.');
    // Initializing node components
    await initNodeComponents(settingsInstance, nodeComponentsVersions, web3);

    const isMockNetwork = MOCK_NETWORKS.indexOf(network) > -1;
    if (isMockNetwork) {
        /*
            As we validate (in contracts):
                - Some address (ex: cToken address) must be a contract address.

            We don't initialize the settings in the mock networks (test, and soliditycoverage) because they are dummy addresses (not contracts).
        */
        console.log('Mock network detected. Platform settings is not configured.');
        return;
    }
    await initAssetSettings(
        settingsInstance, {
            assetSettings,
            tokens,
            compound,
            txConfig,
            network,
        }, {
            ERC20
        }
    );
}