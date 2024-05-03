// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ILongToken.sol";
import "./interfaces/IShortToken.sol";
import "./interfaces/IScalarMarketVault.sol";
contract ScalarMarketFactory is Ownable{

    mapping(address=>mapping(address=>address)) public getVault;

    address public scalarMarketVault;
    address public longToken;
    address public shortToken;
    
    event MarketCreated(address scalarMarketVaultClone, address longTokenClone, address shortTokenClone, uint256 startRange, uint256 endRange,uint256 expiry,address creator);

    constructor()Ownable(msg.sender){}

    function setTemplates(address _scalarMarketVault, address _longToken, address _shortToken) external onlyOwner{
        scalarMarketVault=_scalarMarketVault;
        longToken=_longToken;
        shortToken=_shortToken;
    } 

    function createNewMarket(uint256 startRange, uint256 endRange, uint256 expiry)external{
        require(startRange/10**18 >0, "Wrong Scale rangeOpen");
        require(endRange/10**18 >0, "Wrong Scale rangeClose");
        require(expiry>block.number, "Expiry must be in the future");
        address scalarMarketVaultClone = createScalarVault();
        (address longTokenClone, address shortTokenClone) = createLongShort();

        ILongToken(longTokenClone).setVault(scalarMarketVaultClone);
        IShortToken(shortTokenClone).setVault(scalarMarketVaultClone);
        IScalarMarketVault(scalarMarketVaultClone).initialize(longTokenClone, shortTokenClone,startRange,endRange,expiry, msg.sender);

        (address token0, address token1) = longTokenClone < shortTokenClone ? (longTokenClone, shortTokenClone) : (shortTokenClone, longTokenClone);
        getVault[token0][token1] = scalarMarketVaultClone;
        getVault[token1][token0] = scalarMarketVaultClone;
        emit MarketCreated(scalarMarketVaultClone, longTokenClone, shortTokenClone, startRange, endRange, expiry, msg.sender);
    }

    function createScalarVault()internal returns(address vaultClone){
        vaultClone = Clones.clone(scalarMarketVault);
    }

    function createLongShort()internal returns(address longClone, address shortClone){
        longClone = Clones.clone(longToken);
        shortClone = Clones.clone(shortToken);
    }
   
}