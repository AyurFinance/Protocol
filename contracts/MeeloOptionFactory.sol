// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "../interfaces/IMeeloOption.sol";
import "./MeeloOption.sol";

contract MeeloOptionFactory {
	address[] public meeloOptions;

	/// @notice emitted when the factory creates a new Meelo Option
    event MeeloOptionCreated(
        address optionAddress,
        address creator,
        address indexed underlyingAsset,
        address indexed strikeAsset,
        uint256 strikePrice,
        uint256 expiry,
        uint256 exerciseWindowDuration,
        OptionType optionType,
		ExerciseType exerciseType,
		UnderlyingAssetType underlyingAssetType,
    );

	function createMeeloOption(
		string memory name,
		string memory symbol,
		address underlyingAsset,
		address strikeAsset,
		uint256 strikePrice,
		uint256 expiry,
		uint256 exerciseWindowDuration,
		OptionType optionType,
		ExerciseType exerciseType,
		UnderlyingAssetType underlyingAssetType,
	) external returns (IMeeloOption) {
		MeeloOption option = new MeeloOption(
			name,
			symbol,
			underlyingAsset,
			strikeAsset,
			strikePrice,
			expiry,
			exerciseWindowDuration,
			optionType,
			exerciseType,
			underlyingAssetType,
		);

		address optionAddr = address(option);
		meeloOptions.push(optionAddr);

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
	} 
}