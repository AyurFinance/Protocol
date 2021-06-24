// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./interfaces/IMeeloOption.sol";
import "./MeeloOption.sol";

contract MeeloOptionFactory {
	address[] public meeloOptions;

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

    function getMeeloOptionsCount() public view returns(uint256) {
    	return meeloOptions.length;
    }

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
}