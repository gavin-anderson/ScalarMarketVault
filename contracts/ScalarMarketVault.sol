// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

interface IERC20EXT is IERC20 {
    function decimals() external pure returns (uint8);
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
}

contract ScalarMarketVault {
    IERC20EXT public longToken;
    IERC20EXT public shortToken;
    ISwapRouter public immutable swapRouter;

    uint256 public immutable minimumDeposit = 0.001 ether;
    uint256 public immutable tokenBase = 1000000000000000000;
    uint256 public immutable rangeAccuracy = 1000000000000000000;

    uint256 public startRange;
    uint256 public endRange;
    uint256 public fValue;
    uint256 public longPrice;
    uint256 public expiry;
    address public immutable factory;
    address public creator;
    bool public isInitialized;
    bool public isFinalValueSet;

    // Events
    event MintLongShort(
        address recipient,
        uint256 amountInEth,
        uint256 longShortOut
    );
    event MintAndSwap(
        address recipient,
        uint256 ethAmountIn,
        uint256 longShortOut,
        uint256 amountReceived,
        bool swapToLong
    );
    event FinalValueSet(
        uint256 fValue,
        bool isFinalValueSet,
        uint256 longPrice
    );
    event FinalRedeem(
        address sender,
        uint256 amountLIn,
        uint256 amountRIn,
        uint256 amountOut
    );

    event Redeem(address sender, uint256 amount);

    modifier onlyFactory() {
        require(msg.sender == factory, "only factory");
        _;
    }
    modifier onlyCreator() {
        require(msg.sender == creator, "only creator");
        _;
    }

    constructor(address _factory, address _swapRouter) {
        factory = _factory;
        swapRouter = ISwapRouter(_swapRouter);
    }

    function initialize(
        address _longToken,
        address _shortToken,
        uint256 _startRange,
        uint256 _endRange,
        uint256 _expiry,
        address _creator
    ) external onlyFactory {
        longToken = IERC20EXT(_longToken);
        shortToken = IERC20EXT(_shortToken);
        startRange = _startRange;
        endRange = _endRange;
        expiry = _expiry;
        creator = _creator;
        isInitialized = true;
        isFinalValueSet = false;
    }

    function mintLongShort(address recipient) external payable {
        require(!isFinalValueSet, "Final Value has been set");
        require(msg.value >= minimumDeposit, "Minimum 0.001 ETH needed");
        require(isInitialized, "Has not been initialized");

        uint256 tokenCount = msg.value / minimumDeposit;
        uint256 refund = msg.value % minimumDeposit;
        if (refund > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: refund}("");
            require(refundSuccess, "Refund failed");
        }

        uint256 amountOut = tokenCount * tokenBase;
        longToken.mint(recipient, amountOut);
        shortToken.mint(recipient, amountOut);
        emit MintLongShort(recipient, msg.value, amountOut);
    }

    function mintAndSwap(
    address recipient,
    bool swapToLong,
    uint256 deadline,
    uint24 poolFee,
    uint256 _amountOutMinimum,
    uint160 _sqrtPriceLimitX96
) external payable {
    require(!isFinalValueSet, "Final Value has been set");
    require(msg.value >= minimumDeposit, "Minimum 0.001 ETH needed");
    require(isInitialized, "Has not been initialized");

    uint256 tokenAmount = msg.value / minimumDeposit;
    {
        uint256 refund = msg.value % minimumDeposit;
        if (refund > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: refund}("");
            require(refundSuccess, "Refund failed");
        }
    }

    uint256 amountOut = tokenAmount * tokenBase;

    // Mint both tokens
    longToken.mint(address(this), amountOut);
    shortToken.mint(address(this), amountOut);

    uint256 amountReceived;
    {
        // Decide which token to swap to
        address tokenIn = swapToLong ? address(shortToken) : address(longToken);
        address tokenOut = swapToLong ? address(longToken) : address(shortToken);

        // Approve the router to spend the token
        IERC20EXT(tokenIn).approve(address(swapRouter), amountOut);

        // Uniswap V3 swap parameters
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: poolFee,
                recipient: recipient,
                deadline: deadline,
                amountIn: amountOut,
                amountOutMinimum: _amountOutMinimum,
                sqrtPriceLimitX96: _sqrtPriceLimitX96
            });

        // Execute the swap
        amountReceived = swapRouter.exactInputSingle(params);
    }

    // Transfer remaining token balances back to the recipient
    {
        if (IERC20EXT(longToken).balanceOf(address(this)) > 0) {
            longToken.transfer(recipient, IERC20EXT(longToken).balanceOf(address(this)));
        }
        if (IERC20EXT(shortToken).balanceOf(address(this)) > 0) {
            shortToken.transfer(recipient, IERC20EXT(shortToken).balanceOf(address(this)));
        }
    }

    // Emit event for mint and swap after all actions are completed
    emit MintAndSwap(
        recipient,
        msg.value,
        amountOut,
        amountReceived,
        swapToLong
    );
}


    // Once Set needs to be stuck
    function setFinalValue(uint256 _fValue) external onlyCreator {
        require(isInitialized, "Has not been initialized");
        require(!isFinalValueSet, "Final Value has already been set");
        // require(
        //     block.number >= expiry,
        //     "Answer can not be submitted until after expiry"
        // );
        require(
            (_fValue * rangeAccuracy) / rangeAccuracy > 0,
            "Accruacy of answer is not clear enough"
        );
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

        uint256 amountOut = (longPrice *
            amountLIn +
            (rangeAccuracy - longPrice) *
            amountSIn) / rangeAccuracy;
        require(
            longToken.transferFrom(msg.sender, address(this), amountLIn),
            "Failed to transfer Long Tokens"
        );
        require(
            shortToken.transferFrom(msg.sender, address(this), amountSIn),
            "Failed to transfer Short Tokens"
        );

        longToken.burn(address(this), longToken.balanceOf(address(this)));
        shortToken.burn(address(this), shortToken.balanceOf(address(this)));

        uint256 ethAmount = (amountOut * 0.001 ether) / tokenBase;
        (bool sent, ) = msg.sender.call{value: ethAmount}("");
        require(sent, "Failed to send Ether");

        emit FinalRedeem(
            msg.sender,
            amountLIn,
            amountSIn,
            amountOut / 10 ** 12
        );
    }
    // Can only be called once value is set
    function setFinalLongPrice() internal {
        longPrice = (((fValue - startRange) * rangeAccuracy) /
            (endRange - startRange));
    }

    function redeem(uint256 amount) external {
        require(isInitialized, "Has not been initialized");
        uint256 ethAmount = (amount * 0.001 ether) / tokenBase;

        require(
            longToken.transferFrom(msg.sender, address(this), amount),
            "Failed to transfer Long Tokens"
        );
        require(
            shortToken.transferFrom(msg.sender, address(this), amount),
            "Failed to transfer Short Tokens"
        );

        longToken.burn(address(this), longToken.balanceOf(address(this)));
        shortToken.burn(address(this), shortToken.balanceOf(address(this)));

        (bool sent, ) = msg.sender.call{value: ethAmount}("");
        require(sent, "Failed to send Ether");

        emit Redeem(msg.sender, amount);
    }
}
