// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract MeeloWrapper {
	struct Vault {
		address[] collateralAssets;
		address[] optionsBought;
		address[] optionsSold;

		mapping(address => mapping(address => uint256)) collateralAssetAmount;
		mapping(address => uint256) optionsBoughtAmount;
		mapping(address => uint256) optionsSoldAmountAmount;
	}

}