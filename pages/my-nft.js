import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import MarketPlace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import { contractAddress } from '../config'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function MyNFT(){
    const [nft, setNft] = useState([])
    const [loading, setLoading] = useState(false)
    const [price, setPrice] = useState()
    
    const router = useRouter()

    useEffect(()=>{
        setLoading(true)
        fetchMyNFT()
    }, [])

    async function fetchMyNFT(){
        if(typeof window.ethereum != 'undefined'){
            await window.ethereum.request({method: 'eth_requestAccounts'})
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, MarketPlace.abi, signer)

            try{
                const myNFTs = await (await contract.fetchMyNFTs()).map(async nft => {
                    const tokenURI = await contract.tokenURI(nft.tokenId)
                    const tokenMeta = (await axios.get(tokenURI)).data
                    const price = ethers.utils.formatUnits(tokenMeta.price, 'ether')
                    return {
                        tokenId: nft.tokenId,
                        name: tokenMeta.name,
                        description: tokenMeta.description,
                        url: tokenMeta.url,
                        price
                    }
                })
    
                setNft(myNFTs)
                setLoading(false)
            }catch(e){
                console.log(e.message)
            }
        }
    }

    function listNFT(nft){
        router.push(`/list-nft?id=${nft.tokenId}&tokenURI=${nft.url}`)
    }

    if(!loading && !nft.length) return (
        <div className='h-28 py-10'>
            <p className='text-center'>
                You currently have no NFTs
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