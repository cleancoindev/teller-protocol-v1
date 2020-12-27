pragma solidity 0.5.17;

import "./SettingsInterface.sol";

/**
    @notice It is the base contract to hold the settings instance and upgradeable logic name in registry.

    @author develop@teller.finance
 */
interface BaseUpgradeableInterface {
    /**
        @notice The gets the settings contract address from the SETTINGS_SLOT.
        @dev This address should NOT change over the time. See details in the _setSettings(...) function.
     */
    function settings() external view returns (SettingsInterface);
}
