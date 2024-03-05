// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LongToken is ERC20, ERC20Burnable, Ownable {

    address private admin;

    constructor() ERC20("Long Token", "LNG") Ownable(msg.sender){
        
    }

    modifier onlyAdmin(){
        require(msg.sender == admin, "only Admin");
        _;
    }

    function setAdmin(address _admin) external onlyOwner{
        admin =_admin;
    }

    function mint(address to, uint256 amount) external onlyAdmin {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public onlyAdmin{
        _burn(from, amount);
    }

    function decimal() external pure returns(uint8 dec){
        dec =18;
    }

}