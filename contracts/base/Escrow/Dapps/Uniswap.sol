pragma solidity 0.5.17;

// External Libraries
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/Address.sol";

// Common
import "../../../util/AddressLib.sol";

// Contracts
import "./Dapp.sol";

// Interfaces
import "./IUniswap.sol";
import "./IUniswapV2Router02.sol";

/*****************************************************************************************************/
/**                                             WARNING                                             **/
/**                      DAPP CONTRACT IS AN EXTENSION OF THE ESCROW CONTRACT                       **/
/**  ---------------------------------------------------------------------------------------------  **/
/**  Because there are multiple dApp contracts, and they all extend the Escrow contract that is     **/
/**  itself upgradeable, they cannot have their own storage variables as they would cause the the   **/
/**  storage slots to be overwritten on the Escrow proxy contract!                                  **/
/**                                                                                                 **/
/**  Visit https://docs.openzeppelin.com/upgrades/2.6/proxies#upgrading-via-the-proxy-pattern for   **/
/**  more information.                                                                              **/
/*****************************************************************************************************/
/**
    @notice This contract is used to define Uniswap dApp actions available.
    @author develop@teller.finance
 */
contract Uniswap is Dapp, IUniswap {
    using AddressLib for address;
    using Address for address;

    /* Constants */
    uint8 public constant NO_MINIMUM_OUTPUT_REQUIRED = 0;


    /* State Variables */
    // State is shared with Escrow contract as it uses delegateCall() to interact with this contract.
    
    /**
        @notice Swaps ETH or Tokens for Tokens or ETH using different Uniswap Router v 02 methods.
        @param routerAddress address of the Uniswap Router v02.
        @param path An array of token addresses. path.length must be >= 2. Pools for each consecutive pair of addresses must exist and have liquidity.
        @param sourceAmount amount of source element (ETH or Tokens) to swap.
        @param minDestination The minimum amount of output tokens that must be received for the transaction not to revert.
     */
    function swap(
        address routerAddress,
        address[] memory path,
        uint sourceAmount,
        uint minDestination
    ) internal {
        require(routerAddress.isContract(), "ROUTER_MUST_BE_A_CONTRACT");
        IUniswapV2Router02 router = IUniswapV2Router02(routerAddress);

        require(path.length >= 2, "UNISWAP_PATH_TOO_SHORT");
        address source = path[0];
        address destination = path[path.length - 1];

        source.requireNotEqualTo(destination, "UNISWAP_SOURCE_AND_DESTINATION_SAME");
        require(minDestination > 0, "UNISWAP_MIN_DESTINATION_ZERO"); // what if there is no minimum?

        uint256[] memory amounts;
        uint256 balanceBeforeSwap = 0;
        uint256 balanceAfterSwap = 0;
        balanceBeforeSwap = IERC20(destination).balanceOf(address(this));
        if (ETH_ADDRESS == source) {
            require(address(this).balance >= sourceAmount, "UNISWAP_INSUFFICIENT_ETH");
            amounts = router.swapExactETHForTokens.value(sourceAmount)(
                minDestination,
                path,
                address(this),
                now
            ); 
        } else {
            require(
                IERC20(source).balanceOf(address(this)) >= sourceAmount,
                "UNISWAP_INSUFFICIENT_TOKENS"
            );
            IERC20(source).approve(routerAddress, sourceAmount);
            if (destination == wethAddress) {
                amounts = router.swapExactTokensForETH(
                    sourceAmount,
                    minDestination,
                    path,
                    address(this),
                    now
                );
            } else {
                amounts = router.swapExactTokensForTokens(
                    sourceAmount,
                    minDestination,
                    path,
                    address(this),
                    now
                );
            }
        }
        balanceAfterSwap = IERC20(destination).balanceOf(address(this));
        require(balanceAfterSwap >= (balanceBeforeSwap + minDestination), "UNISWAP_BALANCE_NOT_INCREASED");
        require(amounts.length == path.length , "UNISWAP_ERROR_SWAPPING");
        uint256 amountReceived = amounts[amounts.length - 1];
        emit UniswapSwapped(
            msg.sender, 
            address(this),
            source,
            destination,
            sourceAmount, 
            amountReceived
        );
    }

   
}
