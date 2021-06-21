pragma solidity ^0.8.0;

interface IMeeloOptionFactory {
	event MeeloOptionCreate(address indexed creator);

	/**
     * @notice Locks collateral and write option tokens.
     *
     * @dev The issued amount ratio is 1:1, i.e., 1 option token for 1 underlying token.
     *
     * The collateral could be the strike or the underlying asset depending on the option type: Put or Call,
     * respectively
     *
     * It presumes the caller has already called IERC20.approve() on the
     * strike/underlying token contract to move caller funds.
     *
     * Options can only be minted while the series is NOT expired.
     *
     * It is also important to notice that options will be sent back
     * to `msg.sender` and not the `owner`. This behavior is designed to allow
     * proxy contracts to mint on others behalf. The `owner` will be able to remove
     * the deposited collateral after series expiration or by calling unmint(), even
     * if a third-party minted options on its behalf.
     *
     * @param amountOfOptions The amount option tokens to be issued
     * @param owner Which address will be the owner of the options
     */
	function createMeeloOption() external;
}