// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20EXT is IERC20 {
    function decimals() external pure returns (uint8);
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
}

contract ScalarMarketVault is Ownable {
    IERC20EXT public longToken;
    IERC20EXT public shortToken;
    IERC20EXT public usdcToken;

    ISwapRouter public immutable swapRouter;

    address public POOL_ADDRESS;

    uint256 public BASE = 1000;

    uint256 public longPrice;

    uint256 public startRange;
    uint256 public endRange;
    uint256 public fValue;

    bool public isFinalValueSet = false;
    uint24 public poolFee;

    mapping(uint24 => int24) public feeAmountTickSpacing;
    int24 public TICK_SPACING;

    // Events
    event MintLongShort(address recipient, uint256 amountIn, uint256 amountOut);
    event SetPoolAddress(address POOL_ADDRESS, uint24 poolFee);
    event FinalValueSet(uint256 fValue, bool isFinalValueSet, uint256 longPrice);
    event FinalRedeem(address sender,uint256 amountLIn, uint256 amountRIn, uint256 amountOut);
    event Redeem(address sender, uint256 amount);

    // Errors
    constructor(
        address _longTokenAddress,
        address _shortTokenAddress,
        address _usdcTokenAddress,
        address _swapRouter,
        uint256 _startRange,
        uint256 _endRange
    ) Ownable(msg.sender) {
        longToken = IERC20EXT(_longTokenAddress);
        shortToken = IERC20EXT(_shortTokenAddress);
        usdcToken = IERC20EXT(_usdcTokenAddress);
        swapRouter = ISwapRouter(_swapRouter);
        startRange = _startRange;
        endRange = _endRange;

        feeAmountTickSpacing[500] = 10;
        feeAmountTickSpacing[3000] = 60;
        feeAmountTickSpacing[10000] = 200;
    }

    function mintLongShort(address recipient, uint256 amountIn) external {
        require(usdcToken.transferFrom(msg.sender, address(this), amountIn),"USDC transfer failed");
        uint256 amountOut = amountIn*10**12;
        longToken.mint(recipient, amountOut);
        shortToken.mint(recipient, amountOut);
        emit MintLongShort(recipient, amountIn, amountOut);
    }

    function setPoolAddress(address _poolAddress, uint24 _poolfee) external onlyOwner {
        POOL_ADDRESS = _poolAddress;
        poolFee = _poolfee;
        emit SetPoolAddress(POOL_ADDRESS, poolFee);
    }

    // Once Set needs to be stuck
    function setFinalValue(uint256 _fValue) external onlyOwner {
        require(!isFinalValueSet, "Final Value has already been set");
        if (_fValue <= startRange) {
            fValue = startRange;
        } else if (_fValue >= endRange) {
            fValue = endRange;
        } else {
            fValue = _fValue;
        }

        setFinalLongPrice();
        isFinalValueSet = true;
        emit FinalValueSet(fValue, isFinalValueSet, longPrice);
    }
    // Can only be called once value is set
    function finalRedeem(uint256 amountLIn, uint256 amountSIn) external {
        require(isFinalValueSet, "Final Value has not been set");

        uint256 amountOut = (longPrice*amountLIn +(BASE - longPrice)*amountSIn) / BASE;
        require(longToken.transferFrom(msg.sender, address(this), amountLIn),"Failed to transfer Long Tokens");
        require(shortToken.transferFrom(msg.sender, address(this), amountSIn),"Failed to transfer Short Tokens");

        longToken.burn(address(this), longToken.balanceOf(address(this)));
        shortToken.burn(address(this), shortToken.balanceOf(address(this)));

        usdcToken.transfer(msg.sender, amountOut / 10 ** 12);
        emit FinalRedeem(msg.sender, amountLIn,amountSIn, amountOut/ 10 ** 12);
    }
    // Can only be called once value is set
    function setFinalLongPrice() internal {
        longPrice = (((fValue - startRange) * BASE) / (endRange - startRange));
    }

    function redeem(uint256 amount)external {
        require(longToken.transferFrom(msg.sender, address(this), amount),"Failed to transfer Long Tokens");
        require(shortToken.transferFrom(msg.sender, address(this), amount),"Failed to transfer Short Tokens");

        longToken.burn(address(this), longToken.balanceOf(address(this)));
        shortToken.burn(address(this), shortToken.balanceOf(address(this)));

        usdcToken.transfer(msg.sender,amount/10**12);
        emit Redeem(msg.sender,amount);

    }

    // amountIn is the amount that needs to be swapped.
    // Should probably track blanaces of USDC and Long short tokens in contract. For instance the left overs from fullSwapRedeem would be used in the second one.
    function fullSwapRedeem(uint256 _amountIn, uint256 _amountOutMinimum) external returns(uint256 usdcAmountOut){
        require(longToken.transferFrom(msg.sender, address(this), longToken.balanceOf(msg.sender)),"Failed to transfer Long Tokens");
        require(shortToken.transferFrom(msg.sender, address(this), shortToken.balanceOf(msg.sender)),"Failed to transfer Short Tokens");

        address _tokenIn;
        address _tokenOut;
        if (longToken.balanceOf(address(this))> shortToken.balanceOf(address(this))){
            _tokenIn = address(longToken);
            _tokenOut = address(shortToken);
        }
        else{
            _tokenIn = address(shortToken);
            _tokenOut = address(longToken);
        }
        IERC20EXT(_tokenIn).approve(address(swapRouter), _amountIn);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: _tokenIn,
            tokenOut: _tokenOut,
            fee: poolFee,
            recipient: address(this), 
            deadline: block.timestamp, 
            amountIn: _amountIn,
            amountOutMinimum: _amountOutMinimum,
            sqrtPriceLimitX96: 0 
        });

        uint256 amountOut = swapRouter.exactInputSingle(params);

        if(longToken.balanceOf(address(this)) > shortToken.balanceOf(address(this))){
            usdcAmountOut = shortToken.balanceOf(address(this))/10**12;
            usdcToken.transfer(msg.sender,usdcAmountOut);
        }else{
            usdcAmountOut = longToken.balanceOf(address(this))/10**12;
            usdcToken.transfer(msg.sender,usdcAmountOut);
        }

    }
}
