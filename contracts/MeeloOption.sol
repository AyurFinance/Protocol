// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./interfaces/IMeeloOption.sol";
import "./utils/ERC20.sol";
import "./libs/tokens/SafeERC20.sol";
import "./libs/math/SafeMath.sol";
import "./libs/Address.sol";

contract MeeloOption is IMeeloOption, ERC20 {
	using SafeERC20 for IERC20;
	using Address for address;
	using SafeMath for uint256;

	address public immutable underlyingAsset;
	address public immutable strikeAsset;

	OptionType public immutable optionType;
	ExerciseType public immutable exerciseType;
	UnderlyingAssetType public immutable underlyingAssetType;

	uint256 public immutable strikePrice;
	uint256 public immutable expiry;

	uint256 public immutable exerciseWindowBegins;

	constructor(
		string memory name,
		string memory symbol,
		address _underlyingAsset,
		address _strikeAsset,
		uint256 _strikePrice,
		uint256 _expiry,
		uint256 _exerciseWindowDuration,
		OptionType _optionType,
		ExerciseType _exerciseType,
		UnderlyingAssetType _underlyingAssetType
	) ERC20(name, symbol) {
		require(_underlyingAsset.isContract(), "MeeloOption: underlying asset is not a contract");
		require(_strikeAsset.isContract(), "MeeloOption: strike asset is not a contract");
		require(_underlyingAsset != _strikeAsset, "MeeloOption: strike asset & underlying asset can't be the same");
		require(_expiry > block.timestamp, "MeeloOption: invalid expiry");

		exerciseType = _exerciseType;
		expiry = _expiry;

		uint256 _exerciseWindowBegins;
		if(_exerciseType == ExerciseType.EUROPEAN) {
			require(_exerciseWindowDuration >= 1 days, "MeeloOption: minimum option exercise window duration is 1 day");
			_exerciseWindowBegins = _expiry.sub(_exerciseWindowDuration);
		} else {
			_exerciseWindowBegins = block.timestamp;
		}

		exerciseWindowBegins = _exerciseWindowBegins;
		optionType = _optionType;
		underlyingAsset = _underlyingAsset;
		underlyingAssetType = _underlyingAssetType;
		strikeAsset = _strikeAsset;
		strikePrice = _strikePrice;
	}
}