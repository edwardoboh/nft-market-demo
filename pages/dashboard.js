import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import MarketPlace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import { contractAddress } from '../config'
import axios from 'axios'

export default function Dashboard(){
    const [nft, setNft] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(()=>{
        setLoading(true)
        fetchMyListedNFT()
    }, [])

    async function fetchMyListedNFT(){
        if(typeof window.ethereum != 'undefined'){
            await window.ethereum.request({method: "eth_requestAccounts"})
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, MarketPlace.abi, signer)
            
            try{
                const listedMyItems = await contract.fetchListedItems()
                const myNFTs = await listedMyItems.map(async nft => {
                    const tokenURI = await contract.tokenURI(nft.tokenId)
                    const tokenMetaResponse = await axios.get(tokenURI)
                    const tokenMeta = tokenMetaResponse.data
                    console.log("META: ", tokenMeta)

                    const price = ethers.utils.formatUnits(nft.price, 'ether')
                    return {
                        tokenId: nft.tokenId,
                        name: tokenMeta.name,
                        description: tokenMeta.description,
                        url: tokenMeta.url,
                        price
                    }
                })

                const resolvedNFTs = await Promise.all(myNFTs)
                setNft(resolvedNFTs)
                setLoading(false)
            }catch(e){
                console.log(e.message)
                console.log(e.stack)
            }
        }
    }

    if(!loading && !nft.length) return (
        <div className='h-28 py-10'>
            <p className='text-center'>
                You haven't listed any NFTs for sale
            </p>
        </div>
    )

    return(
        <div className="flex justify-center">
        <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
                nft && nft.map((nft, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden">
                    <img src={nft.url} className="rounded" />
                    <div className="p-4 bg-black">
                    <p className="text-1xl text-white">{nft.name}</p>
                    <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                    <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => listNFT(nft)}>List</button>
                    </div>
                </div>
                ))
            }
            </div>
        </div>
        </div>
    )
}