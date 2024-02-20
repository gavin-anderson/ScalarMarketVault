// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LongToken is ERC20, ERC20Burnable, Ownable {

    address public admin;

    constructor() ERC20("Long Token", "LG") Ownable(msg.sender){
        
    }

    function setAdmin(address newAdmin) external onlyOwner{
        require(newAdmin != address(0), "New admin is the zero address");
        admin = newAdmin;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == admin, "Only admin can mint");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == admin, "Only admin can burn");
        _burn(from, amount);
    }

}