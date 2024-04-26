// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUSDC {
    /// @notice Mints USDC tokens to a specified address.
    /// @param to The address to receive the minted tokens.
    /// @param amount The amount of tokens to mint.
    function mint(address to, uint256 amount) external;

    /// @notice Returns the number of decimals used to get its user representation.
    /// @return The number of decimals.
    function decimals() external pure returns (uint8);
}
