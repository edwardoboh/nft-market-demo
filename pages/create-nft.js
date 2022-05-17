import React, {useEffect, useState} from 'react'
import { useRouter } from 'next/router'
import {create as ipfsClient} from 'ipfs-http-client'
import { ethers } from 'ethers'
import {ipfsInfuraId, ipfsInfuraSecret, contractAddress} from '../config'
import MarketPlace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

const auth = `Basic ${Buffer.from(ipfsInfuraId + ':' + ipfsInfuraSecret).toString('base64')}`
const client = ipfsClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
})

export default function CreateNFT(){

    const [formData, setFormData] = useState({
        price: null, name: null, description: null,
    })
    const [assetURI, setAssetURI] = useState()
    const [file, setFile] = useState()

    const router = useRouter()

    function updateState(e){
        setFormData({...formData, [e.target.name]: e.target.value})
    }

    async function uploadToIPFS(){
        const {name, description} = formData
        if(!file || !name || !description) return;

        // First upload image to IPFS
        const newUpload = await client.add(
            file,
            {
                progress: (prog) => {console.log("Received: ", prog)}
            }
        )
        const returnURL = `https://ipfs.infura.io/ipfs/${newUpload.path}`
        setAssetURI(returnURL)

        // Now upload image meta data to IPFS
        const metadata = JSON.stringify({
            name,
            description,
            url: returnURL
        })
        const completeURI = await client.add(metadata)
        console.log("Asset URI: ", completeURI);

        // Now call smart contract and perform action
        await createNewNFT(completeURI)
    }


    async function createNewNFT(completeAssetURI){
        await window.ethereum.request({method: 'eth_getAccounts'})
        if(typeof window.ethereum != 'undefined'){
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, MarketPlace, signer)
            const listingFee = await contract.getListingFee()
            const assetPrice = ethers.utils.parseUnits(formData.price.toString(), 'ether')

            const transaction = await contract.createToken(completeAssetURI, assetPrice, { value: listingFee })
            await transaction.wait()
            router.push('/my-nft')
        }
    }

    return (
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <input
                    placeholder='Asset Name'
                    className="mt-8 border rounded p-4"
                    name='name'
                    onChange={updateState}
                />
                <textarea
                    placeholder='Asset Description'
                    className="mt-2 border rounded p-4"
                    name='description'
                    onChange={updateState}
                />
                <input
                    placeholder='Asset Price in ETH'
                    className="mt-2 border rounded p-4"
                    type='number'
                    defaultValue={1}
                    onChange={updateState}
                />
                <input
                    type="file"
                    className="my-4"
                    name='Asset'
                    onChange={(e) => setFile(e.target.files[0])}
                />
                <input
                    type='submit'
                    className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
                    value="Mint NFT"
                    onClick={uploadToIPFS}
                />
            </div>
            {
                assetURI && 
                <img className="rounded mt-4" width="350"  src={assetURI}/>
            }
        </div>
    )
}