import React, {useEffect, useState} from 'react'


export default function ListMyNFT(){

    async function resellNft(nft){
        if(typeof window.ethereum != 'undefined'){
            if(!price) return;
            await window.ethereum.request({method: 'eth_getAddresses'})
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, MarketPlace.abi, signer)

            const listingFee = await contract.getListingFee()
            const sellingPrice = ethers.utils.parseUnits(price.toString(), 'ether')

            const transaction = await contract.resellToken(nft.tokenId, sellingPrice, { value: listingFee })
            await transaction.wait()

            fetchMyNFT()
        }
    }
    return(
        <></>
    )
}