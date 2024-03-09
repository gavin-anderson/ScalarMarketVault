// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
 import "@openzeppelin/contracts/access/Ownable.sol"; 

interface IERC20EXT is IERC20{
    function decimals() external pure returns (uint8);
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
}


contract ScalarMarketVault is Ownable{
    IERC20EXT public longToken;
    IERC20EXT public shortToken;
    IERC20EXT public usdcToken;

    address public POOL_ADDRESS;
    
    uint256 public BASE = 1000;

    uint256 public longPrice;

    uint256 public startRange;
    uint256 public endRange;
    uint256 public fValue;



    uint24 public poolFee;

    mapping(uint24 => int24) public  feeAmountTickSpacing;
    int24 public TICK_SPACING;

    constructor(address _longTokenAddress, address _shortTokenAddress, address _usdcTokenAddress, uint256 _startRange, uint256 _endRange) Ownable(msg.sender){
        longToken = IERC20EXT(_longTokenAddress);
        shortToken = IERC20EXT(_shortTokenAddress);
        usdcToken = IERC20EXT(_usdcTokenAddress);
        startRange = _startRange;
        endRange = _endRange;

        feeAmountTickSpacing[500] = 10;
        feeAmountTickSpacing[3000] = 60;
        feeAmountTickSpacing[10000] = 200;
    }

    function mintLongShort(address recipient, uint256 amountIn) public {

        require(usdcToken.transferFrom(msg.sender, address(this), amountIn), "USDC transfer failed");

        longToken.mint(recipient, amountIn*10**12); 
        shortToken.mint(recipient, amountIn*10**12); 
    }

    function setPoolAddress(address _poolAddress)external onlyOwner{
        POOL_ADDRESS = _poolAddress;
    }

    // Once Set needs to be stuck
    function setFinalValue(uint256 _fValue) external onlyOwner{
        if (_fValue<=startRange){
            fValue=startRange;
        }else if (_fValue>=endRange){
            fValue = endRange;
        }else{
            fValue=_fValue;
        }
    }
    // Can only be called once value is set
    function finalRedeem(uint256 amountLIn, uint256 amountSIn) external{


        uint256 amountOut =(longPrice*amountLIn + (BASE-longPrice)*amountSIn)/BASE;
        require(longToken.transferFrom(msg.sender, address(this), amountLIn));
        require(shortToken.transferFrom(msg.sender, address(this), amountSIn));

        longToken.burn(address(this),longToken.balanceOf(address(this)));
        shortToken.burn(address(this),shortToken.balanceOf(address(this)));

        usdcToken.transfer(msg.sender,amountOut/10**12);

    }
    // Can only be called once value is set
    function setFinalLongPrice() public {
        longPrice = ((fValue-startRange)*BASE/(endRange-startRange));
    }



}
