import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import axios from 'axios'

import {useState, useEffect} from 'react'
import {ethers} from 'ethers'
import Web3modal from 'web3modal'
import MarketPlace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

import { contractAddress } from '../config'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(false)


  useEffect(()=>{
    setLoading(true)
    loadNFT()
  }, [])
  

  async function getAddresses(){
    await window.ethereum.request({ method: 'eth_requestAccounts' })
  }

  async function loadNFT(){
    console.log(contractAddress)
    await getAddresses()
    if(typeof window.ethereum == 'undefined') return;
    const provider = new ethers.providers.JsonRpcProvider()
    const contract = new ethers.Contract(contractAddress, MarketPlace.abi, provider)

    try{
    const listings = await contract.fetchMarketItems()
    const allTokens = await listings.map(async token => {
      const tokenURI = await contract.tokenURI(token.tokenId)
      const price = ethers.utils.formatUnits(token.price, "ether")
      const metadata = await axios.get(tokenURI)
      const {name, desription, image} = metadata.data 
      return {
        tokenURI,
        owner: token.owner,
        seller: token.seller,
        sold: token.sold,
        price, name, desription, image,
      }
    });
    
    console.log(allTokens)
    setNfts(allTokens);
    setLoading(false);
    }catch(e){
      console.log(e.message)
    }
  }

  async function buyNFT(nft){
    await getAddresses()
    if(typeof window.ethereum == 'undefined') return;
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, MarketPlace.abi, signer);

    const amount = ethers.utils.parseUnits(nft.price, "ether")

    try{
      const transaction = await contract.createMarketSale(nft.tokenId, { value: amount })
      await transaction.wait()
      await loadNFT()
    }catch(e){
      console.log(e.message)
    }
  }

  if(!loading && !nfts.length){
    return (
      <div className='h-28 py-10'>
        <p className='text-center'>
          There are presently no NFTs for Sale
        </p>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts && nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} />
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">{nft.price} ETH</p>
                  <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNFT(nft)}>Buy</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}







/*
<div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.js</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
*/