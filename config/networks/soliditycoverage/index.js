module.exports = {
    network: 'soliditycoverage',
    chainlink: require('./chainlink'),
    compound: require('./compound'),
    tokens: require('./tokens'),
    assetSettings: require('./assetSettings'),
    platformSettings: require('./platformSettings'),
    signers: require('./signers'),
    maxGasLimit: 12500000,
    toTxUrl: ({ tx }) => {
        return `not-supported-url`;
    },
};
