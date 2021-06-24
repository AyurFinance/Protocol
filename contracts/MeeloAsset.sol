// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./interfaces/IMeeloAsset.sol";
import "./utils/ERC20.sol";
import "./libs/tokens/SafeERC20.sol";
import "./libs/math/SafeMath.sol";
import "./libs/Address.sol";

import "./oracle/AssetPriceFeeder.sol";

contract MeeloAsset  {

    string name;
    string symbol;
    bool isAddressable;
	address assetPriceFeedLinkAddress;
    PriceConsumerV3 assetChainLinkPriceFeeder;

    constructor (
		string memory _name,
		string memory _symbol,
		bool _isAddressable,
        address _assetPriceFeedLinkAddress
	)  {

        // Need to check if that's the coorect way once
		require(msg.sender != address(0), "Only the owner of contract can create new asset");

        assetChainLinkPriceFeeder = new PriceConsumerV3(_assetPriceFeedLinkAddress);
		name = _name;
		symbol = _symbol;
        isAddressable = _isAddressable;
        assetPriceFeedLinkAddress = _assetPriceFeedLinkAddress;
	}

    function getAssetPrice() external view returns(int256) {

     return assetChainLinkPriceFeeder.getLatestPrice();
    }
}