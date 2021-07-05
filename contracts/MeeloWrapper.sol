// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./utils/Ownable.sol";
import "./interfaces/IMeeloOption.sol";

contract MeeloWrapper is Ownable {
	// struct Vault {
	// 	address[] collateralAssets;
	// 	address[] optionsBought;
	// 	address[] optionsSold;

	// 	mapping(address => mapping(address => uint256)) collateralAssetAmount;
	// 	mapping(address => uint256) optionsBuyAmount;
	// 	mapping(address => uint256) optionsWriteAmount;
	// }

	// mapping(address => mapping(uint256 => Vault)) userVault;
	// mapping(address => uint256) userVaultCount;

	function writeMeeloOptions(address meeloOptionSeries, uint256 amount, address optionWriter) public {
		IMeeloOption meeloOptionSeriesImpl = IMeeloOption(meeloOptionSeries); 
		meeloOptionSeriesImpl.writeMeeloOptions(amount, optionWriter);
	}

	function exerciseMeeloOptions(address meeloOptionSeries, uint256 amount, address account) public {
		IMeeloOption meeloOptionSeriesImpl = IMeeloOption(meeloOptionSeries); 
		meeloOptionSeriesImpl.exerciseMeeloOptions(amount, account);
	}
}
