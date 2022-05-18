import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import MarketPlace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
import { contractAddress } from '../config'
import { useRouter } from 'next/router'
import axios from 'axios'


export default function ResellMyNFT(){

    const router = useRouter()
    const [price, setPrice] = useState()
    const [url, setUrl] = useState()
    const { id, tokenURI } = router.query

    useEffect(() => {
        fetchTokenData()
    }, [id])

    async function fetchTokenData(){
        if(!id || !tokenURI) return;
        const metadata = (await axios.get(tokenURI)).data
        const {name, description, url} = metadata
        setUrl(url)
    }

    async function resellNft(){
        if(typeof window.ethereum != 'undefined'){
            if(!price) return;
            await window.ethereum.request({method: 'eth_requestAccounts'})
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, MarketPlace.abi, signer)

            try{
                const listingFee = await contract.getListingFee()
                const sellingPrice = ethers.utils.parseUnits(`${price}`, 'ether')
    
                const transaction = await contract.resellToken(id, sellingPrice, { value: listingFee })
                await transaction.wait()
    
                router.push('/')
            }catch(e){
                console.log(e.message)
            }
        }
    }
    return(
        <div className="flex justify-center">
        <div className="w-1/2 flex flex-col pb-12">
            <input
            placeholder="Asset Price in Eth"
            className="mt-2 border rounded p-4"
            onChange={e => setPrice( e.target.value )}
            />
            {
            url && (
                <img className="rounded mt-4" width="350" src={url} />
            )
            }
            <button onClick={resellNft} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                List NFT
            </button>
        </div>
        </div>
    )
}