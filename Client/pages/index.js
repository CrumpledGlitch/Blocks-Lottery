import { useState, useEffect  } from 'react'
import Head from 'next/head'
import Web3 from 'web3'
import lotteryContract from '../lottery'
import styles from '../styles/Home.module.css'
import 'bulma/css/bulma.css'

export default function Home() {
  const [web3, setWeb3] = useState()
  const [address, setAddress] = useState()
  const [lcContract, setLcContract] = useState()
  const [lotteryPot, setLotteryPot] = useState()
  const [lotteryPlayers, setPlayers] = useState([])
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [lotteryHistory, setLotteryHistory] = useState([])
  const [lotteryId, setLotteryId] = useState()


  useEffect(() => {
    updateState()
  }, [lcContract])

  const updateState = () => {
    if (lcContract) getPot()
    if (lcContract) getPlayers()
    if (lcContract) getLotteryId()
  }

  const getHistory = async (id) => {
    setLotteryHistory([])
    for (let i = parseInt(id); i > 0; i--) {
      const winnerAddress = await lcContract.methods.History(i).call()
      const historyObj = {}
      historyObj.id = i
      historyObj.address = winnerAddress
      setLotteryHistory(lotteryHistory => [...lotteryHistory, historyObj])
    }
  }

  const getLotteryId = async () => {
    const lotteryId = await lcContract.methods.Id().call()
    setLotteryId(lotteryId)
    await getHistory(lotteryId)
  }

  const getPot = async() =>{
    const pot = await lcContract.methods.getBalance().call()
    setLotteryPot(web3.utils.fromWei(pot, 'ether'))
  }

  const getPlayers = async() =>{
    const players = await lcContract.methods.getContestants().call()
    setPlayers(players)
  }


  const enterLotteryHandler = async () =>{
    try {
      await lcContract.methods.enter().send({
        from : address,
        value: 10000000000000000,
        gas : null,
        gasPrice: null
      })
      updateState()

    }
    catch (err){
      setError(err)
    }


  }



  const pickWinnerHandler = async () => {
    setError('')
    setSuccessMsg('')
    try {
      await lcContract.methods.pickWinner().send({
        from: address,
        gas: 300000,
        gasPrice: null
      })
      console.log(`lottery id :: ${lotteryId}`)
      const winnerAddress = await lcContract.methods.History(lotteryId).call()
      setSuccessMsg(`The winner is ${winnerAddress}`)
      updateState()
    } catch(err) {
      setError(err.message)
    }
  }



  const connrectWalletHandler = async ()=>{
    setError('')
    setSuccessMsg('')
    /* check if MetaMask is installed */
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      try {
        /* request wallet connection */
        await window.ethereum.request({ method: "eth_requestAccounts"})
        /* create web3 instance & set to state */
        const web3 = new Web3(window.ethereum)
        /* set web3 instance in React state */
        setWeb3(web3)
        /* get list of accounts */
        const accounts = await web3.eth.getAccounts()
        /* set account 1 to React state */
        setAddress(accounts[0])

        /* create local contract copy */
        const lc = lotteryContract(web3)
        setLcContract(lc)

        window.ethereum.on('accountsChanged', async () => {
          const accounts = await web3.eth.getAccounts()
          console.log(accounts[0])
          /* set account 1 to React state */
          setAddress(accounts[0])
        })
      } catch(err) {
        setError(err.message)
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask")
    }

  }

  return (
    <div >
      <Head>
        <title>Blocks Lottery</title>
        <meta name="description" content="L2 Lottery dApp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <nav className='navbar mt-4 mb-4'>
          <div className='container'>
            <div className='navbar-brand'>
              <h1>Blocks Lottery</h1>
            </div>
            <div className='navbar-end'>
              <button onClick={connrectWalletHandler} className='button is-link'>Connect Wallet</button>
            </div>


          </div>
        </nav>
        <div className='container'>
          <section className='mt-5'>
            <div className='columns'>
            <div className='column is-two-thirds'>
              <section className='mt-5'>
                <p>Enter Lottery</p>
                <button onClick={enterLotteryHandler} className='button is-link is-large is-light mt-3'>Buy Ticket</button>
              </section>
              <section className='mt-6'>
                <p>Admin</p>
                <button onClick={pickWinnerHandler} className='button is-warning is-large is-light mt-3'>Pick winner</button>
              </section>
              <section>
                <div className='container has-text-danger mt-6'>
                  <p>{error}</p>
                </div>
              </section>
              <section>
                <div className='container has-text-success mt-6'>
                  <p>{successMsg}</p>
                </div>
              </section>
              </div>

              

            <div className={`${styles.lotteryinfo}column is-one-third`}>
              <section className='mt-5'>
              <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Lottery History</h2>
                        {
                          (lotteryHistory && lotteryHistory.length > 0) && lotteryHistory.map(item => {
                            if (lotteryId != item.id) {
                              return <div className="history-entry mt-3" key={item.id}>
                                <div>Lottery #{item.id} winner:</div>
                                <div>
                                  <a href={`https://etherscan.io/address/${item.address}`} target="_blank">
                                    {item.address}
                                  </a>
                                </div>
                              </div>
                            }
                          })
                        }
                      </div>
                    </div>
                  </div>
              </section>
              <section className='mt-5'>
              <div className='card'>
                <div className='card-content'>
                  <div className='content'>
                    <h2>Entries : {lotteryPlayers.length}</h2>
                    <ul>
                      {
                       (lotteryPlayers && lotteryPlayers.length > 0) && lotteryPlayers.map((player, index)=>{
                          return<li key={`${player}-${index}`} >
                            <a href={`https://therscan.io/address/${player}`} target="_blank">
                              {player}
                            </a>
                          </li>
                        })
                      }
                      
                    </ul>
                  </div>
                </div>
              </div>
              
              </section>
              <section className='mt-5'>
              <div className='card'>
                <div className='card-content'>
                  <div className='content'>
                    <h2> Pot </h2>
                    <p> {lotteryPot} ETH </p>
                  </div>
                </div>
              </div>
              
              </section>
            </div>
            </div>

          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2022 Blocks Lottery</p>
      </footer>
    </div>
  )
}
