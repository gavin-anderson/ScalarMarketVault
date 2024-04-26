// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ShortToken is ERC20, ERC20Burnable, Ownable {
    address public vault;
    address public immutable factory;

    constructor(address _factory) ERC20("Short Token", "SSHHOORRTT") Ownable(msg.sender) {
        factory = _factory;
    }

    modifier onlyVault() {
        require(msg.sender == vault, "only Vault");
        _;
    }
    modifier onlyFactory() {
        require(msg.sender == factory, "only factory");
        _;
    }

    function setVault(address _vault) external onlyFactory {
        vault = _vault;
    }

    function mint(address to, uint256 amount) external onlyVault {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public onlyVault {
        _burn(from, amount);
    }
}
