const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("Lottry", function(){
  let lottery
  
  it ("Set up test conditions", async function (){
    const Lottery = await hre.ethers.getContractFactory("Lottery");
    lottery = await Lottery.deploy();
  
    await lottery.deployed();
    console.log("Lottry deployed to:", lottery.address);

  })
  it ("Enter Lottry", async function (){
    const entry = await lottery.enter( {
      value : ethers.utils.parseEther("600.386")
    })
    console.log("Tx hash for entry", entry.blockHash)
  })

  it ("Enter Lottry as address 2", async function (){
    let [address1, address2] = await ethers.getSigners();

    const entryDiffAddr = await lottery.connect(address2).enter( {
      value : ethers.utils.parseEther("2.50")
    })

    console.log("Tx hash for entry 2", entryDiffAddr.blockHash);
  })

  it("Check balance of lottery", async function(){
    //check balance of lottery
    const balance = await lottery.getBalance()
    console.log("balance is : ", balance)
    // this would be how to check if the balance is correct and cause the test to fail if it wasn't
    //expect(balance).to.equal(ethers.utils.parseEther("0.1"));
  })


  it ("Test random", async function (){
    //test random
    const getRandom = await lottery.random()
    console.log("Testing Random : ", getRandom)


  })

  it ("List people in the draw", async function(){
    //get contestants 
    const conts = await lottery.getContestants()
    console.log (conts)
  })

  // it("pick a winner", async function(){
  //   const winner = await lottery.pickWinner()
  //   console.log("the winner is :", winner)
  // })



  it("pick a winner", async function () {
    const winner = await lottery.pickWinner();
    console.log("the winner is :", winner);
    let [address1, address2] = await ethers.getSigners();
    const balance1 = await ethers.provider.getBalance(address1.address);
    const balance2 = await ethers.provider.getBalance(address2.address);

    console.log(`Balance of address1 is ${balance1}`);
    console.log(`Balance of address2 is ${balance2}`);
  });



  // it ("checks history of winner", async function(){
  //   const hist = await lottery.History(1)
  //   console.log(hist)
  // })

})