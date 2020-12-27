pragma solidity 0.5.17;

interface BaseProxyInterface {
    /**
        @notice Returns the current implementation.
        @return Address of the current implementation
     */
    function implementation() external view returns (address);
}
