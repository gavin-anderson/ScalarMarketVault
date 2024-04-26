// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ILongToken {
    // Events could be added here if they were used in the original contract

    /// @notice Sets the vault of the token contract.
    /// @param _factory The address to be set as admin.
    function setFactory(address _factory) external;

    /// @notice Sets the vault of the token contract.
    /// @param _vault The address to be set as admin.
    function setVault(address _vault) external;

    /// @notice Mints tokens to a specified address.
    /// @param to The address that will receive the minted tokens.
    /// @param amount The amount of tokens to mint.
    function mint(address to, uint256 amount) external;

    /// @notice Burns tokens from a specified address.
    /// @param from The address from which tokens will be burned.
    /// @param amount The amount of tokens to burn.
    function burn(address from, uint256 amount) external;
}
