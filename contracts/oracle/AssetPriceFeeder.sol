// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "../interfaces/IAggregatorV3.sol";

contract AssetPriceFeeder {

  
    constructor() {}

    /**
     * Returns the latest price
     */
    function getLatestPrice(address priceFeedAddress) public view returns (int) {

        IAggregatorV3  priceFeed;

        priceFeed = IAggregatorV3(priceFeedAddress);


        (
            uint80 roundID, 
            int price,
            uint startedAt,
            uint timeStamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();

        delete priceFeed;
        
        return price;
    }
}