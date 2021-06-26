// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./IERC20.sol";

interface IMeeloOption is IERC20 {
    /** Enums */
    // @dev 0 for Put, 1 for Call
    enum OptionType { PUT, CALL }
    // @dev 0 for European, 1 for American
    enum ExerciseType { EUROPEAN, AMERICAN }
    // @dev 0 for CRYPTO, 1 for Traditional
    enum UnderlyingAssetType { ADDRESSABLE, NONADDRESSABLE }

    /** Events */
    event Write(address indexed optionWriter, uint256 amount);
    // event Unmint(address indexed optionWriter, uint256 optionAmount, uint256 strikeAmount, uint256 underlyingAmount);
    event Exercise(address indexed exerciser, uint256 amount);
    event Withdraw(address indexed optionWriter, uint256 strikeAmount, uint256 underlyingAmount);

    /** Functions */

    function writeMeeloOptions(uint256 amount, address account) external;

    // function exerciseMeeloOption(uint256 amountOfOptions) external;
}