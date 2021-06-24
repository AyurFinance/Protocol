// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./interfaces/IMeeloOption.sol";
import "./MeeloOption.sol";

contract MeeloOptionFactory {
	address[] public meeloOptions;

	// enforces uniqueness of each option series
	mapping(bytes32 => address) private meeloOptionHashToAddress;

	/// @notice emitted when the factory creates a new Meelo Option
    event MeeloOptionCreated(
        address optionAddress,
        address creator,
        address indexed underlyingAsset,
        address indexed strikeAsset,
        address indexed collateralAsset,
        uint256 strikePrice,
        uint256 expiry,
        uint256 exerciseWindowDuration,
        IMeeloOption.OptionType optionType,
		IMeeloOption.ExerciseType exerciseType,
		IMeeloOption.UnderlyingAssetType underlyingAssetType
    );

	function createMeeloOption(
		string memory name,
		string memory symbol,
		address underlyingAsset,
		address strikeAsset,
		address collateralAsset,
		uint256 strikePrice,
		uint256 expiry,
		uint256 exerciseWindowDuration,
		IMeeloOption.OptionType optionType,
		IMeeloOption.ExerciseType exerciseType,
		IMeeloOption.UnderlyingAssetType underlyingAssetType
	) external returns (IMeeloOption) {
		bytes32 optionUniqueHash = _calcMeeloOptionHash(
			underlyingAsset,
			strikeAsset,
			collateralAsset,
			strikePrice,
			expiry,
			optionType,
			underlyingAssetType
		);

		require(meeloOptionHashToAddress[optionUniqueHash] == address(0), "option series already exists");

		MeeloOption option = new MeeloOption(
			name,
			symbol,
			underlyingAsset,
			strikeAsset,
			collateralAsset,
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
			collateralAsset,
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
		address collateralAsset,
		uint256 strikePrice,
		uint256 expiry,
		IMeeloOption.OptionType optionType,
		IMeeloOption.UnderlyingAssetType underlyingAssetType
	) internal pure returns(bytes32) {
		return keccak256(abi.encodePacked(underlyingAsset, strikeAsset, collateralAsset, strikePrice, expiry, optionType, underlyingAssetType));
	} 
}