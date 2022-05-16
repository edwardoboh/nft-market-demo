// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("Greeter", function () {
//   it("Should return the new greeting once it's changed", async function () {
//     const Greeter = await ethers.getContractFactory("Greeter");
//     const greeter = await Greeter.deploy("Hello, world!");
//     await greeter.deployed();

//     expect(await greeter.greet()).to.equal("Hello, world!");

//     const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

//     // wait until the transaction is mined
//     await setGreetingTx.wait();

//     expect(await greeter.greet()).to.equal("Hola, mundo!");
//   });
// });


const { expect } = require('chai');
const { ethers } = require('hardhat')

describe("NFT MarketPlace Contract", function(){
  it("Should Mint, List & Sell Tokens", async function(){
    
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    const marketPlace = await NFTMarketplace.deploy("Gbenja NFT Project", "GTK");
    await marketPlace.deployed()

    const [ownerAddress, buyerAddress, _, addressWithSigner] = await ethers.getSigners()
    let tokenId_1, tokenId_2;

    describe("Contract Functions run Accurately", function(){
      it("Should ensure original listing price on deploy is accurate", async function(){
        const listingPrice = ethers.utils.parseUnits('0.025', 'ether');
        const listingValue = await marketPlace.getListingFee()
        expect(listingPrice).to.equal(listingValue);
      });

      it("Should ensure we can successfully update the listing price", async function(){
        const listingPrice = ethers.utils.parseUnits('0.5', 'ether');
        await marketPlace
        // .connect(ownerAddress)
        .setListingFee(listingPrice)
        
        const listingValue = await marketPlace.getListingFee()
        expect(listingPrice).to.equal(listingValue);
      })

      it("Should be able to mint two new tokens", async function(){
        const listingPrice = ethers.utils.parseUnits('0.5', 'ether');
        const auctionPrice = ethers.utils.parseUnits("2", "ether");
        
        const mintTransaction1 = await marketPlace
        .connect(addressWithSigner)
        .createToken("https://edwardoboh.netlify.app/img/edward.jpeg", auctionPrice, { value: listingPrice })
        tokenId_1 = await mintTransaction1.wait()

        const mintTransaction2 = await marketPlace
        .connect(addressWithSigner)
        .createToken("https://edwardoboh.netlify.app/image/edward3.jpeg", auctionPrice, { value: listingPrice })
        tokenId_2 = await mintTransaction2.wait()
      })

      it("Should successfully purchase a Token", async function(){
        const auctionPrice = ethers.utils.parseUnits("2", "ether");
        const saleTransaction = await marketPlace
        .connect(buyerAddress)
        .createMarketSale(1, { value: auctionPrice })
        await saleTransaction.wait()
      })

      it("Should successfully resell puchased Token", async function(){
        const auctionPrice = ethers.utils.parseUnits("3", "ether");
        const listingPrice = ethers.utils.parseUnits('0.5', 'ether');
        const resellTransaction = await marketPlace
        .connect(buyerAddress)
        .resellToken(1, auctionPrice, { value: listingPrice })
        await resellTransaction.wait()
      })

      it("Should be able to list out all listed Tokens", async function(){
        const allTokens = await marketPlace
        .fetchMarketItems()
        expect(allTokens.length).to.equal(2);
      })
    })

  })
})