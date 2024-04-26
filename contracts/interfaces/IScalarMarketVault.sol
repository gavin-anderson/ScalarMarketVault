// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IScalarMarketVault {
    // Events
    event MintLongShort(address recipient, uint256 amountInEth, uint256 amountOut);
    event SetPoolAddress(address POOL_ADDRESS, uint24 poolFee);
    event FinalValueSet(uint256 fValue, bool isFinalValueSet, uint256 longPrice);
    event FinalRedeem(address sender, uint256 amountLIn, uint256 amountRIn, uint256 amountOut);
    event Redeem(address sender, uint256 amount);

    // Functions
    function initialize(address _longToken, address _shortToken, uint256 _startRange, uint256 _endRange, address _creator) external;
    function mintLongShort(address recipient) external payable;
    function setFinalValue(uint256 _fValue) external;
    function finalRedeem(uint256 amountLIn, uint256 amountSIn) external;
    function redeem(uint256 amount) external;
}
