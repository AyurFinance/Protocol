// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./interfaces/IERC20Metadata.sol";
import "./interfaces/IMeeloOption.sol";
import "./MeeloOption.sol";
import "./libs/Address.sol";

contract MeeloOptionFactory {
	using Address for address;

	address[] public meeloOptions;

	// enforces uniqueness of each option series
	mapping(bytes32 => address) private meeloOptionHashToAddress;

	/// @notice emitted when the factory creates a new Meelo Option
    event MeeloOptionCreated(
        address optionAddress,
        address creator,
        address indexed underlyingAsset,
        address indexed strikeAsset,
        uint256 strikePrice,
        uint256 expiry,
        uint256 exerciseWindowDuration,
        IMeeloOption.OptionType optionType,
		IMeeloOption.ExerciseType exerciseType,
		IMeeloOption.UnderlyingAssetType underlyingAssetType
    );

	function createMeeloOption(
		address meeloWrapper,
		string memory name,
		string memory symbol,
		address underlyingAsset,
		address strikeAsset,
		uint256 strikePrice,
		uint256 expiry,
		uint256 exerciseWindowDuration,
		IMeeloOption.OptionType optionType,
		IMeeloOption.ExerciseType exerciseType,
		IMeeloOption.UnderlyingAssetType underlyingAssetType
	) external returns (IMeeloOption) {
		require(meeloWrapper.isContract(), "MeeloOptionFactory: MeeloWrapper is not a contract");
		require(IERC20Metadata(underlyingAsset).decimals() == 18, "MeeloOptionFactory: Underlying Asset does not have 18 decimals");
		require(IERC20Metadata(strikeAsset).decimals() == 18, "MeeloOptionFactory: Strike Asset does not have 18 decimals");

		bytes32 optionUniqueHash = _calcMeeloOptionHash(
			underlyingAsset,
			strikeAsset,
			strikePrice,
			expiry,
			optionType,
			underlyingAssetType
		);

		require(meeloOptionHashToAddress[optionUniqueHash] == address(0), "option series already exists");

		MeeloOption option = new MeeloOption(
			meeloWrapper,
			name,
			symbol,
			underlyingAsset,
			strikeAsset,
			strikePrice,
			expiry,
			exerciseWindowDuration,
			optionType,
			exerciseType,
			underlyingAssetType
		);

		address optionAddr = address(option);
		meeloOptions.push(optionAddr);
		meeloOptionHashToAddress[optionUniqueHash] = optionAddr;

		emit MeeloOptionCreated(
			optionAddr,
			msg.sender,
			underlyingAsset,
			strikeAsset,
			strikePrice,
			expiry,
			exerciseWindowDuration,
			optionType,
			exerciseType,
			underlyingAssetType
		);

		return option;
	}

	function getMeeloOptionsCount() public view returns(uint256) {
    	return meeloOptions.length;
    }

	function _calcMeeloOptionHash(
		address underlyingAsset,
		address strikeAsset,
		uint256 strikePrice,
		uint256 expiry,
		IMeeloOption.OptionType optionType,
		IMeeloOption.UnderlyingAssetType underlyingAssetType
	) internal pure returns(bytes32) {
		return keccak256(abi.encodePacked(underlyingAsset, strikeAsset, strikePrice, expiry, optionType, underlyingAssetType));
	} 
}