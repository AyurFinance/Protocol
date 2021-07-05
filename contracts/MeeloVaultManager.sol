// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./interfaces/IMeeloOption.sol";
import "./utils/ERC20.sol";
import "./libs/tokens/SafeERC20.sol";
import "./libs/math/SafeMath.sol";
import "./libs/Address.sol";

contract MeeloVaultManager {
	enum Status { nonExistent, active, closed }
	// specific to a options contract
	struct Vault1 {
		uint256 collateral; // total amount of collateral assets
		uint256 optionsMinted; // total amount of meelo option tokens minted
		Status vaultStatus;
	}
	// mapping(address => Vault1) userVaults;
	// address[] private vaultOwners;

	// function addCollateral(address owner, uint256 amount);
	// function removeCollateral(address owner, uint256 amount);
	// function addOptionsToVault(address owner, uint256 amount);
	// function removeOptionsFromVault(address owner, uint256 amount);
}