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

	address public immutable meeloWrapper;

	address public immutable underlyingAsset;
	address public immutable strikeAsset;
	address public immutable collateralAsset;

	OptionType public immutable optionType;
	ExerciseType public immutable exerciseType;
	UnderlyingAssetType public immutable underlyingAssetType;

	uint256 public immutable strikePrice;
	uint256 public immutable expiry;

	uint256 public immutable exerciseWindowBegins;

	constructor(
		address _meeloWrapper,
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

		meeloWrapper = _meeloWrapper;

		exerciseType = _exerciseType;
		expiry = _expiry;

		uint256 _exerciseWindowBegins;
		if(_exerciseType == ExerciseType.EUROPEAN) {
			require(_exerciseWindowDuration >= 1 days, "MeeloOption: minimum option exercise window duration is 1 day");
			_exerciseWindowBegins = _expiry.sub(_exerciseWindowDuration);
		} else {
			_exerciseWindowBegins = block.timestamp;
		}

		if(_underlyingAssetType == UnderlyingAssetType.NONADDRESSABLE) {
			// means completely virtual asset, example - ARAMCO, 
			// restrict options for NON-ADDRESSABLE assets to only PUT
			require(_optionType == OptionType.PUT, "MeeloOption: CALL Options for non NONADDRESSABLE assets have yet to be enabled!");
			// TO-DO also enforce expiry values to be equal to those existing in Traditional options(e.g.)
		}

		address _collateralAsset;
		if(_optionType == OptionType.PUT) {
			_collateralAsset = _strikeAsset;
		} else {
			_collateralAsset = _underlyingAsset;
		}

		exerciseWindowBegins = _exerciseWindowBegins;
		optionType = _optionType;
		underlyingAsset = _underlyingAsset;
		underlyingAssetType = _underlyingAssetType;
		strikeAsset = _strikeAsset;
		strikePrice = _strikePrice;
		collateralAsset = _collateralAsset;
	}

	function writeMeeloOptions(uint256 amount, address account) external override {
		require(msg.sender == meeloWrapper, "MeeloOption: Only the meeloWrapper contract can mint options");
		require(amount > 0, "MeeloOption: set an amount > 0 to write options");

		uint256 collateralAmountRequired = _calcCollateralAmountRequired(amount);
		// safe transfer collateral assets from meelo option to this contract
		IERC20(collateralAsset).safeTransferFrom(account, address(this), collateralAmountRequired);

		// mint meelo option for writer
		_mint(account, amount);

		emit Write(account, amount);
	}

	function _calcCollateralAmountRequired(uint256 _meeloOptionAmount) internal view returns(uint256) {
		uint256 collateralAmountRequired;
		if(optionType == OptionType.PUT) {
			collateralAmountRequired = _meeloOptionAmount.mul(strikePrice).div(10**uint256(18));
		} else {
			require(underlyingAssetType == UnderlyingAssetType.ADDRESSABLE, "MeeloOption: Can only mint call options for addressable assets");
			collateralAmountRequired = _meeloOptionAmount;
		}
		return collateralAmountRequired;
	}
}