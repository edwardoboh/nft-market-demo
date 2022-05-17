// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
const fs = require('fs')
const path = require('path')

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  // const Greeter = await hre.ethers.getContractFactory("Greeter");
  // const greeter = await Greeter.deploy("Hello, Hardhat!");

  // await greeter.deployed();

  // console.log("Greeter deployed to:", greeter.address);

  const MarketPlace = await ethers.getContractFactory("NFTMarketplace")
  const contract = await MarketPlace.deploy("Gbenga NFT Tokens", "GTK")
  await contract.deployed()

  console.log("Marketplace Contract has been deployed to: \n", contract.address)
  fs.writeFileSync(path.resolve(__dirname, '../config.js'), `
      module.exports = {
        contractAddress: "${contract.address}",
        ipfsInfuraId: "29FLjpPP09BaPOk3eefbPjEin04",
        ipfsInfuraSecret: "a12fddffca353429eb0375157d997c50",
      }
  `)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
