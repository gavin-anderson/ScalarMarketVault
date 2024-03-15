const { ContractFactory, utils } = require("ethers");
const WETH9 = require("../WETH9.json");
const fs = require('fs');
const { promisify } = require('util');

const artifacts = {
    UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
    SwapRouter: require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
    NFTDescriptor: require("@uniswap/v3-periphery/artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json"),
    NonfungibleTokenPositionDescriptor: require("@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json"),
    NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
    QuoterV2: require("@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json"),
    WETH9,
};

const linkLibraries = ({ bytecode, linkReferences }, libraries) => {
    Object.keys(linkReferences).forEach((fileName) => {
        Object.keys(linkReferences[fileName]).forEach((contractName) => {
            if (!libraries.hasOwnProperty(contractName)) {
                throw new Error(`Missing link library name ${contractName}`)
            }
            const address = utils
                .getAddress(libraries[contractName])
                .toLowerCase()
                .slice(2)
            linkReferences[fileName][contractName].forEach(
                ({ start, length }) => {
                    const start2 = 2 + start * 2
                    const length2 = length * 2
                    bytecode = bytecode
                        .slice(0, start2)
                        .concat(address)
                        .concat(bytecode.slice(start2 + length2, bytecode.length))
                }
            )
        })
    })
    return bytecode
}

async function deployUniContracts(signer) {

    Weth = new ContractFactory(artifacts.WETH9.abi, artifacts.WETH9.bytecode, signer);
    weth = await Weth.deploy();

    Factory = new ContractFactory(artifacts.UniswapV3Factory.abi, artifacts.UniswapV3Factory.bytecode, signer);
    factory = await Factory.deploy();

    SwapRouter = new ContractFactory(artifacts.SwapRouter.abi, artifacts.SwapRouter.bytecode, signer);
    swapRouter = await SwapRouter.deploy(factory.address, weth.address);

    NFTDescriptor = new ContractFactory(artifacts.NFTDescriptor.abi, artifacts.NFTDescriptor.bytecode, signer);
    nftDescriptor = await NFTDescriptor.deploy();

    QuoterV2 = new ContractFactory(artifacts.QuoterV2.abi, artifacts.QuoterV2.bytecode, signer);
    quoterV2 = await QuoterV2.deploy(factory.address, weth.address);

    const linkedBytecode = linkLibraries(
        {
            bytecode: artifacts.NonfungibleTokenPositionDescriptor.bytecode,
            linkReferences: {
                "NFTDescriptor.sol": {
                    NFTDescriptor: [
                        {
                            length: 20,
                            start: 1261,
                        },
                    ],
                },
            },
        },
        {
            NFTDescriptor: nftDescriptor.address,
        }
    );

    NonfungibleTokenPositionDescriptor = new ContractFactory(artifacts.NonfungibleTokenPositionDescriptor.abi, linkedBytecode, signer);
    nonfungibleTokenPositionDescriptor = await NonfungibleTokenPositionDescriptor.deploy(weth.address);

    NonfungiblePositionManager = new ContractFactory(artifacts.NonfungiblePositionManager.abi, artifacts.NonfungiblePositionManager.bytecode, signer);
    nonfungiblePositionManager = await NonfungiblePositionManager.deploy(factory.address, weth.address, nonfungibleTokenPositionDescriptor.address);

    console.log('WETH_ADDRESS=', `'${weth.address}'`)
    console.log('FACTORY_ADDRESS=', `'${factory.address}'`)
    console.log('SWAP_ROUTER_ADDRESS=', `'${swapRouter.address}'`)
    console.log('NFT_DESCRIPTOR_ADDRESS=', `'${nftDescriptor.address}'`)
    console.log('POSITION_DESCRIPTOR_ADDRESS=', `'${nonfungibleTokenPositionDescriptor.address}'`)
    console.log('POSITION_MANAGER_ADDRESS=', `'${nonfungiblePositionManager.address}'`)
    console.log('QUOTERV2_ADDRESS =', `'${quoterV2.address}'`);

    // let addresses = [
    //     `WETH_ADDRESS=${weth.address}`,
    //     `FACTORY_ADDRESS=${factory.address}`,
    //     `SWAP_ROUTER_ADDRESS=${swapRouter.address}`,
    //     `NFT_DESCRIPTOR_ADDRESS=${nftDescriptor.address}`,
    //     `POSITION_DESCRIPTOR_ADDRESS=${nonfungibleTokenPositionDescriptor.address}`,
    //     `POSITION_MANAGER_ADDRESS=${nonfungiblePositionManager.address}`,
    //     `QUOTERV2_ADDRESS=${quoterV2.address}`
    // ]

    let addresses = {
        WETH_ADDRESS: weth.address,
        FACTORY_ADDRESS: factory.address,
        SWAP_ROUTER_ADDRESS: swapRouter.address,
        NFT_DESCRIPTOR_ADDRESS: nftDescriptor.address,
        POSITION_DESCRIPTOR_ADDRESS: nonfungibleTokenPositionDescriptor.address,
        POSITION_MANAGER_ADDRESS: nonfungiblePositionManager.address,
        QUOTERV2_ADDRESS: quoterV2.address
    }
    
    // const data = addresses.join('\n');
    // const writeFile = promisify(fs.writeFile);
    // const filePath = '../.env';
    // return writeFile(filePath, data).then(() => {
    //     console.log('Addresses recorded.');
    // }).catch((error) => {
    //     console.error("Error logging addresses", error);
    //     throw error;
    // });
    return (addresses);
    
}


module.exports = {
    deployUniContracts
}