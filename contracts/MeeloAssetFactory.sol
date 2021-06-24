// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./interfaces/IMeeloAsset.sol";
import "./MeeloAsset.sol";

contract MeeloAssetFactory {
	address[] public meeloAssets;

	// enforces uniqueness of each option series
	mapping(bytes32 => address) private meeloAssetHashToAddress;

	function createMeeloAsset(
		string memory assetName,
		string memory assetSymbol,
		bool isAddressable,
		address assetPriceFeedLinkAddress
	) external returns (MeeloAsset) {
		bytes32 assetUniqueHash = _calcMeeloAssetHash(
			assetSymbol,
			isAddressable,
			assetPriceFeedLinkAddress
		);

		require(meeloAssetHashToAddress[assetUniqueHash] == address(0), "Asset already exists");

		MeeloAsset asset = new MeeloAsset(
			assetName,
			assetSymbol,
			isAddressable,
			assetPriceFeedLinkAddress
		);

		address assetAddr = address(asset);
		meeloAssets.push(assetAddr);
		meeloAssetHashToAddress[assetUniqueHash] = assetAddr;

		return asset;
	}

	function _calcMeeloAssetHash(
		string memory assetSymbol,
		bool isAddressable,
		address assetPriceFeedLinkAddress
	) internal pure returns(bytes32) {
		return keccak256(abi.encodePacked(assetSymbol, isAddressable, assetPriceFeedLinkAddress));
	} 
}